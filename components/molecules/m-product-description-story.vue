<template>
  <div class="m-product-description-story" v-if="showStory">
    <a-custom-heading
      v-if="title"
      class="_description-heading"
      :title="title"
      :level="3"
    />

    <Blok :item="story.content" class="_story" />
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { StoryblokStories } from 'src/modules/vsf-storyblok-module/types/State';
import { components } from 'src/modules/vsf-storyblok-module/components';

import StoryMixin, { StoryLoadResult } from 'theme/mixins/story';
import { getProductDescriptionStoryFullSlug } from './helpers/get-product-description-story-full-slug';

import ACustomHeading from '../atoms/a-custom-heading.vue';

export default StoryMixin.extend({
  name: 'MProductDescriptionStory',
  props: {
    productSku: {
      type: String,
      required: true
    },
    backupProductSku: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    title: {
      type: String as PropType<string | undefined>,
      default: undefined
    }
  },
  components: {
    ACustomHeading,
    Blok: components.block
  },
  computed: {
    storyFullSlug (): string {
      return this.getStoryFullSlug(this.productSku);
    },
    storyLoadInputs (): (string | undefined)[] {
      return [this.productSku, this.backupProductSku];
    },
    storyData (): StoryblokStories | undefined {
      let productStory = this.$store.state.storyblok.stories[this.getStoryFullSlug(this.productSku)];

      if (!productStory?.story?.content && this.backupProductSku) {
        productStory = this.$store.state.storyblok.stories[this.getStoryFullSlug(this.backupProductSku)];
      }

      return productStory;
    }
  },
  methods: {
    getStoryFullSlug (productSku: string): string {
      return getProductDescriptionStoryFullSlug(productSku);
    },
    async fetchStory (): Promise<StoryLoadResult> {
      const primaryFullSlug = this.storyFullSlug;
      const fullSlugs = [primaryFullSlug];
      const backupFullSlug = this.backupProductSku ? this.getStoryFullSlug(this.backupProductSku) : undefined;

      const story = await this.$store.dispatch('storyblok/loadStory', { fullSlug: primaryFullSlug });

      if (!story?.content && backupFullSlug) {
        fullSlugs.push(backupFullSlug);
        await this.$store.dispatch('storyblok/loadStory', { fullSlug: backupFullSlug });
      }

      return { fullSlugs };
    }
  }
})
</script>

<style lang="scss" scoped>
.m-product-description-story {
  ._description-heading {
    margin-top: var(--spacer-xl);
  }
}
</style>
