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

      <a class="truevault-polaris-privacy-notice" target="_blank" href="https://privacy.budsies.com/privacy-policy#california-privacy-notice" noreferrer noopener hidden>California Privacy Notice</a>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import { ValidationObserver } from 'vee-validate';
import { TranslateResult } from 'vue-i18n';
import { defineComponent, reactive, ref } from '@vue/composition-api';
import { SfButton } from '@storefront-ui/vue';

import i18n from '@vue-storefront/i18n';

import { usePersistedFirstName, usePersistedLastName, usePersistedPhoneNumber } from 'src/modules/persisted-customer-data';

import OBaseAddressForm from './o-base-address-form.vue';

interface Address {
  city: string,
  country: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  state: string,
  streetAddress: string,
  zipCode: string
}

export default defineComponent({
  name: 'OAddAddressForm',
  components: {
    SfButton,
    OBaseAddressForm,
    ValidationObserver
  },
  setup () {
    const firstName = ref('');
    const lastName = ref('');
    const phoneNumber = ref('');

    const addressData = ref({
      city: '',
      country: '',
      state: '',
      streetAddress: '',
      zipCode: ''
    });

    return {
      firstName,
      lastName,
      addressData,
      phoneNumber,
      ...usePersistedFirstName(firstName),
      ...usePersistedLastName(lastName),
      ...usePersistedPhoneNumber(phoneNumber)
    }
  },
  data () {
    return {
      isSubmitting: false
    }
  },
  computed: {
    isSubmitButtonDisabled (): boolean {
      return this.isSubmitting;
    },
    address: {
      get (): Address {
        return {
          city: this.addressData.city,
          country: this.addressData.country,
          state: this.addressData.state,
          streetAddress: this.addressData.streetAddress,
          zipCode: this.addressData.zipCode,
          firstName: this.firstName,
          lastName: this.lastName,
          phoneNumber: this.phoneNumber
        }
      },
      set (address: Address) {
        this.addressData = {
          city: address.city,
          country: address.country,
          state: address.state,
          streetAddress: address.streetAddress,
          zipCode: address.zipCode
        }
        this.firstName = address.firstName;
        this.lastName = address.lastName;
        this.phoneNumber = address.phoneNumber;
      }
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

        this.persistLastUsedCustomerFirstName(this.firstName);
        this.persistLastUsedCustomerLastName(this.lastName);
        this.persistLastUsedCustomerPhoneNumber(this.phoneNumber);

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

  .truevault-polaris-privacy-notice {
    margin-top: var(--spacer-sm);
    display: inline-block;
    width: 100%;
    text-align: end;
  }
}
</style>
