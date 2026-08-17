<template>
  <div class="o-my-account-profile">
    <SfHeading
      ref="heading"
      :title="$t('Personal data')"
      :level="2"
      class="_title"
      tabindex="-1"
    />

    <div class="_panel">
      <MUpdatePersonalData />

      <button
        type="button"
        class="sf-button color-secondary _logout-button mobile-only"
        @click="logout"
      >
        {{ $t('Log out') }}
      </button>
    </div>
  </div>
</template>

<script>
import { SfHeading } from '@storefront-ui/vue';
import MUpdatePersonalData from 'theme/components/molecules/m-update-personal-data'

import { useHeadingFocus } from 'theme/helpers/use-heading-focus';

export default {
  name: 'OMyAccountProfile',
  components: {
    SfHeading,
    MUpdatePersonalData
  },
  setup () {
    return useHeadingFocus();
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

  ._title {
    display: none;
  }

  ._panel {
    border-top: 1px solid var(--c-light);
    padding: var(--spacer-base) var(--spacer-sm);
    color: var(--c-text);
    font: var(--font-light) var(--font-base) / 1.6 var(--font-family-primary);
  }

  @include for-desktop {
    ._title {
      display: inline-flex;
      position: relative;
      z-index: 1;
      margin: 0 var(--spacer-lg) -2px 0;
      padding: var(--spacer-xs) 0;
      border-bottom: 2px solid var(--c-text);
      --heading-text-align: left;
      --heading-title-margin: 0;
      --heading-title-color: var(--c-text);
      --heading-title-font: var(--font-normal) var(--h4-font-size) / 1.4 var(--font-family-secondary);
      --heading-title-font-size: var(--h4-font-size);
      --heading-title-font-weight: var(--font-normal);
    }

    ._panel {
      border-top-width: 2px;
      padding: var(--spacer-base) 0;
    }
  }

  @include for-mobile {
    .m-update-personal-data {
      margin-top: var(--spacer-base);
    }
  }
}
</style>
