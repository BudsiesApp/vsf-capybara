import { computed, Ref, unref } from '@vue/composition-api';

import { PRODUCT_SET_BUNDLE_OPTION } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import rootStore from '@vue-storefront/core/store';

import { BundleOption } from 'core/modules/catalog/types/BundleOption';
import Product from 'core/modules/catalog/types/Product';

export function useBundleOption (
  product: Ref<Product>,
  title: Ref<string> | string
) {
  const bundleOption = computed<BundleOption | undefined>(() => {
    // TODO: need to update TS version to make it work fine without specify type
    return product.value.bundle_options?.find(
      (option) => option.title.toLowerCase() === (unref(title) as string).toLowerCase()
    );
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
