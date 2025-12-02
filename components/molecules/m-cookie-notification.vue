<template>
  <transition name="fade" appear>
    <div v-show="isOpen" class="m-cookie-notification">
      <div class="cookie">
        <div class="cookie__icon">
          <SfIcon
            icon="cross"
            size="xxs"
            @click="accept"
          />
        </div>

        <div class="cookie__message">
          {{ message }}

          <privacy-policy-link
            class="cookie__message-link"
            :text="detailsLinkText"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import i18n from '@vue-storefront/i18n';
import { SfIcon } from '@storefront-ui/vue';

import { extractCookieValue } from '@vue-storefront/core/helpers';
import { DETECTED_COUNTRY_COOKIE_KEY, EU_COUNTRY_CODES, PrivacyPolicyLink } from 'src/modules/shared';

export default {
  name: 'MCookieNotification',
  components: { SfIcon, PrivacyPolicyLink },
  props: {
    detailsLinkText: {
      type: String,
      default: i18n.t('See details').toString()
    },
    message: {
      type: String,
      default: i18n.t('We use cookies to give you the best shopping experience.')
    }
  },
  data () {
    return {
      isOpen: false
    };
  },
  beforeMount () {
    const detectedCountry = extractCookieValue(DETECTED_COUNTRY_COOKIE_KEY, document.cookie);

    // if (detectedCountry === 'US') {
    //   this.isOpen = false;
    //   return;
    // }

    this.$store
      .dispatch('claims/check', {
        claimCode: 'cookiesAccepted'
      })
      .then(cookieClaim => {
        if (!cookieClaim) {
          this.isOpen = true;
          this.$store.dispatch('claims/set', {
            claimCode: 'cookiesAccepted',
            value: false
          });
        } else {
          this.isOpen = !cookieClaim.value;
        }
      });
  },
  methods: {
    accept () {
      this.isOpen = false;
      this.$store.dispatch('claims/set', {
        claimCode: 'cookiesAccepted',
        value: true
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.m-cookie-notification {
  z-index: 99999999999;
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: var(--c-dark-lighten);
  color: var(--c-light-darken);
  .cookie {
    box-sizing: border-box;
    padding: var(--spacer-xs) calc(var(--spacer-2xl) + var(--spacer-2xs)) var(--spacer-xs) var(--spacer-sm);
    margin: auto;
    display: flex;
    align-items: center;
    width: 1272px;
    max-width: 100%;

    &__icon {
      cursor: pointer;
      --icon-color: var(--c-link);
      &:hover {
        --icon-color: var(--c-link-hover);
      }
    }

    &__message {
      margin-left: var(--spacer-sm);
    }
  }

  @media (min-width: 390px) {
    .cookie {
      padding-left: var(--spacer-base);
    }
  }

  @media (min-width: $tablet-min) {
    .cookie {
      padding-top: var(--spacer-sm);
      padding-bottom: var(--spacer-sm);
    }
  }

  @media (min-width: $desktop-xl-min) {
    .cookie {
      padding: var(--spacer-sm) var(--spacer-base);
    }
  }
}
</style>
