import { computed, Ref, ref, watch } from 'vue';
import { SearchQuery } from 'storefront-query-builder';

import Product from '@vue-storefront/core/modules/catalog/types/Product';

import {
  updateProductProductionTimeCustomizationData
} from 'src/modules/customization-system';
import { Order, OrderItem } from 'src/modules/orders-history';
import { useRootInstance } from 'src/modules/shared';

function getSearchQuery (sku: string): SearchQuery {
  let productsQuery = new SearchQuery();

  productsQuery = productsQuery
    .applyFilter({ key: 'sku', value: { 'in': [sku] } })
    .applyFilter({ key: 'status', value: { 'in': [1] } });

  return productsQuery;
}

export function useOrderItemAlterationProductLoader (
  orderItem: Ref<OrderItem | undefined>,
  order: Ref<Order | undefined>
) {
  const root = useRootInstance();
  const isLoading = ref<boolean>(false);

  const alterationProductSku = computed<string | undefined>(() => {
    if (!orderItem.value) {
      return;
    }

    return orderItem.value.extension_attributes?.alteration_product?.sku;
  });

  const productBySkuDictionary = computed<Record<string, Product>>(() => {
    return root.$store.getters['product/getProductBySkuDictionary'] || {};
  });

  const alterationProduct = computed<Product | undefined>(() => {
    const sku = alterationProductSku.value;

    if (!sku) {
      return;
    }

    const product = productBySkuDictionary.value[sku];

    if (!product) {
      return;
    }

    return updateProductProductionTimeCustomizationData(
      product,
      root.$store,
      {
        makeProductionTimeRequired: false
      }
    );
  });

  async function loadAlterationProduct (): Promise<void> {
    const sku = alterationProductSku.value;

    if (isLoading.value || !sku) {
      return;
    }

    isLoading.value = true;

    try {
      if (!productBySkuDictionary.value[sku]) {
        await root.$store.dispatch('product/findProducts', {
          query: getSearchQuery(sku),
          options: {
            prefetchGroupProducts: false
          }
        });
      }

      await root.$store.dispatch(
        'budsies/loadProductsRushAddons',
        { productSku: '' }
      );
    } finally {
      isLoading.value = false;
    }
  }

  watch(
    alterationProductSku,
    () => {
      void loadAlterationProduct();
    },
    { immediate: true }
  );

  return {
    alterationProduct,
    isLoading,
    loadAlterationProduct
  };
}
