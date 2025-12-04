<template>
  <div
    class="storyblok-category layout-regular-component"
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
import { Blok } from 'src/modules/vsf-storyblok-module/components'
import { SearchQuery } from 'storefront-query-builder'
import Product from 'core/modules/catalog/types/Product';
import { PRODUCT_LOCALIZED_PRICE_DICTIONARY } from '@vue-storefront/core/modules/catalog'
import { PriceHelper } from 'src/modules/shared'
import { Currency, GET_ACTIVE_CURRENCY } from 'src/modules/currency'
import { ColumnsCountField } from 'src/modules/vsf-storyblok-module';
import { prepareCategoryProduct } from 'theme/helpers'

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
    productPriceDictionary (): Record<string, PriceHelper.ProductPrice> {
      return this.$store.getters[PRODUCT_LOCALIZED_PRICE_DICTIONARY] || {};
    },
    selectedCurrency (): Currency {
      return this.$store.getters[GET_ACTIVE_CURRENCY];
    },
    products (): Product[] {
      return this.$store.getters['product/getProductByCategoryIdDictionary'][this.itemData.id] || [];
    },
    preparedProducts (): ReturnType<typeof prepareCategoryProduct>[] {
      return this.products.map(
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
    await this.loadCategory();
  },
  async serverPrefetch (): Promise<void> {
    await (this as any).loadCategory();
  },
  methods: {
    async loadCategory (): Promise<void> {
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
      await this.loadCategory()
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
