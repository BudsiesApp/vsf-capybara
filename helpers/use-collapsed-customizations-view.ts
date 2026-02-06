import { computed, ComputedRef, SetupContext } from '@vue/composition-api';

import { PRODUCT_LOCALIZED_PRICE_DICTIONARY } from '@vue-storefront/core/modules/catalog';
import { getThumbnailPath, PriceHelper } from '@vue-storefront/core/helpers';
import { Currency, GET_ACTIVE_CURRENCY } from 'src/modules/currency';
import { Customization, CustomizationOptionValue, isFileUploadValue } from 'src/modules/customization-system';
import { getOptionValuePrice } from 'src/modules/customization-system/helpers/get-option-value-price';

import dotsIcon from 'theme/assets/images/dots-icon.svg';

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
  isShowMore: boolean
}

const COLLAPSED_VIEW_MAX_ITEMS = 4;

export function useCollapsedCustomizationsView (
  filteredAvailableCustomizations: ComputedRef<Customization[]>,
  existingCartItemCustomizationOptionValue: ComputedRef<Record<string, CustomizationOptionValue>>,
  filteredOptionValuesIdsByCustomizationId: ComputedRef<Record<string, Record<string, boolean>>>,
  { root }: SetupContext

) {
  const collapsedViewItems: ComputedRef<CollapsedViewItem[]> = computed(() => {
    const values: CollapsedViewItem[] = [];
    const _filteredAvailableCustomizations = filteredAvailableCustomizations.value;
    const _filteredOptionValuesIdsByCustomizationId = filteredOptionValuesIdsByCustomizationId.value;
    const _existingCartItemCustomizationOptionValue = existingCartItemCustomizationOptionValue.value;
    const productBySkuDictionary = root.$store.getters['product/getProductBySkuDictionary'];
    const productPriceDictionary = root.$store.getters[PRODUCT_LOCALIZED_PRICE_DICTIONARY];
    const selectedCurrency: Currency = root.$store.getters[GET_ACTIVE_CURRENCY];

    for (const customization of _filteredAvailableCustomizations) {
      if (!customization.optionData?.values) {
        continue;
      }

      for (const optionValue of customization.optionData.values) {
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

        const isInCart = Array.isArray(cartItemOptionValue)
          ? cartItemOptionValue.includes(optionValue.id)
          : optionValue.id === cartItemOptionValue;

        let price: CollapsedViewItem['price'] = {
          regular: '',
          special: null
        };

        if (isInCart) {
          price.regular = root.$t('Added').toString();
        } else {
          const productPrice = getOptionValuePrice(
            optionValue,
            productBySkuDictionary,
            productPriceDictionary
          );

          if (productPrice) {
            price = PriceHelper.formatProductPrice(productPrice, selectedCurrency.symbol);
          }
        }

        values.push({
          id: optionValue.id,
          title: optionValue.name || '',
          image: getThumbnailPath(optionValue.thumbnailUrl, 144, 144, ''),
          price,
          link: '',
          customizationId: customization.id,
          isShowMore: false
        });
      }
    }

    const sliced = values.slice(0, COLLAPSED_VIEW_MAX_ITEMS - 1);

    sliced.push(
      {
        id: 'show_more',
        title: root.$t('Show more').toString(),
        image: dotsIcon,
        price: {
          regular: '',
          special: null
        },
        link: '',
        customizationId: 'show_more',
        isShowMore: true
      }
    );

    return sliced;
  });

  function getCollapsedViewItemCustomizationOptionValue (
    collapsedViewItem: CollapsedViewItem,
    availableCustomizationDictionary: Record<string, Customization>,
    customizationOptionValue: Record<string, CustomizationOptionValue>
  ): {
      customizationId: string,
      value: CustomizationOptionValue
    } {
    let value: CustomizationOptionValue;
    const customization = availableCustomizationDictionary[collapsedViewItem.customizationId];
    const isOptionValueArray = !customization.optionData?.maxValuesCount || (customization.optionData?.maxValuesCount && customization.optionData.maxValuesCount > 1);
    const selectedCustomizationOptionValue = customizationOptionValue[collapsedViewItem.customizationId];

    if (!selectedCustomizationOptionValue) {
      return {
        customizationId: collapsedViewItem.customizationId,
        value: isOptionValueArray ? [collapsedViewItem.id] : collapsedViewItem.id
      };
    }

    if (isFileUploadValue(selectedCustomizationOptionValue)) {
      return {
        customizationId: collapsedViewItem.customizationId,
        value: selectedCustomizationOptionValue
      };
    }

    if (isOptionValueArray) {
      value = Array.isArray(selectedCustomizationOptionValue)
        ? [...selectedCustomizationOptionValue, collapsedViewItem.id]
        : [selectedCustomizationOptionValue, collapsedViewItem.id];
    } else {
      value = collapsedViewItem.id;
    }

    return {
      customizationId: collapsedViewItem.customizationId,
      value
    }
  }

  return {
    collapsedViewItems,
    getCollapsedViewItemCustomizationOptionValue
  }
}
