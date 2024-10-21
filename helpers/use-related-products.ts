import { Ref, computed } from '@vue/composition-api';
import config from 'config';
import { SearchQuery } from 'storefront-query-builder';

import rootStore from '@vue-storefront/core/store';
import Product from '@vue-storefront/core/modules/catalog/types/Product';

import { Dictionary } from 'src/modules/budsies';
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

export function useRelatedProducts (
  currentProduct: Ref<Product | undefined>,
  listType: ListType,
  loadFullProductsInfo = false
) {
  const productBySkuDictionary = computed<Record<string, Product>>(() => {
    return rootStore.getters['product/getProductBySkuDictionary'];
  });
  const relatedProducts = computed(() => {
    if (!currentProduct.value) {
      return [];
    }

    const skus = getProductLinkSkusByType(listType);

    return getSellsProductsBySkus(skus);
  });
  const relatedProductDictionary = computed(() => {
    const dictionary: Dictionary<Product> = {};

    relatedProducts.value.forEach((product) => {
      dictionary[product.id] = product;
    });

    return dictionary;
  });
  const preparedRelatedProducts = computed(() => {
    const productPriceDictionary = rootStore.getters['product/productPriceDictionary'];

    return relatedProducts.value.map(
      (item: Product) => (
        {
          ...prepareCategoryProduct(item, productPriceDictionary),
          landing_page_url: item.landing_page_url
        }
      )
    )
  });

  function getRelatedProductById (id: number): Product | undefined {
    return relatedProductDictionary.value[id];
  }

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
          products.push(product);
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

  async function loadList (): Promise<void> {
    if (!currentProduct.value) {
      return;
    }

    const skus = getProductLinkSkusByType(listType);

    let notExistingProductsSkus: string[] = [];

    for (const sku of skus) {
      let productFound = false;

      for (const key in productBySkuDictionary.value) {
        const product = productBySkuDictionary.value[key];
        const hasRequiredData = loadFullProductsInfo ? !!product.media_gallery : true;

        if (product.parentSku === sku && hasRequiredData) {
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

  return {
    relatedProducts,
    preparedRelatedProducts,
    getRelatedProductById,
    loadList
  }
}
