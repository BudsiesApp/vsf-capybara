<template>
  <div
    class="m-remind-me-about-budsies-form"
  >
    <SfHeading :title="title" :level="3" />

    <validation-observer tag="form" v-slot="{passes}" v-if="showForm">
      <validation-provider
        v-slot="{errors}"
        rules="required|email"
        name="email"
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
        name="date"
      >
        <DatePicker
          class="_date-picker"
          v-model="date"
          placeholder="mm/dd/yy"
          format="MM/DD/YY"
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

import { SfButton, SfInput, SfHeading } from '@storefront-ui/vue';

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

extend('email', {
  ...email,
  message: 'Please, provide the correct email address'
});

export default Vue.extend({
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
  data () {
    return {
      email: '',
      date: null as Date | null,
      isSubmitting: false,
      isSubmitted: false
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
    async onSubmit (): Promise<void> {
      if (!this.date || !this.email) {
        throw new Error('Date or E-mail fields is not defined');
      }

      if (this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;

      try {
        await this.$store.dispatch('budsies/remindAboutBudsies', {
          customerEmail: this.email,
          remindDate: this.date.toISOString().split('T')[0]
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
  .m-remind-me-about-budsies-form{
    ._button-row {
      margin-top: var(--spacer-base);
      display: flex;
      justify-content: center;
    }

    ._error-text {
      color: var(--c-danger);
      margin-top: var(--spacer-xs);
      height: calc(var(--font-xs) * 1.2);

      font: var(--input-error-message-font, var(--input-error-message-font-weight, var(--font-medium)) var(--input-error-message-font-size, var(--font-xs))/var(--input-error-message-font-line-height, 1.2) var(--input-error-message-font-family, var(--font-family-secondary)));
    }

    ._success-message {
      text-align: center;
      color: var(--c-primary);
      margin-top: var(--spacer-sm);
    }
  }
  </style>
