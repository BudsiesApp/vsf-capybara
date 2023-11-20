<template>
  <div
    class="m-remind-me-about-budsies-form"
  >
    <SfHeading :title="title" :level="3" />

    <validation-observer tag="form" v-slot="{passes}" v-if="showForm">
      <validation-provider
        v-slot="{errors}"
        rules="required|email"
        name="'E-mail'"
      >
        <SfInput
          v-model="email"
          name="email"
          type="email"
          :disabled="isFormDisabled"
          :placeholder="inputPlaceholder"
          :valid="!errors.length"
          :error-message="errors[0]"
        />
      </validation-provider>

      <validation-provider
        v-slot="{errors}"
        rules="required"
        name="'Remind Date'"
      >
        <DatePicker
          class="_date-picker"
          :class="{'-error': errors.length}"
          v-model="date"
          :placeholder="$t('Remind date')"
          :formatter="defaultSystemDateFormatFormatter"
          :disabled-date="isDateDisabled"
          :disabled="isFormDisabled"
          :editable="false"
        />

        <div class="_error-text">
          {{ errors[0] }}
        </div>
      </validation-provider>

      <div class="_button-row">
        <SfButton
          :disabled="isFormDisabled"
          @click.prevent="passes(() => onSubmit())"
        >
          {{ buttonText }}
        </SfButton>
      </div>

      <a class="truevault-polaris-privacy-notice" target="_blank" href="https://privacy.budsies.com/privacy-policy#california-privacy-notice" noreferrer noopener hidden>California Privacy Notice</a>
    </validation-observer>

    <div class="_success-message" v-else>
      {{ successMessage }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import DatePicker from 'vue2-datepicker';
import { ValidationObserver, ValidationProvider, extend } from 'vee-validate';
import { required, email } from 'vee-validate/dist/rules';
import { defineComponent, ref } from '@vue/composition-api';

import { SfButton, SfInput, SfHeading } from '@storefront-ui/vue';

import { usePersistedEmail } from 'src/modules/persisted-customer-data';

import toIsoDateString from 'theme/helpers/to-iso-date-string.function';

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

extend('email', {
  ...email,
  message: 'Please, provide the correct email address'
});

export default defineComponent({
  name: 'MRemindMeAboutBudsiesForm',
  props: {
    buttonText: {
      type: String,
      required: true
    },
    inputPlaceholder: {
      type: String,
      required: true
    },
    successMessage: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  },
  components: {
    DatePicker: DatePicker as VueConstructor<Vue>,
    SfInput,
    SfHeading,
    SfButton,
    ValidationObserver,
    ValidationProvider
  },
  setup () {
    const email = ref<string | undefined>(undefined);

    return {
      email,
      ...usePersistedEmail(email)
    }
  },
  data () {
    return {
      date: undefined as Date | undefined,
      isSubmitting: false,
      isSubmitted: false,
      defaultSystemDateFormatFormatter: {
        stringify: (date: Date) => {
          return date ? date.toLocaleDateString() : '';
        },
        parse: (value: string) => {
          return value ? new Date(value) : undefined;
        }
      }
    }
  },
  computed: {
    showForm (): boolean {
      return !this.isSubmitted;
    },
    isFormDisabled (): boolean {
      return this.isSubmitting;
    }
  },
  methods: {
    isDateDisabled (date: Date): boolean {
      return date.getTime() < Date.now();
    },
    async onSubmit (): Promise<void> {
      if (!this.date || !this.email) {
        throw new Error('Date or E-mail fields is not defined');
      }

      if (this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;

      this.persistLastUsedCustomerEmail(this.email);

      try {
        await this.$store.dispatch('budsies/createPlushieReminder', {
          customerEmail: this.email,
          remindDate: toIsoDateString(this.date)
        });

        this.isSubmitted = true;
      } finally {
        this.isSubmitting = false;
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.m-remind-me-about-budsies-form {
  max-width: 30rem;

  ._button-row {
    margin-top: var(--spacer-base);
    display: flex;
    justify-content: center;
  }

  ._error-text {
    margin-top: var(--spacer-xs);
    height: calc(var(--font-xs) * 1.2);
    color: var(--c-danger-variant);
    font-weight: var(--font-light);
    font-size: var(--font-xs);
  }

  ._success-message {
    text-align: center;
    color: var(--c-primary);
    margin-top: var(--spacer-sm);
  }

  .truevault-polaris-privacy-notice {
    margin-top: var(--spacer-sm);
    display: inline-block;
  }
}
</style>
