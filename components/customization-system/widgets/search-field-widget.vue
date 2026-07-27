<template>
  <div class="search-field-widget">
    <MMultiselect
      v-model.trim="selectedOption"
      :allow-free-text="true"
      :disabled="isDisabled"
      :error-message="error"
      :error-message-id="errorMessageId"
      id-field="name"
      label-field="name"
      :labelled-by="ariaLabelledby"
      :hide-dropdown-arrow="true"
      :options="sortedValues"
      :placeholder="placeholder"
      :required="false"
      :valid="isValid"
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  toRefs
} from 'vue';

import {
  OptionValue,
  useValuesSort
} from 'src/modules/customization-system';
import { useErrorAccessibility } from 'theme/helpers/use-error-accessibility';

import MMultiselect from 'theme/components/molecules/m-multiselect.vue';

export default defineComponent({
  name: 'SearchFieldWidget',
  components: {
    MMultiselect
  },
  props: {
    ariaLabelledby: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    error: {
      type: String,
      default: undefined
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    value: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    values: {
      type: Array as PropType<OptionValue[]>,
      default: () => []
    }
  },
  setup (props, { emit }) {
    const { values } = toRefs(props);
    const hasError = computed<boolean>(() => !!props.error);
    const selectedOption = computed<string | undefined>({
      get: () => {
        return props.value;
      },
      set: (newValue) => {
        emit('input', newValue);
      }
    });
    const isValid = computed<boolean>(() => {
      return !props.error;
    });

    const { errorMessageId } = useErrorAccessibility(
      'search-field-widget',
      hasError
    );

    return {
      errorMessageId,
      isValid,
      selectedOption,
      ...useValuesSort(values)
    };
  }
});
</script>

<style lang="scss" scoped>
.search-field-widget {
  --multiselect-margin: 0;
  --multiselect-tags-padding-top: var(--spacer-xs);
  --multiselect-tags-min-height: auto;

  width: 100%;
  max-width: 610px;
}
</style>
