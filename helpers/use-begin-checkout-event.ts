import { watch } from 'vue';
import { useStore } from '@vue-storefront/core/application-services';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import CartEvents from 'src/modules/shared/types/cart-events';

import { useCartTotalsReadiness } from './use-cart-totals-readiness';

export function useBeginCheckoutEvent (): void {
  const store = useStore();
  const isReady = useCartTotalsReadiness();
  let hasReportedCheckout = false;

  watch(isReady, (ready) => {
    if (!ready || hasReportedCheckout || !store.getters['cart/getCartItems'].length) {
      return;
    }

    hasReportedCheckout = true;
    EventBus.$emit(CartEvents.BEGIN_CHECKOUT);
  });
}
