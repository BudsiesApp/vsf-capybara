<template>
  <div id="my-account">
    <SfBreadcrumbs class="breadcrumbs desktop-only" :breadcrumbs="breadcrumbs">
      <template #link="{breadcrumb}">
        <router-link :to="breadcrumb.route.link" class="sf-breadcrumbs__breadcrumb">
          {{ breadcrumb.text }}
        </router-link>
      </template>
    </SfBreadcrumbs>

    <SfContentPages
      :title="$t('My Account')"
      :active="activePage"
      class="my-account"
      @click:change="changeActivePage"
    >
      <SfContentPage class="_personal-details" :title="$t('My profile')">
        <OMyAccountProfile />
      </SfContentPage>

      <SfContentPage class="_tab-content" :title="$t('Address Book')">
        <OMyAccountAddressBook />
      </SfContentPage>

      <SfContentPage class="_tab-content" :title="$t('Order history')">
        <OMyAccountOrdersHistory />
      </SfContentPage>

      <SfContentPage :title="$t('Log out')" />
    </SfContentPages>
  </div>
</template>

<script>
import { SfBreadcrumbs, SfContentPages } from '@storefront-ui/vue';
import { mapMobileObserver, unMapMobileObserver } from '@storefront-ui/vue/src/utilities/mobile-observer';

import MyAccount from '@vue-storefront/core/pages/MyAccount';

import OMyAccountProfile from 'theme/components/organisms/o-my-account-profile';
import OMyAccountAddressBook from 'theme/components/organisms/o-my-account-address-book';
import OMyAccountOrdersHistory from 'theme/components/organisms/o-my-account-orders-history';
import { localizedRoute } from '@vue-storefront/core/lib/multistore';

const DEFAULT_ACTIVE_PAGE = 'My profile';

export default {
  components: {
    SfBreadcrumbs,
    SfContentPages,
    OMyAccountProfile,
    OMyAccountAddressBook,
    OMyAccountOrdersHistory
  },
  mixins: [MyAccount],
  data () {
    return {
      activePage: '',
      breadcrumbs: [
        {
          text: this.$t('Home'),
          route: {
            link: localizedRoute('/')
          }
        },
        {
          text: this.$t('My account'),
          route: {
            link: localizedRoute('/my-account')
          }
        }
      ]
    };
  },
  mounted () {
    if (this.isMobile) {
      return;
    }

    this.activePage = this.$t(DEFAULT_ACTIVE_PAGE).toString();
  },
  computed: {
    ...mapMobileObserver()
  },
  beforeDestroy () {
    unMapMobileObserver();
  },
  methods: {
    changeActivePage (title) {
      if (title === 'Log out') {
        this.logout();
        return;
      }
      this.activePage = title;
    },
    async logout () {
      await this.$store.dispatch('user/logout', {});
      this.$router.push(this.localizedRoute('/'));
    }
  },
  watch: {
    isMobile () {
      if (!this.isMobile && !this.activePage) {
        this.activePage = this.$t(DEFAULT_ACTIVE_PAGE).toString();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#my-account {
  box-sizing: border-box;

  @include for-desktop {
    max-width: 1272px;
    width: 100%;
    padding: 0 var(--spacer-sm);
    margin: 0 auto;
  }
}
.my-account {
  --content-pages-height: auto;

  ::v-deep {
    .sf-content-pages__content,
    .sf-content-pages__sidebar {
      height: min-content;
    }
  }

  @include for-mobile {
    --content-pages-section-margin: 0;
    --content-pages-sidebar-category-title-font-weight: var(--font-normal);
    --content-pages-sidebar-category-title-margin: var(--spacer-xl) var(--spacer-sm) 0 var(--spacer-base);

    ._tab-content {
      --tabs-content-tab-padding: var(--spacer-base) var(--spacer-sm);
    }

    ._personal-details {
      --tabs-content-tab-padding: 0 var(--spacer-sm);
    }
  }

  @include for-desktop {
    --content-pages-sidebar-category-title-margin: var(--spacer-xl) 0 0 0;
  }
}
.breadcrumbs {
  padding: var(--spacer-base) 0;
}
</style>
