import { computed, ComputedRef, Ref } from '@vue/composition-api';

import {
  Customization,
  CustomizationOptionValue,
  OptionValue
} from 'src/modules/customization-system';

export interface BulkRequestLeadSourcePayload {
  lead_source?: string,
  lead_source_other_details?: string
}

export const LEAD_SOURCE_CUSTOMIZATION_SKU = 'lead-source';
export const LEAD_SOURCE_OTHER_DETAILS_CUSTOMIZATION_SKU = 'lead_source_other_details';

export function useBulkRequestLeadSource (
  customizations: Ref<Customization[]>,
  customizationOptionValue: Ref<Record<string, CustomizationOptionValue>>,
  customizationAvailableOptionValues: Ref<Record<string, OptionValue[]>>
) {
  const leadSourceCustomization = computed<Customization | undefined>(() => {
    return customizations.value.find(
      (customization) => customization.optionData?.sku === LEAD_SOURCE_CUSTOMIZATION_SKU
    );
  });

  const leadSourceOtherDetailsCustomization = computed<Customization | undefined>(() => {
    return customizations.value.find(
      (customization) => customization.optionData?.sku === LEAD_SOURCE_OTHER_DETAILS_CUSTOMIZATION_SKU
    );
  });

  const leadSourceCustomizationId = computed<string | undefined>(() => {
    return leadSourceCustomization.value?.id;
  });

  const leadSourceOtherDetailsCustomizationId = computed<string | undefined>(() => {
    return leadSourceOtherDetailsCustomization.value?.id;
  });

  const leadSourceValue = computed<string | undefined>(() => {
    if (!leadSourceCustomizationId.value) {
      return;
    }

    const selectedValue = customizationOptionValue.value[leadSourceCustomizationId.value]

    if (!selectedValue) {
      return;
    }

    const selectedOptionValue = leadSourceCustomization.value?.optionData?.values?.find((item) => item.id === selectedValue);

    if (!selectedOptionValue) {
      return;
    }

    return selectedOptionValue.name;
  });

  const leadSourcePayload = computed<BulkRequestLeadSourcePayload>(() => {
    if (!leadSourceValue.value) {
      return {};
    }

    const payload: BulkRequestLeadSourcePayload = {
      lead_source: leadSourceValue.value
    };

    if (!leadSourceOtherDetailsCustomizationId.value) {
      return payload;
    }

    const otherDetails = customizationOptionValue.value[leadSourceOtherDetailsCustomizationId.value];

    if (otherDetails && typeof otherDetails === 'string') {
      payload.lead_source_other_details = otherDetails;
    }

    return payload;
  });

  const leadSourceCustomizationOptionValues: ComputedRef<OptionValue[]> = computed(() => {
    if (!leadSourceCustomization.value) {
      return [];
    }

    return customizationAvailableOptionValues.value[leadSourceCustomization.value.id] || [];
  });

  return {
    leadSourceCustomization,
    leadSourceOtherDetailsCustomization,
    leadSourcePayload,
    leadSourceCustomizationOptionValues
  };
}
