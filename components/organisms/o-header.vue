<template>
  <div class="o-header">
    <SfOverlay
      class="overlay"
      :visible="isMainMenuOpen || isEducatorsMenuOpen || isSearchPanelVisible"
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
            '_expanded': isMainMenuExpanded,
            '_hover-dismissed': isMainMenuHoverDismissed
          }"
          @mouseover="onMainMenuMouseOver"
          @mouseleave="onMainMenuMouseLeave"
          @focusout="onMainMenuFocusOut"
        >
          <router-link
            to="/plush-services/"
            class="o-header__submenu"
          >
            Products
          </router-link>
          <button
            ref="mainMenuToggle"
            type="button"
            class="o-header__submenu-toggle"
            :aria-expanded="isMainMenuOpen ? 'true' : 'false'"
            aria-controls="o-header-products-menu"
            @click="onMainMenuToggleClick"
          >
            <span class="sr-only">{{ $t('Products submenu') }}</span>
            <SfIcon
              class="o-header__submenu-toggle-icon"
              icon="chevron_down"
              size="xxs"
              aria-hidden="true"
            />
          </button>
          <MMenu
            id="o-header-products-menu"
            :visible="isMainMenuOpen && !isSearchPanelVisible"
            @transitionend.native="onMainMenuTransitionEnd"
            @close="onMainMenuClose"
          />
        </SfHeaderNavigationItem>

        <SfHeaderNavigationItem
          class="_educators-menu"
          :class="{
            '_expanded': isEducatorsMenuExpanded,
            '_hover-dismissed': isEducatorsMenuHoverDismissed
          }"
          @mouseover="onEducatorsMenuMouseOver"
          @mouseleave="onEducatorsMenuMouseLeave"
          @focusout="onEducatorsMenuFocusOut"
        >
          <router-link
            @click.native="isEducatorsMenuHovered = false"
            to="/teachers/"
            class="o-header__submenu"
          >
            Educators
          </router-link>
          <button
            ref="educatorsMenuToggle"
            type="button"
            class="o-header__submenu-toggle"
            :aria-expanded="isEducatorsMenuOpen ? 'true' : 'false'"
            aria-controls="o-header-educators-menu"
            @click="onEducatorsMenuToggleClick"
          >
            <span class="sr-only">{{ $t('Educators submenu') }}</span>
            <SfIcon
              class="o-header__submenu-toggle-icon"
              icon="chevron_down"
              size="xxs"
              aria-hidden="true"
            />
          </button>

          <MEducatorsMenu
            id="o-header-educators-menu"
            :visible="isEducatorsMenuOpen && !isSearchPanelVisible"
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
import Vue, { ref } from 'vue';
import { SfHeader, SfIcon, SfOverlay } from '@storefront-ui/vue';

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
    SfIcon,
    ALogo,
    AAccountIcon,
    ADetailedCartIcon,
    MMenu,
    MEducatorsMenu,
    SfOverlay,
    MCtaButton,
    CurrencySelector
  },
  setup () {
    return {
      mainMenuToggle: ref<HTMLButtonElement | null>(null),
      educatorsMenuToggle: ref<HTMLButtonElement | null>(null)
    };
  },
  data () {
    return {
      isHoveredMenu: false,
      isMainMenuExpanded: false,
      isMainMenuHoverDismissed: false,
      isMouseOverLocked: false,
      isEducatorsMenuHovered: false,
      isEducatorsMenuExpanded: false,
      isEducatorsMenuHoverDismissed: false
    }
  },
  computed: {
    ...mapState({
      isSearchPanelVisible: state => state.ui.searchpanel
    }),
    ...mapGetters('user', ['isLoggedIn']),
    activeIcon () {
      return this.isLoggedIn ? 'account' : '';
    },
    isMainMenuOpen (): boolean {
      return this.isHoveredMenu || this.isMainMenuExpanded;
    },
    isEducatorsMenuOpen (): boolean {
      return this.isEducatorsMenuHovered || this.isEducatorsMenuExpanded;
    }
  },
  mounted () {
    document.addEventListener('keydown', this.onDocumentKeyDown);
  },
  beforeDestroy () {
    document.removeEventListener('keydown', this.onDocumentKeyDown);
  },
  methods: {
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
    onMainMenuToggleClick () {
      if (this.isMainMenuOpen) {
        this.closeMainMenu();
        return;
      }

      this.isMainMenuHoverDismissed = false;
      this.isMainMenuExpanded = true;
      this.isEducatorsMenuHovered = false;
      this.isEducatorsMenuExpanded = false;
    },
    onMainMenuMouseOver () {
      if (this.isMouseOverLocked || this.isMainMenuHoverDismissed) {
        return;
      }

      this.isHoveredMenu = true;
      this.isEducatorsMenuHovered = false;
      this.isEducatorsMenuExpanded = false;
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
    closeEducatorsMenu () {
      if (this.isEducatorsMenuHovered) {
        this.isEducatorsMenuHoverDismissed = true;
      }

      this.isEducatorsMenuHovered = false;
      this.isEducatorsMenuExpanded = false;
    },
    onEducatorsMenuClose () {
      this.isEducatorsMenuHovered = false;
      this.isEducatorsMenuExpanded = false;
    },
    onEducatorsMenuToggleClick () {
      if (this.isEducatorsMenuOpen) {
        this.closeEducatorsMenu();
        return;
      }

      this.isEducatorsMenuHoverDismissed = false;
      this.isEducatorsMenuExpanded = true;
      this.isHoveredMenu = false;
      this.isMainMenuExpanded = false;
    },
    onEducatorsMenuMouseOver () {
      if (this.isEducatorsMenuHoverDismissed) {
        return;
      }

      this.isEducatorsMenuHovered = true;
      this.isHoveredMenu = false;
      this.isMainMenuExpanded = false;
    },
    onEducatorsMenuMouseLeave () {
      this.isEducatorsMenuHovered = false;
      this.isEducatorsMenuHoverDismissed = false;
    },
    onEducatorsMenuFocusOut (event: FocusEvent) {
      const educatorsNavElement = event.currentTarget as HTMLElement | null;

      if (
        event.relatedTarget !== null &&
        educatorsNavElement?.contains(event.relatedTarget as Node)
      ) {
        return;
      }

      this.isEducatorsMenuExpanded = false;
    },
    onDocumentKeyDown (event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return;
      }

      if (this.isMainMenuOpen) {
        this.closeMenuOnEscape(this.mainMenuToggle as HTMLButtonElement | null, this.closeMainMenu);
      }

      if (this.isEducatorsMenuOpen) {
        this.closeMenuOnEscape(this.educatorsMenuToggle as HTMLButtonElement | null, this.closeEducatorsMenu);
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
    &._expanded {
      .m-menu,
      .m-educators-menu {
        opacity: 1;
        visibility: visible;
      }

      &::after {
        width: 100%;
      }
    }

    &._hover-dismissed:hover:not(._expanded) {
      .m-menu,
      .m-educators-menu {
        opacity: 0;
        visibility: hidden;
      }

      &::after {
        width: 0;
      }
    }

    > .o-header__submenu-toggle {
      position: relative;
      flex: 0 0 1px;
      width: 1px;
      margin: 0 0 0 -1px;
      padding: 0;
      border: 0;
      background: none;
      overflow: visible;
      cursor: pointer;

      &:focus {
        outline: none;
      }

      &:focus-visible .o-header__submenu-toggle-icon {
        visibility: visible;
      }
    }
  }

  &__submenu-toggle-icon {
    position: absolute;
    top: 50%;
    right: var(--spacer-xs);
    padding: var(--spacer-2xs);
    transform: translateY(-50%);
    visibility: hidden;
    outline: 2px solid var(--c-primary);
    outline-offset: 1px;
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
