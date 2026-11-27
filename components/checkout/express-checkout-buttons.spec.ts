import Vue from 'vue';
import Vuex from 'vuex';
import { shallowMount } from '@vue/test-utils';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { useStore } from '@vue-storefront/core/application-services';
import CartEvents from 'src/modules/shared/types/cart-events';
import ExpressCheckoutButtons from './express-checkout-buttons.vue';

jest.mock('@vue-storefront/core/application-services', () => ({
  useStore: jest.fn(), useRouter: () => ({}), useI18n: () => ({ t: (key: string) => key })
}));
jest.mock('@vue-storefront/i18n', () => ({ __esModule: true, default: { t: (key: string) => key } }));
jest.mock('@vue-storefront/core/modules/checkout', () => ({
  ...jest.requireActual('@vue-storefront/core/modules/checkout/composables/use-order-creation')
}));
jest.mock('@vue-storefront/core/lib/modules', () => ({ registerModule: jest.fn() }));
jest.mock('@vue-storefront/core/lib/multistore', () => ({}));
jest.mock('@vue-storefront/core/lib/logger', () => ({}));
jest.mock('@vue-storefront/core/modules/order', () => ({ OrderModule: {} }));
jest.mock('@vue-storefront/core/modules/cart', () => ({}));
jest.mock('@storefront-ui/vue', () => ({ SfButton: {} }));
jest.mock('src/modules/address', () => ({ useAddressValidation: () => ({}) }));
jest.mock('src/modules/persisted-customer-data', () => ({}));
jest.mock('src/modules/payment-braintree', () => ({
  PaymentPayPal: { name: 'PaymentPayPal', render: (h) => h('div') },
  supportedMethodsCodes: { PAY_PAL: 'paypal' },
  SET_PAYMENT_METHOD_NONCE_MUTATION: 'clear-nonce'
}));
jest.mock('src/modules/vsf-amazon-pay', () => ({
  PaymentAmazonPay: { name: 'PaymentAmazonPay', render: (h) => h('div') },
  SupportedMethodCodes: { AMAZON_PAY: 'amazon' },
  CLEAR_AMAZON_SESSION_ID_MUTATION: 'clear-session', AMAZON_SESSION_ID_GETTER: 'amazon/session'
}));
jest.mock('src/modules/shared', () => ({
  CartEvents: jest.requireActual('src/modules/shared/types/cart-events').default,
  PaymentType: { EXPRESS_CHECKOUT: 'express' },
  PAYMENT_ERROR_EVENT: 'payment_error_event',
  createPhoneHelpers: () => ({}),
  useExpressCheckoutTotals: () => ({})
}));

Vue.use(Vuex);

it.each([['paypal', 'clear-nonce', 'payment_method_nonce'], ['amazon', 'clear-session', 'amazon_session_id']])(
  'requires current totals for %s before showing payment buttons and before consuming payment data',
  async (paymentMethod, clearPayment, paymentField) => {
    const placeOrder = jest.fn();
    const clearNonce = jest.fn();
    const clearSession = jest.fn();
    const notify = jest.fn();
    const store = new Vuex.Store({
      state: { user: { current: null }, cart: { cartItems: [], cartServerToken: 'quote', platformTotals: null, ready: true } },
      getters: {
        'cart/getPaymentTotals': state => state.cart.platformTotals,
        'cart/canStartExpressCheckout': state => state.cart.ready,
        'cart/isVirtualCart': () => true,
        'checkout/getPersonalDetails': () => ({}),
        'checkout/getShippingDetails': () => ({}),
        'checkout/getPaymentDetails': () => ({ paymentMethod }),
        'checkout/getPaymentMethods': () => [{ code: paymentMethod }],
        'braintree/braintreeClient': () => ({}),
        'braintree/paymentMethodNonce': () => 'payment-data',
        'amazon/session': () => 'payment-data'
      },
      mutations: { 'clear-nonce': clearNonce, 'clear-session': clearSession },
      actions: {
        'braintree/createBraintreeClient': () => {},
        'checkout/placeOrder': placeOrder,
        'notification/spawnNotification': notify
      }
    });
    jest.mocked(useStore).mockReturnValue(store as any);
    const onBegin = jest.fn();
    EventBus.$on(CartEvents.BEGIN_CHECKOUT, onBegin);
    const wrapper = shallowMount(ExpressCheckoutButtons, { provide: { WindowObject: window } });
    const vm = wrapper.vm as any;

    expect(wrapper.find('._buttons').isVisible()).toBe(false);
    const totals = { base_grand_total: 0, quote_currency_code: 'USD' };
    store.state.cart.platformTotals = totals;
    await Vue.nextTick();
    expect(wrapper.find('._buttons').isVisible()).toBe(true);
    expect(wrapper.find('._buttons').attributes('inert')).toBeUndefined();
    store.state.cart.ready = false;
    await Vue.nextTick();
    expect(wrapper.find('._buttons').isVisible()).toBe(true);
    expect(wrapper.find('._buttons').attributes('inert')).toBeDefined();
    expect(wrapper.find('._buttons').attributes('aria-disabled')).toBe('true');
    expect(onBegin).not.toHaveBeenCalled();
    store.state.cart.ready = true;
    await Vue.nextTick();
    expect(wrapper.find('._buttons').attributes('inert')).toBeUndefined();
    expect(onBegin).not.toHaveBeenCalled();
    vm.onPaymentStarted();
    expect(onBegin).toHaveBeenCalledWith(true);

    store.state.cart.platformTotals = null;
    await vm.onPaymentSuccess();
    expect(notify).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ type: 'warning' }));
    expect(placeOrder).not.toHaveBeenCalled();
    expect(clearNonce).not.toHaveBeenCalled();
    expect(clearSession).not.toHaveBeenCalled();

    store.state.cart.platformTotals = totals;
    await vm.onPaymentSuccess();
    expect(clearPayment === 'clear-nonce' ? clearNonce : clearSession).toHaveBeenCalledTimes(1);
    expect(placeOrder).toHaveBeenCalledWith(expect.anything(), { order: expect.objectContaining({
      addressInformation: expect.objectContaining({ payment_method_additional: { [paymentField]: 'payment-data' } }),
      paymentDetails: expect.objectContaining({ base_grand_total: 0, order_currency_code: 'USD' })
    }) });

    wrapper.destroy();
    EventBus.$off(CartEvents.BEGIN_CHECKOUT, onBegin);
  }
);
