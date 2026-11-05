import { useStore } from '@vue-storefront/core/application-services';
import { computed, onBeforeMount, onServerPrefetch, ref, Ref, watch } from 'vue';

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import { catalogHooksExecutors } from '@vue-storefront/core/modules/catalog-next/hooks';
import Product from 'core/modules/catalog/types/Product';
import { ProductEvent } from 'src/modules/shared';
import { updateProductProductionTimeCustomizationData } from 'src/modules/customization-system';

export function useProductPage (
  sku: Ref<string>
) {
  const applicationStore = useStore();
  const isDataLoaded = ref<boolean>(false);

  const currentProduct = computed<Product | undefined>(() => {
    const product = applicationStore.getters['product/getCurrentProduct'];

    if (!product?.sku || product.sku !== sku.value) {
      return null;
    }

    return product;
  });

  async function loadData (): Promise<void> {
    isDataLoaded.value = false;
    applicationStore.commit(`product/${PRODUCT_UNSET_CURRENT}`);

    let [product] = await Promise.all(
      [
        applicationStore.dispatch('product/loadProduct', {
          parentSku: sku.value,
          setCurrent: false
        }),
        applicationStore.dispatch(
          'budsies/loadProductsRushAddons',
          { productSku: sku.value }
        )
      ]
    );

    if (!product) {
      isDataLoaded.value = true;
      return;
    }

    product = updateProductProductionTimeCustomizationData(
      product,
      applicationStore
    );

    await applicationStore.dispatch('product/setCurrent', product);

    catalogHooksExecutors.productPageVisited(product);

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

    if (!currentProduct.value) {
      return;
    }

    EventBus.$emit(ProductEvent.PRODUCT_PAGE_SHOW, currentProduct.value);
  });

  watch(sku, async () => {
    await loadData();

    if (!currentProduct.value) {
      return;
    }

    EventBus.$emit(ProductEvent.PRODUCT_PAGE_SHOW, currentProduct.value);
  });

  return {
    currentProduct,
    isDataLoaded
  }
}
