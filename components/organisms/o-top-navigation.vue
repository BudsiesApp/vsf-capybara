<template>
  <div class="o-top-navigation">
    <SfBottomNavigation class="_bottom-navigation">
      <o-mobile-menu />

      <SfBottomNavigationItem
        v-for="item in navigationItems"
        :key="item.icon"
        :icon="item.icon"
        :label="item.label"
        :is-floating="item.isFloating"
        :is-active="isActive(item.icon)"
        @click.native="item.onClick"
      />
      <ALogo />

      <ADetailedCartIcon class="sf-header__action" />

      <AAccountIcon class="sf-header__action" />

      <SfButton class="_bulk-quote-button">
        <router-link :to="{name: 'bulk-quote'}">
          {{ $t('Get Quote') }}
        </router-link>
      </SfButton>
    </SfBottomNavigation>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { SfBottomNavigation, SfButton } from '@storefront-ui/vue'

import { ModalList } from 'theme/store/ui/modals'
import ADetailedCartIcon from 'theme/components/atoms/a-detailed-cart-icon.vue';
import AAccountIcon from 'theme/components/atoms/a-account-icon.vue';
import ALogo from 'theme/components/atoms/a-logo.vue';
import OMobileMenu from 'theme/components/organisms/o-mobile-menu.vue';

export default {
  name: 'OTopNavigation',
  components: {
    SfBottomNavigation,
    ALogo,
    ADetailedCartIcon,
    AAccountIcon,
    OMobileMenu,
    SfButton
  },
  data () {
    return {
      navigationItems: [
        { icon: 'list', label: '', onClick: this.goToMenu }
      ]
    }
  },
  computed: {
    ...mapGetters('user', ['isLoggedIn']),
    ...mapState({
      isMobileMenu: state => state.ui.isMobileMenu,
      isSearchPanelVisible: state => state.ui.searchpanel
    }),
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
    },
    goToAccount () {
      this.$store.commit('ui/closeMenu')
      if (this.isLoggedIn) {
        this.$router.push(this.localizedRoute({ name: 'my-account' }))
      } else {
        this.openModal({ name: ModalList.Auth, payload: 'login' })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.o-top-navigation {
  --bottom-navigation-background: var(--c-blue);
  --header-action-margin: 0 0 0 var(--spacer-sm);

  position: relative;
  min-height: var(--bottom-navigation-height);
  z-index: 10;

  ._bottom-navigation {
    position: relative;
  }

  .a-logo {
    display: none;
  }

  ._bulk-quote-button {
    --c-link: var(--c-white);
    --c-link-hover: var(--c-white);
  }

  .a-microcart-icon {
    margin: 0;
    padding: var(--spacer-sm) var(--spacer-xs);
  }
  ::v-deep .sf-header {
      &__logo {
        --header-logo-height: 1.5rem;
      }
    }
  ::v-deep .sf-bottom-navigation {
    top: auto;
    bottom: auto;
    --bottom-navigation-z-index: 11;
    align-items: center;
    justify-content: space-between;
    .sf-bottom-navigation-item {
      cursor: pointer;
      --icon-color: var(--c-white);
    }
  }

  @media (min-width: 375px) {
    .a-logo {
      display: block;
    }
  }

  @include for-desktop() {
    display: none;
  }
}
</style>
