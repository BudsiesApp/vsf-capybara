<template>
  <div class="o-header">
    <SfOverlay
      class="overlay"
      :visible="showOverlay"
      @click="$store.commit('ui/setSearchpanel', false)"
    />
    <SfHeader
      :active-icon="activeIcon"
      class="_header"
    >
      <template #logo>
        <ALogo />
      </template>

      <template #navigation>
        <SfHeaderNavigationItem
          v-for="navigationItem in navigationItems"
          :key="navigationItem.link_text"
          @mouseover="onNavigationItemMouseOver(navigationItem)"
          @mouseleave="menuHoveredFor = undefined"
        >
          <template v-if="navigationItem.items.length">
            <div class="o-header__submenu">
              {{ navigationItem.link_text }}
            </div>

            <MMenu
              :menu-items="navigationItem.items"
              :visible="isMenuShowFor(navigationItem)"
              @transitionend.native="onMainMenuTransitionEnd"
              @close="onMainMenuClose"
            />
          </template>

          <navigation-item :item="navigationItem" v-else>
            <span class="_menu_item">
              {{ navigationItem.link_text }}
            </span>
          </navigation-item>
        </SfHeaderNavigationItem>

        <MCtaButton />
      </template>
      <template #search>
        <div />
      </template>
      <template #header-icons>
        <div class="sf-header__icons">
          <AAccountIcon class="sf-header__action" />
          <ADetailedCartIcon class="sf-header__action" />
        </div>
      </template>
    </SfHeader>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapGetters } from 'vuex';
import { SfHeader, SfOverlay } from '@storefront-ui/vue';

import { NavigationItem as NavigationItemInterface } from 'src/modules/vsf-storyblok-module';

import ALogo from 'theme/components/atoms/a-logo.vue';
import AAccountIcon from 'theme/components/atoms/a-account-icon.vue';
import ADetailedCartIcon from 'theme/components/atoms/a-detailed-cart-icon.vue';
import MMenu from 'theme/components/molecules/m-menu.vue';
import MCtaButton from 'theme/components/molecules/m-cta-button.vue';
import NavigationItem from 'theme/components/storyblok/NavigationItem.vue';

export default Vue.extend({
  name: 'OHeader',
  props: {
    navigationItems: {
      type: Array as PropType<NavigationItemInterface[]>,
      required: true
    }
  },
  components: {
    SfHeader,
    ALogo,
    AAccountIcon,
    ADetailedCartIcon,
    MMenu,
    SfOverlay,
    MCtaButton,
    NavigationItem
  },
  data () {
    return {
      menuHoveredFor: undefined as NavigationItemInterface | undefined,
      isMouseOverLocked: false
    }
  },
  computed: {
    ...mapGetters('user', ['isLoggedIn']),
    isLoggedIn (): boolean {
      return this.$store.getters['user/isLoggedIn'];
    },
    activeIcon (): string {
      return this.isLoggedIn ? 'account' : '';
    },
    showOverlay (): boolean {
      return !!this.menuHoveredFor;
    }
  },
  methods: {
    isMenuShowFor (item: NavigationItemInterface): boolean {
      return this.menuHoveredFor === item;
    },
    onMainMenuClose (): void {
      this.menuHoveredFor = undefined;
      this.isMouseOverLocked = true;
    },
    async onMainMenuTransitionEnd (): Promise<void> {
      await this.$nextTick();
      this.isMouseOverLocked = false;
    },
    onNavigationItemMouseOver (item: NavigationItemInterface): void {
      if (this.isMouseOverLocked || !item.items.length) {
        return;
      }

      this.menuHoveredFor = item;
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.a-logo {
  margin-right: var(--spacer-lg);
}

.overlay {
  --overlay-z-index: 99;
}

.o-header {
  --header-navigation-item-margin: 0;
  --header-navigation-item-padding: var(--spacer-lg) var(--spacer-xs);
  --header-navigation-item-color: var(--c-dark);

  display: none;
  box-sizing: border-box;

  ._header {
    position: relative;
    z-index: 200;
  }

  &__submenu {
    cursor: pointer;
  }

  a {
    &.active {
      font-weight: bold;
    }
  }

  ::v-deep .sf-menu-item {
    &__label {
      &:hover {
        --menu-item-label-color: var(--c-primary);
      }
    }
  }

  .sf-header-navigation-item {
    &::after {
      bottom: 0;
      width: 0;
    }

    &:hover > *:not(.sf-mega-menu) {
      --header-navigation-item-color: var(--c-primary);
    }

    &:hover {
      .m-menu {
        opacity: 1;
        visibility: visible;
      }

      &::after {
        width: 100%;
      }
    }
  }

  ._menu_item {
    color: var(--header-navigation-item-color);
  }

  .m-cta-button {
    align-self: center;
  }

  .sf-header {
    display: none;
  }

  ::v-deep .sf-header {
    --header-logo-margin: 0 0 var(--spacer-sm) 0;

    &__navigation {
      --header-navigation-margin: 0 var(--spacer-base);
      justify-content: space-evenly;
      flex-grow: 2;
    }

    &__actions {
      justify-content: space-between;
      flex: 1;
    }
  }

  @include for-desktop {
    --header-box-shadow: 0px -2px 10px rgba(var(--c-dark-base), 0.15);
    display: flex;

    .sf-header {
      display: block;
      --header-navigation-margin: 0 auto;
    }

    ::v-deep .sf-header {
      &__icons {
        display: flex;

        .sf-header__icon {
          cursor: pointer;
        }
      }
    }
  }
}
</style>
