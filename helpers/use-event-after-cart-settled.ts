import { onBeforeUnmount, onMounted } from 'vue';
import { useStore } from '@vue-storefront/core/application-services';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import CartEvents from 'src/modules/shared/types/cart-events';

export function useEventAfterCartSettled (): void {
  const store = useStore();
  let active = false;
  onMounted(async () => {
    active = true;
    await store.dispatch('cart/waitForStartup');
    if (!active) return;
    await store.dispatch('cart/waitForIdle');
    if (!active) return;

    EventBus.$emit(CartEvents.CART_VIEWED, {
      products: store.getters['cart/getCartItems'],
      platformTotals: store.getters['cart/getLastTotalsSyncDate'] ? store.state.cart.platformTotals : null
    });
  });

  onBeforeUnmount(() => {
    active = false;
  });
}
