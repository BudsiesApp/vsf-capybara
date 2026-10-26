<template>
  <div class="m-submit-animator">
    <div class="_animation-frame">
      <video
        ref="videoElement"
        id="animation_element"
        autoplay
        loop
        muted
        playsinline
        class="_animation"
      >
        <source :src="animationUrl" type="video/mp4">
      </video>
      <VideoPlaybackButton :is-paused="isPaused" @activate="toggle" />
    </div>

    <div class="_progress-bar">
      <div class="_inner" :style="progressBarStyle" />
    </div>

    <div class="_calculation-steps">
      {{ currentStep.text }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import VideoPlaybackButton from 'src/modules/shared/components/video-playback-button.vue';
import { useVideoPlaybackToggle } from 'src/modules/shared/composables/use-video-playback-toggle';
import { animationPlaybackKey } from 'src/modules/shared/helpers/video-playback';

import SubmitAnimationStepsInterface from '../interfaces/submit-animation-steps.interface';

const LOADING_ANIMATION = 'loading_animation';

export default defineComponent({
  name: 'MSubmitAnimator',
  components: {
    VideoPlaybackButton
  },
  setup () {
    const videoElement = ref<HTMLVideoElement | null>(null);

    return {
      videoElement,
      ...useVideoPlaybackToggle(
        videoElement,
        ref(animationPlaybackKey(LOADING_ANIMATION)),
        ref({
          native: true,
          autoplay: true,
          controls: false
        }),
        ref(false)
      )
    };
  },
  props: {
    steps: {
      type: Array as PropType<SubmitAnimationStepsInterface[]>,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    animationUrl: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      currentStepIndex: 0,
      progressPercent: 0
    }
  },
  computed: {
    currentStep (): SubmitAnimationStepsInterface {
      return this.steps[this.currentStepIndex];
    },
    progressBarStyle (): Record<string, string> {
      return {
        width: `${this.progressPercent}%`
      };
    }
  },
  methods: {
    async runProgress (): Promise<void> {
      if (!this.steps.length) {
        return;
      }

      this.currentStepIndex = 0;
      this.progressPercent = 0;
      let initialWidth = 0;

      const stepDuration = Math.round(this.duration / this.steps.length);

      for (let i = 0; i < this.steps.length; i++) {
        await this.animate(
          initialWidth,
          this.currentStep.value,
          stepDuration
        );

        initialWidth = this.currentStep.value;
        this.currentStepIndex = Math.min(this.currentStepIndex + 1, this.steps.length - 1);
      }
    },
    async animate (
      startValue: number,
      finishValue: number,
      duration: number
    ): Promise<void> {
      return new Promise((resolve, reject) => {
        const start = Date.now();
        const limitWidth = finishValue - startValue;

        const timer = setInterval(() => {
          const timePassed = Date.now() - start;

          const progressPercent =
                    startValue + (limitWidth * timePassed) / duration;

          this.progressPercent = Math.min(progressPercent, 100);

          if (timePassed >= duration) {
            clearInterval(timer);
            resolve();
          }
        }, 10);
      });
    }
  }
})
</script>

<style lang="scss" scoped>
$progress-bar-color: #31c1ff;

.m-submit-animator {
    ._animation-frame {
        position: relative;
        max-width: 300px;
        margin: 0 auto;
    }

    ._animation {
        max-width: 300px;
    }

    ._progress-bar {
        width: 75%;
        margin: 1em auto;
        border: 1px solid $progress-bar-color;
        border-radius: 0.15em;
        height: 1em;

        ._inner {
            background-color: $progress-bar-color;
            height: 100%;
            width: 0%;
        }
    }

    ._calculation-steps {
        margin-top: 1em;
    }
}
</style>
