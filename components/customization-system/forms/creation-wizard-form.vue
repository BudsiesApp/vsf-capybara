<template>
  <div class="creation-wizard-form">
    <div class="_content">
      <div class="_steps-container">
        <sf-steps
          :active="currentStep"
          :can-go-back="canGoBack && !isSubmitButtonDisabled"
          @change="onStepChanged"
          class="_steps"
        >
          <sf-step name="Type">
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
                    customizationAvailableOptionValues[customization.id]
                  "
                  :product-id="currentProduct.id"
                  :value="customizationOptionValue[customization.id]"
                  @input="onCustomizationOptionInput"
                  @customization-option-busy-state-changed="
                    onCustomizationOptionBusyChanged
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
                :add-to-cart-action="onFormSubmit"
                :available-customizations="
                  customizationRootGroupCustomizations[lastStepCustomization.id]
                "
                :customization-available-option-values="
                  customizationAvailableOptionValues
                "
                :customization-option-value="customizationOptionValue"
                :is-disabled="isDisabled"
                :is-submit-button-disabled="isSubmitButtonDisabled"
                :product="currentProduct"
                :product-type="plushieType"
                :submit-button-text="submitButtonText"
                :quantity.sync="quantity"
                @input="onCustomizationOptionInput"
                @customization-option-busy-state-changed="
                  onCustomizationOptionBusyChanged
                "
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
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
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
import {
  Customization,
  useCustomizationState,
  useAvailableCustomizations,
  useOptionValueActions,
  useCustomizationsBusyState,
  CustomizationOptionValue,
  useCustomizationsGroups,
  useCustomizationStatePreservation,
  useProductionTimeSelectorCustomization,
  useSelectedOptionValueUrlQuery
} from 'src/modules/customization-system';

import ProductTypeButton from 'theme/components/interfaces/product-type-button.interface';
import { useAddToCart } from 'theme/helpers/use-add-to-cart';
import { useCreationWizardFormSteps } from 'theme/helpers/use-creation-wizard-form-steps';
import { useCreationWizardPreselectedSize } from 'theme/helpers/use-creation-wizard-preselected-size';
import { useCreationWizardProductTypeStep } from 'theme/helpers/use-creation-wizard-product-type-step';
import { useFloatingPhoto } from 'theme/helpers/use-floating-photo';
import { useFormValidation } from 'theme/helpers/use-form-validation';
import { PlushieType } from 'theme/interfaces/plushie.type';

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

export default defineComponent({
  name: 'CreationWizardForm',
  props: {
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
    productTypeButtonsList: {
      type: Array as PropType<ProductTypeButton[]>,
      required: true
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
      existingCartItem,
      plushieType,
      preselectedProductSize,
      preselectedProductType
    } = toRefs(props);
    const currentProduct = computed<Product | undefined>(() => {
      return context.root.$store.getters['product/getCurrentProduct'];
    });

    const validationObserver: Ref<InstanceType<
      typeof ValidationObserver
    > | null> = ref(null);

    const productCustomizations = computed<Customization[]>(() => {
      return currentProduct.value?.customizations || [];
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
      resetCustomizationState,
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
      currentProduct
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

    // TODO: temporary until separate option value for "Standard"
    // production time will be added
    useProductionTimeSelectorCustomization(
      availableCustomizations,
      customizationOptionValue,
      existingCartItem,
      updateCustomizationOptionValue
    );

    const customizationGroups = useCustomizationsGroups(
      availableCustomizations,
      productCustomization
    );

    const formSteps = useCreationWizardFormSteps(
      customizationGroups.customizationRootGroups,
      existingCartItem
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

    const { getPreservedData, removePreservedState } =
      useCustomizationStatePreservation(
        plushieType,
        customizationState,
        existingCartItem,
        additionalPreservedData
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

      const productSku = preservedState.additionalData?.productSku;

      if (!productSku) {
        removePreservedState();
        return;
      }

      await productTypeStep.loadProduct(productSku);

      replaceCustomizationState(preservedState.customizationState);

      if (!preservedState.additionalData?.stepIndex) {
        return;
      }

      formSteps.goToStep(preservedState.additionalData?.stepIndex);
    });

    const quantity = ref<number>(1);
    const { addToCartHandler, isSubmitting } = useAddToCart(
      currentProduct,
      quantity,
      customizationState,
      existingCartItem,
      context
    );

    async function onFormSubmit (): Promise<void> {
      try {
        await addToCartHandler();
        removePreservedState();

        if (!currentProduct.value) {
          throw new Error('Product is missing');
        }

        context.root.$router.push({
          name: 'cross-sells',
          params: { parentSku: currentProduct.value.sku }
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
      return isSubmitting.value || productTypeStep.isProductLoading.value;
    });

    const submitButtonText = computed<string>(() => {
      return (
        existingCartItem.value ? i18n.t('Update') : i18n.t('Add to Cart')
      ).toString();
    });

    const isSubmitButtonDisabled = computed<boolean>(() => {
      return isDisabled.value || isSomeCustomizationOptionBusy.value;
    });

    useSelectedOptionValueUrlQuery(
      availableCustomization,
      availableOptionValues,
      customizationOptionValue,
      updateCustomizationOptionValue,
      context
    );

    return {
      ...customizationGroups,
      ...formSteps,
      ...productTypeStep,
      ...useFloatingPhoto(customizationState, availableCustomizations),
      ...useFormValidation(validationObserver, () =>
        getAllFormRefs(context.refs)
      ),
      currentProduct,
      customizationAvailableOptionValues,
      customizationOptionValue,
      isDisabled,
      isSubmitButtonDisabled,
      onCustomizationOptionBusyChanged,
      onCustomizationOptionInput,
      onFormSubmit,
      submitButtonText,
      quantity,
      validationObserver
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
