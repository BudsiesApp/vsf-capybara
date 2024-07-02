<template>
  <div class="checkbox-widget">
    <m-checkbox
      class="_checkbox"
      :disabled="isDisabled"
      :label="label"
      :valid="isValid"
      v-model="isSelected"
    />

    <div class="_error-message">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRef } from '@vue/composition-api';

import { OptionValue, useDefaultValue } from 'src/modules/customization-system';

import MCheckbox from 'theme/components/molecules/m-checkbox.vue';

export default defineComponent({
  name: 'CheckboxWidget',
  components: {
    MCheckbox
  },
  props: {
    error: {
      type: String,
      default: undefined
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      required: true
    },
    value: {
      type: [String, Array] as PropType<string | string[] | undefined>,
      default: undefined
    },
    values: {
      type: Array as PropType<OptionValue[]>,
      default: () => []
    }
  },
  setup (props, { emit }) {
    const valueIdForSelectedState = computed<string>(() => {
      return props.values[0].id;
    });
    const valueIdForUnselectedState = computed<string>(() => {
      return props.values[1]?.id || '';
    });

    const selectedOption = computed<string | string[] | undefined>({
      get: () => {
        return props.value;
      },
      set: (value) => {
        emit(
          'input',
          value || valueIdForUnselectedState.value
        );
      }
    })

    const isSelected = computed<boolean>({
      get: () => {
        if (!props.value) {
          return false;
        }

        const value = Array.isArray(props.value)
          ? props.value[0]
          : props.value;

        return !!value && value === valueIdForSelectedState.value;
      },
      set: (selected) => {
        selectedOption.value = selected
          ? valueIdForSelectedState.value
          : valueIdForUnselectedState.value
      }
    });
    const isValid = computed<boolean>(() => {
      return !props.error;
    });

    useDefaultValue(
      selectedOption,
      toRef(props, 'values'),
      toRef(props, 'isRequired')
    );

    return {
      isSelected,
      isValid
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/typography";

.checkbox-widget {
  display: flex;
  flex-direction: column;
  text-align: left;

  ._error-message {
    color: var(--widget-error-message-color, var(--c-danger-variant));
    height: calc(var(--font-xs) * 1.2);
    margin-top: var(--spacer-xs);

    @include font(
      --widget-error-message-font,
      var(--font-medium),
      var(--font-xs),
      1.2,
      var(--font-family-secondary)
    );
  }
}
</style>
