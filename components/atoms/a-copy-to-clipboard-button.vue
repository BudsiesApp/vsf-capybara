<template>
  <SfButton
    :class="buttonClass"
    :disabled="disabled || isCopying || !value"
    @click="copy"
  >
    {{ buttonText }}
  </SfButton>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  ref,
  watch
} from '@vue/composition-api';
import { SfButton } from '@storefront-ui/vue';

type CopyFeedbackState = 'idle' | 'copied' | 'error'

export default defineComponent({
  name: 'ACopyToClipboardButton',
  components: {
    SfButton
  },
  props: {
    buttonClass: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    errorText: {
      type: String,
      default: 'Retry copy'
    },
    idleText: {
      type: String,
      default: 'Copy code'
    },
    resetDelayMs: {
      type: Number,
      default: 1800
    },
    successText: {
      type: String,
      default: 'Copied'
    },
    value: {
      type: String,
      required: true
    }
  },
  setup (props, { emit }) {
    const feedbackState = ref<CopyFeedbackState>('idle');
    const isCopying = ref<boolean>(false);
    const resetTimeoutId = ref<number | undefined>(undefined);

    const clearResetTimeout = (): void => {
      if (!resetTimeoutId.value) {
        return;
      }

      clearTimeout(resetTimeoutId.value);
      resetTimeoutId.value = undefined;
    };

    const resetFeedback = (): void => {
      clearResetTimeout();
      feedbackState.value = 'idle';
    };

    const scheduleReset = (): void => {
      clearResetTimeout();

      resetTimeoutId.value = window.setTimeout(() => {
        feedbackState.value = 'idle';
        resetTimeoutId.value = undefined;
      }, props.resetDelayMs);
    };

    const writeTextToClipboard = async (text: string): Promise<void> => {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);

        return;
      }

      if (typeof document === 'undefined') {
        throw new Error('Clipboard is unavailable');
      }

      const textarea = document.createElement('textarea');

      textarea.value = text;
      textarea.setAttribute('readonly', 'readonly');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';

      document.body.appendChild(textarea);
      textarea.select();

      const isCopied = document.execCommand('copy');

      document.body.removeChild(textarea);

      if (!isCopied) {
        throw new Error('Clipboard copy failed');
      }
    };

    const buttonText = computed<string>(() => {
      if (feedbackState.value === 'copied') {
        return props.successText;
      }

      if (feedbackState.value === 'error') {
        return props.errorText;
      }

      return props.idleText;
    });

    const copy = async (): Promise<void> => {
      if (props.disabled || !props.value || isCopying.value) {
        return;
      }

      clearResetTimeout();
      isCopying.value = true;

      try {
        await writeTextToClipboard(props.value);
        feedbackState.value = 'copied';
        emit('copied');
      } catch (error) {
        feedbackState.value = 'error';
        emit('copy-failed', error);
      } finally {
        isCopying.value = false;
      }

      scheduleReset();
    };

    watch(() => props.value, () => {
      resetFeedback();
    });

    onBeforeUnmount(() => {
      clearResetTimeout();
    });

    return {
      buttonText,
      copy,
      isCopying
    };
  }
});
</script>
