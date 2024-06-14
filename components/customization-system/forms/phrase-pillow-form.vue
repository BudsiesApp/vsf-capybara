<template>
  <div class="phrase-pillow-form">
    <div class="_header -show-for-medium-up">
      <SfHeading :level="1" title="Pillow Customizer" class="_main-header" />

      <div class="_notes">
        <MBlockStory story-slug="petsies_phrase_pillows_top" />
      </div>

      <SfHeading
        :level="3"
        title="Your customizations will appear on the left side of the page"
        class="_subtitle"
      />
    </div>

    <validation-observer ref="formObserver" class="_form-content" tag="div">
      <phrase-pillow-form-preview
        :customization-option-value="customizationOptionValue"
        :customization-option-values="availableOptionValues"
        :customizations="availableCustomizations"
        :is-background-image-loaded="false"
        :is-disabled="isDisabled"
        :svg-path="svgPath"
      />

      <div class="_customization-section">
        <form class="_form">
          <SfSteps :active="currentStep">
            <template #steps="props">
              <div
                class="_customizer-step"
                :class="{
                  '-active': props.step.current,
                  '-done': props.step.index <= currentStep,
                  '-add-to-cart': isLastStep(props.step.index),
                  '-invalid': isStepInvalid(props.step.step),
                }"
                @click="onChangeStep(props.step.index)"
              >
                <div
                  class="_step-name"
                  v-html="
                    customizationRootGroups[props.step.index].title ||
                      customizationRootGroups[props.step.index].name
                  "
                />
              </div>
            </template>

            <sf-step
              v-for="customizationGroup in stepsCustomizations"
              :key="customizationGroup.id"
              :name="customizationGroup.name"
            >
              <customization-option
                v-for="customization in customizationRootGroupCustomizations[
                  customizationGroup.id
                ]"
                class="_customization-option"
                ref="customizationOption"
                :key="customization.id"
                :customization="customization"
                :is-disabled="isDisabled"
                :option-values="
                  customizationAvailableOptionValues[customization.id]
                "
                :product-id="product.id"
                :value="customizationOptionValue[customization.id]"
                @input="onCustomizationOptionInput"
                @customization-option-busy-state-changed="
                  onCustomizationOptionBusyChanged
                "
              />
            </sf-step>
          </SfSteps>
        </form>
      </div>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  Ref,
  ref,
  toRefs
} from '@vue/composition-api';
import { ValidationObserver } from 'vee-validate';
import { SfButton, SfHeading, SfSteps } from '@storefront-ui/vue';

import config from 'config';
import CartItem from 'core/modules/cart/types/CartItem';
import Product from 'core/modules/catalog/types/Product';
import i18n from '@vue-storefront/core/i18n';
import {
  Customization,
  useCustomizationState,
  useAvailableCustomizations,
  useOptionValueActions,
  useCustomizationsBusyState,
  CustomizationOptionValue,
  useCustomizationsGroups
} from 'src/modules/customization-system';

import { useAddToCart } from 'theme/helpers/use-add-to-cart';
import { usePhrasePillowFormSteps } from 'theme/helpers/use-phrase-pillow-form-steps';

import CustomizationOption from 'theme/components/customization-system/customization-option.vue';
import MBlockStory from 'theme/components/molecules/m-block-story.vue';
import PhrasePillowFormPreview from 'theme/components/customization-system/forms/phrase-pillow-form-preview.vue';

const svgPath = config.images.baseUrl + '/150/150/resize/phrase_pillow/svg-templates'

export default defineComponent({
  name: 'PhrasePillowForm',
  props: {
    existingCartItem: {
      type: Object as PropType<CartItem | undefined>,
      default: undefined
    },
    product: {
      type: Object as PropType<Product>,
      required: true
    }
  },
  components: {
    CustomizationOption,
    MBlockStory,
    PhrasePillowFormPreview,
    SfButton,
    SfHeading,
    SfSteps,
    ValidationObserver
  },
  setup (props, context) {
    const { existingCartItem, product } = toRefs(props);

    const validationObserver: Ref<InstanceType<
      typeof ValidationObserver
    > | null> = ref(null);

    const productCustomizations = computed<Customization[]>(() => {
      return product.value.customizations || [];
    });
    const productCustomization = computed<Record<string, Customization>>(() => {
      const dictionary: Record<string, Customization> = {};

      for (const customization of productCustomizations.value) {
        dictionary[customization.id] = customization;
      }

      return dictionary;
    });

    const {
      addCustomizationOptionValue,
      customizationOptionValue,
      customizationState,
      removeCustomizationOptionValue,
      resetCustomizationState,
      selectedOptionValuesIds,
      updateCustomizationOptionValue
    } = useCustomizationState(existingCartItem);
    const {
      availableCustomizations,
      availableOptionValues,
      customizationAvailableOptionValues
    } = useAvailableCustomizations(
      productCustomizations,
      selectedOptionValuesIds,
      customizationOptionValue,
      updateCustomizationOptionValue
    );
    const { executeActionsByCustomizationIdAndCustomizationOptionValue } =
      useOptionValueActions(
        productCustomizations,
        productCustomization,
        customizationAvailableOptionValues,
        updateCustomizationOptionValue,
        removeCustomizationOptionValue,
        addCustomizationOptionValue
      );
    const { isSomeCustomizationOptionBusy, onCustomizationOptionBusyChanged } =
      useCustomizationsBusyState();
    function onCustomizationOptionInput (payload: {
      customizationId: string,
      value: CustomizationOptionValue
    }): void {
      updateCustomizationOptionValue(payload);
      executeActionsByCustomizationIdAndCustomizationOptionValue(payload);
    }

    const quantity = ref<number>(1);
    const { addToCartHandler, isSubmitting } = useAddToCart(
      product,
      quantity,
      customizationState,
      existingCartItem,
      context
    );

    async function onFormSubmit (): Promise<void> {
      try {
        await addToCartHandler();

        context.root.$router.push({
          name: 'cross-sells',
          params: { parentSku: product.value.sku }
        });
      } catch (error) {
        context.root.$store.dispatch('notification/spawnNotification', {
          type: 'danger',
          message: 'Error: ' + error,
          action1: { label: i18n.t('OK') }
        });
      }
    }

    const customizationGroups = useCustomizationsGroups(
      availableCustomizations,
      productCustomization
    );

    const formSteps = usePhrasePillowFormSteps(
      customizationGroups.customizationRootGroups
    );

    const isDisabled = computed<boolean>(() => {
      return isSubmitting.value;
    });

    const submitButtonText = computed<string>(() => {
      return (
        existingCartItem.value ? i18n.t('Update') : i18n.t('Add to Cart')
      ).toString();
    });

    const isSubmitButtonDisabled = computed<boolean>(() => {
      return isDisabled.value || isSomeCustomizationOptionBusy.value;
    });

    return {
      ...customizationGroups,
      ...formSteps,
      availableCustomizations,
      availableOptionValues,
      customizationAvailableOptionValues,
      customizationOptionValue,
      isDisabled,
      isSubmitButtonDisabled,
      onCustomizationOptionBusyChanged,
      onCustomizationOptionInput,
      onFormSubmit,
      svgPath,
      submitButtonText,
      quantity,
      validationObserver
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.phrase-pillow-form {
  $color-border: #acacac;
  $color-white: #fff;
  $medium-breakpoint: 641px;

  display: flex;
  flex-direction: column;
  flex-grow: 1;
  font-size: 14px;

  ._main-header {
    line-height: 100%;
  }

  ._subtitle {
    margin-top: var(--spacer-base);
  }

  ._notes {
    text-align: center;
  }

  ._form-content {
    --heading-title-font-weight: 800;
    --heading-title-font-size: var(--font-base);
    --heading-padding: 0;

    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  ._customizer-steps {
    display: flex;
    flex-direction: column;
    flex-grow: 1;

    ::v-deep {
      .sf-steps__header {
        box-shadow: none;
        --steps-border-width: 0 0 2px 0;
      }

      .sf-steps__progress {
        --steps-progress-background: var(--c-dark);
        --steps-progress-height: 2px;
      }

      .sf-steps__content {
        overflow-y: scroll;
        flex: 1 1;
        flex-basis: 0px;
      }
    }
  }

  ._front_design_preview_container,
  ._customization-section {
    ._error-text {
      margin-top: 1em;
    }
  }

  ._front_design_preview_container {
    padding: 0.8em;
    height: 100%;
    text-align: center;

    ._section-header {
      h5 {
        margin: 0.3em 0;
      }
    }
  }

  ._design-images-container {
    padding: 0 0.8em;
  }

  ._back_design_preview_container,
  ._design-images-container {
    margin-top: 5%;
  }

  ._front-preview,
  ._back-preview,
  ._design-images {
    width: 100%;
  }

  ._design-images {
    margin-top: 1em;
  }

  ._helper-text {
    font-size: var(--font-2xs);
    font-weight: var(--font-medium);
    margin: var(--spacer-xs) 0;
    text-align: center;
  }

  ._label {
    display: block;
    text-align: center;
    font-size: var(--font-base);
    font-weight: var(--font-medium);
  }

  ._customization-section {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    padding-left: 0;
    padding-right: 0;

    ._form {
      display: flex;
      flex-grow: 1;
      flex-direction: column;
    }

    ._customizer-step {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 4em;
      flex: 1;
      padding: 0.6em 0.4em 0.4em;
      text-align: center;
      cursor: pointer;
      user-select: none;

      &.-active {
        cursor: default;
      }

      &.-done {
        &::after {
          content: "";
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 100%;
          bottom: -3.8px;
        }
      }

      ._validation-icon {
        position: absolute;
        top: 2px;
        right: 2px;
        padding: 1px;
        font-size: 0.8em;
        color: $color-white;
        border-radius: 100%;
      }
    }

    ._step-container {
      padding: 0 0.8em 0;

      ._step-title {
        margin-top: 0;
      }
    }

    ._input-container {
      padding: 0 2.4em;
    }

    ._error-text {
      font-size: var(--font-xs);
      font-weight: var(--font-medium);
      height: calc(var(--font-xs) * 1.2);
    }

    ._background-hint {
      margin: 1em 0;
    }

    .-invalid {
      ._error-text {
        display: block;
      }
    }

    ._actions-row {
      ._submit-button {
        margin-left: auto;
        margin-right: auto;
      }
    }

    ._production-time-field,
    ._actions-row,
    ._animation-row,
    ._final-steps {
      margin-top: 1.5em;
      text-align: center;
    }

    ._production-time-field {
      --select-padding: 0;
      --production-time-selector-option-font-size: var(--font-base);
      --heading-title-font-weight: var(--font-bold);

      &::v-deep .sf-heading {
        --heading-text-align: left;
      }
    }

    ._custom-text-fields-section {
      ._custom-text-field {
        margin-top: 1em;

        ._custom-input {
          text-align: center;
        }
      }
    }

    ._back-design-field {
      ._back-selector {
        margin-top: 0.5em;
      }
    }

    ._accent-color-field {
      padding: 0;
      text-align: center;

      ._accent-color-selector-container {
        margin-top: 1em;
      }

      ._error-text {
        margin: 1em 0;
      }

      &:first-child {
        margin-top: 0;
      }
    }

    ._email-disclaimer {
      margin-top: var(--spacer-xs);
    }

    ._production-time-field {
      margin-top: 3em;
    }

    ._submit-disclaimer {
      margin-top: 1em;
    }

    ._background-image-field {
      text-align: center;
      padding: 0;

      ._background-uploader {
        padding: 0 2em;
        margin-bottom: 1.2em;
      }
    }

    ._front-image-small {
      display: flex;
      position: relative;
      background-color: $color-white;
      width: 100%;

      ::v-deep svg {
        width: 100%;
        height: auto;
      }

      ._background {
        position: absolute;
        width: calc(100% - 2px);
        top: 1px;
        left: 1px;
      }
    }
  }

  ._preview-image-small {
    display: flex;
    position: relative;
    background-color: $color-white;
    width: 100%;

    ::v-deep svg {
      width: 100%;
      height: auto;
    }

    ._background {
      position: absolute;
      width: calc(100% - 2px);
      top: 1px;
      left: 1px;
    }
  }

  ._quantity-field {
    text-align: center;
  }

  ._qty-container {
    margin-top: var(--spacer-xs);
  }

  .m-live-preview {
    width: 100%;
  }

  @media (max-width: $medium-breakpoint - 1px) {
    .-show-for-medium-up {
      display: none !important;
    }
  }

  @media (min-width: $medium-breakpoint) {
    --h1-font-size: 2.625rem;
    --h3-font-size: 1.625rem;
    --heading-title-font-weight: bold;
    --heading-padding: 0;

    font-size: var(--font-size-base);

    .-show-for-small-only {
      display: none !important;
    }

    ._helper-text {
      font-size: var(--font-xs);
    }

    ._form-content {
      flex-direction: row;
      padding-top: 3.5em;
      --heading-title-font-size: var(--font-lg);
    }

    ._live-preview-section {
      flex: 1;
      height: auto;

      ._front_design_preview_container {
        position: sticky;
        top: 3.4em;
        height: auto;
        padding-bottom: 0;
      }
    }

    ._label {
      text-align: left;
    }

    ._customization-section,
    ._live-preview-section,
    ._front_design_preview_container,
    ._back_design_preview_container {
      text-align: left;

      .sf-heading {
        --heading-text-align: left;
      }
    }

    ._header {
      ._top-static-block {
        text-align: center;
      }
    }

    ._customization-section {
      flex: 1;
      height: auto;
      padding: 0 0.8em;
      margin-top: -1.6em;

      ._accent-color-field {
        padding: 0;
      }

      ._form {
        height: auto;
      }

      ._input-container {
        padding: 0;
      }

      ._actions-row {
        ._submit-button {
          margin-left: 0;
          margin-right: 0;
        }
      }

      ._step-title,
      ._background-image-field,
      ._quantity-field,
      ._email-field,
      ._production-time-field,
      ._actions-row,
      ._accent-color-field,
      ._front-design-field,
      ._back-design-field,
      ._custom-text-field,
      ._final-steps,
      ._helper-text,
      ._bottom-static-block {
        text-align: left;
      }

      ._email-field,
      ._custom-text-fields-section {
        ._custom-text-field {
          ._custom-input {
            text-align: left;
          }
        }
      }

      ._production-time-field {
        ::v-deep .sf-select__selected {
          justify-content: flex-start;
        }
      }

      ._step {
        font-size: var(--font-base);
        text-align: left;
      }

      ._background-image-field {
        ._background-uploader {
          margin-top: 0.4em;
        }
      }
    }

    ._customizer-steps {
      ::v-deep {
        .sf-steps__content {
          overflow-y: visible;
        }
      }
    }
  }

  ._next-step-button-container {
    display: flex;
    justify-content: flex-end;
    position: sticky;
    bottom: var(--spacer-base);
    margin-top: var(--spacer-base);
  }

  ._form-errors {
    margin-top: var(--spacer-sm);
  }

  @include for-desktop {
    ._actions-row {
      text-align: left;
    }

    ._live-preview-section {
      ._front_design_preview_container {
        top: 4.4em;
      }
    }

    ._front-preview {
      ._front-hint {
        ._helper-text {
          font-size: 0.85em;
          margin: 1.5em 0;
        }
      }

      ._hint-image {
        width: 3.5em;
        height: 3.5em;
      }
    }
  }

  &.-skin-petsies {
    $color-customizer-step-background: #ededed;
    $color-add-to-cart-step-background: #43c5e4;
    $color-add-to-cart-step-hover-background: #81d8ed;

    ._customizer-step {
      color: var(--c-dark-variant);
      font-weight: 800;

      &.-done {
        color: var(--c-dark);

        &::after {
          background-color: var(--c-dark);
        }
      }

      &.-invalid {
        color: var(--c-danger-variant);
      }
    }

    ._header {
      padding-left: .9375rem;
      padding-right: .9375rem;
      --heading-title-font-line-height: 100%;
    }

    ._front_design_preview_container,
    ._customization-section {
      ._error-text {
        color: var(--c-danger);
      }
    }

    ._front_design_preview_container {
      &.-invalid {
        h3 {
          color: var(--c-danger-variant);
        }
      }
    }

    ._customization-section {
      label {
        ._step-marker {
          color: var(--_c-light-primary);
        }
      }

      .-invalid {
        label {
          color: var(--c-danger);
        }

        input[type="text"],
        input[type="email"] {
          border-color: var(--c-danger-variant);
        }
      }
    }
  }
}
</style>
