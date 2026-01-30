<template>
  <div
    class="storyblok-slider layout-regular-component"
    :class="cssClasses"
  >
    <editor-block-icons :item="itemData" />

    <MZoomGallery
      :images="slides"
      :horizontal-thumbnails="isHorizontalThumbnails"
      :lazy-load-stage-image="itemData.delay_image_load"
    />
  </div>
</template>

<script lang="ts">
import { VueConstructor } from 'vue';

import { InjectType } from 'src/modules/shared';
import { ComponentWidthCalculator, SizeValue } from 'src/modules/vsf-storyblok-module';

import MZoomGallery from 'theme/components/molecules/m-zoom-gallery.vue';
import ZoomGalleryAsset from 'theme/interfaces/zoom-gallery-asset.interface';
import { getZoomGalleryAssetForVideoData } from 'theme/helpers/get-zoom-gallery-asset-for-video-data.function';

import { Blok } from 'src/modules/vsf-storyblok-module/components'
import SliderData from './interfaces/slider-data.interface';
import { isVideoData } from './interfaces/video-data.interface';
import { ThumbnailsPosition } from './interfaces/thumbnails-position.value';
import generateBreakpointsSpecs from './generate-breakpoints-specs';
import generateImageSourcesList from './generate-image-sources-list';
import getResizedImageUrl from './get-resized-image-url';

interface InjectedServices {
  componentWidthCalculator: ComponentWidthCalculator
}

export default (Blok as VueConstructor<InstanceType<typeof Blok> & InjectedServices>).extend({
  name: 'StoryblokSlider',
  components: {
    MZoomGallery
  },
  inject: {
    componentWidthCalculator: { }
  } as unknown as InjectType<InjectedServices>,
  computed: {
    itemData (): SliderData {
      return this.item as SliderData;
    },
    slides (): ZoomGalleryAsset[] {
      const slides: ZoomGalleryAsset[] = [];

      for (const sliderItem of this.itemData.slider_items) {
        if (isVideoData(sliderItem)) {
          const videoSlide = getZoomGalleryAssetForVideoData(sliderItem);

          if (videoSlide) {
            slides.push(videoSlide);
          }

          continue;
        }

        if (!sliderItem.image.filename) {
          continue;
        }

        let breakpointsSpecs = generateBreakpointsSpecs(
          sliderItem.image.filename,
          this.componentWidthCalculator,
          sliderItem.mobile_image.filename
        )

        const stage = generateImageSourcesList(
          breakpointsSpecs,
          1
        );

        const thumbWidthCalculator = this.componentWidthCalculator.limitAllByPercent(20);

        breakpointsSpecs = generateBreakpointsSpecs(
          sliderItem.image.filename,
          thumbWidthCalculator,
          sliderItem.mobile_image.filename
        )

        const thumb = generateImageSourcesList(
          breakpointsSpecs,
          1
        );

        const brakpointsList = this.componentWidthCalculator.getBreakpoints();

        const big = getResizedImageUrl(
          sliderItem.image.filename,
          brakpointsList[SizeValue.xlarge]
        )

        const slide: ZoomGalleryAsset = {
          thumb: thumb.sourceItems,
          thumbFallback: thumb.fallbackSourceItem,
          stage: stage.sourceItems,
          stageFallback: stage.fallbackSourceItem,
          big,
          alt: sliderItem.alt_tag,
          title: sliderItem.title_tag
        };

        slides.push(slide);
      }

      return slides;
    },
    isHorizontalThumbnails (): boolean {
      return this.itemData.thumbnails_position === ThumbnailsPosition.HORIZONTAL;
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-slider {
  @include display-property-handling;
}
</style>
