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
import { defineComponent, toRefs } from '@vue/composition-api';

export default defineComponent({
  components: {
    OHeaderMinimal,
    OFooter
  },
  props: {
    previewPageLayoutStoryContent: {
      type: Object,
      default: undefined
    }
  },
  setup (props, context) {
    const { previewPageLayoutStoryContent } = toRefs(props);

    return {
      ...useStoryblokPageLayout(context.root.$store, previewPageLayoutStoryContent)
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
