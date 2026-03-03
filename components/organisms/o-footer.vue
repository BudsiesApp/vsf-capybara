<template>
  <div class="o-footer">
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
              <SfMenuItem
                class="sf-footer__menu-item"
                :label="link.name"
                icon=""
              />
            </router-link>
          </SfListItem>
        </SfList>
      </SfFooterColumn>

      <SfFooterColumn :title="$t('Contact')" class="contact-column">
        <SfList>
          <SfListItem>
            <a href="mailto:info@stuffedanimalpros.com" aria-label="Contact us via email">
              <SfMenuItem
                class="sf-footer__menu-item"
                :label="$t('info@stuffedanimalpros.com')"
                icon=""
              />
            </a>
          </SfListItem>

          <SfListItem>
            <router-link to="/contact/">
              <SfMenuItem
                class="sf-footer__menu-item"
                :label="$t('Request A Call')"
                icon=""
              />
            </router-link>
          </SfListItem>

          <SfListItem class="social-column">
            <div
              class="social-icon"
              v-for="item in social"
              :key="item.name + ';' + item.url"
            >
              <a
                :href="item.url"
                :aria-label="item.label"
                class="social-icon__link"
                :class="'-' + item.name"
                target="_blank"
              />
            </div>
          </SfListItem>
        </SfList>
      </SfFooterColumn>

      <MBudsiesBrands />

      <div class="_copyright">
        {{ $t('Copyright {year}. Budsies PR LLC. All Rights Reserved.', {year: new Date().getFullYear()}) }}
        |

        <privacy-policy-link />
      </div>

      <template v-if="$additionalContent.footerLinks">
        <div class="_additional-links">
          <component
            :is="linkComponent.component"
            :key="linkComponent.key"
            v-for="linkComponent in $additionalContent.footerLinks"
          />
        </div>
      </template>
    </SfFooter>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { SfFooter, SfList, SfMenuItem } from '@storefront-ui/vue';
import { ModalList } from 'theme/store/ui/modals';
import config from 'config';
import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import get from 'lodash-es/get';

import { PrivacyPolicyLink } from 'src/modules/shared';

import { socialServices } from 'theme/interfaces/social-services';

import MBudsiesBrands from '../molecules/m-budsies-brands.vue';

export default {
  name: 'OFooter',
  components: {
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
    social () {
      const { name } = currentStoreView();

      return socialServices.map((service) => {
        return {
          name: service.name,
          url: service.url,
          label: this.$t('{brand} {service} page', { brand: name, service: service.serviceLabel })
        };
      });
    },
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
            { name: this.$t('How to Order'), link: '/how-to-order/' },
            { name: this.$t('Distributors'), link: '/distributors/' }
          ]
        },
        quickLinks: {
          name: this.$t('Quick Links'),
          children: [
            { name: this.$t('FAQs'), link: '/faqs/' },
            { name: this.$t('Plush Guide 101'), link: '/plush-guide/' },
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
      this.openModal({ name: ModalList.LanguageSwitcher });
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
  $brand-icons-path: '../../assets/brands';

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

  .social-column {
    display: flex;
    gap: var(--spacer-xs);
  }

  .social-icon {
    display: flex;
    justify-content: flex-start;

    &:first-child {
      .social-icon__link {
        padding-left: 0;
        background-position-x: left;
      }
    }

    &.mobile-only {
      justify-content: center;
      padding-bottom: 0;
    }

    &__link {
      display: block;
      height: 16px;
      width: 16px;
      padding: var(--spacer-xs);
      background-size: 16px 16px;
      background-repeat: no-repeat;
      background-position: center;

      &.-facebook {
        background-image: url('#{$brand-icons-path}/facebook.svg');
      }

      &.-linkedin {
        background-image: url('#{$brand-icons-path}/linkedin.svg');
      }
    }
  }

  ._copyright {
    margin-top: var(--spacer-base);
    font-size: var(--font-xs);
    text-align: center;
    width: 100%;

    a {
      color: inherit;
    }
  }

  ._additional-links {
    --opt-out-link-font-size: var(--font-xs);
    --opt-out-link-color: var(--c-text);
    --privacy-notice-link-font-size: var(--font-xs);
    --privacy-notice-link-color: var(--c-text);
    --privacy-notice-link-margin: 0;
    --privacy-notice-display: inline;

    margin-top: var(--spacer-sm);
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    row-gap: var(--spacer-xs);
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
