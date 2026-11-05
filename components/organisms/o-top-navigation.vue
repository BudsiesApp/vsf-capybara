<template>
  <div
    class="o-top-navigation"
    :class="{
      '-additional-navigation': additionalTopNavigationItems.length
    }"
  >
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
        <CurrencySelector label-id="mobile-currency-selector-label" />

        <AAccountIcon class="sf-header__action _item" />
        <ADetailedCartIcon class="sf-header__action _item" />
      </div>
    </SfBottomNavigation>

    <o-additional-top-navigation
      v-show="additionalTopNavigationItems.length"
      class="_additional-navigation"
      :navigation-items="additionalTopNavigationItems"
    />
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
import OAdditionalTopNavigation from 'theme/components/organisms/o-additional-top-navigation.vue';

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
    AAccountIcon,
    OAdditionalTopNavigation
  },
  data () {
    return {
      navigationItems: [
        { icon: 'list', label: '', title: 'Menu', onClick: this.goToMenu }
      ]
    }
  },
  computed: {
    ...mapGetters('user', ['isLoggedIn']),
    ...mapState({
      isMobileMenu: state => state.ui.isMobileMenu,
      isSearchPanelVisible: state => state.ui.searchpanel
    }),
    additionalTopNavigationItems () {
      return this.$store.getters['ui/additionalTopNavigationItems'];
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

 ._bottom-navigation {
    --bottom-navigation-z-index: 12;

    top: auto;
    bottom: auto;
    align-items: center;
    justify-content: space-between;
  }

  &.-additional-navigation {
    ._bottom-navigation {
      --bottom-navigation-box-shadow: none;
    }
  }

  ._additional-navigation {
    z-index: 11;
    box-shadow: 0px 2px 10px rgba(var(--c-dark-base), 0.15);
  }

  ::v-deep .sf-bottom-navigation {
    .sf-bottom-navigation-item {
      cursor: pointer;
    }
  }

  @include for-desktop() {
    display: none;
  }
}
</style>
