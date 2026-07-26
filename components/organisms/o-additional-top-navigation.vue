<template>
  <SfBottomNavigation class="o-additional-top-navigation mobile-only">
    <router-link
      class="_navigation-item"
      :class="item.class"
      v-for="item in navigationItems"
      :key="item.icon"
      :to="item.link"
    >
      <SfIcon :icon="item.icon" size="1.2rem" />

      <span class="_label">
        {{ item.label }}
      </span>
    </router-link>
  </SfBottomNavigation>
</template>

<script lang="ts">
import { SfBottomNavigation, SfIcon } from '@storefront-ui/vue';
import { defineComponent, PropType } from 'vue';

import { AdditionalTopNavigationItem } from 'theme/interfaces/additional-top-navigation-item.interface';

export default defineComponent({
  name: 'OAdditionalTopNavigation',
  props: {
    navigationItems: {
      type: Array as PropType<AdditionalTopNavigationItem[]>,
      default: () => []
    }
  },
  components: {
    SfBottomNavigation,
    SfIcon
  }
});
</script>

<style lang="scss" scoped>
.o-additional-top-navigation {
  align-items: center;
  position: relative;

  &.sf-bottom-navigation {
    --bottom-navigation-box-shadow: none;
    --bottom-navigation-padding: 0;

    justify-content: space-around;
  }

  ._navigation-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    row-gap: var(--spacer-2xs);
    color: var(--c-text);

    &.router-link-active {
      text-decoration: underline;
    }

    &.-profile {
      &.router-link-active {
        text-decoration: none;
      }

      &.router-link-exact-active {
        text-decoration: underline;
      }
    }
  }
}
</style>
