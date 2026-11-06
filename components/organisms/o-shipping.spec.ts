import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { mount, Wrapper } from '@vue/test-utils';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';

import OShipping from './o-shipping.vue';

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
jest.mock('@vue-storefront/core/modules/cart', () => ({
  IS_SHIPPING_METHODS_SYNCING: 'cart/isShippingMethodsSyncing',
  IS_SHIPPING_METHODS_SYNCING_ERROR: 'cart/isShippingMethodsSyncingError'
}));
jest.mock('@vue-storefront/core/additional-content', () => ({
  AdditionalContentOutlet: { PRIVACY_POLICY_LINKS: 'privacy-policy-links' },
  useAdditionalContent: () => []
}));
jest.mock('@storefront-ui/vue', () => ({
  SfInput: { render: (h) => h('input') },
  SfRadio: {
    props: ['value'],
    render (h) {
      return h('label', { class: 'sf-radio-stub' }, this.$scopedSlots.label?.({}));
    }
  },
  SfButton: {
    render (h) {
      return h('button', { on: this.$listeners }, this.$slots.default);
    }
  },
  SfHeading: {
    props: ['title'],
    render (h) {
      return h('h3', this.title);
    }
  },
  SfCheckbox: {
    props: ['disabled'],
    render (h) {
      return h('input', { attrs: { type: 'checkbox', disabled: this.disabled } });
    }
  },
  SfLoader: { render: (h) => h('div', { class: 'sf-loader-stub' }) }
}));
jest.mock('vee-validate', () => ({
  ValidationObserver: {
    render (h) {
      return h('div', this.$slots.default);
    }
  }
}));
jest.mock('theme/helpers', () => ({ createSmoothscroll: jest.fn() }));
jest.mock('theme/helpers/use-form-validation', () => ({
  getFieldAnchorName: (field: string) => field,
  useFormValidation: () => ({ validateAndGoToFirstError: jest.fn(async () => true) })
}));
jest.mock('theme/components/molecules/m-multiselect', () => ({ render: (h) => h('div') }));
jest.mock('./o-base-address-form.vue', () => ({
  __esModule: true,
  default: {
    name: 'OBaseAddressForm',
    props: ['value', 'isFormFieldsDisabled'],
    render: (h) => h('div'),
    methods: { getFormValidationRefs: () => ({}) }
  }
}));
const mockValidateAddress = jest.fn(async () => true);
jest.mock('src/modules/address', () => {
  const { ref } = jest.requireActual('vue');

  return {
    useAddressValidation: () => ({
      validateAddress: (...args) => mockValidateAddress(...args),
      isValidating: ref(false),
      completeValidation: jest.fn()
    })
  };
});
jest.mock('src/modules/currency', () => ({
  GET_ACTIVE_CURRENCY: 'currency/activeCurrency',
  GET_CURRENCY_EXCHANGE_RATE: 'currency/exchangeRate'
}));
jest.mock('src/modules/persisted-customer-data', () => ({
  PERSISTED_CUSTOMER_FIRST_NAME: 'persisted/firstName',
  PERSISTED_CUSTOMER_LAST_NAME: 'persisted/lastName',
  PERSISTED_CUSTOMER_PHONE_NUMBER: 'persisted/phoneNumber',
  PERSISTED_CUSTOMER_SHIPPING_COUNTRY: 'persisted/shippingCountry',
  PERSISTED_CUSTOMER_VAT_ID: 'persisted/vatId',
  SET_PERSISTED_CUSTOMER_FIRST_NAME: 'persisted/setFirstName',
  SET_PERSISTED_CUSTOMER_LAST_NAME: 'persisted/setLastName',
  SET_PERSISTED_CUSTOMER_PHONE_NUMBER: 'persisted/setPhoneNumber',
  SET_PERSISTED_CUSTOMER_SHIPPING_COUNTRY: 'persisted/setShippingCountry',
  SET_PERSISTED_CUSTOMER_VAT_ID: 'persisted/setVatId'
}));
jest.mock('src/modules/shared', () => ({
  PriceHelper: { formatPrice: (price: number, symbol: string) => `${symbol}${price}` }
}));

Vue.use(Vuex);

interface ShippingMethod {
  carrier_code: string,
  method_code: string,
  carrier_title: string,
  method_title: string,
  amount: number
}

interface LookupOutcome {
  shippingMethods?: ShippingMethod[],
  isError?: boolean,
  isPending?: boolean,
  error?: Error,
  remainingTotalsSync?: Promise<void>
}

const flatRate: ShippingMethod = {
  carrier_code: 'flatrate',
  method_code: 'flatrate',
  carrier_title: 'Flat Rate',
  method_title: 'Fixed',
  amount: 10
};
const freeShipping: ShippingMethod = {
  carrier_code: 'freeshipping',
  method_code: 'freeshipping',
  carrier_title: 'Free Shipping',
  method_title: 'Free',
  amount: 0
};

const defaultShippingAddress = {
  id: 7,
  firstname: 'Jane',
  lastname: 'Doe',
  country_id: 'US',
  region: { region: 'New York', region_id: 43 },
  city: 'New York',
  street: ['5 Default Ave', ''],
  postcode: '10002',
  telephone: '2125550100'
};

const lookupAddressFields = ['country', 'zipCode', 'streetAddress', 'city'];

function pickLookupAddress (shippingDetails: Record<string, unknown>): Record<string, unknown> {
  return lookupAddressFields.reduce((address, field) => {
    address[field] = shippingDetails[field];
    return address;
  }, {});
}

function createStore (currentUser: unknown = null) {
  const lookupAddresses: Record<string, unknown>[] = [];
  let nextLookupOutcome: LookupOutcome = { shippingMethods: [flatRate] };

  async function performLookup ({ state }): Promise<void> {
    lookupAddresses.push(pickLookupAddress(state.checkout.shippingDetails));

    const outcome = nextLookupOutcome;

    state.cart.isShippingMethodsSyncing = !!outcome.isPending;
    state.cart.isShippingMethodsSyncingError = !!outcome.isError || !!outcome.error;
    state.checkout.shippingMethods = outcome.shippingMethods || [];

    if (outcome.error) {
      throw outcome.error;
    }

    await outcome.remainingTotalsSync;
  }

  const store: Store<any> = new Vuex.Store({
    state: {
      cart: {
        isShippingMethodsSyncing: false,
        isShippingMethodsSyncingError: false
      },
      checkout: {
        shippingDetails: {
          firstName: 'John',
          lastName: 'Smith',
          country: 'US',
          state: 'New York',
          region_id: 43,
          city: 'New York',
          streetAddress: '1 Old St',
          apartmentNumber: '',
          zipCode: '10001',
          phoneNumber: '2125550199',
          shippingCarrier: flatRate.carrier_code,
          shippingMethod: flatRate.method_code
        },
        shippingMethods: [flatRate]
      },
      user: { current: currentUser }
    },
    getters: {
      'cart/isShippingMethodsSyncing': (state) => state.cart.isShippingMethodsSyncing,
      'cart/isShippingMethodsSyncingError': (state) => state.cart.isShippingMethodsSyncingError,
      'checkout/getShippingMethods': (state) => state.checkout.shippingMethods,
      'checkout/getPaymentMethods': () => [],
      'currency/activeCurrency': () => ({ symbol: '$' }),
      'currency/exchangeRate': () => 1,
      'persisted/firstName': () => undefined,
      'persisted/lastName': () => undefined,
      'persisted/phoneNumber': () => undefined,
      'persisted/shippingCountry': () => undefined,
      'persisted/vatId': () => undefined
    },
    mutations: {
      'checkout/checkout/UPDATE_SHIPPING_DETAILS' (state, update) {
        state.checkout.shippingDetails = { ...state.checkout.shippingDetails, ...update };
      },
      'checkout/checkout/UPDATE_PROP_VALUE' (state, [key, value]) {
        state.checkout.shippingDetails[key] = value;
      },
      'persisted/setFirstName': () => undefined,
      'persisted/setLastName': () => undefined,
      'persisted/setPhoneNumber': () => undefined,
      'persisted/setShippingCountry': () => undefined,
      'persisted/setVatId': () => undefined
    },
    actions: {
      'cart/syncShippingMethods': performLookup,
      'cart/syncTotals': performLookup,
      'cart/pullEstimatedShipments': jest.fn()
    }
  });

  return {
    store,
    lookupAddresses,
    setNextLookupOutcome (outcome: LookupOutcome): void {
      nextLookupOutcome = outcome;
    }
  };
}

function mountShipping (store: Store<any>): Wrapper<any> {
  return mount(OShipping, {
    store,
    propsData: { isActive: true },
    mocks: {
      $t: (key: string) => key,
      $route: { hash: '' }
    }
  });
}

function editAddress (wrapper: Wrapper<any>, update: Record<string, unknown>): void {
  const addressForm = wrapper.findComponent({ name: 'OBaseAddressForm' });

  addressForm.vm.$emit('input', { ...addressForm.props('value'), ...update });
}

function findButton (wrapper: Wrapper<any>, text: string): Wrapper<any> {
  return wrapper.findAll('button').filter((button) => button.text() === text).at(0);
}

function countCheckoutAdvances (): number {
  return (EventBus.$emit as jest.Mock).mock.calls.filter(([eventName]) => {
    return eventName === 'checkout-after-shippingDetails';
  }).length;
}

function hasAdvancedCheckout (): boolean {
  return countCheckoutAdvances() > 0;
}

async function flushPromises (): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve));
}

describe('OShipping', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('shipping-method display states', () => {
    it('shows the loading indicator while methods are syncing', async () => {
      const { store } = createStore();
      store.state.cart.isShippingMethodsSyncing = true;
      store.state.cart.isShippingMethodsSyncingError = true;

      const wrapper = mountShipping(store);
      await Vue.nextTick();

      expect(wrapper.find('.sf-loader-stub').exists()).toBe(true);
      expect(wrapper.text()).not.toContain('Error while loading shipping methods');
      expect(wrapper.text()).not.toContain('No shipping methods are available for this address.');
    });

    it('shows the error with a Retry control after a failed lookup', async () => {
      const { store } = createStore();
      store.state.cart.isShippingMethodsSyncingError = true;
      store.state.checkout.shippingMethods = [];

      const wrapper = mountShipping(store);
      await Vue.nextTick();

      expect(wrapper.text()).toContain('Error while loading shipping methods');
      expect(findButton(wrapper, 'Retry').exists()).toBe(true);
      expect(findButton(wrapper, 'Continue to payment').attributes('disabled')).toBeDefined();
      expect(wrapper.text()).not.toContain('No shipping methods are available for this address.');
    });

    it('shows the empty message when no methods are available', async () => {
      const { store } = createStore();
      store.state.checkout.shippingMethods = [];

      const wrapper = mountShipping(store);
      await Vue.nextTick();

      expect(wrapper.text()).toContain('No shipping methods are available for this address.');
      expect(wrapper.text()).not.toContain('Retry');
    });

    it('shows the available methods', async () => {
      const { store } = createStore();

      const wrapper = mountShipping(store);
      await Vue.nextTick();

      expect(wrapper.findAll('.sf-radio-stub')).toHaveLength(1);
      expect(wrapper.text()).toContain('Flat Rate');
      expect(wrapper.find('.sf-loader-stub').exists()).toBe(false);
      expect(wrapper.text()).not.toContain('Error while loading shipping methods');
      expect(wrapper.text()).not.toContain('No shipping methods are available for this address.');
    });
  });

  describe('lookup address', () => {
    it('looks up the edited ZIP/postcode when the ZIP/postcode field is left', async () => {
      const { store } = createStore();
      const wrapper = mountShipping(store);

      editAddress(wrapper, { zipCode: '94105' });
      wrapper.findComponent({ name: 'OBaseAddressForm' }).vm.$emit('zip-code-blur');

      expect(store.state.checkout.shippingDetails.zipCode).toBe('94105');
      expect(EventBus.$emit).toHaveBeenCalledWith('checkout-before-shippingMethods', 'US');
    });

    it('does not restore a cleared shipping method from the form', async () => {
      const { store } = createStore();
      const wrapper = mountShipping(store);

      editAddress(wrapper, { zipCode: '94105' });
      store.state.checkout.shippingDetails.shippingMethod = '';
      wrapper.findComponent({ name: 'OBaseAddressForm' }).vm.$emit('zip-code-blur');

      expect(store.state.checkout.shippingDetails.shippingMethod).toBe('');
    });

    it('retries with the edited guest address without advancing checkout', async () => {
      const { store, lookupAddresses } = createStore();
      store.state.cart.isShippingMethodsSyncingError = true;
      store.state.checkout.shippingMethods = [];
      const wrapper = mountShipping(store);

      editAddress(wrapper, { zipCode: '94105', streetAddress: '2 New St', city: 'San Francisco' });
      await Vue.nextTick();
      await findButton(wrapper, 'Retry').trigger('click');
      await flushPromises();

      expect(lookupAddresses).toEqual([{
        country: 'US',
        zipCode: '94105',
        streetAddress: '2 New St',
        city: 'San Francisco'
      }]);
      expect(hasAdvancedCheckout()).toBe(false);
    });

    it('retries with the signed-in customer default address', async () => {
      const { store, lookupAddresses } = createStore({
        default_shipping: 7,
        addresses: [defaultShippingAddress]
      });
      store.state.checkout.shippingDetails = {
        firstName: '',
        lastName: '',
        phoneNumber: '',
        country: 'US',
        city: '',
        state: '',
        region_id: null,
        streetAddress: '',
        zipCode: '',
        vat_id: '',
        shippingCarrier: '',
        shippingMethod: ''
      };
      const wrapper = mountShipping(store);
      await Vue.nextTick();

      store.state.cart.isShippingMethodsSyncingError = true;
      store.state.checkout.shippingMethods = [];
      await Vue.nextTick();
      await findButton(wrapper, 'Retry').trigger('click');
      await flushPromises();

      expect(lookupAddresses).toEqual([{
        country: 'US',
        zipCode: '10002',
        streetAddress: '5 Default Ave',
        city: 'New York'
      }]);
      expect(hasAdvancedCheckout()).toBe(false);
    });
  });

  describe('Continue to payment', () => {
    async function continueToPayment (wrapper: Wrapper<any>): Promise<void> {
      await findButton(wrapper, 'Continue to payment').trigger('click');
      await flushPromises();
    }

    it('advances after the lookup for the submitted address returns the selected method', async () => {
      const { store, lookupAddresses, setNextLookupOutcome } = createStore();
      const wrapper = mountShipping(store);
      setNextLookupOutcome({ shippingMethods: [freeShipping, flatRate] });

      editAddress(wrapper, { zipCode: '94105' });
      await continueToPayment(wrapper);

      expect(lookupAddresses[0]).toMatchObject({ zipCode: '94105' });
      expect(hasAdvancedCheckout()).toBe(true);
    });

    it('stays on the shipping step when the lookup fails', async () => {
      const { store, setNextLookupOutcome } = createStore();
      const wrapper = mountShipping(store);
      setNextLookupOutcome({ error: new Error('Network error') });

      await continueToPayment(wrapper);

      expect(hasAdvancedCheckout()).toBe(false);
      expect(wrapper.text()).toContain('Error while loading shipping methods');
    });

    it('stays on the shipping step when the lookup returns no methods', async () => {
      const { store, setNextLookupOutcome } = createStore();
      const wrapper = mountShipping(store);
      setNextLookupOutcome({ shippingMethods: [] });

      await continueToPayment(wrapper);

      expect(hasAdvancedCheckout()).toBe(false);
      expect(wrapper.text()).toContain('No shipping methods are available for this address.');
    });

    it('stays on the shipping step when the selected method is no longer available', async () => {
      const { store, setNextLookupOutcome } = createStore();
      const wrapper = mountShipping(store);
      setNextLookupOutcome({ shippingMethods: [freeShipping] });

      await continueToPayment(wrapper);

      expect(hasAdvancedCheckout()).toBe(false);
      expect(wrapper.text()).toContain('Free Shipping');
      expect(findButton(wrapper, 'Continue to payment').attributes('disabled')).toBeUndefined();
    });

    it('keeps Continue disabled and ignores repeated clicks until the submission ends', async () => {
      const { store, lookupAddresses, setNextLookupOutcome } = createStore();
      const wrapper = mountShipping(store);
      let finishTotalsSync: () => void;
      const remainingTotalsSync = new Promise<void>((resolve) => {
        finishTotalsSync = resolve;
      });
      setNextLookupOutcome({ shippingMethods: [flatRate], remainingTotalsSync });

      await continueToPayment(wrapper);

      expect(store.state.cart.isShippingMethodsSyncing).toBe(false);
      expect(findButton(wrapper, 'Continue to payment').attributes('disabled')).toBeDefined();

      await (wrapper.vm as any).saveDataToCheckout();
      expect(lookupAddresses).toHaveLength(1);

      finishTotalsSync();
      await flushPromises();

      expect(countCheckoutAdvances()).toBe(1);
      expect(findButton(wrapper, 'Continue to payment').attributes('disabled')).toBeUndefined();
    });

    it('locks the address while the final lookup is pending', async () => {
      const { store, setNextLookupOutcome } = createStore({
        default_shipping: 7,
        addresses: [defaultShippingAddress]
      });
      const wrapper = mountShipping(store);
      let finishTotalsSync: () => void;
      const remainingTotalsSync = new Promise<void>((resolve) => {
        finishTotalsSync = resolve;
      });
      setNextLookupOutcome({ shippingMethods: [flatRate], remainingTotalsSync });
      const addressForm = wrapper.findComponent({ name: 'OBaseAddressForm' });

      expect(addressForm.props('isFormFieldsDisabled')).toBe(false);
      expect(wrapper.find('input[type="checkbox"]').attributes('disabled')).toBeUndefined();

      await continueToPayment(wrapper);

      expect(addressForm.props('isFormFieldsDisabled')).toBe(true);
      expect(wrapper.find('input[type="checkbox"]').attributes('disabled')).toBeDefined();

      finishTotalsSync();
      await flushPromises();

      expect(addressForm.props('isFormFieldsDisabled')).toBe(false);
      expect(wrapper.find('input[type="checkbox"]').attributes('disabled')).toBeUndefined();
    });

    it('stays on the shipping step when the address changes during the final lookup', async () => {
      const { store, lookupAddresses, setNextLookupOutcome } = createStore();
      const wrapper = mountShipping(store);
      let finishTotalsSync: () => void;
      const remainingTotalsSync = new Promise<void>((resolve) => {
        finishTotalsSync = resolve;
      });
      setNextLookupOutcome({ shippingMethods: [flatRate], remainingTotalsSync });

      await continueToPayment(wrapper);
      editAddress(wrapper, { streetAddress: '9 Changed St', city: 'Albany' });
      finishTotalsSync();
      await flushPromises();

      expect(lookupAddresses).toHaveLength(1);
      expect(lookupAddresses[0]).toMatchObject({ streetAddress: '1 Old St', city: 'New York' });
      expect(hasAdvancedCheckout()).toBe(false);
      expect(findButton(wrapper, 'Continue to payment').attributes('disabled')).toBeUndefined();
    });

    it('does not advance after the customer leaves the shipping step during submission', async () => {
      const { store, setNextLookupOutcome } = createStore();
      const wrapper = mountShipping(store);
      let finishTotalsSync: () => void;
      const remainingTotalsSync = new Promise<void>((resolve) => {
        finishTotalsSync = resolve;
      });
      setNextLookupOutcome({ shippingMethods: [flatRate], remainingTotalsSync });

      await continueToPayment(wrapper);
      wrapper.destroy();
      finishTotalsSync();
      await flushPromises();

      expect(hasAdvancedCheckout()).toBe(false);
    });

    it('keeps a newer address after the customer leaves during address validation', async () => {
      const { store, lookupAddresses } = createStore();
      let finishAddressValidation: (shouldProceed: boolean) => void;
      mockValidateAddress.mockImplementationOnce(() => new Promise<boolean>((resolve) => {
        finishAddressValidation = resolve;
      }));
      const abandonedWrapper = mountShipping(store);

      await continueToPayment(abandonedWrapper);
      abandonedWrapper.destroy();

      const wrapper = mountShipping(store);
      editAddress(wrapper, { streetAddress: '9 New St' });
      await continueToPayment(wrapper);

      finishAddressValidation(true);
      await flushPromises();

      expect(store.state.checkout.shippingDetails.streetAddress).toBe('9 New St');
      expect(lookupAddresses).toHaveLength(1);
      expect(lookupAddresses[0]).toMatchObject({ streetAddress: '9 New St' });
      expect(countCheckoutAdvances()).toBe(1);
    });

    it('stays on the shipping step while a newer lookup is pending', async () => {
      const { store, setNextLookupOutcome } = createStore();
      const wrapper = mountShipping(store);
      setNextLookupOutcome({ shippingMethods: [flatRate], isPending: true });

      await continueToPayment(wrapper);

      expect(hasAdvancedCheckout()).toBe(false);
    });
  });
});
