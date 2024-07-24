import { nextTick, Ref } from '@vue/composition-api';

import { Logger } from '@vue-storefront/core/lib/logger';
import { isServer } from '@vue-storefront/core/helpers';
import Product from 'core/modules/catalog/types/Product';

import { Customization, CustomizationOptionValue, OptionValue } from 'src/modules/customization-system';

import getForeversSizeSkuBySizeAndType from './get-forevers-size-sku-by-size-and-type.function';
import getForeversTypeByBundleSku from './get-forevers-type-by-bundle-sku.function';

const sizeCustomizationName = 'size';

export function useCreationWizardPreselectedSize (
  preselectedProductSize: Ref<string | undefined>,
  customizationOptionValue: Ref<Record<string, CustomizationOptionValue>>,
  currentProduct: Ref<Product | undefined>,
  availableCustomizations: Ref<Customization[]>,
  customizationAvailableOptionValues: Ref<Record<string, OptionValue[]>>,
  onCustomizationOptionSelected: (payload: {customizationId: string, value: CustomizationOptionValue}) => void
) {
  function selectSize (product: Product, size: string): void {
    let sizeSku: string;
    let plushieType: string;

    try {
      plushieType = getForeversTypeByBundleSku(product.sku);
      sizeSku = getForeversSizeSkuBySizeAndType(size, plushieType);
    } catch (error) {
      Logger.error('Unable to fill size by preselected param: ' + error, 'budsies')();
      return;
    }

    const sizeCustomization = availableCustomizations.value.find(
      (customization) =>
        customization.name.toLowerCase() === sizeCustomizationName
    );

    if (!sizeCustomization) {
      return;
    }

    if (customizationOptionValue.value[sizeCustomization.id]) {
      return
    }

    const optionValue = customizationAvailableOptionValues.value[sizeCustomization.id]?.find(
      (item) => item.sku === sizeSku
    );

    if (!optionValue) {
      return;
    }

    onCustomizationOptionSelected({
      customizationId: sizeCustomization.id,
      value: optionValue.id
    });
  }

  async function handlePreselectedSize () {
    if (!currentProduct.value || !preselectedProductSize.value || isServer) {
      return;
    }

    await nextTick();
    selectSize(currentProduct.value, preselectedProductSize.value);
  };

  return {
    handlePreselectedSize
  }
}
