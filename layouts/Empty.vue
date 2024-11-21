<template>
  <div class="empty-layout" :class="{'storyblok-preview-mode': isStoryblokPreviewMode}">
    <div id="viewport">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { isStoryblokPreview } from 'src/modules/vsf-storyblok-module';
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  name: 'EmptyLayout',
  props: {
    previewPageLayoutStoryContent: {
      type: Object,
      default: undefined
    }
  },
  computed: {
    isStoryblokPreviewMode (): boolean {
      return isStoryblokPreview();
    }
  }
})
</script>

<style lang="scss">
.default-layout {
  &.storyblok-preview-mode {
    a,
    button {
      pointer-events: none;
    }
  }
}
</style>
