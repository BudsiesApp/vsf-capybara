<template>
  <div class="o-top-navigation">
    <SfBottomNavigation class="_bottom-navigation">
      <SfBottomNavigationItem
        v-for="item in navigationItems"
        :key="item.icon"
        :icon="item.icon"
        :label="item.label"
        :is-floating="item.isFloating"
        :is-active="isActive(item.icon)"
        class="_item"
        @click.native="item.onClick"
      />

      <ALogo class="_item" />

      <MCtaButton size="small" class="_item" />

      <ADetailedCartIcon class="sf-header__action _item" />
    </SfBottomNavigation>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import { SfBottomNavigation, SfButton } from '@storefront-ui/vue'

import { ModalList } from 'theme/store/ui/modals'
import ADetailedCartIcon from 'theme/components/atoms/a-detailed-cart-icon.vue';
import ALogo from 'theme/components/atoms/a-logo.vue';

export default {
  name: 'OTopNavigation',
  components: {
    SfBottomNavigation,
    ALogo,
    ADetailedCartIcon,
    SfButton
  },
  data () {
    return {
      navigationItems: [
        { icon: 'list', label: '', onClick: this.goToMenu },
        { icon: 'account', label: '', onClick: this.goToAccount }
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

  .m-cta-button {
    --button-padding: var(--spacer-sm);
  }

  ._item {
    margin-left: var(--spacer-sm);

    &:first-child {
      margin-left: 0;
    }
  }

  .a-microcart-icon {
    margin: 0 0 0 var(--spacer-sm);
    padding: var(--spacer-sm) 0;
  }

  ::v-deep .sf-header {
    &__logo {
      --header-logo-height: 1.8rem;
      --header-logo-margin: 0;
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

  @include for-desktop() {
    display: none;
  }
}
</style>
