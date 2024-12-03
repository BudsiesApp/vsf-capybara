
<template>
  <div class="simple-layout" :class="{'storyblok-preview-mode': isStoryblokPreviewMode}">
    <div id="viewport">
      <OHeaderMinimal />
      <slot />
      <OFooterMinimal />
    </div>
  </div>
</template>

<script>
import OHeaderMinimal from 'theme/components/organisms/o-header-minimal';
import OFooterMinimal from 'theme/components/organisms/o-footer-minimal';
import { isStoryblokPreview } from 'src/modules/vsf-storyblok-module';

export default {
  components: {
    OHeaderMinimal,
    OFooterMinimal
  },
  computed: {
    isStoryblokPreviewMode () {
      return isStoryblokPreview();
    }
  }
}
</script>

<style lang="scss">
.simple-layout {
  &.storyblok-preview-mode {
    a,
    button {
      pointer-events: none;
    }
  }
}
</style>
