<template>
  <form @submit.prevent="onFormSubmit" class="m-notify-customer-support-form">
    <SfInput v-model="name" name="name" :placeholder="$t('Your name')" />
    <SfInput v-model="email" name="email" :placeholder="$t('Your email')" />
    <SfInput v-model="phone" name="name" :placeholder="$t('Phone (optional)')" />

    <SfButton class="sf-button sf-button--outline _submit-button">
      {{ $t('Notify Customer Support') }}
    </SfButton>

    <california-privacy-notice-link />
  </form>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { SfInput, SfButton } from '@storefront-ui/vue';

import { CaliforniaPrivacyNoticeLink } from 'src/modules/true-vault';

export default Vue.extend({
  name: 'MNotifyCustomerSupportForm',
  components: {
    CaliforniaPrivacyNoticeLink,
    SfInput,
    SfButton
  },
  props: {
    prefilledName: {
      type: String,
      default: undefined
    },
    prefilledEmail: {
      type: String,
      default: undefined
    },
    action: {
      type: Function as PropType<(name: string, email: string, phone?: string) => Promise<void>>,
      required: true
    }
  },
  data () {
    return {
      email: '',
      name: '',
      phone: '',
      isSubmitting: false
    }
  },
  beforeMount () {
    this.email = this.prefilledEmail;
    this.name = this.prefilledName;
  },
  methods: {
    async onFormSubmit () {
      if (this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;

      try {
        await this.action(this.name, this.email, this.phone);
        this.$emit('successfully-submitted');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.m-notify-customer-support-form {
  ._submit-button {
    margin: auto;
  }

  .california-privacy-notice-link {
    --privacy-notice-link-width: 100%;
    --privacy-notice-link-text-align: center;
  }
}
</style>
