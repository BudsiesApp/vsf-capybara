<template>
  <div class="address-add-page">
    <o-add-address-form
      @address-added="onAddressAdded"
      @cancel="onCancel"
    />
  </div>
</template>

<script lang="ts">
import { useRouter } from '@vue-storefront/core/application-services';
import { defineComponent } from 'vue';

import OAddAddressForm from 'theme/components/organisms/o-add-address-form.vue';

export default defineComponent({
  name: 'AddressAddPage',
  components: {
    OAddAddressForm
  },
  setup () {
    const applicationRouter = useRouter();
    const onAddressAdded = () => {
      applicationRouter.push({
        name: 'address-book-list'
      });
    };

    const onCancel = () => {
      applicationRouter.push({
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
