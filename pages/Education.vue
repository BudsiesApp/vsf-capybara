<template>
  <div id="education-page">
    <StoryblokPage story-full-slug="education" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import StoryblokPage from 'src/modules/vsf-storyblok-module/pages/StoryblokPage.vue';

export default defineComponent({
  name: 'EducationPage',
  components: { StoryblokPage }
});
</script>
