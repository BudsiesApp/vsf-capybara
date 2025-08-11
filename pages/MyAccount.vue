<template>
  <div id="my-account">
    <SfBreadcrumbs class="breadcrumbs desktop-only" :breadcrumbs="breadcrumbs">
      <template #link="{breadcrumb}">
        <router-link
          :to="breadcrumb.route.link"
          class="sf-breadcrumbs__breadcrumb"
        >
          {{ breadcrumb.text }}
        </router-link>
      </template>

      <template #current="{breadcrumb}">
        <router-link
          :to="breadcrumb.route.link"
          class="sf-breadcrumbs__breadcrumb sf-breadcrumbs__breadcrumb--current"
        >
          {{ breadcrumb.text }}
        </router-link>
      </template>
    </SfBreadcrumbs>

    <div
      class="_content"
    >
      <nav class="_navigation desktop-only">
        <SfHeading
          :title="$t('My Account')"
          :level="1"
          class="_title desktop-only"
        />

        <SfList class="_items-list">
          <SfListItem
            class="_menu-item"
            :class="item.class"
            v-for="item in navigationItems"
            :key="item.title"
          >
            <router-link
              :to="item.link"
            >
              {{ item.label }}
            </router-link>

            <SfIcon
              class="mobile-only"
              icon="chevron_right"
              size="0.875rem"
            />
          </SfListItem>

          <SfListItem class="_menu-item">
            <router-link
              to="/"
              @click.native="logout"
            >
              {{ $t('Log out') }}
            </router-link>

            <SfIcon
              class="mobile-only"
              icon="chevron_right"
              size="0.875rem"
            />
          </SfListItem>
        </SfList>
      </nav>

      <router-view
        class="_page"
        :tab-title="mobileTitle"
      />
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { SfBreadcrumbs, SfIcon, SfHeading, SfList } from '@storefront-ui/vue';

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import MyAccount from '@vue-storefront/core/pages/MyAccount';
import { localizedRoute } from '@vue-storefront/core/lib/multistore';

import { AccountIconClickedEvent } from 'theme/interfaces/account-icon-clicked.event';

const RouteNames = {
  ADDRESS_BOOK_LIST: 'address-book-list',
  ADDRESS_BOOK_EDIT: 'address-book-edit',
  ADDRESS_BOOK_ADD: 'address-book-add',
  ORDERS_HISTORY: 'orders-history',
  MY_ACCOUNT: 'my-account'
}

export default {
  components: {
    SfBreadcrumbs,
    SfIcon,
    SfHeading,
    SfList
  },
  mixins: [MyAccount],
  data () {
    return {
      RouteNames,
      navigationItems: [
        {
          icon: 'shipping',
          label: 'Order History',
          link: { name: RouteNames.ORDERS_HISTORY },
          class: '-orders-history'
        },
        {
          icon: 'profile',
          label: 'Profile',
          link: { name: RouteNames.MY_ACCOUNT },
          class: '-profile'
        },
        {
          icon: 'home',
          label: 'Address Book',
          link: { name: RouteNames.ADDRESS_BOOK_LIST },
          class: '-address-book'
        }
      ]
    };
  },
  computed: {
    breadcrumbs () {
      const breadcrumbs = [
        {
          text: this.$t('Home'),
          route: {
            link: localizedRoute('/')
          }
        },
        {
          text: this.$t('My account'),
          route: {
            link: {
              name: RouteNames.MY_ACCOUNT
            }
          }
        }
      ];

      if (this.$route.name === RouteNames.ORDERS_HISTORY) {
        breadcrumbs.push({
          text: this.$t('Order history'),
          route: {
            link: {
              name: RouteNames.ORDERS_HISTORY
            }
          }
        });
      }

      if (
        [RouteNames.ADDRESS_BOOK_LIST, RouteNames.ADDRESS_BOOK_EDIT, RouteNames.ADDRESS_BOOK_ADD].includes(this.$route.name)
      ) {
        breadcrumbs.push({
          text: this.$t('Address book'),
          route: {
            link: {
              name: RouteNames.ADDRESS_BOOK_LIST
            }
          }
        });
      }

      if (this.$route.name === RouteNames.ADDRESS_BOOK_EDIT) {
        breadcrumbs.push({
          text: this.$t('Edit address'),
          route: {
            link: {
              name: RouteNames.ADDRESS_BOOK_EDIT
            }
          }
        });
      }

      if (this.$route.name === RouteNames.ADDRESS_BOOK_ADD) {
        breadcrumbs.push({
          text: this.$t('Add new address'),
          route: {
            link: {
              name: RouteNames.ADDRESS_BOOK_ADD
            }
          }
        });
      }

      return breadcrumbs;
    },
    mobileTitle () {
      switch (this.$route.name) {
        case RouteNames.ADDRESS_BOOK_LIST:
          return this.$t('Address book');
        case RouteNames.ORDERS_HISTORY:
          return this.$t('Order history');
        case RouteNames.MY_ACCOUNT:
          return this.$t('My profile');
        case RouteNames.ADDRESS_BOOK_ADD:
          return this.$t('Add new address');
        case RouteNames.ADDRESS_BOOK_EDIT:
          return this.$t('Edit address');
        default:
          return this.$t('My Account');
      }
    }
  },
  created () {
    this.$store.commit('ui/setAdditionalTopNavigationItems', this.navigationItems);
  },
  beforeMount () {
    EventBus.$on(AccountIconClickedEvent, this.onAccountButtonClicked);
  },
  beforeDestroy () {
    this.$store.commit('ui/resetAdditionalTopNavigationItems');
    EventBus.$off(AccountIconClickedEvent, this.onAccountButtonClicked);
  },
  methods: {
    async logout () {
      await this.$store.dispatch('user/logout', {});
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#my-account {
  box-sizing: border-box;

  ._content {
    display: flex;
    column-gap: var(--spacer-lg);
  }

  ._navigation {
    flex: 0 0 18.875rem;
    align-self: flex-start;
    padding: var(--spacer-lg);
    background-color: var(--c-light);

    ._title {
      --heading-text-align: start;
      --heading-title-margin: 0 0 var(--spacer-xl) 0;
      --heading-title-font-weight: var(--font-medium);
      --heading-title-font-size: var(--h3-font-size);
    }

    ._items-list {
      padding: 0;
    }

    ._menu-item {
      list-style: none;
      font-size: var(--font-base);
      margin-top: var(--spacer-base);

      a {
        color: var(--c-dark-variant);
        width: 100%;
        display: inline-block;

        &.router-link-exact-active {
          color: var(--c-primary);
        }
      }

      &.-address-book {
        a {
          &.router-link-active {
            color: var(--c-primary);
          }
        }
      }

      &:hover {
        cursor: pointer;

        a {
          color: var(--c-black);
        }
      }
    }
  }

  .breadcrumbs {
    padding: var(--spacer-base) 0;

    ::v-deep .sf-breadcrumbs__breadcrumb {
      color: var(--c-link);

      &--current {
        color: var(--c-text);
      }
    }
  }

  ._page {
    flex: 1;
  }

  @include for-mobile {
    --content-pages-section-margin: 0;
    --content-pages-sidebar-category-title-font-weight: var(--font-normal);
    --content-pages-sidebar-category-title-margin: var(--spacer-xl) var(--spacer-sm) 0 var(--spacer-base);

    --tabs-content-tab-padding: var(--spacer-base) var(--spacer-sm);

    .o-my-account-profile {
      --tabs-content-tab-padding: 0 var(--spacer-sm);
    }

    ._navigation {
      --list-item-padding: var(--spacer-sm) var(--spacer-sm) var(--spacer-sm);
      --list-item-border-width: 0 0 1px 0;

      display: none;
      width: 100%;
      background-color: var(--c-white);
      flex-basis: 100%;
      padding-left: 0;
      padding-right: 0;

      ._menu-item {
        display: flex;
        align-items: center;
        margin-top: 0;
      }
    }

    ._content {
      flex-direction: column;

      &.-show-mobile {
        ._navigation {
          display: block;
        }

        ._page {
          display: none;
        }
      }
    }
  }

  @include for-desktop {
    max-width: 1272px;
    width: 100%;
    padding: 0 var(--spacer-sm);
    margin: 0 auto;
  }
}

</style>
