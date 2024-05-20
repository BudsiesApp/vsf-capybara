<template>
  <div
    class="customization-option"
    :ref="validationRef"
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
    >
      <component
        class="_widget"
        :error="errors[0]"
        :is-disabled="isDisabled"
        :is="widget.component"
        v-bind="widget.props"
        v-model="selectedOption"
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
  CustomizationStateItem,
  OptionValue,
  useCustomizationOptionValidation,
  useCustomizationOptionWidget,
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
      type: Object as PropType<CustomizationStateItem | undefined>,
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
      return (
        customization.value.optionData?.displayWidget !== WidgetType.CHECKBOX
      );
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
      optionDescription,
      optionHint,
      optionLabel,
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

  ._option-description {
    font-size: var(--customization-option-description-size, var(--font-sm));
    text-align: var(--customization-option-description-align, left);
    margin: var(
      --customization-option-description-margin,
      var(--spacer-xs) 0 0
    );
  }

  ._option-hint {
    font-size: var(--customization-option-hint-size, var(--font-sm));
    text-align: var(--customization-option-hint-align, left);
    margin: var(--customization-option-hint-margin, var(--spacer-xs) 0 0);
  }

  ._widget {
    margin: var(--customization-option-widget-margin, var(--spacer-sm) 0 0);
  }
}
</style>
