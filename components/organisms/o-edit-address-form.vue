<template>
  <div class="o-edit-address-form">
    <validation-observer ref="validationObserver" slim>
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
          ref="submitStepButton"
          @click="onFormSubmit"
          :disabled="isSubmitButtonDisabled"
        >
          {{ $t('Update Address') }}
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
import { defineComponent, computed, ref, Ref } from 'vue';
import { SfButton } from '@storefront-ui/vue';
import i18n from '@vue-storefront/i18n';
import {
  AdditionalContentEntry,
  AdditionalContentOutlet,
  useAdditionalContent
} from '@vue-storefront/core/additional-content';

import { useAddressValidation } from 'src/modules/address';

import { useFormValidation, getFieldAnchorName } from 'theme/helpers/use-form-validation';
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
  setup (props, context) {
    const privacyPolicyLinks = useAdditionalContent(
      AdditionalContentOutlet.PRIVACY_POLICY_LINKS
    );
    const validationObserver = ref(null);
    const baseAddressForm: Ref<InstanceType<typeof OBaseAddressForm> | null> = ref(null);
    const submitStepButton: Ref<null | InstanceType<typeof SfButton>> = ref(null);
    const isSubmitting = ref(false);

    const emit = context.emit;
    const applicationStore = useStore();
    const applicationI18n = useI18n();

    const {
      validateAddress,
      isValidating: isValidatingAddress,
      completeValidation: completeAddressValidation
    } = useAddressValidation();

    const { validateAndGoToFirstError } = useFormValidation(
      validationObserver,
      () => baseAddressForm.value?.getFormValidationRefs() || {}
    );

    const existingAddress = computed({
      get () {
        return props.value;
      },
      set (value: any) {
        emit('input', value);
      }
    });

    const isSubmitButtonDisabled = computed<boolean>(() => {
      return isSubmitting.value || isValidatingAddress.value
    });

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

    function onFailure (message: string): void {
      applicationStore.dispatch('notification/spawnNotification', {
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
        street: [existingAddress.value.streetAddress, existingAddress.value.apartmentNumber || ''],
        city: existingAddress.value.city,
        region: { region: existingAddress.value.state, region_id: existingAddress.value.region_id },
        postcode: existingAddress.value.zipCode,
        country_id: existingAddress.value.country,
        telephone: existingAddress.value.phoneNumber,
        default_shipping: existingAddress.value.defaultShipping,
        default_billing: existingAddress.value.defaultBilling,
        customer_id: existingAddress.value.customerId,
        vat_id: existingAddress.value.vat_id,
        extension_attributes: existingAddress.value.extension_attributes
      };

      return applicationStore.dispatch('budsies/updateAddress', { address: addressToUpdate });
    }

    async function onFormSubmit (): Promise<void> {
      if (isSubmitting.value) {
        return;
      }

      const isFormValid = await validateAndGoToFirstError();

      if (!isFormValid) {
        return;
      }

      const shouldProceed = await validateAddress(existingAddress);

      if (!shouldProceed) {
        focusSubmitStepButton();
        return;
      }

      completeAddressValidation();

      isSubmitting.value = true;

      try {
        await updateAddress();

        await applicationStore.dispatch('notification/spawnNotification', {
          type: 'success',
          message: applicationI18n.t('Address updated successfully') as string,
          action1: { label: i18n.t('OK') }
        });

        emit('address-update');
      } catch (error) {
        onFailure(applicationI18n.t('Unable to update address') as string);
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
