<template>
  <div class="o-header">
    <SfOverlay
      class="overlay"
      :visible="isHoveredMenu || isFocusedMenu || isEducatorsMenuHovered || isEducatorsMenuFocused || isSearchPanelVisible"
      @click="$store.commit('ui/setSearchpanel', false)"
    />
    <SfHeader
      :active-icon="activeIcon"
      class="_header"
      :class="[
        {
          'sf-header--has-mobile-search': isSearchPanelVisible,
        }
      ]"
    >
      <template #logo>
        <ALogo />
      </template>
      <template #navigation>
        <SfHeaderNavigationItem
          @mouseover="onMainMenuMouseOver"
          @mouseleave="isHoveredMenu = false"
          @focusin="onMainMenuFocusIn"
          @focusout="onMainMenuFocusOut"
          @keydown.esc="onMainMenuEscapeKey"
        >
          <router-link
            to="/plush-services/"
            class="o-header__submenu"
            :aria-expanded="String(isHoveredMenu || isFocusedMenu)"
          >
            Products
          </router-link>
          <MMenu
            :visible="(isHoveredMenu || isFocusedMenu) && !isSearchPanelVisible"
            @transitionend.native="onMainMenuTransitionEnd"
            @close="onMainMenuClose"
          />
        </SfHeaderNavigationItem>

        <SfHeaderNavigationItem
          ref="educatorsNavItem"
          @mouseover="onEducatorsMenuMouseOver"
          @mouseleave="isEducatorsMenuHovered = false"
          @focusin="onEducatorsMenuFocusIn"
          @focusout="onEducatorsMenuFocusOut"
          @keydown.esc="onEducatorsMenuEscapeKey"
          class="_educators-menu"
        >
          <router-link
            @click.native="isEducatorsMenuHovered = false"
            to="/teachers/"
            class="o-header__submenu"
            :aria-expanded="String(isEducatorsMenuHovered || isEducatorsMenuFocused)"
          >
            Educators
          </router-link>

          <MEducatorsMenu
            :visible="(isEducatorsMenuHovered || isEducatorsMenuFocused) && !isSearchPanelVisible"
            @close="onEducatorsMenuClose"
          />
        </SfHeaderNavigationItem>

        <SfHeaderNavigationItem>
          <router-link
            :to="{ name: 'gift-cards' }"
          >
            Gift Cards
          </router-link>
        </SfHeaderNavigationItem>
        <SfHeaderNavigationItem>
          <router-link
            to="/reviews/"
          >
            Reviews
          </router-link>
        </SfHeaderNavigationItem>

        <MCtaButton />
      </template>
      <template #search>
        <div />
      </template>
      <template #header-icons>
        <div class="sf-header__icons">
          <CurrencySelector label-id="desktop-currency-selector-label" />

          <AAccountIcon class="sf-header__action" />
          <ADetailedCartIcon class="sf-header__action" />
        </div>
      </template>
    </SfHeader>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { SfHeader, SfOverlay } from '@storefront-ui/vue';

import { CurrencySelector } from 'src/modules/currency';

import ALogo from 'theme/components/atoms/a-logo.vue';
import AAccountIcon from 'theme/components/atoms/a-account-icon.vue';
import ADetailedCartIcon from 'theme/components/atoms/a-detailed-cart-icon.vue';
import { mapState, mapGetters } from 'vuex';
import MMenu from 'theme/components/molecules/m-menu.vue';
import MEducatorsMenu from 'theme/components/molecules/m-educators-menu.vue';
import MCtaButton from 'theme/components/molecules/m-cta-button.vue';

export default Vue.extend({
  name: 'OHeader',
  components: {
    SfHeader,
    ALogo,
    AAccountIcon,
    ADetailedCartIcon,
    MMenu,
    MEducatorsMenu,
    SfOverlay,
    MCtaButton,
    CurrencySelector
  },
  data () {
    return {
      isHoveredMenu: false,
      isFocusedMenu: false,
      isMouseOverLocked: false,
      isEducatorsMenuHovered: false,
      isEducatorsMenuFocused: false
    }
  },
  computed: {
    ...mapState({
      isSearchPanelVisible: state => state.ui.searchpanel
    }),
    ...mapGetters('user', ['isLoggedIn']),
    activeIcon () {
      return this.isLoggedIn ? 'account' : '';
    }
  },
  methods: {
    onMainMenuClose () {
      this.isHoveredMenu = false;
      this.isFocusedMenu = false;
      this.isMouseOverLocked = true;
    },
    onMainMenuMouseOver () {
      if (this.isMouseOverLocked) {
        return;
      }

      this.isHoveredMenu = true;
      this.isEducatorsMenuHovered = false;
      this.isEducatorsMenuFocused = false;
    },
    async onMainMenuTransitionEnd () {
      await this.$nextTick();
      this.isMouseOverLocked = false;
    },
    onMainMenuFocusIn () {
      this.isFocusedMenu = true;
      this.isEducatorsMenuHovered = false;
      this.isEducatorsMenuFocused = false;
    },
    onMainMenuFocusOut (event: FocusEvent) {
      const productsNavElement = event.currentTarget as HTMLElement | null;

      if (
        event.relatedTarget !== null &&
        productsNavElement?.contains(event.relatedTarget as Node)
      ) {
        return;
      }

      this.isFocusedMenu = false;
    },
    onMainMenuEscapeKey (event: KeyboardEvent) {
      this.isFocusedMenu = false;
      this.isHoveredMenu = false;

      const productsNavElement = event.currentTarget as HTMLElement | null;
      const menuTrigger = productsNavElement?.querySelector('a') as HTMLAnchorElement | null;

      menuTrigger?.focus();
    },
    onEducatorsMenuClose () {
      this.isEducatorsMenuHovered = false;
    },
    onEducatorsMenuMouseOver () {
      this.isEducatorsMenuHovered = true;
      this.isHoveredMenu = false;
      this.isFocusedMenu = false;
    },
    onEducatorsMenuFocusIn () {
      this.isEducatorsMenuFocused = true;
      this.isHoveredMenu = false;
      this.isFocusedMenu = false;
    },
    onEducatorsMenuFocusOut (event: FocusEvent) {
      const educatorsNavElement = event.currentTarget as HTMLElement | null;

      if (
        event.relatedTarget !== null &&
        educatorsNavElement?.contains(event.relatedTarget as Node)
      ) {
        return;
      }

      this.isEducatorsMenuFocused = false;
    },
    onEducatorsMenuEscapeKey (event: KeyboardEvent) {
      this.isEducatorsMenuFocused = false;
      this.isEducatorsMenuHovered = false;

      const educatorsNavElement = event.currentTarget as HTMLElement | null;
      const menuTrigger = educatorsNavElement?.querySelector('a') as HTMLAnchorElement | null;

      menuTrigger?.focus();
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

    &:hover > *:not(.sf-mega-menu),
    &:focus-within > *:not(.sf-mega-menu) {
      --header-navigation-item-color: var(--c-primary);
    }

    &:hover,
    &:focus-within {
      .m-menu,
      .m-educators-menu {
        opacity: 1;
        visibility: visible;
      }

      &::after {
        width: 100%;
      }
    }
  }

  .m-cta-button {
    align-self: center;
  }

  .sf-header {
    display: none;
  }

  ::v-deep .sf-header {
    --header-logo-margin: 0 0 0 0;

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
