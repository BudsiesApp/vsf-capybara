<template>
  <ValidationObserver
    v-slot="{ handleSubmit: validateAndSubmit }"
  >
    <form
      @submit.prevent="validateAndSubmit(handleSubmit)"
      class="m-otp-request-form"
    >
      <ValidationProvider
        v-slot="{ errors }"
        :rules="{
          required: true,
          email: true
        }"
        name="email"
      >
        <SfInput
          v-model="email"
          name="email"
          type="email"
          :label="$t('Your email')"
          :valid="!errors.length"
          :error-message="errors[0]"
          class="form__element"
          :disabled="isSubmitting"
        />
      </ValidationProvider>

      <SfButton
        class="sf-button--full-width form__submit"
        :disabled="isSubmitButtonDisabled"
      >
        {{ submitButtonText }}
      </SfButton>
    </form>
  </ValidationObserver>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  ref
} from '@vue/composition-api';
import { ValidationProvider, ValidationObserver } from 'vee-validate';
import { SfInput, SfButton } from '@storefront-ui/vue';

import { Logger } from '@vue-storefront/core/lib/logger';

export default defineComponent({
  name: 'MOtpRequestForm',
  components: {
    SfInput,
    SfButton,
    ValidationProvider,
    ValidationObserver
  },
  props: {
    submitButtonText: {
      type: String,
      default: 'Login'
    }
  },
  setup (props, { root }) {

  }
});
</script>
