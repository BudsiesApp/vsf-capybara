<template>
  <div class="cart-item-configuration">
    <div
      class="collected-product__properties"
      v-for="textProperty in textProperties"
      :key="textProperty.value"
    >
      {{ textProperty.value }}
    </div>

    <div
      class="collected-product__properties"
      v-for="optionValueProperty in optionValueProperties"
      :key="optionValueProperty.value"
    >
      <SfIcon
        icon="check"
        size="xxs"
        color="blue-primary"
        class="collected-product__properties__icon"
      />
      {{ optionValueProperty.value }}
    </div>
  </div>
</template>

<script lang="ts">
import { SfIcon, SfProperty } from '@storefront-ui/vue';
import { computed, defineComponent, PropType } from '@vue/composition-api';

import CartItem from 'core/modules/cart/types/CartItem';
import {
  Customization,
  isFileUploadValue
} from 'src/modules/customization-system';

interface CustomizableProperty {
  customizationId: string,
  value: string,
  isTextValue: boolean,
  sn: number
}

export default defineComponent({
  name: 'CartItemConfiguration',
  components: {
    SfIcon,
    SfProperty
  },
  props: {
    cartItem: {
      type: Object as PropType<
      Partial<Pick<CartItem, 'customizations' | 'customizationState'>>
      >,
      required: true
    }
  },
  setup (props) {
    const customizationDictionary = computed<Record<string, Customization>>(
      () => {
        if (!props.cartItem.customizations) {
          return {};
        }

        const dictionary: Record<string, Customization> = {};

        for (const customization of props.cartItem.customizations) {
          dictionary[customization.id] = customization;
        }

        return dictionary;
      }
    );

    const customizableProperties = computed<CustomizableProperty[]>(() => {
      if (
        !props.cartItem.customizationState ||
        !props.cartItem.customizations
      ) {
        return [];
      }

      const properties: CustomizableProperty[] = [];

      for (const customizationStateItem of props.cartItem.customizationState) {
        if (isFileUploadValue(customizationStateItem.value)) {
          continue;
        }

        const relatedCustomization =
          customizationDictionary.value[customizationStateItem.customizationId];

        if (
          !relatedCustomization?.showInCart ||
          !relatedCustomization.optionData
        ) {
          continue;
        }

        if (!relatedCustomization.optionData.values?.length) {
          properties.push({
            customizationId: relatedCustomization.id,
            value: Array.isArray(customizationStateItem.value)
              ? customizationStateItem.value.join(',')
              : customizationStateItem.value,
            sn: relatedCustomization.sn,
            isTextValue: true
          });
          continue;
        }

        const selectedValues = Array.isArray(customizationStateItem.value)
          ? customizationStateItem.value
          : [customizationStateItem.value];
        const selectedOptionValues =
          relatedCustomization.optionData.values.filter((optionValue) => {
            return selectedValues.includes(optionValue.id);
          });

        for (const selectedOptionValue of selectedOptionValues) {
          if (!selectedOptionValue.name) {
            continue;
          }

          properties.push({
            customizationId: relatedCustomization.id,
            value: selectedOptionValue.name,
            sn: relatedCustomization.sn,
            isTextValue: false
          });
        }
      }

      properties.sort((a, b) => a.sn - b.sn);

      return properties;
    });

    const textProperties = computed<CustomizableProperty[]>(() => {
      return customizableProperties.value.filter(
        ({ isTextValue }) => isTextValue
      );
    });

    const optionValueProperties = computed<CustomizableProperty[]>(() => {
      return customizableProperties.value.filter(
        ({ isTextValue }) => !isTextValue
      );
    });

    return {
      customizableProperties,
      optionValueProperties,
      textProperties
    };
  }
});
</script>

<style lang="scss" scoped>
.cart-item-configuration {
  .collected-product__properties {
    font-size: var(--font-xs);
    margin-bottom: var(--spacer-xs);
  }

  .collected-product__properties__icon {
    display: inline-block;
  }
}
</style>
