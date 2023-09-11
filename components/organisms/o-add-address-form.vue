<template>
  <div class="o-add-address-form">
    <validation-observer slim v-slot="{passes}">
      <o-base-address-form
        v-model="address"
        :is-form-fields-disabled="isSubmitting"
      />

      <div class="_buttons-row">
        <SfButton class="color-secondary" @click="onCancelButtonClick" :disabled="isSubmitting">
          {{ $t('Cancel') }}
        </SfButton>

        <SfButton
          @click="() => passes(() => onFormSubmit())"
          :disabled="isSubmitButtonDisabled"
        >
          {{ $t('Add Address') }}
        </SfButton>
      </div>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import { ValidationObserver } from 'vee-validate';
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { SfButton } from '@storefront-ui/vue';
import i18n from '@vue-storefront/i18n';

import OBaseAddressForm from './o-base-address-form.vue';

export default Vue.extend({
  name: 'OAddAddressForm',
  components: {
    SfButton,
    OBaseAddressForm,
    ValidationObserver
  },
  data () {
    return {
      address: {
        city: '',
        country: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        state: '',
        streetAddress: '',
        zipCode: ''
      },
      isSubmitting: false
    }
  },
  computed: {
    isSubmitButtonDisabled (): boolean {
      return this.isSubmitting;
    }
  },
  methods: {
    async onFormSubmit (): Promise<void> {
      if (this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;

      const addressToCreate = {
        firstname: this.address.firstName,
        lastname: this.address.lastName,
        street: [this.address.streetAddress],
        city: this.address.city,
        region: { region: this.address.state },
        postcode: this.address.zipCode,
        country_id: this.address.country,
        telephone: this.address.phoneNumber,
        default_shipping: false
      }

      try {
        await this.$store.dispatch('budsies/createNewAddress', { address: addressToCreate });
        this.$emit('address-added');
      } catch (error) {
        this.onFailure(this.$t('Unable to add new address'));
      } finally {
        this.isSubmitting = false;
      }
    },
    onFailure (message: TranslateResult): void {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message,
        action1: { label: i18n.t('OK') }
      });
    },
    onCancelButtonClick (): void {
      this.$emit('cancel');
    }
  }
})
</script>

<style lang="scss" scoped>
.o-add-address-form {
  ._buttons-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
