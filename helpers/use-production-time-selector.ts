import { computed, ref, Ref, toRef, watch } from '@vue/composition-api';

import { Logger } from '@vue-storefront/core/lib/logger';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import rootStore from '@vue-storefront/core/store';
import CartItem from 'core/modules/cart/types/CartItem';

import ProductionTimeOption from 'theme/components/interfaces/production-time-option.interface';

import { useBundleOption } from './use-bundle-options';
import getProductionTimeOptions from './get-production-time-options';

const bundleOptionTitle = 'production time';

export function useProductionTimeSelector (product: Ref<Product>) {
  const { bundleOption, setBundleOptionValue } = useBundleOption(product, bundleOptionTitle);

  const selectedProductionTimeOption = ref<ProductionTimeOption | undefined>();

  const productionTimeOptions = computed<ProductionTimeOption[]>(() => {
    if (!bundleOption.value) {
      return [];
    }

    return getProductionTimeOptions(
      bundleOption.value,
      product.value,
      rootStore
    )
  });

  const hasProductionTimeOptions = computed<boolean>(() => {
    return productionTimeOptions.value.length > 0;
  });

  function resetSelectedProductionTimeOption (): void {
    selectedProductionTimeOption.value = undefined;
  }

  function fillProductionTimeFromCartItem (cartItem: CartItem): void {
    const productOption = cartItem.product_option;
    resetSelectedProductionTimeOption();

    if (!bundleOption.value || !productOption) {
      return;
    }

    const selectedBundleOption = productOption.extension_attributes
      .bundle_options[bundleOption.value.option_id];

    if (
      !selectedBundleOption || selectedBundleOption.option_selections.length === 0
    ) {
      // when restoring cart item, lack of selected option mean that default production time was selected(since it became required)
      // if default production time will have product, this assignment should be removed
      selectedProductionTimeOption.value = productionTimeOptions.value.find((value) => !value.optionValueId);
      return;
    }

    const selectedOptionValueId = selectedBundleOption.option_selections[0];
    selectedProductionTimeOption.value = productionTimeOptions.value.find(
      (item) => item.optionValueId === selectedOptionValueId
    );
  }

  resetSelectedProductionTimeOption();

  watch(selectedProductionTimeOption, (value) => {
    if (!bundleOption.value) {
      Logger.error('productionTimeBundleOption is not defined while attempt to set it was performed', 'budsies')();
      return;
    }

    setBundleOptionValue(
      bundleOption.value.option_id,
      1,
      value && value.optionValueId ? [value.optionValueId] : []
    );
  });

  return {
    fillProductionTimeFromCartItem,
    hasProductionTimeOptions,
    productionTimeOptions,
    resetSelectedProductionTimeOption,
    selectedProductionTimeOption
  }
}
