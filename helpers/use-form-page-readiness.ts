import { Ref, watch } from 'vue';
import { useStoryblokReadinessTracker } from 'src/modules/vsf-storyblok-module';

export function useFormPageReadiness (
  trackingKey: Ref<string | undefined>,
  storyDependencies: Ref<string[]>,
  onReady: () => void
) {
  let areStoriesReady = false;
  let isFormReady = false;
  let hasEmitted = false;

  function complete (): void {
    if (!areStoriesReady || !isFormReady || hasEmitted) {
      return;
    }

    hasEmitted = true;
    onReady();
  }

  watch(
    [trackingKey, () => storyDependencies.value.join('|')],
    ([currentTrackingKey], [previousTrackingKey]) => {
      areStoriesReady = false;

      if (currentTrackingKey !== previousTrackingKey) {
        isFormReady = false;
      }

      hasEmitted = false;
    }
  );

  const { onStoryRendered } = useStoryblokReadinessTracker(trackingKey, storyDependencies, () => {
    areStoriesReady = true;
    complete();
  });

  function onFormReady (): void {
    isFormReady = true;
    hasEmitted = false;
    complete();
  }

  return { onStoryRendered, onFormReady };
}
