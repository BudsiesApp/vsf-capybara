<template>
  <div class="phrase-pillow-form-last-step">
    <template v-if="!isSubmitting">
      <customization-option
        v-for="customization in availableCustomizations"
        class="_customization-option"
        ref="customizationOption"
        :key="customization.id"
        :customization="customization"
        :is-disabled="isDisabled"
        :option-values="customizationAvailableOptionValues[customization.id]"
        :product-id="product.id"
        :value="customizationOptionValue[customization.id]"
        @input="$emit('input', $event)"
        @customization-option-busy-state-changed="
          $emit('customization-option-busy-state-changed', $event)
        "
      />

      <validation-provider
        v-slot="{ errors }"
        rules="required"
        :name="'Quantity'"
        slim
      >
        <div class="_quantity-field">
          <SfHeading :level="4" class="_step-title" title="Quantity" />

          <ACustomProductQuantity
            :value="quantity"
            class="_qty-container"
            :disabled="isDisabled"
            @input="$emit('update:quantity', $event)"
          />

          <div class="_error-text">
            {{ errors[0] }}
          </div>
        </div>
      </validation-provider>

      <div class="_bottom-static-block">
        <MBlockStory story-slug="petsies_phrase_pillows_bottom" />
      </div>

      <div class="_actions-row">
        <SfButton
          class="color-primary _submit-button"
          type="submit"
          :disabled="isDisabled"
          @click.prevent.stop="onAddToCartClick"
        >
          {{ $t("Add to Cart") }}
        </SfButton>

        <div class="_submit-disclaimer _helper-text">
          {{ $t("I have seen and approve the Live Preview of my design.") }}
        </div>
      </div>
    </template>

    <div class="_animation-row">
      <MSubmitAnimator
        ref="submitAnimator"
        :duration="20000"
        :steps="submitAnimationSteps"
        animation-url="/assets/images/phrasePillow/submit-animation.mp4"
        v-show="isSubmitting"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from '@vue/composition-api';
import { SfButton, SfHeading } from '@storefront-ui/vue';
import { ValidationProvider } from 'vee-validate';

import Product from 'core/modules/catalog/types/Product';
import {
  Customization,
  CustomizationOptionValue,
  OptionValue
} from 'src/modules/customization-system';

import SubmitAnimationStepsInterface from 'theme/components/interfaces/submit-animation-steps.interface';

import ACustomProductQuantity from 'theme/components/atoms/a-custom-product-quantity.vue';
import CustomizationOption from 'theme/components/customization-system/customization-option.vue';
import MBlockStory from 'theme/components/molecules/m-block-story.vue';
import MSubmitAnimator from 'theme/components/molecules/m-submit-animator.vue';

const submitAnimationSteps: SubmitAnimationStepsInterface[] = [
  { text: 'Uploading your image. So cute!', value: 33 },
  { text: 'Rendering design to maximize hugs', value: 66 },
  { text: 'Optimizing pillow softness vectors', value: 100 }
];

export default defineComponent({
  props: {
    addToCartAction: {
      type: Function as PropType<() => Promise<void>>,
      required: true
    },
    availableCustomizations: {
      type: Array as PropType<Customization[]>,
      default: () => []
    },
    customizationAvailableOptionValues: {
      type: Object as PropType<Record<string, OptionValue[]>>,
      default: () => ({})
    },
    customizationOptionValue: {
      type: Object as PropType<Record<string, CustomizationOptionValue>>,
      default: () => ({})
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    isSubmitButtonDisabled: {
      type: Boolean,
      default: false
    },
    product: {
      type: Object as PropType<Product>,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  },
  components: {
    ACustomProductQuantity,
    CustomizationOption,
    MBlockStory,
    MSubmitAnimator,
    SfButton,
    SfHeading,
    ValidationProvider
  },
  setup (props) {
    const isSubmitting = ref<boolean>(false);
    const submitAnimator = ref<InstanceType<typeof MSubmitAnimator> | null>(
      null
    );

    async function onAddToCartClick () {
      if (props.isDisabled || isSubmitting.value) {
        return;
      }

      isSubmitting.value = true;

      try {
        if (!submitAnimator.value) {
          throw new Error('Submit animation is not available!');
        }

        submitAnimator.value.runProgress();

        await props.addToCartAction();
      } finally {
        isSubmitting.value = false;
      }
    }

    return {
      isSubmitting,
      onAddToCartClick,
      submitAnimationSteps,
      submitAnimator
    };
  }
});
</script>

<style lang="scss" scoped>
.phrase-pillow-form-last-step {
  ._form-errors {
    margin-top: var(--spacer-xl);
  }

  ._step-title {
    text-align: left;
  }

  ._error-text {
    color: var(--c-danger-variant);
    font-size: var(--font-xs);
    margin-top: var(--spacer-xs);
    height: calc(var(--font-xs) * 1.2);
  }

  ._actions {
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-top: var(--spacer-xl);
  }

  ._qty-container {
    margin-top: var(--spacer-sm);
  }
}
</style>
