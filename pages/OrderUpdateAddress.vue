<template>
  <div id="order-update-address">
    <div v-if="showNotFound" class="_not-found">
      <SfHeading :level="4" :title="$t('Order not found')" />

      <router-link
        :to="{ name: 'orders-history' }"
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
        :title="$t('Update shipping address')"
        :level="1"
        class="_title"
      />

      <p
        class="_existing-validation-warning"
        v-if="showExistingValidationWarning"
      >
        {{ $t('Shipping address could not be validated. Please review and correct it.') }}
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
          :is-form-fields-disabled="isSubmitting"
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

        <div class="_button-container">
          <SfButton
            type="submit"
            :disabled="isSubmitButtonDisabled"
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
import { defineComponent, ref, watch, computed } from '@vue/composition-api';
import { ValidationObserver } from 'vee-validate';
import { SfButton, SfCheckbox, SfHeading } from '@storefront-ui/vue';

import BaseAddressDetails from '@vue-storefront/core/modules/checkout/types/BaseAddressDetails';
import isAddressesEquals from '@vue-storefront/core/modules/checkout/helpers/is-addresses-equals.function';
import { AddressExtensionAttributes, getRegionNameByCountryAndRegionId } from '@vue-storefront/core/modules/shared';
import i18n from '@vue-storefront/i18n';

import { useAddressValidation, useExistingValidationResult } from 'src/modules/address';
import { useOrderHistoryOrder, SUBMIT_ORDER_ADDRESS_UPDATE_REQUEST_ACTION } from 'src/modules/orders-history';
import { OrderAddress } from 'src/modules/orders-history/types/order-address';

import { useFormValidation, getFieldAnchorName } from 'theme/helpers/use-form-validation';
import OBaseAddressForm from 'theme/components/organisms/o-base-address-form.vue';
import { Order } from 'src/modules/orders-history/types/order';

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
    const root = context.root;
    const validationObserver = ref(null);
    const baseAddressForm = ref(null);
    const wasFormSubmitted = ref(false);

    const { order, isLoading, isError: showNotFound } = useOrderHistoryOrder(context, props.orderId);
    const isSubmitting = ref(false);
    const addressFormModel = ref<BaseAddressDetails>({
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
    } = useAddressValidation(context);

    const existingExtensionAttributes = computed<AddressExtensionAttributes | undefined>(() => {
      const _order = (order as any)?.value as Order | undefined;
      return _order?.shipping_address?.extension_attributes;
    });

    const {
      handleExistingValidationResult,
      validationResult: existingValidationResult
    } = useExistingValidationResult(
      existingExtensionAttributes,
      addressFormModel,
      handleValidationResult
    );

    const showExistingValidationWarning = computed<boolean>(() => {
      if (wasFormSubmitted.value) {
        return false;
      }

      return existingValidationResult.value?.verdict === 'FIX' && !!existingExtensionAttributes.value?.validation_warnings;
    });

    const { validateAndGoToFirstError } = useFormValidation(
      validationObserver,
      () => {
        const baseAddressFormComponent = baseAddressForm.value as any;

        return {
          ...(baseAddressFormComponent?.$refs || {})
        };
      }
    );

    const isSubmitButtonDisabled = computed<boolean>(() => {
      return isSubmitting.value || isValidatingAddress.value;
    });

    const defaultShippingAddress = computed(() => {
      return root.$store.getters['user/defaultShippingAddress'];
    });

    function mapOrderAddressToFormModel (orderAddress: OrderAddress): BaseAddressDetails {
      return {
        firstName: orderAddress.firstname,
        lastName: orderAddress.lastname,
        country: orderAddress.country_id,
        streetAddress: orderAddress.street.join(', '),
        apartmentNumber: '',
        city: orderAddress.city,
        state: orderAddress.region || '',
        region_id: orderAddress.region_id || null,
        zipCode: orderAddress.postcode,
        phoneNumber: orderAddress.telephone || '',
        vat_id: orderAddress.vat_id || '',
        extension_attributes: orderAddress.extension_attributes
      };
    }

    function mapBaseAddressDetailsToOrderAddress (address: BaseAddressDetails): OrderAddress {
      // TODO: temporary since API shipping-information resource in cart handle the region differently and it's lead to address hash mismatch
      const region = address.region_id
        ? getRegionNameByCountryAndRegionId(address.country, address.region_id)
        : address.state;

      return {
        ...((order as any).value as Order).shipping_address,
        firstname: address.firstName,
        lastname: address.lastName,
        country_id: address.country,
        street: [address.streetAddress, address.apartmentNumber],
        city: address.city,
        region: region,
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

    const shouldShowDefaultAddressCheckbox = computed<boolean>(() => {
      if (!defaultShippingAddress.value || !(order as any).value.shipping_address) {
        return false;
      }

      const mappedOrderAddress = mapOrderAddressToFormModel((order as any).value.shipping_address);
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

    const isStateFieldDisabled = computed<boolean>(() => {
      const _order = (order as any)?.value as Order | undefined;

      if (!_order?.shipping_address) {
        return false;
      }

      return !!(_order.shipping_address.region || _order.shipping_address.region_id);
    });

    async function tryToHandleExistingValidationResult (): Promise<void> {
      const shouldProceed = await handleExistingValidationResult();

      if (shouldProceed) {
        return updateAddress();
      }
    }

    function onFailure (message: string): void {
      root.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message,
        action1: { label: i18n.t('OK') }
      });
    }

    async function submitOrderAddressUpdateRequest (): Promise<void> {
      const orderAddressPayload = mapBaseAddressDetailsToOrderAddress((addressFormModel as any).value);

      await root.$store.dispatch(SUBMIT_ORDER_ADDRESS_UPDATE_REQUEST_ACTION, {
        orderId: props.orderId,
        address: orderAddressPayload
      });
    }

    async function updateDefaultShippingAddress (): Promise<void> {
      const defaultAddress = defaultShippingAddress.value;

      if (!defaultAddress) {
        return;
      }

      const _addressFormModel = (addressFormModel as any).value as BaseAddressDetails;

      const addressToUpdate = {
        id: defaultAddress.id,
        firstname: _addressFormModel.firstName,
        lastname: _addressFormModel.lastName,
        street: [_addressFormModel.streetAddress, _addressFormModel.apartmentNumber || ''],
        city: _addressFormModel.city,
        region: { region: _addressFormModel.state, region_id: _addressFormModel.region_id },
        postcode: _addressFormModel.zipCode,
        country_id: _addressFormModel.country,
        telephone: _addressFormModel.phoneNumber,
        default_shipping: defaultAddress.default_shipping,
        default_billing: defaultAddress.default_billing,
        customer_id: defaultAddress.customer_id,
        vat_id: _addressFormModel.vat_id,
        extension_attributes: _addressFormModel.extension_attributes
      };

      await root.$store.dispatch('budsies/updateAddress', { address: addressToUpdate });
    }

    async function updateAddress (): Promise<void> {
      isSubmitting.value = true;

      try {
        await submitOrderAddressUpdateRequest();

        if (shouldUpdateDefaultAddress.value) {
          await updateDefaultShippingAddress();
        }

        root.$router.push({ name: 'orders-history' });
      } catch (error) {
        onFailure(root.$t('Unable to update order shipping address') as string);
      } finally {
        isSubmitting.value = false;
      }
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

      await updateAddress();
      wasFormSubmitted.value = true;
    }

    watch(
      order,
      (newOrder: Order) => {
        if (newOrder?.shipping_address) {
          ((addressFormModel as any).value as BaseAddressDetails) = mapOrderAddressToFormModel(newOrder.shipping_address);
          tryToHandleExistingValidationResult();
        }
      },
      { immediate: true }
    );

    return {
      validationObserver,
      baseAddressForm,
      isLoading,
      isStateFieldDisabled,
      isSubmitting,
      showNotFound,
      addressFormModel,
      shouldUpdateDefaultAddress,
      shouldShowDefaultAddressCheckbox,
      isSubmitButtonDisabled,
      getFieldAnchorName,
      onFormSubmit,
      showExistingValidationWarning,
      existingExtensionAttributes
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
    color: var(--c-text-muted);
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

    ._button-container {
      display: flex;
      justify-content: flex-end;
      margin-top: var(--spacer-base);
    }
  }

  @media (min-width: $tablet-min) {
    max-width: 1272px;
    width: 100%;
    margin: auto;

    ._button-container {
      display: flex;
      justify-content: flex-end;
    }

    ._submit-button {
      width: auto;
    }
  }
}
</style>
