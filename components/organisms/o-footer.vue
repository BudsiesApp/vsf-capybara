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
              :rel="link.target === '_blank' ? 'noopener noreferrer' : null"
              :aria-label="link.target === '_blank' ? (link.name + ' ' + $t('opens in new tab')) : null"
              :event="link.event ? link.event : 'click'"
              @click.native="onLinkClick(link)"
              exact
            >
              <SfMenuItem class="sf-footer__menu-item" :label="link.name" icon="" />
            </router-link>
          </SfListItem>
        </SfList>
      </SfFooterColumn>

      <SfFooterColumn title="Get more @Waggables cuteness" class="social-column">
        <MNewsletterSubscription />
        <div class="social-icon desktop-only">
          <a
            :href="item.url"
            v-for="item in social"
            :key="item.name + ';' + item.url"
            :aria-label="item.label"
            class="social-icon__link"
            :class="'-' + item.name"
            target="_blank"
            rel="noopener noreferrer"
          />
        </div>
      </SfFooterColumn>

      <div class="social-icon mobile-only">
        <a
          :href="item.url"
          v-for="item in social"
          :key="item.name + ';' + item.url"
          :aria-label="item.label"
          class="social-icon__link"
          :class="'-' + item.name"
          target="_blank"
          rel="noopener noreferrer"
        />
      </div>

      <MBudsiesBrands />

      <div class="_additional-information">
        <a
          href="https://support.waggables.com/"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="$t('Contact Us') + ' ' + $t('opens in new tab')"
        >
          <SfMenuItem
            class="sf-footer__menu-item"
            :label="$t('Contact Us')"
            icon=""
          />
        </a>

        <div class="_legal-information">
          ©{{ new Date().getFullYear() }} Budsies PR LLC. All Rights Reserved.
          |
          <router-link to="/terms-of-service/" exact>
            {{ $t('Terms of Service') }}
          </router-link>
          |

          <privacy-policy-link />
        </div>

        <template v-if="footerLinks.length">
          <component :is="linkComponent.component" :key="linkComponent.key" v-for="linkComponent in footerLinks" />
        </template>
      </div>
    </SfFooter>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import MNewsletterSubscription from 'theme/components/molecules/m-newsletter-subscription.vue';
import { SfFooter, SfList, SfMenuItem } from '@storefront-ui/vue';
import { ModalList } from 'theme/store/ui/modals'
import config from 'config';
import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import {
  AdditionalContentOutlet,
  useAdditionalContent
} from '@vue-storefront/core/additional-content';
import get from 'lodash-es/get';

import { PrivacyPolicyLink } from 'src/modules/shared';
import { PageName } from 'theme/pages/page-name';

import MBudsiesBrands from '../molecules/m-budsies-brands.vue';
import { socialServices } from 'theme/interfaces/social-services';

export default {
  name: 'OFooter',
  components: {
    PrivacyPolicyLink,
    MBudsiesBrands,
    MNewsletterSubscription,
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
  setup () {
    return {
      footerLinks: useAdditionalContent(
        AdditionalContentOutlet.FOOTER_LINKS
      )
    };
  },
  computed: {

    ...mapGetters('user', ['isLoggedIn']),
    social () {
      const { name } = currentStoreView();

      return socialServices.map((service) => {
        return {
          name: service.name,
          url: service.url,
          label: this.$t('{brand} {service} page', { brand: name, service: service.serviceLabel }) + ' ' + this.$t('opens in new tab')
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
        about: {
          name: 'Company',
          children: [
            {
              name: this.$t('About'),
              link: '/about/'
            },
            {
              name: this.$t('Return Policy'),
              link: '//support.waggables.com/support/solutions/folders/13000009748',
              target: '_blank'
            },
            {
              name: this.$t('Media'),
              link: '/press/'
            },
            {
              name: this.$t('FAQ\'s'),
              link: '//support.waggables.com/',
              target: '_blank'
            }
          ]
        },
        services: {
          name: this.$t('Products'),
          children: [
            { name: this.$t('Waggables'), link: { name: 'products' } },
            { name: this.$t('Gift Cards'), link: { name: 'gift-cards' } }
          ]
        },
        account: {
          name: this.$t('Account'),
          children: [
            {
              name: this.$t('My account'),
              link: { name: 'my-account' },
              event: this.isLoggedIn ? 'click' : 'false',
              clickHandler: () => {
                if (!this.isLoggedIn) {
                  if ([
                    PageName.SIGN_IN,
                    PageName.SIGN_UP
                  ].includes(this.$route.name)) {
                    return;
                  }

                  this.openModal({ name: ModalList.Auth, payload: 'login' })
                }
              }
            },
            { name: this.$t('My Cart'), link: { name: 'detailed-cart' } }
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
  padding-bottom: var(--spacer-lg);
  margin-top: calc(var(--spacer-2xl) + var(--spacer-xl));
  background-image: url(/assets/footer-grass-bg.png);
    background-size: cover;
    background-position: center 0;
    background-repeat: no-repeat;
    position: relative;
  padding-top: var(--spacer-3xl);

  &__logo {
    background-image: url(../../assets/logo-footer.png);
    background-size: 100% auto;
    display: block;
    height: 98px;
    margin: -60px auto 0;
    width: 300px;
  }
  &__slogan {
    text-align: center;
    color: var(--c-light-variant);
    font-family: var(--font-family-intro);
    font-size: var(--font-2xl);
    margin: var(--spacer-base) 0;
  }
  .m-newsletter-subscription {
    margin-top: var(--spacer-xs);
  }
  ::v-deep .sf-menu-item {
    --menu-item-font-size: var(--font-sm);
    --menu-item-label-color: var(--c-text);
    &:hover {
      --menu-item-label-color: var(--c-text);
    }
    .sf-icon {
      --icon-color: var(--c-light-variant);
    }
  }
  .sf-footer {
    --footer-width: 1272px;
    --footer-padding: 0 var(--spacer-sm);
    --footer-column-title-color: var(--c-text);
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
    flex-basis: auto;
  }
  .social-icon {
    display: flex;
    justify-content: flex-start;
    padding: var(--spacer-sm) 0;

    &.mobile-only {
      justify-content: center;
      padding-bottom: 0;
    }

    &__link {
      background-image: url(../../assets/footer-socials.png);
      background-size: 180px 30px;
      display: block;
      height: 30px;
      width: 30px;
      margin-right: var(--spacer-base);

      &.-facebook {
        background-position: 0 0;
      }

      &.-instagram {
        background-position: -30px 0;
      }

      &.-twitter {
        background-position: -60px 0;
      }

      &.-pinterest {
        background-position: -90px 0;
      }

      &.-tiktok {
        background-position: -120px 0;
      }

      &.-youtube {
        background-position: -150px 0;
      }

      &:last-child {
        margin-right: 0;
      }
    }
  }

  ._additional-information {
    align-items: center;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-top: var(--spacer-xl);
    padding: 0 var(--spacer-xl);
    text-align: center;
    width: 100%;
  }

  ._subscription-form {
    ._subscription-form-title {
      display: none;
    }
  }

  ._legal-information,
  .opt-out-link,
  .california-privacy-notice-link {
    --privacy-notice-link-font-size: var(--font-xs);
    --privacy-notice-link-color: var(--c-text);
    --privacy-notice-link-margin: 0;
    --privacy-notice-display: inline;

    --opt-out-link-font-size: var(--font-xs);
    --opt-out-link-color: var(--c-text);

    color: var(--c-text);
    font-size: var(--font-xs);
    margin-top: var(--spacer-xs);

    a {
      color: inherit;
    }
  }

  @include for-desktop {
    max-width: 100%;
    background-image: url(/assets/footer-grass-bg-large.png);
    ::v-deep .sf-footer-column__content {
      padding: 0;
    }

    ._additional-information {
      padding: 0;
    }

    &__logo {
      height: 128px;
    width: 392px;

    }

    .sf-footer {
      margin-top: var(--spacer-base);
    }

    .social-icon {
      &__link {
        background-image: url(../../assets/footer-socials.png);
        background-size: auto;
        height: 42px;
        width: 42px;

        &.-facebook {
          background-position: -1px -1px;
        }

        &.-instagram {
          background-position: -45px -1px;
        }

        &.-twitter {
          background-position: -89px -1px;
        }

        &.-pinterest {
          background-position: -133px -1px;
        }

        &.-tiktok {
          background-position: -177px -1px;
        }

        &.-youtube {
          background-position: -221px -1px;
        }
      }
    }
  }
}
</style>
