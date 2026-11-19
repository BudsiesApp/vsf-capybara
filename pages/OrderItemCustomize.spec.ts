import { createLocalVue, mount } from '@vue/test-utils';
import Vue, { onMounted, ref } from 'vue';
import Vuex from 'vuex';

import {
  i18nInjectionKey,
  routeInjectionKey,
  routerInjectionKey,
  storeInjectionKey
} from '@vue-storefront/core/application-services';

import { BudsieStatus } from 'src/modules/shared';
import { saveOrderItemCustomizationsState, submitOrderItemCustomizationsState } from 'src/modules/customization-system';
import { PersistedData } from 'src/modules/customization-system/types/persisted-data.interface';

import { LayoutType } from 'theme/helpers/use-product-form-layout';

import OrderItemCustomize from './OrderItemCustomize.vue';

let mockProduct: any;
let mockDraft: any;
let mockRestoredData: PersistedData | undefined;

jest.mock('@vue-storefront/core/lib/logger', () => ({ Logger: { error: jest.fn(() => jest.fn()), warn: jest.fn(() => jest.fn()), info: jest.fn(() => jest.fn()) } }));
jest.mock('@vue-storefront/core/i18n', () => ({ t: (key: string) => key }));
jest.mock('@vue-storefront/core/lib/sync', () => ({ TaskQueue: { execute: jest.fn() } }));
jest.mock('@vue-storefront/core/modules/catalog/store/product/mutation-types', () => ({ PRODUCT_UNSET_CURRENT: 'PRODUCT_UNSET_CURRENT' }));
jest.mock('@storefront-ui/vue', () => {
  const passthrough = (name: string) => ({ name, render (h: any) { return h('div', { on: this.$listeners }, this.$slots.default); } });
  return {
    SfButton: passthrough('SfButton'),
    SfHeading: { name: 'SfHeading', props: { title: String, level: Number }, render (h: any) { return h(`h${this.level || 2}`, this.title); } },
    SfSteps: {
      name: 'SfSteps', props: { steps: Array, active: Number },
      provide () { return { stepsState: this }; },
      render (h: any) { return h('div', this.$slots.default); }
    },
    SfModal: passthrough('SfModal'),
    SfInput: passthrough('SfInput')
  };
});
jest.mock('vee-validate', () => ({
  extend: jest.fn(),
  ValidationObserver: { name: 'ValidationObserver', methods: { validate: () => Promise.resolve(true) }, render (h: any) { return h('div', this.$scopedSlots.default ? this.$scopedSlots.default({ errors: {} }) : this.$slots.default); } },
  ValidationProvider: { name: 'ValidationProvider', render (h: any) { return h('div'); } }
}));
jest.mock('@vue-storefront/core/helpers', () => ({ isServer: false }));
jest.mock('vee-validate/dist/rules', () => ({ email: {}, required: {} }));
jest.mock('config', () => ({ products: {} }), { virtual: true });

jest.mock('src/modules/shared', () => ({
  ...jest.requireActual('src/modules/shared/types/budsie-status'),
  ...jest.requireActual('src/modules/shared/types/product-purchase-flow.type'),
  emitPageRenderedEvent: jest.fn()
}));
jest.mock('src/modules/customization-system', () => {
  const base = 'src/modules/customization-system';
  return {
    ...jest.requireActual(`${base}/composables/use-available-customizations`),
    ...jest.requireActual(`${base}/composables/use-purchase-flow-customizations`),
    ...jest.requireActual(`${base}/composables/use-available-options-values-filter`),
    ...jest.requireActual(`${base}/composables/use-entity-busy-state`),
    ...jest.requireActual(`${base}/composables/use-customizations-filter`),
    ...jest.requireActual(`${base}/composables/use-awaiting-artwork-customizations-filter`),
    ...jest.requireActual(`${base}/composables/use-customizations-groups`),
    ...jest.requireActual(`${base}/composables/use-customization-state`),
    ...jest.requireActual(`${base}/composables/use-option-value-actions`),
    ...jest.requireActual(`${base}/helpers/required-customizations-filter`),
    ...jest.requireActual(`${base}/helpers/filter-customization-state`),
    saveOrderItemCustomizationsState: jest.fn().mockResolvedValue({ errors: [] }),
    submitOrderItemCustomizationsState: jest.fn().mockResolvedValue({ errors: [] }),
    ...jest.requireActual(`${base}/helpers/is-image-upload-customization`),
    ...jest.requireActual(`${base}/types/customization-type`),
    ...jest.requireActual(`${base}/types/is-file-upload-value.typeguard`),
    ...jest.requireActual(`${base}/types/customizable-product-flow.type`),
    ...jest.requireActual(`${base}/types/widget-type`),
    useLockedCustomizations: jest.requireActual(`${base}/composables/use-locked-customizations`).useLockedCustomizations,
    LockedCustomizationsFilterType: jest.requireActual(`${base}/composables/use-locked-customizations`).FilterType,
    useHolidayDeliveryLocation: () => ({ ready: Promise.resolve() }),
    useCustomizationsBundleOptions: () => ({ bundleOptions: ref([]) }),
    ...jest.requireActual(`${base}/composables/use-customizations-options-default-value`),
    useCustomizationsPrice: () => ({ totalPrice: ref({}) }),
    useCustomizationProductDescription: () => ({ descriptionProductSku: ref('pet') }),
    useCustomizationStatePreservation: (...args: Parameters<typeof import('src/modules/customization-system/composables/use-customization-state-preservation').useCustomizationStatePreservation>) => {
      const restoredData = mockRestoredData;
      if (restoredData) {
        onMounted(() => {
          args[5](restoredData.customizationState);
          args[6]();
          args[8](restoredData);
        });
      }
      return { removePreservedState: jest.fn(), restorationSettled: ref(true) };
    },
    useSelectedOptionValueUrlQuery: () => ({ unhandledCustomizationsFilter: () => true }),
    useEmailCustomization: () => ({ emailCustomizationFilter: () => true, persistCustomerEmail: jest.fn(), emailValue: ref('') })
  };
});
jest.mock('src/modules/a-b-testing', () => ({ useABTestingCustomizationsFilter: () => ({ customizationFilter: () => true }) }));
jest.mock('src/modules/vsf-storyblok-module', () => ({ useStoryblokReadinessTracker: () => ({ onStoryRendered: jest.fn() }) }));
jest.mock('src/modules/orders-history', () => ({
  useOrderDetails: () => ({
    order: ref({ items: [{ item_id: 42, extension_attributes: { alteration_product: { sku: 'upgrade' } } }] }),
    isLoading: ref(false),
    loadOrder: jest.fn()
  })
}));
jest.mock('@vue-storefront/core/additional-content', () => ({
  AdditionalContentOutlet: { PRIVACY_POLICY_LINKS: 'privacy' },
  useAdditionalContent: () => ref([])
}));

jest.mock('theme/helpers/use-form-page-readiness', () => ({ useFormPageReadiness: () => ({ onStoryRendered: jest.fn(), onFormReady: jest.fn() }) }));
jest.mock('theme/helpers/use-order-item-alteration-product-loader', () => ({ useOrderItemAlterationProductLoader: () => ({ alterationProduct: ref({ sku: 'upgrade' }) }) }));
jest.mock('theme/helpers/use-product-page', () => ({ useProductPage: () => ({ currentProduct: ref(mockProduct), isDataLoaded: ref(true) }) }));
jest.mock('theme/helpers/use-draft-order-item', () => ({ useDraftOrderItem: () => ({ draftOrderItem: ref(mockDraft), isDataLoaded: ref(true) }) }));
jest.mock('theme/helpers/use-add-to-cart', () => ({ useAddToCart: () => ({ addToCartHandler: jest.fn(), isSubmitting: ref(false) }) }));
jest.mock('theme/helpers/use-bulk-images-upload', () => ({ useBulkImagesUpload: () => ({}) }));
jest.mock('theme/helpers/use-image-upload', () => ({ useImageUpload: () => ({ uploadImage: jest.fn() }) }));
jest.mock('theme/helpers/use-product-gallery', () => ({ useProductGallery: () => ({ galleryImages: ref([]) }) }));
jest.mock('theme/helpers/use-floating-photo', () => ({ useFloatingPhoto: () => ({ floatingPhotoUrl: ref(undefined), floatingPhotoText: ref('') }) }));
jest.mock('theme/helpers/use-creation-wizard-gtm-events', () => ({ useCreationWizardGtmEvents: () => ({ onStepSubmit: jest.fn() }) }));
jest.mock('theme/helpers/use-creation-wizard-preselected-size', () => ({ useCreationWizardPreselectedSize: () => ({ handlePreselectedSize: jest.fn() }) }));
jest.mock('theme/helpers/use-creation-wizard-product-type-step', () => ({ useCreationWizardProductTypeStep: () => ({ isProductLoading: ref(false), loadProduct: jest.fn(), setProductType: jest.fn() }) }));
jest.mock('theme/components/customization-system/customization-option.vue', () => ({
  name: 'CustomizationOption',
  props: { customization: Object, value: [Array, String] },
  render (h: any) { return h('div', { class: '_field', attrs: { 'data-field': this.customization.id, 'data-value': JSON.stringify(this.value), 'data-source': this.$attrs['is-disabled'] ? 'locked' : 'last' } }); }
}));
jest.mock('theme/components/customization-system/forms/order-item-customize-upgrades-step.vue', () => ({ name: 'Upgrades', render: (h: any) => h('div', { class: '_upgrades' }) }));
jest.mock('theme/components/molecules/m-block-story.vue', () => ({ name: 'MBlockStory', render: (h: any) => h('div') }));
jest.mock('theme/components/molecules/m-form-errors.vue', () => ({ name: 'MFormErrors', render: (h: any) => h('div') }));
jest.mock('theme/components/molecules/m-order-submit-agreement.vue', () => ({ name: 'MOrderSubmitAgreement', render: (h: any) => h('div') }));
jest.mock('theme/components/molecules/m-product-description-story.vue', () => ({ name: 'MProductDescriptionStory', render: (h: any) => h('div') }));
jest.mock('theme/components/molecules/m-zoom-gallery.vue', () => ({ name: 'MZoomGallery', render: (h: any) => h('div') }));
jest.mock('theme/components/atoms/a-custom-price.vue', () => ({ name: 'ACustomPrice', render: (h: any) => h('div') }));
jest.mock('theme/components/atoms/a-custom-product-quantity.vue', () => ({ name: 'ACustomProductQuantity', render: (h: any) => h('div') }));
jest.mock('theme/components/organisms/OPlushieCreationWizard/m-floating-photo.vue', () => ({ name: 'MFloatingPhoto', render: (h: any) => h('div') }));
jest.mock('theme/components/organisms/OPlushieCreationWizard/m-product-type-choose-step.vue', () => ({ name: 'MProductTypeChooseStep', render: (h: any) => h('div') }));
jest.mock('theme/components/customization-system/forms/placeholders/form-with-images-gallery-placeholder.vue', () => ({ render: (h: any) => h('div') }));
jest.mock('theme/components/customization-system/forms/placeholders/vertical-steps-form-placeholder.vue', () => ({ render: (h: any) => h('div') }));
jest.mock('theme/components/customization-system/forms/placeholders/phrase-pillow-form-placeholder.vue', () => ({ render: (h: any) => h('div') }));
jest.mock('theme/components/customization-system/forms/placeholders/creation-wizard-form-placeholder.vue', () => ({ render: (h: any) => h('div') }));

const flowAvailability = ['customize-now', 'customize-later-purchase', 'customize-later-completion'];
const photo = { id: 'p', url: '/p.jpg' };

function option (id: string, displayWidget: string, parentId?: string) {
  return {
    id,
    parentId,
    type: 'option',
    name: id,
    sn: 1,
    isEnabled: true,
    isLocked: false,
    showInCart: true,
    availabilityRules: {},
    flowAvailability,
    optionData: { displayWidget, isRequired: false, values: [{ id: `${id}-value`, isEnabled: true, isDefault: false, sn: 1 }, { id: `${id}-other`, isEnabled: true, isDefault: false, sn: 2 }] },
    variants: []
  };
}

function group (id: string) {
  return { id, type: 'options_group', name: id, sn: 0, isEnabled: true, isLocked: false, showInCart: false, availabilityRules: {}, flowAvailability };
}

function makeProduct (imageIds: string[]) {
  return {
    id: 7,
    sku: 'pet',
    name: 'Pet',
    customizations: [
      group('step'),
      ...imageIds.map(id => option(id, 'image_upload', 'step')),
      option('name', 'text_input', 'step'),
      option('size', 'select', 'step'),
      { ...option('locked-size', 'select', 'step'), isLocked: true },
      option('loose-photo', 'image_upload'),
      option('loose-name', 'text_input')
    ]
  };
}

const photoGroupId = '01b4f3aa-a1bc-4707-9dff-85cbf8e672ec';
const petInfoGroupId = '81cbfa57-121e-499e-afba-9c21cee59f37';
const nameId = '25dcd8a5-d67e-4151-b17c-85badd061f24';
const imageId = 'f6971232-0087-4f14-9823-5f9bbfe32cff';
const uploadMethodId = '0e5ef79e-1d82-414c-96a8-004a4f836442';
const noId = '2479f37d-b3f6-4f0c-be13-c5688b0bbb62';
const yesId = '2ba58d1b-e8a2-48f0-aede-0f901186e828';

const foreversCustomizations = [
  { ...group(photoGroupId), name: 'Photo', sn: 1 },
  {
    ...option(imageId, 'image_upload', photoGroupId), name: 'Customer Image',
    availabilityRules: { forActivatedOptionValueIds: [noId] },
    optionData: { displayWidget: 'image_upload', isRequired: true, values: [] }
  },
  {
    ...option(uploadMethodId, 'checkbox', photoGroupId), name: 'Send Later Upload Method', sn: 2,
    optionData: {
      displayWidget: 'checkbox', isRequired: true,
      values: [
        { id: noId, name: 'No', isDefault: true, isEnabled: true, sn: 2 },
        { id: yesId, name: 'Yes', isDefault: false, isEnabled: true, sn: 1 }
      ]
    }
  },
  { ...group(petInfoGroupId), name: 'Pet Info', sn: 2 },
  {
    ...option(nameId, 'text_input', petInfoGroupId), name: 'Name', sn: 4,
    optionData: { displayWidget: 'text_input', isRequired: true, values: [] }
  }
];

async function render (layout: LayoutType, statusId: number, imageIds: string[], forevers = false, plushieType = 'forevers') {
  mockProduct = makeProduct(imageIds);
  mockDraft = {
    id: 42,
    status_id: statusId,
    customization_state: [
      { customization_id: 'name', value: 'Rex', quantity: 1 },
      { customization_id: 'locked-size', value: 'locked-size-value', quantity: 1 },
      ...imageIds.map(id => ({ customization_id: id, value: [photo], quantity: 1 }))
    ]
  };
  if (forevers) {
    mockProduct.customizations = JSON.parse(JSON.stringify(foreversCustomizations));
    mockDraft.customization_state = [
      { customization_id: uploadMethodId, value: yesId, quantity: 1 },
      { customization_id: imageId, value: [photo], quantity: 1 }
    ];
  }
  const store = {
    dispatch: jest.fn().mockResolvedValue(undefined),
    commit: jest.fn(),
    getters: { 'product/getCurrentProduct': mockProduct, 'user/getUserToken': 'token' }
  };
  const localVue = createLocalVue();
  localVue.use(Vuex);
  localVue.component('SfStep', {
    name: 'SfStep', props: { name: { type: String, required: true } }, inject: ['stepsState'],
    render (h: any) {
      const state = this.stepsState as any;
      return state.steps[state.active] === this.name ? h('div', { attrs: { 'data-active-step': this.name } }, this.$slots.default) : h();
    }
  });
  const wrapper = mount(OrderItemCustomize, {
    localVue,
    propsData: { sku: 'pet', orderItemId: '42', orderId: '1', layout, plushieType },
    provide: {
      [storeInjectionKey as symbol]: store,
      [routerInjectionKey as symbol]: { push: jest.fn(), replace: jest.fn() },
      [routeInjectionKey as symbol]: { query: {}, params: {}, path: '/' },
      [i18nInjectionKey as symbol]: { t: (key: string) => key }
    },
    mocks: { $store: store, $t: (key: string) => key, $route: { query: {} } }
  });
  for (let i = 0; i < 30; i++) await Vue.nextTick();
  return wrapper;
}

const fieldIds = (wrapper: any, selector = '._field') =>
  wrapper.findAll(selector).wrappers.map((field: any) => field.attributes('data-field'));

beforeEach(() => {
  mockRestoredData = undefined;
  jest.mocked(saveOrderItemCustomizationsState).mockClear();
  jest.mocked(submitOrderItemCustomizationsState).mockClear();
  jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
});

const groupedFields = (imageIds: string[]) => [...imageIds].sort();

describe.each([
  [LayoutType.CREATION_WIZARD],
  [LayoutType.WITH_IMAGES_GALLERY]
])('OrderItemCustomize in %s layout', (layout) => {
  const isWizard = layout === LayoutType.CREATION_WIZARD;

  it.each([[['photos']], [['photos', 'extra-photos']]])('offers only image upload fields for Awaiting artwork (%p)', async (imageIds) => {
    const wrapper = await render(layout, BudsieStatus.AWAITING_ARTWORK, imageIds);

    // The wizard renders only grouped fields; the gallery also renders ungrouped ones.
    const expected = isWizard ? groupedFields(imageIds) : groupedFields([...imageIds, 'loose-photo']);
    expect(fieldIds(wrapper).sort()).toEqual(expected);
    expect(wrapper.findAll('[data-source="locked"]')).toHaveLength(0);
    expect(mockProduct.customizations).toHaveLength(imageIds.length + 6);
    expect(mockDraft.customization_state).toHaveLength(imageIds.length + 2);
  });

  it('keeps all fields for Awaiting customization', async () => {
    const wrapper = await render(layout, BudsieStatus.AWAITING_CUSTOMIZATION, ['photos']);

    const expected = isWizard
      ? ['name', 'photos', 'size']
      : ['locked-size', 'loose-name', 'loose-photo', 'name', 'photos', 'size'];
    expect(fieldIds(wrapper, isWizard ? '._field:not([data-source="locked"])' : '._field').sort()).toEqual(expected);
    if (isWizard) {
      expect(fieldIds(wrapper, '[data-source="locked"]')).toEqual(['locked-size']);
    }
  });

  if (isWizard) {
    it('keeps the Upgrades step for Awaiting artwork', async () => {
      const wrapper = await render(layout, BudsieStatus.AWAITING_ARTWORK, ['photos']);

      expect(wrapper.findComponent({ name: 'SfSteps' }).props('steps')).toContain('Upgrades');
    });
  }
});

it.each([LayoutType.CREATION_WIZARD, LayoutType.WITH_IMAGES_GALLERY])('retains the draft photo in %s', async layout => {
  const errors = jest.spyOn(console, 'error');
  const wrapper = await render(layout, BudsieStatus.AWAITING_ARTWORK, [], true);
  const productBefore = JSON.stringify(mockProduct);
  const draftBefore = JSON.stringify(mockDraft);
  expect(fieldIds(wrapper)).toEqual([imageId]);
  expect(JSON.parse(wrapper.find(`[data-field="${imageId}"]`).attributes('data-value'))).toEqual([photo]);
  if (layout === LayoutType.CREATION_WIZARD) {
    expect(wrapper.findComponent({ name: 'SfSteps' }).props('steps')).toEqual(['Photo', 'Upgrades']);
    expect(wrapper.find('[data-active-step="Photo"]').exists()).toBe(true);
    await wrapper.find('._add-to-cart').trigger('click');
    for (let i = 0; i < 10; i++) await Vue.nextTick();
    expect(wrapper.find('[data-active-step="Upgrades"] ._upgrades').exists()).toBe(true);
    expect(wrapper.find('[data-active-step="Photo"]').exists()).toBe(false);
    expect(saveOrderItemCustomizationsState).toHaveBeenCalledTimes(1);
    expect(saveOrderItemCustomizationsState).toHaveBeenCalledWith([{
      id: 42,
      customization_state: [{ customization_id: imageId, value: [photo], quantity: 1 }],
      status_id: BudsieStatus.AWAITING_ARTWORK
    }], 'token');
    expect(submitOrderItemCustomizationsState).toHaveBeenCalledTimes(1);
    expect(submitOrderItemCustomizationsState).toHaveBeenCalledWith([42], 'token');
    expect(jest.mocked(saveOrderItemCustomizationsState).mock.invocationCallOrder[0])
      .toBeLessThan(jest.mocked(submitOrderItemCustomizationsState).mock.invocationCallOrder[0]);
  }
  expect(JSON.stringify(mockProduct)).toBe(productBefore);
  expect(JSON.stringify(mockDraft)).toBe(draftBefore);
  expect(mockDraft.customization_state).toEqual([
    { customization_id: uploadMethodId, value: yesId, quantity: 1 },
    { customization_id: imageId, value: [photo], quantity: 1 }
  ]);
  expect(mockProduct.customizations).toEqual(foreversCustomizations);
  expect(errors).not.toHaveBeenCalled();
  errors.mockRestore();
  wrapper.destroy();
});

it('opens Awaiting artwork on Photo with its restored photo despite a saved later position', async () => {
  const restoredPhoto = { id: 'restored-photo', url: '/restored-photo.jpg' };
  mockRestoredData = {
    customizationState: [{ customization_id: imageId, value: [restoredPhoto], quantity: 1 }],
    additionalData: { stepIndex: 1 }
  };
  const wrapper = await render(LayoutType.CREATION_WIZARD, BudsieStatus.AWAITING_ARTWORK, [], true);

  expect(wrapper.find('[data-active-step="Photo"]').exists()).toBe(true);
  expect(wrapper.find('[data-active-step="Upgrades"]').exists()).toBe(false);
  expect(JSON.parse(wrapper.find(`[data-field="${imageId}"]`).attributes('data-value'))).toEqual([restoredPhoto]);
  wrapper.destroy();
});

it.each([
  ['forevers', 'Forevers Plush'],
  ['golf-head-covers', 'Golf Head Covers']
])('uses status-specific headings for %s', async (type, label) => {
  for (const status of [BudsieStatus.AWAITING_ARTWORK, BudsieStatus.AWAITING_CUSTOMIZATION]) {
    const wrapper = await render(LayoutType.CREATION_WIZARD, status, ['photos'], false, type);
    const artwork = status === BudsieStatus.AWAITING_ARTWORK;
    expect(wrapper.find('h1').text()).toBe(`${artwork ? 'Upload Photos for Your' : 'Customize Your'} ${label}`);
    expect(wrapper.findComponent({ name: 'CreationWizardFormLastStep' }).props('title')).toBe(artwork ? 'Upload Photos of Your Pet' : undefined);
    expect(wrapper.find('._step-title').text()).toBe(artwork ? 'Upload Photos of Your Pet' : 'Customize your {productType}');
    wrapper.destroy();
  }
});
