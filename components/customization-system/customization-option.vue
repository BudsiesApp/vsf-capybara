<template>
  <div
    class="customization-option"
    :ref="validationRef"
    v-show="showCustomization"
  >
    <label
      class="_option-label"
      v-if="showLabel"
    >
      {{ optionLabel }}
    </label>

    <div
      class="_option-description"
      v-if="optionDescription"
      v-html="optionDescription"
    />

    <validation-provider
      slim
      v-slot="{ errors }"
      :rules="validationRules"
      :name="optionLabel"
      ref="validationProvider"
    >
      <component
        class="_widget"
        :error="errors[0]"
        :is-disabled="isDisabled"
        :is="widget.component"
        v-bind="widget.props"
        v-model="selectedOption"
        @widget-busy-changed="onWidgetBusyChanged"
      />
    </validation-provider>

    <div class="_option-hint" v-if="optionHint" v-html="optionHint" />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  toRefs
} from '@vue/composition-api';
import { ValidationProvider } from 'vee-validate';

import {
  Customization,
  CustomizationOptionValue,
  OptionValue,
  useCustomizationOptionValidation,
  useCustomizationOptionWidget,
  useWidgetBusyState,
  WidgetType
} from 'src/modules/customization-system';

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

const customizationWidgetBusyStateChangedEventName = 'customization-option-busy-state-changed';

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
    optionValues: {
      type: Array as PropType<OptionValue[]>,
      default: () => []
    },
    productId: {
      type: Number,
      required: true
    },
    value: {
      type: [Object, String, Array] as PropType<CustomizationOptionValue>,
      default: undefined
    }
  },
  setup (props, context) {
    const { customization, optionValues, productId, value } = toRefs(props);

    const optionLabel = computed<string>(() => {
      return customization.value.title || customization.value.name;
    });
    const optionDescription = computed<string | undefined>(() => {
      return customization.value.optionData?.description;
    });
    const optionHint = computed<string | undefined>(() => {
      return customization.value.optionData?.hint;
    });
    const showLabel = computed<boolean>(() => {
      if (customization.value.optionData?.displayWidgetOptions?.hideTitle) {
        return false;
      }

      return (
        customization.value.optionData?.displayWidget !== WidgetType.CHECKBOX
      );
    });
    const showCustomization = computed<boolean>(() => {
      return !(customization.value.optionData?.isRequired && optionValues.value.length === 1);
    });

    return {
      ...useCustomizationOptionValidation(customization),
      ...useCustomizationOptionWidget(
        value,
        customization,
        optionValues,
        productId,
        context
      ),
      ...useWidgetBusyState(
        customization,
        customizationWidgetBusyStateChangedEventName,
        context
      ),
      optionDescription,
      optionHint,
      optionLabel,
      showCustomization,
      showLabel
    };
  }
});
</script>

<style lang="scss" scoped>
.customization-option {
  display: flex;
  flex-direction: column;
  align-items: var(--customization-option-align-items, flex-start);

  ._option-label {
    width: 100%;

    font-size: var(--customization-option-label-size, var(--font-base));
    font-weight: var(--customization-option-label-weight, var(--font-bold));
    text-align: var(--customization-option-label-align, left);
  }

  ._option-description {
    width: 100%;

    font-size: var(--customization-option-description-size, var(--font-sm));
    text-align: var(--customization-option-description-align, left);
    margin: var(
      --customization-option-description-margin,
      var(--spacer-xs) 0 0
    );
  }

  ._option-hint {
    width: 100%;

    font-size: var(--customization-option-hint-size, var(--font-sm));
    text-align: var(--customization-option-hint-align, left);
    margin: var(--customization-option-hint-margin, var(--spacer-xs) 0 0);
  }

  ._widget {
    margin: var(--customization-option-widget-margin, var(--spacer-sm) 0 0);
  }
}
</style>
