import CheckoutPage from './Checkout.vue';
import { useOrderCreation } from '@vue-storefront/core/modules/checkout/composables/use-order-creation';
import { useStore } from '@vue-storefront/core/application-services';
import CoreCheckout from '@vue-storefront/core/pages/Checkout';
import Vue from 'vue';

jest.mock('@vue-storefront/core/application-services', () => ({ useStore: jest.fn() }));
jest.mock('@vue-storefront/core/app', () => ({ router: {} }));
jest.mock('@vue-storefront/i18n', () => ({ __esModule: true, default: {} }));
jest.mock('vue-offline/mixin', () => ({ __esModule: true, default: {} }));
jest.mock('@vue-storefront/core/lib/storage-manager', () => ({ StorageManager: {} }));
jest.mock('@vue-storefront/core/mixins/composite', () => ({ __esModule: true, default: {} }));
jest.mock('@vue-storefront/core/helpers', () => ({ isServer: false }));
jest.mock('@vue-storefront/core/request-services', () => ({ setServerRedirect: jest.fn() }));
jest.mock('@vue-storefront/core/lib/logger', () => ({ Logger: {} }));
jest.mock('@storefront-ui/vue', () => ({ SfSteps: {} }));
jest.mock('@vue-storefront/core/filters', () => ({ htmlDecode: jest.fn() }));
jest.mock('@vue-storefront/core/lib/multistore', () => ({ currentStoreView: jest.fn() }));
jest.mock('@vue-storefront/core/compatibility/plugins/event-bus', () => ({ __esModule: true, default: {} }));
jest.mock('@vue-storefront/core/modules/checkout', () => ({}));
jest.mock('@vue-storefront/core/lib/modules', () => ({ registerModule: jest.fn() }));
jest.mock('src/modules/payment-braintree', () => ({}));
jest.mock('src/modules/shared', () => ({}));
jest.mock('src/modules/checkout-marketing-consent', () => ({
  ...jest.requireActual('src/modules/checkout-marketing-consent/helpers'),
  SELECTION_GETTER: 'checkoutMarketingConsent/GET_SELECTION'
}));
jest.mock('theme/components/organisms/o-billing-address', () => ({}));
jest.mock('theme/components/organisms/o-shipping', () => ({}));
jest.mock('theme/components/organisms/o-confirm-order', () => ({}));
jest.mock('theme/components/organisms/o-order-review', () => ({}));
jest.mock('theme/components/organisms/o-order-summary', () => ({}));
jest.mock('theme/components/organisms/o-order-success', () => ({}));
jest.mock('theme/components/organisms/o-personal-details', () => ({}));
jest.mock('theme/components/organisms/o-cart-items-table', () => ({}));
jest.mock('src/modules/promotion-platform/components/ProductionSpotCountdown.vue', () => ({}));
jest.mock('theme/store/ui/modals', () => ({}));

describe('checkout order consent boundary', () => {
  it('adds consent only to regular checkout preparation', () => {
    const mergedMethods = Vue.extend(CheckoutPage as any).options.methods;

    expect(mergedMethods?.prepareOrder).toBe((CheckoutPage as any).methods.prepareOrder);
    expect(mergedMethods?.placeOrder).toBe(CoreCheckout.methods.placeOrder);

    const selection = {
      email: 'a@example.com',
      emailConsent: true,
      smsConsent: false,
      phone: ''
    };
    const personalDetails = { emailAddress: selection.email };
    const store = {
      state: {
        user: { current: null },
        cart: {
          platformTotals: {},
          cartItems: [],
          cartServerToken: ''
        }
      },
      getters: {
        'checkoutMarketingConsent/GET_SELECTION': selection,
        'backend-settings/getSettingByCompositeKey': () => ({ emailConsentLabel: 'Email' }),
        'checkout/getPaymentDetails': {},
        'checkout/getShippingDetails': {},
        'checkout/getPersonalDetails': personalDetails,
        'cart/isVirtualCart': true
      },
      dispatch: jest.fn()
    };

    (useStore as jest.Mock).mockReturnValue(store);

    const context: any = {
      $store: store,
      payment: {},
      shipping: {},
      personalDetails,
      isVirtualCart: true,
      platformTotals: {},
      getPaymentMethod: () => 'example',
      checkConnection: jest.fn(),
      checkStocks: () => true
    };

    context.prepareOrder = (CheckoutPage as any).methods.prepareOrder.bind(context);
    CoreCheckout.methods.placeOrder.call(context);

    expect(store.dispatch).toHaveBeenCalledWith('checkout/placeOrder', expect.objectContaining({
      order: expect.objectContaining({
        addressInformation: expect.objectContaining({
          paymentExtraFields: { budsies_marketing_consent: { email: true } }
        })
      })
    }));

    const express = useOrderCreation().prepareOrderData({});

    expect(express.addressInformation).not.toHaveProperty('paymentExtraFields');
  });
});
