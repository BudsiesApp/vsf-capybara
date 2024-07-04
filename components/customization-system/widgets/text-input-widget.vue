<template>
  <div class="text-input-widget">
    <sf-input
      class="_input"
      :disabled="isDisabled"
      :error-message="error"
      :placeholder="placeholder"
      :type="type"
      :valid="isValid"
      v-model.trim="valueModel"
    />
  </div>
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
    type: {
      type: String as PropType<'text' | 'email'>,
      default: 'text'
    },
    value: {
      type: [String, Array] as PropType<string | undefined>,
      default: undefined
    }
  },
  setup (props, { emit }) {
    const valueModel = computed<string | undefined>({
      get: () => {
        return props.value;
      },
      set: (newValue: string | undefined) => {
        emit('input', newValue);
      }
    });
    const isValid = computed<boolean>(() => {
      return !props.error;
    });

    return {
      isValid,
      valueModel
    };
  }
});
</script>

<style lang="scss" scoped>
.text-input-widget {
  width: 100%;
  max-width: 610px;

  ._input {
    --input-padding: 0 0 var(--spacer-xs) 0;
  }
}
</style>
