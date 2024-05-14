<template>
  <div class="free-text-dropdown-widget">
    <MMultiselect
      v-model.trim="selectedOption"
      :allow-free-text="true"
      :disabled="isDisabled"
      :error-message="error"
      id-field="id"
      :hide-dropdown-arrow="true"
      :options="values"
      :required="false"
      :valid="isValid"
    />

    <div class="_error-message">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import { SfSelect } from '@storefront-ui/vue';
import { computed, defineComponent, PropType } from '@vue/composition-api';

import { OptionValue } from 'src/modules/customization-system';

import MMultiselectVue from '../molecules/m-multiselect.vue';

export default defineComponent({
  name: 'DropdownWidget',
  components: {
    MMultiselectVue,
    SfSelect
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
    const selectedOption = computed<string | undefined>({
      get: () => {
        return props.value;
      },
      set: (newValue) => {
        emit('input', newValue);
      }
    });
    const isValid = computed<boolean>(() => {
      return !props.error
    });

    return {
      isValid,
      selectedOption
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/typography";

.free-text-dropdown-widget {
  ._error-message {
    color: var(--input-error-message-color, var(--c-danger));
    height: calc(var(--font-xs) * 1.2);

    @include font(
      --input-error-message-font,
      var(--font-medium),
      var(--font-xs),
      1.2,
      var(--font-family-secondary)
    );
  }
}
</style>
