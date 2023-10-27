import { Ref, computed } from '@vue/composition-api';
import config from 'config';
import { SearchQuery } from 'storefront-query-builder';

import rootStore from '@vue-storefront/core/store';
import Product from '@vue-storefront/core/modules/catalog/types/Product';

import isCustomProduct from 'src/modules/shared/helpers/is-custom-product.function';

import { prepareCategoryProduct } from 'theme/helpers';

export const CROSS_SELL = 'crosssell';
export const UP_SELL = 'upsell';

type ListType = typeof CROSS_SELL | typeof UP_SELL;

function getSearchQuery (skus: string[]) {
  let productsQuery = new SearchQuery()
  productsQuery = productsQuery
    .applyFilter({ key: 'sku', value: { 'in': skus } })
    .applyFilter({ key: 'status', value: { 'in': [1] } });

  if (config.products.listOutOfStockProducts === false) {
    productsQuery = productsQuery.applyFilter({ key: 'stock.is_in_stock', value: { 'eq': true } });
  }

  return productsQuery;
}

export function useCrossSellsProducts (
  parentSku: string,
  listTypes: (ListType)[] = [CROSS_SELL, UP_SELL]
) {
  const productBySkuDictionary = computed<Record<string, Product>>(() => {
    return rootStore.getters['product/getProductBySkuDictionary'];
  });
  const currentProduct = computed(() => {
    return productBySkuDictionary.value[parentSku];
  });
  const crossSellsProducts = computed(() => {
    if (!currentProduct.value || !listTypes.includes(CROSS_SELL)) {
      return [];
    }

    const skus = getProductLinkSkusByType(CROSS_SELL);

    return getSellsProductsBySkus(skus);
  });
  const preparedCrossSellsProducts = computed(() => {
    return crossSellsProducts.value.map(
      (item: Product) => (
        {
          ...prepareCategoryProduct(item),
          landing_page_url: item.landing_page_url
        }
      )
    )
  });
  const upSellsProducts = computed(() => {
    if (!currentProduct.value) {
      return [];
    }

    const skus = getProductLinkSkusByType(UP_SELL);

    return getSellsProductsBySkus(skus);
  });
  const preparedUpSellsProducts = computed(() => {
    return upSellsProducts.value.map(
      (item: Product) => (
        {
          ...prepareCategoryProduct(item),
          landing_page_url: item.landing_page_url
        }
      )
    )
  });

  function getSellsProductsBySkus (skus: string[]): any[] {
    let products: Product[] = [];

    for (const sku of skus) {
      for (const key in productBySkuDictionary.value) {
        const product = productBySkuDictionary.value[key];

        if (!product.id) {
          continue;
        }

        // VSF replace sku with it's default variant SKU for configurable and bundle products
        // So as workaround better to use parentSku instead sku to compare
        const isSkusListIncludesProduct = product.parentSku === sku;
        const hasLandingPage = !!product.landing_page_url || !isCustomProduct(+product.id);

        if (
          isSkusListIncludesProduct &&
          hasLandingPage
        ) {
          products.push(productBySkuDictionary.value[key]);
          break;
        }
      }
    }

    return products;
  }

  function getProductLinkSkusByType (type: ListType): string[] {
    if (!currentProduct.value) {
      return [];
    }

    if (!currentProduct.value.product_links) {
      return [];
    }

    const productLinks = currentProduct.value.product_links;

    if (productLinks.length === 0) {
      return [];
    }

    const skus = productLinks
      .filter(productLink => productLink.link_type === type)
      .map(productLink => productLink.linked_product_sku);

    return skus;
  }

  async function loadProductsList (type: ListType): Promise<void> {
    if (!currentProduct.value) {
      return;
    }

    const skus = getProductLinkSkusByType(type);

    let notExistingProductsSkus: string[] = [];

    for (const sku of skus) {
      let productFound = false;

      for (const key in productBySkuDictionary.value) {
        if (productBySkuDictionary.value[key].parentSku === sku) {
          productFound = true;

          break;
        }
      }

      if (productFound) {
        continue;
      }

      notExistingProductsSkus.push(sku);
    }

    if (notExistingProductsSkus.length === 0) {
      return;
    }

    await rootStore.dispatch('product/findProducts', {
      query: getSearchQuery(notExistingProductsSkus),
      options: {
        prefetchGroupProducts: false
      }
    });
  }

  async function loadData (): Promise<void> {
    if (!currentProduct.value) {
      await rootStore.dispatch(
        'product/loadProduct',
        {
          parentSku: parentSku,
          setCurrent: false
        }
      );
    }

    const loadingPromises = [];

    if (listTypes.includes(CROSS_SELL)) {
      loadingPromises.push(loadProductsList(CROSS_SELL));
    }

    if (listTypes.includes(UP_SELL)) {
      loadingPromises.push(loadProductsList(UP_SELL));
    }

    await Promise.all(loadingPromises);
  }

  return {
    crossSellsProducts,
    upSellsProducts,
    preparedCrossSellsProducts,
    preparedUpSellsProducts,
    loadData
  }
}
