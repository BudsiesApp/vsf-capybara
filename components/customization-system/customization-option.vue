<template>
  <div class="customization-option">
    <label
      class="_option-label"
      :ref="validationRef"
      v-if="showLabel"
    >
      {{ customizationLabel }}
    </label>

    <validation-provider
      slim
      v-slot="{ errors }"
      :rules="validationRules"
      :name="customization.name"
    >
      <component
        class="_widget"
        :bundle-option-id="customization.bundleOptionId"
        :error="errors[0]"
        :is-disabled="isDisabled"
        :is="widgetComponent"
        :label="customizationLabel"
        :max-values-count="maxValuesCount"
        :product-id="productId"
        :values="optionValues"
        :shape="customization.optionData && customization.optionData.widgetConfig && customization.optionData.widgetConfig.shape"
        v-model="selectedOption"
      />
    </validation-provider>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs } from '@vue/composition-api';
import { ValidationProvider } from 'vee-validate';

import { Customization, CustomizationStateItem, useCustomizationOptionValidation, useCustomizationOptionWidget, WidgetType } from 'src/modules/customization-system';

import CardsListWidget from './cards-list-widget.vue';
import CheckboxWidget from './checkbox-widget.vue';
import ColorsListWidget from './colors-list-widget.vue';
import DropdownWidget from './dropdown-widget.vue';
import DropdownFreeTextWidget from './dropdown-free-text-widget.vue';
import ImageUploadWidget from './image-upload-widget.vue';
import ProductionTimeSelector from './production-time-selector.vue';
import TextAreaWidget from './textarea-widget.vue';
import TextInputWidget from './text-input-widget.vue';
import ThumbnailsListWidget from './thumbnails-list-widget.vue';

export default defineComponent({
  name: 'CustomizationOption',
  components: {
    CardsListWidget,
    CheckboxWidget,
    ColorsListWidget,
    DropdownWidget,
    DropdownFreeTextWidget,
    ImageUploadWidget,
    ProductionTimeSelector,
    TextAreaWidget,
    TextInputWidget,
    ThumbnailsListWidget,
    ValidationProvider
  },
  props: {
    customization: {
      type: Object as PropType<Customization>,
      required: true
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    productId: {
      type: Number,
      required: true
    },
    selectedOptionValuesIds: {
      type: Array as PropType<string[]>,
      default: () => ({})
    },
    value: {
      type: Object as PropType<CustomizationStateItem | undefined>,
      default: undefined
    }
  },
  setup (props, context) {
    const { customization, selectedOptionValuesIds, value } = toRefs(props);
    const customizationLabel = computed<string>(() => {
      return customization.value.title || customization.value.name;
    });
    const maxValuesCount = computed<number | undefined>(() => {
      return customization.value.optionData?.maxValuesCount;
    });
    const showLabel = computed<boolean>(() => {
      return customization.value.optionData?.displayWidget !== WidgetType.CHECKBOX;
    });

    return {
      ...useCustomizationOptionValidation(customization),
      ...useCustomizationOptionWidget(
        value,
        customization,
        selectedOptionValuesIds,
        context
      ),
      customizationLabel,
      maxValuesCount,
      showLabel
    };
  }
});
</script>

<style lang="scss" scoped>
.customization-option {
  ._option-label {
    font-size: var(--customization-option-label-size, var(--font-base));
    font-weight: var(--customization-option-label-weight, var(--font-bold));
    text-align: var(--customization-option-label-align, left);
  }

  ._widget {
    margin: var(--customization-option-widget-margin, var(--spacer-sm) 0 0 0);
  }
}
</style>
