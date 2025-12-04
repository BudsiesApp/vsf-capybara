<template>
  <div
    class="storyblok-product layout-regular-component"
    :class="cssClasses"
    v-if="preparedProduct"
  >
    <editor-block-icons :item="itemData" />

    <o-product-card
      :product="preparedProduct"
      :link="preparedProduct.landing_page_url ? preparedProduct.landing_page_url : undefined"
      link-tag="router-link"
      class="_product"
      :wishlist-icon="false"
      :image-height="352"
      :image-width="352"
      @click.native.capture="onProductCardClick"
    />
  </div>
</template>

<script lang="ts">
import { SearchQuery } from 'storefront-query-builder'

import { PRODUCT_LOCALIZED_PRICE_DICTIONARY } from '@vue-storefront/core/modules/catalog';
import Product from 'core/modules/catalog/types/Product';
import { Blok } from 'src/modules/vsf-storyblok-module/components';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { ProductEvent, PriceHelper } from 'src/modules/shared';
import { Currency, GET_ACTIVE_CURRENCY } from 'src/modules/currency';
import { prepareCategoryProduct } from 'theme/helpers'
import OProductCard from 'theme/components/organisms/o-product-card.vue';

import ProductData from './interfaces/product-data.interface';

export default Blok.extend({
  name: 'StoryblokProductBlock',
  components: {
    OProductCard
  },
  computed: {
    product (): Product | undefined {
      return this.$store.getters['product/getProductByIdDictionary'][this.itemData.product_id];
    },
    productPriceDictionary (): Record<string, PriceHelper.ProductPrice> {
      return this.$store.getters[PRODUCT_LOCALIZED_PRICE_DICTIONARY] || {};
    },
    itemData (): ProductData {
      return this.item as ProductData;
    },
    selectedCurrency (): Currency {
      return this.$store.getters[GET_ACTIVE_CURRENCY];
    },
    preparedProduct (): ReturnType<typeof prepareCategoryProduct> | undefined {
      if (!this.product) {
        return;
      }

      return prepareCategoryProduct(
        this.product,
        this.productPriceDictionary,
        this.selectedCurrency
      );
    }
  },
  async beforeMount (): Promise<void> {
    await this.loadData()
  },
  async serverPrefetch (): Promise<void> {
    await (this as any).loadData();
  },
  methods: {
    async loadData () {
      if (this.product) {
        return;
      }

      let searchQuery = new SearchQuery();

      searchQuery = searchQuery.applyFilter({
        key: 'id',
        value: { 'in': [this.itemData.product_id] }
      });

      await this.$store.dispatch('product/findProducts', {
        query: searchQuery,
        size: 1,
        options: {
          prefetchGroupProducts: false
        }
      });
    },
    onProductCardClick () {
      EventBus.$emit(
        ProductEvent.PRODUCT_CARD_CLICK,
        {
          product: this.product,
          categoryName: this.$route.fullPath,
          categoryId: this.$route.fullPath
        }
      );
    }
  },
  watch: {
    item: async function () {
      await this.loadData()
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-product {
  @include display-property-handling;

  ._product {

    margin: var(--spacer-sm);
    display: flex;
    justify-content: center;

    ::v-deep {
      .sf-product-card {
        --product-card-max-width: 100%;
      }
    }
  }
}
</style>
