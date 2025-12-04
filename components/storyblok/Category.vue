<template>
  <div
    class="storyblok-category layout-regular-component"
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
import { Blok } from 'src/modules/vsf-storyblok-module/components'
import { SearchQuery } from 'storefront-query-builder'
import Product from 'core/modules/catalog/types/Product';
import { ColumnsCountField } from 'src/modules/vsf-storyblok-module';

import CategoryData from './interfaces/category-data.interface';

import ProductGridRenderer from './ProductGridRenderer.vue'

export default Blok.extend({
  name: 'StoryblokCategoryBlock',
  components: {
    ProductGridRenderer
  },
  computed: {
    itemData (): CategoryData {
      return this.item as CategoryData;
    },
    products (): Product[] {
      return this.$store.getters['product/getProductByCategoryIdDictionary'][this.itemData.id] || [];
    },
    columnsCount (): ColumnsCountField {
      return this.itemData.columns_count;
    }
  },
  async beforeMount (): Promise<void> {
    await this.loadCategoryProducts();
  },
  async serverPrefetch (): Promise<void> {
    await (this as any).loadCategoryProducts();
  },
  methods: {
    async loadCategoryProducts (): Promise<void> {
      const products = this.$store.getters['product/getProductByCategoryIdDictionary'];

      if (products[this.itemData.id]?.length) {
        return;
      }

      let searchQuery = new SearchQuery();

      searchQuery = searchQuery.applyFilter({
        key: 'category_ids',
        value: { 'in': [this.itemData.id] }
      });

      await this.$store.dispatch('product/findProducts', {
        query: searchQuery,
        size: +this.itemData.products_count,
        options: {
          prefetchGroupProducts: false
        }
      });
    }
  },
  watch: {
    async item (): Promise<void> {
      await this.loadCategoryProducts()
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-category {
  @include display-property-handling;
}
</style>
