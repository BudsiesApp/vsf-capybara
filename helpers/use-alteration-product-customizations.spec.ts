import { ref } from 'vue';
import { OptionType, PRODUCTION_TIME_SELECTOR_STANDARD_OPTION_VALUE_ID } from 'src/modules/customization-system';
import { useAlterationProductCustomizations } from './use-alteration-product-customizations';

jest.mock('src/modules/customization-system', () => ({
  ...jest.requireActual('src/modules/customization-system/types/option-type'),
  ...jest.requireActual('src/modules/customization-system/types/production-time-selector-standard-option-value-id'),
  ...jest.requireActual('src/modules/customization-system/types/is-file-upload-value.typeguard')
}));

const standard = { id: PRODUCTION_TIME_SELECTOR_STANDARD_OPTION_VALUE_ID } as any;
const rush = { id: 'rush' } as any;
const other = { id: 'other' } as any;
const production = { id: 'production', optionData: { type: OptionType.PRODUCTION_TIME, values: [standard, rush] } } as any;
const generic = { id: 'extra', optionData: { type: OptionType.GENERIC, values: [other] } } as any;

function setup (purchased: any[] = []) {
  const order = ref<any>({ extension_attributes: { customization_states: purchased } });
  const product = ref<any>({ customizations: [production, generic] });
  const dictionary = ref<any>({ production, extra: generic });
  const mapping = {
    alterationCustomizationByOriginalId: ref({}), alterationCustomizationByExtraChargeId: ref({}),
    alterationOptionValueByOriginalIdByCustomizationId: ref({}), alterationOptionValueByExtraChargeIdByCustomizationId: ref({})
  } as any;
  return useAlterationProductCustomizations(order, product, dictionary, mapping);
}

describe('alteration customization visibility', () => {
  it('hides a Production Time section containing only Standard, without hiding other customizations', () => {
    const filter = setup().customizationsFilter;
    expect(filter(production, [standard])).toBe(false);
    expect(filter(generic, [other])).toBe(true);
    expect(filter(production, [standard, rush])).toBe(true);
  });

  it('hides a section containing only Standard and an already-purchased upgrade', () => {
    const filter = setup([{ customization_id: 'production', value: 'rush' }]).customizationsFilter;
    expect(filter(production, [standard, rush])).toBe(false);
  });
});
