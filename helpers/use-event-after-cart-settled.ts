import { onBeforeUnmount, onMounted, watch } from 'vue';
import { useStore } from '@vue-storefront/core/application-services';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import CartEvents from 'src/modules/shared/types/cart-events';

export function useEventAfterCartSettled (checkout = false, eligible: () => boolean = () => true): void {
  const store = useStore();
  let active = false;
  let stopWatching: (() => void) | undefined;
  let releaseWait: (() => void) | undefined;

  const isBusy = () => store.getters['cart/getIsAdding'] || store.getters['cart/IS_CART_SYNCING'] ||
    store.getters['cart/IS_TOTALS_SYNCING'] || store.getters['cart/IS_COUPON_PROCESSING'];

  async function waitForWork (): Promise<void> {
    do {
      await store.dispatch('cart/waitForConnections');
      if (!active) return;
      if (isBusy()) {
        await new Promise<void>(resolve => {
          releaseWait = resolve;
          stopWatching = watch(isBusy, busy => {
            if (!busy) {
              stopWatching?.();
              stopWatching = undefined;
              releaseWait = undefined;
              resolve();
            }
          });
        });
      }
    } while (active && (isBusy() || store.state.cart.connectionPromises.length));
  }

  onMounted(async () => {
    active = true;
    await store.dispatch('cart/waitForStartup');
    if (!active) return;
    if (checkout) {
      try { await store.state.checkout.entryPromise; } catch { /* Settlement is sufficient. */ }
    }
    if (!active) return;
    await waitForWork();
    if (!active || !eligible()) return;

    const items = store.getters['cart/getCartItems'];
    if (items.length && !store.getters['cart/getLastTotalsSyncDate'] && store.getters['cart/canSyncTotals'] &&
      !(checkout && store.state.checkout.entryRefreshAttempted)) {
      try { await store.dispatch('cart/syncTotals', { forceServerSync: true }); } catch { /* Use local data. */ }
      if (!active) return;
      await waitForWork();
    }
    if (!active || !eligible()) return;

    const products = store.getters['cart/getCartItems'];
    if (checkout) {
      if (products.length) EventBus.$emit(CartEvents.BEGIN_CHECKOUT);
    } else {
      EventBus.$emit(CartEvents.CART_VIEWED, {
        products,
        platformTotals: store.getters['cart/getLastTotalsSyncDate'] ? store.state.cart.platformTotals : null
      });
    }
  });

  onBeforeUnmount(() => {
    active = false;
    stopWatching?.();
    releaseWait?.();
  });
}
