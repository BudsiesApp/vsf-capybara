import { computed, ComputedRef, onMounted, ref } from 'vue';
import { useStore } from '@vue-storefront/core/application-services';
import { IS_CART_SYNCING, IS_COUPON_PROCESSING, IS_TOTALS_SYNCING } from '@vue-storefront/core/modules/cart';

export function useCartTotalsReadiness (): ComputedRef<boolean> {
  const store = useStore();
  const isMounted = ref(false);

  onMounted(() => {
    isMounted.value = true;
  });

  return computed(() => {
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
}
