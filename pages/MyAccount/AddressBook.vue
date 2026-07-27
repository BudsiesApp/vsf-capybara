<template>
  <SfTabs :open-tab="1" id="address-book-page">
    <SfTab :title="tabTitle" class="_tab">
      <router-view />
    </SfTab>
  </SfTabs>
</template>

<script lang="ts">
import { SfTabs } from '@storefront-ui/vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AddressBook',
  props: {
    tabTitle: {
      type: String,
      default: 'Address book'
    }
  },
  components: {
    SfTabs
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#address-book-page {
  @include for-mobile {
    --tabs-title-display: none;
  }
}
</style>
