<template>
  <div class="plushie-wizard-product-type-step">
    <SfHeading
      :level="2"
      :title="$t('Select Your Type of Pet')"
    />

    <div class="_buttons-wrapper">
      <SfButton
        v-for="item in productTypeButtonsList"
        :key="item.title"
        class="_button"
        :disabled="isDisabled"
        @click="setProductType(item.type)"
      >
        <BaseImage
          class="_image"
          :class="{ '-hidden': !item.imageSrc }"
          :src="item.imageSrc"
          :alt="item.title"
          width="76px"
          :aspect-ratio="1"
        />

        {{ item.title }}
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

import PlushieProductType from 'theme/interfaces/plushie-product-type';
import ProductTypeButton from 'theme/components/interfaces/product-type-button.interface';

export default Vue.extend({
  name: 'MProductTypeChooseStep',
  components: {
    SfHeading,
    SfButton,
    BaseImage
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    setProductTypeAction: {
      type: Function as PropType<(type: string) => Promise<void>>,
      required: true
    },
    productTypeButtonsList: {
      type: Array as PropType<ProductTypeButton[]>,
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
    async setProductType (type: PlushieProductType): Promise<void> {
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
    white-space: normal;

    ._image {
      margin-right: 1em;
      border-radius: 50%;

      &.-hidden {
        visibility: hidden;
      }
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
