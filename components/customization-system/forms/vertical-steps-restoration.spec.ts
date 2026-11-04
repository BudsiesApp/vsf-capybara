import Vue, { computed, ref, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import VerticalStepsForm from './vertical-steps-form.vue';
import FormWithImagesGallery from './form-with-images-gallery.vue';
import CreationWizardForm from './creation-wizard-form.vue';
import OrderItemCustomizationForm from './order-item-customization-form.vue';
import ActualSfStep from '@storefront-ui/vue/src/components/molecules/SfSteps/_internal/SfStep.vue';

const mockStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() };
let mockStore;
let mockState;
const mockProductMode = ref(false);
const mockWizardMode = ref(false);
const mockValues = ref<any[]>([]);
const mockUpdate = jest.fn();
const mockAddToCart = jest.fn().mockResolvedValue(undefined);
const mockValidate = jest.fn().mockResolvedValue(true);
const mockLoadProduct = jest.fn().mockResolvedValue(undefined);
const mockPush = jest.fn();
const mockReplace = jest.fn();
const standard = 'production_time_selector_standard_option';
const mockOption = { id: 'production', name: 'Production', type: 'option', sn: 0, isEnabled: true, optionData: { type: 'production_time_upgrade', displayWidget: 'production_time_timeline', maxValuesCount: 1, displayWidgetOptions: { isHolidayPeriod: true } } };

jest.mock('@vue-storefront/core/lib/storage-manager', () => ({ StorageManager: { get: () => mockStorage } }));
jest.mock('@vue-storefront/core/application-services', () => ({ useStore: () => mockStore, useRoute: () => ({ query: {} }), useRouter: () => ({ push: mockPush, replace: mockReplace }), useI18n: () => ({ t: value => value }) }));
jest.mock('@vue-storefront/core/request-services', () => ({ useRequestServices: () => ({ getCookie: () => 'FR' }) }));
jest.mock('src/modules/persisted-customer-data', () => ({ PERSISTED_CUSTOMER_SHIPPING_COUNTRY: 'country', PERSISTED_CUSTOMER_SHIPPING_COUNTRY_SETTLED: 'settled' }));
jest.mock('@storefront-ui/vue', () => ({ SfIcon: { render: h => h('i') } }));
jest.mock('vee-validate', () => ({
  ValidationObserver: { props: ['tag'], data: () => ({ errors: {} }), methods: { validate () { return mockWizardMode.value ? this.$refs.real.validate() : mockValidate(); }, reset: jest.fn() }, render (h) { if (mockWizardMode.value) return h(jest.requireActual('vee-validate').ValidationObserver, { ref: 'real', attrs: this.$attrs, props: { tag: this.tag || 'div' }, scopedSlots: this.$scopedSlots }, this.$slots.default); return h(this.tag || 'div', this.$scopedSlots.default ? this.$scopedSlots.default({ errors: {} }) : this.$slots.default); } },
  ValidationProvider: { render (h) { return h('div', this.$scopedSlots.default({ errors: [], classes: {} })); } }
}));
jest.mock('src/modules/shared', () => ({ ...jest.requireActual('src/modules/shared/types/product-purchase-flow.type'), BudsieStatus: { AWAITING_CUSTOMIZATION: 1 }, PriceHelper: { getFinalPrice: price => price.special !== null && price.special < price.regular ? price.special : price.regular, getTotalPriceForProductPrices: prices => { const regular = prices.reduce((sum, price) => sum + price.regular, 0); const special = prices.reduce((sum, price) => sum + (price.special === null ? price.regular : price.special), 0); return { regular, special: special < regular ? special : null }; } } }));
jest.mock('@vue-storefront/core/modules/catalog', () => ({ PRODUCT_LOCALIZED_PRICE_DICTIONARY: 'localized-prices' }));
jest.mock('src/modules/currency', () => ({ GET_ACTIVE_CURRENCY: 'currency' }));
jest.mock('src/modules/a-b-testing', () => ({ useABTestingCustomizationsFilter: () => ({ customizationFilter: () => true }) }));
jest.mock('@vue-storefront/core/lib/logger', () => ({ Logger: { error: () => () => {}, debug: () => () => {} } }));
jest.mock('@vue-storefront/core/helpers', () => ({ isServer: false, PriceHelper: { getFinalPrice: price => price.special !== null && price.special < price.regular ? price.special : price.regular, formatPrice: (price, symbol) => `${symbol}${price}` } }));
jest.mock('@vue-storefront/core/i18n', () => ({ __esModule: true, default: { t: value => value } }));
jest.mock('@vue-storefront/core/modules/cart/helpers', () => ({ notifications: { createNotification: jest.fn() } }));
jest.mock('@vue-storefront/core/additional-content', () => ({ AdditionalContentOutlet: {}, useAdditionalContent: () => [] }));
jest.mock('theme/helpers/use-add-to-cart', () => ({ useAddToCart: () => ({ addToCartHandler: mockAddToCart, isSubmitting: ref(false) }) }));
jest.mock('theme/helpers/use-bulk-images-upload', () => ({ useBulkImagesUpload: () => ({}) }));
jest.mock('theme/helpers/use-customize-action', () => ({ useCustomizeAction: () => ({ confirmCustomization: jest.fn(), isSubmitting: ref(false) }) }));
jest.mock('theme/helpers/use-image-upload', () => ({ useImageUpload: () => ({ uploadImage: jest.fn() }) }));
jest.mock('theme/helpers/use-product-gallery', () => ({ useProductGallery: () => ({ galleryImages: [] }) }));
jest.mock('theme/helpers/use-creation-wizard-gtm-events', () => ({ useCreationWizardGtmEvents: () => ({ onStepSubmit: jest.fn() }) }));
jest.mock('theme/helpers/use-creation-wizard-preselected-size', () => ({ useCreationWizardPreselectedSize: () => ({ handlePreselectedSize: jest.fn() }) }));
jest.mock('theme/helpers/use-creation-wizard-product-type-step', () => ({ useCreationWizardProductTypeStep: () => ({ isProductLoading: ref(false), productTypeChooseStepName: 'Type', setProductType: jest.fn(), loadProduct: mockLoadProduct }) }));
jest.mock('theme/helpers/use-floating-photo', () => ({ useFloatingPhoto: () => ({ floatingPhotoUrl: ref('') }) }));
jest.mock('theme/helpers/use-component-unmounted-checker', () => ({ useComponentUnmountedChecker: () => ({ isUnmounted: ref(true) }) }));
jest.mock('theme/helpers/use-form-validation', () => ({ getNestedFormRefs: () => ({}), useFormValidation: observer => ({ getFieldAnchorName: () => '', goToFieldByName: jest.fn(), validateAndGoToFirstError: () => mockWizardMode.value ? observer.value.validate() : mockValidate(), validate: mockValidate, goToFirstError: jest.fn() }) }));
jest.mock('theme/helpers/use-rendered-order-template-refs', () => ({ useRenderedOrderTemplateRefs: () => ({ templateRef: ref(null), getRefsInRenderedOrder: () => [] }) }));
jest.mock('theme/helpers/use-product-quantity', () => ({ useProductQuantity: () => ({ quantity: ref(1) }) }));
jest.mock('theme/helpers/use-quantity-and-shipping-discounts', () => ({ useQuantityAndShippingDiscounts: () => ({ showQuantityNotes: ref(false), quantityAndShippingDiscountsStorySlug: '' }) }));
jest.mock('theme/helpers/use-error-accessibility', () => ({ useErrorAccessibility: () => ({ errorMessageId: 'error' }) }));
jest.mock('theme/components/atoms/a-custom-product-quantity.vue', () => ({}));
jest.mock('theme/components/atoms/a-custom-price.vue', () => ({}));
jest.mock('theme/components/molecules/m-zoom-gallery.vue', () => ({}));
jest.mock('theme/components/organisms/OPlushieCreationWizard/m-floating-photo.vue', () => ({}));
jest.mock('theme/components/organisms/OPlushieCreationWizard/m-product-type-choose-step.vue', () => ({}));
jest.mock('theme/components/molecules/m-block-story.vue', () => ({}));
jest.mock('theme/components/molecules/m-form-errors.vue', () => ({}));
jest.mock('theme/components/molecules/m-order-submit-agreement.vue', () => ({}));
jest.mock('theme/components/molecules/m-product-description-story.vue', () => ({}));
jest.mock('theme/assets/rush-upgrades/rush.svg', () => 'rush');
jest.mock('theme/assets/rush-upgrades/standard.svg', () => 'standard');
jest.mock('theme/assets/rush-upgrades/super-rush.svg', () => 'super-rush');
jest.mock('theme/components/customization-system/widgets/cards-list-widget.vue', () => ({}));
jest.mock('theme/components/customization-system/widgets/checkbox-widget.vue', () => ({}));
jest.mock('theme/components/customization-system/widgets/colors-list-widget.vue', () => ({}));
jest.mock('theme/components/customization-system/widgets/dropdown-widget.vue', () => ({}));
jest.mock('theme/components/customization-system/widgets/image-upload-widget.vue', () => ({}));
jest.mock('theme/components/customization-system/widgets/search-field-widget.vue', () => ({}));
jest.mock('theme/components/customization-system/widgets/textarea-widget.vue', () => ({}));
jest.mock('theme/components/customization-system/widgets/text-input-widget.vue', () => ({}));
jest.mock('theme/components/customization-system/widgets/thumbnails-list-widget.vue', () => ({}));
jest.mock('src/modules/customization-system', () => {
  const { computed, ref } = require('vue');
  return {
    ...require('src/modules/customization-system/composables/use-holiday-delivery-location'),
    ...require('src/modules/customization-system/composables/use-customization-state-preservation'),
    ...require('src/modules/customization-system/composables/use-list-widget'),
    ...require('src/modules/customization-system/types/list-widget-input-type'),
    ...require('src/modules/customization-system/types/widget-type'),
    ...require('src/modules/customization-system/types/option-type'),
    ...require('src/modules/customization-system/types/customizable-product-flow.type'),
    ...require('src/modules/customization-system/composables/use-customization-option-wiget'),
    ...require('src/modules/customization-system/composables/use-widget-busy-state'),
    ...require('src/modules/customization-system/composables/use-entity-busy-state'),
    useCustomizationOptionValidation: () => ({ validationRules: '', isFieldRequired: false, validationRef: ref('validation') }),
    useCustomizationsOptionsDefaultValue: require('src/modules/customization-system/composables/use-customizations-options-default-value').useCustomizationsOptionsDefaultValue,
    PRODUCTION_TIME_SELECTOR_STANDARD_OPTION_VALUE_ID: 'production_time_selector_standard_option',
    isFileUploadValue: () => false,
    requiredCustomizationsFilter: () => true,
    useOptionValuesPrice: values => mockProductMode.value ? require('src/modules/customization-system/composables/use-option-values-price').useOptionValuesPrice(values) : ({ optionValuePriceDictionary: computed(() => Object.fromEntries(values.value.map(value => [value.id, { regular: value.price || 0, special: null }]))) }),
    useCustomizationState: () => ({ customizationState: mockState, customizationOptionValue: computed(() => Object.fromEntries(mockState.value.map(item => [item.customization_id, item.value]))), selectedOptionValuesIds: computed(() => mockState.value.map(item => item.value)), updateCustomizationOptionValue: payload => { mockUpdate(payload); mockState.value = [{ customization_id: payload.customizationId, value: payload.value }]; }, mergeCustomizationState: value => { mockState.value = value; }, resetCustomizationState: jest.fn(), addCustomizationOptionValue: jest.fn(), removeCustomizationOptionValue: jest.fn() }),
    usePurchaseFlowCustomizations: (...args) => mockProductMode.value ? require('src/modules/customization-system/composables/use-purchase-flow-customizations').usePurchaseFlowCustomizations(...args) : ({ flowAvailableCustomizations: ref([mockOption]) }),
    useAvailableCustomizations: (...args) => mockProductMode.value ? require('src/modules/customization-system/composables/use-available-customizations').useAvailableCustomizations(...args) : ({ availableCustomizations: ref([mockOption]), availableOptionCustomizations: ref([mockOption]), availableOptionValues: mockValues, customizationAvailableOptionValues: computed(() => ({ production: mockValues.value })), removeUnavailableOptionValues: () => ({}) }),
    useOptionValueActions: () => ({ executeActionsByCustomizationIdAndCustomizationOptionValue: jest.fn() }),
    LockedCustomizationsFilterType: { UNSELECTED: 'unselected' },
    useLockedCustomizations: (...args) => mockProductMode.value ? require('src/modules/customization-system/composables/use-locked-customizations').useLockedCustomizations(...args) : ({ selectedLockedCustomizations: ref([]), lockedCustomizationDictionary: ref({}), optionValuesFilter: () => true, customizationsFilter: () => true }),
    useCustomizationProductDescription: () => ({ descriptionProductSku: '' }),
    useCustomizationsPrice: (...args) => mockProductMode.value ? require('src/modules/customization-system/composables/use-customizations-price').useCustomizationsPrice(...args) : ({ totalPrice: ref({ regular: 0, special: null }) }),
    useSelectedOptionValueUrlQuery: () => ({ unhandledCustomizationsFilter: () => false }),
    useEmailCustomization: () => ({ emailCustomizationFilter: () => true, persistCustomerEmail: jest.fn() }),
    useCustomizationsBundleOptions: () => ({ bundleOptions: ref([]) }),
    useAvailableOptionsValuesFilter: (...args) => mockProductMode.value ? require('src/modules/customization-system/composables/use-available-options-values-filter').useAvailableOptionsValuesFilter(...args) : ({ filteredOptionValues: computed(() => ({ production: mockValues.value })) }),
    useCustomizationsFilter: (...args) => mockProductMode.value ? require('src/modules/customization-system/composables/use-customizations-filter').useCustomizationsFilter(...args) : ({ filteredCustomizations: computed(() => args[0].value) }),
    useCustomizationsGroups: () => mockWizardMode.value ? ({ customizationRootGroups: ref([{ id: 'holiday', name: 'Holiday' }, { id: 'required', name: 'Required' }, { id: 'last', name: 'Last' }]), customizationRootGroupCustomizations: { holiday: [mockOption], required: [], last: [] }, isLastGroup: () => false }) : ({ customizationRootGroups: [{ id: 'group' }], customizationRootGroupCustomizations: { group: [mockOption] }, isLastGroup: () => false })
  };
});

async function flush () { for (let i = 0; i < 20; i++) await Promise.resolve(); await Vue.nextTick(); }
const stubs = ['SfHeading', 'SfDivider', 'SfButton', 'SfInput', 'SfModal', 'MBlockStory', 'MFormErrors', 'MOrderSubmitAgreement', 'ACustomProductQuantity', 'MProductDescriptionStory'];

describe('product-page Holiday restoration', () => {
  beforeEach(() => {
    mockProductMode.value = false; mockWizardMode.value = false;
    mockState = ref([]);
    mockValues.value = [{ id: standard, sn: 0, isEnabled: true }, { id: 'rush', sku: 'rush-sku', sn: 1, price: 25, isEnabled: true }];
    mockStorage.getItem.mockReset(); mockStorage.setItem.mockReset().mockResolvedValue(undefined); mockStorage.removeItem.mockReset().mockResolvedValue(undefined);
    mockUpdate.mockClear(); mockAddToCart.mockClear(); mockValidate.mockClear(); mockLoadProduct.mockClear();
    mockStore = { dispatch: jest.fn(), getters: reactive({ country: '', settled: false, currency: { symbol: '$' }, 'product/getProductBySkuDictionary': {}, 'localized-prices': {}, 'product/getCurrentProduct': { id: 1, sku: 'test', name: 'Test', customizations: [mockOption] }, 'budsies/getProductRushAddons': () => [
      { id: '', isDomestic: false, text: 'International Standard', turnaroundTime: 10 }, { id: 'rush-sku', isDomestic: false, text: 'International Rush', turnaroundTime: 4 },
      { id: '', isDomestic: true, text: 'US Standard', turnaroundTime: 10 }, { id: 'rush-sku', isDomestic: true, text: 'US Rush', turnaroundTime: 4 }
    ] }) };
    jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });
  afterEach(() => { jest.restoreAllMocks(); });

  it('waits for the order-item draft without reporting product readiness busy', async () => {
    mockStore.getters.settled = true;
    let complete;
    mockStorage.getItem.mockImplementation((_key, callback) => { complete = callback; return new Promise(() => {}); });
    const wrapper = mount(OrderItemCustomizationForm, { propsData: { draftOrderItem: { id: 42, status_id: 1 }, product: { id: 1, customizations: [mockOption] }, title: 'Item' }, mocks: { $t: value => value }, stubs });
    try {
      await flush();
      const widget = wrapper.findComponent({ name: 'ProductionTimeTimelineWidget' });
      expect(widget.text()).toContain('Loading delivery options');
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(widget.emitted('widget-busy-changed')).toBeUndefined();
      complete(null, { customizationState: [{ customization_id: 'production', value: 'rush' }] });
      await flush();
      expect(mockState.value[0].value).toBe('rush');
      expect(widget.text()).toContain('International Rush');
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(widget.emitted('widget-busy-changed')).toBeUndefined();
    } finally { wrapper.destroy(); }
  });

  it.each(['country-first', 'draft-first'])('preserves a restored Rush with %s readiness', async order => {
    let complete;
    mockStorage.getItem.mockImplementation((_key, callback) => { complete = callback; return new Promise(() => {}); });
    const wrapper = mount(VerticalStepsForm, { propsData: { product: { id: 1, sku: 'test', name: 'Test' }, canUsePersistedCustomizationState: true }, mocks: { $t: value => value }, stubs });
    try {
      await flush();
      expect(mockUpdate).not.toHaveBeenCalled();
      if (order === 'country-first') { mockStore.getters.settled = true; await flush(); }
      complete(null, { customizationState: [{ customization_id: 'production', value: 'rush' }] });
      await flush();
      if (order === 'draft-first') { expect(mockUpdate).not.toHaveBeenCalled(); mockStore.getters.settled = true; }
      await flush();
      expect(mockState.value[0].value).toBe('rush');
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(wrapper.text()).toContain('International Rush');
    } finally { wrapper.destroy(); }
  });

  it.each(['location', 'restoration'])('blocks vertical form submit while %s is pending', async pending => {
    mockState.value = [{ customization_id: 'production', value: 'rush' }];
    mockStore.getters.settled = pending !== 'location';
    let complete;
    mockStorage.getItem.mockImplementation((_key, callback) => { complete = callback; if (pending !== 'restoration') callback(null, null); return new Promise(() => {}); });
    const wrapper = mount(VerticalStepsForm, { propsData: { product: { id: 1, sku: 'test', name: 'Test' }, canUsePersistedCustomizationState: true }, mocks: { $t: value => value }, stubs });
    try {
      await flush();
      expect((wrapper.vm as any).isSubmitButtonDisabled).toBe(true);
      await wrapper.find('form').trigger('submit'); await flush();
      expect(mockAddToCart).not.toHaveBeenCalled();
      if (pending === 'location') mockStore.getters.settled = true;
      else complete(null, null);
      await flush();
      expect((wrapper.vm as any).isSubmitButtonDisabled).toBe(false);
      await wrapper.find('form').trigger('submit'); await flush();
      expect(mockAddToCart).toHaveBeenCalledTimes(1);
    } finally { wrapper.destroy(); }
  });

  it('defaults and saves normally after an unreadable draft', async () => {
    mockStorage.getItem.mockRejectedValue(new Error('unavailable'));
    const wrapper = mount(VerticalStepsForm, { propsData: { product: { id: 1, sku: 'test', name: 'Test' }, canUsePersistedCustomizationState: true }, mocks: { $t: value => value }, stubs });
    try {
      await flush(); expect(mockUpdate).not.toHaveBeenCalled();
      mockStore.getters.settled = true; await flush();
      expect(mockUpdate).toHaveBeenCalledWith({ customizationId: 'production', value: standard });
      expect(mockStorage.setItem).toHaveBeenCalled();
    } finally { wrapper.destroy(); }
  });

  it('keeps a valid Rush and permits location changes after saved data is unavailable', async () => {
    mockState.value = [{ customization_id: 'production', value: 'rush' }];
    mockStorage.getItem.mockRejectedValue(new Error('unavailable'));
    const wrapper = mount(VerticalStepsForm, { propsData: { product: { id: 1, sku: 'test', name: 'Test' }, canUsePersistedCustomizationState: true }, mocks: { $t: value => value }, stubs });
    try {
      await flush();
      expect(mockUpdate).not.toHaveBeenCalled();
      mockStore.getters.settled = true;
      await flush();
      expect(wrapper.text()).toContain('International Rush');
      await wrapper.findComponent({ name: 'ProductionTimeTimelineWidget' }).find('button').trigger('click');
      await flush();
      expect(wrapper.text()).toContain('US Rush');
      expect(mockState.value[0].value).toBe('rush');
      expect(mockUpdate).not.toHaveBeenCalled();
    } finally { wrapper.destroy(); }
  });

  it('retains normal ADD_TO_CART choice and price when product data has isLocked', async () => {
    mockProductMode.value = true;
    mockValues.value.push({ id: 'international-rush', sku: 'international-sku', sn: 2, price: 35, isEnabled: true });
    const option = { ...mockOption, isLocked: true, optionData: { ...mockOption.optionData, values: mockValues.value, isRequired: true } };
    mockState.value = [{ customization_id: 'production', value: 'rush' }];
    mockStore.getters['budsies/getProductRushAddons'] = () => [{ id: '', isDomestic: false, text: 'International Standard', turnaroundTime: 10 }, { id: 'international-sku', isDomestic: false, text: 'International Rush', turnaroundTime: 4 }, { id: 'rush-sku', isDomestic: true, text: 'US Rush', turnaroundTime: 4 }];
    mockStorage.getItem.mockImplementation((_key, callback) => { callback(null, null); return Promise.resolve(null); });
    const price = { props: ['regular'], render (h) { return h('span', { class: 'test-total' }, `Total $${this.regular}`); } };
    const wrapper = mount(FormWithImagesGallery, { propsData: { product: { id: 1, sku: 'test', name: 'Test', customizations: [option] }, canUsePersistedCustomizationState: true, showGallery: false }, mocks: { $t: value => value }, stubs: { SfButton: true, MFormErrors: true, ACustomPrice: price, ACustomProductQuantity: true, MOrderSubmitAgreement: true, MProductDescriptionStory: true } });
    let submitted;
    mockAddToCart.mockImplementationOnce(async () => { submitted = mockState.value[0].value; });
    try {
      await flush(); expect(wrapper.props('customizationMode')).toBe('addToCart'); expect(mockUpdate).not.toHaveBeenCalled();
      mockStore.getters.settled = true; await flush();
      const widget = wrapper.findComponent({ name: 'ProductionTimeTimelineWidget' });
      expect(widget.props('values').map(value => value.id)).toEqual(mockValues.value.map(value => value.id));
      expect(mockState.value[0].value).toBe(standard);
      expect(widget.text()).toContain('+ $35');
      await widget.find('input[value="international-rush"]').setChecked(); await flush();
      expect(mockState.value[0].value).toBe('international-rush');
      expect(wrapper.find('.test-total').text()).toBe('Total $35');
      await wrapper.find('form').trigger('submit'); await flush();
      expect(submitted).toBe('international-rush');
    } finally { wrapper.destroy(); }
  });

  function mountWizard () {
    mockProductMode.value = true;
    mockStore.getters['product/getCurrentProduct'].customizations = [{ ...mockOption, optionData: { ...mockOption.optionData, values: mockValues.value } }];
    const validation = jest.requireActual('vee-validate');
    validation.extend('required', { ...require('vee-validate/dist/rules.umd.js').required, message: 'Required' });
    const steps = { name: 'SfSteps', props: ['active', 'steps', 'canGoBack'], provide () { const self = this; return { stepsData: { get index () { return self.active; }, get name () { return self.steps[self.active]; } } }; }, render (h) { return h('div', this.$slots.default); } };
    const heading = { props: ['title'], data: () => ({ field: '' }), render (h) { if (this.title !== 'Required') return h('span', this.title); return h(validation.ValidationProvider, { props: { rules: 'required', name: 'required-field' }, scopedSlots: { default: ({ validate }) => h('input', { attrs: { 'data-required': 'true' }, domProps: { value: this.field }, on: { input: event => { this.field = event.target.value; validate(event); } } }) } }); } };
    const button = { props: ['disabled'], render (h) { return h('button', { attrs: { disabled: this.disabled }, on: { click: event => this.$emit('click', event) } }, this.$slots.default); } };
    return mount(CreationWizardForm, { propsData: { plushieType: 'test', canUsePersistedCustomizationState: true }, mocks: { $t: value => value }, stubs: { SfSteps: steps, SfStep: ActualSfStep, SfButton: button, SfHeading: heading, SfModal: true, MProductTypeChooseStep: true, MBlockStory: true, MFormErrors: true, MOrderSubmitAgreement: true, ACustomProductQuantity: true } });
  }

  it.each(['country-first', 'draft-first'])('restores a later ADD_TO_CART wizard step with %s readiness', async order => {
    mockWizardMode.value = true;
    let complete;
    mockStorage.getItem.mockImplementation((_key, callback) => { complete = callback; return new Promise(() => {}); });
    const wrapper = mountWizard();
    try {
      await flush();
      expect(wrapper.props('customizationMode')).toBe('addToCart');
      expect((wrapper.vm as any).isSubmitButtonDisabled).toBe(true);
      await (wrapper.vm as any).onFormSubmit(); expect(mockAddToCart).not.toHaveBeenCalled();
      if (order === 'country-first') { mockStore.getters.settled = true; await flush(); }
      complete(null, { customizationState: [{ customization_id: 'production', value: 'rush' }], additionalData: { productSku: 'test', stepIndex: 2 } });
      await flush();
      expect(mockLoadProduct).toHaveBeenCalledWith('test');
      expect((wrapper.vm as any).currentStep).toBe(2);
      if (order === 'draft-first') {
        expect((wrapper.vm as any).isSubmitButtonDisabled).toBe(true);
        expect(wrapper.findComponent({ name: 'SfSteps' }).props('canGoBack')).toBe(true);
        wrapper.findComponent({ name: 'SfSteps' }).vm.$emit('change', 1); await flush();
        expect((wrapper.vm as any).currentStep).toBe(1);
        await (wrapper.vm as any).goToStep(2); await flush();
        mockStore.getters.settled = true;
      }
      await flush();
      expect(mockState.value[0].value).toBe('rush');
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(wrapper.findComponent({ name: 'ProductionTimeTimelineWidget' }).exists()).toBe(true);
      expect((wrapper.vm as any).isSubmitButtonDisabled).toBe(false);
      const input = wrapper.find('input[data-required]');
      expect(input.exists()).toBe(true);
      await (wrapper.vm as any).onContinueClick(); await flush();
      expect((wrapper.vm as any).currentStep).toBe(2);
      await input.setValue('present'); await (wrapper.vm as any).onContinueClick(); await flush();
      expect((wrapper.vm as any).currentStep).toBe(3);
      wrapper.findComponent({ name: 'SfSteps' }).vm.$emit('change', 1); await flush();
      expect((wrapper.vm as any).currentStep).toBe(1);
      expect(wrapper.find('input[value="rush"]').isVisible()).toBe(true);
    } finally { wrapper.destroy(); }
  });

  it.each(['empty', 'invalid'])('reconciles a restored later wizard step with a ready %s selection', async selection => {
    mockWizardMode.value = true;
    if (selection === 'invalid') mockStore.getters['budsies/getProductRushAddons'] = () => [{ id: '', isDomestic: false, text: 'International Standard', turnaroundTime: 10 }, { id: 'rush-sku', isDomestic: true, text: 'US Rush', turnaroundTime: 4 }];
    let complete;
    mockStorage.getItem.mockImplementation((_key, callback) => { complete = callback; return new Promise(() => {}); });
    const wrapper = mountWizard();
    try {
      await flush();
      complete(null, { customizationState: selection === 'empty' ? [] : [{ customization_id: 'production', value: 'rush' }], additionalData: { productSku: 'test', stepIndex: 2 } });
      await flush();
      expect((wrapper.vm as any).currentStep).toBe(2);
      expect((wrapper.vm as any).isSubmitButtonDisabled).toBe(true);
      expect(mockUpdate).not.toHaveBeenCalled();
      mockStore.getters.settled = true;
      await flush();
      expect(mockState.value[0].value).toBe(standard);
      expect(mockUpdate).toHaveBeenCalledWith({ customizationId: 'production', value: standard });
      expect((wrapper.vm as any).isSubmitButtonDisabled).toBe(false);
    } finally { wrapper.destroy(); }
  });
});
