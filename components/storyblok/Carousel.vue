<template>
  <div
    class="storyblok-carousel layout-regular-component"
    :class="cssClasses"
  >
    <editor-block-icons :item="itemData" />

    <o-carousel
      :autoplay="itemData.autoplay"
      :autoplay-delay="autoplayDelay"
      :slides-per-view="slidesPerView"
      :slides-per-view-mobile="slidesPerViewMobile"
      :space-between="spaceBetween"
      :show-counter="itemData.showCounter"
      :items="carouselItems"
    >
      <template v-slot="props">
        <sb-render
          class="box _item"
          :item="props.item"
        />
      </template>
    </o-carousel>
  </div>
</template>

<script lang="ts">
import { Blok } from 'src/modules/vsf-storyblok-module/components';

import { CarouselData } from './interfaces/carousel-data.interface';
import { OCarouselItem } from '../interfaces/o-carousel-item.interface';

import OCarousel from '../organisms/o-carousel.vue';

export default Blok.extend({
  name: 'StoryblokCarousel',
  components: {
    OCarousel
  },
  computed: {
    itemData (): CarouselData {
      return this.item as CarouselData;
    },
    autoplayDelay (): number | undefined {
      return this.itemData.autoplayDelay ? Number(this.itemData.autoplayDelay) * 1000 : undefined;
    },
    carouselItems (): OCarouselItem[] {
      return this.itemData.items.map((item) => {
        return {
          key: item._uid,
          data: item
        }
      });
    },
    spaceBetween (): number | undefined {
      return this.itemData.spaceBetween ? Number(this.itemData.spaceBetween) : undefined;
    },
    slidesPerView (): number {
      return Number(this.itemData.slidesPerView);
    },
    slidesPerViewMobile (): number | undefined {
      return this.itemData.slidesPerViewMobile ? Number(this.itemData.slidesPerViewMobile) : undefined;
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "src/modules/vsf-storyblok-module/components/defaults/mixins";

.storyblok-carousel {
  @include display-property-handling;
}
</style>
