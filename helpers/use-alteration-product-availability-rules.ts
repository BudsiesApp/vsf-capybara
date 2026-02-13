import { computed, Ref } from '@vue/composition-api';

import Product from '@vue-storefront/core/modules/catalog/types/Product';

import { Customization, OptionValue, AvailabilityRules } from 'src/modules/customization-system';
import { OrderItem } from 'src/modules/orders-history';

import { OrderItemAndAlterationProductMapping } from './use-order-item-and-alteration-product-mapping';

function mergeAvailabilityRules (
  base: AvailabilityRules | undefined,
  extra: AvailabilityRules | undefined
): AvailabilityRules {
  return {
    forActivatedOptionValueIds: Array.from(
      new Set([
        ...(base?.forActivatedOptionValueIds || []),
        ...(extra?.forActivatedOptionValueIds || [])
      ])
    )
  };
}

export function useAlterationProductAvailabilityRules (
  orderItem: Ref<OrderItem>,
  alterationProduct: Ref<Product | undefined>,
  mapping: OrderItemAndAlterationProductMapping
) {
  const mainCustomizationByNormalizedName = computed<Record<string, Customization>>(() => {
    const result: Record<string, Customization> = {};
    const extensionAttributes = orderItem.value.extension_attributes;

    if (!extensionAttributes?.customizations?.length) {
      return result;
    }

    const customizationNameById = mapping.orderItemCustomizationNameById.value;

    for (const customization of extensionAttributes.customizations) {
      const normalizedName = customizationNameById[customization.id];
      if (normalizedName) {
        result[normalizedName] = customization;
      }
    }

    return result;
  });

  const alterationCustomizationsWithMergedAvailabilityRules = computed<Customization[]>(() => {
    const alterationProductCustomizations = alterationProduct.value?.customizations;

    if (!alterationProductCustomizations?.length) {
      return [];
    }

    const result: Customization[] = [];

    for (const alterationCustomization of alterationProductCustomizations) {
      const customizationName = alterationCustomization.name?.toLowerCase();

      if (!customizationName) {
        result.push(alterationCustomization);
        continue;
      }

      const mainCustomization = mainCustomizationByNormalizedName.value[customizationName];
      const mergedCustomizationRules = mergeAvailabilityRules(
        alterationCustomization.availabilityRules,
        mainCustomization?.availabilityRules
      );

      const optionValues = alterationCustomization.optionData?.values;
      if (!optionValues?.length) {
        result.push({
          ...alterationCustomization,
          availabilityRules: mergedCustomizationRules
        });
        continue;
      }

      const mainValuesByName: Record<string, OptionValue> = {};
      const mainValues = mainCustomization?.optionData?.values || [];
      const mainOptionValueNameById = mapping.orderItemOptionValueNameByIdByCustomizationId.value[mainCustomization?.id || ''] || {};

      for (const value of mainValues) {
        const valueName = mainOptionValueNameById[value.id] || value.name?.toLowerCase();
        if (valueName) {
          mainValuesByName[valueName] = value;
        }
      }

      const mergedOptionValues: OptionValue[] = optionValues.map((alterationValue) => {
        const valueName = alterationValue.name?.toLowerCase();
        const mainValue = valueName ? mainValuesByName[valueName] : undefined;

        return {
          ...alterationValue,
          availabilityRules: mergeAvailabilityRules(
            alterationValue.availabilityRules,
            mainValue?.availabilityRules
          )
        };
      });

      result.push({
        ...alterationCustomization,
        availabilityRules: mergedCustomizationRules,
        optionData: alterationCustomization.optionData
          ? {
            ...alterationCustomization.optionData,
            values: mergedOptionValues
          }
          : alterationCustomization.optionData
      });
    }

    return result;
  });

  return {
    alterationCustomizationsWithMergedAvailabilityRules
  };
}
