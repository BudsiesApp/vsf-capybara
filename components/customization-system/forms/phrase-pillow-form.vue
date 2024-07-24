<template>
  <div class="phrase-pillow-form -skin-petsies">
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

    <validation-observer
      ref="validationObserver"
      class="_form-content"
      tag="div"
    >
      <phrase-pillow-form-preview
        :customization-option-value="customizationOptionValue"
        :customization-option-values="availableOptionValues"
        :customizations="availableCustomizations"
        :is-disabled="isDisabled"
        :product-id="product.id"
        :svg-path="svgPath"
        class="_live-preview-section"
        ref="preview"
        v-if="product.id"
      />

      <div class="_customization-section">
        <form class="_form">
          <SfSteps
            :active="currentStep"
            :steps="stepsList"
            class="_customizer-steps"
          >
            <template #steps="props">
              <div
                class="_customizer-step"
                :class="{
                  '-active': props.step.current,
                  '-done': props.step.index <= currentStep,
                  '-invalid': isStepInvalid(props.step.step),
                }"
                @click="onChangeStep(props.step.index)"
              >
                <div class="_step-name" v-html="props.step.step" />
              </div>
            </template>

            <sf-step
              v-for="customizationGroup in stepsCustomizations"
              :key="customizationGroup.id"
              :name="customizationGroup.name"
              :use-v-show="true"
            >
              <customization-option
                v-for="customization in customizationRootGroupCustomizations[
                  customizationGroup.id
                ]"
                class="_customization-option"
                ref="customizationOptionsRefs"
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

              <div class="_next-step-button-container -show-for-medium-up">
                <SfButton class="color-primary" @click.prevent="nextStep">
                  {{ $t("Next") }}
                </SfButton>
              </div>
            </sf-step>

            <sf-step :name="lastStepName">
              <phrase-pillow-form-last-step
                :add-to-cart-action="onFormSubmit"
                :available-customizations="lastStepAvailableCustomizations"
                :customization-available-option-values="
                  customizationAvailableOptionValues
                "
                :customization-option-value="customizationOptionValue"
                :is-disabled="isDisabled"
                :is-submit-button-disabled="isSubmitButtonDisabled"
                :product="product"
                :quantity.sync="quantity"
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
  nextTick,
  onMounted,
  PropType,
  Ref,
  ref,
  toRefs,
  watch
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
  useCustomizationsGroups,
  useCustomizationsBundleOptions,
  useCustomizationsOptionsDefaultValue,
  useCustomizationStatePreservation,
  useProductionTimeSelectorCustomization,
  useSelectedOptionValueUrlQuery,
  useCustomizationsFilter,
  useEmailCustomization,
  requiredCustomizationsFilter
} from 'src/modules/customization-system';

import { useAddToCart } from 'theme/helpers/use-add-to-cart';
import { usePhrasePillowFormSteps } from 'theme/helpers/use-phrase-pillow-form-steps';

import CustomizationOption from 'theme/components/customization-system/customization-option.vue';
import MBlockStory from 'theme/components/molecules/m-block-story.vue';
import PhrasePillowFormPreview from 'theme/components/customization-system/forms/phrase-pillow-form-preview.vue';
import PhrasePillowFormLastStep from 'theme/components/customization-system/forms/phrase-pillow-form-last-step.vue';

const svgPath =
  config.images.baseUrl + '/150/150/resize/phrase_pillow/svg-templates';

const BACK_DESIGN_STEP_NAME = 'back design';

export default defineComponent({
  name: 'PhrasePillowForm',
  props: {
    canUsePersistedCustomizationState: {
      type: Boolean,
      default: false
    },
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
    PhrasePillowFormLastStep,
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
    const preview: Ref<InstanceType<typeof PhrasePillowFormPreview> | null> =
      ref(null);

    const productSku = computed<string>(() => {
      return product.value.sku;
    });

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
      replaceCustomizationState,
      selectedOptionValuesIds,
      updateCustomizationOptionValue
    } = useCustomizationState(existingCartItem);
    const {
      availableCustomization,
      availableCustomizations,
      availableOptionValues,
      customizationAvailableOptionValues
    } = useAvailableCustomizations(
      productCustomizations,
      selectedOptionValuesIds,
      customizationOptionValue,
      updateCustomizationOptionValue,
      product
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

    useCustomizationsBundleOptions(
      productCustomizations,
      customizationOptionValue,
      availableOptionValues,
      context
    );

    useCustomizationsOptionsDefaultValue(
      availableCustomizations,
      customizationAvailableOptionValues,
      customizationOptionValue,
      onCustomizationOptionInput
    );

    const { getPreservedData, removePreservedState } =
      useCustomizationStatePreservation(
        productSku,
        customizationState,
        existingCartItem
      );

    onMounted(async () => {
      await nextTick();

      if (
        existingCartItem.value ||
        !props.canUsePersistedCustomizationState
      ) {
        removePreservedState();
        return;
      }

      const preservedState = await getPreservedData();

      if (!preservedState) {
        return;
      }

      replaceCustomizationState(preservedState.customizationState);
    });

    // TODO: temporary until separate option value for "Standard"
    // production time will be added
    useProductionTimeSelectorCustomization(
      availableCustomizations,
      customizationOptionValue,
      existingCartItem,
      updateCustomizationOptionValue
    );

    const { emailCustomizationFilter, persistCustomerEmail } =
      useEmailCustomization(
        availableCustomizations,
        customizationOptionValue,
        updateCustomizationOptionValue
      );

    const { filteredCustomizations } = useCustomizationsFilter(
      availableCustomizations,
      customizationAvailableOptionValues,
      [emailCustomizationFilter, requiredCustomizationsFilter]
    );

    const customizationGroups = useCustomizationsGroups(
      filteredCustomizations,
      productCustomization
    );

    const formSteps = usePhrasePillowFormSteps(
      customizationGroups.customizationRootGroups,
      customizationGroups.customizationRootGroupCustomizations
    );

    const quantity = ref<number>(1);
    const { addToCartHandler, isSubmitting } = useAddToCart(
      product,
      quantity,
      customizationState,
      existingCartItem,
      context
    );

    async function onFormSubmit (): Promise<void> {
      if (!validationObserver.value) {
        return;
      }

      const isValid = await validationObserver.value.validate();

      if (!isValid) {
        formSteps.activateFirstStepWithError();
        return;
      }

      if (!preview.value) {
        return;
      }

      const processedImageUploadCustomizationStateItem =
        await preview.value.getProcessedImageUploadCustomizationStateItem();
      updateCustomizationOptionValue(
        processedImageUploadCustomizationStateItem
      );

      try {
        await addToCartHandler();

        persistCustomerEmail();
        removePreservedState();

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

    watch(formSteps.currentStep, (val, oldVal) => {
      if (val === oldVal) {
        return;
      }

      const previousStep = formSteps.stepsCustomizations.value[oldVal];
      const currentStep = formSteps.stepsCustomizations.value[val];

      if (
        [
          currentStep?.name.toLowerCase(),
          previousStep?.name.toLowerCase()
        ].indexOf(BACK_DESIGN_STEP_NAME) === -1
      ) {
        return;
      }

      preview.value?.switchFocusedSide(
        currentStep?.name.toLowerCase() === BACK_DESIGN_STEP_NAME
      );
    });

    useSelectedOptionValueUrlQuery(
      availableCustomization,
      availableOptionValues,
      customizationOptionValue,
      product,
      updateCustomizationOptionValue,
      context
    );

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
      preview,
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

  ._customization-option {
    --customization-option-label-align: center;
    --customization-option-description-align: center;
    --customization-option-hint-align: center;

    padding: 0 0.8em;

    &.-widget-ProductionTimeSelector {
      --select-width: 100%;
    }
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
    }

    ._step-container {
      padding: 0 0.8em 0;
    }
  }

  .m-live-preview {
    width: 100%;
  }

  ._next-step-button-container {
    display: flex;
    justify-content: flex-end;
    position: sticky;
    bottom: var(--spacer-base);
    margin-top: var(--spacer-base);
    z-index: 3;
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

    ._form-content {
      flex-direction: row;
      padding-top: 3.5em;
      --heading-title-font-size: var(--font-lg);
    }

    ._live-preview-section {
      flex: 1;
      height: auto;
    }

    ._customization-section,
    ._live-preview-section {
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

      ._form {
        height: auto;
      }

      ._bottom-static-block {
        text-align: left;
      }
    }

    ._customizer-steps {
      ::v-deep {
        .sf-steps__content {
          overflow-y: visible;
        }
      }
    }

    ._customization-option {
      --customization-option-label-align: left;
      --customization-option-description-align: left;
      --customization-option-hint-align: left;
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
  }

  &.-skin-petsies {
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
      padding-left: 0.9375rem;
      padding-right: 0.9375rem;
      --heading-title-font-line-height: 100%;
    }
  }
}
</style>
