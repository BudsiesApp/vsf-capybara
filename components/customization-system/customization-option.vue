<template>
  <div
    class="customization-option"
    :class="'-widget-' + widget.component"
    :ref="validationRef"
  >
    <template
      v-if="showLabel"
    >
      <slot
        name="label"
        :label="optionLabel"
        :is-field-required="isFieldRequired"
      >
        <label
          class="_option-label"
          :class="{ '-required': isFieldRequired }"
        >
          {{ optionLabel }}
        </label>
      </slot>
    </template>

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
        ref="widgetComponent"
        class="_widget"
        :error="errors[0]"
        :is-disabled="isDisabled"
        :is="widget.component"
        v-bind="widget.props"
        v-model="selectedOption"
        @widget-busy-changed="onWidgetBusyChanged"
      />
    </validation-provider>

    <div
      class="_option-hint"
      v-if="optionHint"
      v-html="optionHint"
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  PropType,
  toRefs
} from '@vue/composition-api';
import { ValidationProvider } from 'vee-validate';

import {
  Customization,
  CustomizationDisableConfig,
  CustomizationOptionValue,
  OptionValue,
  useCustomizationOptionValidation,
  useCustomizationOptionWidget,
  useWidgetBusyState,
  WidgetType
} from 'src/modules/customization-system';

import CardsListWidget from './widgets/cards-list-widget.vue';
import CheckboxWidget from './widgets/checkbox-widget.vue';
import ColorsListWidget from './widgets/colors-list-widget.vue';
import DropdownWidget from './widgets/dropdown-widget.vue';
import ImageUploadWidget from './widgets/image-upload-widget.vue';
import ProductionTimeSelector from './production-time-selector.vue';
import SearchFieldWidget from './widgets/search-field-widget.vue';
import TextAreaWidget from './widgets/textarea-widget.vue';
import TextInputWidget from './widgets/text-input-widget.vue';
import ThumbnailsListWidget from './widgets/thumbnails-list-widget.vue';

type WidgetComponent = InstanceType<typeof CardsListWidget> |
InstanceType<typeof CheckboxWidget> |
InstanceType<typeof ColorsListWidget> |
InstanceType<typeof DropdownWidget> |
InstanceType<typeof ImageUploadWidget> |
InstanceType<typeof ProductionTimeSelector> |
InstanceType<typeof SearchFieldWidget> |
InstanceType<typeof TextAreaWidget> |
InstanceType<typeof TextInputWidget> |
InstanceType<typeof ThumbnailsListWidget>;

const customizationWidgetBusyStateChangedEventName =
  'customization-option-busy-state-changed';

export default defineComponent({
  name: 'CustomizationOption',
  components: {
    CardsListWidget,
    CheckboxWidget,
    ColorsListWidget,
    DropdownWidget,
    ImageUploadWidget,
    ProductionTimeSelector,
    SearchFieldWidget,
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
    },
    disableValidation: {
      type: Boolean,
      default: false
    },
    fieldNamePrefix: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    customizationDisableConfig: {
      type: Object as PropType<CustomizationDisableConfig | undefined>,
      default: undefined
    }
  },
  setup (props, context) {
    const { customization, disableValidation, fieldNamePrefix, optionValues, productId, value, customizationDisableConfig } = toRefs(props);

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

    const widgetComponent = ref<null | WidgetComponent>(null);

    return {
      ...useCustomizationOptionValidation(
        customization,
        disableValidation,
        fieldNamePrefix
      ),
      ...useCustomizationOptionWidget(
        value,
        customization,
        optionValues,
        productId,
        context,
        customizationDisableConfig
      ),
      ...useWidgetBusyState(
        customization,
        customizationWidgetBusyStateChangedEventName,
        context
      ),
      optionDescription,
      optionHint,
      optionLabel,
      showLabel,
      widgetComponent
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

    display: var(--customization-option-label-display, block);
    font-size: var(--customization-option-label-size, var(--font-base));
    font-weight: var(--customization-option-label-weight, var(--font-bold));
    text-align: var(--customization-option-label-align, left);

    &.-required {
      &::after {
        color: var(--customization-option-required-field-mark-color);
        content: "*";
      }
    }
  }

  ._option-description {
    width: 100%;

    display: var(--customization-option-description-display, block);
    font-size: var(--customization-option-description-size, var(--font-sm));
    text-align: var(--customization-option-description-align, left);
    margin: var(
      --customization-option-description-margin,
      var(--spacer-xs) 0 0
    );
  }

  ._option-hint {
    display: var(--customization-option-hint-display, block);
    font-size: var(--customization-option-hint-size, var(--font-sm));
    text-align: var(--customization-option-hint-align, left);
    margin: var(--customization-option-hint-margin, var(--spacer-xs) 0 0);
  }

  ._option-description,
  ._option-hint {
    ::v-deep {
      li {
        text-align: left;
      }
    }
  }

  ._widget {
    margin: var(--customization-option-widget-margin, var(--spacer-sm) 0 0);
  }
}
</style>
