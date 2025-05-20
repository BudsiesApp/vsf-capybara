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
      :class="{'-show-mobile': showMobileNavigation}"
    >
      <div class="_mobile-header mobile-only">
        <SfBar
          :title="mobileTitle"
          :back="!showMobileNavigation"
          @click:back="showMobileNavigation = !showMobileNavigation"
        />
      </div>

      <nav class="_navigation">
        <SfHeading
          :title="$t('My Account')"
          :level="1"
          class="_title desktop-only"
        />

        <SfList class="_items-list">
          <SfListItem class="_menu-item -profile">
            <router-link
              :to="{name: 'my-account'}"
              @click.native="showMobileNavigation = false"
            >
              {{ $t('My profile') }}
            </router-link>

            <SfIcon
              class="mobile-only"
              icon="chevron_right"
              size="0.875rem"
            />
          </SfListItem>

          <SfListItem class="_menu-item -address-book">
            <router-link
              :to="{name: 'address-book-list'}"
              @click.native="showMobileNavigation = false"
            >
              {{ $t('Address Book') }}
            </router-link>

            <SfIcon
              class="mobile-only"
              icon="chevron_right"
              size="0.875rem"
            />
          </SfListItem>

          <SfListItem class="_menu-item -orders-history">
            <router-link
              :to="{name: 'orders-history'}"
              @click.native="showMobileNavigation = false"
            >
              {{ $t('Order History') }}
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
import { SfBar, SfBreadcrumbs, SfIcon, SfHeading, SfList } from '@storefront-ui/vue';

import MyAccount from '@vue-storefront/core/pages/MyAccount';

import { localizedRoute } from '@vue-storefront/core/lib/multistore';

export default {
  components: {
    SfBar,
    SfBreadcrumbs,
    SfIcon,
    SfHeading,
    SfList
  },
  mixins: [MyAccount],
  data () {
    return {
      showMobileNavigation: false
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
              name: 'my-account'
            }
          }
        }
      ];

      if (this.$route.name === 'orders-history') {
        breadcrumbs.push({
          text: this.$t('Order History'),
          route: {
            link: {
              name: 'orders-history'
            }
          }
        });
      }

      if (
        ['address-book-list', 'address-book-edit', 'address-book-add'].includes(this.$route.name)
      ) {
        breadcrumbs.push({
          text: this.$t('Address Book'),
          route: {
            link: {
              name: 'address-book-list'
            }
          }
        });
      }

      if (this.$route.name === 'address-book-edit') {
        breadcrumbs.push({
          text: this.$t('Edit address'),
          route: {
            link: {
              name: 'address-book-edit'
            }
          }
        });
      }

      if (this.$route.name === 'address-book-add') {
        breadcrumbs.push({
          text: this.$t('Add new address'),
          route: {
            link: {
              name: 'address-book-add'
            }
          }
        });
      }

      return breadcrumbs;
    },
    mobileTitle () {
      if (this.showMobileNavigation) {
        return this.$t('My Account');
      }

      switch (this.$route.name) {
        case 'address-book-list':
          return this.$t('Address Book');
        case 'orders-history':
          return this.$t('Order History');
        case 'my-account':
          return this.$t('My Profile');
        case 'address-book-add':
          return this.$t('Add new address');
        case 'address-book-edit':
          return this.$t('Edit address');
        default:
          return this.$t('My Account');
      }
    }
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
