<template>
  <div
    class="storyblok-product-list layout-regular-component"
    :class="cssClasses"
    v-if="products.length"
  >
    <editor-block-icons :item="itemData" />

    <product-grid-renderer
      :products="products"
      :columns-count="columnsCount"
    />
  </div>
</template>

<script lang="ts">
import { SearchQuery } from 'storefront-query-builder';

import config from 'config';
import { Blok } from 'src/modules/vsf-storyblok-module/components'
import Product from 'core/modules/catalog/types/Product';
import { ColumnsCountField } from 'src/modules/vsf-storyblok-module'

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
    products (): Product[] {
      const products: Product[] = [];

      const loadedProducts = this.$store.getters['product/getProductByIdDictionary'];

      for (const id of this.itemData.products) {
        const product: Product | undefined = loadedProducts[id];

        if (!product) {
          continue;
        }

        products.push(product);
      }

      return products;
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

      if (!missingProductIds.length) {
        return;
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
