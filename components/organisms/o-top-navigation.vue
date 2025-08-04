<template>
  <div class="o-top-navigation">
    <SfBottomNavigation class="_bottom-navigation">
      <SfBottomNavigationItem
        v-for="item in navigationItems"
        :key="item.icon"
        :icon="item.icon"
        :label="item.label"
        :title="item.title"
        :is-floating="item.isFloating"
        :is-active="isActive(item.icon)"
        class="_item"
        @click.native="item.onClick"
      >
        <template #icon="{ icon, iconSize }">
          <SfButton
            class="sf-button--pure sf-bottom-navigation-item__icon"
            :title="item.title"
          >
            <SfIcon :icon="icon" :size="iconSize" />
          </SfButton>
        </template>
      </SfBottomNavigationItem>

      <ALogo class="_item" />

      <MCtaButton size="small" class="_item" />

      <div class="_action-icons">
        <CurrencySelector />

        <AAccountIcon class="sf-header__action _item" />
        <ADetailedCartIcon class="sf-header__action _item" />
      </div>
    </SfBottomNavigation>

    <SfBottomNavigation class="_bottom-navigation-account mobile-only" v-if="isAccountPage">
      <router-link
        class="_bottom-navigation-account-item"
        :class="item.class"
        v-for="item in navigationItemsAccount"
        :key="item.label"
        :to="item.link"
      >
        <SfIcon :icon="item.icon" size="1.2rem" />

        <span class="_bottom_navigation-account-item-label">{{ item.label }}</span>
      </router-link>
    </SfBottomNavigation>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { SfBottomNavigation, SfButton, SfIcon } from '@storefront-ui/vue';

import { CurrencySelector } from 'src/modules/currency';

import AAccountIcon from 'theme/components/atoms/a-account-icon';
import ADetailedCartIcon from 'theme/components/atoms/a-detailed-cart-icon.vue';
import ALogo from 'theme/components/atoms/a-logo.vue';
import MCtaButton from 'theme/components/molecules/m-cta-button.vue';

const RouteNames = {
  ADDRESS_BOOK_LIST: 'address-book-list',
  ADDRESS_BOOK_EDIT: 'address-book-edit',
  ADDRESS_BOOK_ADD: 'address-book-add',
  ORDERS_HISTORY: 'orders-history',
  MY_ACCOUNT: 'my-account'
}

export default {
  name: 'OTopNavigation',
  components: {
    CurrencySelector,
    SfBottomNavigation,
    SfButton,
    SfIcon,
    ALogo,
    ADetailedCartIcon,
    MCtaButton,
    AAccountIcon
  },
  data () {
    return {
      navigationItems: [
        { icon: 'list', label: '', title: 'Menu', onClick: this.goToMenu }
      ],
      navigationItemsAccount: [
        {
          icon: 'shipping',
          label: 'Order History',
          title: 'Order History',
          link: { name: RouteNames.ORDERS_HISTORY },
          class: '-orders-history'
        },
        {
          icon: 'profile',
          label: 'Profile',
          title: 'Profile',
          link: { name: RouteNames.MY_ACCOUNT },
          class: '-profile'
        },
        {
          icon: 'home',
          label: 'Address Book',
          title: 'Address Book',
          link: { name: RouteNames.ADDRESS_BOOK_LIST },
          class: '-address-book'
        }
      ]
    }
  },
  computed: {
    ...mapGetters('user', ['isLoggedIn']),
    ...mapState({
      isMobileMenu: state => state.ui.isMobileMenu,
      isSearchPanelVisible: state => state.ui.searchpanel
    }),
    isAccountPage () {
      return this.$route.fullPath.includes('/my-account');
    },
    isActive () {
      return (icon) => {
        switch (icon) {
          case 'home': {
            const isHomepage = this.$route.name === this.localizedRoute({ name: 'home', path: '/' }).name
            return isHomepage && !this.isMobileMenu && !this.isSearchPanelVisible
          }
          case 'menu': {
            return this.isMobileMenu
          }
          case 'search': {
            return this.isSearchPanelVisible
          }
          case 'profile': {
            const isProfile = this.$route.name === this.localizedRoute({ name: 'my-account', path: 'my-account' }).name
            return isProfile && !this.isMobileMenu
          }
          default: {
            // we don't need to show active icon for profile and cart, because bottom navigation is below
            return false
          }
        }
      }
    }
  },
  methods: {
    ...mapActions({
      openModal: 'ui/openModal'
    }),
    goToHome () {
      this.$store.commit('ui/setSearchpanel', false)
      this.$store.commit('ui/closeMenu')

      this.$router.push(this.localizedRoute('/'));
    },
    goToMenu () {
      this.$store.commit('ui/setSearchpanel', false)

      this.isMobileMenu
        ? this.$store.commit('ui/closeMenu')
        : this.$store.commit('ui/openMenu')
    },
    goToSearch () {
      this.$store.commit('ui/closeMenu')

      this.$store.commit('ui/setSearchpanel', !this.isSearchPanelVisible)
    }
  }
}
</script>
<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.o-top-navigation {
  --header-logo-height: 1.5rem;

  position: relative;
  min-height: var(--bottom-navigation-height);
  z-index: 10;

  ._bottom-navigation {
    position: relative;
  }

  .m-cta-button {
    --button-padding: var(--spacer-sm);
  }

  ._item {
    margin-left: var(--spacer-sm);

    &.a-account-icon,
    &:first-child {
      margin-left: 0;
    }

  }

  .a-microcart-icon {
    margin: 0;
    padding: var(--spacer-sm) 0;
  }

  ._action-icons {
    display: flex;
    gap: var(--spacer-sm);
    margin-left: var(--spacer-sm);

    ._item {
      padding-left: var(--spacer-2xs);
      padding-right: var(--spacer-2xs);
    }
  }

  ._bottom-navigation-account {
    --bottom-navigation-padding: 0;

    align-items: center;
    position: relative;

    &.sf-bottom-navigation {
      justify-content: space-around;
    }
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

  .sf-bottom-navigation {
    --bottom-navigation-box-shadow: none;

    &:last-child {
      --bottom-navigation-box-shadow:  0px -2px 10px rgba(var(--c-dark-base), 0.15);

      --bottom-navigation-z-index: 11;
    }
  }

  ::v-deep .sf-bottom-navigation {
    top: auto;
    bottom: auto;
    --bottom-navigation-z-index: 12;
    align-items: center;
    justify-content: space-between;

    .sf-bottom-navigation-item {
      cursor: pointer;
    }
  }

  @include for-desktop() {
    display: none;
  }

}
</style>
