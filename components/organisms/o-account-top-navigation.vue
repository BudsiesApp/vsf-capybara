<template>
  <SfBottomNavigation class="_bottom-navigation-account mobile-only">
    <router-link
      class="_bottom-navigation-account-item"
      :class="item.class"
      v-for="item in navigationItems"
      :key="item.label"
      :to="item.link"
    >
      <SfIcon :icon="item.icon" size="1.2rem" />

      <span class="_bottom_navigation-account-item-label">
        {{ item.label }}
      </span>
    </router-link>
  </SfBottomNavigation>
</template>

<script lang="ts">
import { SfBottomNavigation, SfIcon } from '@storefront-ui/vue';
import { defineComponent, PropType } from '@vue/composition-api';

interface NavigationItem {
  label: string,
  icon: string,
  link: string,
  class: string
}

export default defineComponent({
  name: 'OAccountTopNavigation',
  props: {
    navigationItems: {
      type: Array as PropType<NavigationItem[]>,
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
._bottom-navigation-account {
  --bottom-navigation-padding: 0;

  align-items: center;
  position: relative;

  &.sf-bottom-navigation {
    --bottom-navigation-box-shadow: none;

    justify-content: space-around;
  }

  ._bottom-navigation-account-item {
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
