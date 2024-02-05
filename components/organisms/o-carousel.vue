<template>
  <div
    class="o-carousel"
    :style="style"
  >
    <div ref="glide" class="glide">
      <div class="glide__track" data-glide-el="track">
        <ul class="glide__slides">
          <li
            class="glide__slide"
            v-for="(item) in items"
            :key="item.key"
          >
            <slot :item="item.data" />
          </li>
        </ul>
      </div>

      <div
        class="glide__arrows"
        :class="{'-counter': showCounter}"
        data-glide-el="controls"
      >
        <sf-button
          class="_arrow glide__arrows-left sf-button--pure"
          data-glide-dir="<"
        >
          &lt;
        </sf-button>

        <div class="_counter" v-if="showCounter">
          {{ counterText }}
        </div>

        <sf-button
          class="_arrow _arrow-right glide__arrows-right sf-button--pure"
          data-glide-dir=">"
        >
          &gt;
        </sf-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { SfButton } from '@storefront-ui/vue';
import Glide from '@glidejs/glide';

import { OCarouselItem } from '../interfaces/o-carousel-item.interface';

export default Vue.extend({
  name: 'StoryblokCarousel',
  components: {
    SfButton
  },
  props: {
    autoplay: {
      type: Boolean,
      default: false
    },
    perView: {
      type: Number,
      default: 6
    },
    perViewMobile: {
      type: Number,
      default: undefined
    },
    gap: {
      type: Number,
      default: 10
    },
    peek: {
      type: Number,
      default: 50
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
      glide: undefined as Glide.Properties | undefined
    }
  },
  computed: {
    breakpoints (): Record<number, {perView: number}> {
      if (!this.perViewMobile) {
        return {};
      }

      return {
        1023: {
          perView: Number(this.perViewMobile)
        }
      }
    },
    carouselSettings (): Record<string, any> {
      return {
        autoplay: this.autoplay,
        perView: Number(this.perView),
        breakpoints: this.breakpoints,
        type: 'carousel',
        gap: this.gap,
        peek: {
          after: this.peek,
          before: 0
        }
      }
    },
    style (): Record<string, string> {
      const style: Record<string, string> = {};

      const gapTotal = this.gap * this.perView - this.gap / 2 + (this.peek - this.gap / 2);
      const oneItemGap = gapTotal / this.perView;

      style['--item-margin'] = `${this.gap / 2}px`;
      style['--item-width'] = `calc(100% / ${this.perView} - ${oneItemGap}px)`;

      if (this.perViewMobile) {
        style['--item-width-mobile'] = `calc(100% / ${this.perViewMobile} - ${oneItemGap}px)`;
      }

      return style;
    },
    counterText (): string {
      return `${this.currentSlideIndex + 1} / ${this.items.length}`;
    }
  },
  mounted (): void {
    this.mountCarousel();
  },
  methods: {
    getCarouselRoot (): HTMLElement {
      return this.$refs.glide as HTMLElement;
    },
    mountCarousel () {
      const glide = new Glide(
        this.getCarouselRoot(),
        this.carouselSettings
      );

      glide.on(['mount.after', 'run'], () => {
        if (!this.glide) {
          return;
        }

        this.currentSlideIndex = (this.glide as any).index;
      });

      this.glide = glide.mount();
    },
    updateSettings (options: any) {
      if (!this.glide) {
        return;
      }

      this.glide.update(options);
    }
  },
  watch: {
    autoplay (val) {
      this.updateSettings({ autoplay: val })
    },
    perView (val) {
      this.updateSettings({ perView: val })
    },
    perViewMobile () {
      this.updateSettings({ breakpoints: this.breakpoints })
    },
    gap (val) {
      this.updateSettings({ gap: val })
    },
    peek (val) {
      this.updateSettings({ peek: val })
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.o-carousel {
  .glide {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .glide__track {
    width: 100%;
  }

  .glide__slide {
    width: var(--item-width-mobile, --item-width);
    margin: 0 var(--item-margin);

    &:first-child {
      margin-left: 0;
    }
  }

  .glide__arrows {
    display: flex;
    justify-content: space-between;
    position: static;
    width: 100%;

    ._arrow {
      height: 100%;
      width: 35px;
      background: rgba(245, 245, 245, 0.7);
      position: absolute;
      top: 0;
      left: 0;

      &._arrow-right {
        right: 0;
        left: auto;
      }
    }

    &.-counter {
      margin-top: var(--spacer-sm);
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
  }

  @include for-desktop {
    .glide__slide {
      width: var(--item-width);
    }
  }
}
</style>
