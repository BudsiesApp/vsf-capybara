import { computed } from '@vue/composition-api';

import { PRODUCT_SET_BUNDLE_OPTION } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import rootStore from '@vue-storefront/core/store';

import { BundleOption } from 'core/modules/catalog/types/BundleOption';
import Product from 'core/modules/catalog/types/Product';

export function useBundleOption (product: Product, title: string) {
  const bundleOption = computed<BundleOption | undefined>(() => {
    return product.bundle_options?.find((option) => option.title.toLowerCase() === title.toLowerCase());
  });

  function setBundleOptionValue (
    optionId: number,
    optionQty: number,
    optionSelections: number[]
  ): void {
    rootStore.commit(
      `product/${PRODUCT_SET_BUNDLE_OPTION}`,
      { optionId, optionQty, optionSelections }
    )
  }

  return {
    bundleOption,
    setBundleOptionValue
  }
}
