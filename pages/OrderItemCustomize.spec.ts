import { createLocalVue, mount } from '@vue/test-utils';
import Vue, { ref } from 'vue';
import Vuex from 'vuex';

import {
  i18nInjectionKey,
  routeInjectionKey,
  routerInjectionKey,
  storeInjectionKey
} from '@vue-storefront/core/application-services';

import { BudsieStatus } from 'src/modules/shared';

import { LayoutType } from 'theme/helpers/use-product-form-layout';

import OrderItemCustomize from './OrderItemCustomize.vue';

let mockProduct: any;
let mockDraft: any;
const mockCustomizeActionArgs: unknown[][] = [];

jest.mock('@vue-storefront/core/lib/logger', () => ({ Logger: { error: jest.fn(() => jest.fn()), warn: jest.fn(() => jest.fn()), info: jest.fn(() => jest.fn()) } }));
jest.mock('@vue-storefront/core/i18n', () => ({ t: (key: string) => key }));
jest.mock('@vue-storefront/core/lib/sync', () => ({ TaskQueue: { execute: jest.fn() } }));
jest.mock('@vue-storefront/core/modules/catalog/store/product/mutation-types', () => ({ PRODUCT_UNSET_CURRENT: 'PRODUCT_UNSET_CURRENT' }));
jest.mock('@storefront-ui/vue', () => {
  const passthrough = (name: string) => ({ name, render (h: any) { return h('div', this.$slots.default); } });
  return {
    SfButton: passthrough('SfButton'),
    SfHeading: { name: 'SfHeading', props: { title: String }, render (h: any) { return h('h2', this.title); } },
    SfSteps: passthrough('SfSteps'),
    SfStep: passthrough('SfStep')
  };
});
jest.mock('vee-validate', () => ({
  extend: jest.fn(),
  ValidationObserver: { name: 'ValidationObserver', render (h: any) { return h('div', this.$scopedSlots.default ? this.$scopedSlots.default({ errors: {} }) : this.$slots.default); } },
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
    ...jest.requireActual(`${base}/helpers/is-image-upload-customization`),
    ...jest.requireActual(`${base}/types/customization-type`),
    ...jest.requireActual(`${base}/types/is-file-upload-value.typeguard`),
    ...jest.requireActual(`${base}/types/customizable-product-flow.type`),
    ...jest.requireActual(`${base}/types/widget-type`),
    useLockedCustomizations: jest.requireActual(`${base}/composables/use-locked-customizations`).useLockedCustomizations,
    LockedCustomizationsFilterType: jest.requireActual(`${base}/composables/use-locked-customizations`).FilterType,
    useHolidayDeliveryLocation: () => ({ ready: Promise.resolve() }),
    useCustomizationsBundleOptions: () => ({ bundleOptions: ref([]) }),
    useCustomizationsOptionsDefaultValue: () => undefined,
    useCustomizationsPrice: () => ({ totalPrice: ref({}) }),
    useCustomizationProductDescription: () => ({ descriptionProductSku: ref('pet') }),
    useCustomizationStatePreservation: () => ({ removePreservedState: jest.fn(), restorationSettled: ref(true) }),
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
jest.mock('theme/helpers/use-customize-action', () => ({
  useCustomizeAction: (...args: unknown[]) => {
    mockCustomizeActionArgs.push(args);
    return { confirmCustomization: jest.fn(), isSubmitting: ref(false) };
  }
}));

jest.mock('theme/components/customization-system/customization-option.vue', () => ({
  name: 'CustomizationOption',
  props: { customization: Object },
  render (h: any) { return h('div', { class: '_field', attrs: { 'data-field': this.customization.id } }); }
}));
jest.mock('theme/components/customization-system/forms/creation-wizard-form-last-step.vue', () => ({
  name: 'CreationWizardFormLastStep',
  props: { availableCustomizations: Array, lockedCustomizations: Array },
  render (h: any) {
    const fields = (list: any[] = [], source: string) => list.map(item => h('div', { class: '_field', attrs: { 'data-field': item.id, 'data-source': source } }));
    return h('div', [...fields(this.availableCustomizations, 'last'), ...fields(this.lockedCustomizations, 'locked')]);
  }
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

async function render (layout: LayoutType, statusId: number, imageIds: string[]) {
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
  const store = {
    dispatch: jest.fn().mockResolvedValue(undefined),
    commit: jest.fn(),
    getters: { 'product/getCurrentProduct': mockProduct, 'user/getUserToken': 'token' }
  };
  const localVue = createLocalVue();
  localVue.use(Vuex);
  localVue.component('SfStep', { name: 'SfStep', render (h: any) { return h('div', this.$slots.default); } });
  const wrapper = mount(OrderItemCustomize, {
    localVue,
    propsData: { sku: 'pet', orderItemId: '42', orderId: '1', layout, plushieType: 'forevers' },
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
  mockCustomizeActionArgs.length = 0;
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

  it('passes the product customizations to the save helper', async () => {
    await render(layout, BudsieStatus.AWAITING_ARTWORK, ['photos']);

    const productCustomizations = mockCustomizeActionArgs[0][2] as { value: { id: string }[] };
    expect(productCustomizations.value.map(item => item.id)).toEqual(mockProduct.customizations.map((item: { id: string }) => item.id));
  });

  it('keeps all fields for Awaiting customization', async () => {
    const wrapper = await render(layout, BudsieStatus.AWAITING_CUSTOMIZATION, ['photos']);

    const expected = isWizard
      ? ['name', 'photos', 'size']
      : ['locked-size', 'loose-name', 'loose-photo', 'name', 'photos', 'size'];
    expect(fieldIds(wrapper, '._field:not([data-source="locked"])').sort()).toEqual(expected);
    if (isWizard) {
      expect(fieldIds(wrapper, '[data-source="locked"]')).toEqual(['locked-size']);
    }
  });

  if (isWizard) {
    it('keeps the Upgrades step for Awaiting artwork', async () => {
      const wrapper = await render(layout, BudsieStatus.AWAITING_ARTWORK, ['photos']);

      expect(wrapper.find('._upgrades').exists()).toBe(true);
    });
  }
});
