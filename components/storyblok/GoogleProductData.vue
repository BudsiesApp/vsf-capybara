<template>
  <div
    class="storyblok-google-product-data layout-regular-component"
    :class="cssClasses"
    :style="styles"
    v-if="itemData.product_id"
  >
    <editor-block-icons :item="itemData" />

    <component
      v-if="resolvedProduct"
      :is="productStructuredDataComponent"
      :product="resolvedProduct"
    />
  </div>
</template>

<script lang="ts">
import { isServer } from '@vue-storefront/core/helpers';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { SearchQuery } from 'storefront-query-builder';

import { Blok } from 'src/modules/vsf-storyblok-module/components';
import { isStoryblokPreview } from 'src/modules/vsf-storyblok-module';
import { ProductEvent } from 'src/modules/shared';

import ProductStructuredData from 'src/modules/budsies/components/ProductStructuredData.vue';
import GoogleProductDataBlockData from './interfaces/google-product-data.interface';

export default Blok.extend({
  name: 'StoryblokGoogleProductDataBlock',
  computed: {
    itemData (): GoogleProductDataBlockData {
      return this.item as GoogleProductDataBlockData;
    },
    productStructuredDataComponent () {
      return ProductStructuredData;
    },
    resolvedProduct () {
      const itemData = this.item as GoogleProductDataBlockData;

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
      const itemData = this.item as GoogleProductDataBlockData;

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

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-google-product-data {
  @include display-property-handling;
}
</style>
