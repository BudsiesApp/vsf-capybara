<template>
  <div class="creation-wizard-form">
    <SfHeading :level="1" :title="mainTitleText" />

    <div class="_content">
      <div class="_steps-container">
        <sf-steps :active="currentStep" class="_steps">
          <sf-step name="Type">
            <m-product-type-choose-step
              :disabled="isDisabled"
              :product-type-buttons-list="productTypeButtonsList"
              :set-product-type-action="setProductType"
            />
          </sf-step>

          <template v-if="currentProduct">
            <sf-step
              v-for="customizationGroup in customizationCommonRootGroups"
              :key="customizationGroup.id"
              :name="customizationGroup.name"
              :use-v-show="true"
            >
              <validation-observer
                v-slot="{ errors: formErrors, passes }"
                ref="validationObserver"
              >
                <SfHeading
                  class="_step-title -required "
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
                    :disabled="isDisabled"
                    @click="(event) => passes(() => nextStep())"
                  >
                    {{ $t("Continue") }}
                  </SfButton>
                </div>
              </validation-observer>
            </sf-step>

            <sf-step :name="lastCustomizationGroup.name">
              <creation-wizard-form-last-step
                :available-customizations="
                  customizationRootGroupCustomizations[
                    lastCustomizationGroup.id
                  ]
                "
                :customization-available-option-values="
                  customizationAvailableOptionValues
                "
                :customization-option-value="customizationOptionValue"
                :product="currentProduct"
                @input="onCustomizationOptionInput"
                :add-to-cart-action="onFormSubmit"
                :product-type="plushieType"
                :quantity.sync="quantity"
              />
            </sf-step>
          </template>
        </sf-steps>
      </div>

      <!-- <MFloatingPhoto
        v-if="showFloatingPhoto"
        :image-url="floatingPhotoImageUrl"
        :pet-name="floatingPhotoText"
      /> -->
    </div>
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
import { usePersistedEmail } from 'src/modules/persisted-customer-data';

import ProductTypeButton from 'theme/components/interfaces/product-type-button.interface';
import getPlushieSkuByTypes from 'theme/helpers/get-plushie-sku-by-types.function';
import { useAddToCart } from 'theme/helpers/use-add-to-cart';
import { useCustomerEmail } from 'theme/helpers/use-customer-email';
import { useFormValidation } from 'theme/helpers/use-form-validation';
import { useQuantityAndShippingDiscounts } from 'theme/helpers/use-quantity-and-shipping-discounts';
import { PlushieType } from 'theme/interfaces/plushie.type';
import PlushieProductType from 'theme/interfaces/plushie-product-type';

import ACustomProductQuantity from 'theme/components/atoms/a-custom-product-quantity.vue';
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
    existingCartItem: {
      type: Object as PropType<CartItem | undefined>,
      default: undefined
    },
    plushieType: {
      type: String as PropType<PlushieType>,
      required: true
    }
  },
  components: {
    ACustomProductQuantity,
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
    const { existingCartItem, plushieType } = toRefs(props);
    const currentProduct = computed<Product | undefined>(() => {
      return context.root.$store.getters['product/getCurrentProduct'];
    });
    async function setProductType (type: string): Promise<void> {
      const productSku: string = getPlushieSkuByTypes(type, plushieType.value);

      if (currentProduct.value?.sku === productSku) {
        return;
      }

      await context.root.$store.dispatch('product/loadProduct', {
        parentSku: productSku,
        childSku: null
      });
      // EventBus.$emit(ProductEvent.PRODUCT_PAGE_SHOW, product);

      resetCustomizationState();
      nextStep();

      // EventBus.$emit(
      //   PlushieWizardEvents.PLUSHIE_WIZARD_TYPE_CHANGE,
      //   {
      //     productType: type,
      //     plushieType: this.plushieType
      //   }
      // );
    }

    const validationObserver: Ref<InstanceType<
      typeof ValidationObserver
    > | null> = ref(null);

    const { email } = useCustomerEmail(existingCartItem);
    const persistedEmail = usePersistedEmail(email);

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
      resetCustomizationState,
      selectedOptionValuesIds,
      updateCustomizationOptionValue
    } = useCustomizationState(existingCartItem);
    const {
      availableCustomizations,
      availableOptionCustomizations,
      customizationAvailableOptionValues
    } = useAvailableCustomizations(
      productCustomizations,
      selectedOptionValuesIds
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
    }) {
      updateCustomizationOptionValue(payload);
      executeActionsByCustomizationIdAndCustomizationOptionValue(payload);
    }

    const quantity = ref<number>(1);
    const { addToCartHandler, isSubmitting } = useAddToCart(
      currentProduct,
      quantity,
      customizationState,
      existingCartItem,
      context,
      email
    );

    async function onFormSubmit (): Promise<void> {
      try {
        persistedEmail.persistLastUsedCustomerEmail(email.value);
        await addToCartHandler();

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
      return isSubmitting.value;
    });
    const isSubmitButtonDisabled = computed<boolean>(() => {
      return isSomeCustomizationOptionBusy.value || isDisabled.value;
    });

    const pageTitle = computed<string>(() => {
      return `${plushieType.value} Order Form`;
    });
    const submitButtonText = computed<string>(() => {
      return (
        existingCartItem.value ? i18n.t('Update') : i18n.t('Add to Cart')
      ).toString();
    });

    const foreversProductTypeButtons = computed<ProductTypeButton[]>(() => {
      return [
        {
          title: i18n.t('Forevers Dog').toString(),
          type: PlushieProductType.DOG,
          imageSrc: '/assets/plushies/dog-icon1_1.png'
        },
        {
          title: i18n.t('Forevers Cat').toString(),
          type: PlushieProductType.CAT,
          imageSrc: '/assets/plushies/cat-icon1_1.png'
        },
        {
          title: i18n.t('Forevers Other').toString(),
          type: PlushieProductType.OTHER,
          imageSrc: '/assets/plushies/other-icon1_1.png'
        }
      ];
    });
    const golfCoversProductTypeButtons = computed<ProductTypeButton[]>(() => {
      return [
        {
          title: i18n.t('Dog Golf Head Covers').toString(),
          type: PlushieProductType.DOG,
          imageSrc: '/assets/plushies/dog-icon1_1.png'
        },
        {
          title: i18n.t('Cat Golf Head Covers').toString(),
          type: PlushieProductType.CAT,
          imageSrc: '/assets/plushies/cat-icon1_1.png'
        },
        {
          title: i18n.t('Other Golf Head Covers').toString(),
          type: PlushieProductType.OTHER,
          imageSrc: '/assets/plushies/other-icon1_1.png'
        }
      ];
    });
    const productTypeButtonsList = computed<ProductTypeButton[]>(() => {
      return plushieType.value === PlushieType.FOREVERS
        ? foreversProductTypeButtons.value
        : golfCoversProductTypeButtons.value;
    });

    const customizationGroups = useCustomizationsGroups(
      availableCustomizations,
      productCustomization
    );

    const customizationCommonRootGroups = computed<Customization[]>(() => {
      const groups = customizationGroups.customizationRootGroups.value;
      return groups.slice(0, groups.length - 1);
    });
    const lastCustomizationGroup = computed<Customization>(() => {
      return customizationGroups.customizationRootGroups.value[
        customizationGroups.customizationRootGroups.value.length - 1
      ];
    });
    const mainTitleText = computed<string>(() => {
      const title =
        plushieType.value === PlushieType.FOREVERS
          ? i18n.t('Create Your Custom Forevers Plush')
          : i18n.t('Create Your Custom Golf Head Covers');

      return title.toString();
    });
    const currentStep = ref<number>(0);
    async function nextStep (): Promise<void> {
      currentStep.value += 1;
    }

    const formValidation = useFormValidation(validationObserver, () =>
      getAllFormRefs(context.refs)
    );
    return {
      ...customizationGroups,
      ...formValidation,
      ...persistedEmail,
      // ...useFloatingPhoto(),
      ...useQuantityAndShippingDiscounts(),
      availableCustomizations,
      availableOptionCustomizations,
      currentProduct,
      currentStep,
      customizationAvailableOptionValues,
      customizationCommonRootGroups,
      customizationOptionValue,
      email,
      isDisabled,
      isSubmitButtonDisabled,
      lastCustomizationGroup,
      mainTitleText,
      nextStep,
      onCustomizationOptionBusyChanged,
      onCustomizationOptionInput,
      onFormSubmit,
      pageTitle,
      productTypeButtonsList,
      setProductType,
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
  --steps-content-padding: var(--spacer-base) var(--spacer-sm) 0;
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

  ._customization-option {
    --customization-option-align-items: center;

    --customization-option-label-align: center;

    --customization-option-description-align: center;

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
