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

      <validation-observer ref="validationObserver" slim>
        <o-base-address-form
          ref="baseAddressForm"
          v-model="addressFormModel"
          :is-form-fields-disabled="isSubmitting"
          :is-country-field-disabled="true"
          :is-state-field-disabled="true"
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
            @click="onFormSubmit"
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
import { defineComponent, ref, computed, watch } from '@vue/composition-api';
import { ValidationObserver } from 'vee-validate';
import { SfButton, SfCheckbox, SfHeading } from '@storefront-ui/vue';

import BaseAddressDetails from '@vue-storefront/core/modules/checkout/types/BaseAddressDetails';
import isAddressesEquals from '@vue-storefront/core/modules/checkout/helpers/is-addresses-equals.function';
import i18n from '@vue-storefront/i18n';

import { useAddressValidation } from 'src/modules/address';
import { useOrderHistoryOrder } from 'src/modules/orders-history';
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
      isValidating: isValidatingAddress,
      completeValidation: completeAddressValidation
    } = useAddressValidation(context);

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
        vat_id: orderAddress.vat_id || ''
      };
    }

    function mapBaseAddressDetailsToOrderAddress (address: BaseAddressDetails): OrderAddress {
      return {
        ...order.value.shippingAddress,
        firstname: address.firstName,
        lastname: address.lastName,
        country_id: address.country,
        street: [address.streetAddress, address.apartmentNumber],
        city: address.city,
        region: address.state || '',
        region_id: address.region_id || null,
        postcode: address.zipCode,
        telephone: address.phoneNumber || '',
        vat_id: address.vat_id || ''
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
        vat_id: address.vat_id || ''
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

    watch(
      order,
      (newOrder: Order) => {
        if (newOrder?.shipping_address) {
          ((addressFormModel as any).value as BaseAddressDetails) = mapOrderAddressToFormModel(newOrder.shipping_address);
        }
      },
      { immediate: true }
    );

    function onFailure (message: string): void {
      root.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message,
        action1: { label: i18n.t('OK') }
      });
    }

    async function submitOrderAddressUpdateRequest (): Promise<void> {

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
        vat_id: _addressFormModel.vat_id
      };

      await root.$store.dispatch('budsies/updateAddress', { address: addressToUpdate });
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

    return {
      validationObserver,
      baseAddressForm,
      isLoading,
      isSubmitting,
      showNotFound,
      addressFormModel,
      shouldUpdateDefaultAddress,
      shouldShowDefaultAddressCheckbox,
      isSubmitButtonDisabled,
      getFieldAnchorName,
      onFormSubmit
    };
  }
});
</script>

<style lang="scss" scoped>
#order-update-address {
  ._not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacer-xl);
    padding: var(--spacer-xl) 0;

    ._order-history-link {
      text-decoration: none;
    }
  }

  ._loading {
    ._placeholder {
      background: var(--c-light);
      border-radius: var(--border-radius);
      animation: pulse 1.5s ease-in-out infinite;
    }

    ._heading-placeholder {
      height: 40px;
      width: 300px;
      margin-bottom: var(--spacer-xl);
    }

    ._form-placeholder {
      height: 400px;
      width: 100%;
    }
  }

  ._form-container {
    ._title {
      margin-bottom: var(--spacer-lg);
    }

    ._checkbox-container {
      margin: var(--spacer-lg) 0;
    }

    ._button-container {
      display: flex;
      justify-content: flex-end;
      margin-top: var(--spacer-lg);
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
