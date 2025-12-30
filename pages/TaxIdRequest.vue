<template>
  <div id="tax-id-request">
    <div v-if="error" class="_not-found">
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
        :title="$t('Tax ID Required for Order #{orderNumber}', { orderNumber })"
        :level="1"
        class="_title"
      />

      <p class="_subtitle">
        {{ $t('To ensure your package clears customs without delay, the destination country requires your Tax ID for delivery.') }}
      </p>

      <validation-observer
        ref="validationObserver"
        v-slot="{ passes }"
        slim
      >
        <form @submit.prevent="passes(onSubmit)" class="_form">
          <template
            v-if="orderAddress"
          >
            <SfHeading
              :title="$t('Shipping Address')"
              :level="4"
              class="_address-title"
            />

            <address-card
              :address="orderAddress"
              class="_address"
            />
          </template>

          <validation-provider
            v-slot="{ errors }"
            rules="required|max:64"
            slim
            name="Tax ID"
          >
            <SfInput
              v-model="taxIdValue"
              class="_input _field"
              :label="$t('Tax ID')"
              :disabled="isSubmitting"
              :valid="!errors.length"
              :error-message="errors[0]"
            />
          </validation-provider>

          <div v-if="hasDefaultShippingAddress" class="_checkbox-container _field">
            <SfCheckbox
              v-model="shouldSaveToDefaultAddress"
              :label="$t('Save this Tax ID to my default shipping address')"
              :disabled="isSubmitting"
            />
          </div>

          <div class="_button-container">
            <SfButton
              type="submit"
              :disabled="isSubmitting"
              class="_submit-button"
            >
              {{ isSubmitting ? $t('Submitting...') : $t('Submit Tax ID') }}
            </SfButton>
          </div>
        </form>
      </validation-observer>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onBeforeMount } from '@vue/composition-api';
import { extend, ValidationProvider, ValidationObserver } from 'vee-validate';
import { required, max } from 'vee-validate/dist/rules';
import { SfButton, SfCheckbox, SfHeading, SfInput } from '@storefront-ui/vue';

import i18n from '@vue-storefront/i18n';
import BaseAddressDetails from '@vue-storefront/core/modules/checkout/types/BaseAddressDetails';

import { AddressCard } from 'src/modules/address';
import { usePersistedVatId } from 'src/modules/persisted-customer-data';
import {
  FETCH_ORDER_DETAILS_ACTION,
  SUBMIT_TAX_ID_UPDATE_REQUEST_ACTION,
  Order,
  mapOrderAddressToBaseAddressDetails
} from 'src/modules/orders-history';

extend('required', {
  ...required,
  message: 'Field is required'
});

extend('max', max);

export default defineComponent({
  name: 'TaxIdRequest',
  components: {
    AddressCard,
    SfButton,
    SfCheckbox,
    SfHeading,
    SfInput,
    ValidationProvider,
    ValidationObserver
  },
  props: {
    orderId: {
      type: String,
      required: true
    }
  },
  setup (props, { root }) {
    const taxIdValue = ref('');
    const shouldSaveToDefaultAddress = ref(false);
    const isLoading = ref(true);
    const isSubmitting = ref(false);
    const error = ref(false);
    const order = ref<Order | null>(null);

    const orderNumber = computed(() => {
      return ((order as any).value as (Order | null))?.increment_id || '';
    });

    const orderAddress = computed<BaseAddressDetails | undefined>(() => {
      const _order = (order as any).value as (Order | null);

      if (!_order) {
        return;
      }

      return mapOrderAddressToBaseAddressDetails(_order.shipping_address);
    });

    const defaultShippingAddress = computed(() => {
      return root.$store.getters['user/defaultShippingAddress'];
    });

    const hasDefaultShippingAddress = computed(() => {
      return !!defaultShippingAddress.value;
    });

    const { persistLastUsedCustomerVatId } = usePersistedVatId(taxIdValue);

    async function fetchOrderDetails () {
      try {
        const result = await root.$store.dispatch(
          FETCH_ORDER_DETAILS_ACTION,
          { orderId: props.orderId }
        );
        ((order as any).value as (Order | null)) = result;
        error.value = false;
      } catch (e) {
        error.value = true;
      } finally {
        isLoading.value = false;
      }
    }

    async function updateDefaultAddress () {
      if (!defaultShippingAddress.value) {
        return;
      }

      const addressToUpdate = {
        ...defaultShippingAddress.value,
        vat_id: taxIdValue.value
      };

      await root.$store.dispatch('budsies/updateAddress', { address: addressToUpdate });
    }

    async function onSubmit () {
      isSubmitting.value = true;

      try {
        await root.$store.dispatch(
          SUBMIT_TAX_ID_UPDATE_REQUEST_ACTION,
          { orderId: props.orderId, taxId: taxIdValue.value }
        );

        if (shouldSaveToDefaultAddress.value && hasDefaultShippingAddress.value) {
          await updateDefaultAddress();
        }

        persistLastUsedCustomerVatId(taxIdValue.value);

        root.$store.dispatch('notification/spawnNotification', {
          type: 'success',
          message: i18n.t('Tax ID saved successfully'),
          action1: { label: i18n.t('OK') }
        });

        root.$router.push({ name: 'orders-history' });
      } catch (e) {
        const errorMessage = (e as Error).message || String(i18n.t('Failed to submit Tax ID'));

        root.$store.dispatch('notification/spawnNotification', {
          type: 'danger',
          message: errorMessage,
          action1: { label: i18n.t('OK') }
        });
      } finally {
        isSubmitting.value = false;
      }
    }

    onBeforeMount(() => {
      fetchOrderDetails();
    });

    return {
      error,
      hasDefaultShippingAddress,
      isLoading,
      isSubmitting,
      orderAddress,
      orderNumber,
      onSubmit,
      shouldSaveToDefaultAddress,
      taxIdValue
    };
  },
  metaInfo (): any {
    return {
      title: this.$t('Tax Id Request')
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "theme/css/mixins/form-placeholder-item.scss";

#tax-id-request {
  box-sizing: border-box;

  ._title {
    --heading-padding: 0;

    margin-top: var(--spacer-lg);
    padding: 0 var(--spacer-sm);
  }

  ._not-found {
    margin-top: var(--spacer-xl);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
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
    height: 12rem;
    max-width: 32rem;
  }

  ._form-container {
    padding: 0 var(--spacer-sm);

    ._subtitle {
      text-align: center;
      font-size: var(--font-size--base);
      color: var(--c-text-muted);
    }

    ._form {
      max-width: 32rem;
      margin: var(--spacer-xl) auto 0;
    }
  }

  ._button-container {
    margin-top: var(--spacer-base);
  }

  ._submit-button {
    width: 100%;
  }

  ._address,
  ._field {
    margin-top: var(--spacer-sm);

    &:first-child {
      margin-top: 0;
    }
  }

  ._address-title {
    text-align: start;
  }

  @media (min-width: $tablet-min) {
    max-width: 1272px;
    width: 100%;
    margin: 0 auto;

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
