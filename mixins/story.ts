import Vue from 'vue';
import { StoryblokStories } from 'src/modules/vsf-storyblok-module/types/State';

export default Vue.extend({
  computed: {
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
    if (this.story) {
      this.$emit('story-ready', (this as any).getStoryReadyPayload());
      return;
    }

    await this.loadStory();
  },
  methods: {
    getStoryReadyPayload (): string[] {
      return this.storyFullSlug ? [this.storyFullSlug] : [];
    },
    async executeStoryLoad (
      loadStoryHandler: () => Promise<void>
    ): Promise<void> {
      try {
        await loadStoryHandler();
      } finally {
        this.$emit('story-ready', this.getStoryReadyPayload());
      }
    },
    async loadStory (): Promise<void> {
      if (!this.storyFullSlug) {
        throw new Error('\'storyFullSlug\' property is not defined');
      }

      const storyFullSlug = this.storyFullSlug;

      await this.executeStoryLoad(async () => {
        await this.$store.dispatch(`storyblok/loadStory`, {
          fullSlug: storyFullSlug
        });
      });
    }
  }
});
