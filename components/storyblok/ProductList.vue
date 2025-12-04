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
import { Blok } from 'src/modules/vsf-storyblok-module/components'
import ProductModel from 'core/modules/catalog/types/Product';
import { PRODUCT_LOCALIZED_PRICE_DICTIONARY } from '@vue-storefront/core/modules/catalog'
import { PriceHelper } from 'src/modules/shared'
import { ColumnsCountField } from 'src/modules/vsf-storyblok-module'
import { Currency, GET_ACTIVE_CURRENCY } from 'src/modules/currency'
import { prepareCategoryProduct } from 'theme/helpers'

import ProductGridRenderer from './ProductGridRenderer.vue'
import ProductListData from './interfaces/product-list-data.interface';

export default Blok.extend({
  name: 'StoryblokProductListBlock',
  components: {
    ProductGridRenderer
  },
  data: function () {
    return {
      products: [] as ProductModel[]
    }
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
    if (this.products.length) {
      return
    }

    await this.loadProducts()
  },
  methods: {
    async loadProducts (): Promise<void> {
      if (!this.itemData.products || !this.itemData.products.length) {
        return;
      }

      const productPromises = this.itemData.products.map(
        (productId: number) => this.$store.dispatch(
          'product/single',
          {
            options: {
              id: productId
            },
            key: 'id',
            skipCache: true,
            setCurrent: false
          }
        )
      );

      this.products = await Promise.all(productPromises);
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
