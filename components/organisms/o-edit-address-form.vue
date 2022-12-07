<template>
  <div class="o-edit-address-form">
    <o-base-address-form
      v-model="existingAddress"
      :is-form-fields-disabled="isSubmitting"
      @validation-state-change="onValidationStateChange"
    />

    <div class="_buttons-row">
      <SfButton class="color-secondary" @click="onCancelButtonClick" :disabled="isSubmitting">
        {{ $t('Cancel') }}
      </SfButton>

      <SfButton @click="onFormSubmit" :disabled="isSubmitButtonDisabled">
        {{ $t('Update Address') }}
      </SfButton>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TranslateResult } from 'vue-i18n';
import { SfButton } from '@storefront-ui/vue';
import i18n from '@vue-storefront/i18n';

import OBaseAddressForm from './o-base-address-form.vue';

export default Vue.extend({
  name: 'OEditAddressForm',
  components: {
    OBaseAddressForm,
    SfButton
  },
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      isSubmitting: false,
      isFormValid: false
    }
  },
  computed: {
    existingAddress: {
      get (): any {
        return this.value;
      },
      set (value: any) {
        this.$emit('input', value);
      }
    },
    isSubmitButtonDisabled (): boolean {
      return this.isSubmitting || !this.isFormValid;
    }
  },
  methods: {
    async onFormSubmit (): Promise<void> {
      if (this.isSubmitting || !this.isFormValid) {
        return;
      }

      this.isSubmitting = true;

      try {
        await this.updateAddress();

        this.$emit('address-update');
      } catch (error) {
        this.onFailure(this.$t('Unable to update address'));
      } finally {
        this.isSubmitting = false;
      }
    },
    onValidationStateChange (isValid: boolean) {
      this.isFormValid = isValid;
    },
    async updateAddress () {
      const addressToUpdate = {
        id: this.existingAddress.id,
        firstname: this.existingAddress.firstName,
        lastname: this.existingAddress.lastName,
        street: [this.existingAddress.streetAddress],
        city: this.existingAddress.city,
        region: this.existingAddress.state,
        postcode: this.existingAddress.zipCode,
        country_id: this.existingAddress.country,
        telephone: this.existingAddress.phoneNumber,
        default_shipping: this.existingAddress.defaultShipping,
        default_billing: this.existingAddress.defaultBilling
      }

      return this.$store.dispatch('budsies/updateAddress', { address: addressToUpdate });
    },
    onCancelButtonClick (): void {
      this.$emit('cancel');
    },
    onFailure (message: TranslateResult): void {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message,
        action1: { label: i18n.t('OK') }
      });
    }
  }
})
</script>

<style lang="scss" scoped>
.o-edit-address-form {
  ._buttons-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
