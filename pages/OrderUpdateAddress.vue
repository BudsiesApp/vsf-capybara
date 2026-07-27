<template>
  <div id="order-update-address">
    <div v-if="showNotFound" class="_not-found">
      <SfHeading :level="4" :title="$t('Order not found')" />

      <router-link
        :to="{ name: AccountPageName.ORDERS_HISTORY }"
        class="sf-button _order-history-link"
      >
        {{ $t('Go To Order History') }}
      </router-link>
    </div>

    <div v-else-if="isLoading" class="_loading">
      <div class="_heading-placeholder _placeholder" />

      <div class="_form-placeholder _placeholder" />
    </div>

    <div v-else class="_form-container">
      <SfHeading
        :title="$t('Update Shipping Address')"
        :level="1"
        class="_title"
      />

      <p
        v-if="showExistingValidationWarning"
        class="_existing-validation-warning"
      >
        {{ $t('Your shipping address failed validation.') }}
        <br>
        {{ $t('Please review and either fix the address or confirm it is correct.') }}
      </p>

      <validation-observer
        ref="validationObserver"
        tag="form"
        class="_form"
        @submit.native.prevent="onFormSubmit"
      >
        <o-base-address-form
          ref="baseAddressForm"
          v-model="addressFormModel"
          :is-form-fields-disabled="isFormDisabled"
          :is-country-field-disabled="true"
          :is-state-field-disabled="isStateFieldDisabled"
          :get-field-anchor-name="getFieldAnchorName"
        />

        <div v-if="shouldShowDefaultAddressCheckbox" class="_checkbox-container">
          <SfCheckbox
            v-model="shouldUpdateDefaultAddress"
            :label="$t('Update default shipping address')"
            :disabled="isSubmitting"
          />
        </div>

        <div class="_buttons-container">
          <SfButton
            v-if="shouldShowKeepCurrentAddressButton"
            type="button"
            :disabled="isFormDisabled"
            class="_use-entered-address-button sf-button--text"
            @click="useWithoutChanges"
          >
            {{ $t('Keep Current Address') }}
          </SfButton>

          <SfButton
            type="submit"
            :disabled="isFormDisabled"
            class="_submit-button"
          >
            {{ $t('Update Address') }}
          </SfButton>
        </div>
      </validation-observer>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, Ref, ComputedRef } from 'vue';
import { ValidationObserver } from 'vee-validate';
import { SfButton, SfCheckbox, SfHeading } from '@storefront-ui/vue';

import BaseAddressDetails from '@vue-storefront/core/modules/checkout/types/BaseAddressDetails';
import isAddressesEquals from '@vue-storefront/core/modules/checkout/helpers/is-addresses-equals.function';
import { AddressExtensionAttributes } from '@vue-storefront/core/modules/shared';
import i18n from '@vue-storefront/i18n';

import { useAddressValidation, useExistingValidationResult } from 'src/modules/address';
import {
  useOrderDetails,
  mapOrderAddressToBaseAddressDetails,
  isOrderAddressConfirmationSubmission,
  OrderAddress,
  Order,
  REQUEST_ORDER_SHIPPING_ADDRESS_UPDATE_ACTION,
  REQUEST_ORDER_SHIPPING_ADDRESS_CONFIRMATION_ACTION
} from 'src/modules/orders-history';
import { useRootInstance } from 'src/modules/shared';

import { useFormValidation, getFieldAnchorName } from 'theme/helpers/use-form-validation';
import OBaseAddressForm from 'theme/components/organisms/o-base-address-form.vue';

import { AccountPageName } from './page-name';

export default defineComponent({
  name: 'OrderUpdateAddress',
  components: {
    OBaseAddressForm,
    SfButton,
    SfCheckbox,
    SfHeading,
    ValidationObserver
  },
  props: {
    orderId: {
      type: String,
      required: true
    }
  },
  setup (props, context) {
    const root = useRootInstance();
    const validationObserver: Ref<InstanceType<typeof ValidationObserver> | null> = ref(null);
    const baseAddressForm: Ref<InstanceType<typeof OBaseAddressForm> | null> = ref(null);
    const wasFormSubmitted = ref(false);

    const { order, isLoading, isError: showNotFound } = useOrderDetails(props.orderId);
    const isSubmitting = ref(false);
    const addressFormModel: Ref<BaseAddressDetails> = ref({
      firstName: '',
      lastName: '',
      country: '',
      streetAddress: '',
      apartmentNumber: '',
      city: '',
      state: '',
      region_id: null,
      zipCode: '',
      phoneNumber: '',
      vat_id: ''
    });
    const shouldUpdateDefaultAddress = ref(false);

    const {
      validateAddress,
      handleValidationResult,
      isValidating: isValidatingAddress,
      completeValidation: completeAddressValidation
    } = useAddressValidation();

    const existingExtensionAttributes: ComputedRef<AddressExtensionAttributes | undefined> = computed(() => {
      return currentShippingAddress.value?.extension_attributes;
    });

    const {
      handleExistingValidationResult,
      validationResult: existingValidationResult
    } = useExistingValidationResult(
      existingExtensionAttributes,
      addressFormModel,
      handleValidationResult
    );

    const showExistingValidationWarning: ComputedRef<boolean> = computed(() => {
      if (wasFormSubmitted.value) {
        return false;
      }

      return existingValidationResult.value?.verdict === 'FIX' && !!existingExtensionAttributes.value?.validation_warnings;
    });

    const shouldShowKeepCurrentAddressButton = computed(() => {
      const verdict = existingValidationResult.value?.verdict;
      return verdict === 'FIX' || verdict === 'CONFIRM' || verdict === 'CONFIRM_ADD_SUBPREMISES';
    });

    const { validateAndGoToFirstError } = useFormValidation(
      validationObserver,
      () => {
        const baseAddressFormComponent = baseAddressForm.value;

        return {
          ...(baseAddressFormComponent?.$refs || {})
        };
      }
    );

    const isFormDisabled: ComputedRef<boolean> = computed(() => {
      return isSubmitting.value || isValidatingAddress.value;
    });

    const currentShippingAddress: ComputedRef<OrderAddress | undefined> = computed(() => {
      return order.value?.shipping_address;
    });

    const defaultShippingAddress = computed(() => {
      return root.$store.getters['user/defaultShippingAddress'];
    });

    function mapOrderAddressToFormModel (orderAddress: OrderAddress): BaseAddressDetails {
      return {
        ...mapOrderAddressToBaseAddressDetails(orderAddress),
        extension_attributes: orderAddress.extension_attributes
      };
    }

    function mapBaseAddressDetailsToOrderAddress (address: BaseAddressDetails): OrderAddress {
      const shippingAddress = currentShippingAddress.value;

      if (!shippingAddress) {
        throw new Error('Order shipping address is not available');
      }

      return {
        ...shippingAddress,
        firstname: address.firstName,
        lastname: address.lastName,
        country_id: address.country,
        street: [address.streetAddress, address.apartmentNumber],
        city: address.city,
        region: address.state || '',
        region_id: address.region_id || null,
        postcode: address.zipCode,
        telephone: address.phoneNumber || '',
        vat_id: address.vat_id || '',
        extension_attributes: address.extension_attributes
      }
    }

    function mapUserAddressToFormModel (address: any): BaseAddressDetails {
      return {
        firstName: address.firstname,
        lastName: address.lastname,
        streetAddress: address.street.join(', '),
        apartmentNumber: '',
        zipCode: address.postcode,
        city: address.city,
        state: address.region.region || '',
        region_id: address.region.region_id || null,
        country: address.country_id,
        phoneNumber: address.telephone || '',
        vat_id: address.vat_id || '',
        extension_attributes: address.extension_attributes
      }
    }

    const shouldShowDefaultAddressCheckbox: ComputedRef<boolean> = computed(() => {
      if (!defaultShippingAddress.value || !currentShippingAddress.value) {
        return false;
      }

      const mappedOrderAddress = mapOrderAddressToFormModel(currentShippingAddress.value);
      const mappedUserDefaultAddress = mapUserAddressToFormModel(defaultShippingAddress.value);

      try {
        return isAddressesEquals(
          mappedOrderAddress,
          mappedUserDefaultAddress
        );
      } catch (e) {
        return false;
      }
    });

    const isStateFieldDisabled: ComputedRef<boolean> = computed(() => {
      if (!currentShippingAddress.value) {
        return false;
      }

      return !!(currentShippingAddress.value.region || currentShippingAddress.value.region_id);
    });

    async function tryToHandleExistingValidationResult (): Promise<void> {
      const shouldProceed = await handleExistingValidationResult();

      if (shouldProceed) {
        return submitAddressByIntent(addressFormModel.value);
      }
    }

    function onFailure (message: string): void {
      root.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message,
        action1: { label: i18n.t('OK') }
      });
    }

    async function requestOrderShippingAddressUpdate (address: BaseAddressDetails): Promise<void> {
      const orderAddressPayload = mapBaseAddressDetailsToOrderAddress(address);

      await root.$store.dispatch(REQUEST_ORDER_SHIPPING_ADDRESS_UPDATE_ACTION, {
        address: orderAddressPayload
      });
    }

    async function requestOrderShippingAddressConfirmation (addressId: number): Promise<void> {
      await root.$store.dispatch(REQUEST_ORDER_SHIPPING_ADDRESS_CONFIRMATION_ACTION, {
        addressId
      });
    }

    async function updateDefaultShippingAddress (address: BaseAddressDetails): Promise<void> {
      const defaultAddress = defaultShippingAddress.value;

      if (!defaultAddress) {
        return;
      }

      const addressToUpdate = {
        id: defaultAddress.id,
        firstname: address.firstName,
        lastname: address.lastName,
        street: [address.streetAddress, address.apartmentNumber || ''],
        city: address.city,
        region: { region: address.state, region_id: address.region_id },
        postcode: address.zipCode,
        country_id: address.country,
        telephone: address.phoneNumber,
        default_shipping: defaultAddress.default_shipping,
        default_billing: defaultAddress.default_billing,
        customer_id: defaultAddress.customer_id,
        vat_id: address.vat_id,
        extension_attributes: address.extension_attributes
      };

      await root.$store.dispatch('budsies/updateAddress', { address: addressToUpdate });
    }

    async function updateAddress (address: BaseAddressDetails): Promise<void> {
      isSubmitting.value = true;

      try {
        await requestOrderShippingAddressUpdate(address);

        if (shouldUpdateDefaultAddress.value) {
          await updateDefaultShippingAddress(address);
        }

        root.$store.dispatch('notification/spawnNotification', {
          type: 'success',
          message: i18n.t('Shipping address updated successfully'),
          action1: { label: i18n.t('OK') }
        });

        root.$router.push({ name: AccountPageName.ORDERS_HISTORY });
      } catch (error) {
        onFailure(root.$t('Unable to update order shipping address') as string);
      } finally {
        isSubmitting.value = false;
      }
    }

    async function confirmCurrentAddress (): Promise<void> {
      const shippingAddress = currentShippingAddress.value;

      if (!shippingAddress) {
        return;
      }

      isSubmitting.value = true;

      try {
        await requestOrderShippingAddressConfirmation(shippingAddress.entity_id);
        goToOrderHistory();

        root.$store.dispatch('notification/spawnNotification', {
          type: 'success',
          message: i18n.t('Address confirmed successfully'),
          action1: { label: i18n.t('OK') }
        });
      } catch (error) {
        onFailure(root.$t('Unable to confirm address') as string);
      } finally {
        isSubmitting.value = false;
      }
    }

    async function submitAddressByIntent (address: BaseAddressDetails): Promise<void> {
      const shippingAddress = currentShippingAddress.value;

      if (!shippingAddress) {
        return;
      }

      if (isOrderAddressConfirmationSubmission(shippingAddress, address)) {
        await confirmCurrentAddress();
        return;
      }

      await updateAddress(address);
    }

    async function onFormSubmit (): Promise<void> {
      if (isSubmitting.value) {
        return;
      }

      const isFormValid = await validateAndGoToFirstError();

      if (!isFormValid) {
        return;
      }

      const shouldProceed = await validateAddress(addressFormModel);

      if (!shouldProceed) {
        return;
      }

      completeAddressValidation();

      await submitAddressByIntent(addressFormModel.value);
      wasFormSubmitted.value = true;
    }

    watch(
      order,
      (newOrder: Order | null) => {
        if (newOrder?.shipping_address) {
          addressFormModel.value = mapOrderAddressToFormModel(newOrder.shipping_address);
          tryToHandleExistingValidationResult();
        }
      },
      { immediate: true }
    );

    function goToOrderHistory (): void {
      root.$router.push({ name: AccountPageName.ORDERS_HISTORY });
    }

    async function useWithoutChanges (): Promise<void> {
      if (isSubmitting.value || !currentShippingAddress.value) {
        return;
      }

      await confirmCurrentAddress();
    }

    return {
      AccountPageName,
      validationObserver,
      baseAddressForm,
      isLoading,
      isStateFieldDisabled,
      isSubmitting,
      showNotFound,
      addressFormModel,
      shouldUpdateDefaultAddress,
      shouldShowDefaultAddressCheckbox,
      isFormDisabled,
      getFieldAnchorName,
      goToOrderHistory,
      onFormSubmit,
      showExistingValidationWarning,
      shouldShowKeepCurrentAddressButton,
      existingExtensionAttributes,
      useWithoutChanges
    };
  },
  metaInfo (): any {
    return {
      title: this.$t('Update Shipping Address')
    };
  }

});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "theme/css/mixins/form-placeholder-item.scss";

#order-update-address {
  box-sizing: border-box;

  ._title {
    --heading-padding: 0;
    --heading-margin: 0;

    padding: 0 var(--spacer-sm);
  }

  ._not-found {
    margin-top: var(--spacer-xl);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  ._existing-validation-warning {
    text-align: center;
    font-size: var(--font-size-base);
    color: var(--c-danger-variant);
  }

  ._form {
    margin-top: var(--spacer-xl);
  }

  ._order-history-link {
    margin-top: var(--spacer-base);

    &:hover {
      color: var(--c-white);
    }
  }

  ._placeholder {
    @include form-placeholder-item;
  }

  ._heading-placeholder,
  ._form-placeholder {
    margin: var(--spacer-lg) auto 0;
  }

  ._heading-placeholder {
    max-width: 46rem;
    height: 5rem;
  }

  ._form-placeholder {
    height: 40rem;
    max-width: 40rem;
  }

  ._form-container {
    padding: 0 var(--spacer-sm);
    max-width: 40rem;
    margin: 0 auto;

    ._title {
      margin-top: var(--spacer-lg);
    }

    ._checkbox-container {
      margin: var(--spacer-lg) 0;
    }
  }

  ._buttons-container {
    display: flex;
    flex-direction: column-reverse;
    row-gap: var(--spacer-sm);
    margin-top: var(--spacer-base);
  }

  ._use-entered-address-button,
  ._submit-button {
    width: 100%;
  }

  @media (min-width: $tablet-min) {
    max-width: 1272px;
    width: 100%;
    margin: auto;

    ._buttons-container {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      column-gap: var(--spacer-sm);
    }

    ._use-entered-address-button,
    ._submit-button {
      width: auto;
    }
  }
}
</style>
