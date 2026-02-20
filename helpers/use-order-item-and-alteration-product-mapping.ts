import { computed, ComputedRef, Ref } from '@vue/composition-api';

import Product from '@vue-storefront/core/modules/catalog/types/Product';

import {
  Customization,
  OptionValue
} from 'src/modules/customization-system';
import { OrderItem } from 'src/modules/orders-history';

export interface OrderItemAndAlterationProductMapping {
  orderItemCustomizationById: ComputedRef<Record<string, Customization>>,
  orderItemOptionValueByIdByCustomizationId: ComputedRef<Record<string, Record<string, OptionValue>>>,

  alterationCustomizationByOriginalId: ComputedRef<Record<string, Customization>>,
  alterationCustomizationById: ComputedRef<Record<string, Customization>>,
  alterationOptionValueByOriginalIdByCustomizationId: ComputedRef<Record<string, Record<string, OptionValue>>>
}

export function useOrderItemAndAlterationProductMapping (
  orderItem: Ref<OrderItem>,
  alterationProduct: Ref<Product | undefined>
): OrderItemAndAlterationProductMapping {
  const orderItemCustomizationById = computed<Record<string, Customization>>(() => {
    const result: Record<string, Customization> = {};
    const extensionAttributes = orderItem.value.extension_attributes;

    if (!extensionAttributes?.customizations?.length) {
      return result;
    }

    for (const customization of extensionAttributes.customizations) {
      result[customization.id] = customization;
    }

    return result;
  });

  const orderItemOptionValueByIdByCustomizationId = computed<Record<string, Record<string, OptionValue>>>(() => {
    const result: Record<string, Record<string, OptionValue>> = {};
    const extensionAttributes = orderItem.value.extension_attributes;

    if (!extensionAttributes?.customizations?.length) {
      return result;
    }

    for (const customization of extensionAttributes.customizations) {
      result[customization.id] = {};

      const values = customization.optionData?.values || [];
      for (const value of values) {
        result[customization.id][value.id] = value;
      }
    }

    return result;
  });

  const alterationCustomizationById = computed<Record<string, Customization>>(() => {
    const result: Record<string, Customization> = {};
    const product = alterationProduct.value;

    if (!product?.customizations?.length) {
      return result;
    }

    for (const customization of product.customizations) {
      result[customization.id] = customization;
    }

    return result;
  });

  const alterationCustomizationByOriginalId = computed<Record<string, Customization>>(() => {
    const result: Record<string, Customization> = {};
    const product = alterationProduct.value;

    if (!product?.customizations?.length) {
      return result;
    }

    for (const customization of product.customizations) {
      if (customization.originalCustomizationId) {
        result[customization.originalCustomizationId] = customization;
      }
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
        if (value.originalOptionValueId) {
          result[customization.id][value.originalOptionValueId] = value;
        }
      }
    }

    return result;
  });

  return {
    orderItemCustomizationById,
    orderItemOptionValueByIdByCustomizationId,
    alterationCustomizationByOriginalId,
    alterationCustomizationById,
    alterationOptionValueByOriginalIdByCustomizationId
  };
}
