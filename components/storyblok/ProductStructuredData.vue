<template>
  <product-structured-data
    class="storyblok-product-structured-data"
    :product="resolvedProduct"
    v-if="resolvedProduct"
  />
</template>

<script lang="ts">
import { isServer } from '@vue-storefront/core/helpers';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { SearchQuery } from 'storefront-query-builder';

import { Blok } from 'src/modules/vsf-storyblok-module/components';
import { isStoryblokPreview } from 'src/modules/vsf-storyblok-module';
import { ProductEvent } from 'src/modules/shared';

import ProductStructuredDataComponent from 'src/modules/budsies/components/ProductStructuredData.vue';
import ProductStructuredData from './interfaces/product-structured-data.interface';

export default Blok.extend({
  name: 'StoryblokProductStructuredData',
  components: {
    ProductStructuredData: ProductStructuredDataComponent
  },
  computed: {
    itemData (): ProductStructuredData {
      return this.item as ProductStructuredData;
    },
    resolvedProduct () {
      const itemData = this.item as ProductStructuredData;

      return this.$store.getters['product/getProductByIdDictionary'][itemData.product_id];
    }
  },
  async beforeMount (): Promise<void> {
    await this.loadData();
    this.emitProductPageShow();
  },
  async serverPrefetch (): Promise<void> {
    await (this as any).loadData();
  },
  methods: {
    async loadData (): Promise<void> {
      const itemData = this.item as ProductStructuredData;

      if (!itemData.product_id || this.resolvedProduct) {
        return;
      }

      let searchQuery = new SearchQuery();

      searchQuery = searchQuery.applyFilter({
        key: 'id',
        value: { 'in': [itemData.product_id] }
      });

      await this.$store.dispatch('product/findProducts', {
        query: searchQuery,
        size: 1,
        options: {
          prefetchGroupProducts: false
        }
      });
    },
    emitProductPageShow (): void {
      if (isServer || isStoryblokPreview() || !this.resolvedProduct) {
        return;
      }

      EventBus.$emit(ProductEvent.PRODUCT_PAGE_SHOW, this.resolvedProduct);
    }
  },
  watch: {
    async item (): Promise<void> {
      await this.loadData();
      this.emitProductPageShow();
    }
  }
});
</script>
