<template>
  <footer class="o-footer">
    <div class="o-footer__logo" />

    <SfFooter :column="6" :multiple="true">
      <SfFooterColumn
        v-for="linkGroup in links"
        :key="linkGroup.name"
        :title="linkGroup.name"
      >
        <SfList>
          <SfListItem v-for="link in linkGroup.children" :key="link.name">
            <router-link
              :to="localizedRoute(link.link)"
              :target="link.target"
              :event="link.event ? link.event : 'click'"
              @click.native="onLinkClick(link)"
              exact
            >
              <SfMenuItem class="sf-footer__menu-item" :label="link.name" icon="" />
            </router-link>
          </SfListItem>
        </SfList>
      </SfFooterColumn>

      <SfFooterColumn :title="$t('Contact')" class="contact-column">
        <SfList>
          <SfListItem>
            <a href="mailto:info@stuffedanimalpros.com">
              <SfMenuItem class="sf-footer__menu-item" :label="$t('info@stuffedanimalpros.com')" icon="" />
            </a>
          </SfListItem>

          <SfListItem>
            <router-link to="/contact/">
              <SfMenuItem class="sf-footer__menu-item" :label="$t('Request A Call')" icon="" />
            </router-link>
          </SfListItem>
        </SfList>
      </SfFooterColumn>

      <MBudsiesBrands />

      <div class="_copyright">
        {{ $t('Copyright {year}. Budsies PR LLC. All Rights Reserved.', {year: new Date().getFullYear()}) }}
        |

        <privacy-policy-link />

        <california-privacy-notice-link text="| California Privacy Notice" />
      </div>

      <opt-out-link />
    </SfFooter>
  </footer>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { SfFooter, SfList, SfMenuItem } from '@storefront-ui/vue';
import { ModalList } from 'theme/store/ui/modals'
import config from 'config';
import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import get from 'lodash-es/get';

import { CaliforniaPrivacyNoticeLink, OptOutLink, PrivacyPolicyLink } from 'src/modules/true-vault';

import MBudsiesBrands from '../molecules/m-budsies-brands.vue';

export default {
  name: 'OFooter',
  components: {
    CaliforniaPrivacyNoticeLink,
    OptOutLink,
    PrivacyPolicyLink,
    MBudsiesBrands,
    SfFooter,
    SfList,
    SfMenuItem
  },
  props: {
    subscribeEmail: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapGetters('user', ['isLoggedIn']),
    multistoreEnabled () {
      return get(config, 'storeViews.multistore', false);
    },
    currentLanguage () {
      const { i18n = config.i18n } = currentStoreView();
      return `${i18n.defaultCountry} / ${i18n.defaultLanguage} / ${i18n.currencyCode}`;
    },
    links () {
      return {
        company: {
          name: 'Company',
          children: [
            {
              name: this.$t('About'),
              link: '/about/'
            },
            {
              name: this.$t('Our Team'),
              link: '/team/'
            },
            {
              name: this.$t('Privacy Policy'),
              link: '/privacy-policy/'
            },
            {
              name: this.$t('Terms of Service'),
              link: '/terms-of-service/'
            }
          ]
        },
        customPlush: {
          name: this.$t('Custom Plush'),
          children: [
            { name: this.$t('Services'), link: '/stuffed-animals/' },
            { name: this.$t('Reviews'), link: '/reviews/' },
            { name: this.$t('Pricing'), link: '/custom-plush-pricing/' },
            { name: this.$t('How to Order'), link: '/how-to-order/' }
          ]
        },
        quickLinks: {
          name: this.$t('Quick Links'),
          children: [
            { name: this.$t('FAQs'), link: '/faqs/' },
            { name: this.$t('NDA'), link: '/nda/' },
            { name: this.$t('Production Times'), link: '/production-times/' },
            { name: this.$t('Shipping/Freight'), link: '/shipping/' }
          ]
        }
      };
    }
  },
  methods: {
    ...mapActions('ui', {
      openModal: 'openModal'
    }),
    showLanguageSwitcher () {
      this.openModal({ name: ModalList.LanguageSwitcher })
    },
    onLinkClick (link) {
      if (!link.clickHandler) {
        return;
      }

      link.clickHandler();
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.o-footer {
  background-color: var(--c-footer);
  padding-bottom: var(--spacer-lg);
  margin-top: calc(var(--spacer-2xl) + var(--spacer-xl));

  &__logo {
    background: url(../../assets/logo-footer.png) no-repeat;
    background-size: 100% auto;
    display: block;
    margin: -55px auto 0;
    height: 112px;
    width: 100px;
  }

  ::v-deep .sf-menu-item {
    --menu-item-font-size: var(--font-sm);
    --menu-item-label-color: var(--c-light-variant);
    --menu-item-font-family: var(--font-family-primary);

    &:hover {
      --menu-item-label-color: var(--c-light-variant);
    }
    .sf-icon {
      --icon-color: var(--c-light-variant);
    }
  }

  .sf-footer {
    --footer-width: 1272px;
    --footer-padding: 0 var(--spacer-sm);
    --footer-column-title-color: var(--c-light-variant);
    --footer-column-title-background: var(--c-footer);

    --footer-column-title-font-size: --h4-font-size;
  }

  ::v-deep .sf-footer-column__content {
    padding: 0 var(--spacer-xl);
  }

  .sf-list {
    &__item {
      --list-item-margin: var(--spacer-2xs) 0;
    }
  }

  ::v-deep .sf-chevron {
    &__bar {
      &:after {
        --chevron-color: var(--c-light-variant);
      }
    }
  }

  ._copyright {
    --privacy-notice-link-font-size: var(--font-xs);
    --privacy-notice-link-color: var(--c-light-variant);
    --privacy-notice-link-margin: 0;
    --privacy-notice-display: inline;

    --opt-out-link-font-size: var(--font-xs);
    --opt-out-link-color: var(--c-light-variant);

    // color: var(--c-light-variant);
    // font-size: var(--font-xs);
    // margin-top: var(--spacer-xs);

    a {
      color: inherit;
    }

    margin-top: var(--spacer-base);
    font-size: var(--font-xs);
    text-align: center;
    width: 100%;
  }

  @include for-desktop {
    max-width: 100%;
    ::v-deep .sf-footer-column__content {
      padding: 0;
    }

    ._additional-information {
      padding: 0;
    }
  }
}
</style>
