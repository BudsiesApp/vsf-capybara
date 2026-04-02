<template>
  <div class="o-header">
    <SfOverlay
      class="overlay"
      :visible="isAboutMenuHovered || isHoveredMenu || isSearchPanelVisible"
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
          @mouseover="onAboutMenuMouseOver"
          @mouseleave="isAboutMenuHovered = false"
        >
          <div class="o-header__submenu">
            {{ $t('About') }}
          </div>

          <MAboutMenu
            :visible="isAboutMenuHovered && !isSearchPanelVisible"
            @close="onAboutMenuClose"
          />
        </SfHeaderNavigationItem>

        <SfHeaderNavigationItem
          @mouseover="onMainMenuMouseOver"
          @mouseleave="isHoveredMenu = false"
        >
          <div class="o-header__submenu">
            {{ $t('Products') }}
          </div>

          <MMenu
            :visible="isHoveredMenu && !isSearchPanelVisible"
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
          <CurrencySelector />

          <AAccountIcon class="sf-header__action" />
          <ADetailedCartIcon class="sf-header__action" />
        </div>
      </template>
    </SfHeader>
  </div>
</template>

<script>
import { SfButton, SfHeader, SfOverlay } from '@storefront-ui/vue';
import { mapState, mapGetters } from 'vuex';

import { CurrencySelector } from 'src/modules/currency';

import ALogo from 'theme/components/atoms/a-logo';
import AAccountIcon from 'theme/components/atoms/a-account-icon';
import ADetailedCartIcon from 'theme/components/atoms/a-detailed-cart-icon';
import MAboutMenu from 'theme/components/molecules/m-about-menu';
import MMenu from 'theme/components/molecules/m-menu';
import MCtaButton from 'theme/components/molecules/m-cta-button.vue';

export default {
  name: 'OHeader',
  components: {
    SfHeader,
    ALogo,
    AAccountIcon,
    ADetailedCartIcon,
    SfOverlay,
    SfButton,
    MAboutMenu,
    MMenu,
    MCtaButton,
    CurrencySelector
  },
  data () {
    return {
      isAboutMenuHovered: false,
      isHoveredMenu: false,
      isMouseOverLocked: false
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
    onAboutMenuClose () {
      this.isAboutMenuHovered = false;
    },
    onAboutMenuMouseOver () {
      this.isAboutMenuHovered = true;
    },
    onMainMenuClose () {
      this.isHoveredMenu = false;
      this.isMouseOverLocked = true;
    },
    onMainMenuMouseOver () {
      if (this.isMouseOverLocked) {
        return;
      }

      this.isHoveredMenu = true;
    },
    async onMainMenuTransitionEnd () {
      await this.$nextTick();
      this.isMouseOverLocked = false;
    }
  }
};
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

    &:hover > *:not(.sf-mega-menu) {
      --header-navigation-item-color: var(--c-white);
    }

    &:hover {
      .m-about-menu,
      .m-menu {
        opacity: 1;
        visibility: visible;
      }

      &::after {
        width: 100%;
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
