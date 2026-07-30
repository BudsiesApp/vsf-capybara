<template>
  <div class="m-login modal-content">
    <ValidationObserver
      ref="validationObserver"
      slim
    >
      <form
        @submit.prevent="onFormSubmit"
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
            ref="emailFieldAnchor"
            name="email-address"
            type="email"
            :label="$t('Email address')"
            autocomplete="email"
            :valid="!errors.length"
            :error-message="errors[0]"
            :disabled="isSubmitting"
          />
        </ValidationProvider>

        <div
          class="_code-sent-message"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ isCodeSent ? $t('Verification code sent to your email') : "" }}
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
            ref="otpFieldAnchor"
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
            v-if="showCancelButton"
            class="sf-button sf-button--text"
            type="button"
            :disabled="isSubmitting"
            @click="cancelLogin"
          >
            {{ $t('Cancel') }}
          </SfButton>

          <SfButton
            v-if="isCodeSent"
            class="sf-button sf-button--text"
            type="button"
            :disabled="rateLimitCountdown > 0 || isSubmitting"
            @click="resendOtp"
          >
            {{ resendOtpButtonText }}
          </SfButton>

          <slot
            name="submit-button"
            :is-disabled="isSubmitting"
            :submit-button-text="submitButtonText"
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
import { useI18n, useStore } from '@vue-storefront/core/application-services';
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  ref,
  nextTick,
  PropType,
  Ref
} from 'vue';
import { extend, ValidationProvider, ValidationObserver } from 'vee-validate';
import { required, email } from 'vee-validate/dist/rules';
import { SfInput, SfButton } from '@storefront-ui/vue';

import { Logger } from '@vue-storefront/core/lib/logger';
import { AuthenticateRequestResponse } from '@vue-storefront/core/modules/user';
import Task from 'core/lib/sync/types/Task';
import { FormRefs, useFormValidation, getFieldAnchorName } from 'theme/helpers/use-form-validation';

extend('required', {
  ...required,
  message: 'Field is required'
});
extend('email', {
  ...email,
  message: 'Please, provide the correct email address'
});

function useRateLimit () {
  const applicationStore = useStore();
  const applicationI18n = useI18n();
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

    applicationStore.dispatch('notification/spawnNotification', {
      type: 'warning',
      message: applicationI18n.t('Too many requests. Please wait before trying again.'),
      action1: { label: applicationI18n.t('OK') }
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
    },
    allowCancel: {
      type: Boolean,
      default: false
    }
  },
  components: {
    SfInput,
    SfButton,
    ValidationProvider,
    ValidationObserver
  },
  setup (props, context) {
    const applicationStore = useStore();
    const applicationI18n = useI18n();
    const emit = context.emit;

    const validationObserver: Ref<ValidationObserverInstance | null> = ref(null);
    const emailFieldAnchor: Ref<SfInputInstance | null> = ref(null);
    const otpFieldAnchor: Ref<SfInputInstance | null> = ref(null);

    const emailValue = computed<string>({
      get: () => {
        return props.email
      },
      set: (value: string) => {
        context.emit('update:email', value);
      }
    });

    const otpCode = ref<string>('');

    const _isSubmitting = ref(false);
    const isSubmitting = computed<boolean>({
      get: () => _isSubmitting.value,
      set: (value: boolean) => {
        _isSubmitting.value = value;
        emit('is-submitting-changed', value);
      }
    });

    const isCodeSent = ref(false);

    const submitButtonText = computed<string>(() => {
      if (isCodeSent.value) {
        return applicationI18n.t('Verify').toString();
      }

      return props.emailSubmitButtonText || applicationI18n.t('Login').toString();
    });

    const {
      handleRateLimitError,
      isRateLimitError,
      rateLimitCountdown,
      startRateLimitTimer
    } = useRateLimit();

    const {
      validateAndGoToFirstError
    } = useFormValidation(
      validationObserver,
      (): FormRefs => {
        const refs: FormRefs = {};
        if (emailFieldAnchor.value) {
          refs[getFieldAnchorName('Email')] = emailFieldAnchor.value;
        }
        if (otpFieldAnchor.value) {
          refs[getFieldAnchorName('OTP')] = otpFieldAnchor.value;
        }
        return refs;
      }
    );

    function focusOtpInput (): void {
      const otpInputRootElement = otpFieldAnchor.value;

      if (!otpInputRootElement) {
        return;
      }

      const inputElement = otpInputRootElement.$el.querySelector('input');

      if (!inputElement) {
        return;
      }

      inputElement.focus();
    }

    const resendOtpButtonText = computed<string>(() => {
      if (rateLimitCountdown.value > 0) {
        return `${applicationI18n.t('Resend in')} ${rateLimitCountdown.value}`
      }

      return applicationI18n.t('Resend code').toString();
    });

    const requestOtp = async (): Promise<void> => {
      isSubmitting.value = true;

      try {
        const task: Task = await applicationStore.dispatch('user/login', { email: emailValue.value });

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

        emit('otp-requested');

        await nextTick();
        focusOtpInput();
      } catch (error) {
        Logger.error(error, 'user-login')();

        applicationStore.dispatch('notification/spawnNotification', {
          type: 'danger',
          message: applicationI18n.t('Unable to send verification code. Please try again.'),
          action1: { label: applicationI18n.t('OK') }
        });
      } finally {
        isSubmitting.value = false;
      }
    };

    const submitOtpCode = async (): Promise<void> => {
      isSubmitting.value = true;

      try {
        const response: Task = await applicationStore.dispatch('user/authenticate', {
          token: otpCode.value,
          email: emailValue.value
        });
        const result: AuthenticateRequestResponse = response.result;

        if (response.code !== 200) {
          const error = response.result.errorMessage || applicationI18n.t('Authentication failed').toString();

          applicationStore.dispatch('notification/spawnNotification', {
            type: 'danger',
            message: error,
            action1: { label: applicationI18n.t('OK') }
          });
          return;
        }

        emit('otp-submitted');

        if (!result.is_new_customer) {
          applicationStore.dispatch('notification/spawnNotification', {
            type: 'success',
            message: applicationI18n.t('Successfully logged in!'),
            action1: { label: applicationI18n.t('OK') }
          });
          return;
        }

        emit('registration-required', result.token);
      } catch (error) {
        Logger.error(error, 'user-authenticate')();

        applicationStore.dispatch('notification/spawnNotification', {
          type: 'danger',
          message: applicationI18n.t('Authentication failed. Please try again.'),
          action1: { label: applicationI18n.t('OK') }
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

    const onFormSubmit = async (): Promise<void> => {
      const isFormValid = await validateAndGoToFirstError();

      if (!isFormValid) {
        return;
      }

      await handleSubmit();
    };

    const showCancelButton = computed<boolean>(() => {
      return props.allowCancel && isCodeSent.value;
    });

    const cancelLogin = (): void => {
      if (!props.allowCancel) {
        return;
      }

      isCodeSent.value = false;
      otpCode.value = '';
      isSubmitting.value = false;

      emit('cancelled');
    };

    return {
      cancelLogin,
      emailFieldAnchor,
      emailValue,
      getFieldAnchorName,
      handleSubmit,
      isCodeSent,
      isSubmitting,
      onFormSubmit,
      otpCode,
      otpFieldAnchor,
      rateLimitCountdown,
      resendOtp,
      resendOtpButtonText,
      showCancelButton,
      submitButtonText,
      validationObserver,
      validateAndGoToFirstError
    };
  }
});
</script>

<style lang="scss" scoped>
.m-login {
  ._buttons-container {
    display: flex;
    align-items: center;
    justify-content: var(--m-login-buttons-justify-content, flex-end);
    flex-direction: var(--m-login-buttons-direction, row);
    column-gap: var(--spacer-sm);

    &.-resend {
      justify-content: var(--m-login-buttons-resend-justify-content, space-between);
    }
  }

  ._code-sent-message {
    font-size: var(--font-sm);
  }

  .sf-input {
  --input-label-required: " *";

    margin: var(--spacer-base) 0 var(--spacer-xs);
  }
}
</style>
