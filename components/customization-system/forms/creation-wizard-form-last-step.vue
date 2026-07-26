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

    <div v-if="lockedCustomizations.length" class="_pre-selected-customizations">
      <customization-option
        v-for="customization in lockedCustomizations"
        class="_customization-option"
        ref="customizationOption"
        :key="customization.id"
        :customization="customization"
        :is-disabled="true"
        :option-values="customizationAvailableOptionValues[customization.id]"
        :product-id="product.id"
        :value="customizationOptionValue[customization.id]"
      />
    </div>

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
      v-if="showQuantity"
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
        @click="onSubmitClick"
      >
        {{ submitButtonText }}
      </SfButton>

      <m-order-submit-agreement />

      <template v-if="$additionalContent.privacyPolicyAdditionalLinks">
        <component :is="linkComponent.component" :key="linkComponent.key" v-for="linkComponent in $additionalContent.privacyPolicyAdditionalLinks" />
      </template>
    </div>

    <SfModal :visible="showQuantityNotes" @close="showQuantityNotes = false">
      <div class="_popup-content">
        <MBlockStory :story-slug="quantityAndShippingDiscountsStorySlug" />
      </div>
    </SfModal>
  </validation-observer>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, Ref } from 'vue';
import { SfButton, SfHeading, SfInput, SfModal } from '@storefront-ui/vue';
import { ValidationObserver, ValidationProvider } from 'vee-validate';

import {
  Customization,
  CustomizationOptionValue,
  OptionValue
} from 'src/modules/customization-system';
import { useCurrentInstance } from 'src/modules/shared';
import Product from '@vue-storefront/core/modules/catalog/types/Product';

import { getNestedFormRefs, useFormValidation } from 'theme/helpers/use-form-validation';
import { useQuantityAndShippingDiscounts } from 'theme/helpers/use-quantity-and-shipping-discounts';

import ACustomProductQuantity from 'theme/components/atoms/a-custom-product-quantity.vue';
import CustomizationOption from 'theme/components/customization-system/customization-option.vue';
import MBlockStory from 'theme/components/molecules/m-block-story.vue';
import MFormErrors from 'theme/components/molecules/m-form-errors.vue';
import MOrderSubmitAgreement from 'theme/components/molecules/m-order-submit-agreement.vue';

export default defineComponent({
  name: 'CreationWizardFormLastStep',
  props: {
    submitAction: {
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
    },
    lockedCustomizations: {
      type: Array as PropType<Customization[]>,
      default: () => []
    },
    showQuantity: {
      type: Boolean,
      default: true
    }
  },
  components: {
    ACustomProductQuantity,
    CustomizationOption,
    MBlockStory,
    MFormErrors,
    MOrderSubmitAgreement,
    SfButton,
    SfHeading,
    SfInput,
    SfModal,
    ValidationObserver,
    ValidationProvider
  },
  setup (props, context) {
    const instance = useCurrentInstance();
    const validationObserver: Ref<InstanceType<
      typeof ValidationObserver
    > | null> = ref(null);

    const formValidation = useFormValidation(validationObserver, () =>
      getNestedFormRefs(instance.$refs, 'customizationOption')
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
    async function onSubmitClick () {
      const isValid = await formValidation.validateAndGoToFirstError();

      if (!isValid) {
        return;
      }

      await props.submitAction();
    }
    return {
      ...useQuantityAndShippingDiscounts(),
      ...formValidation,
      onSubmitClick,
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

    &.-compact-spacing {
      margin-top: 0;
    }

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
