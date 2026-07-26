import { computed, Ref, ref, watch } from 'vue';
import { SearchQuery } from 'storefront-query-builder';

import Product from '@vue-storefront/core/modules/catalog/types/Product';

import { updateProductProductionTimeCustomizationData } from 'src/modules/customization-system';
import { Order, OrderItem } from 'src/modules/orders-history';
import { useRootInstance } from 'src/modules/shared';

function getSearchQuery (skus: string[]): SearchQuery {
  let productsQuery = new SearchQuery();

  productsQuery = productsQuery
    .applyFilter({ key: 'sku', value: { 'in': skus } })
    .applyFilter({ key: 'status', value: { 'in': [1] } });

  return productsQuery;
}

export function useAlterationProductsLoader (
  orders: Ref<Order[]>
) {
  const root = useRootInstance();
  const isLoading = ref<boolean>(false);

  const allOrderItems = computed<OrderItem[]>(() => {
    const items: OrderItem[] = [];

    for (const order of orders.value) {
      items.push(...order.items);
    }

    return items;
  });

  const alterationProductSkus = computed<string[]>(() => {
    const skus = new Set<string>();

    for (const item of allOrderItems.value) {
      const alterationSku = item.extension_attributes?.alteration_product?.sku;
      const manufacturingExtraChargeSku = item.extension_attributes?.manufacturing_extra_charge_product?.sku;

      if (alterationSku) {
        skus.add(alterationSku);
      }

      if (manufacturingExtraChargeSku) {
        skus.add(manufacturingExtraChargeSku);
      }
    }

    return Array.from(skus);
  });

  const productBySkuDictionary = computed<Record<string, Product>>(() => {
    return root.$store.getters['product/getProductBySkuDictionary'] || {};
  });

  const alterationProductByOrderItemId = computed<Record<number, Product>>(() => {
    const dictionary: Record<number, Product> = {};

    for (const orderItem of allOrderItems.value) {
      const alterationSku = orderItem.extension_attributes?.alteration_product?.sku;

      if (!alterationSku) {
        continue;
      }

      const product = productBySkuDictionary.value[alterationSku];

      if (!product) {
        continue;
      }

      const updatedProduct = updateProductProductionTimeCustomizationData(
        product,
        root.$store,
        {
          makeProductionTimeRequired: false
        }
      );

      dictionary[orderItem.item_id] = updatedProduct;
    }

    return dictionary;
  });

  async function loadAlterationProducts (): Promise<void> {
    if (isLoading.value || alterationProductSkus.value.length === 0) {
      return;
    }

    const notLoadedSkus: string[] = [];

    for (const sku of alterationProductSkus.value) {
      const product = productBySkuDictionary.value[sku];

      if (!product) {
        notLoadedSkus.push(sku);
      }
    }

    isLoading.value = true;

    if (notLoadedSkus.length === 0) {
      try {
        await root.$store.dispatch(
          'budsies/loadProductsRushAddons',
          { productSku: '' }
        );
      } finally {
        isLoading.value = false;
      }

      return;
    }

    try {
      await Promise.all([
        root.$store.dispatch('product/findProducts', {
          query: getSearchQuery(notLoadedSkus),
          options: {
            prefetchGroupProducts: false
          }
        }),
        root.$store.dispatch(
          'budsies/loadProductsRushAddons',
          { productSku: '' }
        )
      ]);
    } finally {
      isLoading.value = false;
    }
  }

  watch(
    alterationProductSkus,
    () => {
      void loadAlterationProducts();
    },
    { immediate: true }
  );

  return {
    isLoading,
    alterationProductByOrderItemId,
    loadAlterationProducts
  };
}
