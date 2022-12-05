<template>
  <transition name="fade">
    <div class="o-my-account-address-book">
      <SfTabs
        key="address-list"
        :open-tab="1"
        class="tab-orphan"
        v-if="showAddressesList"
      >
        <SfTab :title="$t('Address Book')">
          <section class="_default-addresses">
            <SfHeading :title="$t('Default Addresses')" :level="3" class="_title" />

            <section class="_shipping" v-if="defaultShippingAddress">
              <SfHeading :title="$t('Shipping')" :level="4" class="_subtitle" />

              <m-address-item
                :address="defaultShippingAddress"
                class="_default-address"
              >
                <template #actions>
                  <SfButton
                    class="_action-item sf-button--text"
                    @click="changeAddress(defaultShippingAddress)"
                  >
                    {{ $t('Edit') }}
                  </SfButton>

                  <SfButton
                    class="_action-item sf-button--text"
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
                  <SfButton
                    class="_action-item sf-button--text"
                    @click="changeAddress(defaultBillingAddress)"
                  >
                    {{ $t('Edit') }}
                  </SfButton>

                  <SfButton
                    class="_action-item sf-button--text"
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
          </section>

          <section>
            <SfHeading :title="$t('Additional Addresses')" :level="3" class="_title" />

            <div
              class="shipping-list"
              v-if="!!additionalAddresses.length"
            >
              <m-address-item
                :address="address" v-for="(address) in additionalAddresses"
                :key="address.id"
              >
                <template #actions>
                  <SfButton
                    class="_action-item sf-button--text"
                    @click="changeAddress(address)"
                  >
                    {{ $t('Edit') }}
                  </SfButton>

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
          </section>

          <div class="_button-row">
            <SfButton @click="onAddAddressButtonClick" class="sf-button--secondary">
              {{ $t('Add new address') }}
            </SfButton>
          </div>
        </SfTab>
      </SfTabs>

      <SfTabs class="tab-orphan" v-if="showAddAddressForm">
        <SfTab :title="$t('Add New Address')">
          <o-add-address-form
            @address-added="onAddressAdded"
            @cancel="onCancel"
          />
        </SfTab>
      </SfTabs>

      <SfTabs class="tab-orphan" v-if="showEditAddressForm">
        <SfTab :title="$t('Edit Address')">
          <o-edit-address-form
            v-model="editedAddress"
            @address-update="onAddressUpdate"
            @cancel="onCancel"
          />
        </SfTab>
      </SfTabs>
    </div>
  </transition>
</template>

<script>
import { SfButton, SfHeading, SfTabs } from '@storefront-ui/vue';
import {
  mapMobileObserver,
  unMapMobileObserver
} from '@storefront-ui/vue/src/utilities/mobile-observer';

import OAddAddressForm from './o-add-address-form.vue';
import OEditAddressForm from './o-edit-address-form.vue';

import MAddressItem from 'theme/components/molecules/m-address-item.vue';

const Countries = require('@vue-storefront/i18n/resource/countries.json');

const State = {
  LIST: 'list',
  ADD: 'add',
  EDIT: 'edit'
}

export default {
  name: 'OMyAccountAddressBook',
  components: {
    OAddAddressForm,
    OEditAddressForm,
    SfButton,
    SfHeading,
    SfTabs,
    MAddressItem
  },
  data () {
    return {
      editedAddress: {
        firstName: '',
        lastName: '',
        streetAddress: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phoneNumber: ''
      },
      countries: Countries,
      state: State.LIST
    }
  },
  computed: {
    ...mapMobileObserver(),
    currentUser () {
      return this.$store.state.user.current;
    },
    defaultBillingAddress () {
      return this.addresses.find((address) => address.id === this.currentUser.default_billing);
    },
    defaultShippingAddress () {
      return this.addresses.find((address) => address.id === this.currentUser.default_shipping);
    },
    addresses () {
      return this.$store.state.user.current.addresses
    },
    additionalAddresses () {
      return this.addresses.filter(
        (address) => !address.default_billing && !address.default_shipping
      );
    },
    showAddressesList () {
      return this.state === State.LIST;
    },
    showAddAddressForm () {
      return this.state === State.ADD;
    },
    showEditAddressForm () {
      return this.state === State.EDIT;
    }
  },
  methods: {
    changeAddress (address) {
      const street = `${address.street[0]} ${address.street[1] ? address.street[1] : ''}`;

      this.editedAddress = {
        id: address.id,
        firstName: address.firstname,
        lastName: address.lastname,
        streetAddress: street.trim(),
        zipCode: address.postcode,
        city: address.city,
        state: address.region.region,
        country: address.country_id,
        phoneNumber: address.telephone
      };
      this.state = State.EDIT;
    },
    async onAddressUpdate () {
      this.state = State.LIST;
    },
    onCancel () {
      this.state = State.LIST;
    },
    removeAddress (address) {
      this.$store.dispatch('budsies/removeAddress', { address: { id: address.id } });
    },
    onAddressAdded () {
      this.state = State.LIST;
    },
    onAddAddressButtonClick () {
      this.state = State.ADD;
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
  },
  beforeDestroy () {
    unMapMobileObserver();
  }
}
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.shipping-list {
  margin: 0 0 var(--spacer-base) 0;
}

._default-addresses {
  margin-bottom: var(--spacer-xl);
}

._title {
  margin-bottom: var(--spacer-base);
}

.tab-orphan {
  @include for-mobile {
    --tabs-content-border-width: 0;
    --tabs-title-display: none;
    --tabs-content-padding: 0;
  }
}

._default-address {
  border: none;
}

._button-row {
  display: flex;
  justify-content: flex-end;
}

</style>
