<template>
  <div class="m-login modal-content">
    <ValidationObserver
      v-slot="{ handleSubmit: validateAndSubmit }"
      ref="validationObserver"
      slim
    >
      <form
        @submit.prevent="validateAndSubmit(handleSubmit)"
        class="_form"
      >
        <ValidationProvider
          v-slot="{ errors }"
          :rules="{
            required: true,
            email: true
          }"
          slim
          name="Email"
          mode="eager"
        >
          <SfInput
            v-model.trim="emailValue"
            name="email-address"
            type="email"
            :label="$t('Email address')"
            :valid="!errors.length"
            :error-message="errors[0]"
            :disabled="isSubmitting"
          />
        </ValidationProvider>

        <div v-if="isCodeSent" class="_code-sent-message">
          {{ $t('Verification code sent to your email') }}
        </div>

        <ValidationProvider
          v-if="isCodeSent"
          v-slot="{ errors }"
          slim
          :rules="{ required: true }"
          name="OTP"
          mode="eager"
        >
          <SfInput
            v-model.trim="otpCode"
            name="otp"
            type="text"
            ref="otpInput"
            :label="$t('Enter verification code')"
            :valid="!errors.length"
            :error-message="errors[0]"
            :disabled="isSubmitting"
          />
        </ValidationProvider>

        <div
          class="_buttons-container"
          :class="{ '-resend': isCodeSent }"
        >
          <SfButton
            v-if="isCodeSent"
            class="sf-button sf-button--text"
            type="button"
            :disabled="rateLimitCountdown > 0"
            @click="resendOtp"
          >
            {{ resendOtpButtonText }}
          </SfButton>

          <slot
            name="submit-button"
            :isDisabled="isSubmitting"
            :submitButtonText="submitButtonText"
          >
            <SfButton
              class="sf-button _submit-button"
              :disabled="isSubmitting"
              type="submit"
            >
              {{ submitButtonText }}
            </SfButton>
          </slot>
        </div>
      </form>
    </ValidationObserver>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  ref,
  SetupContext,
  nextTick,
  PropType,
  Ref
} from '@vue/composition-api';
import { ValidationProvider, ValidationObserver } from 'vee-validate';
import { SfInput, SfButton } from '@storefront-ui/vue';

import { Logger } from '@vue-storefront/core/lib/logger';
import Task from 'core/lib/sync/types/Task';

function useRateLimit ({ root }: SetupContext) {
  const RATE_LIMIT_TIMEOUT = 60;
  const RATE_LIMIT_ERROR_CODE = 429;

  const rateLimitCountdown = ref(0);
  const rateLimitTimer = ref<number | undefined>(undefined);

  const clearRateLimitTimer = (): void => {
    if (rateLimitTimer.value) {
      window.clearInterval(rateLimitTimer.value);
      rateLimitTimer.value = undefined;
    }

    rateLimitCountdown.value = 0;
  };

  const startRateLimitTimer = (): void => {
    if (rateLimitTimer.value) {
      clearRateLimitTimer();
    }

    rateLimitCountdown.value = RATE_LIMIT_TIMEOUT;

    rateLimitTimer.value = window.setInterval(() => {
      rateLimitCountdown.value--;

      if (rateLimitCountdown.value <= 0) {
        clearRateLimitTimer();
      }
    }, 1000);
  };

  const isRateLimitError = (task: Task): boolean => {
    return task.code === RATE_LIMIT_ERROR_CODE;
  };

  const handleRateLimitError = (): void => {
    startRateLimitTimer();

    root.$store.dispatch('notification/spawnNotification', {
      type: 'warning',
      message: root.$t('Too many requests. Please wait before trying again.'),
      action1: { label: root.$t('OK') }
    });
  };

  onBeforeUnmount(() => {
    clearRateLimitTimer();
  });

  return {
    handleRateLimitError,
    isRateLimitError,
    rateLimitCountdown,
    startRateLimitTimer
  }
}

type ValidationObserverInstance = InstanceType<typeof ValidationObserver>;
type SfInputInstance = InstanceType<typeof SfInput>;

export default defineComponent({
  name: 'MLogin',
  props: {
    emailSubmitButtonText: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    email: {
      type: String,
      default: ''
    }
  },
  components: {
    SfInput,
    SfButton,
    ValidationProvider,
    ValidationObserver
  },
  setup (props, context) {
    const root = context.root;

    const otpInput = ref<SfInputInstance | null>(null);
    const validationObserver = ref<ValidationObserverInstance | null>(null);

    const emailValue = computed<string>({
      get: () => {
        return props.email
      },
      set: (value: string) => {
        context.emit('update:email', value);
      }
    });

    const otpCode = ref<string>('');

    const isSubmitting = ref(false);

    const isCodeSent = ref(false);

    const submitButtonText = computed<string>(() => {
      if (isCodeSent.value) {
        return root.$t('Verify').toString();
      }

      return props.emailSubmitButtonText || root.$t('Login').toString();
    });

    const {
      handleRateLimitError,
      isRateLimitError,
      rateLimitCountdown,
      startRateLimitTimer
    } = useRateLimit(context);

    function focusOtpInput (): void {
      // TODO: temporary - current TS version don't handle `value` type right in this case
      const otpInputRootElement = (otpInput as Ref<SfInputInstance | null>).value?.$el;

      if (!otpInputRootElement) {
        return;
      }

      const inputElement = otpInputRootElement.querySelector('input');

      if (!inputElement) {
        return;
      }

      inputElement.focus();
    }

    const resendOtpButtonText = computed<string>(() => {
      if (rateLimitCountdown.value > 0) {
        return `${root.$t('Resend in')} ${rateLimitCountdown.value}`
      }

      return root.$t('Resend code').toString();
    });

    const requestOtp = async (): Promise<void> => {
      isSubmitting.value = true;

      try {
        const task: Task = await root.$store.dispatch('user/login', { email: emailValue.value });

        if (isRateLimitError(task)) {
          handleRateLimitError();
          return;
        }

        if (task.code !== 200) {
          throw new Error(`Failed to send verification code: ${task.result}`);
        }

        isCodeSent.value = true;
        startRateLimitTimer();
        isSubmitting.value = false;

        await nextTick();
        focusOtpInput();
      } catch (error) {
        Logger.error(error, 'user-login')();

        root.$store.dispatch('notification/spawnNotification', {
          type: 'danger',
          message: root.$t('Unable to send verification code. Please try again.'),
          action1: { label: root.$t('OK') }
        });
      } finally {
        isSubmitting.value = false;
      }
    };

    const submitOtpCode = async (): Promise<void> => {
      isSubmitting.value = true;

      try {
        const response = await root.$store.dispatch('user/authenticate', {
          token: otpCode.value
        });

        if (response.code === 200) {
          root.$store.dispatch('notification/spawnNotification', {
            type: 'success',
            message: root.$t('Successfully logged in!'),
            action1: { label: root.$t('OK') }
          });
        } else {
          root.$store.dispatch('notification/spawnNotification', {
            type: 'danger',
            message: root.$t('Invalid verification code. Please try again.'),
            action1: { label: root.$t('OK') }
          });
        }
      } catch (error) {
        Logger.error(error, 'user-authenticate')();

        root.$store.dispatch('notification/spawnNotification', {
          type: 'danger',
          message: root.$t('Authentication failed. Please try again.'),
          action1: { label: root.$t('OK') }
        });
      } finally {
        isSubmitting.value = false;
      }
    };

    const resendOtp = async (): Promise<void> => {
      if (rateLimitCountdown.value > 0) {
        return;
      }

      // TODO: temporary - current TS version don't handle `value` type right in this case
      (validationObserver as Ref<ValidationObserverInstance | null>).value?.reset();

      await requestOtp();
    };

    const handleSubmit = async (): Promise<void> => {
      if (isCodeSent.value) {
        await submitOtpCode();
      } else {
        await requestOtp();
      }
    };

    const validateForm = async (): Promise<boolean> => {
      // TODO: temporary - current TS version don't handle `value` type right in this case
      const _validationObserver = (validationObserver as Ref<ValidationObserverInstance | null>);

      if (!_validationObserver.value) {
        return false;
      }

      return _validationObserver.value.validate();
    }

    return {
      emailValue,
      handleSubmit,
      isCodeSent,
      isSubmitting,
      otpCode,
      rateLimitCountdown,
      resendOtp,
      resendOtpButtonText,
      submitButtonText,
      otpInput,
      validationObserver,
      validateForm
    };
  }
});
</script>

<style lang="scss" scoped>
.m-login {
  ._buttons-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    &.-resend {
      justify-content: space-between;
    }
  }

  ._code-sent-message {
    font-size: var(--font-sm);
  }

  .sf-input {
  --input-label-required: " *";

    margin-top: var(--spacer-base);
  }
}
</style>
