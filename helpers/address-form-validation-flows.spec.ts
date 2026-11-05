import OEditAddressForm from 'theme/components/organisms/o-edit-address-form.vue';
import OShipping from 'theme/components/organisms/o-shipping.vue';
import OrderUpdateAddress from 'theme/pages/OrderUpdateAddress.vue';

jest.mock('@storefront-ui/vue', () => ({
  SfButton: {},
  SfCheckbox: {},
  SfHeading: {},
  SfInput: {},
  SfRadio: {}
}));

jest.mock('@vue-storefront/i18n', () => ({
  __esModule: true,
  default: {
    t: (key: string) => key
  },
  t: (key: string) => key
}));

jest.mock('@vue-storefront/core/lib/logger', () => ({
  Logger: {
    warn: jest.fn(() => jest.fn())
  }
}));

jest.mock('theme/components/organisms/o-base-address-form.vue', () => ({
  __esModule: true,
  default: {}
}));

jest.mock('@vue-storefront/core/modules/cart', () => ({
  IS_SHIPPING_METHODS_SYNCING: 'cart/isShippingMethodsSyncing'
}));

jest.mock('src/modules/currency', () => ({
  GET_ACTIVE_CURRENCY: 'currency/getActiveCurrency',
  GET_CURRENCY_EXCHANGE_RATE: 'currency/getCurrencyExchangeRate'
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
  PriceHelper: {
    formatPrice: jest.fn()
  }
}));

jest.mock('theme/helpers', () => ({
  createSmoothscroll: jest.fn()
}));

jest.mock('theme/components/molecules/m-multiselect', () => ({
  __esModule: true,
  default: {}
}));

jest.mock('@vue-storefront/core/additional-content', () => ({
  AdditionalContentOutlet: {
    PRIVACY_POLICY_LINKS: 'privacy-policy-links'
  },
  useAdditionalContent: () => []
}));

jest.mock('@vue-storefront/core/application-services', () => ({
  useI18n: () => ({ t: (key: string) => key }),
  useRouter: () => ({ push: jest.fn() }),
  useStore: () => ({
    dispatch: jest.fn(),
    getters: {
      'user/defaultShippingAddress': undefined
    }
  })
}));

jest.mock('src/modules/address', () => {
  const { ref } = require('vue');

  return {
    useAddressValidation: () => ({
      completeValidation: jest.fn(),
      handleValidationResult: jest.fn(),
      isValidating: ref(false),
      validateAddress: jest.fn()
    }),
    useExistingValidationResult: () => ({
      handleExistingValidationResult: jest.fn(),
      validationResult: ref(null)
    })
  };
});

jest.mock('src/modules/orders-history', () => {
  const { ref } = require('vue');

  return {
    isOrderAddressConfirmationSubmission: jest.fn(() => false),
    mapOrderAddressToBaseAddressDetails: jest.fn(),
    REQUEST_ORDER_SHIPPING_ADDRESS_CONFIRMATION_ACTION: 'confirm-address',
    REQUEST_ORDER_SHIPPING_ADDRESS_UPDATE_ACTION: 'update-address',
    useOrderDetails: () => ({
      isError: ref(false),
      isLoading: ref(false),
      order: ref(null)
    })
  };
});

interface InvalidSubmissionFixture {
  anchor: HTMLElement,
  baseAddressForm: {
    getFormValidationRefs: jest.Mock
  },
  focus: jest.SpyInstance,
  observer: {
    errors: Record<string, string[]>,
    validate: jest.Mock
  },
  scroll: jest.Mock
}

function createInvalidSubmissionFixture (): InvalidSubmissionFixture {
  const anchor = document.createElement('div');
  const input = document.createElement('input');
  anchor.appendChild(input);
  document.body.appendChild(anchor);

  const scroll = jest.fn();
  anchor.scrollIntoView = scroll;

  return {
    anchor,
    baseAddressForm: {
      getFormValidationRefs: jest.fn(() => ({
        'first-name-field-anchor': anchor
      }))
    },
    focus: jest.spyOn(input, 'focus'),
    observer: {
      errors: {
        'First name': ['First name is required']
      },
      validate: jest.fn().mockResolvedValue(false)
    },
    scroll
  };
}

function expectInvalidFieldWasActivated (
  fixture: InvalidSubmissionFixture
): void {
  expect(fixture.baseAddressForm.getFormValidationRefs).toHaveBeenCalled();
  expect(fixture.scroll).toHaveBeenCalledWith({
    behavior: 'smooth',
    block: 'center'
  });
  expect(fixture.focus).toHaveBeenCalledTimes(1);
}

describe('address form invalid-submission focus flows', () => {
  let fixtures: InvalidSubmissionFixture[] = [];

  afterEach(() => {
    fixtures.forEach(fixture => fixture.anchor.remove());
    fixtures = [];
    jest.clearAllMocks();
  });

  it('activates the first invalid shipping field', async () => {
    const fixture = createInvalidSubmissionFixture();
    fixtures.push(fixture);
    const setupState = (OShipping as any).setup({}, { emit: jest.fn() });
    setupState.validationObserver.value = fixture.observer;
    setupState.baseAddressForm.value = fixture.baseAddressForm;

    await (OShipping as any).methods.saveDataToCheckout.call({
      validateAndGoToFirstError: setupState.validateAndGoToFirstError
    });

    expectInvalidFieldWasActivated(fixture);
  });

  it('activates the first invalid customer address field', async () => {
    const fixture = createInvalidSubmissionFixture();
    fixtures.push(fixture);
    const setupState = (OEditAddressForm as any).setup(
      { value: {} },
      { emit: jest.fn() }
    );
    setupState.validationObserver.value = fixture.observer;
    setupState.baseAddressForm.value = fixture.baseAddressForm;

    await setupState.onFormSubmit();

    expectInvalidFieldWasActivated(fixture);
  });

  it('activates the first invalid order address field', async () => {
    const fixture = createInvalidSubmissionFixture();
    fixtures.push(fixture);
    const setupState = (OrderUpdateAddress as any).setup(
      { orderId: '1000001' },
      { emit: jest.fn() }
    );
    setupState.validationObserver.value = fixture.observer;
    setupState.baseAddressForm.value = fixture.baseAddressForm;

    await setupState.onFormSubmit();

    expectInvalidFieldWasActivated(fixture);
  });
});
