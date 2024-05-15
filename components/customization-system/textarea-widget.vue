<template>
  <div class="textarea-widget">
    <textarea
      class="_textarea"
      :disabled="isDisabled"
      rows="4"
      v-model.trim="valueModel"
    />

    <div class="_error-message">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import { SfInput } from '@storefront-ui/vue';
import { computed, defineComponent, PropType } from '@vue/composition-api';

export default defineComponent({
  name: 'TextareaWidget',
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

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/typography";

.textarea-widget {
  ._textarea {
    box-sizing: border-box;
    border: 1px solid var(--c-light);
    width: 100%;
    padding: var(--spacer-sm);
    font-family: var(--font-family-primary);
    resize: vertical;
    outline: none;

    &:focus {
      border-color: var(--c-primary);
    }
  }

  ._error-message {
    color: var(--input-error-message-color, var(--c-danger));
    height: calc(var(--font-xs) * 1.2);
    margin-top: var(--spacer-xs);

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
