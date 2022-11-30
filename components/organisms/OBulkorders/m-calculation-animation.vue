<template>
  <div class="m-bulkorders-calculation-animation">
    <SfModal
      class="_quotation-calculating-modal"
      :visible="showCalculationAnimation"
      :cross="false"
      :persistent="true"
    >
      <SfHeading :level="2" :title="$t('Quotation Engine in Progress')" />
      <video
        class="_quotation-calculating-modal-video"
        autoplay
        loop
        muted
        playsinline
      >
        <source src="/assets/video/bulkorder/quotation-calculating-unicorn.mp4" type="video/mp4">
      </video>
      <SfLoader />
      <p>{{ calculationAnimationStepTitle }}</p>
    </SfModal>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { SfModal, SfHeading, SfLoader } from '@storefront-ui/vue';

export default (Vue as VueConstructor<Vue>).extend({
  name: 'MBulkordersCalculationAnimation',
  components: {
    SfModal,
    SfHeading,
    SfLoader
  },
  props: {
    showCalculationAnimation: {
      type: Boolean,
      default: false
    },
    calculationAnimationStepDelay: {
      type: Number,
      default: 2000
    }
  },
  data () {
    return {
      animationStepIndex: 1,
      stepTimeoutIdentificator: undefined as number | undefined
    }
  },
  computed: {
    calculationAnimationStepTitle (): string {
      switch (this.animationStepIndex) {
        case 1:
          return 'Analyzing plushification';
        case 2:
          return 'Consulting unicorn fairies';
        default:
          return 'Calculating unicorn gallops required for delivery';
      } ;
    }
  },
  methods: {
    goToNextStep (): void {
      this.stepTimeoutIdentificator = setTimeout(
        () => {
          this.animationStepIndex++;

          if (this.animationStepIndex < 4) {
            this.goToNextStep();
          } else {
            this.$emit('calculation-animation-finished');
          }
        },
        this.calculationAnimationStepDelay
      )
    },
    clearAnimationTimeout (): void {
      if (this.stepTimeoutIdentificator) {
        clearTimeout(this.stepTimeoutIdentificator);
      }
    }
  },
  beforeDestroy () {
    this.clearAnimationTimeout();
  },
  watch: {
    showCalculationAnimation: {
      handler (): void {
        this.animationStepIndex = 1;

        if (this.showCalculationAnimation) {
          this.goToNextStep();
        } else {
          this.clearAnimationTimeout();
        }
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.m-bulkorders-calculation-animation {
  ._quotation-calculating-modal {
    text-align: center;

    ._quotation-calculating-modal-video {
      margin: var(--spacer-sm) 0;
      height: 200px;
    }

    ::v-deep {
      .sf-modal {
        &__content {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
      }

      .sf-bar {
        &__icon {
          display: none;
        }
      }
    }

    .sf-loader {
      margin: var(--spacer-lg) 0;
    }

    @media (min-width: $desktop-min) {
      --modal-width: 40em;
    }
  }
}
</style>
