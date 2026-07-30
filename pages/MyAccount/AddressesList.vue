<template>
  <div class="addresses-list">
    <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ statusMessage }}
    </p>

    <p class="sr-only" role="alert" aria-atomic="true">
      {{ actionError }}
    </p>
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
  data () {
    return {
      actionError: '',
      statusMessage: ''
    };
  },
  methods: {
    clearActionMessages () {
      this.actionError = '';
      this.statusMessage = '';
    },
    showActionError (error) {
      this.actionError = error instanceof Error && error.message
        ? error.message
        : this.$t('Unable to update address').toString();
    },
    async removeAddress (address) {
      this.clearActionMessages();

      try {
        await this.$store.dispatch('budsies/removeAddress', { address: { id: address.id } });
        this.statusMessage = this.$t('Address removed').toString();
      } catch (error) {
        this.showActionError(error);
      }
    },
    async setAddressAsDefaultForBilling (address) {
      this.clearActionMessages();

      try {
        await this.$store.dispatch('budsies/updateAddress', {
          address: {
            ...address,
            default_billing: true
          }
        });
        this.statusMessage = this.$t('Address set as default billing').toString();
      } catch (error) {
        this.showActionError(error);
      }
    },
    async setAddressAsDefaultForShipping (address) {
      this.clearActionMessages();

      try {
        await this.$store.dispatch('budsies/updateAddress', {
          address: {
            ...address,
            default_shipping: true
          }
        });
        this.statusMessage = this.$t('Address set as default shipping').toString();
      } catch (error) {
        this.showActionError(error);
      }
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
