<template>
  <div class="o-edit-address-form">
    <validation-observer slim v-slot="{passes}">
      <o-base-address-form
        v-model="existingAddress"
        :is-form-fields-disabled="isSubmitting"
        :get-field-anchor-name="getFieldAnchorName"
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

import { getFieldAnchorName } from 'theme/helpers/use-form-validation';
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
    const isSubmitting = ref(false);

    const existingAddress = computed({
      get () {
        return props.value;
      },
      set (value: any) {
        emit('input', value);
      }
    });

    const isSubmitButtonDisabled = computed<boolean>(() => isSubmitting.value);

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
      existingAddress,
      isSubmitting,
      isSubmitButtonDisabled,
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
