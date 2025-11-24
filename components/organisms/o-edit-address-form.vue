<template>
  <div class="o-edit-address-form">
    <validation-observer ref="validationObserver" slim tag="div">
      <o-base-address-form
        ref="baseAddressForm"
        v-model="existingAddress"
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
          {{ $t('Update Address') }}
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
import { defineComponent, computed, ref } from '@vue/composition-api';
import { SfButton } from '@storefront-ui/vue';
import i18n from '@vue-storefront/i18n';
import BaseAddressDetails from '@vue-storefront/core/modules/checkout/types/BaseAddressDetails';

import { useAddressValidation } from 'src/modules/address';

import { useFormValidation, getFieldAnchorName } from 'theme/helpers/use-form-validation';
import { mapCheckoutAddressToFormValue, mapFormValueToCheckoutAddress } from 'theme/helpers/checkout-address-mapper';
import OBaseAddressForm from './o-base-address-form.vue';

export default defineComponent({
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
  setup (props, { emit, root }) {
    const validationObserver = ref(null);
    const baseAddressForm = ref(null);
    const isSubmitting = ref(false);

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

    const existingAddress = computed({
      get () {
        return props.value;
      },
      set (value: any) {
        debugger;
        emit('input', value);
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

        const mapped = mapFormValueToCheckoutAddress(existingAddress.value, baseAddress);
        return mapped;
      },
      set: (validatedAddress: BaseAddressDetails) => {
        const mapped = mapCheckoutAddressToFormValue(validatedAddress);
        (mapped as any).id = existingAddress.value.id;
        (mapped as any).customerId = existingAddress.value.customerId;

        existingAddress.value = mapped;
      }
    });

    const isSubmitButtonDisabled = computed<boolean>(() => isSubmitting.value || isValidatingAddress.value);

    function onFailure (message: string): void {
      root.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message,
        action1: { label: i18n.t('OK') }
      });
    }

    async function updateAddress (): Promise<void> {
      const addressToUpdate = {
        id: existingAddress.value.id,
        firstname: existingAddress.value.firstName,
        lastname: existingAddress.value.lastName,
        street: [existingAddress.value.streetAddress],
        city: existingAddress.value.city,
        region: { region: existingAddress.value.state, region_id: existingAddress.value.regionId },
        postcode: existingAddress.value.zipCode,
        country_id: existingAddress.value.country,
        telephone: existingAddress.value.phoneNumber,
        default_shipping: existingAddress.value.defaultShipping,
        default_billing: existingAddress.value.defaultBilling,
        customer_id: existingAddress.value.customerId,
        vat_id: existingAddress.value.vatId
      };

      return root.$store.dispatch('budsies/updateAddress', { address: addressToUpdate });
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

      try {
        await updateAddress();

        emit('address-update');
      } catch (error) {
        onFailure(root.$t('Unable to update address') as string);
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
      existingAddress,
      isSubmitting,
      isSubmitButtonDisabled,
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
.o-edit-address-form {
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
