<template>
  <div class="o-edit-address-form">
    <validation-observer slim v-slot="{passes}">
      <o-base-address-form
        v-model="existingAddress"
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
          {{ $t('Update Address') }}
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
  name: 'OEditAddressForm',
  components: {
    OBaseAddressForm,
    SfButton,
    ValidationObserver
  },
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      isSubmitting: false
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
      return this.isSubmitting;
    }
  },
  methods: {
    async onFormSubmit (): Promise<void> {
      if (this.isSubmitting) {
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
    async updateAddress () {
      const addressToUpdate = {
        id: this.existingAddress.id,
        firstname: this.existingAddress.firstName,
        lastname: this.existingAddress.lastName,
        street: [this.existingAddress.streetAddress],
        city: this.existingAddress.city,
        region: { region: this.existingAddress.state, region_id: this.existingAddress.regionId },
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
