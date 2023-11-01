import { computed, ref, Ref, watch } from '@vue/composition-api';

import { Logger } from '@vue-storefront/core/lib/logger';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import rootStore from '@vue-storefront/core/store';
import CartItem from 'core/modules/cart/types/CartItem';

import ProductionTimeOption from 'theme/components/interfaces/production-time-option.interface';

import { useBundleOption } from './use-bundle-options';
import getProductionTimeOptions from './get-production-time-options';

const bundleOptionTitle = 'production time';

export function useProductionTimeSelector (product: Product) {
  const { bundleOption, setBundleOptionValue } = useBundleOption(product, bundleOptionTitle);

  const selectedProductionTimeOption = ref<ProductionTimeOption | undefined>();

  const productionTimeOptions = computed<ProductionTimeOption[]>(() => {
    if (!bundleOption.value) {
      return [];
    }

    return getProductionTimeOptions(bundleOption.value, product, rootStore)
  });

  const hasProductionTimeOptions = computed<boolean>(() => {
    return productionTimeOptions.value.length > 0;
  });

  function resetSelectedProductionTimeOption (): void {
    selectedProductionTimeOption.value = undefined;

    if (!hasProductionTimeOptions) {
      return;
    }

    selectedProductionTimeOption.value = productionTimeOptions.value[0];
  }

  function fillProductionTimeFromCartItem (cartItem: CartItem): void {
    const productOption = cartItem.product_option;
    resetSelectedProductionTimeOption();

    if (!bundleOption.value || !productOption) {
      return;
    }

    if (
      !productOption.extension_attributes
        .bundle_options[bundleOption.value.option_id]
    ) {
      return;
    }

    const selectedOptionValueId = productOption.extension_attributes
      .bundle_options[bundleOption.value.option_id]
      .option_selections[0];

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