<template>
  <footer class="o-footer">
    <SfFooter :column="5" :multiple="true" class="_footer">
      <SfFooterColumn :title="$t('Industry Awards')" class="desktop-only">
        <div class="_awards-container">
          <BaseImage src="/assets/industry_awards.png" :width="262" />

          <div class="_award-text">
            {{ $t('2017 Oppenheimer Best Toy Award') }}
          </div>
        </div>
      </SfFooterColumn>

      <SfFooterColumn
        class="_links-column"
        :title="$t('Quick Links')"
      >
        <SfList class="_links-list">
          <SfListItem v-for="link in links" :key="link.name">
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

      <SfFooterColumn :title="$t('Industry Awards')" class="mobile-only">
        <div class="_awards-container">
          <BaseImage src="/assets/industry_awards.png" :width="262" />

          <div class="_award-text">
            {{ $t('2017 Oppenheimer Best Toy Award') }}
          </div>
        </div>
      </SfFooterColumn>

      <SfFooterColumn :title="$t('Social')" class="social-column desktop-only">
        <div class="social-icon">
          <a
            :href="item.url"
            v-for="item in social"
            :key="item.name + ';' + item.url"
            class="social-icon__link"
            :class="'-' + item.name"
            target="_blank"
          />
        </div>
      </SfFooterColumn>

      <div class="social-icon mobile-only">
        <a
          :href="item.url"
          v-for="item in social"
          :key="item.name + ';' + item.url"
          class="social-icon__link"
          :class="'-' + item.name"
          target="_blank"
        />
      </div>

      <div class="_contact-us">
        <div class="_title">
          {{ $t('Have Questions?') }}

          <span class="desktop-only">
            {{ $t('GIVE US A SHOUT!') }}
          </span>
        </div>

        <SfButton class="color-secondary _contact-button">
          <a href="http://support.budsies.com/" target="_blank">
            {{ $t('Contact Us') }}
          </a>
        </SfButton>
      </div>
    </SfFooter>

    <div class="_foot">
      <div class="_shark-tank">
        {{ $t('As Seen On Shark Tank') }}
      </div>

      <p class="_copyright">
        © 2023 {{ $t('Budsies PR LLC. All Rights Reserved') }}. |
        <router-link to="//privacy.budsies.com/privacy-policy" target="_blank">
          {{ $t('Privacy Policy') }}
        </router-link>

        <a class="truevault-polaris-privacy-notice" target="_blank" href="https://privacy.budsies.com/privacy-policy#california-privacy-notice" noreferrer noopener hidden> | California Privacy Notice</a>
      </p>

      <a
        v-show="isMounted"
        :class="privacyChoicesClass"
        href="https://privacy.budsies.com/opt-out"
        noreferrer
        noopener
        hidden
      >
        <img src="https://polaris.truevaultcdn.com/static/assets/icons/optout-icon-blue.svg"
             alt="California Consumer Privacy Act (CCPA) Opt-Out Icon"
             style="vertical-align:middle" height="14px"
        >
        Your Privacy Choices
      </a>
    </div>
  </footer>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { SfButton, SfFooter, SfList, SfMenuItem, SfHeading } from '@storefront-ui/vue';
import { ModalList } from 'theme/store/ui/modals'
import config from 'config';
import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import get from 'lodash-es/get';

import { BaseImage } from 'src/modules/budsies';

export default {
  name: 'OFooter',
  components: {
    SfButton,
    SfFooter,
    SfList,
    SfMenuItem,
    BaseImage,
    SfHeading
  },
  props: {
    subscribeEmail: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      social: [
        {
          name: 'facebook',
          url: 'https://www.facebook.com/budsies/'
        },
        {
          name: 'twitter',
          url: 'http://twitter.com/budsiestoys'
        },
        {
          name: 'linkedin',
          url: 'https://www.linkedin.com/company/budsies'
        },
        {
          name: 'instagram',
          url: 'http://instagram.com/budsies'
        },
        {
          name: 'tiktok',
          url: 'https://www.tiktok.com/@budsies'
        }
      ],
      isMounted: false
    };
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
      return [
        {
          name: this.$t('Budsies'),
          link: '/budsies-services/'
        },
        {
          name: this.$t('Selfies'),
          link: '/selfies-services/'
        },
        {
          name: this.$t('Puppets'),
          link: '/custom-puppets/'
        },
        {
          name: this.$t('OC Commissions'),
          link: '/commissions/'
        },
        {
          name: this.$t('Buddy Pillows'),
          link: '/buddy-pillows/'
        },
        {
          name: this.$t('Photo Pillows'),
          link: '/photo-pillows/'
        },
        {
          name: this.$t('Custom Socks'),
          link: {
            name: 'printed-socks-creation-page'
          }
        },
        {
          name: this.$t('Cartoon Pillows'),
          link: '/plushie/index/cartoonPillows/'
        },
        {
          name: this.$t('Custom Keychains'),
          link: {
            name: 'printed-keychains-creation-page'
          }
        },
        {
          name: this.$t('Bobbleheads & Figurines'),
          link: '/bobblehead-figurines/'
        },
        {
          name: this.$t('Pajamas'),
          link: '/pajamas/index/create/'
        },
        {
          name: this.$t('Shirts'),
          link: '/custom-shirts/'
        },
        {
          name: this.$t('Blankets'),
          link: {
            name: 'cut-out-blankets'
          }
        },
        {
          name: this.$t('Gift Cards'),
          link: '/purchase-gift-card/'
        },
        {
          name: this.$t('Giving Back'),
          link: '/giving-back-stuffed-toys/'
        },
        {
          name: this.$t('Accessories'),
          link: '/accessories/'
        },
        {
          name: this.$t('Gallery'),
          link: '/reviews/'
        },
        {
          name: this.$t('FAQ\'s'),
          link: '//support.budsies.com/',
          target: '_blank'
        },
        {
          name: this.$t('Drawing Templates'),
          link: '/inspiration/',
          target: '_blank'
        },
        {
          name: this.$t('About Us'),
          link: '/about/'
        },
        {
          name: this.$t('Terms of Service'),
          link: '/terms-of-service/'
        },
        {
          name: this.$t('Blog'),
          link: '/blog/',
          target: '_blank'
        },
        {
          name: this.$t('How It Works'),
          link: '/how-we-create-plush-toys-from-art/'
        },
        {
          name: this.$t('Newsletter'),
          link: '/newsletter/'
        }
      ];
    },
    privacyChoicesClass () {
      const classes = ['_copyright'];

      if (this.isMounted) {
        classes.push('truevault-polaris-optout');
      }

      return classes;
    }
  },
  async mounted () {
    await this.$nextTick();
    this.isMounted = true;
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
  $brand-icons-path: '../../assets/brands';

  background-color: var(--c-footer);
  // padding-bottom: var(--spacer-lg);
  margin-top: calc(var(--spacer-2xl) + var(--spacer-xl));
  &__logo {
    background-image: url(../../assets/logo-footer.png);
    height: 121px;
    margin: -60px auto 0;
    width: 127px;
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
    --menu-item-label-color: var(--c-light-variant);
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

  ._award-text {
    font-size: var(--font-2xs);
    font-weight: 100;
    margin: var(--spacer-xs) 0;
    text-transform: none;
    color: var(--c-white);
    text-align: center;
  }

  ._awards-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  ._links-list {
    column-count: 1;
  }

  ._contact-us {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: var(--spacer-xl);
    width: 100%;

    ._contact-button {
      margin-top: var(--spacer-sm);

      a {
        color: inherit;
      }
    }
  }

  ._title {
    color: var(--c-white);
    font-weight: 500;
    text-transform: uppercase;
  }

  ._foot {
    text-align: center;
    text-transform: uppercase;
    padding-bottom: var(--spacer-2xl);
  }

  ._shark-tank {
    background: var(--c-blue);
    color: var(--c-white);
    display: inline-block;
    font-size: var(--font-sm);
    font-weight: bold;
    transform: translateY(-50%);
    z-index: 2;
    padding: var(--spacer-xs) var(--spacer-lg);
  }

  .social-column {
    flex-basis: auto;
  }

  ._copyright,
  .truevault-polaris-privacy-notice:not([hidden]) {
    color: var(--c-footer-gray);
    font-size: var(--font-2xs);

    a {
      color: inherit;
    }
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
      display: block;
      height: 16px;
      width: 16px;
      margin-right: var(--spacer-base);
      background-repeat: no-repeat;

      &.-facebook {
        background-image: url('#{$brand-icons-path}/facebook.svg');
      }

      &.-google-plus {
        background-image: url('#{$brand-icons-path}/google-plus.svg');
      }

      &.-instagram {
        background-image: url('#{$brand-icons-path}/instagram.svg');
      }

      &.-linkedin {
        background-image: url('#{$brand-icons-path}/linkedin.svg');
      }

      &.-tiktok {
        background-image: url('#{$brand-icons-path}/tiktok.svg');
      }

      &.-twitter {
        background-image: url('#{$brand-icons-path}/twitter.svg');
      }

      &:last-child {
        margin-right: 0;
      }
    }
  }

  .sf-footer {
    background-image: url(../../assets/footer-bg-mobile.png);
    background-size: cover;
    background-position: center 0;
    background-repeat: no-repeat;
    padding: 90px 0 50px;
    position: relative;

    &:before {
      background: url(../../assets/footer-barbaron.png) no-repeat 0 0;
      background-size: 44px 70px;
      height: 70px;
      width: 44px;
      content: "";
      position: absolute;
      right: 2px;
      top: -43px;
    }
  }

  @include for-desktop {
    ._links-column,
    .social-column {
      margin-left: var(--spacer-sm);
    }

    ._links-column {
      flex-grow: 1;
      max-width: 35rem;
    }

    ._links-list {
      column-count: 3;
    }
    .sf-footer {
      background-image: url(../../assets/footer-bg.png);
      padding: 225px 0 100px;

      &:before {
          background-size: auto;
          height: 278px;
          width: 173px;
      }
    }

    max-width: 100%;
    ::v-deep .sf-footer-column__content {
      padding: 0;
    }
  }
}
</style>
