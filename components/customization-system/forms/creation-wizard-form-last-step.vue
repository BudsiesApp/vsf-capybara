<template>
  <validation-observer
    v-slot="{ errors: formErrors }"
    class="creation-wizard-form-last-step"
    ref="validationObserver"
    tag="div"
  >
    <SfHeading
      class="_step-title -required"
      :level="2"
      :title="$t('Customize your {productType}', { productType })"
    />

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
      :name="$t('Quantity')"
      slim
    >
      <div class="_section">
        <SfHeading
          class="-required"
          :level="3"
          :title="
            $t('How many {productType} of this exact same design?', {
              productType,
            })
          "
          :ref="getFieldAnchorName('quantity')"
        />

        <ACustomProductQuantity
          :value="quantity"
          :disabled="isDisabled"
          class="_qty-container"
          ref="quantity-field-anchor"
          @input="$emit('update:quantity', $event)"
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
        @click="onAddToCartClick"
      >
        {{ submitButtonText }}
      </SfButton>

      <MBlockStory story-slug="order_submit_agreement_petsies" />

      <california-privacy-notice-link />
    </div>

    <SfModal :visible="showQuantityNotes" @close="showQuantityNotes = false">
      <div class="_popup-content">
        <MBlockStory :story-slug="quantityAndShippingDiscountsStorySlug" />
      </div>
    </SfModal>
  </validation-observer>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, Ref } from '@vue/composition-api';
import { SfButton, SfHeading, SfInput, SfModal } from '@storefront-ui/vue';
import { ValidationObserver, ValidationProvider } from 'vee-validate';

import {
  Customization,
  CustomizationOptionValue,
  OptionValue
} from 'src/modules/customization-system';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { CaliforniaPrivacyNoticeLink } from 'src/modules/true-vault';

import { useFormValidation } from 'theme/helpers/use-form-validation';
import { useQuantityAndShippingDiscounts } from 'theme/helpers/use-quantity-and-shipping-discounts';

import ACustomProductQuantity from 'theme/components/atoms/a-custom-product-quantity.vue';
import CustomizationOption from 'theme/components/customization-system/customization-option.vue';
import MBlockStory from 'theme/components/molecules/m-block-story.vue';
import MFormErrors from 'theme/components/molecules/m-form-errors.vue';

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
  name: 'CreationWizardFormLastStep',
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
    submitButtonText: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  },
  components: {
    ACustomProductQuantity,
    CaliforniaPrivacyNoticeLink,
    CustomizationOption,
    MBlockStory,
    MFormErrors,
    SfButton,
    SfHeading,
    SfInput,
    SfModal,
    ValidationObserver,
    ValidationProvider
  },
  setup (props, context) {
    const validationObserver: Ref<InstanceType<
      typeof ValidationObserver
    > | null> = ref(null);

    const formValidation = useFormValidation(validationObserver, () =>
      getAllFormRefs(context.refs)
    );

    const productType = computed<string>(() => {
      const defaultProductType = 'Plush';

      if (!props.product.category) {
        return defaultProductType;
      }

      const firstCategory = props.product.category[0];

      if (!firstCategory) {
        return defaultProductType;
      }

      return firstCategory.name;
    });
    async function onAddToCartClick () {
      const isValid = await formValidation.validateAndGoToFirstError();

      if (!isValid) {
        return;
      }

      await props.addToCartAction();
    }
    return {
      ...useQuantityAndShippingDiscounts(),
      ...formValidation,
      onAddToCartClick,
      productType,
      validationObserver
    };
  }
});
</script>

<style lang="scss" scoped>
.creation-wizard-form-last-step {
  ._step-title,
  ._customization-option,
  ._step-actions-container {
    padding-left: var(--spacer-sm);
    padding-right: var(--spacer-sm);
  }

  ._customization-option {
    --customization-option-align-items: center;

    --customization-option-label-align: center;
    --customization-option-label-size: var(--h3-font-size);
    --customization-option-label-weight: var(--font-medium);
    --customization-option-description-align: center;
    --customization-option-hint-align: center;

    margin-top: var(--spacer-lg);

    &.-widget-CardsListWidget {
      --customization-option-widget-margin: var(--spacer-sm) calc(var(--spacer-sm) * -1) 0;
    }
  }

  ._section {
    margin-top: var(--spacer-lg);
  }

  ._form-errors {
    margin-top: var(--spacer-xl);
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
