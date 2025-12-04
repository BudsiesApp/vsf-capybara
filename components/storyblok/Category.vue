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
import { CategoryService } from '@vue-storefront/core/data-resolver/CategoryService'
import { SearchQuery } from 'storefront-query-builder'
import ProductModel from 'core/modules/catalog/types/Product';
import { Category } from 'core/modules/catalog-next/types/Category'
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
  data: function () {
    return {
      products: [] as ProductModel[],
      category: undefined as Category | undefined
    }
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
    preparedProducts (): any[] {
      if (!this.products || !this.products.length) {
        return [];
      }

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
  async created (): Promise<void> {
    if (!this.category) {
      await this.loadCategory()
    }

    if (this.products.length) {
      return
    }

    await this.loadProducts()
  },
  methods: {
    async loadCategory (): Promise<void> {
      let categories = await CategoryService.getCategories({
        filters: {
          id: this.itemData.id
        }
      })

      this.category = categories.shift()
    },
    async loadProducts (): Promise<void> {
      if (!this.category) {
        return;
      }

      let searchQuery = new SearchQuery()
      searchQuery = searchQuery.applyFilter({ key: 'category_ids', value: { 'in': [this.category.id] } })

      let { items } = await this.$store.dispatch('product/findProducts', {
        query: searchQuery,
        size: +this.itemData.products_count
      })

      this.products = items
    }
  },
  watch: {
    async item (): Promise<void> {
      await this.loadCategory()
      await this.loadProducts()
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
