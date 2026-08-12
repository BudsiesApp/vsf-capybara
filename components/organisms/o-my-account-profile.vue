<template>
  <div class="o-my-account-profile">
    <SfTabs :open-tab="1">
      <SfTab :title="$t('Personal data')">
        <MUpdatePersonalData />

        <button
          type="button"
          class="sf-button color-secondary _logout-button mobile-only"
          @click="logout"
        >
          {{ $t('Log out') }}
        </button>
      </SfTab>
    </SfTabs>
  </div>
</template>

<script>
import { SfTabs } from '@storefront-ui/vue';
import MUpdatePersonalData from 'theme/components/molecules/m-update-personal-data'

export default {
  name: 'OMyAccountProfile',
  components: {
    SfTabs,
    MUpdatePersonalData
  },
  methods: {
    async logout () {
      await this.$store.dispatch('user/logout', {});
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.o-my-account-profile {
  ._logout-button {
    margin-top: var(--spacer-2xl);
  }

  ::v-deep {
    .sf-tabs__title {
      padding: var(--tabs-title-padding, var(--spacer-sm));
    }
  }

  @include for-mobile {
    --tabs-title-display: none;

    .m-update-personal-data {
      margin-top: var(--spacer-base);
    }
  }
}
</style>
