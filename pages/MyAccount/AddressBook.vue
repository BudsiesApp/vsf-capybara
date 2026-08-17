<template>
  <div id="address-book-page">
    <SfHeading
      ref="heading"
      :title="tabTitle"
      :level="2"
      class="_title"
      tabindex="-1"
    />

    <div class="_panel">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { SfHeading } from '@storefront-ui/vue';
import { useRoute } from '@vue-storefront/core/application-services';
import { defineComponent, watch } from 'vue';

import { useHeadingFocus } from '../../helpers/use-heading-focus';

export default defineComponent({
  name: 'AddressBook',
  props: {
    tabTitle: {
      type: String,
      default: 'Address book'
    }
  },
  components: {
    SfHeading
  },
  setup () {
    const currentRoute = useRoute();
    const { heading, focusHeading } = useHeadingFocus();

    watch(
      () => currentRoute.fullPath,
      focusHeading
    );

    return { heading };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#address-book-page {
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
}
</style>
