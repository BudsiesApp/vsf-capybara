<template>
  <div class="o-add-address-form">
    <validation-observer ref="validationObserver" slim tag="div">
      <o-base-address-form
        ref="baseAddressForm"
        v-model="address"
        :is-form-fields-disabled="isSubmitting"
        :get-field-anchor-name="getFieldAnchorName"
      />

      <div class="_buttons-row">
        <SfButton class="color-secondary" @click="onCancelButtonClick" :disabled="isSubmitting">
          {{ $t('Cancel') }}
        </SfButton>

        <SfButton
          @click="onFormSubmit"
          :disabled="isSubmitButtonDisabled"
        >
          {{ $t('Add Address') }}
        </SfButton>
      </div>

      <template v-if="$additionalContent.privacyPolicyAdditionalLinks">
        <component :is="linkComponent.component" :key="linkComponent.key" v-for="linkComponent in $additionalContent.privacyPolicyAdditionalLinks" />
      </template>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import { ValidationObserver } from 'vee-validate';
import { defineComponent, ref, computed } from '@vue/composition-api';
import { SfButton } from '@storefront-ui/vue';

import i18n from '@vue-storefront/i18n';
import BaseAddressDetails from '@vue-storefront/core/modules/checkout/types/BaseAddressDetails';

import { usePersistedFirstName, usePersistedLastName, usePersistedPhoneNumber } from 'src/modules/persisted-customer-data';
import { useAddressValidation } from 'src/modules/address';

import { BaseAddressFormValue } from 'theme/components/interfaces/base-address-form-value.interface';
import { useFormValidation, getFieldAnchorName } from 'theme/helpers/use-form-validation';
import { mapCheckoutAddressToFormValue, mapFormValueToCheckoutAddress } from 'theme/helpers/checkout-address-mapper';

import OBaseAddressForm from './o-base-address-form.vue';

type AddressData = Pick<
BaseAddressFormValue,
'city' | 'country' | 'state' | 'streetAddress' | 'zipCode' | 'regionId' | 'vatId'
>

export default defineComponent({
  name: 'OAddAddressForm',
  components: {
    SfButton,
    OBaseAddressForm,
    ValidationObserver
  },
  setup (props, { emit, root }) {
    const validationObserver = ref(null);
    const baseAddressForm = ref(null);

    const firstName = ref('');
    const lastName = ref('');
    const phoneNumber = ref('');
    const isSubmitting = ref(false);

    const addressData = ref<AddressData>({
      city: '',
      country: '',
      state: null,
      streetAddress: '',
      zipCode: '',
      regionId: null,
      vatId: ''
    });

    const {
      persistLastUsedCustomerFirstName,
      persistLastUsedCustomerLastName,
      persistLastUsedCustomerPhoneNumber
    } = {
      ...usePersistedFirstName(firstName),
      ...usePersistedLastName(lastName),
      ...usePersistedPhoneNumber(phoneNumber)
    };

    const {
      validateAddress,
      isValidating: isValidatingAddress,
      completeValidation: completeAddressValidation
    } = useAddressValidation({ root, emit, attrs: {}, slots: {} } as any);

    const { validateAndGoToFirstError } = useFormValidation(
      validationObserver,
      () => {
        const baseAddressFormComponent = baseAddressForm.value as any;

        return {
          ...root.$refs,
          ...(baseAddressFormComponent?.$refs || {})
        };
      }
    );

    const isSubmitButtonDisabled = computed(() => isSubmitting.value || isValidatingAddress.value);

    const address = computed<BaseAddressFormValue>({
      get () {
        const _addressData = addressData.value;

        return {
          city: _addressData.city,
          country: _addressData.country,
          state: _addressData.state,
          streetAddress: _addressData.streetAddress,
          zipCode: _addressData.zipCode,
          firstName: firstName.value,
          lastName: lastName.value,
          phoneNumber: phoneNumber.value,
          regionId: _addressData.regionId,
          vatId: _addressData.vatId
        }
      },
      set (newAddress: BaseAddressFormValue) {
        const _addressData = addressData.value;

        _addressData.city = newAddress.city;
        _addressData.country = newAddress.country;
        _addressData.state = newAddress.state;
        _addressData.streetAddress = newAddress.streetAddress;
        _addressData.zipCode = newAddress.zipCode;
        _addressData.regionId = newAddress.regionId;
        _addressData.vatId = newAddress.vatId;

        firstName.value = newAddress.firstName;
        lastName.value = newAddress.lastName;
        phoneNumber.value = newAddress.phoneNumber;
      }
    });

    const addressForValidation = computed<BaseAddressDetails>({
      get: () => {
        const baseAddress: BaseAddressDetails = {
          apartmentNumber: '',
          city: '',
          country: '',
          firstName: '',
          lastName: '',
          phoneNumber: '',
          state: '',
          region_id: null,
          streetAddress: '',
          zipCode: '',
          vat_id: ''
        };

        return mapFormValueToCheckoutAddress(address.value, baseAddress);
      },
      set: (validatedAddress: BaseAddressDetails) => {
        address.value = mapCheckoutAddressToFormValue(validatedAddress);
      }
    });

    function onFailure (message: string): void {
      root.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message,
        action1: { label: i18n.t('OK') }
      });
    }

    async function onFormSubmit (): Promise<void> {
      if (isSubmitting.value) {
        return;
      }

      const isFormValid = await validateAndGoToFirstError();

      if (!isFormValid) {
        return;
      }

      const shouldProceed = await validateAddress(addressForValidation);

      if (!shouldProceed) {
        return;
      }

      completeAddressValidation();

      isSubmitting.value = true;

      const addressToCreate = {
        firstname: address.value.firstName,
        lastname: address.value.lastName,
        street: [address.value.streetAddress],
        city: address.value.city,
        region: { region: address.value.state, region_id: address.value.regionId },
        postcode: address.value.zipCode,
        country_id: address.value.country,
        telephone: address.value.phoneNumber,
        default_shipping: false,
        vat_id: address.value.vatId
      };

      try {
        await root.$store.dispatch('budsies/createNewAddress', { address: addressToCreate });

        persistLastUsedCustomerFirstName(firstName.value);
        persistLastUsedCustomerLastName(lastName.value);
        persistLastUsedCustomerPhoneNumber(phoneNumber.value);

        emit('address-added');
      } catch (error) {
        onFailure(root.$t('Unable to add new address') as string);
      } finally {
        isSubmitting.value = false;
      }
    }

    function onCancelButtonClick (): void {
      emit('cancel');
    }

    return {
      validationObserver,
      baseAddressForm,
      firstName,
      lastName,
      phoneNumber,
      addressData,
      isSubmitting,
      isSubmitButtonDisabled,
      address,
      validateAddress,
      isValidatingAddress,
      completeAddressValidation,
      validateAndGoToFirstError,
      getFieldAnchorName,
      onFormSubmit,
      onCancelButtonClick
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
