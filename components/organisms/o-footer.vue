
<template>
  <div class="o-footer">
    <SfFooter
      :column="5"
      :multiple="true"
      class="_footer"
    >
      <SfFooterColumn :title="$t('Industry Awards')" class="desktop-only">
        <div class="_awards-container">
          <BaseImage src="/assets/industry_awards.png" :width="262" alt="Four award badges: National Parenting Product Awards Winner 2016, Scholastic Parent & Child Gold Star Toy Award 2016, Toy Insider Top Summer Toy 2016, and Fun Stuff Parents' Choice Award." />

          <div class="_award-text">
            {{ $t('2017 Oppenheimer Best Toy Award') }}
          </div>
        </div>
      </SfFooterColumn>

      <SfFooterColumn :title="$t('Industry Awards')" class="mobile-only">
        <div class="_awards-container">
          <BaseImage src="/assets/industry_awards.png" :width="262" alt="Four award badges: National Parenting Product Awards Winner 2016, Scholastic Parent & Child Gold Star Toy Award 2016, Toy Insider Top Summer Toy 2016, and Fun Stuff Parents' Choice Award." />

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

      <div class="_contact-us">
        <div class="_title">
          {{ $t('Have Questions?') }}

          <span class="desktop-only">
            {{ $t('GIVE US A SHOUT!') }}
          </span>
        </div>

        <a
          class="sf-button color-secondary _contact-button"
          href="https://support.budsies.com/support/home"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ $t('Contact Us') }}
        </a>
      </div>
    </SfFooter>

    <div class="_foot">
      <div class="_shark-tank">
        {{ $t('As Seen On Shark Tank') }}
      </div>

      <p class="_copyright">
        ©{{ new Date().getFullYear() }} {{ $t('Budsies PR LLC. All Rights Reserved') }}. |
        <privacy-policy-link />
      </p>

      <template v-if="footerLinks.length">
        <div class="_additional-links">
          <component :is="linkComponent.component" :key="linkComponent.key" v-for="linkComponent in footerLinks" />
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { SfFooter, SfList, SfMenuItem, SfHeading } from '@storefront-ui/vue';
import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import {
  AdditionalContentOutlet,
  useAdditionalContent
} from '@vue-storefront/core/additional-content';

import { BaseImage } from 'src/modules/budsies';
import { PrivacyPolicyLink } from 'src/modules/shared';

import MBudsiesBrands from '../molecules/m-budsies-brands';
import { socialServices } from 'theme/interfaces/social-services';

export default {
  name: 'OFooterMinimal',
  components: {
    PrivacyPolicyLink,
    MBudsiesBrands,
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
      display: inline-block;
      margin-top: var(--spacer-sm);

      &:hover {
        --c-link-hover: var(--button-color, var(--c-light-variant));
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

  ._copyright {
    color: var(--c-footer-gray);
    font-size: var(--font-2xs);

    a {
      color: inherit;
    }
  }

  ._additional-links {
    --privacy-notice-link-font-size: var(--font-2xs);
    --privacy-notice-link-color: var(--c-footer-gray);
    --privacy-notice-link-margin: 0;
    --privacy-notice-display: inline;

    --opt-out-link-font-size: var(--font-2xs);
    --opt-out-link-color: var(--c-footer-gray);

    display: flex;
    flex-direction: column;
    margin-top: var(--spacer-sm);
    row-gap: var(--spacer-xs);
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

      ::v-deep {
        .sf-footer__container {
          justify-content: center;
          column-gap: calc(var(--spacer-2xl) * 2);
        }
      }
    }

    max-width: 100%;
    ::v-deep .sf-footer-column__content {
      padding: 0;
    }
  }
}
</style>
