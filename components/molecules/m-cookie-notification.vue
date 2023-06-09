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
          <router-link
            :to="localizedRoute(detailsLink)"
            :title="detailsLinkText"
            class="cookie__message-link"
          >
            {{ detailsLinkText }}
          </router-link>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import i18n from '@vue-storefront/i18n';
import { SfIcon } from '@storefront-ui/vue';
export default {
  name: 'MCookieNotification',
  components: { SfIcon },
  props: {
    detailsLinkText: {
      type: String,
      default: i18n.t('See details')
    },
    detailsLink: {
      type: String,
      default: '/privacy'
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
  z-index: 100;
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: var(--c-dark-lighten);
  color: var(--c-light-darken);
  .cookie {
    box-sizing: border-box;
    padding: 0 calc(var(--spacer-2xl) + var(--spacer-2xs)) 0 var(--spacer-sm);
    margin: auto;
    display: flex;
    align-items: center;
    width: 1272px;
    max-width: 100%;
    height: 4.5rem;

    &__icon {
      cursor: pointer;
      --icon-color: var(--c-link);
      &:hover {
        --icon-color: var(--c-link-hover);
      }
    }

    &__message {
      margin-left: var(--spacer-sm);
      margin-top: var(--spacer-2xs);
    }
  }

  @media (min-width: 390px) {
    .cookie {
      height: 3rem;
      padding-left: var(--spacer-base);
    }
  }

  @media (min-width: $desktop-xl-min) {
    .cookie {
      padding: 0 var(--spacer-base);
    }
  }
}
</style>
