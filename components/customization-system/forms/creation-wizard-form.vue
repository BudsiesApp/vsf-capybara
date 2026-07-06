<template>
  <div class="creation-wizard-form">
    <div class="_content">
      <div class="_steps-container">
        <sf-steps
          :active="currentStep"
          :can-go-back="canGoBack && !isSubmitButtonDisabled && !isCurrentStepAdditional"
          :steps="stepsList"
          @change="onStepChanged"
          class="_steps"
        >
          <sf-step v-if="showProductTypeChooseStep" :name="productTypeChooseStepName">
            <m-product-type-choose-step
              :disabled="isDisabled"
              :product-type-buttons-list="productTypeButtonsList"
              :set-product-type-action="setProductType"
            />
          </sf-step>

          <template v-if="currentProduct">
            <sf-step
              v-for="customizationGroup in stepsCustomizations"
              :key="customizationGroup.id"
              :name="customizationGroup.name"
            >
              <validation-observer
                v-slot="{ errors: formErrors, passes }"
                ref="validationObserver"
              >
                <SfHeading
                  class="_step-title -required"
                  :level="2"
                  :title="customizationGroup.title || customizationGroup.name"
                />

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
                    filteredCustomizationAvailableOptionValues[customization.id]
                  "
                  :product-id="Number(currentProduct.id)"
                  :value="customizationOptionValue[customization.id]"
                  @input="onCustomizationOptionInput"
                  @customization-option-busy-state-changed="
                    onEntityBusyChanged
                  "
                />

                <m-form-errors
                  class="_form-errors"
                  :form-errors="formErrors"
                  @item-click="goToFieldByName"
                />

                <div class="_step-actions-container">
                  <SfButton
                    class="_button"
                    :disabled="isSubmitButtonDisabled"
                    @click="(event) => passes(() => nextStep())"
                  >
                    {{ $t("Continue") }}
                  </SfButton>
                </div>
              </validation-observer>
            </sf-step>

            <sf-step :name="lastStepCustomization.name">
              <creation-wizard-form-last-step
                :submit-action="onFormSubmit"
                :available-customizations="
                  customizationRootGroupCustomizations[lastStepCustomization.id]
                "
                :customization-available-option-values="
                  filteredCustomizationAvailableOptionValues
                "
                :customization-option-value="customizationOptionValue"
                :is-disabled="isDisabled"
                :is-submit-button-disabled="isSubmitButtonDisabled"
                :product="currentProduct"
                :product-type="plushieType"
                :submit-button-text="submitButtonText"
                :quantity.sync="quantity"
                :locked-customizations="filteredSelectedLockedCustomizations"
                :show-quantity="!isCustomizeMode"
                @input="onCustomizationOptionInput"
                @customization-option-busy-state-changed="
                  onEntityBusyChanged
                "
              />
            </sf-step>

            <sf-step
              v-for="step in additionalSteps"
              :key="step.name"
              :name="step.name"
            >
              <component
                :is="step.component"
                v-bind="step.props || {}"
              />
            </sf-step>
          </template>
        </sf-steps>
      </div>

      <MFloatingPhoto
        v-if="!!floatingPhotoUrl && isLastStep && stepsCustomizations.length"
        :image-url="floatingPhotoUrl"
        :pet-name="floatingPhotoText"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue';
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

import CartItem from 'core/modules/cart/types/CartItem';
import Product from 'core/modules/catalog/types/Product';
import i18n from '@vue-storefront/core/i18n';
import { useABTestingCustomizationsFilter } from 'src/modules/a-b-testing';
import {
  ProductCustomizationMode,
  Customization,
  useCustomizationState,
  useAvailableCustomizations,
  useOptionValueActions,
  useEntityBusyState,
  CustomizationOptionValue,
  useCustomizationsGroups,
  useCustomizationsBundleOptions,
  useCustomizationsOptionsDefaultValue,
  useCustomizationStatePreservation,
  useLockedCustomizations,
  useSelectedOptionValueUrlQuery,
  useEmailCustomization,
  useCustomizationsFilter,
  requiredCustomizationsFilter,
  PersistedData,
  DraftOrderItem,
  CustomizationStateItem,
  useAvailableOptionsValuesFilter,
  usePurchaseFlowCustomizations
} from 'src/modules/customization-system';
import { DEFAULT_PRODUCT_PURCHASE_FLOW, ProductPurchaseFlow } from 'src/modules/shared';

import ProductTypeButton from 'theme/components/interfaces/product-type-button.interface';
import { useAddToCart } from 'theme/helpers/use-add-to-cart';
import { useBulkImagesUpload } from 'theme/helpers/use-bulk-images-upload';
import { useComponentUnmountedChecker } from 'theme/helpers/use-component-unmounted-checker';
import { useCreationWizardFormSteps } from 'theme/helpers/use-creation-wizard-form-steps';
import { useCreationWizardGtmEvents } from 'theme/helpers/use-creation-wizard-gtm-events';
import { useCreationWizardPreselectedSize } from 'theme/helpers/use-creation-wizard-preselected-size';
import { useCreationWizardProductTypeStep } from 'theme/helpers/use-creation-wizard-product-type-step';
import { useFloatingPhoto } from 'theme/helpers/use-floating-photo';
import { useFormValidation } from 'theme/helpers/use-form-validation';
import { useProductQuantity } from 'theme/helpers/use-product-quantity';
import { PlushieType } from 'theme/interfaces/plushie.type';
import { useCustomizeAction } from 'theme/helpers/use-customize-action';

import CreationWizardFormLastStep from 'theme/components/customization-system/forms/creation-wizard-form-last-step.vue';
import CustomizationOption from 'theme/components/customization-system/customization-option.vue';
import MBlockStory from 'theme/components/molecules/m-block-story.vue';
import MFormErrors from 'theme/components/molecules/m-form-errors.vue';
import MFloatingPhoto from 'theme/components/organisms/OPlushieCreationWizard/m-floating-photo.vue';
import MProductTypeChooseStep from 'theme/components/organisms/OPlushieCreationWizard/m-product-type-choose-step.vue';

function getAllFormRefs (
  refs: Record<string, Vue | Element | Vue[] | Element[]>
): Record<string, Vue | Element | Vue[] | Element[]> {
  let refsDictionary: Record<string, Vue | Element | Vue[] | Element[]> = {};
  const customizationOptions = refs['customizationOption'] as InstanceType<
    typeof CustomizationOption
  >[];

  for (const customizationOption of customizationOptions) {
    for (const key in customizationOption.$refs) {
      refsDictionary[key] = customizationOption.$refs[key];
    }
  }

  return refsDictionary;
}

export interface CreationWizardFormAdditionalStep {
  name: string,
  component: Component,
  props?: Record<string, any>
}

export default defineComponent({
  name: 'CreationWizardForm',
  props: {
    draftOrderItem: {
      type: Object as PropType<DraftOrderItem | undefined>,
      default: undefined
    },
    customizationMode: {
      type: String as PropType<ProductCustomizationMode>,
      default: ProductCustomizationMode.ADD_TO_CART
    },
    canUsePersistedCustomizationState: {
      type: Boolean,
      default: false
    },
    existingCartItem: {
      type: Object as PropType<CartItem | undefined>,
      default: undefined
    },
    plushieType: {
      type: String as PropType<PlushieType>,
      required: true
    },
    preselectedProductSize: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    preselectedProductType: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    productPurchaseFlow: {
      type: String as PropType<ProductPurchaseFlow>,
      default: DEFAULT_PRODUCT_PURCHASE_FLOW
    },
    productTypeButtonsList: {
      type: Array as PropType<ProductTypeButton[]>,
      default: () => []
    },
    additionalSteps: {
      type: Array as PropType<CreationWizardFormAdditionalStep[]>,
      default: () => []
    },
    loadAdditionalStepsData: {
      type: Function as PropType<(() => Promise<void>) | undefined>,
      default: undefined
    }
  },
  components: {
    CreationWizardFormLastStep,
    CustomizationOption,
    MBlockStory,
    MFloatingPhoto,
    MFormErrors,
    MProductTypeChooseStep,
    SfButton,
    SfHeading,
    SfSteps,
    ValidationObserver
  },
  setup (props, context) {
    const {
      canUsePersistedCustomizationState,
      draftOrderItem,
      customizationMode,
      existingCartItem,
      additionalSteps,
      productPurchaseFlow,
      plushieType,
      preselectedProductSize,
      preselectedProductType
    } = toRefs(props);

    const isCustomizeMode = computed<boolean>(() => {
      return customizationMode.value === ProductCustomizationMode.CUSTOMIZE;
    });

    const currentProduct = computed<Product | undefined>(() => {
      return context.root.$store.getters['product/getCurrentProduct'];
    });

    const validationObserver: Ref<InstanceType<
      typeof ValidationObserver
    > | null> = ref(null);

    const productCustomizations = computed<Customization[]>(() => {
      return currentProduct.value?.customizations || [];
    });

    const initialCustomizationState = computed<CustomizationStateItem[]>(() => {
      return draftOrderItem.value?.customization_state || [];
    });

    const {
      addCustomizationOptionValue,
      customizationOptionValue,
      customizationState,
      removeCustomizationOptionValue,
      resetCustomizationState,
      selectedOptionValuesIds,
      updateCustomizationOptionValue,
      mergeCustomizationState
    } = useCustomizationState(existingCartItem, initialCustomizationState);

    const {
      flowAvailableCustomizations
    } = usePurchaseFlowCustomizations(
      productCustomizations,
      productPurchaseFlow,
      updateCustomizationOptionValue,
      customizationOptionValue,
      customizationMode
    );

    const flowAvailableProductCustomization = computed<Record<string, Customization>>(() => {
      const dictionary: Record<string, Customization> = {};

      for (const customization of flowAvailableCustomizations.value) {
        dictionary[customization.id] = customization;
      }

      return dictionary;
    });

    const {
      availableCustomizations,
      availableOptionValues,
      customizationAvailableOptionValues,
      removeUnavailableOptionValues
    } = useAvailableCustomizations(
      flowAvailableCustomizations,
      selectedOptionValuesIds,
      customizationOptionValue,
      updateCustomizationOptionValue
    );

    const { executeActionsByCustomizationIdAndCustomizationOptionValue } =
      useOptionValueActions(
        flowAvailableCustomizations,
        flowAvailableProductCustomization,
        customizationAvailableOptionValues,
        updateCustomizationOptionValue,
        removeCustomizationOptionValue,
        addCustomizationOptionValue
      );
    const { isSomeEntityBusy, onEntityBusyChanged } =
      useEntityBusyState();
    function onCustomizationOptionInput (payload: {
      customizationId: string,
      value: CustomizationOptionValue
    }): void {
      updateCustomizationOptionValue(payload);
      executeActionsByCustomizationIdAndCustomizationOptionValue(payload);
    }

    const {
      selectedLockedCustomizations,
      customizationsFilter: lockedCustomizationsFilter,
      optionValuesFilter: lockedOptionValuesFilter
    } = useLockedCustomizations(
      customizationOptionValue,
      flowAvailableCustomizations,
      customizationMode
    );

    const { filteredCustomizations: filteredSelectedLockedCustomizations } = useCustomizationsFilter(
      selectedLockedCustomizations,
      customizationAvailableOptionValues,
      [
        requiredCustomizationsFilter
      ]
    );

    const { bundleOptions } = useCustomizationsBundleOptions(
      flowAvailableCustomizations,
      customizationOptionValue,
      availableOptionValues
    );

    useCustomizationsOptionsDefaultValue(
      availableCustomizations,
      customizationAvailableOptionValues,
      customizationOptionValue,
      onCustomizationOptionInput
    );

    const { emailCustomizationFilter, persistCustomerEmail, emailValue } =
      useEmailCustomization(
        availableCustomizations,
        customizationOptionValue,
        updateCustomizationOptionValue
      );

    const { customizationFilter: abTestingCustomizationFilter } = useABTestingCustomizationsFilter(
      context.ssrContext
    );

    const { filteredCustomizations } = useCustomizationsFilter(
      availableCustomizations,
      customizationAvailableOptionValues,
      [
        emailCustomizationFilter,
        requiredCustomizationsFilter,
        abTestingCustomizationFilter,
        lockedCustomizationsFilter
      ]
    );

    const customizationGroups = useCustomizationsGroups(
      filteredCustomizations,
      flowAvailableProductCustomization
    );

    const { onStepSubmit } = useCreationWizardGtmEvents(
      availableCustomizations,
      customizationOptionValue,
      plushieType,
      emailValue
    )

    const additionalStepNames = computed<string[]>(() => {
      return additionalSteps.value.map((step: CreationWizardFormAdditionalStep) => step.name);
    });
    const isAdditionalStepsDataLoading: Ref<boolean> = ref(false);

    const formSteps = useCreationWizardFormSteps(
      customizationGroups.customizationRootGroups,
      additionalStepNames,
      existingCartItem,
      onStepSubmit,
      customizationMode,
      context
    );

    const { handlePreselectedSize } = useCreationWizardPreselectedSize(
      preselectedProductSize,
      customizationOptionValue,
      currentProduct,
      availableCustomizations,
      customizationAvailableOptionValues,
      onCustomizationOptionInput
    );

    function afterProductTypeSet (): void {
      void handlePreselectedSize();
    }

    const productTypeStep = useCreationWizardProductTypeStep(
      plushieType,
      currentProduct,
      existingCartItem,
      preselectedProductType,
      resetCustomizationState,
      formSteps.nextStep,
      afterProductTypeSet,
      context
    );

    const additionalPreservedData = computed<Record<string, any>>(() => {
      return {
        productSku: currentProduct.value?.sku,
        stepIndex: formSteps.currentStep.value
      }
    });

    const { unhandledCustomizationsFilter } = useSelectedOptionValueUrlQuery(
      flowAvailableCustomizations,
      availableOptionValues,
      customizationOptionValue,
      currentProduct,
      mergeCustomizationState,
      removeUnavailableOptionValues,
      context
    );

    const showProductTypeChooseStep = computed<boolean>(() => {
      return !isCustomizeMode.value;
    });

    const beforeCustomizationStateMerge = async (preservedState: PersistedData): Promise<boolean> => {
      if (!showProductTypeChooseStep.value) {
        return true;
      }

      const productSku = preservedState.additionalData?.productSku;

      if (!productSku) {
        return false;
      }

      await productTypeStep.loadProduct(productSku);
      return true;
    };

    const afterCustomizationStateMerge = (persistedData: PersistedData) => {
      if (!persistedData.additionalData?.stepIndex) {
        return;
      }

      formSteps.goToStep(persistedData.additionalData?.stepIndex);
    }

    const preservationStorageKey = computed<string>(() => {
      return isCustomizeMode.value && draftOrderItem.value
        ? draftOrderItem.value.id
        : plushieType.value;
    });

    const { removePreservedState } =
      useCustomizationStatePreservation(
        preservationStorageKey,
        customizationState,
        existingCartItem,
        [unhandledCustomizationsFilter],
        canUsePersistedCustomizationState,
        mergeCustomizationState,
        removeUnavailableOptionValues,
        beforeCustomizationStateMerge,
        afterCustomizationStateMerge,
        additionalPreservedData
      );

    const { quantity } = useProductQuantity(existingCartItem);
    const { addToCartHandler, isSubmitting: isSubmittingAddToCart } = useAddToCart(
      currentProduct,
      quantity,
      customizationState,
      bundleOptions,
      existingCartItem,
      context,
      undefined,
      productPurchaseFlow.value
    );

    const { confirmCustomization, isSubmitting: isSubmittingCustomize } = useCustomizeAction(
      customizationState,
      draftOrderItem,
      context
    );

    const { isUnmounted } = useComponentUnmountedChecker();

    async function onFormSubmit (): Promise<void> {
      try {
        if (isCustomizeMode.value) {
          await confirmCustomization();
        } else {
          await addToCartHandler();
        }

        persistCustomerEmail();
        removePreservedState();

        if (isUnmounted.value || !currentProduct.value) {
          return;
        }

        if (additionalSteps.value.length > 0) {
          let isAdditionalStepsDataLoaded = true;

          if (props.loadAdditionalStepsData) {
            isAdditionalStepsDataLoading.value = true;

            try {
              await props.loadAdditionalStepsData();
            } catch (e) {
              isAdditionalStepsDataLoaded = false;
            }

            isAdditionalStepsDataLoading.value = false;
          }

          if (isAdditionalStepsDataLoaded) {
            await formSteps.nextStep();
            return;
          }
        }

        if (isCustomizeMode.value) {
          context.root.$router.push({
            name: 'orders-history'
          });
        } else {
          context.root.$router.push({
            name: 'cross-sells',
            params: { parentSku: currentProduct.value.sku }
          });
        }
      } catch (error) {
        context.root.$store.dispatch('notification/spawnNotification', {
          type: 'danger',
          message: 'Error: ' + error.message,
          action1: { label: i18n.t('OK') }
        });
      }
    }

    const isSubmitting = computed<boolean>(() => {
      return isSubmittingAddToCart.value || isSubmittingCustomize.value;
    });

    const isDisabled = computed<boolean>(() => {
      return isSubmitting.value || productTypeStep.isProductLoading.value || isAdditionalStepsDataLoading.value;
    });

    const submitButtonText = computed<string>(() => {
      if (isCustomizeMode.value) {
        return i18n.t('Confirm Customization').toString();
      }

      return (
        existingCartItem.value ? i18n.t('Update') : i18n.t('Add to Cart')
      ).toString();
    });

    const isSubmitButtonDisabled = computed<boolean>(() => {
      return isDisabled.value || isSomeEntityBusy.value;
    });

    const {
      filteredOptionValues: filteredCustomizationAvailableOptionValues
    } = useAvailableOptionsValuesFilter(
      customizationAvailableOptionValues,
      [
        lockedOptionValuesFilter
      ]
    );

    return {
      ...customizationGroups,
      ...formSteps,
      ...productTypeStep,
      ...useFloatingPhoto(customizationState, availableCustomizations),
      ...useFormValidation(validationObserver, () =>
        getAllFormRefs(context.refs)
      ),
      ...useBulkImagesUpload(context),
      currentProduct,
      filteredCustomizationAvailableOptionValues,
      customizationOptionValue,
      isDisabled,
      isSubmitButtonDisabled,
      onEntityBusyChanged,
      onCustomizationOptionInput,
      onFormSubmit,
      submitButtonText,
      quantity,
      validationObserver,
      isCustomizeMode,
      filteredSelectedLockedCustomizations,
      showProductTypeChooseStep
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.creation-wizard-form {
  --steps-content-padding: var(--spacer-base) 0 0;
  $floating-photo-width: 14%;

  text-align: center;

  ._content {
    display: flex;
    justify-content: center;
    position: relative;
    margin-top: var(--spacer-base);
  }

  ._steps-container {
    display: flex;
    justify-content: center;
    flex-grow: 1;
  }

  ._steps {
    flex-grow: 1;
  }

  .sf-step {
    max-width: 760px;
    margin-left: auto;
    margin-right: auto;
  }

  .m-floating-photo {
    position: absolute;
    top: 0;
    display: none;
    width: $floating-photo-width;
    right: 0;
    height: 100%;
  }

  ._step-title,
  ._customization-option,
  ._step-actions-container {
    padding-left: var(--spacer-sm);
    padding-right: var(--spacer-sm);
  }

  ._customization-option {
    --customization-option-align-items: center;
    --customization-option-label-align: center;
    --customization-option-description-align: center;
    --customization-option-hint-align: center;

    margin-top: var(--spacer-base);

    &.-compact-spacing {
      margin-top: 0;
    }
  }

  ._form-errors {
    margin-top: var(--spacer-xl);
  }

  ._step-actions-container {
    display: flex;
    justify-content: center;
    margin-top: var(--spacer-base);
  }

  @include for-desktop {
    .m-floating-photo {
      display: block;
    }

    ._steps-container {
      max-width: calc(100% - #{$floating-photo-width} * 2 - 50px);
    }

    ._steps {
      max-width: 77.5rem;
    }

    .sf-modal {
      --modal-top: 50%;
    }
  }
}
</style>
