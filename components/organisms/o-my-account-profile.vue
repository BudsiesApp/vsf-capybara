<template>
  <div class="o-my-account-profile">
    <SfTabs :open-tab="1">
      <SfTab :title="$t('Personal data')">
        <MUpdatePersonalData />
      </SfTab>
      <SfTab :title="$t('Password change')">
        <MUpdatePassword />
      </SfTab>
    </SfTabs>
  </div>
</template>

<script>
import { SfTabs } from '@storefront-ui/vue';
import MUpdatePersonalData from 'theme/components/molecules/m-update-personal-data'
import MUpdatePassword from 'theme/components/molecules/m-update-password'

export default {
  name: 'OMyAccountProfile',
  components: {
    SfTabs,
    MUpdatePersonalData,
    MUpdatePassword
  }
};
</script>

<style lang="scss" scoped>
.o-my-account-profile {
  ::v-deep {
    .sf-tabs__title {
      padding: var(--tabs-title-padding, var(--spacer-sm));
    }
  }
}
</style>
