<template>
  <div
    class="o-carousel"
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
        v-show="isSwiperInitialized"
      >
        <sf-button
          ref="prev-button"
          class="_arrow swiper-button-prev -left sf-button--pure"
        />

        <div class="_counter" v-if="showCounter">
          {{ counterText }}
        </div>

        <sf-button
          ref="next-button"
          class="_arrow -right swiper-button-next sf-button--pure"
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
    }
  },
  data () {
    return {
      currentSlideIndex: 0,
      swiper: undefined as Swiper | undefined,
      isSwiperInitialized: false
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
    swiperOptions (): SwiperOptions {
      return {
        autoplay: this.autoplayOptions,
        direction: 'horizontal',
        loop: true,
        slidesPerView: this.defaultSlidesPerView,
        modules: [Autoplay, Navigation],

        init: false,
        breakpoints: this.breakpoints,
        spaceBetween: this.spaceBetween
      };
    },
    defaultSlidesPerView (): number {
      let defaultSlidesPerView = this.slidesPerViewMobile
        ? this.slidesPerViewMobile
        : this.slidesPerView;
      return Math.min(defaultSlidesPerView, this.maxSlidesPerView);
    },
    style (): Record<string, string> {
      const style: Record<string, string> = {};

      const gapTotal = this.spaceBetween * this.slidesPerView - this.spaceBetween;
      const oneItemGap = gapTotal / this.slidesPerView;

      style['--item-margin'] = `${this.spaceBetween}px`;
      style['--item-width'] = `calc(100% / ${this.slidesPerView} - ${oneItemGap}px)`;

      if (this.slidesPerViewMobile) {
        style['--item-width-mobile'] = `calc(100% / ${this.slidesPerViewMobile} - ${oneItemGap}px)`;
      }

      return style;
    },
    counterText (): string {
      return `${this.currentSlideIndex + 1} / ${this.items.length}`;
    },
    maxSlidesPerView (): number {
      return this.items.length;
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
      const onInit = () => {
        this.isSwiperInitialized = true;
      };
      const onRealIndexChange = (swiper: Swiper) => {
        this.currentSlideIndex = swiper.realIndex;
      };

      this.swiper = new Swiper(
        this.getCarouselRoot(),
        {
          ...this.swiperOptions,
          navigation: this.getNavigationButtons()
        }
      );

      this.swiper.on('init', onInit);
      this.swiper.on('realIndexChange', onRealIndexChange);

      this.swiper.init();
    },
    destroySwiper (): void {
      if (!this.swiper) {
        return;
      }

      this.swiper.off('init');
      this.swiper.off('realIndexChange');
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
    'items.length' () {
      this.reInitSwiper();
    },
    isMobile () {
      this.updateSwiper();
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.o-carousel {
  position: relative;

  .swiper-wrapper {
    padding: 0;
  }

  .swiper-slide {
    width: var(--item-width-mobile, --item-width);
    margin-right: var(--item-margin);
  }

  .swiper-buttons {
    --swiper-navigation-size: var(--font-xl);
    --swiper-navigation-color: var(--c-primary);

    display: flex;

    ._arrow {
      --swiper-navigation-sides-offset: 0;

      height: 35%;
      background: #fffefeb3;
      transform: translateY(-50%);
      margin-top: 0;

      &.-left {
        padding-left: var(--spacer-sm);
        padding-right: var(--spacer-base);
        border-top-right-radius: 12px;
        border-bottom-right-radius: 12px;
      }

      &.-right {
        padding-right: var(--spacer-sm);
        padding-left: var(--spacer-base);
        border-top-left-radius: 12px;
        border-bottom-left-radius: 12px;
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
    + ._counter {
      display: none;
    }
  }

  @include for-desktop {
    .swiper-slide {
      width: var(--item-width);
    }
  }
}
</style>
