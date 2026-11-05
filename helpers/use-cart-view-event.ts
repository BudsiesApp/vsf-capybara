import { computed, onMounted, ref, watch } from 'vue';
import { useStore } from '@vue-storefront/core/application-services';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { IS_CART_SYNCING, IS_COUPON_PROCESSING, IS_TOTALS_SYNCING } from '@vue-storefront/core/modules/cart';
import CartEvents from 'src/modules/shared/types/cart-events';

export function useCartViewEvent (): void {
  const store = useStore();
  const isMounted = ref(false);
  let hasReportedView = false;

  const isReady = computed(() => {
    if (!isMounted.value || !store.state.cart.cartIsLoaded ||
      store.getters[IS_CART_SYNCING] || store.getters[IS_TOTALS_SYNCING] ||
      store.getters[IS_COUPON_PROCESSING]) {
      return false;
    }

    if (!store.getters['cart/isTotalsSyncEnabled'] || store.getters['cart/isCartEmpty']) {
      return true;
    }

    return store.getters['cart/getLastTotalsSyncDate'] > 0 &&
      !store.getters['cart/isTotalsSyncRequired'];
  });

  onMounted(() => {
    isMounted.value = true;
  });

  watch(isReady, (ready) => {
    if (!ready || hasReportedView) {
      return;
    }

    hasReportedView = true;
    EventBus.$emit(CartEvents.CART_VIEWED, {
      products: store.getters['cart/getCartItems'],
      platformTotals: store.state.cart.platformTotals
    });
  });
}
