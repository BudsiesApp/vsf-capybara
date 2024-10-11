<template>
  <MBlockStory :story-slug="storySlug" />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

import MBlockStory from './m-block-story.vue'

export default defineComponent({
  components: {
    MBlockStory
  },
  setup () {
    return {
      storySlug: 'order_submit_agreement_bulkorders'
    }
  }
})
</script>
