<template>
  <div class="order-item-customization">
    <customization-option
      v-for="customization in availableCustomizations"
      class="_customization-option"
      ref="customizationOption"
      :key="customization.id"
      :customization="customization"
      :is-disabled="isDisabled"
      :option-values="customizationAvailableOptionValues[customization.id]"
      :product-id="+product.id"
      :value="customizationOptionValue[customization.id]"
      :disable-validation="isCustomizationStateEmpty"
      @input="onCustomizationOptionInput"
      @customization-option-busy-state-changed="onCustomizationOptionBusyChanged"
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  toRefs
} from '@vue/composition-api';

import Product from '@vue-storefront/core/modules/catalog/types/Product';
import {
  Customization,
  CustomizationOptionValue,
  CustomizationStateItem,
  DraftOrderItem,
  useAvailableCustomizations,
  useCustomizationsBusyState,
  useCustomizationState,
  useOptionValueActions
} from 'src/modules/customization-system';

import CustomizationOption from './customization-option.vue';

export default defineComponent({
  name: 'OrderItemCustomization',
  components: {
    CustomizationOption
  },
  props: {
    draftOrderItem: {
      type: Object as PropType<DraftOrderItem>,
      required: true
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    product: {
      type: Object as PropType<Product>,
      required: true
    }
  },
  setup (props, context) {
    const { draftOrderItem, product } = toRefs(props);

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
      selectedOptionValuesIds,
      updateCustomizationOptionValue
    } = useCustomizationState(undefined, draftOrderItem.value.customization_state);

    const {
      availableCustomizations,
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

    function onCustomizationOptionInput (payload: {
      customizationId: string,
      value: CustomizationOptionValue
    }) {
      updateCustomizationOptionValue(payload);
      executeActionsByCustomizationIdAndCustomizationOptionValue(payload);
    }

    function getCustomizationState (): CustomizationStateItem[] {
      return customizationState.value;
    }

    function isCustomizationStateEmpty (): boolean {
      return customizationState.value.length === 0;
    }

    return {
      availableCustomizations,
      customizationAvailableOptionValues,
      customizationOptionValue,
      isSomeCustomizationOptionBusy,
      onCustomizationOptionBusyChanged,
      onCustomizationOptionInput,
      getCustomizationState,
      isCustomizationStateEmpty
    };
  }
});
</script>

<style lang="scss" scoped>
.order-item-customization {
  ._customization-option {
    margin-bottom: var(--spacer-base);
  }
}
</style>
