<template>
  <div class="addresses-list">
    <section class="_default-addresses">
      <SfHeading :title="$t('Default Addresses')" :level="3" class="_title" />

      <div class="_section-content">
        <section class="_shipping" v-if="defaultShippingAddress">
          <SfHeading :title="$t('Shipping')" :level="4" class="_subtitle" />

          <m-address-item
            :address="defaultShippingAddress"
            class="_default-address"
          >
            <template #actions>
              <router-link
                class="_action-item sf-button sf-button--text"
                :to="{
                  name: 'address-book-edit',
                  params: {
                    addressId: defaultShippingAddress.id
                  }
                }"
              >
                {{ $t('Edit') }}
              </router-link>

              <SfButton
                class="_action-item sf-button sf-button--text"
                v-if="!defaultShippingAddress.default_billing"
                @click="setAddressAsDefaultForBilling(defaultShippingAddress)"
              >
                {{ $t('Set as default Billing address') }}
              </SfButton>
            </template>
          </m-address-item>
        </section>

        <section class="_billing" v-if="defaultBillingAddress">
          <SfHeading :title="$t('Billing')" :level="4" class="_subtitle" />

          <m-address-item
            :address="defaultBillingAddress"
            class="_default-address"
          >
            <template #actions>
              <router-link
                class="_action-item sf-button sf-button--text"
                :to="{
                  name: 'address-book-edit',
                  params: {
                    addressId: defaultBillingAddress.id
                  }
                }"
              >
                {{ $t('Edit') }}
              </router-link>

              <SfButton
                class="_action-item sf-button sf-button--text"
                v-if="!defaultBillingAddress.default_shipping"
                @click="setAddressAsDefaultForShipping(defaultBillingAddress)"
              >
                {{ $t('Set as default Shipping address') }}
              </SfButton>
            </template>
          </m-address-item>
        </section>

        <span v-if="!defaultShippingAddress && !defaultBillingAddress">
          {{ $t('You have no default address entries in your address book.') }}
        </span>
      </div>
    </section>

    <section class="_additional-addresses">
      <SfHeading :title="$t('Additional Addresses')" :level="3" class="_title" />

      <div class="_section-content">
        <div
          v-if="!!additionalAddresses.length"
        >
          <m-address-item
            :address="address" v-for="(address) in additionalAddresses"
            :key="address.id"
          >
            <template #actions>
              <router-link
                class="_action-item sf-button sf-button--text"
                :to="{
                  name: 'address-book-edit',
                  params: {
                    addressId: address.id
                  }
                }"
              >
                {{ $t('Edit') }}
              </router-link>

              <SfButton
                class="_action-item sf-button--text"
                @click="removeAddress(address)"
              >
                {{ $t('Remove') }}
              </SfButton>

              <SfButton
                class="_action-item sf-button--text"
                @click="setAddressAsDefaultForBilling(address)"
              >
                {{ $t('Set as default Billing address') }}
              </SfButton>

              <SfButton
                class="_action-item sf-button--text"
                @click="setAddressAsDefaultForShipping(address)"
              >
                {{ $t('Set as default Shipping address') }}
              </SfButton>
            </template>
          </m-address-item>
        </div>

        <span v-else>
          {{ $t('You have no additional address entries in your address book.') }}
        </span>
      </div>
    </section>

    <div class="_button-row">
      <router-link
        :to="{name: 'address-book-add'}"
        class="sf-button--secondary sf-button"
      >
        {{ $t('Add new address') }}
      </router-link>
    </div>
  </div>
</template>

<script>
import { SfButton, SfHeading } from '@storefront-ui/vue';

import MAddressItem from 'theme/components/molecules/m-address-item.vue';

export default {
  name: 'AddressesList',
  components: {
    SfButton,
    SfHeading,
    MAddressItem
  },
  computed: {
    currentUser () {
      return this.$store.state.user.current;
    },
    defaultBillingAddress () {
      return this.$store.getters['user/defaultBillingAddress'];
    },
    defaultShippingAddress () {
      return this.$store.getters['user/defaultShippingAddress'];
    },
    addresses () {
      return this.currentUser?.addresses || [];
    },
    additionalAddresses () {
      return this.addresses.filter(
        (address) => !address.default_billing && !address.default_shipping
      );
    }
  },
  methods: {
    removeAddress (address) {
      this.$store.dispatch('budsies/removeAddress', { address: { id: address.id } });
    },
    setAddressAsDefaultForBilling (address) {
      this.$store.dispatch(
        'budsies/updateAddress',
        {
          address: {
            ...address,
            default_billing: true
          }
        }
      );
    },
    setAddressAsDefaultForShipping (address) {
      this.$store.dispatch(
        'budsies/updateAddress',
        {
          address: {
            ...address,
            default_shipping: true
          }
        }
      );
    }
  }
}
</script>

<style lang="scss" scoped>
.addresses-list {
  --heading-padding: 0;

  ._section-content {
    margin-top: var(--spacer-base);
  }

  ._default-address {
    border: none;
    padding: 0;
    margin-top: var(--spacer-sm);
  }

  ._billing {
    margin-top: var(--spacer-base);
  }

  ._button-row {
    display: flex;
    justify-content: flex-end;
    margin-top: var(--spacer-lg);
  }

  ._shipping {
    margin-top: var(--spacer-base);
  }

  ._additional-addresses {
    margin-top: var(--spacer-xl);
  }

  .sf-button--secondary {
    &:hover {
      color: var(--c-white);
    }
  }
}
</style>
