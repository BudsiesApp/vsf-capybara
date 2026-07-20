<template>
  <div
    class="customization-option"
    :class="customizationOptionClasses"
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
          :id="customization.id"
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
        @expand-clicked="(optionValueId) => $emit('expand-clicked', optionValueId)"
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
import SearchFieldWidget from './widgets/search-field-widget.vue';
import TextAreaWidget from './widgets/textarea-widget.vue';
import TextInputWidget from './widgets/text-input-widget.vue';
import ThumbnailsListWidget from './widgets/thumbnails-list-widget.vue';

type WidgetComponent = InstanceType<typeof CardsListWidget> |
InstanceType<typeof CheckboxWidget> |
InstanceType<typeof ColorsListWidget> |
InstanceType<typeof DropdownWidget> |
InstanceType<typeof ImageUploadWidget> |
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
      type: [Number, String] as PropType<number | string>,
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
    addedToCartOptionValueId: {
      type: Object as PropType<Record<string, boolean> | undefined>,
      default: undefined
    },
    expandConfig: {
      type: Object as PropType<Record<string, {
        isExpandable: boolean,
        isExpanded: boolean
      }> | undefined>,
      default: undefined
    },
    hiddenOptionValues: {
      type: Object as PropType<Record<string, boolean> | undefined>,
      default: undefined
    }
  },
  setup (props, context) {
    const { customization, disableValidation, fieldNamePrefix, optionValues, productId, value, addedToCartOptionValueId, expandConfig, hiddenOptionValues } = toRefs(props);

    const normalizedProductId = computed<number>(() => {
      const result = Number(productId.value);

      if (!Number.isFinite(result)) {
        throw new Error(`Invalid customization product ID: ${productId.value}`);
      }

      return result;
    });

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
    const widgetState = useCustomizationOptionWidget(
      value,
      customization,
      optionValues,
      normalizedProductId,
      context,
      addedToCartOptionValueId,
      expandConfig,
      hiddenOptionValues
    );
    const customizationOptionClasses = computed(() => ({
      ['-widget-' + widgetState.widget.value.component]: true,
      '-compact-spacing': widgetState.useCompactSpacing.value
    }));

    return {
      ...useCustomizationOptionValidation(
        customization,
        disableValidation,
        fieldNamePrefix
      ),
      ...widgetState,
      ...useWidgetBusyState(
        customization,
        customizationWidgetBusyStateChangedEventName,
        context
      ),
      optionDescription,
      optionHint,
      optionLabel,
      customizationOptionClasses,
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

  > :first-child {
    margin-top: 0;
  }
}
</style>
