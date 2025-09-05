<template>
  <div
    class="storyblok-product-review layout-regular-component"
    :class="cssClasses"
    v-if="itemData.product_id"
  >
    <div data-fera-container="product_reviews" :data-product-id="itemData.product_id" />
  </div>
</template>

<script lang="ts">
import { Blok } from 'src/modules/vsf-storyblok-module/components';

import { ProductReviewData } from './interfaces/product-review-data.interface';

export default Blok.extend({
  name: 'StoryblokProductReview',
  computed: {
    itemData (): ProductReviewData {
      return this.item as ProductReviewData;
    }
  },
  mounted (): void {
    this.reloadWidgets();
  },
  methods: {
    async reloadWidgets (): Promise<void> {
      if (!this.itemData.product_id) {
        return;
      }

      await this.$nextTick();
      (window as any).fera.reloadWidgets();
    }
  },
  watch: {
    'itemData.product_id': async function () {
      this.reloadWidgets();
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-product-review {
  @include display-property-handling;
}
</style>
