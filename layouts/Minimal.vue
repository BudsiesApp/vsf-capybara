<template>
  <div class="minimal-layout" :class="{'storyblok-preview-mode': isStoryblokPreviewMode}">
    <div id="viewport">
      <OHeaderMinimal />
      <slot />
      <OFooter />
    </div>
  </div>
</template>

<script>
import OHeaderMinimal from 'theme/components/organisms/o-header-minimal';
import OFooter from 'theme/components/organisms/o-footer';
import { isStoryblokPreview } from 'src/modules/vsf-storyblok-module';

export default {
  components: {
    OHeaderMinimal,
    OFooter
  },
  computed: {
    isStoryblokPreviewMode () {
      return isStoryblokPreview();
    }
  }
}
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
