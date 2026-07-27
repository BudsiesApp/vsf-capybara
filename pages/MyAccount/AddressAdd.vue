<template>
  <div class="address-add-page">
    <o-add-address-form
      @address-added="onAddressAdded"
      @cancel="onCancel"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRootInstance } from 'src/modules/shared';

import OAddAddressForm from 'theme/components/organisms/o-add-address-form.vue';

export default defineComponent({
  name: 'AddressAddPage',
  components: {
    OAddAddressForm
  },
  setup () {
    const root = useRootInstance();
    const onAddressAdded = () => {
      root.$router.push({
        name: 'address-book-list'
      });
    };

    const onCancel = () => {
      root.$router.push({
        name: 'address-book-list'
      });
    };

    return {
      onAddressAdded,
      onCancel
    };
  }
});
</script>
