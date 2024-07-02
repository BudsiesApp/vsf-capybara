import { computed, onBeforeMount, onServerPrefetch, ref, Ref, SetupContext, watch } from '@vue/composition-api';

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { catalogHooksExecutors } from '@vue-storefront/core/modules/catalog-next/hooks';
import Product from 'core/modules/catalog/types/Product';
import { ProductEvent } from 'src/modules/shared';

export function useProductPage (
  sku: Ref<string>,
  { root }: SetupContext
) {
  const isDataLoaded = ref<boolean>(false);

  const currentProduct = computed<Product | undefined>(() => {
    const product = root.$store.getters['product/getCurrentProduct'];

    if (!product?.sku || product.sku !== sku.value) {
      return null;
    }

    return product;
  });

  async function loadData (): Promise<void> {
    isDataLoaded.value = false;

    const product = await root.$store.dispatch('product/loadProduct', {
      parentSku: sku.value,
      setCurrent: true
    });

    if (!product) {
      isDataLoaded.value = true;
      return;
    }

    await root.$store.dispatch('budsies/loadProductRushAddons', {
      productId: product.id
    });

    catalogHooksExecutors.productPageVisited(product);

    isDataLoaded.value = true;
  }

  onServerPrefetch(async () => {
    if (root.$ssrContext) root.$ssrContext.output.cacheTags.add('product');

    await loadData();
  });

  onBeforeMount(async () => {
    if (!currentProduct.value) {
      await loadData();
    }

    isDataLoaded.value = true;

    if (!currentProduct.value) {
      return;
    }

    EventBus.$emit(ProductEvent.PRODUCT_PAGE_SHOW, currentProduct.value);
  });

  watch(sku, () => {
    void loadData();
  });

  return {
    currentProduct,
    isDataLoaded
  }
}
