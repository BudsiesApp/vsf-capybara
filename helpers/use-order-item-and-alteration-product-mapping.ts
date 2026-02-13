import { computed, ComputedRef, Ref } from '@vue/composition-api';

import Product from '@vue-storefront/core/modules/catalog/types/Product';

import {
  Customization,
  OptionValue
} from 'src/modules/customization-system';
import { OrderItem } from 'src/modules/orders-history';

function normalizeName (name: string | undefined): string | undefined {
  return name ? name.toLowerCase() : undefined;
}

export interface OrderItemAndAlterationProductMapping {
  orderItemCustomizationNameById: ComputedRef<Record<string, string>>,
  orderItemOptionValueNameByIdByCustomizationId: ComputedRef<Record<string, Record<string, string>>>,

  alterationCustomizationByName: ComputedRef<Record<string, Customization>>,
  alterationCustomizationById: ComputedRef<Record<string, Customization>>,
  alterationOptionValueByNameByCustomizationId: ComputedRef<Record<string, Record<string, OptionValue>>>
}

export function useOrderItemAndAlterationProductMapping (
  orderItem: Ref<OrderItem>,
  alterationProduct: Ref<Product | undefined>
): OrderItemAndAlterationProductMapping {
  const orderItemCustomizationNameById = computed<Record<string, string>>(() => {
    const result: Record<string, string> = {};
    const extensionAttributes = orderItem.value.extension_attributes;

    if (!extensionAttributes?.customizations?.length) {
      return result;
    }

    for (const customization of extensionAttributes.customizations) {
      const name = normalizeName(customization.name);
      if (name) {
        result[customization.id] = name;
      }
    }

    return result;
  });

  const orderItemOptionValueNameByIdByCustomizationId = computed<Record<string, Record<string, string>>>(() => {
    const result: Record<string, Record<string, string>> = {};
    const extensionAttributes = orderItem.value.extension_attributes;

    if (!extensionAttributes?.customizations?.length) {
      return result;
    }

    for (const customization of extensionAttributes.customizations) {
      result[customization.id] = {};

      const values = customization.optionData?.values || [];
      for (const value of values) {
        const valueName = normalizeName(value.name);
        if (valueName) {
          result[customization.id][value.id] = valueName;
        }
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

    for (const customization of product.customizations as Customization[]) {
      result[customization.id] = customization;
    }

    return result;
  });

  const alterationCustomizationByName = computed<Record<string, Customization>>(() => {
    const result: Record<string, Customization> = {};
    const product = alterationProduct.value;

    if (!product?.customizations?.length) {
      return result;
    }

    for (const customization of product.customizations as Customization[]) {
      const name = normalizeName(customization.name);
      if (name) {
        result[name] = customization;
      }
    }

    return result;
  });

  const alterationOptionValueByNameByCustomizationId = computed<Record<string, Record<string, OptionValue>>>(() => {
    const result: Record<string, Record<string, OptionValue>> = {};
    const product = alterationProduct.value;

    if (!product?.customizations?.length) {
      return result;
    }

    for (const customization of product.customizations as Customization[]) {
      result[customization.id] = {};

      const values = customization.optionData?.values || [];
      for (const value of values) {
        const valueName = normalizeName(value.name);
        if (valueName) {
          result[customization.id][valueName] = value;
        }
      }
    }

    return result;
  });

  return {
    orderItemCustomizationNameById,
    orderItemOptionValueNameByIdByCustomizationId,
    alterationCustomizationByName,
    alterationCustomizationById,
    alterationOptionValueByNameByCustomizationId
  };
}
