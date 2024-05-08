<template>
  <div class="customization-option">
    <label
      for=""
      class="_option-label"
      :ref="validationRef"
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
        :is-disabled="isDisabled"
        :error="errors[0]"
        :is="widgetComponent"
        :values="optionValues"
        v-model="selectedOption"
      />
    </validation-provider>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs } from '@vue/composition-api';
import { extend, ValidationProvider } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';

import { Customization, CustomizationStateItem, useCustomizationOptionValidation, useCustomizationOptionWidget } from 'src/modules/customization-system';

import CheckboxWidget from './checkbox-widget.vue';

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

export default defineComponent({
  name: 'CustomizationOption',
  components: {
    CheckboxWidget,
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

    return {
      ...useCustomizationOptionValidation(customization),
      ...useCustomizationOptionWidget(
        value,
        customization,
        selectedOptionValuesIds,
        context
      ),
      customizationLabel
    }
  }
})
</script>
