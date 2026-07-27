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
          </div>
        </div>

        <validation-provider
          :rules="{ required: { allowFalse: false } }"
          :name="$t('Agreement')"
          v-slot="{ errors }"
          tag="div"
          class="_agreement-container"
        >
          <SfCheckbox
            class="_agreement"
            :disabled="isDisabled"
            :ref="getFieldAnchorName('Agreement')"
            v-model="agreement"
          >
            <template #label>
              <span>
                {{ $t("I agree to") }}

                <a
                  href="/media/bulkOrder/agreement/Standard_Bulk_Order_Customer_Agreement.pdf"
                  target="_blank"
                >{{ $t("Bulk Order Customer Agreement") }}</a>,

                <a href="/terms-of-service/" target="_blank">{{
                  $t("Terms of Service")
                }}</a>, and

                <privacy-policy-link />.

                {{
                  $t(
                    "I understand that Stuffed Animal Pros happily takes care of all tears, defects, and shipping damage with a refund, replacement, or repair."
                  )
                }}
              </span>
            </template>
          </SfCheckbox>

          <div class="_error-text">
            {{ errors[0] }}
          </div>
        </validation-provider>

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

          <template v-if="privacyPolicyLinks.length">
            <component :is="linkComponent.component" :key="linkComponent.key" v-for="linkComponent in privacyPolicyLinks" />
          </template>
        </div>

        <MBlockStory :story-slug="bottomStorySlug" v-if="bottomStorySlug" />
      </form>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import { useRouter, useStore } from '@vue-storefront/core/application-services';
import {
  computed,
  defineComponent,
  PropType,
  ref,
  Ref,
  toRefs
} from 'vue';
import {
  SfButton,
  SfCheckbox,
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
import { DEFAULT_PRODUCT_PURCHASE_FLOW, ProductPurchaseFlow, PrivacyPolicyLink } from 'src/modules/shared';
import i18n from '@vue-storefront/core/i18n';
import { notifications } from '@vue-storefront/core/modules/cart/helpers';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import {
  AdditionalContentEntry,
  AdditionalContentOutlet,
  useAdditionalContent
} from '@vue-storefront/core/additional-content';

import { useAddToCart } from 'theme/helpers/use-add-to-cart';
import { useBulkImagesUpload } from 'theme/helpers/use-bulk-images-upload';
import { useComponentUnmountedChecker } from 'theme/helpers/use-component-unmounted-checker';
import {
  getFieldAnchorName,
  getNestedFormRefs,
  useFormValidation
} from 'theme/helpers/use-form-validation';
import { useRenderedOrderTemplateRefs } from 'theme/helpers/use-rendered-order-template-refs';
import { useProductQuantity } from 'theme/helpers/use-product-quantity';
import { useQuantityAndShippingDiscounts } from 'theme/helpers/use-quantity-and-shipping-discounts';

import ACustomProductQuantity from 'theme/components/atoms/a-custom-product-quantity.vue';
import CustomizationOption from 'theme/components/customization-system/customization-option.vue';
import MBlockStory from 'theme/components/molecules/m-block-story.vue';
import MFormErrors from 'theme/components/molecules/m-form-errors.vue';
import MProductDescriptionStory from 'theme/components/molecules/m-product-description-story.vue';

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
    MProductDescriptionStory,
    PrivacyPolicyLink,
    SfButton,
    SfCheckbox,
    SfDivider,
    SfHeading,
    SfInput,
    SfModal,
    ValidationObserver,
    ValidationProvider
  },
  setup (props, context) {
    const privacyPolicyLinks = useAdditionalContent(
      AdditionalContentOutlet.PRIVACY_POLICY_LINKS
    );
    const applicationStore = useStore();
    const applicationRouter = useRouter();
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
    const {
      templateRef: customizationOption,
      getRefsInRenderedOrder: getCustomizationOptionsInRenderedOrder
    } = useRenderedOrderTemplateRefs<InstanceType<typeof CustomizationOption>>();

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
      removeUnavailableOptionValues
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
      getNestedFormRefs(getCustomizationOptionsInRenderedOrder())
    );

    const { quantity } = useProductQuantity(existingCartItem);
    const { addToCartHandler, isSubmitting } = useAddToCart(
      product,
      quantity,
      customizationState,
      bundleOptions,
      existingCartItem,
      undefined,
      productPurchaseFlow.value
    );
    const agreement = ref<boolean>(false);

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

      applicationStore.dispatch(
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
          applicationRouter.push({
            name: 'detailed-cart'
          });

          return;
        }

        onSuccessAndMakeAnother();
      } catch (error) {
        applicationStore.dispatch('notification/spawnNotification', {
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

    const { customizationFilter } = useABTestingCustomizationsFilter();

    const { filteredCustomizations } = useCustomizationsFilter(
      availableCustomizations,
      customizationAvailableOptionValues,
      [emailCustomizationFilter, requiredCustomizationsFilter, customizationFilter]
    );

    return {
      ...useCustomizationsGroups(filteredCustomizations, flowAvailableProductCustomization),
      ...useQuantityAndShippingDiscounts(),
      ...formValidation,
      ...useBulkImagesUpload(),
      agreement,
      availableCustomizations,
      availableOptionCustomizations,
      bottomStorySlug,
      customizationAvailableOptionValues,
      customizationOptionValue,
      customizationOption,
      getFieldAnchorName,
      isDisabled,
      isSubmitButtonDisabled,
      onEntityBusyChanged,
      onCustomizationOptionInput,
      onFormSubmit,
      pageTitle,
      privacyPolicyLinks: privacyPolicyLinks as unknown as
        readonly AdditionalContentEntry[],
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
    @include border(--step-border, 0 0 4px 0, solid, var(--c-primary));
    --heading-title-color: var(--c-primary);
    --heading-title-font-family: var(--font-family-primary);
    --heading-padding: 0 0 var(--spacer-xs);
    --heading-title-margin: var(--spacer-xl) 0 0;

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

  ._error-text {
    font: var(--widget-error-message-font);
    color: var(--widget-error-message-color);
    margin-top: var(--spacer-xs);
  }

  ._agreement-container {
    max-width: 720px;
    width: 100%;
    margin: var(--spacer-sm) auto 0;
  }

  ._agreement {
    margin-top: var(--spacer-xl);
    font-size: var(--font-sm);
    text-align: start;

    ::v-deep {
      .sf-checkbox {
        &__container {
          align-items: flex-start;
        }

        &__checkmark {
          flex-shrink: 0;
          margin-right: var(--spacer-sm);
        }
      }
    }
  }

  @media (min-width: $tablet-min) {
    ._step-divider {
      display: block;
    }
  }
}
</style>
