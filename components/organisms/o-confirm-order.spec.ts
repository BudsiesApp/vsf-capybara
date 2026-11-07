import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { mount, Wrapper } from '@vue/test-utils';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';

import OConfirmOrder from './o-confirm-order.vue';

jest.mock('@vue-storefront/core/compatibility/plugins/event-bus', () => ({
  __esModule: true,
  default: {
    $emit: jest.fn(),
    $off: jest.fn(),
    $on: jest.fn()
  }
}));
jest.mock('@vue-storefront/core/lib/logger', () => ({
  Logger: { error: jest.fn(() => jest.fn()) }
}));
jest.mock('@vue-storefront/i18n', () => ({
  __esModule: true,
  default: { t: (key: string) => key }
}));
jest.mock('@vue-storefront/core/lib/modules', () => ({ registerModule: jest.fn() }));
jest.mock('@vue-storefront/core/modules/order', () => ({
  OrderModule: {},
  ORDER_CONFLICT_EVENT: 'order-conflict'
}));
jest.mock('@vue-storefront/core/modules/checkout', () => ({ ORDER_ERROR_EVENT: 'order-error' }));
jest.mock('@vue-storefront/core/modules/checkout/components/Payment', () => ({
  Payment: {
    data () {
      return { payment: this.$store.getters['checkout/getPaymentDetails'] };
    },
    methods: { changePaymentMethod: jest.fn() }
  }
}));
jest.mock('@vue-storefront/core/modules/cart', () => ({
  IS_COUPON_PROCESSING: 'cart/isCouponProcessing',
  IS_TOTALS_SYNCING: 'cart/isTotalsSyncing',
  IS_PAYMENT_METHODS_SYNCING: 'cart/isPaymentMethodsSyncing',
  IS_SHIPPING_METHODS_SYNCING: 'cart/isShippingMethodsSyncing',
  IS_SHIPPING_METHODS_SYNCING_ERROR: 'cart/isShippingMethodsSyncingError',
  CART_ITEM_LOCALIZED_PRICE_DICTIONARY: 'cart/localizedPriceDictionary'
}));
jest.mock('@vue-storefront/core/modules/cart/helpers', () => ({ getThumbnailForProduct: () => '' }));
jest.mock('@vue-storefront/core/modules/cart/helpers/get-cart-item-key.function', () => ({
  __esModule: true,
  default: (cartItem: { sku: string }) => cartItem.sku
}));
jest.mock('@vue-storefront/core/additional-content', () => ({
  AdditionalContentOutlet: { PRIVACY_POLICY_LINKS: 'privacy-policy-links' },
  useAdditionalContent: () => []
}));
jest.mock('@storefront-ui/vue/src/utilities/mobile-observer', () => ({ mapMobileObserver: () => ({}) }));
jest.mock('@storefront-ui/vue', () => {
  const renderSlot = (tag: string) => ({
    render (h) {
      return h(tag, this.$slots.default);
    }
  });

  return {
    SfRadio: renderSlot('label'),
    SfIcon: renderSlot('i'),
    SfImage: renderSlot('img'),
    SfPrice: renderSlot('span'),
    SfTable: renderSlot('table'),
    SfAccordion: renderSlot('div'),
    SfCollectedProduct: renderSlot('div'),
    SfButton: {
      props: ['disabled'],
      render (h) {
        return h('button', { attrs: { disabled: this.disabled }, on: this.$listeners }, this.$slots.default);
      }
    },
    SfHeading: {
      props: ['title'],
      render (h) {
        return h('h3', this.title);
      }
    }
  };
});
jest.mock('src/modules/customization-system', () => ({
  CartItemConfiguration: { render: (h) => h('div') },
  getCustomizationSystemThumbnail: () => ''
}));
jest.mock('src/modules/currency', () => ({ GET_ACTIVE_CURRENCY: 'currency/activeCurrency' }));
jest.mock('src/modules/payment-affirm/types/AffirmCheckoutEvents', () => ({ AFFIRM_MODAL_CLOSED: 'affirm-modal-closed' }));
jest.mock('src/modules/payment-braintree', () => ({
  PaymentPayPal: {
    name: 'PaymentPayPal',
    props: ['isOrderPlacementDisabled'],
    render: (h) => h('div', { class: 'payment-pay-pal-stub' })
  },
  getComponentByMethodCode: () => undefined,
  supportedMethodsCodes: {
    PAY_PAL: 'braintree_paypal',
    PAY_PAL_PAY_LATER: 'braintree_paypal_pay_later'
  }
}));
jest.mock('src/modules/shared', () => ({
  PAYMENT_ERROR_EVENT: 'payment-error',
  PriceHelper: { formatPrice: (price: number, symbol: string) => `${symbol}${price}` }
}));
jest.mock('src/modules/vsf-amazon-pay', () => ({ SupportedMethodCodes: { AMAZON_PAY: 'amazon_payment_v2' } }));
jest.mock('theme/helpers', () => ({ createSmoothscroll: jest.fn() }));
jest.mock('theme/helpers/get-cart-item-options.function', () => ({ getCartItemOptions: () => [] }));
jest.mock('theme/helpers/get-cart-item-title.function', () => ({ getCartItemTitle: () => 'Custom Plush' }));
jest.mock('theme/components/atoms/a-promo-code', () => ({ render: (h) => h('div') }));
jest.mock('theme/components/molecules/m-price-summary', () => ({ render: (h) => h('div') }));
jest.mock('theme/components/organisms/o-cart-items-table', () => ({ render: (h) => h('div') }));
Vue.use(Vuex);
Vue.filter('htmlDecode', (value: string) => value);
Element.prototype.scrollIntoView = jest.fn();

const flatRate = {
  carrier_code: 'flatrate',
  method_code: 'flatrate',
  carrier_title: 'Flat Rate',
  method_title: 'Fixed',
  amount: 10
};

const physicalItem = { sku: 'plush', qty: 1, extension_attributes: {} };
const virtualItem = { sku: 'gift-card', qty: 1, extension_attributes: { is_virtual_item: true } };

const unavailableShippingMessage = 'The selected shipping method is no longer available. Please review your shipping details.';

function createStore ({ paymentMethod = 'checkmo', cartItems = [physicalItem] } = {}): Store<any> {
  return new Vuex.Store({
    state: {
      cart: {
        cartItems,
        isCouponProcessing: false,
        isTotalsSyncing: false,
        isPaymentMethodsSyncing: false,
        isShippingMethodsSyncing: false,
        isShippingMethodsSyncingError: false
      },
      checkout: {
        shippingDetails: {
          streetAddress: '1 Main St',
          city: 'New York',
          country: 'US',
          zipCode: '10001',
          shippingCarrier: flatRate.carrier_code,
          shippingMethod: flatRate.method_code
        },
        shippingMethods: [flatRate],
        paymentDetails: { paymentMethod },
        paymentMethods: [
          { code: 'checkmo', title: 'Check' },
          { code: 'braintree_paypal', title: 'PayPal' }
        ]
      }
    },
    getters: {
      'cart/getCartItems': (state) => state.cart.cartItems,
      'cart/isVirtualCart': (state) => state.cart.cartItems.every((item) => item.extension_attributes.is_virtual_item),
      'cart/isCouponProcessing': (state) => state.cart.isCouponProcessing,
      'cart/isTotalsSyncing': (state) => state.cart.isTotalsSyncing,
      'cart/isPaymentMethodsSyncing': (state) => state.cart.isPaymentMethodsSyncing,
      'cart/isShippingMethodsSyncing': (state) => state.cart.isShippingMethodsSyncing,
      'cart/isShippingMethodsSyncingError': (state) => state.cart.isShippingMethodsSyncingError,
      'cart/localizedPriceDictionary': (state) => state.cart.cartItems.reduce((dictionary, item) => {
        dictionary[item.sku] = { regular: 10, special: 0 };
        return dictionary;
      }, {}),
      'checkout/getShippingDetails': (state) => state.checkout.shippingDetails,
      'checkout/getShippingMethods': (state) => state.checkout.shippingMethods,
      'checkout/getPaymentDetails': (state) => state.checkout.paymentDetails,
      'checkout/getPaymentMethods': (state) => state.checkout.paymentMethods,
      'checkout/getPersonalDetails': () => ({ firstName: 'John', lastName: 'Smith', createAccount: false }),
      'giftCard/isGiftCardProcessing': () => false,
      'currency/activeCurrency': () => ({ symbol: '$' })
    },
    actions: {
      'braintree/createBraintreeClient': () => ({})
    }
  });
}

function mountConfirmOrder (store: Store<any>): Wrapper<any> {
  return mount(OConfirmOrder, {
    store,
    propsData: { isActive: true },
    provide: { ImageHandlerService: {} },
    stubs: { SfAccordionItem: true },
    mocks: { $t: (key: string) => key }
  });
}

function findPlaceOrderButton (wrapper: Wrapper<any>): Wrapper<any> {
  return wrapper.findAll('button').filter((button) => button.text() === 'Place the order').at(0);
}

function hasPlacedOrder (): boolean {
  return (EventBus.$emit as jest.Mock).mock.calls.some(([eventName]) => eventName === 'checkout-before-placeOrder');
}

async function failShippingLookup (store: Store<any>, { isError }: { isError: boolean }): Promise<void> {
  store.state.cart.isCouponProcessing = true;
  store.state.cart.isShippingMethodsSyncing = true;
  await Vue.nextTick();

  store.state.cart.isShippingMethodsSyncing = false;
  store.state.cart.isShippingMethodsSyncingError = isError;
  store.state.checkout.shippingMethods = [];
  store.state.checkout.shippingDetails.shippingCarrier = '';
  store.state.checkout.shippingDetails.shippingMethod = '';
  store.state.cart.isCouponProcessing = false;
  store.state.cart.isPaymentMethodsSyncing = false;
  store.state.cart.isTotalsSyncing = false;
  await Vue.nextTick();
}

describe('OConfirmOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('places the order with a valid shipping method', async () => {
    const store = createStore();
    const wrapper = mountConfirmOrder(store);
    await Vue.nextTick();

    expect(findPlaceOrderButton(wrapper).attributes('disabled')).toBeUndefined();
    expect(wrapper.text()).not.toContain(unavailableShippingMessage);

    await findPlaceOrderButton(wrapper).trigger('click');

    expect(hasPlacedOrder()).toBe(true);
  });

  it.each([
    ['fails', true],
    ['returns no methods', false]
  ])('does not place the order after a coupon-triggered lookup %s', async (_, isError) => {
    const store = createStore();
    const wrapper = mountConfirmOrder(store);
    await Vue.nextTick();

    await failShippingLookup(store, { isError });

    expect(findPlaceOrderButton(wrapper).attributes('disabled')).toBeDefined();
    expect(wrapper.text()).toContain(unavailableShippingMessage);

    wrapper.vm.onPlaceOrder();

    expect(hasPlacedOrder()).toBe(false);
    expect(wrapper.vm.isCheckoutInProgress).toBe(false);
  });

  it('disables the PayPal button after a failed lookup', async () => {
    const store = createStore({ paymentMethod: 'braintree_paypal' });
    const wrapper = mountConfirmOrder(store);
    await Vue.nextTick();
    const payPal = wrapper.findComponent({ name: 'PaymentPayPal' });

    expect(payPal.props('isOrderPlacementDisabled')).toBe(false);

    await failShippingLookup(store, { isError: true });

    expect(payPal.props('isOrderPlacementDisabled')).toBe(true);
  });

  it('does not place the order when payment completes without a valid shipping method', async () => {
    const store = createStore({ paymentMethod: 'braintree_paypal' });
    const wrapper = mountConfirmOrder(store);
    await Vue.nextTick();

    await failShippingLookup(store, { isError: true });
    wrapper.setData({ isCheckoutInProgress: true });
    wrapper.findComponent({ name: 'PaymentPayPal' }).vm.$emit('success');

    expect(hasPlacedOrder()).toBe(false);
    expect(wrapper.vm.isCheckoutInProgress).toBe(false);
  });

  it('disables order placement without the notice while a lookup is pending', async () => {
    const store = createStore();
    store.state.cart.isShippingMethodsSyncing = true;
    const wrapper = mountConfirmOrder(store);
    await Vue.nextTick();

    expect(findPlaceOrderButton(wrapper).attributes('disabled')).toBeDefined();
    expect(wrapper.text()).not.toContain(unavailableShippingMessage);
  });

  it('disables order placement when the selected method is not available', async () => {
    const store = createStore();
    store.state.checkout.shippingDetails.shippingMethod = 'express';
    const wrapper = mountConfirmOrder(store);
    await Vue.nextTick();

    expect(findPlaceOrderButton(wrapper).attributes('disabled')).toBeDefined();
    expect(wrapper.text()).toContain(unavailableShippingMessage);
  });

  it('opens the shipping step from the notice', async () => {
    const store = createStore();
    const wrapper = mountConfirmOrder(store);
    await failShippingLookup(store, { isError: true });

    await wrapper.findAll('button').filter((button) => button.text() === 'Edit shipping').at(0).trigger('click');

    expect(EventBus.$emit).toHaveBeenCalledWith('checkout-before-edit', 'shipping');
  });

  it('keeps virtual-cart order placement independent of shipping methods', async () => {
    const store = createStore({ cartItems: [virtualItem] });
    store.state.cart.isShippingMethodsSyncingError = true;
    store.state.checkout.shippingMethods = [];
    const wrapper = mountConfirmOrder(store);
    await Vue.nextTick();

    expect(findPlaceOrderButton(wrapper).attributes('disabled')).toBeUndefined();
    expect(wrapper.text()).not.toContain(unavailableShippingMessage);

    await findPlaceOrderButton(wrapper).trigger('click');

    expect(hasPlacedOrder()).toBe(true);
  });
});
