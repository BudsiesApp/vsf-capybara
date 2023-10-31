import { Ref, computed } from '@vue/composition-api';

import Product from '@vue-storefront/core/modules/catalog/types/Product';
import rootStore from '@vue-storefront/core/store';

export function useProduct (
  parentSku: Ref<string>,
  setCurrent: boolean
) {
  const productBySkuDictionary = computed<Record<string, Product>>(() => {
    return rootStore.getters['product/getProductBySkuDictionary'];
  });
  const currentProduct = computed(() => {
    if (setCurrent) {
      return rootStore.getters['product/getCurrentProduct'];
    }

    return productBySkuDictionary.value[parentSku.value];
  });

  async function loadProduct (): Promise<void> {
    if (
      !currentProduct.value ||
      currentProduct.value.parentSku !== parentSku.value
    ) {
      await rootStore.dispatch(
        'product/loadProduct',
        {
          parentSku: parentSku.value,
          setCurrent
        }
      );
    }
  }

  return {
    currentProduct,
    loadProduct
  }
}
