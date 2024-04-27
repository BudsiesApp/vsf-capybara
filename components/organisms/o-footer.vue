<template>
  <footer class="o-footer">
    <div class="o-footer__logo" />
    <div class="o-footer__slogan">
      Handmade pet keepsakes
    </div>
    <SfFooter :column="6" :multiple="true">
      <SfFooterColumn
        v-for="navigationColumn in navigationColumns"
        :key="navigationColumn.title"
        :title="navigationColumn.title"
        :class="navigationColumn.classes"
        class="_column"
        :style="{'--max-rows-count': navigationColumn.maxRows}"
      >
        <SfList class="_column-list">
          <SfListItem
            v-for="navigationItem in navigationColumn.items"
            :key="navigationItem.link_text"
          >
            <navigation-item
              :item="navigationItem"
            >
              <SfMenuItem
                class="sf-footer__menu-item"
                :label="navigationItem.link_text"
                icon=""
              />
            </navigation-item>
          </SfListItem>
        </SfList>
      </SfFooterColumn>

      <SfFooterColumn
        :title="newsletterSubscriptionColumnTitle"
        class="social-column"
      >
        <div class="_subscription-form">
          <div class="_subscription-form-title sf-footer-column__title">
            {{ newsletterSubscriptionColumnTitle }}
          </div>
          <MNewsletterSubscription />
        </div>
        <div class="social-icon desktop-only">
          <a
            v-for="item in social"
            :href="item.url"
            :key="item.name + ';' + item.url"
            class="social-icon__link"
            :class="'-' + item.name"
            target="_blank"
          />
        </div>
      </SfFooterColumn>

      <div class="social-icon mobile-only">
        <a
          v-for="item in social"
          :href="item.url"
          :key="item.name + ';' + item.url"
          class="social-icon__link"
          :class="'-' + item.name"
          target="_blank"
        />
      </div>

      <MBudsiesBrands />

      <div class="_additional-information">
        <router-link to="//support.mypetsies.com/support/home" target="_blank" exact>
          <SfMenuItem
            class="sf-footer__menu-item"
            :label="$t('Contact Us')"
            icon=""
          />
        </router-link>

        <div class="_legal-information">
          ©{{ new Date().getFullYear() }} Budsies PR LLC. All Rights Reserved.
          |
          <router-link to="/terms-of-service/" exact>
            {{ $t('Terms of Service') }}
          </router-link>
          |
          <router-link to="/privacy-policy" exact>
            {{ $t('Privacy Policy') }}
          </router-link>
        </div>
      </div>
    </SfFooter>
  </footer>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapGetters } from 'vuex';
import MNewsletterSubscription from 'theme/components/molecules/m-newsletter-subscription.vue';
import { SfFooter, SfList, SfMenuItem } from '@storefront-ui/vue';
import { ModalList } from 'theme/store/ui/modals'
import config from 'config';
import { currentStoreView } from '@vue-storefront/core/lib/multistore';
import get from 'lodash-es/get';
import { NavigationColumn } from 'src/modules/vsf-storyblok-module';

import MBudsiesBrands from '../molecules/m-budsies-brands.vue';
import NavigationItem from '../storyblok/NavigationItem.vue';

export default Vue.extend({
  name: 'OFooter',
  components: {
    MBudsiesBrands,
    MNewsletterSubscription,
    SfFooter,
    SfList,
    SfMenuItem,
    NavigationItem
  },
  props: {
    navigationColumns: {
      type: Array as PropType<NavigationColumn[]>,
      required: true
    },
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
          url: 'https://www.facebook.com/petsies/'
        },
        {
          name: 'instagram',
          url: 'https://www.instagram.com/petsies/'
        },
        {
          name: 'twitter',
          url: 'https://twitter.com/petsiesofficial/'
        },
        {
          name: 'pinterest',
          url: 'https://www.pinterest.com/petsies/'
        },
        {
          name: 'tiktok',
          url: 'https://www.tiktok.com/@mypetsies'
        }
      ]
    };
  },
  computed: {
    ...mapGetters('user', ['isLoggedIn']),
    multistoreEnabled (): boolean {
      return get(config, 'storeViews.multistore', false);
    },
    currentLanguage (): string {
      const { i18n = config.i18n } = currentStoreView();
      return `${i18n.defaultCountry} / ${i18n.defaultLanguage} / ${i18n.currencyCode}`;
    },
    newsletterSubscriptionColumnTitle (): string {
      return this.$t('Get more @Petsies cuteness').toString();
    }
  },
  methods: {
    showLanguageSwitcher () {
      this.$store.dispatch('ui/openModal', { name: ModalList.LanguageSwitcher })
    },
    onLinkClick (link) {
      if (!link.clickHandler) {
        return;
      }

      link.clickHandler();
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.o-footer {
  background-color: var(--c-footer);
  padding-bottom: var(--spacer-lg);
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
      background-image: url(../../assets/footer-socials-mobile.png);
      display: block;
      height: 30px;
      width: 30px;
      margin-right: var(--spacer-base);

      &.-facebook {
        background-position: -1px -1px;
      }

      &.-instagram {
        background-position: -30px -1px;
      }

      &.-twitter {
        background-position: -60px -1px;
      }

      &.-pinterest {
        background-position: -90px -1px;
      }

      &.-tiktok {
        background-position: -120px -1px;
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

  ._legal-information {
    color: var(--c-light-variant);
    font-size: var(--font-xs);
    margin-top: var(--spacer-xs);

    a {
      color: inherit;
    }
  }

  @include for-desktop {
    max-width: 100%;
    ::v-deep .sf-footer-column__content {
      padding: 0;
    }

    ._additional-information {
      padding: 0;
    }

    .sf-list__item {
      --list-item-margin: var(--spacer-2xs) var(--spacer-base) var(--spacer-2xs) 0;
    }

    ._column {
      --_footer-column-width: auto;
    }

    ._column-list {
      --row-height: 31px;

      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      max-height: calc(var(--max-rows-count, 9) * var(--row-height));
    }

    .social-column {
      flex-basis: 100%;

      ::v-deep {
        .sf-footer-column__title {
          display: none;
        }

        .sf-footer-column__content {
          display: flex;
          flex-direction: row-reverse;
          align-items: flex-end;
          justify-content: space-between;
          width: 100%;

          ._subscription-form {
            flex-basis: 30%;
          }

          &::after {
            content: '';
            flex-basis: 30%;
          }
        }
      }
    }

    ._subscription-form {
      ._subscription-form-title {
        display: flex;
      }
    }

    .social-icon {
      padding: var(--spacer-sm) 0 var(--spacer-base);

      &__link {
        background-image: url(../../assets/footer-socials.png);
        height: 42px;
        width: 42px;

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
      }
    }
  }
}
</style>
