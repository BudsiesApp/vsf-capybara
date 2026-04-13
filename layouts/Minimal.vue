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
import { isStoryblokPreview } from 'src/modules/vsf-storyblok-module';

import Head from 'theme/head';

import MCookieNotification from 'theme/components/molecules/m-cookie-notification';
import OHeaderMinimal from 'theme/components/organisms/o-header-minimal';
import OFooter from 'theme/components/organisms/o-footer';

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
  },
  metaInfo: Head
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
