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
                :aria-label="getAddressActionLabel($t('Edit'), defaultShippingAddress)"
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
                :aria-label="getAddressActionLabel($t('Set as default Billing address'), defaultShippingAddress)"
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
                :aria-label="getAddressActionLabel($t('Edit'), defaultBillingAddress)"
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
                :aria-label="getAddressActionLabel($t('Set as default Shipping address'), defaultBillingAddress)"
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
            ref="additionalAddressItems"
            ref-in-for
          >
            <template #actions>
              <router-link
                class="_action-item sf-button sf-button--text"
                :aria-label="getAddressActionLabel($t('Edit'), address)"
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
                :aria-label="getAddressActionLabel($t('Remove'), address)"
                @click="removeAddress(address)"
              >
                {{ $t('Remove') }}
              </SfButton>

              <SfButton
                class="_action-item sf-button--text"
                :aria-label="getAddressActionLabel($t('Set as default Billing address'), address)"
                @click="setAddressAsDefaultForBilling(address)"
              >
                {{ $t('Set as default Billing address') }}
              </SfButton>

              <SfButton
                class="_action-item sf-button--text"
                :aria-label="getAddressActionLabel($t('Set as default Shipping address'), address)"
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
        ref="addAddressButton"
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
    getAddressIdentifier (address) {
      const street = Array.isArray(address.street)
        ? address.street.filter(Boolean).join(' ')
        : address.street;

      return street || this.$t('Address').toString();
    },
    getAddressActionLabel (action, address) {
      return this.$t('{action}: {address}', {
        action,
        address: this.getAddressIdentifier(address)
      }).toString();
    },
    focusClosestAddressItem (removedAddressIndex) {
      const nextAddress = this.additionalAddresses[removedAddressIndex];
      const previousAddress = this.additionalAddresses[removedAddressIndex - 1];
      const addressToFocus = nextAddress || previousAddress;

      if (!addressToFocus) {
        this.$refs.addAddressButton.$el.focus();
        return;
      }

      const addressItems = this.$refs.additionalAddressItems || [];
      const addressItem = addressItems.find((item) => item.address.id === addressToFocus.id);

      addressItem?.focusFirstAction();
    },
    async removeAddress (address) {
      this.clearActionMessages();
      const removedAddressIndex = this.additionalAddresses.findIndex(
        (additionalAddress) => additionalAddress.id === address.id
      );
      const addressIdentifier = this.getAddressIdentifier(address);
      this.statusMessage = this.$t('Removing address {address}', {
        address: addressIdentifier
      }).toString();

      try {
        await this.$store.dispatch('budsies/removeAddress', { address: { id: address.id } });
        this.statusMessage = this.$t('Address {address} removed', {
          address: addressIdentifier
        }).toString();
        await this.$nextTick();
        this.focusClosestAddressItem(removedAddressIndex);
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
        this.statusMessage = this.$t('Address {address} set as default billing', {
          address: this.getAddressIdentifier(address)
        }).toString();
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
        this.statusMessage = this.$t('Address {address} set as default shipping', {
          address: this.getAddressIdentifier(address)
        }).toString();
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
