<template>
  <div class="textarea-widget">
    <textarea
      :aria-describedby="ariaDescribedby"
      :aria-invalid="ariaInvalid"
      :aria-labelledby="ariaLabelledby"
      class="_textarea"
      :disabled="isDisabled"
      :placeholder="placeholder"
      rows="4"
      v-model.trim="valueModel"
    />

    <div
      :id="errorMessageId"
      class="_error-message"
      aria-live="polite"
    >
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { useErrorAccessibility } from 'theme/helpers/use-error-accessibility';

export default defineComponent({
  name: 'TextareaWidget',
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
      type: [String, Array] as PropType<string | undefined>,
      default: undefined
    }
  },
  setup (props, { emit }) {
    const hasError = computed<boolean>(() => !!props.error);
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

    const { ariaDescribedby, ariaInvalid, errorMessageId } = useErrorAccessibility(
      'textarea-widget',
      hasError
    );

    return {
      ariaDescribedby,
      ariaInvalid,
      errorMessageId,
      isValid,
      valueModel
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/typography";

.textarea-widget {
  --input-font-family: var(--font-family-primary);
  --input-label-font-family: var(--font-family-primary);
  --input-error-message-font-family: var(--font-family-primary);

  width: 100%;

  ._textarea {
    display: flex;
    box-sizing: border-box;
    border: 1px solid var(--c-light);
    width: 100%;
    padding: var(--spacer-sm);
    font: var(
      --input-font,
      var(--input-font-weight, var(--font-normal))
        var(--input-font-size, var(--font-lg)) /
        var(--input-font-line-height, 1)
        var(--input-font-family, var(--font-family-secondary))
    );
    color: var(--input-color, var(--c-text));
    resize: vertical;

    &:focus {
      border-color: var(--c-primary);
      outline: none;
    }

    &:focus-visible {
      outline: var(--c-black) auto 1px;
      outline: -webkit-focus-ring-color auto 1px;
      outline: AccentColor auto 1px;
      outline-offset: 2px;
    }
  }

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
