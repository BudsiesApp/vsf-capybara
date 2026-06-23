<template>
  <div
    class="o-carousel"
    :class="{ '-vertical': !horizontalSlides }"
    :style="style"
  >
    <div ref="swiper" class="swiper">
      <div class="swiper-wrapper">
        <div
          class="swiper-slide"
          v-for="item in items"
          :key="item.key"
        >
          <slot :item="item.data" />
        </div>
      </div>

      <div
        class="swiper-buttons"
        :class="{ '-counter': showCounter }"
        v-show="isSwiperInitialized && showNavigationButtons"
      >
        <sf-button
          ref="prev-button"
          class="_arrow swiper-button-prev -left sf-button--pure"
          :class="{ '-vertical-layout': !horizontalSlides }"
          :aria-label="$t('Previous slide').toString()"
        />

        <div class="_counter" v-if="showCounter">
          {{ counterText }}
        </div>

        <sf-button
          ref="next-button"
          class="_arrow -right swiper-button-next sf-button--pure"
          :class="{ '-vertical-layout': !horizontalSlides }"
          :aria-label="$t('Next slide').toString()"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { SfButton } from '@storefront-ui/vue';
import Swiper from 'swiper';
import Autoplay from 'swiper/modules/autoplay.mjs';
import Navigation from 'swiper/modules/navigation.mjs';
import { SwiperOptions } from 'swiper/types/swiper-options';
import { AutoplayOptions } from 'swiper/types/modules/autoplay';

import 'swiper/swiper.scss';
import 'swiper/modules/navigation.scss';

import { BreakpointValue } from 'src/modules/shared';

import { OCarouselItem } from '../interfaces/o-carousel-item.interface';
import {
  mapMobileObserver,
  unMapMobileObserver
} from '@storefront-ui/vue/src/utilities/mobile-observer';

export default Vue.extend({
  name: 'OCarousel',
  components: {
    SfButton
  },
  props: {
    autoplay: {
      type: Boolean,
      default: false
    },
    autoplayDelay: {
      type: Number,
      default: 1000
    },
    slidesPerView: {
      type: Number,
      default: 4
    },
    slidesPerViewMobile: {
      type: Number,
      default: undefined
    },
    spaceBetween: {
      type: Number,
      default: 10
    },
    showCounter: {
      type: Boolean,
      default: true
    },
    items: {
      type: Array as PropType<OCarouselItem[]>,
      required: true
    },
    expandSlideWidth: {
      type: Boolean,
      default: true
    },
    centeredSlides: {
      type: Boolean,
      default: false
    },
    showNavigationButtons: {
      type: Boolean,
      default: true
    },
    horizontalSlides: {
      type: Boolean,
      default: true
    },
    loop: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      currentSlideIndex: 0,
      swiper: undefined as Swiper | undefined,
      isSwiperInitialized: false,
      fCurrentSlidesPerView: undefined as number | undefined
    };
  },
  computed: {
    ...mapMobileObserver(),
    autoplayOptions (): AutoplayOptions | boolean {
      if (!this.autoplay) {
        return false;
      }

      return {
        delay: this.autoplayDelay
      };
    },
    breakpoints (): {
      [width: number]: SwiperOptions,
      [ratio: string]: SwiperOptions
    } {
      return {
        [BreakpointValue.MEDIUM]: {
          slidesPerView: Math.min(this.slidesPerView, this.maxSlidesPerView)
        }
      };
    },
    itemsJson (): string {
      return JSON.stringify(this.items);
    },
    swiperOptions (): SwiperOptions {
      const direction = this.horizontalSlides ? 'horizontal' : 'vertical';

      return {
        autoplay: this.autoplayOptions,
        direction,
        loop: this.isLoopAvailable,
        slidesPerView: this.defaultSlidesPerView,
        slideToClickedSlide: false,
        loopAddBlankSlides: false,
        modules: [Autoplay, Navigation],
        init: false,
        breakpoints: this.breakpoints,
        spaceBetween: this.spaceBetween,
        centeredSlides: this.centeredSlides
      };
    },
    defaultSlidesPerView (): number {
      let defaultSlidesPerView = this.slidesPerViewMobile
        ? this.slidesPerViewMobile
        : this.slidesPerView;
      return Math.min(defaultSlidesPerView, this.maxSlidesPerView);
    },
    currentSlidesPerView (): number {
      if (this.fCurrentSlidesPerView !== undefined) {
        return this.fCurrentSlidesPerView;
      }

      return this.defaultSlidesPerView;
    },
    style (): Record<string, string> {
      const style: Record<string, string> = {};

      const gapTotal = this.spaceBetween * this.slidesPerView - this.spaceBetween;
      const oneItemGap = gapTotal / this.slidesPerView;

      style['--item-margin'] = `${this.spaceBetween}px`;
      style['--item-size'] = `calc(100% / ${this.slidesPerView} - ${oneItemGap}px)`;

      if (this.slidesPerViewMobile) {
        style['--item-size-mobile'] = `calc(100% / ${this.slidesPerViewMobile} - ${oneItemGap}px)`;
      }

      return style;
    },
    counterText (): string {
      return `${this.currentSlideIndex + 1} / ${this.items.length}`;
    },
    maxSlidesPerView (): number {
      if (this.expandSlideWidth) {
        return this.items.length;
      }

      return this.slidesPerView;
    },
    isLoopAvailable (): boolean {
      return this.loop && this.currentSlidesPerView < this.items.length;
    }
  },
  mounted (): void {
    this.initSwiper();
  },
  beforeDestroy (): void {
    unMapMobileObserver();
    this.destroySwiper();
  },
  methods: {
    getNavigationButtons (): {
      nextEl: Element,
      prevEl: Element
    } {
      const nextButton = this.$refs['next-button'] as InstanceType<typeof SfButton>;
      const prevButton = this.$refs['prev-button'] as InstanceType<typeof SfButton>;

      return {
        nextEl: nextButton.$el,
        prevEl: prevButton.$el
      }
    },
    getCarouselRoot (): HTMLElement {
      return this.$refs.swiper as HTMLElement;
    },
    initSwiper (): void {
      const onInit = (swiper: Swiper) => {
        this.isSwiperInitialized = true;
        this.$emit('swiper-init', swiper)
      };
      const onRealIndexChange = (swiper: Swiper) => {
        this.currentSlideIndex = swiper.realIndex;
        this.$emit(
          'active-index-changed',
          this.currentSlideIndex
        );
      };
      const onBreakpoint = (swiper: Swiper) => {
        if (swiper.params.slidesPerView === undefined || swiper.params.slidesPerView === 'auto') {
          return;
        }

        this.fCurrentSlidesPerView = swiper.params.slidesPerView;
      };
      const onSlideClick = (swiper: Swiper) => {
        if (swiper.clickedIndex === undefined) {
          return;
        }

        let slideIndex: string | number | null = swiper.clickedSlide.getAttribute('data-swiper-slide-index');

        // When loop mode is disabled we can just use `clickedIndex` property
        if (slideIndex === undefined || slideIndex === null) {
          slideIndex = swiper.clickedIndex;
        }

        this.$emit('slide-clicked', Number(slideIndex));
      }

      this.swiper = new Swiper(
        this.getCarouselRoot(),
        {
          ...this.swiperOptions,
          navigation: this.getNavigationButtons()
        }
      );

      this.swiper.on('init', onInit);
      this.swiper.on('realIndexChange', onRealIndexChange);
      this.swiper.on('click', onSlideClick);
      this.swiper.on('breakpoint', onBreakpoint);

      this.swiper.init();
    },
    destroySwiper (): void {
      if (!this.swiper) {
        return;
      }

      this.swiper.off('init');
      this.swiper.off('realIndexChange');
      this.swiper.off('click');
      this.swiper.destroy();
      this.swiper = undefined;
    },
    updateSwiper (options?: SwiperOptions): void {
      if (!this.swiper) {
        return;
      }

      if (options) {
        this.swiper.params = { ...this.swiper.params, ...options };
      }

      this.swiper.update();
    },
    async reInitSwiper (): Promise<void> {
      if (this.swiper) {
        this.destroySwiper();
      }

      // Need wait for Vue updated elements.
      // Otherwise it may lead to incorrect slides order.
      await this.$nextTick();

      this.initSwiper();
    },
    slideTo (index: number) {
      if (!this.swiper) {
        return;
      }

      if (this.isLoopAvailable) {
        this.swiper.slideToLoop(index);
        return;
      }

      this.swiper.slideTo(index);
    }
  },
  watch: {
    autoplay (val) {
      this.updateSwiper({ autoplay: this.autoplayOptions });

      if (!this.swiper) {
        return;
      }

      if (val) {
        this.swiper.autoplay.start();
      } else {
        this.swiper.autoplay.stop();
      }
    },
    autoplayDelay () {
      this.updateSwiper({ autoplay: this.autoplayOptions });
    },
    slidesPerView () {
      this.reInitSwiper();
    },
    slidesPerViewMobile () {
      this.reInitSwiper();
    },
    spaceBetween (val) {
      this.updateSwiper({ spaceBetween: val });
    },
    itemsJson (newValue: string, oldValue: string) {
      if (newValue === oldValue) {
        return;
      }

      this.reInitSwiper();
    },
    isMobile () {
      this.updateSwiper();
    },
    centeredSlides (val) {
      this.updateSwiper({ centeredSlides: val });
    },
    horizontalSlides () {
      this.reInitSwiper();
    },
    isLoopAvailable () {
      this.reInitSwiper();
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "theme/css/mixins/swiper-arrow.scss";

.o-carousel {
  .swiper-wrapper {
    padding: 0;
  }

  .swiper {
    height: 100%;
    width: 100%;
  }

  .swiper-slide {
    width: var(--item-size-mobile, --item-size);
    margin-right: var(--item-margin);
  }

  .swiper-buttons {
    --swiper-navigation-size: var(--carousel-navigation-size, var(--font-2xl));
    --swiper-navigation-color: var(--c-text);

    display: flex;

    ._arrow {
      --swiper-navigation-sides-offset: 0;

      @include swiper-arrow();

      &[disabled] {
        display: none;
      }
    }

    &.-counter {
      --swiper-navigation-size: var(--font-sm);

      margin-top: var(--spacer-sm);
      align-items: flex-end;
      justify-content: center;
      position: relative;
      width: auto;

      ._arrow {
        background: transparent;
        width: auto;
        height: auto;
        position: relative;
        top: auto;
        left: auto;
        right: auto;
      }
    }
  }

  ._counter {
    margin: 0 var(--spacer-base);
    line-height: 1;
  }

  .swiper-button-lock {
    --next-arrow-display: none;
    --previous-arrow-display: none;

    + ._counter {
      display: none;
    }
  }

  &.-vertical {
    height: 100%;

    .swiper-wrapper {
      flex-direction: column;
    }

    .swiper-slide {
      width: 100%;
      height: var(--item-size-mobile, --item-size);
      margin-right: 0;
      margin-bottom: var(--item-margin);
    }
  }

  @include for-desktop {
    &.-vertical {
      .swiper-slide {
        height: var(--item-size);
      }
    }

    .swiper-slide {
      width: var(--item-size);
    }
  }
}
</style>
