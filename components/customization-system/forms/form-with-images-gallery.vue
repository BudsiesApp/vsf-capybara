<template>
  <div class="form-with-images-gallery">
    <div class="_product">
      <div>
        <header class="sf-heading sf-heading--no-underline sf-heading--left">
          <h1 class="_product-name-mobile sf-heading__title">
            {{ product.name }}
          </h1>
        </header>

        <m-zoom-gallery
          ref="gallery"
          class="_gallery"
          :images="galleryImages"
          :lazy-load-stage-image="false"
        />
      </div>

      <div>
        <header class="sf-heading sf-heading--no-underline sf-heading--left">
          <h1 class="_product-name-desktop sf-heading__title">
            {{ product.name }}
          </h1>
        </header>

        <div class="_short-description" v-html="shortDescription" />

        <a-custom-price
          v-if="!isCustomizeFlow"
          class="_price"
          :regular="totalPrice.regular"
          :special-price="totalPrice.special"
        />

        <validation-observer
          v-slot="{ errors: formErrors }"
          slim
          ref="validationObserver"
        >
          <form @submit.prevent="onFormSubmit">
            <customization-option
              v-for="customization in filteredCustomizations"
              class="_customization-option"
              ref="customizationOption"
              :key="customization.id"
              :customization="customization"
              :is-disabled="isDisabled || !!lockedCustomizationDictionary[customization.id]"
              :option-values="filteredCustomizationAvailableOptionValues[customization.id]"
              :product-id="Number(product.id)"
              :value="customizationOptionValue[customization.id]"
              @input="onCustomizationOptionInput"
              @customization-option-busy-state-changed="
                onEntityBusyChanged
              "
            />

            <div
              class="_actions-container"
              :ref="getFieldAnchorName('Quantity')"
            >
              <validation-provider
                v-if="!isCustomizeFlow"
                v-slot="{ errors }"
                rules="required"
                :name="'Quantity'"
                slim
              >
                <div class="_quantity-field">
                  <a-custom-product-quantity
                    v-model="quantity"
                    class="_qty-container"
                    :disabled="isDisabled"
                  />

                  <div class="_error-text">
                    {{ errors[0] }}
                  </div>
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
                >
                  {{ submitButtonText }}
                </SfButton>

                <m-order-submit-agreement />

                <template v-if="$additionalContent.privacyPolicyAdditionalLinks">
                  <component :is="linkComponent.component" :key="linkComponent.key" v-for="linkComponent in $additionalContent.privacyPolicyAdditionalLinks" />
                </template>
              </div>
            </div>
          </form>
        </validation-observer>
      </div>
    </div>

    <m-product-description-story
      class="_description-story"
      :product-sku="descriptionProductSku"
      :backup-product-sku="product.parentSku"
      :title="$t('Product Details').toString()"
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  inject,
  PropType,
  ref,
  Ref,
  toRefs
} from '@vue/composition-api';
import { SfButton } from '@storefront-ui/vue';
import { ValidationObserver, ValidationProvider } from 'vee-validate';

import { useABTestingCustomizationsFilter } from 'src/modules/a-b-testing';
import {
  Customization,
  CustomizationOptionValue,
  requiredCustomizationsFilter,
  useAvailableCustomizations,
  useCustomizationProductDescription,
  useCustomizationsBundleOptions,
  useEntityBusyState,
  useCustomizationsFilter,
  useCustomizationsOptionsDefaultValue,
  useCustomizationsPrice,
  useCustomizationState,
  useCustomizationStatePreservation,
  useEmailCustomization,
  useOptionValueActions,
  useSelectedOptionValueUrlQuery,
  CustomizableProductFlowType,
  DraftOrderItem,
  CustomizationStateItem,
  LockedCustomizationsFilterType,
  useLockedCustomizations,
  useAvailableOptionsValuesFilter
} from 'src/modules/customization-system';
import i18n from '@vue-storefront/core/i18n';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';
import Product from '@vue-storefront/core/modules/catalog/types/Product';

import { useAddToCart } from 'theme/helpers/use-add-to-cart';
import { useBulkImagesUpload } from 'theme/helpers/use-bulk-images-upload';
import { useComponentUnmountedChecker } from 'theme/helpers/use-component-unmounted-checker';
import { useCustomizeAction } from 'theme/helpers/use-customize-action';
import { useImageUpload } from 'theme/helpers/use-image-upload';
import { useFormValidation } from 'theme/helpers/use-form-validation';
import { useProductGallery } from 'theme/helpers/use-product-gallery';
import { useProductQuantity } from 'theme/helpers/use-product-quantity';

import ACustomPrice from 'theme/components/atoms/a-custom-price.vue';
import ACustomProductQuantity from 'theme/components/atoms/a-custom-product-quantity.vue';
import CustomizationOption from 'theme/components/customization-system/customization-option.vue';
import MBlockStory from 'theme/components/molecules/m-block-story.vue';
import MFormErrors from 'theme/components/molecules/m-form-errors.vue';
import MOrderSubmitAgreement from 'theme/components/molecules/m-order-submit-agreement.vue';
import MProductDescriptionStory from 'theme/components/molecules/m-product-description-story.vue';
import MZoomGallery from 'theme/components/molecules/m-zoom-gallery.vue';

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
  name: 'FormWithImagesGallery',
  props: {
    draftOrderItem: {
      type: Object as PropType<DraftOrderItem | undefined>,
      default: undefined
    },
    imageUrl: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    flow: {
      type: String as PropType<CustomizableProductFlowType>,
      default: CustomizableProductFlowType.ADD_TO_CART
    },
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
    ACustomPrice,
    ACustomProductQuantity,
    CustomizationOption,
    MBlockStory,
    MFormErrors,
    MOrderSubmitAgreement,
    MProductDescriptionStory,
    MZoomGallery,
    SfButton,
    ValidationObserver,
    ValidationProvider
  },
  setup (props, context) {
    const { canUsePersistedCustomizationState, existingCartItem, imageUrl, product, flow, draftOrderItem } = toRefs(props);

    const isCustomizeFlow = computed<boolean>(() => {
      return flow.value === CustomizableProductFlowType.CUSTOMIZE;
    });

    const customizationOption = ref<InstanceType<typeof CustomizationOption>[] | null>(null);

    const validationObserver: Ref<InstanceType<
      typeof ValidationObserver
    > | null> = ref(null);

    const shortDescription = computed<string | undefined>(() => {
      return product.value.short_description;
    });
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

    const initialCustomizationState = computed<CustomizationStateItem[]>(() => {
      return draftOrderItem.value?.customization_state || [];
    });

    const {
      addCustomizationOptionValue,
      customizationOptionValue,
      customizationState,
      removeCustomizationOptionValue,
      selectedOptionValuesIds,
      updateCustomizationOptionValue,
      mergeCustomizationState
    } = useCustomizationState(existingCartItem, initialCustomizationState);

    const {
      availableCustomizations,
      availableOptionCustomizations,
      availableOptionValues,
      customizationAvailableOptionValues,
      removeUnavailableOptionValues
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
    const { isSomeEntityBusy, onEntityBusyChanged } =
      useEntityBusyState();

    const { unhandledCustomizationsFilter } = useSelectedOptionValueUrlQuery(
      productCustomizations,
      availableOptionValues,
      customizationOptionValue,
      product,
      mergeCustomizationState,
      removeUnavailableOptionValues,
      context
    );

    const preservationStorageKey = computed<string>(() => {
      const key = isCustomizeFlow.value && draftOrderItem.value
        ? draftOrderItem.value.id
        : productSku.value;
      return String(key);
    });

    const { uploadImage } = useImageUpload(
      existingCartItem,
      availableCustomizations,
      customizationOptionValue,
      customizationOption
    );

    async function onCustomizationStateRestored (): Promise<void> {
      if (!imageUrl.value) {
        return;
      }

      await uploadImage(imageUrl.value);
    }

    const { removePreservedState } =
      useCustomizationStatePreservation(
        preservationStorageKey,
        customizationState,
        existingCartItem,
        [unhandledCustomizationsFilter],
        canUsePersistedCustomizationState,
        mergeCustomizationState,
        removeUnavailableOptionValues,
        undefined,
        onCustomizationStateRestored,
        undefined,
        onCustomizationStateRestored
      );

    const { emailCustomizationFilter, persistCustomerEmail } =
      useEmailCustomization(
        availableCustomizations,
        customizationOptionValue,
        updateCustomizationOptionValue
      );

    function onCustomizationOptionInput (payload: {
      customizationId: string,
      value: CustomizationOptionValue
    }) {
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

    const formValidation = useFormValidation(validationObserver, () =>
      getAllFormRefs(context.refs)
    );

    const { quantity } = useProductQuantity(existingCartItem);
    const { addToCartHandler, isSubmitting: isSubmittingAddToCart } = useAddToCart(
      product,
      quantity,
      customizationState,
      existingCartItem,
      context
    );

    const { isUnmounted } = useComponentUnmountedChecker();

    const {
      lockedCustomizationDictionary,
      optionValuesFilter: lockedOptionValuesFilter,
      customizationsFilter: lockedCustomizationsFilter
    } = useLockedCustomizations(
      customizationOptionValue,
      productCustomizations,
      flow,
      LockedCustomizationsFilterType.UNSELECTED
    );

    const {
      filteredOptionValues: filteredCustomizationAvailableOptionValues
    } = useAvailableOptionsValuesFilter(
      customizationAvailableOptionValues,
      [lockedOptionValuesFilter]
    );

    const { customizationFilter } = useABTestingCustomizationsFilter(
      context.ssrContext
    );

    const { confirmCustomization, isSubmitting: isSubmittingCustomize } = useCustomizeAction(
      customizationState,
      draftOrderItem,
      context
    );

    async function onFormSubmit (): Promise<void> {
      const isValid = await formValidation.validateAndGoToFirstError();

      if (!isValid) return;

      try {
        if (isCustomizeFlow.value) {
          await confirmCustomization();
        } else {
          await addToCartHandler();
        }

        persistCustomerEmail();
        removePreservedState();

        if (isUnmounted.value) {
          return;
        };

        if (isCustomizeFlow.value) {
          context.root.$router.push({ name: 'orders-history' });
          return;
        }

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

    const isSubmitting = computed<boolean>(() => {
      return isSubmittingAddToCart.value || isSubmittingCustomize.value;
    });

    const isDisabled = computed<boolean>(() => {
      return isSubmitting.value;
    });

    const isSubmitButtonDisabled = computed<boolean>(() => {
      return isSomeEntityBusy.value || isDisabled.value;
    });

    const submitButtonText = computed<string>(() => {
      if (isCustomizeFlow.value) {
        return i18n.t('Confirm Customization').toString();
      }

      if (existingCartItem.value) {
        return i18n.t('Update').toString();
      }

      return i18n.t('Add to Cart').toString();
    });

    return {
      ...useCustomizationsFilter(
        availableOptionCustomizations,
        customizationAvailableOptionValues,
        [emailCustomizationFilter, requiredCustomizationsFilter, customizationFilter, lockedCustomizationsFilter]
      ),
      ...useProductGallery(
        product,
        productCustomizations,
        selectedOptionValuesIds
      ),
      ...useCustomizationProductDescription(
        product,
        productCustomizations,
        customizationOptionValue
      ),
      ...useCustomizationsPrice(
        productCustomizations,
        customizationOptionValue,
        context
      ),
      ...formValidation,
      ...useBulkImagesUpload(context),
      availableCustomizations,
      availableOptionCustomizations,
      customizationAvailableOptionValues,
      customizationOption,
      customizationOptionValue,
      filteredCustomizationAvailableOptionValues,
      isDisabled,
      isCustomizeFlow,
      isSubmitButtonDisabled,
      lockedCustomizationDictionary,
      onEntityBusyChanged,
      onCustomizationOptionInput,
      onFormSubmit,
      shortDescription,
      submitButtonText,
      quantity,
      validationObserver
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "~@storefront-ui/shared/styles/helpers/typography";

.form-with-images-gallery {
  ._customization-option {
    &.-widget-ThumbnailsListWidget {
      --thumbnails-list-widget-item-width: 20%;
      --thumbnails-list-widget-round-item-min-width: 90px;
      --thumbnails-list-widget-name-display: none;
    }
  }

  ._product {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    > div {
      width: 100%;
      flex-grow: 1;
    }
  }

  ._product-name-desktop {
    display: none;
  }

  ._short-description {
    @include font(
      --product-description-font,
      var(--font-light),
      var(--font-base),
      1.6,
      var(--font-family-primary)
    );
  }

  ._actions {
    ._add-to-cart {
      margin: 0;
      width: 100%;
    }
  }

  ._customization-option {
    &.-widget-ProductionTimeSelector {
      --select-width: 100%;
    }
  }

  ._actions,
  ._actions-container,
  ._customization-option,
  ._form-errors,
  ._quantity-field,
  ._price {
    margin-top: var(--spacer-base);
  }

  @media (min-width: $tablet-min) {
    ._product {
      flex-direction: row;
    }

    ._product > div {
      max-width: 48.5%;
    }

    ._product-name-desktop {
      display: block;
    }

    ._product-name-mobile {
      display: none;
    }

    ._gallery {
      margin-top: 0;
    }

    ._customization-option {
      &.-widget-ThumbnailsListWidget {
        --thumbnails-list-widget-name-display: block;
        --thumbnails-list-widget-item-min-width: 90px;
      }
    }
  }
}
</style>
