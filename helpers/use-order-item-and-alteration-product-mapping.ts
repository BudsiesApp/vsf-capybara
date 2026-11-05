import { computed, ComputedRef, Ref } from 'vue';

import Product from '@vue-storefront/core/modules/catalog/types/Product';

import {
  Customization,
  OptionValue
} from 'src/modules/customization-system';

export interface OrderItemAndAlterationProductMapping {
  alterationCustomizationByOriginalId: ComputedRef<Record<string, Customization>>,
  alterationCustomizationByExtraChargeId: ComputedRef<Record<string, Customization>>,
  alterationOptionValueByOriginalIdByCustomizationId: ComputedRef<Record<string, Record<string, OptionValue>>>,
  alterationOptionValueByExtraChargeIdByCustomizationId: ComputedRef<Record<string, Record<string, OptionValue>>>
}

export function useOrderItemAndAlterationProductMapping (
  alterationProduct: Ref<Product | undefined>,
  extraChargesProduct: Ref<Product | undefined>
): OrderItemAndAlterationProductMapping {
  const alterationCustomizationByOriginalId = computed<Record<string, Customization>>(() => {
    const result: Record<string, Customization> = {};
    const product = alterationProduct.value;

    if (!product?.customizations?.length) {
      return result;
    }

    for (const customization of product.customizations) {
      const originalCustomizationId = customization.originalCustomizationId;

      if (!originalCustomizationId) {
        continue;
      }

      result[originalCustomizationId] = customization;
    }

    return result;
  });

  const alterationOptionValueByOriginalIdByCustomizationId = computed<Record<string, Record<string, OptionValue>>>(() => {
    const result: Record<string, Record<string, OptionValue>> = {};
    const product = alterationProduct.value;

    if (!product?.customizations?.length) {
      return result;
    }

    for (const customization of product.customizations) {
      result[customization.id] = {};

      const values = customization.optionData?.values || [];
      for (const value of values) {
        if (value.originalValueId) {
          result[customization.id][value.originalValueId] = value;
        }
      }
    }

    return result;
  });

  const alterationCustomizationByExtraChargeId = computed<Record<string, Customization>>(() => {
    const result: Record<string, Customization> = {};
    const product = extraChargesProduct.value;
    const _alterationCustomizationByOriginalId = alterationCustomizationByOriginalId.value;

    if (!product?.customizations?.length) {
      return result;
    }

    for (const customization of product.customizations) {
      const originalCustomizationId = customization.originalCustomizationId;

      if (!originalCustomizationId) {
        continue;
      }

      const alterationCustomization = _alterationCustomizationByOriginalId[originalCustomizationId];

      if (alterationCustomization) {
        result[customization.id] = alterationCustomization;
      }
    }

    return result;
  });

  const alterationOptionValueByExtraChargeIdByCustomizationId = computed<Record<string, Record<string, OptionValue>>>(() => {
    const result: Record<string, Record<string, OptionValue>> = {};
    const product = extraChargesProduct.value;
    const _alterationCustomizationByExtraChargeId = alterationCustomizationByExtraChargeId.value;
    const _alterationOptionValueByOriginalIdByCustomizationId = alterationOptionValueByOriginalIdByCustomizationId.value;

    if (!product?.customizations?.length) {
      return result;
    }

    for (const customization of product.customizations) {
      const alterationCustomization = _alterationCustomizationByExtraChargeId[customization.id];

      if (!alterationCustomization) {
        continue;
      }

      const values = customization.optionData?.values || [];

      const alterationOptionValueByOriginalId = _alterationOptionValueByOriginalIdByCustomizationId[alterationCustomization.id] || {};

      result[alterationCustomization.id] = result[alterationCustomization.id] || {};

      for (const value of values) {
        const originalValueId = value.originalValueId;

        if (!originalValueId) {
          continue;
        }

        const alterationOptionValue = alterationOptionValueByOriginalId[originalValueId];

        if (alterationOptionValue) {
          result[alterationCustomization.id][value.id] = alterationOptionValue;
        }
      }
    }

    return result;
  });

  return {
    alterationCustomizationByOriginalId,
    alterationCustomizationByExtraChargeId,
    alterationOptionValueByOriginalIdByCustomizationId,
    alterationOptionValueByExtraChargeIdByCustomizationId
  };
}
