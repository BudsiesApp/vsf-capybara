<template>
  <div class="dropdown-free-text-widget">
    <MMultiselect
      v-model.trim="selectedOption"
      :allow-free-text="true"
      :disabled="isDisabled"
      :error-message="error"
      id-field="id"
      label-field="name"
      :hide-dropdown-arrow="true"
      :options="values"
      :required="false"
      :valid="isValid"
    />
  </div>
</template>

<script lang="ts">
import { SfSelect } from '@storefront-ui/vue';
import { computed, defineComponent, PropType } from '@vue/composition-api';

import { OptionValue } from 'src/modules/customization-system';

import MMultiselect from '../molecules/m-multiselect.vue';

export default defineComponent({
  name: 'DropdownFreeTextWidget',
  components: {
    MMultiselect,
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

.dropdown-free-text-widget {
}
</style>
