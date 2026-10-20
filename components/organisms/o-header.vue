<template>
  <div class="o-header">
    <SfOverlay
      class="overlay"
      :visible="isAboutMenuOpen || isMainMenuOpen || isSearchPanelVisible"
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
          :class="{
            '_expanded': isAboutMenuExpanded,
            '_hover-dismissed': isAboutMenuHoverDismissed
          }"
          @mouseover="onAboutMenuMouseOver"
          @mouseleave="onAboutMenuMouseLeave"
          @focusout="onAboutMenuFocusOut"
        >
          <button
            ref="aboutMenuToggle"
            type="button"
            class="o-header__submenu o-header__submenu-button"
            :aria-expanded="isAboutMenuOpen ? 'true' : 'false'"
            aria-controls="o-header-about-menu"
            @click="onAboutMenuToggleClick"
          >
            {{ $t('About') }}
          </button>

          <MAboutMenu
            id="o-header-about-menu"
            :visible="isAboutMenuOpen && !isSearchPanelVisible"
            @transitionend.native="onAboutMenuTransitionEnd"
            @close="onAboutMenuClose"
          />
        </SfHeaderNavigationItem>

        <SfHeaderNavigationItem
          :class="{
            '_expanded': isMainMenuExpanded,
            '_hover-dismissed': isMainMenuHoverDismissed
          }"
          @mouseover="onMainMenuMouseOver"
          @mouseleave="onMainMenuMouseLeave"
          @focusout="onMainMenuFocusOut"
        >
          <button
            ref="mainMenuToggle"
            type="button"
            class="o-header__submenu o-header__submenu-button"
            :aria-expanded="isMainMenuOpen ? 'true' : 'false'"
            aria-controls="o-header-products-menu"
            @click="onMainMenuToggleClick"
          >
            {{ $t('Products') }}
          </button>

          <MMenu
            id="o-header-products-menu"
            :visible="isMainMenuOpen && !isSearchPanelVisible"
            @transitionend.native="onMainMenuTransitionEnd"
            @close="onMainMenuClose"
          />
        </SfHeaderNavigationItem>

        <SfHeaderNavigationItem>
          <router-link class="o-header__submenu" to="/distributors/">
            {{ $t('Distributors') }}
          </router-link>
        </SfHeaderNavigationItem>

        <SfHeaderNavigationItem>
          <router-link class="o-header__submenu" to="/reviews/">
            {{ $t('Reviews') }}
          </router-link>
        </SfHeaderNavigationItem>

        <SfHeaderNavigationItem>
          <router-link class="o-header__submenu" to="/custom-plush-pricing/">
            {{ $t('Pricing') }}
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
import Vue, { ref } from 'vue';
import { SfHeader, SfOverlay } from '@storefront-ui/vue';
import { mapState, mapGetters } from 'vuex';

import { CurrencySelector } from 'src/modules/currency';

import ALogo from 'theme/components/atoms/a-logo.vue';
import AAccountIcon from 'theme/components/atoms/a-account-icon.vue';
import ADetailedCartIcon from 'theme/components/atoms/a-detailed-cart-icon.vue';
import MAboutMenu from 'theme/components/molecules/m-about-menu.vue';
import MMenu from 'theme/components/molecules/m-menu.vue';
import MCtaButton from 'theme/components/molecules/m-cta-button.vue';

export default Vue.extend({
  name: 'OHeader',
  components: {
    SfHeader,
    ALogo,
    AAccountIcon,
    ADetailedCartIcon,
    SfOverlay,
    MAboutMenu,
    MMenu,
    MCtaButton,
    CurrencySelector
  },
  setup () {
    return {
      aboutMenuToggle: ref<HTMLButtonElement | null>(null),
      mainMenuToggle: ref<HTMLButtonElement | null>(null)
    };
  },
  data () {
    return {
      isAboutMenuHovered: false,
      isAboutMenuExpanded: false,
      isAboutMenuHoverDismissed: false,
      isAboutMouseOverLocked: false,
      isHoveredMenu: false,
      isMainMenuExpanded: false,
      isMainMenuHoverDismissed: false,
      isMouseOverLocked: false
    };
  },
  computed: {
    ...mapState({
      isSearchPanelVisible: state => state.ui.searchpanel
    }),
    ...mapGetters('user', ['isLoggedIn']),
    activeIcon () {
      return this.isLoggedIn ? 'account' : '';
    },
    isAboutMenuOpen (): boolean {
      return this.isAboutMenuHovered || this.isAboutMenuExpanded;
    },
    isMainMenuOpen (): boolean {
      return this.isHoveredMenu || this.isMainMenuExpanded;
    }
  },
  mounted () {
    document.addEventListener('keydown', this.onDocumentKeyDown);
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this.onDocumentKeyDown);
  },
  methods: {
    closeAboutMenu () {
      if (this.isAboutMenuHovered) {
        this.isAboutMenuHoverDismissed = true;
      }

      this.isAboutMenuHovered = false;
      this.isAboutMenuExpanded = false;
    },
    onAboutMenuClose () {
      this.isAboutMenuHovered = false;
      this.isAboutMenuExpanded = false;
      this.isAboutMouseOverLocked = true;
    },
    onAboutMenuToggleClick (event: MouseEvent) {
      const isPointerClick = event.detail > 0;

      if (isPointerClick) {
        this.isAboutMenuHoverDismissed = false;
        this.isAboutMenuHovered = true;
        return;
      }

      if (this.isAboutMenuOpen) {
        this.closeAboutMenu();
        return;
      }

      this.isAboutMenuHoverDismissed = false;
      this.isAboutMenuExpanded = true;
    },
    onAboutMenuMouseOver () {
      if (this.isAboutMouseOverLocked || this.isAboutMenuHoverDismissed) {
        return;
      }

      this.isAboutMenuHovered = true;
    },
    onAboutMenuMouseLeave () {
      this.isAboutMenuHovered = false;
      this.isAboutMenuHoverDismissed = false;
    },
    async onAboutMenuTransitionEnd () {
      await this.$nextTick();
      this.isAboutMouseOverLocked = false;
    },
    onAboutMenuFocusOut (event: FocusEvent) {
      const aboutNavElement = event.currentTarget as HTMLElement | null;

      if (
        event.relatedTarget !== null &&
        aboutNavElement?.contains(event.relatedTarget as Node)
      ) {
        return;
      }

      this.isAboutMenuExpanded = false;
    },
    closeMainMenu () {
      if (this.isHoveredMenu) {
        this.isMainMenuHoverDismissed = true;
      }

      this.isHoveredMenu = false;
      this.isMainMenuExpanded = false;
    },
    onMainMenuClose () {
      this.isHoveredMenu = false;
      this.isMainMenuExpanded = false;
      this.isMouseOverLocked = true;
    },
    onMainMenuToggleClick (event: MouseEvent) {
      const isPointerClick = event.detail > 0;

      if (isPointerClick) {
        this.isMainMenuHoverDismissed = false;
        this.isHoveredMenu = true;
        return;
      }

      if (this.isMainMenuOpen) {
        this.closeMainMenu();
        return;
      }

      this.isMainMenuHoverDismissed = false;
      this.isMainMenuExpanded = true;
    },
    onMainMenuMouseOver () {
      if (this.isMouseOverLocked || this.isMainMenuHoverDismissed) {
        return;
      }

      this.isHoveredMenu = true;
    },
    onMainMenuMouseLeave () {
      this.isHoveredMenu = false;
      this.isMainMenuHoverDismissed = false;
    },
    async onMainMenuTransitionEnd () {
      await this.$nextTick();
      this.isMouseOverLocked = false;
    },
    onMainMenuFocusOut (event: FocusEvent) {
      const productsNavElement = event.currentTarget as HTMLElement | null;

      if (
        event.relatedTarget !== null &&
        productsNavElement?.contains(event.relatedTarget as Node)
      ) {
        return;
      }

      this.isMainMenuExpanded = false;
    },
    onDocumentKeyDown (event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return;
      }

      if (this.isAboutMenuOpen) {
        this.closeMenuOnEscape(this.aboutMenuToggle as HTMLButtonElement | null, this.closeAboutMenu);
      }

      if (this.isMainMenuOpen) {
        this.closeMenuOnEscape(this.mainMenuToggle as HTMLButtonElement | null, this.closeMainMenu);
      }
    },
    closeMenuOnEscape (menuToggle: HTMLButtonElement | null, closeMenu: () => void) {
      const isFocusInsideMenu = !!menuToggle?.parentElement?.contains(document.activeElement);

      closeMenu();

      if (isFocusInsideMenu) {
        menuToggle?.focus();
      }
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.a-logo {
  --header-logo-height: 4rem;

  margin-right: var(--spacer-lg);
}

.overlay {
  --overlay-z-index: 99;
}

.o-header {
  --header-navigation-item-font-size: var(--font-sm);
  --header-navigation-item-margin: 0;
  --header-navigation-item-padding: var(--spacer-lg) var(--spacer-sm);

  display: none;
  box-sizing: border-box;

  ._header {
    position: relative;
    z-index: 200;
  }

  &__submenu {
    cursor: pointer;
  }

  &__submenu-button {
    background: none;
    border-radius: 0;
    appearance: none;
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
    flex: unset;

    &::after {
      bottom: 0;
      width: 0;
    }

    &:hover > *:not(.sf-mega-menu),
    &:focus-within > *:not(.sf-mega-menu) {
      --header-navigation-item-color: var(--c-white);
    }

    &:hover,
    &._expanded {
      .m-about-menu,
      .m-menu {
        opacity: 1;
        visibility: visible;
      }

      &::after {
        width: 100%;
      }
    }

    &._hover-dismissed:hover:not(._expanded) {
      .m-about-menu,
      .m-menu {
        opacity: 0;
        visibility: hidden;
      }

      &::after {
        width: 0;
      }
    }
  }

  .sf-header {
    display: none;
  }

  ::v-deep .sf-header {
    --header-logo-margin: 0;

    &__navigation {
      --header-navigation-margin: 0 var(--spacer-base);
      justify-content: space-evenly;
      align-items: center;
      flex-grow: 2;
    }

    &__actions {
      justify-content: space-between;
      flex: 1;
    }
  }

  @media screen and (max-width: $desktop-l-min) {
    --header-action-margin: 0 0 0 var(--spacer-sm);

    .a-logo {
      margin-right: var(--spacer-xs);
      max-width: 10%;
    }

    ::v-deep .sf-header {
      &__navigation {
        --header-navigation-margin: 0 0 0 var(--spacer-sm);
      }
    }
  }

  @media screen and (max-width: $desktop-xl-min) {
    --header-navigation-item-font-size: var(--font-xs);
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
