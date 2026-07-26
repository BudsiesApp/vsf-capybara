import { computed, ComputedRef, nextTick, onMounted, ref, Ref, set } from 'vue';

import i18n from '@vue-storefront/core/i18n';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { Customization, CustomizationOptionValue, CustomizationStateItem, getOptionValueId, isFileUploadValue, OptionValue, toOptionValueArray, useAvailableCustomizations, useCustomizationsBundleOptions, useCustomizationState } from 'src/modules/customization-system';
import { CartEvents, useRootInstance } from 'src/modules/shared';

import { useAddToCart } from './use-add-to-cart';

interface RemovedOptionReference {
  customizationId: string,
  key: string,
  optionValue: CustomizationOptionValue
}

function getOptionValueIds (optionValue: CustomizationOptionValue): string[] {
  return toOptionValueArray(optionValue).map(getOptionValueId);
}

function getRemovedOptionKey (customizationId: string, optionValue: CustomizationOptionValue): string | undefined {
  const optionValueIds = getOptionValueIds(optionValue);

  if (optionValueIds.length === 0) {
    return;
  }

  return `${customizationId}-${optionValueIds.sort().join('__')}`;
}

function getErrorNotificationMessage (error: unknown): string {
  return (error as Error)?.message || i18n.t('Something went wrong').toString();
}

export function useCartItemRemovableOptions (
  existingCartItem: Ref<CartItem>
) {
  const root = useRootInstance();
  const productCustomizations = computed<Customization[]>(() => {
    return existingCartItem.value.customizations || [];
  });

  const optionValueDictionary: ComputedRef<Record<string, OptionValue>> = computed(() => {
    const dictionary: Record<string, OptionValue> = {};

    for (const customization of productCustomizations.value) {
      for (const optionValue of customization.optionData?.values || []) {
        dictionary[optionValue.id] = optionValue;
      }
    }

    return dictionary;
  });

  const initialCustomizationState: Ref<CustomizationStateItem[]> = ref([]);

  onMounted(() => {
    const stateItems = existingCartItem.value.extension_attributes?.customization_state || [];

    initialCustomizationState.value = stateItems
      .filter((item) => !!item.value)
      .map((item) => ({
        customization_id: item.customization_id,
        quantity: item.quantity || 1,
        value: item.value
      }));
  });

  const initialCustomizationOptionValue: ComputedRef<Record<string, CustomizationOptionValue>> = computed(() => {
    const dictionary: Record<string, CustomizationOptionValue> = {};

    for (const item of initialCustomizationState.value) {
      dictionary[item.customization_id] = item.value;
    }

    return dictionary;
  });

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

  const quantity = computed(() => existingCartItem.value.qty);

  const product: ComputedRef<Product | undefined> = computed(() => {
    return root.$store.getters['product/getProductBySkuDictionary'][existingCartItem.value.sku];
  });

  const { addToCartHandler } = useAddToCart(
    product,
    quantity,
    customizationState,
    bundleOptions,
    existingCartItem,
    undefined,
    existingCartItem.value.extension_attributes?.flow,
    true,
    true
  );

  const relatedRemovedOptionsByOptionKey: Ref<Record<string, RemovedOptionReference[]>> = ref({});

  const removedOptions: ComputedRef<Record<string, CustomizationOptionValue>> = computed(() => {
    const result: Record<string, CustomizationOptionValue> = {};

    for (const customizationId of Object.keys(initialCustomizationOptionValue.value)) {
      const initialValue = initialCustomizationOptionValue.value[customizationId];

      if (!initialValue) {
        continue;
      }

      const currentValueIds = getOptionValueIds(customizationOptionValue.value[customizationId]);
      const removedValues = toOptionValueArray(initialValue)
        .filter((value) => !currentValueIds.includes(getOptionValueId(value)));

      if (Array.isArray(initialValue)) {
        result[customizationId] = removedValues as CustomizationOptionValue;
        continue;
      }

      if (removedValues.length > 0) {
        result[customizationId] = initialValue;
      }
    }

    return result;
  });

  const removableOptions: ComputedRef<Record<string, boolean>> = computed(() => {
    const dictionary: Record<string, boolean> = {};

    for (const item of initialCustomizationState.value) {
      const customization = availableCustomizationsDictionary.value[item.customization_id];

      if (!customization || !customization.allowRemovingFromCart) {
        continue;
      }

      const removedOptionValueIds = getOptionValueIds(removedOptions.value[item.customization_id]);

      for (const selectedValue of toOptionValueArray(item.value)) {
        if (isFileUploadValue(selectedValue)) {
          continue;
        }

        const optionValue = optionValueDictionary.value[selectedValue];

        if (!optionValue) {
          continue;
        }

        dictionary[selectedValue] = removedOptionValueIds.includes(selectedValue);
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
      key: removedOptionKey || customizationId,
      optionValue
    });

    const existingCustomizationOptionValue = customizationOptionValue.value[customizationId];

    if (Array.isArray(existingCustomizationOptionValue)) {
      const optionValueIdsToRemove = getOptionValueIds(optionValue);
      const optionValueToUpdate = toOptionValueArray(existingCustomizationOptionValue)
        .filter((item) => !optionValueIdsToRemove.includes(getOptionValueId(item)));

      updateCustomizationOptionValue({ customizationId, value: optionValueToUpdate as CustomizationOptionValue });
    } else if (existingCustomizationOptionValue) {
      updateCustomizationOptionValue({ customizationId, value: undefined });
    }

    collectRelatedRemovedOptions(removedOptionKey);
  }

  function normalizeRestoredOptionValue (
    customizationId: string,
    optionValue: CustomizationOptionValue
  ): CustomizationOptionValue {
    const initialValue = initialCustomizationOptionValue.value[customizationId];

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

  function getOptionValueIdentifier (optionValueId: string): string | undefined {
    const optionValue = optionValueDictionary.value[optionValueId];

    if (!optionValue) {
      return;
    }

    return optionValue.sku || optionValue.id;
  }

  async function syncCartItem (
    optionValueId: string,
    successEvent: CartEvents,
    rollback: () => void
  ): Promise<void> {
    await nextTick();

    try {
      await addToCartHandler();

      const optionIdentifier = getOptionValueIdentifier(optionValueId);

      if (optionIdentifier) {
        EventBus.$emit(successEvent, optionIdentifier);
      }
    } catch (error) {
      rollback();
      root.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: getErrorNotificationMessage(error),
        action1: { label: i18n.t('OK') }
      });
    }
  }

  async function removeOption (
    { customizationId, optionValue }: {
      customizationId: string,
      optionValue: string
    }
  ): Promise<void> {
    remove({ customizationId, optionValue });

    await syncCartItem(
      optionValue,
      CartEvents.CART_UPGRADE_REMOVED,
      () => restoreRelatedOptions(customizationId, optionValue)
    );
  }

  async function restoreOption (
    { customizationId, optionValue }: {
      customizationId: string,
      optionValue: string
    }
  ): Promise<void> {
    restoreRelatedOptions(customizationId, optionValue);

    await syncCartItem(
      optionValue,
      CartEvents.CART_UPGRADE_RESTORE,
      () => remove({ customizationId, optionValue })
    );
  }

  return {
    initialCustomizationState,
    removableOptions,
    removeOption,
    removedOptions,
    restoreOption
  }
}
