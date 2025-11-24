<template>
  <div
    class="storyblok-reviews layout-regular-component"
    :class="cssClasses"
    :style="styles"
  >
    <editor-block-icons :item="itemData" />

    <div
      v-if="showContainer"
      :data-fera-widget="itemData.widget"
    />
  </div>
</template>

<script lang="ts">
import { Blok } from 'src/modules/vsf-storyblok-module/components';

import { ReviewsData } from './interfaces/reviews-data.interface';

export default Blok.extend({
  name: 'StoryblokReviews',
  computed: {
    itemData (): ReviewsData {
      return this.item as ReviewsData;
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
    'itemData.widget': function () {
      this.reloadWidgets();
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-reviews {
  @include display-property-handling;
}
</style>
