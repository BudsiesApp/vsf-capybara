<template>
  <div class="address-edit-page">
    <o-edit-address-form
      v-model="editedAddress"
      @address-update="onAddressUpdate"
      @cancel="onCancelEditing"
      v-if="editedAddress"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from '@vue/composition-api';

import OEditAddressForm from 'theme/components/organisms/o-edit-address-form.vue';

export default defineComponent({
  name: 'AddressEditPage',
  props: {
    addressId: {
      type: String,
      required: true
    }
  },
  components: {
    OEditAddressForm
  },
  setup (props, { root }) {
    const address = computed<any>(() => {
      const user = root.$store.state.user.current;
      const addresses = user?.addresses || [];

      return addresses.find(
        (address: any) => address.id.toString() === props.addressId.toString()
      );
    });

    const editedAddress = ref(null);

    function updateEditedAddress () {
      const _address = address.value;

      if (!_address) {
        editedAddress.value = null;
        return;
      }

      const street = `${_address.street[0]} ${_address.street[1] ? _address.street[1] : ''}`;

      editedAddress.value = {
        id: _address.id,
        firstName: _address.firstname,
        lastName: _address.lastname,
        streetAddress: street.trim(),
        zipCode: _address.postcode,
        city: _address.city,
        state: _address.region.region,
        regionId: _address.region.region_id,
        country: _address.country_id,
        phoneNumber: _address.telephone,
        defaultBilling: _address.default_billing,
        defaultShipping: _address.default_shipping,
        customerId: _address.customer_id,
        vatId: _address.vat_id
      }
    }

    const onAddressUpdate = () => {
      root.$router.push({
        name: 'address-book-list'
      });
    };

    const onCancelEditing = () => {
      root.$router.push({
        name: 'address-book-list'
      });
    };

    watch(
      address,
      (newAddress) => {
        if (newAddress) {
          updateEditedAddress();
        }
      },
      { immediate: true }
    );

    return {
      editedAddress,
      onAddressUpdate,
      onCancelEditing
    };
  }
});
</script>
