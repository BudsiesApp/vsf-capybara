<template>
  <div class="forevers-wizard-product-type-step">
    <SfHeading
      :level="2"
      :title="$t('Select Your Type of Pet')"
    />

    <div class="_buttons-wrapper">
      <SfButton
        class="_button"
        :disabled="isDisabled"
        @click="onTypeButtonClickHandler('dog')"
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
        @click="onTypeButtonClickHandler('cat')"
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
        @click="onTypeButtonClickHandler('other')"
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

import ForeversWizardProductTypeStepData from '../../interfaces/forevers-wizard-product-type-step-data.interface';

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
    }
  },
  computed: {
    isDisabled (): boolean {
      return this.disabled;
    }
  },
  methods: {
    onTypeButtonClickHandler (type: 'dog' | 'cat' | 'other'): void {
      if (this.disabled) {
        return;
      }

      this.$emit('type-choose', type);
    }
  }
});

</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.forevers-wizard-product-type-step {
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
