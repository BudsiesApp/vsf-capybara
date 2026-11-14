import { mount } from '@vue/test-utils';
import { i18nInjectionKey, routerInjectionKey, storeInjectionKey } from '@vue-storefront/core/application-services';
import AlterationProductForm from './alteration-product-form.vue';

jest.mock('@storefront-ui/vue', () => ({ SfButton: { render (h) { return h('button', { attrs: { type: 'submit' } }, this.$slots.default); } }, SfChevron: {}, SfHeading: {} }));
jest.mock('vee-validate', () => ({ ValidationObserver: { render (h) { return h('form', { on: { submit: (event) => { event.preventDefault(); this.$emit('submit'); } } }, this.$scopedSlots.default({ errors: {} })); } } }));
jest.mock('src/modules/orders-history', () => ({ canOrderItemHaveUpgrades: () => true }));
jest.mock('src/modules/customization-system', () => {
  const { computed, ref } = jest.requireActual('vue');
  return {
    ...jest.requireActual('src/modules/customization-system/types/option-type'),
    ...jest.requireActual('src/modules/customization-system/types/production-time-selector-standard-option-value-id'),
    ...jest.requireActual('src/modules/customization-system/types/is-file-upload-value.typeguard'),
    requiredCustomizationsFilter: () => true,
    useAvailableCustomizations: (customizations) => ({
      availableCustomizations: customizations,
      availableOptionValues: ref([]),
      customizationAvailableOptionValues: computed(() => Object.fromEntries(customizations.value.map((item) => [item.id, item.optionData.values])))
    }),
    useAvailableOptionsValuesFilter: (values) => ({ filteredOptionValues: values, filteredOptionValuesIdsByCustomizationId: ref({}) }),
    useCustomizationsFilter: (customizations, values, filters) => ({ filteredCustomizations: computed(() => customizations.value.filter((item) => filters.every((filter) => filter(item, values.value[item.id])))) }),
    useCustomizationsBundleOptions: () => ({ bundleOptions: ref([]) }),
    useCustomizationsOptionsDefaultValue: () => {},
    useCustomizationState: () => {
      const values = ref({});
      return { addCustomizationOptionValue: jest.fn(), customizationOptionValue: values, customizationState: ref([]), existingCartItemCustomizationOptionValue: ref({}), removeCustomizationOptionValue: jest.fn(), selectedOptionValuesIds: computed(() => Object.values(values.value)), updateCustomizationOptionValue: ({ customizationId, value }) => { require('vue').set(values.value, customizationId, value); } };
    },
    useEntityBusyState: () => ({ isSomeEntityBusy: ref(false), onEntityBusyChanged: jest.fn() }),
    useExistingCartItemOptionValues: () => ({ addedToCartOptionValueId: ref({}) }),
    useOptionValueActions: () => ({ executeActionsByCustomizationIdAndCustomizationOptionValue: jest.fn() })
  };
});
jest.mock('theme/helpers/use-order-item-and-alteration-product-mapping', () => {
  const { ref } = jest.requireActual('vue');
  return { useOrderItemAndAlterationProductMapping: () => ({ alterationCustomizationByOriginalId: ref({}), alterationCustomizationByExtraChargeId: ref({}), alterationOptionValueByOriginalIdByCustomizationId: ref({}), alterationOptionValueByExtraChargeIdByCustomizationId: ref({}) }) };
});
const mockAdd = jest.fn().mockResolvedValue(undefined);
jest.mock('theme/helpers/use-add-to-cart', () => ({ useAddToCart: () => ({ addToCartHandler: mockAdd, isSubmitting: require('vue').ref(false) }) }));
jest.mock('theme/helpers/use-existing-cart-item', () => ({ useExistingCartItem: () => ({ existingCartItem: require('vue').ref(undefined) }) }));
jest.mock('theme/helpers/use-collapsed-customizations-view', () => ({ useCollapsedCustomizationsView: (items) => ({ collapsedViewItemsByCustomization: require('vue').computed(() => Object.fromEntries(items.value.map((item) => [item.id, { isCustomizationFullyHidden: false, hiddenOptionValues: {} }]))), hasMore: require('vue').ref(false) }) }));
jest.mock('theme/helpers/use-form-validation', () => ({ getNestedFormRefs: jest.fn(), useFormValidation: () => ({ validateAndGoToFirstError: jest.fn().mockResolvedValue(true), goToFieldByName: jest.fn() }) }));
jest.mock('theme/components/customization-system/customization-option.vue', () => ({ name: 'CustomizationOption', props: ['customization'], render (h) { return h('div', { on: { click: () => this.$emit('input', { customizationId: this.customization.id, value: 'extra-value' }) } }, this.customization.name); } }));
jest.mock('theme/components/molecules/m-form-errors.vue', () => ({ render: h => h('div') }));
jest.mock('theme/components/organisms/o-product-card.vue', () => ({ render: h => h('div') }));

const production = (values: any[]) => ({ id: 'production', name: 'Production Time', optionData: { type: 'production_time_upgrade', values } });
const extra = { id: 'extra', name: 'Extra Photos', optionData: { type: 'extra_photos_upgrade', values: [{ id: 'extra-value' }] } };
const standard = { id: 'production_time_selector_standard_option' };

function renderForm (values: any[], states: any[] = []) {
  return mount(AlterationProductForm, {
    propsData: { isExpandable: false, orderItem: { quantity: 1, extension_attributes: { customization_states: states } }, alterationProduct: { id: 831, customizations: [production(values), extra] } },
    provide: { [storeInjectionKey as symbol]: { getters: {}, dispatch: jest.fn() }, [i18nInjectionKey as symbol]: { t: (s: string) => s }, [routerInjectionKey as symbol]: { push: jest.fn() } },
    mocks: { $t: (s: string) => s }
  });
}

describe('alteration Production Time section', () => {
  it('hides empty Production Time while another upgrade reaches the cart handler', async () => {
    const wrapper = renderForm([standard]);
    expect(wrapper.text()).not.toContain('Production Time');
    expect(wrapper.text()).toContain('Extra Photos');
    await wrapper.findComponent({ name: 'CustomizationOption' }).trigger('click');
    await wrapper.find('form').trigger('submit');
    await Promise.resolve();
    await Promise.resolve();
    expect(mockAdd).toHaveBeenCalled();
    wrapper.destroy();
  });

  it('hides purchased-only Production Time and keeps an eligible one visible', async () => {
    const purchased = renderForm([standard, { id: 'rush' }], [{ customization_id: 'production', value: 'rush' }]);
    expect(purchased.text()).not.toContain('Production Time');
    purchased.destroy();
    const eligible = renderForm([standard, { id: 'rush' }]);
    expect(eligible.text()).toContain('Production Time');
    expect(eligible.text()).toContain('Extra Photos');
    eligible.destroy();
  });
});
