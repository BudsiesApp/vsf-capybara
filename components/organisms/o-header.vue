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
          v-for="item in menuItems"
          :key="item.label"
          :class="{'-dropdown': item.isDropdown}"
        >
          <router-link v-if="item.link" class="o-header__submenu" :to="item.link">
            {{ item.label }}
          </router-link>

          <div v-else class="o-header__submenu">
            {{ item.label }}

            <div class="_submenu-dropdown" v-if="item.isDropdown">
              <div class="_dropdown-item" v-for="dropdownItem in item.dropdownItems" :key="dropdownItem.label">
                <router-link
                  :to="dropdownItem.link"
                  class="_item-link"
                >
                  {{ dropdownItem.label }}
                </router-link>
              </div>
            </div>
          </div>
        </SfHeaderNavigationItem>
      </template>
      <template #search>
        <div />
        <!-- <OSearch :class="{'desktop-only': !isSearchPanelVisible}" />
        <SfButton
          v-if="isSearchPanelVisible"
          class="sf-button--text form__action-button form__action-button--secondary mobile-only"
          @click="$store.commit('ui/setSearchpanel', false)"
        >
          {{ $t('Cancel') }}
        </SfButton> -->
      </template>
      <template #header-icons>
        <div class="sf-header__icons">
          <AAccountIcon class="sf-header__action" />
          <!-- <AMicrocartIcon class="sf-header__action" /> -->
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
import AMicrocartIcon from 'theme/components/atoms/a-microcart-icon';
import ADetailedCartIcon from 'theme/components/atoms/a-detailed-cart-icon';
import OSearch from 'theme/components/organisms/o-search';
import { mapState, mapGetters } from 'vuex';
import MMenu from 'theme/components/molecules/m-menu';
import MCtaButton from 'theme/components/molecules/m-cta-button.vue';

export default {
  name: 'OHeader',
  components: {
    SfHeader,
    ALogo,
    AAccountIcon,
    AMicrocartIcon,
    ADetailedCartIcon,
    OSearch,
    MMenu,
    SfOverlay,
    MCtaButton
  },
  data () {
    return {
      isHoveredMenu: false,
      isDropdownOpen: false,
      menuItems: [
        {
          label: this.$t('About'),
          link: '/about/'
        },
        {
          label: this.$t('Custom Plush'),
          isDropdown: true,
          dropdownItems: [
            {
              label: this.$t('Mascots'),
              link: '/mascot-stuffed-animals/'
            },
            {
              label: this.$t('Book Authors'),
              link: '/book-character-dolls/'
            },
            {
              label: this.$t('Brands & Logos'),
              link: '/branded-stuffed-animals/'
            },
            {
              label: this.$t('Non Profits'),
              link: '/non-profit-stuffed-animals/'
            },
            {
              label: this.$t('Shows & Events'),
              link: '/party-stuffed-animals/'
            },
            {
              label: this.$t('Promotional'),
              link: '/promotional-stuffed-animals/'
            },
            {
              label: this.$t('Art & Designs'),
              link: '/design-stuffed-animals/'
            },
            {
              label: this.$t('Crowdfund'),
              link: '/crowdfund-stuffed-animals/'
            }
          ]
        },
        {
          label: this.$t('Custom Pillow'),
          link: '/custom-pillows/'
        },
        {
          label: this.$t('How To Order'),
          link: '/how-to-order/'
        },
        {
          label: this.$t('Reviews'),
          link: '/reviews/'
        },
        {
          label: this.$t('Pricing'),
          link: '/custom-plush-pricing/'
        }
      ]
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
  --header-navigation-item-padding: var(--spacer-lg) var(--spacer-sm);
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
    position: relative;
    flex: unset;

    ._submenu-dropdown {
      position: absolute;
      opacity: 0;
      visibility: hidden;
      background: var(--c-primary);
      width: 100%;
      top: 100%;

      ._dropdown-item {
        padding: var(--spacer-xs) 0;

        ._item-link {
          color: var(--c-white);
        }

        &:hover {
          background-color: var(--c-light);
        }
      }
    }

    &::after {
      bottom: 0;
      width: 0;
    }

    &:hover > *:not(.sf-mega-menu) {
      --header-navigation-item-color: var(--c-white);
    }

    &:hover {
      ._submenu-dropdown {
        opacity: 1;
        visibility: visible;
      }

      &::after {
        width: 100%;
      }
    }

    &.-dropdown {
      &:hover {
        background: var(--c-primary);
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
      justify-content: flex-end;
      flex-grow: 2;
    }

    &__actions {
      justify-content: space-between;
    }
  }

  @include for-desktop {
    --header-box-shadow: 0px -2px 10px rgba(var(--c-dark-base), 0.15);

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
