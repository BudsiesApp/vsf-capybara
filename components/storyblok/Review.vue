<template>
  <div
    class="storyblok-review layout-regular-component"
    :class="cssClasses"
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

import { ReviewData } from './interfaces/review-data.interface';

export default Blok.extend({
  name: 'StoryblokReview',
  computed: {
    itemData (): ReviewData {
      return this.item as ReviewData;
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

.storyblok-review {
  @include display-property-handling;
}
</style>
