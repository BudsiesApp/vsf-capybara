import { computed, onBeforeMount, onServerPrefetch, ref, Ref, SetupContext } from '@vue/composition-api';
import config from 'config';
import { SearchQuery } from 'storefront-query-builder';

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import { catalogHooksExecutors } from '@vue-storefront/core/modules/catalog-next/hooks';
import Product from 'core/modules/catalog/types/Product';
import { ProductEvent } from 'src/modules/shared';
import { updateProductProductionTimeCustomizationData } from 'src/modules/customization-system';

export function useMultiProductsPage (
  skus: Ref<string[]>,
  { root }: SetupContext,
  initialSku?: Ref<string | undefined>
) {
  const isDataLoaded = ref<boolean>(false);

  function getSearchQuery (productSkus: string[]) {
    let productsQuery = new SearchQuery();

    productsQuery = productsQuery
      .applyFilter({ key: 'sku', value: { in: productSkus } })
      .applyFilter({ key: 'status', value: { in: [1] } });

    if (config.products.listOutOfStockProducts === false) {
      productsQuery = productsQuery.applyFilter({ key: 'stock.is_in_stock', value: { eq: true } });
    }

    return productsQuery;
  }

  const currentProduct = computed<Product | undefined>(() => {
    const product = root.$store.getters['product/getCurrentProduct'];

    if (!product?.sku) {
      return;
    }

    return product;
  });

  const productBySkuDictionary = computed<Record<string, Product>>(() => {
    return root.$store.getters['product/getProductBySkuDictionary'] || {};
  });

  async function selectProduct (sku: string): Promise<void> {
    const product = productBySkuDictionary.value[sku];

    if (!product || currentProduct.value?.sku === sku) {
      return;
    }

    const productUpdated = updateProductProductionTimeCustomizationData(product, root.$store);
    root.$store.commit('product/product/PRODUCT_SET_PRODUCT_BY_SKU', productUpdated);
    await root.$store.dispatch('product/setCurrent', productUpdated);

    if (!currentProduct.value) {
      return;
    }

    EventBus.$emit(ProductEvent.PRODUCT_PAGE_SHOW, currentProduct.value);
  }

  async function loadData (): Promise<void> {
    isDataLoaded.value = false;
    root.$store.commit(`product/${PRODUCT_UNSET_CURRENT}`);

    await root.$store.dispatch('product/findProducts', {
      query: getSearchQuery(skus.value),
      options: {
        prefetchGroupProducts: true
      }
    });

    const preferredSku = initialSku?.value && skus.value.includes(initialSku.value)
      ? initialSku.value
      : skus.value[0];

    if (preferredSku) {
      await selectProduct(preferredSku);
    }

    if (currentProduct.value) {
      catalogHooksExecutors.productPageVisited(currentProduct.value);
    }

    isDataLoaded.value = true;
  }

  onServerPrefetch(async () => {
    await loadData();
  });

  onBeforeMount(async () => {
    if (!currentProduct.value) {
      await loadData();
    }

    isDataLoaded.value = true;
  });

  return {
    currentProduct,
    isDataLoaded,
    productBySkuDictionary,
    selectProduct
  };
}
