<template>
  <div class="storyblok-page-layout">
    <default-layout :preview-page-layout-story-content="item" />
  </div>
</template>

<script lang="ts">
import { Blok } from 'src/modules/vsf-storyblok-module';

import DefaultLayout from 'theme/layouts/Default.vue';

export default Blok.extend({
  name: 'StoryblokPageLayout',
  components: {
    DefaultLayout
  }
});
</script>
