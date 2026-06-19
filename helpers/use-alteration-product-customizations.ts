import { computed, Ref } from '@vue/composition-api';

import Product from '@vue-storefront/core/modules/catalog/types/Product';

import {
  Customization,
  CustomizationOptionValue,
  isFileUploadValue,
  PRODUCTION_TIME_SELECTOR_STANDARD_OPTION_VALUE_ID,
  OptionValue
} from 'src/modules/customization-system';

import { OrderItem } from 'src/modules/orders-history';

import { OrderItemAndAlterationProductMapping } from './use-order-item-and-alteration-product-mapping';

export function useAlterationProductCustomizations (
  orderItem: Ref<OrderItem>,
  alterationProduct: Ref<Product | undefined>,
  alterationProductCustomizationDictionary: Ref<Record<string, Customization>>,
  mapping: OrderItemAndAlterationProductMapping
) {
  const {
    alterationCustomizationByOriginalId,
    alterationCustomizationByExtraChargeId,
    alterationOptionValueByOriginalIdByCustomizationId,
    alterationOptionValueByExtraChargeIdByCustomizationId
  } = mapping;

  const orderItemOptionValue = computed<Record<string, CustomizationOptionValue>>(() => {
    const result: Record<string, CustomizationOptionValue> = {};
    const orderItemExtensionAttributes = orderItem.value.extension_attributes;
    const _alterationCustomizationByOriginalId = alterationCustomizationByOriginalId.value;
    const _alterationCustomizationByExtraChargeId = alterationCustomizationByExtraChargeId.value;
    const _alterationOptionValueByOriginalIdByCustomizationId = alterationOptionValueByOriginalIdByCustomizationId.value;
    const _alterationOptionValueByExtraChargeIdByCustomizationId = alterationOptionValueByExtraChargeIdByCustomizationId.value;

    const alterationProductCustomizations = alterationProduct.value?.customizations;

    if (!orderItemExtensionAttributes || !alterationProductCustomizations) {
      return result;
    }

    for (const item of orderItemExtensionAttributes.customization_states) {
      if (isFileUploadValue(item.value)) {
        continue;
      }

      // Alteration products customizations added to the main plushie customization state as is. Don't need to map.
      if (alterationProductCustomizationDictionary.value[item.customization_id]) {
        const existingResult = result[item.customization_id];

        if (isFileUploadValue(existingResult)) {
          continue;
        }

        if (existingResult && Array.isArray(item.value)) {
          result[item.customization_id] = [...existingResult, ...item.value]
          continue;
        }

        result[item.customization_id] = item.value;
        continue;
      }

      const originalAlterationProductCustomization = _alterationCustomizationByOriginalId[item.customization_id];
      const extraChargeAlterationProductCustomization = _alterationCustomizationByExtraChargeId[item.customization_id];
      const alterationProductCustomization = originalAlterationProductCustomization || extraChargeAlterationProductCustomization;

      if (!alterationProductCustomization) {
        continue;
      }

      const alterationOptionValueDictionary = originalAlterationProductCustomization
        ? _alterationOptionValueByOriginalIdByCustomizationId[alterationProductCustomization.id]
        : _alterationOptionValueByExtraChargeIdByCustomizationId[alterationProductCustomization.id];

      if (!alterationOptionValueDictionary) {
        continue;
      }

      if (typeof item.value === 'string') {
        const existingResult = result[alterationProductCustomization.id];

        if (isFileUploadValue(existingResult)) {
          continue;
        }

        const mappedId = alterationOptionValueDictionary[item.value]?.id;

        if (!mappedId) {
          continue;
        }

        if (existingResult && Array.isArray(existingResult)) {
          existingResult.push(mappedId);
          continue;
        } else if (typeof existingResult === 'string') {
          result[alterationProductCustomization.id] = [mappedId, existingResult];
          continue;
        }

        result[alterationProductCustomization.id] = mappedId;

        continue;
      }

      if (item.value) {
        const mappedIds: string[] = [];

        for (const selectedId of item.value) {
          if (typeof selectedId !== 'string') {
            continue;
          }

          const mappedId = alterationOptionValueDictionary[selectedId]?.id;

          if (mappedId) {
            mappedIds.push(mappedId);
          }
        }

        if (mappedIds.length > 0) {
          const existingRecord = result[alterationProductCustomization.id];

          if (isFileUploadValue(existingRecord)) {
            continue;
          }

          if (existingRecord && Array.isArray(existingRecord)) {
            result[alterationProductCustomization.id] = [...existingRecord, ...mappedIds];
            continue;
          } else if (existingRecord) {
            // TODO: temporary - current TS version don't handle `value` type right in this case
            mappedIds.push(existingRecord as string);
          }

          result[alterationProductCustomization.id] = mappedIds;
        }
      }
    }

    return result;
  });

  const orderItemSelectedOptionValueIds = computed<string[]>(() => {
    const extensionAttributes = orderItem.value.extension_attributes;

    if (!extensionAttributes?.customization_states?.length) {
      return [];
    }

    const result: string[] = [];

    for (const state of extensionAttributes.customization_states) {
      if (isFileUploadValue(state.value)) {
        continue;
      }

      if (typeof state.value === 'string') {
        result.push(state.value);
        continue;
      }

      if (Array.isArray(state.value)) {
        for (const id of state.value) {
          if (typeof id === 'string') {
            result.push(id);
          }
        }
      }
    }

    return result;
  });

  function optionValuesFilter (customizationId: string, optionValue: OptionValue): boolean {
    if (optionValue.id === PRODUCTION_TIME_SELECTOR_STANDARD_OPTION_VALUE_ID) {
      return false;
    }

    const value = orderItemOptionValue.value[customizationId];

    if (isFileUploadValue(value)) {
      return true;
    }

    if (!value) {
      return true;
    }

    return Array.isArray(value) ? !value.includes(optionValue.id) : value !== optionValue.id;
  }

  function customizationsFilter (customization: Customization, availableOptionValues?: OptionValue[]): boolean {
    const value = orderItemOptionValue.value[customization.id];

    if (!value) {
      return true;
    }

    if (isFileUploadValue(value)) {
      return true;
    }

    if (!availableOptionValues?.length) {
      return false;
    }

    const filteredAvailableOptionValues = availableOptionValues.filter((item) => optionValuesFilter(customization.id, item));

    if (filteredAvailableOptionValues.length === 0) {
      return false;
    }

    const maxValuesCount = customization.optionData?.maxValuesCount || 0;
    const totalOptionValuesCount = customization.optionData?.values?.length || 0;
    const purchasedCount = Array.isArray(value) ? value.length : 1;

    if (purchasedCount >= totalOptionValuesCount) {
      return false;
    }

    if (maxValuesCount === 0) {
      return true;
    }

    return purchasedCount < maxValuesCount;
  }

  return {
    customizationsFilter,
    orderItemSelectedOptionValueIds,
    orderItemOptionValue,
    optionValuesFilter
  };
}
