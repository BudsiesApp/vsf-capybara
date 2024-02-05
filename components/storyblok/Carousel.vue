<template>
  <div
    class="storyblok-carousel layout-regular-component"
    :class="cssClasses"
  >
    <editor-block-icons :item="itemData" />

    <o-carousel
      :autoplay="itemData.autoplay"
      :per-view="perView"
      :per-view-mobile="perViewMobile"
      :gap="gap"
      :peek="peek"
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
    carouselItems (): OCarouselItem[] {
      return this.itemData.items.map((item) => {
        return {
          key: item._uid,
          data: item
        }
      });
    },
    gap (): number | undefined {
      return this.itemData.gap ? Number(this.itemData.gap) : undefined;
    },
    peek (): number | undefined {
      return this.itemData.peek ? Number(this.itemData.peek) : undefined;
    },
    perView (): number {
      return Number(this.itemData.perView);
    },
    perViewMobile (): number | undefined {
      return this.itemData.perView ? Number(this.itemData.perView) : undefined;
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
