import { computed, ComputedRef, nextTick, ref, Ref, set, SetupContext } from '@vue/composition-api';

import i18n from '@vue-storefront/core/i18n';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { Customization, CustomizationOptionValue, CustomizationStateItem, FileUploadValue, isFileUploadValue, OptionValue, useAvailableCustomizations, useCustomizationsBundleOptions, useCustomizationState } from 'src/modules/customization-system';

import { useProductQuantity } from './use-product-quantity';
import { useAddToCart } from './use-add-to-cart';

interface RemovedOptionReference {
  customizationId: string,
  key: string,
  optionValue: CustomizationOptionValue
}

function getRemovedOptionValueIds (optionValue: CustomizationOptionValue): string[] {
  if (!optionValue) {
    return [];
  }

  if (Array.isArray(optionValue)) {
    const optionValueIds: string[] = [];

    for (const value of optionValue as (string | FileUploadValue)[]) {
      optionValueIds.push(isFileUploadValue(value) ? value.id : value);
    }

    return optionValueIds;
  }

  const singleOptionValue = optionValue as string | FileUploadValue;

  return [isFileUploadValue(singleOptionValue) ? singleOptionValue.id : singleOptionValue];
}

function getRemovedOptionKey (customizationId: string, optionValue: CustomizationOptionValue): string | undefined {
  const optionValueIds = getRemovedOptionValueIds(optionValue);

  if (optionValueIds.length === 0) {
    return;
  }

  return `${customizationId}-${optionValueIds.slice().sort().join('__')}`;
}

function isSameOptionValue (
  value: string | FileUploadValue,
  valueToCompare: string | FileUploadValue
): boolean {
  if (isFileUploadValue(value) && isFileUploadValue(valueToCompare)) {
    return value.id === valueToCompare.id;
  }

  return value === valueToCompare;
}

function getErrorNotificationMessage (error: unknown): string {
  return (error as Error)?.message || i18n.t('Something went wrong').toString();
}

export function useCartItemRemovableOptions (
  existingCartItem: Ref<CartItem>,
  context: SetupContext
) {
  const productCustomizations = computed<Customization[]>(() => {
    return existingCartItem.value.customizations || [];
  });

  const initialCustomizationStateData = useCustomizationState(existingCartItem);

  const {
    addCustomizationOptionValue,
    customizationOptionValue,
    customizationState,
    selectedOptionValuesIds,
    updateCustomizationOptionValue
  } = useCustomizationState(existingCartItem);

  const {
    availableCustomization: availableCustomizationsDictionary,
    availableOptionValues,
    removeUnavailableOptionValues
  } = useAvailableCustomizations(
    productCustomizations,
    selectedOptionValuesIds,
    customizationOptionValue,
    updateCustomizationOptionValue
  );

  const { bundleOptions } = useCustomizationsBundleOptions(
    productCustomizations,
    customizationOptionValue,
    availableOptionValues
  );

  const { quantity } = useProductQuantity(existingCartItem);
  const product: ComputedRef<Product | undefined> = computed(() => {
    return context.root.$store.getters['product/getProductBySkuDictionary'][existingCartItem.value.sku];
  });

  const { addToCartHandler } = useAddToCart(
    product,
    quantity,
    customizationState,
    bundleOptions,
    existingCartItem,
    context
  );

  const relatedRemovedOptionsByOptionKey: Ref<Record<string, RemovedOptionReference[]>> = ref({});

  const removedOptions: ComputedRef<Record<string, CustomizationOptionValue>> = computed(() => {
    const initialCustomizationOptionValues = initialCustomizationStateData.customizationOptionValue.value;
    const result: Record<string, CustomizationOptionValue> = {};

    for (const customizationId of Object.keys(initialCustomizationOptionValues)) {
      const initialValue = initialCustomizationOptionValues[customizationId];
      const currentValue = customizationOptionValue.value[customizationId];

      if (!initialValue) {
        continue;
      }

      if (!currentValue) {
        result[customizationId] = initialValue;
        continue;
      }

      if (Array.isArray(initialValue)) {
        if (!Array.isArray(currentValue)) {
          throw new Error('Option value type mismatch');
        }

        const removedValues: string[] | FileUploadValue[] = [];

        for (const value of initialValue) {
          const initialId = isFileUploadValue(value) ? (value as FileUploadValue).id : value;

          if (!currentValue.find((item) => (isFileUploadValue(item) ? (item as FileUploadValue).id : item) === initialId)) {
            removedValues.push(value as any);
          }
        }

        result[customizationId] = removedValues;
        continue;
      }

      if (Array.isArray(currentValue)) {
        throw new Error('Option value type mismatch');
      }

      if (!isFileUploadValue(initialValue)) {
        if (currentValue !== initialValue) {
          result[customizationId] = initialValue;
        }
        continue;
      }

      if (!isFileUploadValue(currentValue)) {
        throw new Error('Option value type mismatch');
      }

      if ((initialValue as FileUploadValue).id !== (currentValue as FileUploadValue).id) {
        result[customizationId] = initialValue;
      }
    }

    return result;
  });

  const initialCustomizationState: ComputedRef<CustomizationStateItem[]> = computed(() => {
    return initialCustomizationStateData.customizationState.value;
  });

  const removableOptions: ComputedRef<Record<string, boolean>> = computed(() => {
    const dictionary: Record<string, boolean> = {};
    const optionValueDictionary: Record<string, OptionValue> = {};

    for (const customization of productCustomizations.value) {
      if (!customization.optionData?.values) {
        continue;
      }

      for (const optionValue of customization.optionData.values) {
        optionValueDictionary[optionValue.id] = optionValue;
      }
    }

    for (const item of initialCustomizationStateData.customizationState.value) {
      const customization = availableCustomizationsDictionary.value[item.customization_id];

      if (!customization || !customization.optionData || customization.optionData.isRequired) {
        continue;
      }

      const selectedOptionValueIds = Array.isArray(item.value)
        ? item.value
        : [item.value];

      for (const optionValueId of selectedOptionValueIds) {
        if (isFileUploadValue(optionValueId)) {
          continue;
        }

        const optionValue = optionValueDictionary[optionValueId];

        if (!optionValue || !optionValue.price || !optionValue.allowRemovingFromCart) {
          continue;
        }

        const removedOptionValues = removedOptions.value[item.customization_id];

        if (isFileUploadValue(removedOptionValues)) {
          throw new Error('Option value type mismatch');
        }

        if (Array.isArray(removedOptionValues)) {
          dictionary[optionValueId] = !!removedOptionValues.find((item) => item === optionValueId);
        } else {
          dictionary[optionValueId] = removedOptionValues === optionValueId;
        }
      }
    }

    return dictionary;
  });

  function addRelatedRemovedOption (
    parentRemovedOptionKey: string | undefined,
    removedOption: RemovedOptionReference
  ): void {
    if (!parentRemovedOptionKey) {
      return;
    }

    const relatedRemovedOptions = relatedRemovedOptionsByOptionKey.value[parentRemovedOptionKey] || [];

    if (relatedRemovedOptions.find((item) => item.key === removedOption.key)) {
      return;
    }

    set(relatedRemovedOptionsByOptionKey.value, parentRemovedOptionKey, [
      ...relatedRemovedOptions,
      removedOption
    ]);
  }

  function collectRelatedRemovedOptions (parentRemovedOptionKey: string | undefined): void {
    if (!parentRemovedOptionKey) {
      return;
    }

    const relatedRemovedOptionValues = removeUnavailableOptionValues();

    for (const customizationId of Object.keys(relatedRemovedOptionValues)) {
      const optionValue = relatedRemovedOptionValues[customizationId];
      const removedOptionKey = getRemovedOptionKey(customizationId, optionValue);

      if (!removedOptionKey) {
        continue;
      }

      addRelatedRemovedOption(parentRemovedOptionKey, { customizationId, key: removedOptionKey, optionValue });
      collectRelatedRemovedOptions(removedOptionKey);
    }
  }

  function remove (
    {
      customizationId,
      optionValue
    }: {
      customizationId: string,
      optionValue: CustomizationOptionValue
    },
    parentRemovedOptionKey?: string
  ) {
    if (!optionValue) {
      return;
    }

    const removedOptionKey = getRemovedOptionKey(customizationId, optionValue);

    addRelatedRemovedOption(parentRemovedOptionKey, {
      customizationId,
      key: removedOptionKey || `${customizationId}`,
      optionValue
    });

    const existingCustomizationOptionValue = customizationOptionValue.value[customizationId];

    if (Array.isArray(existingCustomizationOptionValue)) {
      const optionValueToUpdate: CustomizationOptionValue = [];
      const optionValueToRemove: string[] | FileUploadValue[] = Array.isArray(optionValue) ? optionValue : [optionValue] as string[] | FileUploadValue[];

      for (const item of existingCustomizationOptionValue) {
        if (!optionValueToRemove.some((itemToRemove) => isSameOptionValue(item as string | FileUploadValue, itemToRemove))) {
          optionValueToUpdate.push(item as any);
        }
      }

      updateCustomizationOptionValue({ customizationId, value: optionValueToUpdate });
    } else if (existingCustomizationOptionValue) {
      updateCustomizationOptionValue({ customizationId, value: undefined });
    }

    collectRelatedRemovedOptions(removedOptionKey);
  }

  function normalizeRestoredOptionValue (
    customizationId: string,
    optionValue: CustomizationOptionValue
  ): CustomizationOptionValue {
    const initialValue = initialCustomizationStateData.customizationOptionValue.value[customizationId];

    if (Array.isArray(initialValue) && !Array.isArray(optionValue)) {
      return [optionValue] as CustomizationOptionValue;
    }

    return optionValue;
  }

  function restoreRelatedOptions (customizationId: string, optionValue: CustomizationOptionValue): void {
    addCustomizationOptionValue(
      customizationId,
      normalizeRestoredOptionValue(customizationId, optionValue)
    );

    const removedOptionKey = getRemovedOptionKey(customizationId, optionValue);

    if (!removedOptionKey) {
      return;
    }

    const relatedRemovedOptions = relatedRemovedOptionsByOptionKey.value[removedOptionKey] || [];

    for (const relatedRemovedOption of relatedRemovedOptions) {
      restoreRelatedOptions(relatedRemovedOption.customizationId, relatedRemovedOption.optionValue);
    }

    set(relatedRemovedOptionsByOptionKey.value, removedOptionKey, []);
  }

  async function restoreOption ({ customizationId, optionValue }: {customizationId: string, optionValue: CustomizationOptionValue}): Promise<void> {
    restoreRelatedOptions(customizationId, optionValue);

    await nextTick();
    try {
      await addToCartHandler();
    } catch (error) {
      remove({ customizationId, optionValue });
      context.root.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: getErrorNotificationMessage(error),
        action1: { label: i18n.t('OK') }
      });
    }
  }

  async function removeOption (
    payload: {
      customizationId: string,
      optionValue: CustomizationOptionValue
    }
  ): Promise<void> {
    remove(payload);

    await nextTick();

    try {
      await addToCartHandler();
    } catch (error) {
      restoreRelatedOptions(payload.customizationId, payload.optionValue);
      context.root.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: getErrorNotificationMessage(error),
        action1: { label: i18n.t('OK') }
      });
    }
  }

  return {
    initialCustomizationState,
    removableOptions,
    removeOption,
    removedOptions,
    restoreOption
  }
}
