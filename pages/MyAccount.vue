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
      <SfContentCategory :title="$t('Personal Details')">
        <SfContentPage :title="$t('My profile')">
          <OMyAccountProfile />
        </SfContentPage>

        <SfContentPage :title="$t('Address Book')">
          <OMyAccountAddressBook />
        </SfContentPage>

        <SfContentPage :title="$t('Log out')" />
      </SfContentCategory>

      <SfContentCategory :title="$t('Order details')">
        <SfContentPage :title="$t('Order history')">
          <OMyAccountOrdersHistory />
        </SfContentPage>
      </SfContentCategory>
    </SfContentPages>
  </div>
</template>

<script>
import MyAccount from '@vue-storefront/core/pages/MyAccount';

import OMyAccountProfile from 'theme/components/organisms/o-my-account-profile';
import OMyAccountAddressBook from 'theme/components/organisms/o-my-account-address-book';
import OMyAccountOrdersHistory from 'theme/components/organisms/o-my-account-orders-history';
import { localizedRoute } from '@vue-storefront/core/lib/multistore';
import { SfBreadcrumbs, SfContentPages } from '@storefront-ui/vue';

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
      activePage: this.$t('My profile'),
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
    --content-pages-section-margin: 0 0 var(--spacer-base) 0;
    --content-pages-sidebar-category-title-font-weight: var(--font-normal);
    --content-pages-sidebar-category-title-margin: var(--spacer-xl) var(--spacer-sm) 0 var(--spacer-base);

    ._section {
      margin-bottom: var(--spacer-base);
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
