<template>
  <div class="o-header">
    <SfOverlay
      class="overlay"
      :visible="isHoveredMenu || isSearchPanelVisible"
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
        >
          <div class="o-header__submenu">
            Products
          </div>
          <MMenu
            :visible="isHoveredMenu && !isSearchPanelVisible"
            @transitionend.native="onMainMenuTransitionEnd"
            @close="onMainMenuClose"
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
        <SfHeaderNavigationItem>
          <router-link
            to="/pricing/"
          >
            Pricing
          </router-link>
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

<script>
import { SfHeader, SfOverlay } from '@storefront-ui/vue';
import ALogo from 'theme/components/atoms/a-logo';
import AAccountIcon from 'theme/components/atoms/a-account-icon';
import ADetailedCartIcon from 'theme/components/atoms/a-detailed-cart-icon';
import { mapState, mapGetters } from 'vuex';
import MMenu from 'theme/components/molecules/m-menu';
import MCtaButton from 'theme/components/molecules/m-cta-button.vue';

export default {
  name: 'OHeader',
  components: {
    SfHeader,
    ALogo,
    AAccountIcon,
    ADetailedCartIcon,
    MMenu,
    SfOverlay,
    MCtaButton
  },
  data () {
    return {
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
