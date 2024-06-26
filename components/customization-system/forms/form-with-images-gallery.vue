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
              v-for="customization in availableOptionCustomizations"
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

            <div
              class="_actions-container"
              :ref="getFieldAnchorName('Quantity')"
            >
              <validation-provider
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
                  {{ $t("Add to Cart") }}
                </SfButton>
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
  onMounted,
  PropType,
  ref,
  Ref,
  toRefs
} from '@vue/composition-api';
import { SfButton } from '@storefront-ui/vue';
import { ValidationObserver, ValidationProvider } from 'vee-validate';

import {
  Customization,
  CustomizationOptionValue,
  useAvailableCustomizations,
  useCustomizationProductDescription,
  useCustomizationsBusyState,
  useCustomizationsPrice,
  useCustomizationState,
  useCustomizationStatePreservation,
  useOptionValueActions
} from 'src/modules/customization-system';
import i18n from '@vue-storefront/core/i18n';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';
import Product from '@vue-storefront/core/modules/catalog/types/Product';

import { useAddToCart } from 'theme/helpers/use-add-to-cart';
import { useProductGallery } from 'theme/helpers/use-product-gallery';
import { useFormValidation } from 'theme/helpers/use-form-validation';

import ACustomPrice from 'theme/components/atoms/a-custom-price.vue';
import ACustomProductQuantity from 'theme/components/atoms/a-custom-product-quantity.vue';
import CustomizationOption from 'theme/components/customization-system/customization-option.vue';
import MFormErrors from 'theme/components/molecules/m-form-errors.vue';
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
    MFormErrors,
    MProductDescriptionStory,
    MZoomGallery,
    SfButton,
    ValidationObserver,
    ValidationProvider
  },
  setup (props, context) {
    const { existingCartItem, product } = toRefs(props);

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
      availableCustomizations,
      availableOptionCustomizations,
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
    const { getPreservedData, removePreservedState } =
      useCustomizationStatePreservation(
        productSku,
        customizationState,
        existingCartItem
      );

    onMounted(async () => {
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

    function onCustomizationOptionInput (payload: {
      customizationId: string,
      value: CustomizationOptionValue
    }) {
      updateCustomizationOptionValue(payload);
      executeActionsByCustomizationIdAndCustomizationOptionValue(payload);
    }

    const formValidation = useFormValidation(validationObserver, () =>
      getAllFormRefs(context.refs)
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
      const isValid = await formValidation.validateAndGoToFirstError();

      if (!isValid) {
        return;
      }

      try {
        await addToCartHandler();

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
    const isSubmitButtonDisabled = computed<boolean>(() => {
      return isSomeCustomizationOptionBusy.value || isDisabled.value;
    });

    return {
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
      availableCustomizations,
      availableOptionCustomizations,
      customizationAvailableOptionValues,
      customizationOptionValue,
      isDisabled,
      isSubmitButtonDisabled,
      onCustomizationOptionBusyChanged,
      onCustomizationOptionInput,
      onFormSubmit,
      shortDescription,
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
  }
}
</style>
