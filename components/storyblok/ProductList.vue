<template>
  <div
    class="storyblok-product-list layout-regular-component"
    :class="cssClasses"
    v-if="preparedProducts.length"
  >
    <editor-block-icons :item="itemData" />

    <product-grid-renderer
      :products="preparedProducts"
      :columns-count="columnsCount"
    />
  </div>
</template>

<script lang="ts">
import { SearchQuery } from 'storefront-query-builder';

import config from 'config';
import { Blok } from 'src/modules/vsf-storyblok-module/components'
import Product from 'core/modules/catalog/types/Product';
import { PRODUCT_LOCALIZED_PRICE_DICTIONARY } from '@vue-storefront/core/modules/catalog'
import { PriceHelper } from 'src/modules/shared'
import { ColumnsCountField } from 'src/modules/vsf-storyblok-module'
import { Currency, GET_ACTIVE_CURRENCY } from 'src/modules/currency'
import { prepareCategoryProduct } from 'theme/helpers'

import ProductGridRenderer from './ProductGridRenderer.vue'
import ProductListData from './interfaces/product-list-data.interface';

function getSearchQuery (ids: number[]) {
  let productsQuery = new SearchQuery()
  productsQuery = productsQuery
    .applyFilter({ key: 'id', value: { 'in': ids } })
    .applyFilter({ key: 'status', value: { 'in': [1] } });

  if (config.products.listOutOfStockProducts === false) {
    productsQuery = productsQuery.applyFilter({ key: 'stock.is_in_stock', value: { 'eq': true } });
  }

  return productsQuery;
}

export default Blok.extend({
  name: 'StoryblokProductListBlock',
  components: {
    ProductGridRenderer
  },
  computed: {
    itemData (): ProductListData {
      return this.item as ProductListData;
    },
    productPriceDictionary (): Record<string, PriceHelper.ProductPrice> {
      return this.$store.getters[PRODUCT_LOCALIZED_PRICE_DICTIONARY] || {};
    },
    selectedCurrency (): Currency {
      return this.$store.getters[GET_ACTIVE_CURRENCY];
    },
    preparedProducts (): ReturnType<typeof prepareCategoryProduct>[] {
      const products: Product[] = [];

      const loadedProducts = this.$store.getters['product/getProductByIdDictionary'];

      for (const id of this.itemData.products) {
        if (!loadedProducts[id]) {
          continue;
        }

        products.push(loadedProducts[id]);
      }

      return products.map(
        (product) => prepareCategoryProduct(
          product,
          this.productPriceDictionary,
          this.selectedCurrency
        )
      );
    },
    columnsCount (): ColumnsCountField {
      return this.itemData.columns_count;
    }
  },
  async beforeMount (): Promise<void> {
    await this.loadProducts()
  },
  async serverPrefetch (): Promise<void> {
    await (this as any).loadProducts()
  },
  methods: {
    async loadProducts (): Promise<void> {
      const loadedProducts = this.$store.getters['product/getProductByIdDictionary'];
      const missingProductIds: number[] = [];

      for (const id of this.itemData.products) {
        if (!loadedProducts[id]) {
          missingProductIds.push(id);
        }
      }

      await this.$store.dispatch('product/findProducts', {
        query: getSearchQuery(missingProductIds),
        options: {
          prefetchGroupProducts: false
        }
      });
    }
  },
  watch: {
    async item (): Promise<void> {
      await this.loadProducts()
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-product-list {
  @include display-property-handling;
}
</style>
