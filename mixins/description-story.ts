import StoryMixin from 'theme/mixins/story';

export default StoryMixin.extend({
  computed: {
    fallbackDescription (): string | undefined {
      return undefined;
    },
    showFallback (): boolean {
      if (this.isStoryLoading) {
        return false;
      }

      return !this.story;
    }
  }
});
