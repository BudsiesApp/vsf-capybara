import { watch } from 'vue';
import { useStore } from '@vue-storefront/core/application-services';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import CartEvents from 'src/modules/shared/types/cart-events';

import { useCartTotalsReadiness } from './use-cart-totals-readiness';

export function useCartViewEvent (): void {
  const store = useStore();
  const isReady = useCartTotalsReadiness();
  let hasReportedView = false;

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
