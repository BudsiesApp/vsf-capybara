<template>
  <div
    ref="zoomGallery"
    class="m-zoom-gallery"
    :class="{
      '-horizontal': isHorizontalThumbnails,
      '-first-slide-active': isFirstSlideActive,
      '-last-slide-active': isLastSlideActive
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
        :slide-to-clicked-slide="true"
        @slide-clicked="setCurrentIndex"
      >
        <template #default="{ item: image  }">
          <div
            :key="JSON.stringify(image.thumb)"
            class="_thumbnail-item"
          >
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
        <div class="_arrow -left" @click="goToPreviousImage" />
        <div
          ref="stageImageWrapper"
          class="_image-wrapper cloud-zoom"
          :href="stageImage.big"
          v-if="stageImage"
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
        <div class="_arrow -right" @click="goToNextImage" />
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
      slidesToShow: 5
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
    getCarousel (): InstanceType<typeof OCarousel> {
      return this.$refs.carousel as InstanceType<typeof OCarousel>;
    },
    goToPreviousImage (): void {
      if (this.currentIndex === undefined) {
        return;
      }

      const newIndex = this.currentIndex - 1;

      if (newIndex < 0) {
        return;
      }

      this.currentIndex = newIndex;
      this.getCarousel().slidePrevious();
    },
    goToNextImage (): void {
      if (this.currentIndex === undefined) {
        return;
      }

      const newIndex = this.currentIndex + 1;

      if (newIndex >= this.carouselItems.length) {
        return;
      }

      this.currentIndex = newIndex;
      this.getCarousel().slideNext();
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

        if (this.images.length) {
          this.currentIndex = 0;
        }
      },
      immediate: true
    }
  }
});
</script>

<style lang="scss" scoped>
@import "theme/css/mixins/swiper-arrow.scss";

.m-zoom-gallery {
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  ._carousel {
    --carousel-navigation-size: var(--font-base);
  }

  &.-first-slide-active {
    ._carousel,
    ._stage-content {
      --previous-arrow-display: none;
    }
  }

  &.-last-slide-active {
    ._stage-content {
      --next-arrow-display: none;
    }
  }

  ._thumbnails {
    width: 15.5%;

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
        font-size: var(--font-xl);
        z-index: 101;

        &.-right {
          left: auto;
          right: 0;
        }

        &.-left {
          right: auto;
          left: 0;
        }
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
      padding-top: 99%;
      width: 100%;
    }
  }
}
</style>
