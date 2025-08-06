<template>
  <div class="minimal-layout" :class="{'storyblok-preview-mode': isStoryblokPreviewMode}">
    <div id="viewport">
      <OHeaderMinimal />
      <div class="content">
        <slot />
      </div>
      <OFooter />
      <MCookieNotification />
    </div>
  </div>
</template>

<script>
import OHeaderMinimal from 'theme/components/organisms/o-header-minimal';
import OFooter from 'theme/components/organisms/o-footer';
import MCookieNotification from 'theme/components/molecules/m-cookie-notification';
import { isStoryblokPreview } from 'src/modules/vsf-storyblok-module';

export default {
  components: {
    OHeaderMinimal,
    OFooter,
    MCookieNotification
  },
  computed: {
    isStoryblokPreviewMode () {
      return isStoryblokPreview();
    }
  }
}
</script>

<style lang="scss">
.minimal-layout {
  &.storyblok-preview-mode {
    a,
    button {
      pointer-events: none;
    }
  }
}
</style>
