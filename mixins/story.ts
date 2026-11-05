import Vue from 'vue';
import { Logger } from '@vue-storefront/core/lib/logger';
import { isServer } from '@vue-storefront/core/helpers';
import { waitForStoryblokContentRender } from 'src/modules/vsf-storyblok-module';
import { StoryblokStories } from 'src/modules/vsf-storyblok-module/types/State';

export interface StoryLoadResult {
  fullSlugs: string[];
  hasContent: boolean;
}

export default Vue.extend({
  data () {
    return { storyLoadId: 0 };
  },
  computed: {
    storyLoadInputs (): (string | undefined)[] {
      return [this.storyFullSlug];
    },
    storyData (): StoryblokStories | undefined {
      if (!this.storyFullSlug) {
        return;
      }

      return this.$store.state.storyblok.stories[this.storyFullSlug];
    },
    story (): Record<string, any> | undefined {
      if (!this.storyData) {
        return;
      }

      return this.storyData.story;
    },
    isStoryLoading (): boolean {
      return !!this.storyData?.loading;
    },
    showStory (): boolean {
      return !!(this.story && this.story.content);
    },
    storyFullSlug (): string | undefined {
      return undefined;
    }
  },
  serverPrefetch () {
    return (this as any).loadStory();
  },
  async mounted () {
    await this.loadStory();
  },
  watch: {
    storyLoadInputs ([storyFullSlug]: (string | undefined)[]) {
      if (!storyFullSlug) {
        return;
      }

      this.loadStory();
    }
  },
  methods: {
    async fetchStory (): Promise<StoryLoadResult> {
      const storyFullSlug = this.storyFullSlug;
      const story = await this.$store.dispatch('storyblok/loadStory', {
        fullSlug: storyFullSlug
      });

      return { fullSlugs: [storyFullSlug], hasContent: !!story?.content };
    },
    async loadStory (): Promise<void> {
      if (!this.storyFullSlug) {
        throw new Error('\'storyFullSlug\' property is not defined');
      }

      const loadId = ++this.storyLoadId;
      const fallbackFullSlugs = [this.storyFullSlug];
      let result: StoryLoadResult = { fullSlugs: fallbackFullSlugs, hasContent: false };

      try {
        result = await this.fetchStory();
      } catch (error) {
        Logger.error(error, 'storyblok')();
      }

      if (isServer || loadId !== this.storyLoadId) {
        return;
      }

      if (result.hasContent) {
        await waitForStoryblokContentRender();

        if (loadId !== this.storyLoadId) {
          return;
        }
      }

      this.$emit('story-rendered', result.fullSlugs);
    }
  }
});
