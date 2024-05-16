<template>
  <sf-input
    class="text-input-widget"
    :disabled="isDisabled"
    :error-message="error"
    :placeholder="placeholder"
    :valid="isValid"
    v-model.trim="valueModel"
  />
</template>

<script lang="ts">
import { SfInput } from '@storefront-ui/vue';
import { computed, defineComponent, PropType } from '@vue/composition-api';

export default defineComponent({
  name: 'TextInputWidget',
  components: {
    SfInput
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
    placeholder: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    value: {
      type: [String, Array] as PropType<string | undefined>,
      default: undefined
    }
  },
  setup (props, { emit }) {
    const valueModel = computed<string | undefined>({
      get: () => {
        return props.value
      },
      set: (newValue: string | undefined) => {
        emit('input', newValue)
      }
    });
    const isValid = computed<boolean>(() => {
      return !props.error;
    })

    return {
      isValid,
      valueModel
    }
  }
})
</script>
