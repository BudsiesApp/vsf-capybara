<template>
  <div class="vertical-steps-form">
    <SfHeading :level="1" :title="pageTitle" class="_title" />

    <MBlockStory
      :story-slug="topStorySlug"
      class="_top-block"
      v-if="topStorySlug"
    />

    <validation-observer
      v-slot="{ errors: formErrors }"
      ref="validationObserver"
    >
      <form @submit.prevent="onFormSubmit">
        <div
          class="_step"
          v-for="(customizationGroup, index) in customizationRootGroups"
          :key="customizationGroup.id"
        >
          <SfDivider class="_step-divider" />

          <SfHeading
            class="_step-title"
            :level="3"
            :title="$t('Step {number}', { number: index + 1 })"
          />

          <div class="_content">
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
                onEntityBusyChanged
              "
            />

            <validation-provider
              v-if="isLastGroup(index)"
              v-slot="{ errors, classes }"
              rules="required"
              :name="'Quantity'"
              slim
            >
              <div class="_quantity-field" :class="classes">
                <SfHeading
                  class="_step-subtitle -required"
                  :level="3"
                  title="Quantity"
                  :ref="getFieldAnchorName('Quantity')"
                />

                <ACustomProductQuantity
                  v-model="quantity"
                  class="_qty-container"
                  :disabled="isDisabled"
                />

                <div class="_error-text">
                  {{ errors[0] }}
                </div>

                <a
                  class="_popup-link"
                  href="javascript:void(0)"
                  @click="showQuantityNotes = true"
                >{{ $t("Quantity & Shipping Discounts") }}</a>
              </div>
            </validation-provider>
          </div>
        </div>

        <m-form-errors
          class="_form-errors"
          :form-errors="formErrors"
          @item-click="goToFieldByName"
        />

        <div class="_actions">
          <SfButton
            class="_add-to-cart color-primary"
            type="submit"
            :disabled="isSubmitButtonDisabled"
            @click="shouldMakeAnother = false"
          >
            {{ submitButtonText }}
          </SfButton>

          <SfButton
            class="_add-to-cart-and-make-another color-secondary"
            type="submit"
            :disabled="isSubmitButtonDisabled"
            @click="shouldMakeAnother = true"
            v-show="!existingCartItem"
          >
            {{ $t("Save & Make Another") }}
          </SfButton>

          <m-order-submit-agreement class="_agreement" />

          <template v-if="$additionalContent.privacyPolicyAdditionalLinks">
            <component :is="linkComponent.component" :key="linkComponent.key" v-for="linkComponent in $additionalContent.privacyPolicyAdditionalLinks" />
          </template>
        </div>

        <MBlockStory :story-slug="bottomStorySlug" v-if="bottomStorySlug" />
      </form>
    </validation-observer>

    <SfModal :visible="showQuantityNotes" @close="showQuantityNotes = false">
      <div class="_popup-content">
        <MBlockStory :story-slug="quantityAndShippingDiscountsStorySlug" />
      </div>
    </SfModal>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  ref,
  Ref,
  toRefs
} from '@vue/composition-api';
import {
  SfButton,
  SfDivider,
  SfHeading,
  SfInput,
  SfModal
} from '@storefront-ui/vue';
import { ValidationObserver, ValidationProvider } from 'vee-validate';

import { useABTestingCustomizationsFilter } from 'src/modules/a-b-testing';
import {
  Customization,
  CustomizationOptionValue,
  ProductCustomizationMode,
  requiredCustomizationsFilter,
  useAvailableCustomizations,
  useCustomizationsBundleOptions,
  useEntityBusyState,
  useCustomizationsFilter,
  useCustomizationsGroups,
  useCustomizationsOptionsDefaultValue,
  usePurchaseFlowCustomizations,
  useCustomizationState,
  useCustomizationStatePreservation,
  useEmailCustomization,
  useOptionValueActions,
  useSelectedOptionValueUrlQuery
} from 'src/modules/customization-system';
import { DEFAULT_PRODUCT_PURCHASE_FLOW, ProductPurchaseFlow } from 'src/modules/shared';
import i18n from '@vue-storefront/core/i18n';
import { notifications } from '@vue-storefront/core/modules/cart/helpers';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';
import Product from '@vue-storefront/core/modules/catalog/types/Product';

import { useAddToCart } from 'theme/helpers/use-add-to-cart';
import { useBulkImagesUpload } from 'theme/helpers/use-bulk-images-upload';
import { useComponentUnmountedChecker } from 'theme/helpers/use-component-unmounted-checker';
import { useFormValidation } from 'theme/helpers/use-form-validation';
import { useProductQuantity } from 'theme/helpers/use-product-quantity';
import { useQuantityAndShippingDiscounts } from 'theme/helpers/use-quantity-and-shipping-discounts';

import ACustomProductQuantity from 'theme/components/atoms/a-custom-product-quantity.vue';
import CustomizationOption from 'theme/components/customization-system/customization-option.vue';
import MBlockStory from 'theme/components/molecules/m-block-story.vue';
import MFormErrors from 'theme/components/molecules/m-form-errors.vue';
import MOrderSubmitAgreement from 'theme/components/molecules/m-order-submit-agreement.vue';
import MProductDescriptionStory from 'theme/components/molecules/m-product-description-story.vue';

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
  name: 'VerticalStepsForm',
  props: {
    canUsePersistedCustomizationState: {
      type: Boolean,
      default: false
    },
    existingCartItem: {
      type: Object as PropType<CartItem | undefined>,
      default: undefined
    },
    customizationMode: {
      type: String as PropType<ProductCustomizationMode>,
      default: ProductCustomizationMode.ADD_TO_CART
    },
    productPurchaseFlow: {
      type: String as PropType<ProductPurchaseFlow>,
      default: DEFAULT_PRODUCT_PURCHASE_FLOW
    },
    product: {
      type: Object as PropType<Product>,
      required: true
    }
  },
  components: {
    ACustomProductQuantity,
    CustomizationOption,
    MBlockStory,
    MFormErrors,
    MOrderSubmitAgreement,
    MProductDescriptionStory,
    SfButton,
    SfDivider,
    SfHeading,
    SfInput,
    SfModal,
    ValidationObserver,
    ValidationProvider
  },
  setup (props, context) {
    const {
      canUsePersistedCustomizationState,
      customizationMode,
      existingCartItem,
      product,
      productPurchaseFlow
    } = toRefs(props);

    const validationObserver: Ref<InstanceType<
      typeof ValidationObserver
    > | null> = ref(null);

    const productSku = computed<string>(() => {
      return product.value.sku;
    });

    const productCustomizations = computed<Customization[]>(() => {
      return product.value.customizations || [];
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
    } = useCustomizationState(existingCartItem);

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
      availableOptionCustomizations,
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
    }) {
      updateCustomizationOptionValue(payload);
      executeActionsByCustomizationIdAndCustomizationOptionValue(payload);
    }

    const { unhandledCustomizationsFilter } = useSelectedOptionValueUrlQuery(
      flowAvailableCustomizations,
      availableOptionValues,
      customizationOptionValue,
      product,
      mergeCustomizationState,
      removeUnavailableOptionValues,
      context
    );

    const { removePreservedState } =
      useCustomizationStatePreservation(
        productSku,
        customizationState,
        existingCartItem,
        [unhandledCustomizationsFilter],
        canUsePersistedCustomizationState,
        mergeCustomizationState,
        removeUnavailableOptionValues
      );

    const { emailCustomizationFilter, persistCustomerEmail } =
      useEmailCustomization(
        availableCustomizations,
        customizationOptionValue,
        updateCustomizationOptionValue
      );

    const { bundleOptions } = useCustomizationsBundleOptions(
      flowAvailableCustomizations,
      customizationOptionValue,
      availableOptionValues
    );

    const { setDefaultValues } = useCustomizationsOptionsDefaultValue(
      availableCustomizations,
      customizationAvailableOptionValues,
      customizationOptionValue,
      onCustomizationOptionInput
    );

    const formValidation = useFormValidation(validationObserver, () =>
      getAllFormRefs(context.refs)
    );

    const { quantity } = useProductQuantity(existingCartItem);
    const { addToCartHandler, isSubmitting } = useAddToCart(
      product,
      quantity,
      customizationState,
      bundleOptions,
      existingCartItem,
      context,
      undefined,
      productPurchaseFlow.value
    );

    const shouldMakeAnother = ref<boolean>(false);

    async function onSuccessAndMakeAnother (): Promise<void> {
      resetCustomizationState();
      setDefaultValues();
      quantity.value = 1;

      if (validationObserver.value) {
        validationObserver.value.reset();
      }

      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

      const notification = notifications.createNotification({
        type: 'info',
        message: i18n.t('Product was added to the cart').toString(),
        timeToLive: 5 * 1000
      });

      context.root.$store.dispatch(
        'notification/spawnNotification',
        notification,
        { root: true }
      );
    }

    const { isUnmounted } = useComponentUnmountedChecker();

    async function onFormSubmit (): Promise<void> {
      const isValid = await formValidation.validateAndGoToFirstError();

      if (!isValid) {
        return;
      }

      try {
        await addToCartHandler();

        persistCustomerEmail();
        removePreservedState();

        if (isUnmounted.value) {
          return;
        }

        if (!shouldMakeAnother.value) {
          context.root.$router.push({
            name: 'cross-sells',
            params: { parentSku: product.value.sku }
          });

          return;
        }

        onSuccessAndMakeAnother();
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
      return isSomeEntityBusy.value || isDisabled.value;
    });

    const pageTitle = computed<string>(() => {
      return `${product.value.name} Order Form`;
    });
    const topStorySlug = computed<string | undefined>(() => {
      return `${product.value.sku}_creation_page_top`;
    });
    const bottomStorySlug = computed<string | undefined>(() => {
      return `${product.value.sku}_creation_page_bottom`;
    });
    const submitButtonText = computed<string>(() => {
      return (
        existingCartItem.value ? i18n.t('Update') : i18n.t('Add to Cart')
      ).toString();
    });

    const { customizationFilter } = useABTestingCustomizationsFilter(
      context.ssrContext
    );

    const { filteredCustomizations } = useCustomizationsFilter(
      availableCustomizations,
      customizationAvailableOptionValues,
      [emailCustomizationFilter, requiredCustomizationsFilter, customizationFilter]
    );

    return {
      ...useCustomizationsGroups(filteredCustomizations, flowAvailableProductCustomization),
      ...useQuantityAndShippingDiscounts(),
      ...formValidation,
      ...useBulkImagesUpload(context),
      availableCustomizations,
      availableOptionCustomizations,
      bottomStorySlug,
      customizationAvailableOptionValues,
      customizationOptionValue,
      isDisabled,
      isSubmitButtonDisabled,
      onEntityBusyChanged,
      onCustomizationOptionInput,
      onFormSubmit,
      pageTitle,
      shouldMakeAnother,
      submitButtonText,
      quantity,
      topStorySlug,
      validationObserver
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "~@storefront-ui/shared/styles/helpers/layout";

.vertical-steps-form {
  text-align: center;

  ._title {
    margin-top: var(--spacer-lg);
  }

  ._top-block {
    margin-top: var(--spacer-base);
  }

  b,
  strong {
    font-weight: var(--font-semibold);
  }

  ._step {
    margin-top: var(--spacer-lg);

    ._content {
      max-width: 720px;
      width: 100%;
      margin: var(--spacer-sm) auto 0;
    }
  }

  ._customization-option {
    --customization-option-align-items: center;

    --customization-option-label-align: center;
    --customization-option-label-weight: var(--font-semibold);
    --customization-option-label-size: var(--font-xl);

    --customization-option-description-align: center;
    --customization-option-hint-align: center;

    margin-top: var(--spacer-base);

    &.-compact-spacing {
      margin-top: 0;
    }

    ::v-deep {
      .cards-list-widget {
        width: 100%;
      }
    }
  }

  ._step-divider {
    display: none;
    margin-top: var(--spacer-xl);
  }

  ._step-title {
    @include border(--step-border, 0 0 4px 0, solid, var(--vertical-steps-form-step-title-color, var(--c-warning)));
    --heading-title-color: var(--vertical-steps-form-step-title-color, var(--c-warning));
    --heading-title-margin: var(--spacer-xl) 0 0;
    --heading-title-font-size: var(--font-xl);

    display: inline-block;
    text-transform: uppercase;
  }

  ._step-subtitle {
    --heading-title-font-weight: var(--font-semibold);
    --heading-title-font-size: var(--font-xl);
    --heading-title-margin: var(--spacer-base) 0 0;
  }

  ._qty-container {
    margin-top: var(--spacer-xs);

    ::v-deep ._quantity {
      ._header {
        font-weight: 800;
      }
    }
  }

  ._popup-link {
    font-weight: var(--font-medium);
    margin-top: var(--spacer-sm);
    display: inline-block;
  }

  ._popup-content {
    text-align: left;
  }

  ._email-input {
    --input-width: 20em;
    --input-padding: 0 0 var(--spacer-xs) 0;

    margin: var(--spacer-sm) auto 0;
  }

  ._email-hint {
    margin-top: var(--spacer-xs);
  }

  ._actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: var(--spacer-xl);

    ._add-to-cart-and-make-another {
      margin: var(--spacer-lg) 0 0 0;
      font-size: var(--font-sm);
    }
  }

  ._form-errors {
    margin-top: var(--spacer-xl);
  }

  ._agreement {
    margin: var(--spacer-xl) auto 0;
    max-width: 45rem;
  }

  @media (min-width: $tablet-min) {
    ._step-divider {
      display: block;
    }
  }
}
</style>
