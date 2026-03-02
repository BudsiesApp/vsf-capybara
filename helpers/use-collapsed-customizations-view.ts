import { computed, ComputedRef, SetupContext } from '@vue/composition-api';

import { Customization, CustomizationOptionValue, isFileUploadValue, OptionValue, WidgetType } from 'src/modules/customization-system';

export interface CollapsedViewItem {
  isCustomizationFullyHidden: boolean,
  hiddenOptionValues: Record<string, boolean>
}

const MAX_OPTION_VALUES_TO_SHOW = 3;

export function useCollapsedCustomizationsView (
  filteredAvailableCustomizations: ComputedRef<Customization[]>,
  existingCartItemCustomizationOptionValue: ComputedRef<Record<string, CustomizationOptionValue>>,
  filteredOptionValuesIdsByCustomizationId: ComputedRef<Record<string, Record<string, boolean>>>
) {
  const collapsedViewItemsByCustomization: ComputedRef<Record<string, CollapsedViewItem>> = computed(() => {
    const values: Record<string, CollapsedViewItem> = {};
    const _filteredAvailableCustomizations = filteredAvailableCustomizations.value;
    const _filteredOptionValuesIdsByCustomizationId = filteredOptionValuesIdsByCustomizationId.value;
    const _existingCartItemCustomizationOptionValue = existingCartItemCustomizationOptionValue.value;

    let optionValuesAdded = 0;

    for (const customization of _filteredAvailableCustomizations) {
      if (!customization.optionData?.values || customization.optionData.displayWidget !== WidgetType.CARDS_LIST) {
        values[customization.id] = {
          isCustomizationFullyHidden: true,
          hiddenOptionValues: {}
        };
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

      const availableOptionValueToShow = MAX_OPTION_VALUES_TO_SHOW - optionValuesAdded;

      if (availableOptionValueToShow <= 0) {
        values[customization.id] = {
          isCustomizationFullyHidden: true,
          hiddenOptionValues: {}
        };
        continue;
      }

      optionValuesAdded += Math.min(optionValues.length, availableOptionValueToShow);

      if (optionValues.length > availableOptionValueToShow) {
        const hiddenOptionValues: Record<string, boolean> = {};

        for (const optionValue of optionValues.slice(availableOptionValueToShow, optionValues.length)) {
          hiddenOptionValues[optionValue.id] = true;
        }

        values[customization.id] = {
          isCustomizationFullyHidden: false,
          hiddenOptionValues
        };

        continue;
      }

      values[customization.id] = {
        isCustomizationFullyHidden: false,
        hiddenOptionValues: {}
      };
    }

    return values;
  });

  const hasMore: ComputedRef<boolean> = computed(() => {
    const collapsedViewItems = Object.values(collapsedViewItemsByCustomization.value);

    return collapsedViewItems.some((item) => item.isCustomizationFullyHidden || Object.values(item.hiddenOptionValues).some((isHidden) => isHidden));
  });

  return {
    collapsedViewItemsByCustomization,
    hasMore
  }
}
