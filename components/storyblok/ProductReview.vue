<template>
  <div
    class="storyblok-product-review layout-regular-component"
    :class="cssClasses"
    v-if="itemData.product_id"
  >
    <editor-block-icons :item="itemData" />

    <div
      v-if="showContainer"
      data-fera-container="product_reviews"
      :data-product-id="itemData.product_id"
    />
  </div>
</template>

<script lang="ts">
import { VueConstructor } from 'vue';

import { Blok } from 'src/modules/vsf-storyblok-module/components';
import { InjectType } from 'src/modules/shared';

import { ProductReviewData } from './interfaces/product-review-data.interface';

interface InjectedServices {
  window: Window
}

export default (Blok as VueConstructor<InstanceType<typeof Blok> & InjectedServices>).extend({
  name: 'StoryblokProductReview',
  inject: {
    window: { from: 'WindowObject' }
  } as unknown as InjectType<InjectedServices>,
  computed: {
    itemData (): ProductReviewData {
      return this.item as ProductReviewData;
    }
  },
  data () {
    return {
      showContainer: false
    }
  },
  mounted () {
    this.reloadWidgets();
  },
  methods: {
    async reloadWidgets (): Promise<void> {
      await this.$nextTick();

      if (
        !this.itemData.product_id ||
        !this.window.fera ||
        typeof this.window.fera.reloadWidgets !== 'function'
      ) {
        return;
      }

      this.showContainer = false;
      await this.$nextTick();
      this.showContainer = true;
    }
  },
  watch: {
    'itemData.product_id': function () {
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
