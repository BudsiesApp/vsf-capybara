<template>
  <div class="plushie-wizard-product-type-step">
    <SfHeading
      :level="2"
      :title="$t('Select Your Type of Pet')"
    />

    <div class="_buttons-wrapper">
      <SfButton
        class="_button"
        :disabled="isDisabled"
        @click="setProductType('dog')"
      >
        <BaseImage
          class="_image"
          src="/assets/forevers/dog-icon1_1.png"
          :alt="$t('Forevers Dog')"
          width="76px"
          :aspect-ratio="1"
        />
        {{ $t('Forevers Dog') }}
      </SfButton>

      <SfButton
        class="_button"
        :disabled="isDisabled"
        @click="setProductType('cat')"
      >
        <BaseImage
          class="_image"
          src="/assets/forevers/cat-icon1_1.png"
          :alt="$t('Forevers Cat')"
          width="76px"
          :aspect-ratio="1"
        />
        {{ $t('Forevers Cat') }}
      </SfButton>

      <SfButton
        class="_button"
        :disabled="isDisabled"
        @click="setProductType('other')"
      >
        <BaseImage
          class="_image"
          src="/assets/forevers/other-icon1_1.png"
          :alt="$t('Forevers Other')"
          width="76px"
          :aspect-ratio="1"
        />
        {{ $t('Forevers Other') }}
      </SfButton>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { SfHeading, SfButton } from '@storefront-ui/vue';

import {
  BaseImage
} from 'src/modules/budsies';

import ForeversWizardProductTypeStepData from '../../interfaces/plushie-wizard-product-type-step-data.interface';

export default Vue.extend({
  name: 'MProductTypeChooseStep',
  components: {
    SfHeading,
    SfButton,
    BaseImage
  },
  props: {
    value: {
      type: Object as PropType<ForeversWizardProductTypeStepData>,
      default: () => ({
        product: undefined,
        plushieId: undefined
      })
    },
    disabled: {
      type: Boolean,
      default: false
    },
    setProductTypeAction: {
      type: Function as PropType<(type: string) => Promise<void>>,
      required: true
    }
  },
  data () {
    return {
      isSubmitting: false
    }
  },
  computed: {
    isDisabled (): boolean {
      return this.disabled || this.isSubmitting;
    }
  },
  methods: {
    async setProductType (type: 'dog' | 'cat' | 'other'): Promise<void> {
      if (this.disabled) {
        return;
      }

      this.isSubmitting = true;

      try {
        await this.setProductTypeAction(type);
        this.$emit('next-step');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
});

</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.plushie-wizard-product-type-step {
  ._buttons-wrapper {
    display: inline-grid;
    grid-template-columns: 1fr;
    grid-gap: 1em;
    padding: 1em 0;
  }

  ._button {
    justify-content: flex-start;
    flex-direction: row;

    ._image {
      margin-right: 1em;
    }
  }

  @media (min-width: $tablet-min) {
    ._buttons-wrapper {
      padding: 3em;
    }

    ._button {
      flex-direction: row;
    }
  }
}
</style>
