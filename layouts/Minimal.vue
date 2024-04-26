<template>
  <div class="minimal-layout" :class="{'storyblok-preview-mode': isStoryblokPreviewMode}">
    <div id="viewport">
      <OHeaderMinimal />
      <slot />
      <OFooter :navigation-columns="footerItems" />
    </div>
  </div>
</template>

<script>
import OHeaderMinimal from 'theme/components/organisms/o-header-minimal';
import OFooter from 'theme/components/organisms/o-footer';
import { isStoryblokPreview, useStoryblokPageLayout } from 'src/modules/vsf-storyblok-module';
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  components: {
    OHeaderMinimal,
    OFooter
  },
  props: {
    previewPageLayoutStory: {
      type: Object,
      default: undefined
    }
  },
  setup ({ previewPageLayoutStory }, context) {
    return {
      ...useStoryblokPageLayout(context.root.$store, previewPageLayoutStory)
    }
  },
  computed: {
    isStoryblokPreviewMode () {
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
