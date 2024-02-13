<template>
  <div
    ref="zoomGallery"
    class="m-zoom-gallery"
    :class="{
      '-horizontal': isHorizontalThumbnails,
      '-slider-disabled': !shouldInitThumbnailsSlider,
      '-show-arrows': showArrows
    }"
  >
    <div
      class="_thumbnails"
    >
      <component
        :is="shouldInitThumbnailsSlider ? 'VueSlickCarousel' : 'div'"
        class="_carousel"
        :arrows="showArrows"
        :vertical="!isHorizontalThumbnails"
        :slides-to-show="slidesToShow"
        :slides-to-scroll="1"
        :focus-on-select="true"
      >
        <template #prevArrow="{currentSlide}">
          <button v-show="currentSlide != 0" />
        </template>

        <div
          v-for="(image, index) in images"
          :key="JSON.stringify(image.thumb)"
          class="_thumbnail-item"
          @click="setCurrentIndex(index)"
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
      </component>
    </div>

    <div class="_stage">
      <div class="_stage-content">
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
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import debounce from 'lodash.debounce';
import Vue, { PropType } from 'vue';

import VueSlickCarousel from 'vue-slick-carousel';
import jQuery from 'jquery';
import 'vue-slick-carousel/dist/vue-slick-carousel.css';
import 'vue-slick-carousel/dist/vue-slick-carousel-theme.css';

import { BaseImage, ImageSourceItem } from 'src/modules/budsies';
import ZoomGalleryImage from 'theme/interfaces/zoom-gallery-image.interface';

require('@cabbiepete/cloud-zoom');
require('@cabbiepete/cloud-zoom/cloud-zoom.css');

type ImageKeys = keyof ZoomGalleryImage;

const maximumZoomGalleryWidthAllowedForCloudZoomInit = 50;
const debounceTime = 300;

export default Vue.extend({
  name: 'MZoomGallery',
  components: {
    BaseImage,
    VueSlickCarousel
  },
  props: {
    images: {
      type: Array as PropType<ZoomGalleryImage[]>,
      default: () => []
    },
    horizontalThumbnails: {
      type: Boolean,
      default: false
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
    }
  },
  computed: {
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
    shouldInitThumbnailsSlider: function (): boolean {
      return this.fShouldInitThumbnailsSlider;
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
    getImageSrc (image: ZoomGalleryImage, variant: ImageKeys): string | undefined {
      const value = image[variant];
      if (typeof value !== 'string') {
        return undefined;
      }

      return value;
    },
    getImageSrcSets (image: ZoomGalleryImage, variant: ImageKeys): ImageSourceItem[] | undefined {
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
        transparentImage: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
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
        };

        this.fShouldInitThumbnailsSlider = false;

        this.currentIndex = undefined;

        if (this.images.length) {
          this.currentIndex = 0;

          this.$nextTick(() => {
            this.fShouldInitThumbnailsSlider = true;
          })
        }
      },
      immediate: true
    }
  }
})
</script>

<style lang="scss" scoped>
.m-zoom-gallery {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

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

        ::v-deep {
          .slick-list {
            .slick-track {
                height: auto !important;
            }

            .slick-slide {
              border: none;

              &:first-child {
                ._thumbnail-item {
                  margin-top: 0;
                }
              }

              &:last-child {
                ._thumbnail-item {
                    margin-bottom: 0;
                }
              }
            }
          }

          .slick-slider {
            .slick-prev,
            .slick-next {
              height: 100%;
              width: 35px;
              background: rgba(245, 245,245, 0.7);
              z-index: 2;

              &:before {
                color: var(--c-text);
                font-size: 25px;
                display: inline-block;
              }
            }

            .slick-prev {
              left: 0;
              padding: 0 2px 0 4px;
            }

            .slick-next {
              right: 0;
              padding: 0 4px 0 2px;
            }

            &.slick-vertical {
              .slick-prev,
              .slick-next {
                height: 35px;
                width: 100%;
                transform: none;

                &::before {
                  transform: rotate(90deg);
                }
              }

              .slick-prev {
                top: 0;
                bottom: auto;
                padding: 4px 0 2px;
              }

              .slick-next {
                bottom: 0;
                top: auto;
                padding: 2px 0 4px;
              }
            }
          }
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

            ::v-deep .slick-track {
                display: flex;
                justify-content: center;

                .slick-slide {
                    margin: 0 0.15em;
                }
            }
        }

        ._stage {
            padding-top: 99%;
            width: 100%;
        }
    }

    &.-slider-disabled {
      ._carousel {
        display: grid;
        grid-template-rows: repeat(5, minmax(0, 1fr));
        grid-template-columns: 1fr;
        grid-auto-columns: 0;
        grid-auto-rows: 0;
        overflow: hidden;
      }

      &.-horizontal {
        ._carousel {
          grid-template-columns: repeat(5, minmax(0, 1fr));
          grid-template-rows: 1fr;
          grid-column-gap: 1%;
        }
      }
    }
}
</style>
