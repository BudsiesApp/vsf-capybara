<template>
  <div
    class="storyblok-homepage-intro-section layout-regular-component"
    :class="cssClasses"
    :style="styles"
  >
    <editor-block-icons :item="itemData" />

    <div
      class="_intro-column _image-column"
      :class="videoContainerClasses"
      :style="videoContainerStyles"
    >
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

      <video
        class="_video-layer"
        :src="activeVideoUrl"
        poster="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        autoplay
        muted
        loop
        playsinline
        v-if="activeVideoUrl"
      />
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
import { nl2br, BaseImage, ImageSourceItem } from 'src/modules/budsies';

import { BreakpointValue, InjectType } from 'src/modules/shared';

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
  componentWidthCalculator: ComponentWidthCalculator,
  window: Window
}

export default (Blok as VueConstructor<InstanceType<typeof Blok> & InjectedServices>).extend({
  name: 'StoryblokHomepageIntroSection',
  components: {
    BaseImage,
    SfHeading
  },
  inject: {
    componentWidthCalculator: { },
    window: { from: 'WindowObject' }
  } as unknown as InjectType<InjectedServices>,
  data () {
    return {
      activeVideoUrl: '',
      desktopVideoMediaQueryList: undefined as MediaQueryList | undefined
    };
  },
  watch: {
    desktopVideoUrl () {
      this.updateActiveVideoUrl();
    },
    mobileVideoUrl () {
      this.updateActiveVideoUrl();
    }
  },
  computed: {
    itemData (): HomepageIntroSectionData {
      return this.item as HomepageIntroSectionData;
    },
    hasDesktopVideo (): boolean {
      return !!this.desktopVideoUrl;
    },
    hasMobileVideo (): boolean {
      return !!this.mobileVideoUrl;
    },
    desktopVideoUrl (): string {
      const selector = this.itemData.background_video;

      return selector && selector.asset ? selector.asset.filename : '';
    },
    mobileVideoUrl (): string {
      const selector = this.itemData.mobile_background_video;

      return selector && selector.asset ? selector.asset.filename : '';
    },
    videoContainerClasses (): Record<string, boolean> {
      return {
        '-with-desktop-video': !!this.desktopVideoAspectRatio,
        '-with-mobile-video': !!this.mobileVideoAspectRatio
      };
    },
    desktopVideoAspectRatio (): number | undefined {
      const selector = this.itemData.background_video;

      return this.hasDesktopVideo && selector
        ? selector.aspect_ratio as number
        : undefined;
    },
    mobileVideoAspectRatio (): number | undefined {
      const selector = this.itemData.mobile_background_video;

      return this.hasMobileVideo && selector
        ? selector.aspect_ratio as number
        : undefined;
    },
    videoContainerStyles (): Record<string, string> {
      const styles: Record<string, string> = {};

      if (this.desktopVideoAspectRatio) {
        styles['--desktop-video-aspect-ratio'] = this.desktopVideoAspectRatio.toString();
      }

      if (this.mobileVideoAspectRatio) {
        styles['--mobile-video-aspect-ratio'] = this.mobileVideoAspectRatio.toString();
      }

      return styles;
    },
    extraStyles (): Record<string, string> {
      const styles: Record<string, string> = {};
      const desktopContentStart = this.normalizePercentage(this.itemData.desktop_content_start);
      const desktopContentEnd = this.normalizePercentage(this.itemData.desktop_content_end);

      if (this.itemData.background_color.color) {
        styles['--intro-section-background-color'] = this.itemData.background_color.color;
      }

      if (desktopContentStart) {
        styles['--desktop-content-start'] = desktopContentStart;
      }

      if (desktopContentEnd) {
        styles['--desktop-content-end'] = desktopContentEnd;
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
    this.desktopVideoMediaQueryList = this.window.matchMedia(
      `(min-width: ${BreakpointValue.SMALL + 1}px)`
    );
    this.desktopVideoMediaQueryList.addEventListener('change', this.updateActiveVideoUrl);
    this.updateActiveVideoUrl();
  },
  beforeDestroy () {
    if (this.desktopVideoMediaQueryList) {
      this.desktopVideoMediaQueryList.removeEventListener('change', this.updateActiveVideoUrl);
    }
  },
  methods: {
    updateActiveVideoUrl (): void {
      if (!this.desktopVideoMediaQueryList) {
        return;
      }

      this.activeVideoUrl = this.desktopVideoMediaQueryList.matches
        ? this.desktopVideoUrl
        : this.mobileVideoUrl;
    },
    normalizePercentage (value: number | string | undefined): string | undefined {
      if (value === undefined || value === '') {
        return;
      }

      const numericValue = Number(value);

      if (isNaN(numericValue)) {
        return;
      }

      return `${Math.min(Math.max(numericValue, 0), 100)}%`;
    },
    nl2br (text: string): string {
      return nl2br(text);
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
    overflow: hidden;
    position: relative;

    &.-with-mobile-video {
      aspect-ratio: var(--mobile-video-aspect-ratio);

      ._image {
        position: absolute;
        width: 100%;
        height: calc(100% + 2px);
        top: -1px;
        left: 0;
      }
    }
  }

  ._video-layer {
    display: block;
    position: absolute;
    top: -1px;
    left: 0;
    width: 100%;
    height: calc(100% + 2px);
    overflow: hidden;
    object-fit: cover;
    pointer-events: none;
    z-index: 1;
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
    ._image-column {
      &.-with-mobile-video {
        aspect-ratio: auto;

        ._image {
          position: relative;
        }
      }

      &.-with-desktop-video {
        aspect-ratio: var(--desktop-video-aspect-ratio);

        ._image {
          position: absolute;
          width: 100%;
          height: calc(100% + 2px);
          top: -1px;
          left: 0;
        }
      }
    }

    ._content {
      padding: 0 var(--desktop-content-end, 5%) 0 var(--desktop-content-start, 55%);
      position: absolute;
      top: 0;
      left: 0;
      text-align: left;
      z-index: 2;

      .sf-heading {
        text-align: inherit;
      }

      ._button-row {
        text-align: inherit;
      }
    }

    &.-align-center ._content {
      text-align: center;
    }

    &.-align-right ._content {
      text-align: right;
    }
  }

  @include display-property-handling;
}
</style>
