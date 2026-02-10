import { computed, ComputedRef, SetupContext } from '@vue/composition-api';

import { PRODUCT_LOCALIZED_PRICE_DICTIONARY } from '@vue-storefront/core/modules/catalog';
import { Currency, GET_ACTIVE_CURRENCY } from 'src/modules/currency';
import { Customization, CustomizationOptionValue, isFileUploadValue, OptionValue, WidgetType } from 'src/modules/customization-system';

export interface CollapsedViewItem {
  id: string,
  title: string,
  image: string,
  price: {
    regular: string,
    special: string | null
  },
  link: string,
  customizationId: string,
  isAddedToCart: boolean
}

export function useCollapsedCustomizationsView (
  filteredAvailableCustomizations: ComputedRef<Customization[]>,
  existingCartItemCustomizationOptionValue: ComputedRef<Record<string, CustomizationOptionValue>>,
  filteredOptionValuesIdsByCustomizationId: ComputedRef<Record<string, Record<string, boolean>>>,
  // TODO: remove
  { root }: SetupContext

) {
  const collapsedViewItemsByCustomization: ComputedRef<Record<string, OptionValue[]>> = computed(() => {
    const values: Record<string, OptionValue[]> = {};
    const _filteredAvailableCustomizations = filteredAvailableCustomizations.value;
    const _filteredOptionValuesIdsByCustomizationId = filteredOptionValuesIdsByCustomizationId.value;
    const _existingCartItemCustomizationOptionValue = existingCartItemCustomizationOptionValue.value;

    for (const customization of _filteredAvailableCustomizations) {
      if (!customization.optionData?.values || customization.optionData.displayWidget !== WidgetType.CARDS_LIST) {
        continue;
      }

      const customizationValues = [...customization.optionData.values].sort(
        (a, b) => (a.sn === null || a.sn === undefined ? 0 : a.sn) - (b.sn === null || b.sn === undefined ? 0 : b.sn)
      );

      const optionValues: OptionValue[] = [];

      for (const optionValue of customizationValues) {
        if (!optionValue.thumbnailUrl) {
          continue;
        }

        const availableOptionValueIds = _filteredOptionValuesIdsByCustomizationId[customization.id];

        if (!availableOptionValueIds) {
          continue;
        }

        const isAvailable = availableOptionValueIds[optionValue.id];

        if (!isAvailable) {
          continue;
        }

        const cartItemOptionValue = _existingCartItemCustomizationOptionValue[customization.id];

        if (isFileUploadValue(cartItemOptionValue)) {
          continue;
        }

        optionValues.push(optionValue);
      }

      values[customization.id] = optionValues;
    }

    return values;
  });

  const collapsedViewCustomizations: ComputedRef<Customization[]> = computed(() => {
    const result: Customization[] = [];
    let valuesLength = 0;

    for (const customization of filteredAvailableCustomizations.value) {
      const optionValuesLength = (collapsedViewItemsByCustomization.value[customization.id] && collapsedViewItemsByCustomization.value[customization.id].length) || 0;

      if (valuesLength >= 3) {
        return result;
      }

      valuesLength += optionValuesLength;
      result.push(customization);
    }

    return result;
  });

  // function getCollapsedViewItemCustomizationOptionValue (
  //   collapsedViewItem: CollapsedViewItem,
  //   availableCustomizationDictionary: Record<string, Customization>,
  //   customizationOptionValue: Record<string, CustomizationOptionValue>
  // ): {
  //     customizationId: string,
  //     value: CustomizationOptionValue
  //   } {
  //   let value: CustomizationOptionValue;
  //   const customization = availableCustomizationDictionary[collapsedViewItem.customizationId];
  //   const isOptionValueArray = !customization.optionData?.maxValuesCount || (customization.optionData?.maxValuesCount && customization.optionData.maxValuesCount > 1);
  //   const selectedCustomizationOptionValue = customizationOptionValue[collapsedViewItem.customizationId];
  //
  //   if (!selectedCustomizationOptionValue) {
  //     return {
  //       customizationId: collapsedViewItem.customizationId,
  //       value: isOptionValueArray ? [collapsedViewItem.id] : collapsedViewItem.id
  //     };
  //   }
  //
  //   if (isFileUploadValue(selectedCustomizationOptionValue)) {
  //     return {
  //       customizationId: collapsedViewItem.customizationId,
  //       value: selectedCustomizationOptionValue
  //     };
  //   }
  //
  //   if (isOptionValueArray) {
  //     value = Array.isArray(selectedCustomizationOptionValue)
  //       ? [...selectedCustomizationOptionValue, collapsedViewItem.id]
  //       : [selectedCustomizationOptionValue, collapsedViewItem.id];
  //   } else {
  //     value = collapsedViewItem.id;
  //   }
  //
  //   return {
  //     customizationId: collapsedViewItem.customizationId,
  //     value
  //   }
  // }

  return {
    collapsedViewItemsByCustomization,
    collapsedViewCustomizations
    // getCollapsedViewItemCustomizationOptionValue
  }
}
