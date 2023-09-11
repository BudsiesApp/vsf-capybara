<template>
  <div
    class="storyblok-textarea layout-transparent-container"
    :class="cssClasses"
    :style="styles"
  >
    <editor-block-icons :item="itemData" />

    <sb-rich-text v-if="itemData.content" :text="itemData.content" />
  </div>
</template>

<script lang="ts">
import { Blok } from 'src/modules/vsf-storyblok-module/components'
import TextareaData from './interfaces/textarea-data.interface';

export default Blok.extend({
  name: 'StoryblokTextarea',
  computed: {
    itemData (): TextareaData {
      return this.item as TextareaData;
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-textarea {
  ::v-deep .storyblok-rich-text {
    .-accent-color {
      color: var(--c-accent);
    }

    .-action-color {
      color: var(--c-primary);
    }

    .-large-text {
      font-size: 24px;
    }

    .-small-text {
      font-size: 10px;
    }

    .-large-accent-text {
      color: var(--c-accent);
      font-size: 24px;
    }

    .-large-action-text {
      color: var(--c-primary);
      font-size: 24px;
    }
  }

  @include storyblok-transparent-container-layout;
  @include display-property-handling;
}
</style>
