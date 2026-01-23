<template>
  <div
    ref="zoomGallery"
    class="m-zoom-gallery"
    :class="{
      '-horizontal': isHorizontalThumbnails,
    }"
  >
    <div class="_thumbnails">
      <o-carousel
        class="_carousel"
        ref="carousel"
        :items="carouselItems"
        :slides-per-view="slidesToShow"
        :show-counter="false"
        :expand-slide-width="false"
        :centered-slides="false"
        :show-navigation-buttons="false"
        :horizontal-slides="isHorizontalThumbnails"
        @slide-clicked="onThumbnailSlideClicked"
      >
        <template #default="{ item: asset }">
          <div
            :key="JSON.stringify(asset.thumb)"
            class="_thumbnail-item"
            :class="{'-video': asset.video}"
          >
            <div class="_thumbnail-item-content-wrapper">
              <BaseImage
                class="_image"
                object-fit="cover"
                :src="getImageSrc(asset, 'thumb')"
                :srcsets="getImageSrcSets(asset, 'thumb')"
                :fallback-srcset="getImageFallbackSrcSet(asset, 'thumbFallback')"
                :alt="getThumbnailAlt(asset)"
                :title="asset.title"
                :aspect-ratio="1.0"
              />
            </div>
          </div>
        </template>
      </o-carousel>
    </div>

    <div class="_stage">
      <div class="_stage-content">
        <div
          class="_arrow -left"
          :class="{ 'desktop-only': !wasVideoItemShown}"
          v-show="canShowArrows"
          @click="goToPreviousImage"
        />

        <div
          class="_cloud-zoom-wrapper"
          v-if="stageAsset && !stageAsset.video"
        >
          <div
            ref="stageImageWrapper"
            class="_image-wrapper cloud-zoom"
            :href="stageAsset.big"
          >
            <BaseImage
              class="_image"
              :src="getImageSrc(stageAsset, 'stage')"
              :srcsets="getImageSrcSets(stageAsset, 'stage')"
              :fallback-srcset="getImageFallbackSrcSet(stageAsset, 'stageFallback')"
              :alt="stageAsset.alt"
              :title="stageAsset.title"
              :aspect-ratio="1.0"
              :lazy="lazyLoadStageImage"
            />
          </div>
        </div>

        <o-carousel
          ref="stageCarousel"
          :show-counter="false"
          :items="carouselItems"
          :slides-per-view="STAGE_SLIDES_PER_VIEW"
          :show-navigation-buttons="false"
          @active-index-changed="onStageActiveIndexChanged"
        >
          <template #default="{ item: asset }">
            <div
              v-if="asset"
              class="_image-wrapper"
              :class="{ '-video': !!asset.video }"
            >
              <BaseImage
                v-if="!asset.video"
                class="_image"
                :src="getImageSrc(asset, 'stage')"
                :srcsets="getImageSrcSets(asset, 'stage')"
                :fallback-srcset="getImageFallbackSrcSet(asset, 'stageFallback')"
                :alt="asset.alt"
                :title="asset.title"
                :aspect-ratio="1.0"
                :lazy="true"
              />

              <div v-else class="_video-wrapper">
                <StreamingVideo
                  v-if="asset.video"
                  class="_streaming-video"
                  :video-id="asset.video.videoId"
                  :provider="asset.video.provider"
                  :display-controls="asset.video.displayControls"
                  :auto-play="asset.video.autoplay"
                />
              </div>
            </div>
          </template>
        </o-carousel>

        <div
          class="_arrow -right"
          :class="{ 'desktop-only': !wasVideoItemShown }"
          v-show="canShowArrows"
          @click="goToNextImage"
        />

        <div
          class="_mobile-swipe-hint mobile-only"
          v-show="canShowArrows && !stageAsset.video"
        >
          <div
            class="_bullets"
          >
            <div class="_bullet" />
            <div class="_bullet -center" />
            <div class="_bullet" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import debounce from 'lodash.debounce';
import Vue, { PropType } from 'vue';

import jQuery from 'jquery';

import { BaseImage, ImageSourceItem } from 'src/modules/budsies';
import { BreakpointValue, StreamingVideo } from 'src/modules/shared';
import ZoomGalleryAsset from 'theme/interfaces/zoom-gallery-asset.interface';

import OCarousel from '../organisms/o-carousel.vue';
import { OCarouselItem } from '../interfaces/o-carousel-item.interface';

require('@cabbiepete/cloud-zoom');
require('@cabbiepete/cloud-zoom/cloud-zoom.css');

type ImageKeys = keyof Omit<ZoomGalleryAsset, 'video'>;

const debounceTime = 300;

// hack to make one slide working with `loop` correctly.
const STAGE_SLIDES_PER_VIEW = 1.00001;

const STREAMING_VIDEO_SELECTOR = '._streaming-video';
const YOUTUBE_FACADE_SELECTOR = '._youtube-facade';

export default Vue.extend({
  name: 'MZoomGallery',
  components: {
    BaseImage,
    OCarousel,
    StreamingVideo
  },
  props: {
    images: {
      type: Array as PropType<ZoomGalleryAsset[]>,
      default: () => []
    },
    horizontalThumbnails: {
      type: Boolean,
      default: true
    },
    lazyLoadStageImage: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      fCurrentIndex: undefined as number | undefined,
      fShouldInitThumbnailsSlider: false,
      fWindowResizeHandler: undefined as unknown as () => void | undefined,
      fIsCloudZoomInitialized: false,
      slidesToShow: 5,
      STAGE_SLIDES_PER_VIEW,
      wasVideoItemShown: false
    };
  },
  computed: {
    canShowArrows (): boolean {
      return this.carouselItems.length > 1;
    },
    isFirstSlideActive (): boolean {
      return this.currentIndex === 0;
    },
    isLastSlideActive (): boolean {
      return this.currentIndex === this.carouselItems.length - 1;
    },
    carouselItems (): OCarouselItem[] {
      return this.images.map((asset) => {
        return {
          key: asset.big,
          data: asset
        };
      });
    },
    isHorizontalThumbnails (): boolean {
      if (this.horizontalThumbnails) {
        return true;
      }

      return false;
    },
    stageAsset (): ZoomGalleryAsset | undefined {
      if (this.currentIndex == null) {
        return undefined;
      }

      return this.images[this.currentIndex];
    },
    currentIndex: {
      get: function (): number | undefined {
        return this.fCurrentIndex;
      },
      set: function (index: number | undefined) {
        this.detachZoom();

        this.fCurrentIndex = index;

        if (index == null) {
          return;
        }

        this.$nextTick(() => {
          if (this.canCloudZoomInit()) {
            this.initCloudZoom();
          }
        });
      }
    },
    showArrows (): boolean {
      return this.images.length > this.slidesToShow;
    }
  },
  mounted () {
    this.fWindowResizeHandler = debounce(
      () => this.onWindowResizeHandler(),
      debounceTime
    );

    window.addEventListener('resize', this.fWindowResizeHandler);
  },
  beforeDestroy () {
    this.detachZoom();

    if (!this.fWindowResizeHandler) {
      return;
    }

    window.removeEventListener('resize', this.fWindowResizeHandler);
  },
  methods: {
    getThumbnailAlt (asset: ZoomGalleryAsset): string {
      if (!asset.alt) {
        return this.$t('Select to view image').toString();
      }

      return this.$t("Select to view '{alt}' image", {
        alt: asset.alt
      }).toString();
    },
    onStageActiveIndexChanged (realIndex: number): void {
      this.stopVideos();
      this.setCurrentIndex(realIndex);
      this.getCarousel().slideTo(realIndex);
    },
    onThumbnailSlideClicked (realIndex: number): void {
      const stageCarousel = this.getStageCarousel();

      stageCarousel.slideTo(realIndex);
    },
    stopVideos () {
      const stageCarousel = this.getStageCarousel();

      stageCarousel.$el.querySelectorAll(STREAMING_VIDEO_SELECTOR).forEach((element) => {
        const youtubeFacade = element.querySelector(YOUTUBE_FACADE_SELECTOR);

        if (!youtubeFacade || !youtubeFacade.shadowRoot) {
          return;
        }

        const iframe: HTMLIFrameElement | null = youtubeFacade.shadowRoot.querySelector('iframe');

        if (!iframe) {
          return;
        }

        iframe.contentWindow?.postMessage(
          '{"event":"command","func":"pauseVideo","args":""}',
          '*'
        );
      });
    },
    getStageCarousel (): InstanceType<typeof OCarousel> {
      return this.$refs.stageCarousel as InstanceType<typeof OCarousel>;
    },
    getCarousel (): InstanceType<typeof OCarousel> {
      return this.$refs.carousel as InstanceType<typeof OCarousel>;
    },
    goToPreviousImage (): void {
      if (this.currentIndex === undefined) {
        return;
      }

      let newIndex = this.currentIndex - 1;

      if (newIndex < 0) {
        newIndex = this.carouselItems.length - 1;
      }

      this.getStageCarousel().slideTo(newIndex);
    },
    goToNextImage (): void {
      if (this.currentIndex === undefined) {
        return;
      }

      let newIndex = this.currentIndex + 1;

      if (newIndex >= this.carouselItems.length) {
        newIndex = 0;
      }

      this.getStageCarousel().slideTo(newIndex);
    },
    canCloudZoomInit (): boolean {
      if (typeof window === 'undefined') {
        return false;
      }

      if (!this.stageAsset || this.stageAsset.video) {
        return false;
      }

      return window.innerWidth > BreakpointValue.MEDIUM;
    },
    getImageSrc (
      image: ZoomGalleryAsset,
      variant: ImageKeys
    ): string | undefined {
      const value = image[variant];
      if (typeof value !== 'string') {
        return undefined;
      }

      return value;
    },
    getImageSrcSets (
      image: ZoomGalleryAsset,
      variant: ImageKeys
    ): ImageSourceItem[] | undefined {
      const value = image[variant];
      if (!Array.isArray(value)) {
        return undefined;
      }

      return value;
    },
    getImageFallbackSrcSet (
      image: ZoomGalleryAsset,
      variant: ImageKeys
    ): ImageSourceItem | undefined {
      const value = image[variant];

      if (Array.isArray(value) || typeof value === 'string') {
        return undefined;
      }

      return value;
    },
    setCurrentIndex (index: number): void {
      const previousIndex = this.currentIndex;
      this.currentIndex = index;

      if (previousIndex !== this.currentIndex) {
        this.$emit('gallery-index-changed', this.currentIndex);
      }
    },
    detachZoom (): void {
      if (!this.fIsCloudZoomInitialized) {
        return;
      }

      const imageWrapper = this.getStageImageWrapper();

      if (!imageWrapper) {
        return;
      }

      const zoom = jQuery(imageWrapper).data('zoom');

      if (!zoom) {
        return;
      }

      zoom.destroy();
      this.fIsCloudZoomInitialized = false;
    },
    getStageImageWrapper (): HTMLElement | undefined {
      return this.$refs['stageImageWrapper'] as HTMLElement | undefined;
    },
    getZoomGallery (): HTMLElement | undefined {
      return this.$refs.zoomGallery as HTMLElement | undefined;
    },
    initCloudZoom (): void {
      if (this.fIsCloudZoomInitialized) {
        return;
      }

      const imageWrapper = this.getStageImageWrapper();

      if (!imageWrapper) {
        return;
      }

      (jQuery(imageWrapper) as any).CloudZoom({
        adjustX: 10,
        showTitle: false,
        transparentImage:
          'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
      });
      this.fIsCloudZoomInitialized = true;
    },
    onWindowResizeHandler (): void {
      if (!this.canCloudZoomInit()) {
        this.detachZoom();
      } else {
        this.detachZoom();
        this.$nextTick(() => {
          this.initCloudZoom();
        });
      }
    }
  },
  watch: {
    images: {
      handler (prev: ZoomGalleryAsset[], next: ZoomGalleryAsset[]) {
        if (JSON.stringify(prev) === JSON.stringify(next)) {
          return;
        }

        this.currentIndex = undefined;

        if (this.images.length) {
          this.currentIndex = 0;
        }
      },
      immediate: true
    },
    stageAsset: {
      handler (value: ZoomGalleryAsset | undefined) {
        if (value?.video) {
          this.wasVideoItemShown = true;
        }
      },
      immediate: true
    }
  }
});
</script>

<style lang="scss" scoped>
@import "theme/css/mixins/swiper-arrow.scss";

$bullet-size: 8px;

.m-zoom-gallery {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-start;
  position: relative;

  ._carousel {
    --carousel-navigation-size: var(--font-base);
  }

  ._mobile-swipe-hint {
    position: absolute;
    bottom: var(--spacer-xs);
    z-index: 100;
    width: 100%;
    display: flex;
    justify-content: center;

    ._bullets {
      display: flex;
      align-items: center;
      column-gap: var(--spacer-xs);

      ._bullet {
        box-sizing: border-box;
        flex-basis: $bullet-size;
        flex-shrink: 0;
        height: $bullet-size;
        border: 1px solid rgba(0, 0, 0, 0.2);
        border-radius: 100%;
        background-color: rgba(255, 255, 255, 0.3);

        &.-center {
          background-color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }

  ._thumbnails {
    width: 15.5%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;

    ._thumbnail-item {
      display: block !important;
      position: relative;
      cursor: pointer;
      padding-top: 100%;
      margin-bottom: 8.1%;

      &.-video {
        &::after {
          content: '';
          width: 36px;
          height: 36px;
          max-width: 50%;
          position: absolute;
          top: 0;
          right: 0;

          background: url("../../assets/images/video-icon.svg");
          background-size: 100%;
          background-repeat: no-repeat;
        }
      }
    }

    ._thumbnail-item-content-wrapper {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 100%;
    }
  }

  ._stage {
    padding-top: 83%;
    position: relative;
    width: 83%;

    ._stage-content {
      height: 100%;
      left: 0;
      position: absolute;
      top: 0;
      width: 100%;

      ._arrow {
        @include swiper-arrow();
        font-size: var(--font-base);
        z-index: 101;
      }
    }

    ._cloud-zoom-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;

      ._image {
        visibility: hidden;
      }
    }

    ._image-wrapper {
      display: block;
      height: 100%;
      width: 100%;

      ._image {
        width: 100%;
        height: 100%;
      }

      &.-video {
        padding-bottom: 100%;
      }
    }

    ._video-wrapper {
      width: 100%;
      height: 100%;
      position: absolute;

      .streaming-video {
        height: 100%;
        padding-top: 0;
      }
    }

    ::v-deep #wrap,
    ::v-deep .cloud-zoom-wrap {
      height: 100%;
      position: static;
      z-index: 100;

      .mousetrap {
        z-index: 100 !important;
      }

      .cloud-zoom-big {
        z-index: 150 !important;
        background-color: var(--c-white);
      }
    }
  }

  &.-horizontal {
    flex-direction: column-reverse;
    justify-content: space-between;

    ._thumbnails {
      position: relative;
      margin-top: 0.5em;
      width: 100%;
      padding-top: 18.99%;

      ._carousel {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
      }

      ._thumbnail-item {
        padding-top: 100%;
      }
    }

    ._stage {
      padding-top: 100%;
      width: 100%;
    }
  }
}
</style>
