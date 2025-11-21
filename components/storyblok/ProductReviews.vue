<template>
  <div
    class="storyblok-product-reviews layout-regular-component"
    :class="cssClasses"
    :style="styles"
    v-if="itemData.product_id"
  >
    <editor-block-icons :item="itemData" />

    <div
      v-if="showContainer"
      :data-fera-widget="itemData.widget"
      :data-product-id="itemData.product_id"
    />
  </div>
</template>

<script lang="ts">
import { Blok } from 'src/modules/vsf-storyblok-module/components';

import { ProductReviewsData } from './interfaces/product-reviews-data.interface';

export default Blok.extend({
  name: 'StoryblokProductReviews',
  computed: {
    itemData (): ProductReviewsData {
      return this.item as ProductReviewsData;
    }
  },
  data () {
    return {
      // false by default to avoid hydration mismatch
      showContainer: false
    }
  },
  mounted () {
    this.reloadWidgets();
  },
  methods: {
    async reloadWidgets (): Promise<void> {
      this.showContainer = false;
      await this.$nextTick();
      this.showContainer = true;
    }
  },
  watch: {
    'itemData.product_id': function () {
      this.reloadWidgets();
    },
    'itemData.widget': function () {
      this.reloadWidgets();
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-product-reviews {
  @include display-property-handling;
}
</style>
