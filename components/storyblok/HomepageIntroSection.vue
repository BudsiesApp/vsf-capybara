<template>
  <div
    class="storyblok-homepage-intro-section layout-regular-component"
    :class="cssClasses"
    :style="styles"
  >
    <editor-block-icons :item="itemData" />

    <div class="_intro-column _image-column">
      <BaseImage
        :srcsets="imageSources.sourceItems"
        :fallback-srcset="imageSources.fallbackSourceItem"
        :alt="itemData.title"
        :title="itemData.title"
        class="_image"
        :lazy="false"
        fetchpriority="high"
        v-if="itemData.image.filename"
      />
      <div
        class="_video-layer"
        :class="videoLayerClasses"
        v-if="showVideoLayer"
      >
        <video
          ref="videoElement"
          :src="videoUrl"
          autoplay
          muted
          loop
          playsinline
          @canplay="onVideoCanPlay"
          @playing="onVideoPlaying"
          @error="onVideoError"
          @pause="onVideoPause"
        />
      </div>
    </div>

    <div class="_intro-column _content">
      <div class="_title-block">
        <SfHeading
          :level="2"
          :subtitle="itemData.subtitle"
          :style="headingStyles"
        >
          <template #title>
            <h1
              class="sf-heading__title sf-heading__title--h2"
              v-html="nl2br(itemData.title)"
            />
          </template>

          <template #subtitle="{ subtitle }">
            <h3
              class="_subtitle sf-heading__title sf-heading__title--h3"
              v-if="subtitle"
            >
              {{ subtitle }}
            </h3>
          </template>
        </SfHeading>

        <div class="_button-row">
          <sb-router-link
            class="_button sf-button"
            :link="itemData.button_link"
            v-if="itemData.button_text"
          >
            {{ itemData.button_text }}
          </sb-router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { VueConstructor } from 'vue';
import { isServer } from '@vue-storefront/core/helpers';
import { nl2br, BaseImage, ImageSourceItem } from 'src/modules/budsies';

import { InjectType } from 'src/modules/shared';

import {
  Blok,
  ComponentWidthCalculator
} from 'src/modules/vsf-storyblok-module';

import {
  SfHeading
} from '@storefront-ui/vue';

import HomepageIntroSectionData from './interfaces/homepage-intro-section-data.interface';
import generateBreakpointsSpecs from './generate-breakpoints-specs';
import generateImageSourcesList from './generate-image-sources-list';

interface InjectedServices {
  componentWidthCalculator: ComponentWidthCalculator
}

export default (Blok as VueConstructor<InstanceType<typeof Blok> & InjectedServices>).extend({
  name: 'StoryblokHomepageIntroSection',
  components: {
    BaseImage,
    SfHeading
  },
  inject: {
    componentWidthCalculator: { }
  } as unknown as InjectType<InjectedServices>,
  data () {
    return {
      isVideoReady: false,
      isVideoPlaying: false,
      hasVideoLoadError: false
    };
  },
  watch: {
    videoUrl () {
      this.resetVideoState();

      if (isServer) {
        return;
      }

      this.$nextTick(() => {
        this.tryStartVideoPlayback();
      });
    }
  },
  computed: {
    itemData (): HomepageIntroSectionData {
      return this.item as HomepageIntroSectionData;
    },
    hasVideo (): boolean {
      const video = this.itemData.video;
      return !!(video && video.filename);
    },
    showVideoLayer (): boolean {
      return this.hasVideo;
    },
    videoUrl (): string {
      return this.itemData.video ? this.itemData.video.filename : '';
    },
    shouldDisplayVideo (): boolean {
      if (!this.hasVideo || this.hasVideoLoadError || !this.isVideoReady) {
        return false;
      }

      return this.isVideoPlaying;
    },
    videoLayerClasses (): Record<string, boolean> {
      return {
        '-is-visible': this.shouldDisplayVideo
      };
    },
    extraStyles (): Record<string, string> {
      const styles: Record<string, string> = {};

      if (this.itemData.background_color.color) {
        styles['--intro-section-background-color'] = this.itemData.background_color.color;
      }

      return styles;
    },
    headingStyles (): Record<string, string> {
      const styles: Record<string, string> = {};

      if (this.itemData.text_color.color) {
        styles['--heading-title-color'] = this.itemData.text_color.color;
      }

      return styles;
    },
    imageSources (): {
      sourceItems: ImageSourceItem[],
      fallbackSourceItem: ImageSourceItem | undefined
    } {
      if (!this.itemData.image.filename) {
        return {
          sourceItems: [],
          fallbackSourceItem: undefined
        };
      };

      const breakpointsSpecs = generateBreakpointsSpecs(
        this.itemData.image.filename,
        this.componentWidthCalculator,
        this.itemData.mobile_image.filename
      )

      return generateImageSourcesList(
        breakpointsSpecs
      )
    }
  },
  mounted () {
    this.tryStartVideoPlayback();
  },
  methods: {
    nl2br (text: string): string {
      return nl2br(text);
    },
    resetVideoState () {
      this.isVideoReady = false;
      this.isVideoPlaying = false;
      this.hasVideoLoadError = false;
    },
    async tryStartVideoPlayback () {
      if (isServer || !this.hasVideo || this.hasVideoLoadError) {
        return;
      }

      const videoElement = this.$refs.videoElement as HTMLVideoElement | undefined;

      if (!videoElement || videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        return;
      }

      videoElement.muted = true;

      try {
        const playResult = videoElement.play();

        if (playResult && typeof playResult.then === 'function') {
          await playResult;
        }

        this.isVideoPlaying = true;
      } catch (error) {
        this.isVideoPlaying = false;
      }
    },
    onVideoCanPlay () {
      this.isVideoReady = true;
      this.tryStartVideoPlayback();
    },
    onVideoPlaying () {
      this.isVideoReady = true;
      this.isVideoPlaying = true;
    },
    onVideoPause () {
      this.isVideoPlaying = false;
    },
    onVideoError () {
      this.hasVideoLoadError = true;
      this.isVideoReady = false;
      this.isVideoPlaying = false;
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-homepage-intro-section {
  position: relative;
  background-color: var(--intro-section-background-color, transparent);

  ._intro-column {
    line-height: 0;
  }

  ._content {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    padding: 1em;
    text-align: inherit;

    ._title-block {
      .sf-heading__title {
        line-height: 1.2;
      }

      ._subtitle {
        margin-top: 1em;
      }
    }

    ._button-row {
      margin-top: 2em;
      text-align: center;;
    }

    ._button {
      display: inline-block;

      &:hover {
        --c-link-hover: var(--button-color, var(--c-light-variant));
      }
    }

    &.-desktop {
      display: none;
    }
  }

  ._image-column {
    position: relative;
  }

  ._video-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    opacity: 0;
    transition: opacity .2s ease;

    video {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
    }

    &.-with-controls {
      pointer-events: auto;
    }

    &.-is-visible {
      opacity: 1;
    }

    ::v-deep .streaming-video {
      padding-top: 0;
      height: 100%;
    }
  }

  &.-editor-preview-mode {
    ._button {
      pointer-events: none
    }

    ._video-layer {
      pointer-events: none;
    }
  }

  @media (min-width: $tablet-min) {
    ._content {
      padding: 0 5% 0 55%;
      position: absolute;
      top: 0;
      left: 0;

      ._title-block {
        .sf-heading__title {
          text-align: left;
        }

        ._button-row {
          text-align: left;
        }
      }
    }
  }

  @include display-property-handling;
}
</style>
