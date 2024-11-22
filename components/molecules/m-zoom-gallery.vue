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
        @active-index-changed="onThumbnailActiveIndexChanged"
      >
        <template #default="{ item: image }">
          <div :key="JSON.stringify(image.thumb)" class="_thumbnail-item">
            <div class="_thumbnail-item-content-wrapper">
              <BaseImage
                class="_image"
                object-fit="cover"
                :src="getImageSrc(image, 'thumb')"
                :srcsets="getImageSrcSets(image, 'thumb')"
                :alt="image.alt"
                :title="image.title"
                :aspect-ratio="1.0"
              />
            </div>
          </div>
        </template>
      </o-carousel>
    </div>

    <div class="_stage">
      <div class="_stage-content">
        <div class="_arrow -left desktop-only" @click="goToPreviousImage" />

        <div class="_cloud-zoom-wrapper" v-if="stageImage">
          <div
            ref="stageImageWrapper"
            class="_image-wrapper cloud-zoom"
            :href="stageImage.big"
          >
            <BaseImage
              class="_image"
              :src="getImageSrc(stageImage, 'stage')"
              :srcsets="getImageSrcSets(stageImage, 'stage')"
              :alt="stageImage.alt"
              :title="stageImage.title"
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
          <template #default="{ item: image }">
            <div
              class="_image-wrapper"
              :href="image.big"
              v-if="image"
            >
              <BaseImage
                class="_image"
                :src="getImageSrc(image, 'stage')"
                :srcsets="getImageSrcSets(image, 'stage')"
                :alt="image.alt"
                :title="image.title"
                :aspect-ratio="1.0"
                :lazy="true"
              />
            </div>
          </template>
        </o-carousel>

        <div class="_arrow -right desktop-only" @click="goToNextImage" />

        <div class="_mobile-swipe-hint mobile-only" v-show="carouselItems.length > 1">
          <div class="_bullets-container">
            <div
              class="_bullets"
              :class="animationClass"
              @animationend="onBulletsAnimationEnd"
            >
              <div class="_bullet" />
              <div class="_bullet -previous" />
              <div class="_bullet -center" />
              <div class="_bullet -next" />
              <div class="_bullet" />
            </div>
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
import ZoomGalleryImage from 'theme/interfaces/zoom-gallery-image.interface';

import OCarousel from '../organisms/o-carousel.vue';
import { OCarouselItem } from '../interfaces/o-carousel-item.interface';

require('@cabbiepete/cloud-zoom');
require('@cabbiepete/cloud-zoom/cloud-zoom.css');

type ImageKeys = keyof ZoomGalleryImage;

const maximumZoomGalleryWidthAllowedForCloudZoomInit = 50;
const debounceTime = 300;

// hack to make one slide working with `loop` correctly.
const STAGE_SLIDES_PER_VIEW = 1.00001;

enum BulletsAnimationClass {
  NEXT = '-slide-next',
  PREVIOUS = '-slide-previous'
}

enum ClickedSlidePosition {
  NEXT = 'next',
  PREVIOUS = 'previous'
}

export default Vue.extend({
  name: 'MZoomGallery',
  components: {
    BaseImage,
    OCarousel
  },
  props: {
    images: {
      type: Array as PropType<ZoomGalleryImage[]>,
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
      fWindowResizeHandler: undefined as () => void | undefined,
      fIsCloudZoomInitialized: false,
      slidesToShow: 5,
      STAGE_SLIDES_PER_VIEW,
      animationClass: undefined as undefined | BulletsAnimationClass,
      lastClickedSlide: undefined as undefined | ClickedSlidePosition,
      currentLoopIndex: undefined as number | undefined
    };
  },
  computed: {
    isFirstSlideActive (): boolean {
      return this.currentIndex === 0;
    },
    isLastSlideActive (): boolean {
      return this.currentIndex === this.carouselItems.length - 1;
    },
    carouselItems (): OCarouselItem[] {
      return this.images.map((image) => {
        return {
          key: image.big,
          data: image
        };
      });
    },
    isHorizontalThumbnails (): boolean {
      if (this.horizontalThumbnails) {
        return true;
      }

      return false;
    },
    stageImage (): ZoomGalleryImage | undefined {
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
    onBulletsAnimationEnd (): void {
      this.animationClass = undefined;
    },
    onStageActiveIndexChanged (
      {
        realIndex
      }: {
        realIndex: number,
        index: number
      }
    ): void {
      if (this.currentIndex !== undefined) {
        const isLoopBackward = realIndex === this.carouselItems.length - 1 &&
          this.currentIndex === 0;
        const isLoopForward = realIndex === 0 &&
          this.currentIndex === this.carouselItems.length - 1;

        let isNextSlideSelected = !isLoopBackward &&
          (realIndex > this.currentIndex || isLoopForward);

        if (this.lastClickedSlide) {
          isNextSlideSelected = this.lastClickedSlide === ClickedSlidePosition.NEXT;
        }

        this.animationClass = isNextSlideSelected
          ? BulletsAnimationClass.NEXT
          : BulletsAnimationClass.PREVIOUS;
      } else {
        this.animationClass = undefined;
      }

      this.setCurrentIndex(realIndex);
      this.getCarousel().slideTo(realIndex);
      this.lastClickedSlide = undefined;
    },
    onThumbnailActiveIndexChanged (
      {
        index
      }: {
        realIndex: number,
        index: number
      }
    ): void {
      this.currentLoopIndex = index;
    },
    onThumbnailSlideClicked (
      {
        realIndex,
        index
      }: {
        realIndex: number,
        index: number
      }
    ): void {
      if (this.currentLoopIndex !== undefined) {
        this.lastClickedSlide = index > this.currentLoopIndex
          ? ClickedSlidePosition.NEXT
          : ClickedSlidePosition.PREVIOUS;
      }

      const stageCarousel = this.getStageCarousel();

      stageCarousel.slideTo(realIndex);
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
      const zoomGallery = this.getZoomGallery();

      if (!zoomGallery) {
        return false;
      }
      const zoomGalleryWidthInPercent =
        (zoomGallery.clientWidth / window.innerWidth) * 100;

      return (
        zoomGalleryWidthInPercent <=
        maximumZoomGalleryWidthAllowedForCloudZoomInit
      );
    },
    getImageSrc (
      image: ZoomGalleryImage,
      variant: ImageKeys
    ): string | undefined {
      const value = image[variant];
      if (typeof value !== 'string') {
        return undefined;
      }

      return value;
    },
    getImageSrcSets (
      image: ZoomGalleryImage,
      variant: ImageKeys
    ): ImageSourceItem[] | undefined {
      const value = image[variant];
      if (!Array.isArray(value)) {
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
      handler (prev: ZoomGalleryImage[], next: ZoomGalleryImage[]) {
        if (JSON.stringify(prev) === JSON.stringify(next)) {
          return;
        }

        this.currentIndex = undefined;
        this.currentLoopIndex = undefined;

        if (this.images.length) {
          this.currentIndex = 0;
          this.currentLoopIndex = 0;
        }
      },
      immediate: true
    }
  }
});
</script>

<style lang="scss" scoped>
@import "theme/css/mixins/swiper-arrow.scss";

$bullet-size: 12px;
$animation-duration: 0.3s;

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
    bottom: var(--spacer-2xs);
    z-index: 100;
    width: 100%;
    display: flex;
    justify-content: center;

    ._bullets-container {
      overflow: hidden;
      width: calc(calc(#{$bullet-size} * 3) + var(--spacer-sm));
      background-color: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
      padding: var(--spacer-2xs);
    }

    ._bullets {
      display: flex;
      height: 16px;
      align-items: center;
      column-gap: var(--spacer-xs);
      transform: translateX(calc(#{$bullet-size} * -2 + var(--spacer-2xs)));

      &.-slide-previous {
        animation: slide-previous $animation-duration;

        ._bullet {
          &.-center {
            animation: bullet-unscale $animation-duration;
          }

          &.-previous {
            animation: bullet-scale $animation-duration;
          }
        }
      }

      &.-slide-next {
        animation: slide-next $animation-duration;

        ._bullet {
          &.-center {
            animation: bullet-unscale $animation-duration;
          }

          &.-next {
            animation: bullet-scale $animation-duration;
          }
        }
      }

      ._bullet {
        box-sizing: border-box;
        flex-basis: $bullet-size;
        flex-shrink: 0;
        height: $bullet-size;
        border: 1px solid var(--c-white);
        border-radius: 100%;

        &.-center {
          background-color: var(--c-white);
          transform: scale(1.3);
        }
      }
    }

    @keyframes bullet-unscale {
      to {
        transform: scale(1);
        background-color: rgba(0, 0, 0, 0);
      }
    }

    @keyframes bullet-scale {
      to {
        transform: scale(1.3);
        background-color: var(--c-white);
      }
    }

    @keyframes slide-previous {
      to {
        transform: translateX(0);
      }
    }

    @keyframes slide-next {
      to {
        transform: translateX(calc(#{$bullet-size} * -4 + 0.5rem));
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
