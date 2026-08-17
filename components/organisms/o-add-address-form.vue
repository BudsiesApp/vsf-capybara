<template>
  <div class="o-add-address-form">
    <validation-observer ref="validationObserver" slim>
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
          ref="submitStepButton"
          @click="onFormSubmit"
          :disabled="isSubmitButtonDisabled"
        >
          {{ $t('Add Address') }}
        </SfButton>
      </div>

      <template v-if="privacyPolicyLinks.length">
        <component :is="linkComponent.component" :key="linkComponent.key" v-for="linkComponent in privacyPolicyLinks" />
      </template>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import { useI18n, useStore } from '@vue-storefront/core/application-services';
import { ValidationObserver } from 'vee-validate';
import { defineComponent, ref, computed, Ref } from 'vue';
import { SfButton } from '@storefront-ui/vue';

import i18n from '@vue-storefront/i18n';
import BaseAddressDetails from '@vue-storefront/core/modules/checkout/types/BaseAddressDetails';
import {
  AdditionalContentEntry,
  AdditionalContentOutlet,
  useAdditionalContent
} from '@vue-storefront/core/additional-content';

import { usePersistedFirstName, usePersistedLastName, usePersistedPhoneNumber, usePersistedVatId } from 'src/modules/persisted-customer-data';
import { useAddressValidation } from 'src/modules/address';

import { useFormValidation, getFieldAnchorName } from 'theme/helpers/use-form-validation';

import OBaseAddressForm from './o-base-address-form.vue';

type AddressData = Pick<
BaseAddressDetails,
'city' | 'country' | 'state' | 'streetAddress' | 'apartmentNumber' | 'zipCode' | 'region_id'
>

export default defineComponent({
  name: 'OAddAddressForm',
  components: {
    SfButton,
    OBaseAddressForm,
    ValidationObserver
  },
  setup (props, { emit }) {
    const privacyPolicyLinks = useAdditionalContent(
      AdditionalContentOutlet.PRIVACY_POLICY_LINKS
    );
    const applicationStore = useStore();
    const applicationI18n = useI18n();
    const validationObserver = ref(null);
    const baseAddressForm: Ref<InstanceType<typeof OBaseAddressForm> | null> = ref(null);
    const submitStepButton: Ref<null | InstanceType<typeof SfButton>> = ref(null);

    const firstName = ref('');
    const lastName = ref('');
    const phoneNumber = ref('');
    const vatId = ref('');
    const isSubmitting = ref(false);

    const addressData = ref<AddressData>({
      city: '',
      country: '',
      state: '',
      streetAddress: '',
      apartmentNumber: '',
      zipCode: '',
      region_id: null
    });

    const {
      persistLastUsedCustomerFirstName,
      persistLastUsedCustomerLastName,
      persistLastUsedCustomerPhoneNumber,
      persistLastUsedCustomerVatId
    } = {
      ...usePersistedFirstName(firstName),
      ...usePersistedLastName(lastName),
      ...usePersistedPhoneNumber(phoneNumber),
      ...usePersistedVatId(vatId)
    };

    const {
      validateAddress,
      isValidating: isValidatingAddress,
      completeValidation: completeAddressValidation
    } = useAddressValidation();

    const { validateAndGoToFirstError } = useFormValidation(
      validationObserver,
      () => baseAddressForm.value?.getFormValidationRefs() || {}
    );

    const isSubmitButtonDisabled = computed(() => isSubmitting.value || isValidatingAddress.value);

    function focusSubmitStepButton (): void {
      if (!submitStepButton.value) {
        return;
      }

      const submitStepButtonElement = submitStepButton.value.$el;

      if (!(submitStepButtonElement instanceof HTMLElement)) {
        return;
      }

      submitStepButtonElement.focus();
    }

    const address = computed<BaseAddressDetails>({
      get () {
        const _addressData = (addressData as any).value as BaseAddressDetails;

        return {
          city: _addressData.city,
          country: _addressData.country,
          state: _addressData.state,
          streetAddress: _addressData.streetAddress,
          apartmentNumber: _addressData.apartmentNumber,
          zipCode: _addressData.zipCode,
          firstName: firstName.value,
          lastName: lastName.value,
          phoneNumber: phoneNumber.value,
          region_id: _addressData.region_id,
          vat_id: vatId.value
        }
      },
      set (newAddress: BaseAddressDetails) {
        const _addressData = (addressData as any).value as BaseAddressDetails;

        _addressData.city = newAddress.city;
        _addressData.country = newAddress.country;
        _addressData.state = newAddress.state;
        _addressData.streetAddress = newAddress.streetAddress;
        _addressData.apartmentNumber = newAddress.apartmentNumber;
        _addressData.zipCode = newAddress.zipCode;
        _addressData.region_id = newAddress.region_id;

        firstName.value = newAddress.firstName;
        lastName.value = newAddress.lastName;
        phoneNumber.value = newAddress.phoneNumber;
        vatId.value = newAddress.vat_id;
      }
    });

    function onFailure (message: string): void {
      applicationStore.dispatch('notification/spawnNotification', {
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

      const shouldProceed = await validateAddress(address);

      if (!shouldProceed) {
        focusSubmitStepButton();
        return;
      }

      completeAddressValidation();

      isSubmitting.value = true;

      const addressToCreate = {
        firstname: address.value.firstName,
        lastname: address.value.lastName,
        street: [address.value.streetAddress, address.value.apartmentNumber],
        city: address.value.city,
        region: { region: address.value.state, region_id: address.value.region_id },
        postcode: address.value.zipCode,
        country_id: address.value.country,
        telephone: address.value.phoneNumber,
        default_shipping: false,
        vat_id: address.value.vat_id,
        extension_attributes: address.value.extension_attributes
      };

      try {
        await applicationStore.dispatch('budsies/createNewAddress', { address: addressToCreate });

        persistLastUsedCustomerFirstName(firstName.value);
        persistLastUsedCustomerLastName(lastName.value);
        persistLastUsedCustomerPhoneNumber(phoneNumber.value);
        persistLastUsedCustomerVatId(vatId.value);

        await applicationStore.dispatch('notification/spawnNotification', {
          type: 'success',
          message: applicationI18n.t('Address added successfully') as string,
          action1: { label: i18n.t('OK') }
        });

        emit('address-added');
      } catch (error) {
        onFailure(applicationI18n.t('Unable to add new address') as string);
      } finally {
        isSubmitting.value = false;
      }
    }

    function onCancelButtonClick (): void {
      emit('cancel');
    }

    return {
      privacyPolicyLinks: privacyPolicyLinks as unknown as
        readonly AdditionalContentEntry[],
      validationObserver,
      baseAddressForm,
      submitStepButton,
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
