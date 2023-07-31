<template>
  <div class="m-raffle-registration-form">
    <form class="_form">
      <validation-observer>
        <div class="_row">
          <validation-provider
            slim
            v-slot="{errors}"
            rules="required"
            :name="$t('First Name')"
          >
            <SfInput
              class="_form-input -half"
              v-model="firstName"
              :label="$t('First Name')"
              :valid="!errors.length"
              :error-message="errors[0]"
            />
          </validation-provider>

          <validation-provider
            slim
            v-slot="{errors}"
            rules="required"
            :name="$t('Last Name')"
          >
            <SfInput
              class="_form-input -half"
              v-model="lastName"
              :label="$t('Last Name')"
              :valid="!errors.length"
              :error-message="errors[0]"
            />
          </validation-provider>
        </div>

        <div class="_row">
          <validation-provider
            slim
            v-slot="{errors}"
            rules="required|email"
            :name="$t('E-mail')"
          >
            <SfInput
              class="_form-input"
              v-model="email"
              :label="$t('E-mail')"
              :valid="!errors.length"
              :error-message="errors[0]"
            />
          </validation-provider>

          <SfButton>
            {{ $t('Get Ticket') }}
          </SfButton>
        </div>

        <div class="_agreement">
          {{ $t('You agree to receive email marketing from Budsies regarding our products and services.') }}
        </div>
      </validation-observer>
    </form>

    <div class="_capacity">
      <div class="_content">
        <div class="_inner">
          Capacity Per
          | Week
        </div>

        <div class="_capacity-count">
          {{ capacity }}
        </div>
      </div>

      <div class="_next-drawing">
        {{ nextDrawing }}
      </div>
    </div>

    <ul class="_rules">
      <li class="_rule">
        {{ $t('Approx. 10-25 spots will open each week based on our artists\' capacity') }}
      </li>

      <li class="_rule">
        {{ $t('If your ticket is chosen, you\'ll be notified via email and have 5 days to order your Specialty Commission') }}
      </li>

      <li class="_rule">
        {{ $t('We will first get through all raffle ticket holders before we open up Specialty Commissions to the public') }}
      </li>

      <li class="_rule">
        {{ $t('You can see all previously chosen ticket numbers') }} <SfButton
          class="sf-button--text"
          @click="showWinners"
        >
          {{ $t('here') }}
        </SfButton>
      </li>
    </ul>

    <div class="_support">
      {{ $t('Thank you for supporting our artists & good luck!!') }}
    </div>
  </div>
</template>

<script lang="ts">
import { extend, ValidationProvider, ValidationObserver } from 'vee-validate';
import { email, required } from 'vee-validate/dist/rules';
import Vue, { PropType } from 'vue';

import { SfButton, SfInput } from '@storefront-ui/vue';

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

extend('email', {
  ...email,
  message: 'Please, provide the correct email address'
});

export default Vue.extend({
  name: 'MRaffleRegistrationForm',
  components: {
    SfButton,
    SfInput
  },
  props: {
    capacity: {
      type: Number,
      required: true
    },
    nextDrawingDate: {
      type: Object as PropType<Date>,
      required: true
    }
  },
  data () {
    return {
      firstName: undefined,
      lastName: undefined,
      email: undefined
    }
  },
  computed: {
    nextDrawing (): string {
      return this.$t('Next Drawing: {date}', {
        date: this.nextDrawingDate
      })
    }
  }
})
</script>
