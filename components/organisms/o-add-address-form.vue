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

      <california-privacy-notice-link />
    </validation-observer>
  </div>
</template>

<script lang="ts">
import { ValidationObserver } from 'vee-validate';
import { TranslateResult } from 'vue-i18n';
import { defineComponent, ref } from '@vue/composition-api';
import { SfButton } from '@storefront-ui/vue';

import i18n from '@vue-storefront/i18n';

import { usePersistedFirstName, usePersistedLastName, usePersistedPhoneNumber } from 'src/modules/persisted-customer-data';
import { CaliforniaPrivacyNoticeLink } from 'src/modules/true-vault';

import { BaseAddressFormValue } from 'theme/components/interfaces/base-address-form-value.interface';

import OBaseAddressForm from './o-base-address-form.vue';

type AddressData = Pick<
BaseAddressFormValue,
'city' | 'country' | 'state' | 'streetAddress' | 'zipCode' | 'regionId'
>

export default defineComponent({
  name: 'OAddAddressForm',
  components: {
    CaliforniaPrivacyNoticeLink,
    SfButton,
    OBaseAddressForm,
    ValidationObserver
  },
  setup () {
    const firstName = ref('');
    const lastName = ref('');
    const phoneNumber = ref('');

    const addressData = ref<AddressData>({
      city: '',
      country: '',
      state: null,
      streetAddress: '',
      zipCode: '',
      regionId: null
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
      get (): BaseAddressFormValue {
        return {
          city: this.addressData.city,
          country: this.addressData.country,
          state: this.addressData.state,
          streetAddress: this.addressData.streetAddress,
          zipCode: this.addressData.zipCode,
          firstName: this.firstName,
          lastName: this.lastName,
          phoneNumber: this.phoneNumber,
          regionId: this.addressData.regionId
        }
      },
      set (address: BaseAddressFormValue) {
        this.addressData = {
          city: address.city,
          country: address.country,
          state: address.state,
          streetAddress: address.streetAddress,
          zipCode: address.zipCode,
          regionId: address.regionId
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
        region: { region: this.address.state, region_id: this.address.regionId },
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

  .california-privacy-notice-link {
    --privacy-notice-link-width: 100%;
    --privacy-notice-link-text-align: end;
  }
}
</style>
