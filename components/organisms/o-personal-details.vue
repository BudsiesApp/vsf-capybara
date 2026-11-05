<template>
  <div class="o-personal-details">
    <SfHeading
      ref="heading"
      :title="`${$t('Contact')}`"
      :level="3"
      class="sf-heading--left sf-heading--no-underline title"
      tabindex="-1"
    />

    <div class="form">
      <div
        v-if="showLoginForm"
        class="log-in form__element"
      >
        <m-login
          ref="login-form"
          class="login-form"
          :allow-cancel="true"
          :email.sync="personalDetails.emailAddress"
          :email-submit-button-text="$t('Log In/Create account')"
          @is-submitting-changed="onLoginFormIsSubmittingChanged"
          @otp-submitted="resetPostAuthRedirectPath"
          @otp-requested="onOtpRequested"
          @registration-required="onRegistrationRequired"
          @cancelled="onLoginCancelled"
        >
          <template #submit-button="{ isDisabled, submitButtonText }">
            <SfButton
              type="submit"
              :disabled="isDisabled"
              class="log-in__button color-secondary"
            >
              {{ submitButtonText }}
            </SfButton>
          </template>
        </m-login>
      </div>

      <SfInput
        v-else
        v-model.trim="personalDetails.emailAddress"
        class="form__element"
        :class="{[vuelidateErrorClassName]: $v.personalDetails.emailAddress.$error}"
        name="email-address"
        :disabled="true"
        :label="$t('Email address')"
        autocomplete="email"
        :required="true"
        :valid="!$v.personalDetails.emailAddress.$error"
        :error-message="
          !$v.personalDetails.emailAddress.required
            ? $t('Field is required')
            : $t('Please, provide the correct email address')
        "
        @blur="$v.personalDetails.emailAddress.$touch()"
      />

      <SfInput
        v-model.trim="personalDetails.firstName"
        class="form__element form__element--half"
        :class="{[vuelidateErrorClassName]: $v.personalDetails.firstName.$error}"
        name="first-name"
        :label="$t('First name')"
        autocomplete="given-name"
        :required="true"
        :valid="!$v.personalDetails.firstName.$error"
        :error-message="$t('Field is required')"
        :disabled="isFormDisabled"
        @blur="$v.personalDetails.firstName.$touch()"
      />
      <SfInput
        v-model.trim="personalDetails.lastName"
        class="form__element form__element--half form__element--half-even"
        :class="{[vuelidateErrorClassName]: $v.personalDetails.lastName.$error}"
        name="last-name"
        :label="$t('Last name')"
        autocomplete="family-name"
        :required="true"
        :valid="!$v.personalDetails.lastName.$error"
        :error-message="$t('Field is required')"
        :disabled="isFormDisabled"
        @blur="$v.personalDetails.lastName.$touch()"
      />

      <APromoCode :allow-promo-code-removal="false" class="mobile-only">
        <template #title>
          <SfHeading
            :title="$t('Discount code')"
            :level="3"
            class="sf-heading--left"
          />
        </template>
      </APromoCode>
      <div class="form__action">
        <SfButton
          class="_continue-button sf-button--full-width form__action-button"
          :disabled="isFormDisabled"
          @click="onContinueButtonClick"
        >
          {{
            $t(isVirtualCart ? "Continue to payment" : "Continue to shipping")
          }}
        </SfButton>
      </div>

      <template v-if="privacyPolicyLinks.length">
        <component :is="linkComponent.component" :key="linkComponent.key" v-for="linkComponent in privacyPolicyLinks" />
      </template>
    </div>
  </div>
</template>

<script>
import { useRoute } from '@vue-storefront/core/application-services';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import { defineComponent } from 'vue';
import { required, minLength, email, sameAs } from 'vuelidate/lib/validators';
import { PersonalDetails } from '@vue-storefront/core/modules/checkout/components/PersonalDetails';
import { SfInput, SfButton, SfHeading, SfCheckbox } from '@storefront-ui/vue';
import { ModalList } from 'theme/store/ui/modals'
import { mapActions } from 'vuex';

import i18n from '@vue-storefront/i18n';
import {
  AdditionalContentOutlet,
  useAdditionalContent
} from '@vue-storefront/core/additional-content';
import { PERSISTED_CUSTOMER_EMAIL, PERSISTED_CUSTOMER_FIRST_NAME, PERSISTED_CUSTOMER_LAST_NAME, SET_PERSISTED_CUSTOMER_EMAIL, SET_PERSISTED_CUSTOMER_FIRST_NAME, SET_PERSISTED_CUSTOMER_LAST_NAME } from 'src/modules/persisted-customer-data';
import { PrivacyPolicyLink } from 'src/modules/shared';

import { createSmoothscroll } from 'theme/helpers';
import { vuelidateErrorClassName, vuelidateScrollToFirstError } from 'theme/helpers/vuelidate-scroll-to-first-error.function';
import { useAuthorizationRouteRestoration } from 'theme/helpers/use-authorization-route-restoration';

import APromoCode from 'theme/components/atoms/a-promo-code'
import MLogin from 'theme/components/molecules/m-login';

export default defineComponent({
  name: 'OPersonalDetails',
  components: {
    APromoCode,
    PrivacyPolicyLink,
    SfInput,
    SfButton,
    SfHeading,
    SfCheckbox,
    MLogin
  },
  setup (_, context) {
    const currentRoute = useRoute();
    const { persistPostAuthRedirectPath, resetPostAuthRedirectPath } = useAuthorizationRouteRestoration();

    function onOtpRequested () {
      persistPostAuthRedirectPath(currentRoute.fullPath);
    }

    return {
      onOtpRequested,
      privacyPolicyLinks: useAdditionalContent(
        AdditionalContentOutlet.PRIVACY_POLICY_LINKS
      ),
      resetPostAuthRedirectPath
    }
  },
  mixins: [PersonalDetails],
  validations: {
    personalDetails: {
      firstName: {
        required,
        minLength: minLength(2)
      },
      lastName: {
        required
      },
      emailAddress: {
        required,
        email
      }
    },
    acceptConditions: {
      sameAs: sameAs(() => true)
    }
  },
  data () {
    return {
      vuelidateErrorClassName,
      isRegistrationRequired: false,
      registrationToken: '',
      isRegistrationInProgress: false,
      isLoginFormSubmitting: false
    }
  },
  computed: {
    showLoginForm () {
      return !this.currentUser && !this.isRegistrationRequired;
    },
    isFormDisabled () {
      return this.isRegistrationInProgress || this.isLoginFormSubmitting;
    }
  },
  beforeMount () {
    EventBus.$on('checkout-after-load', this.fillLastUsedCustomerData)
  },
  beforeDestroy () {
    EventBus.$off('checkout-after-load', this.fillLastUsedCustomerData)
  },
  mounted () {
    createSmoothscroll(
      document.documentElement.scrollTop || document.body.scrollTop,
      0
    );

    this.$refs.heading.$el.focus();
    this.fillLastUsedCustomerData();
  },
  methods: {
    ...mapActions('ui', {
      openModal: 'openModal'
    }),
    onLoginFormIsSubmittingChanged (value) {
      this.isLoginFormSubmitting = value;
    },
    onRegistrationRequired (token) {
      this.isRegistrationRequired = true;
      this.registrationToken = token;
    },
    onLoginCancelled () {
      this.isRegistrationRequired = false;
      this.registrationToken = '';
      this.isLoginFormSubmitting = false;
    },
    login () {
      this.openModal({ name: ModalList.Auth, payload: 'login' })
    },
    async onContinueButtonClick () {
      let isInvalid = false;

      this.$v.personalDetails.$touch();
      isInvalid = this.$v.personalDetails.$invalid;

      const loginForm = this.$refs['login-form'];

      if (loginForm?.validateAndGoToFirstError) {
        const isLoginFormValid = await loginForm.validateAndGoToFirstError();

        if (!isLoginFormValid) {
          return;
        }
      }

      if (isInvalid) {
        await this.$nextTick();
        vuelidateScrollToFirstError(this.$el);
        return;
      }

      if (this.isRegistrationRequired) {
        if (this.isRegistrationInProgress) {
          return;
        }

        try {
          this.isRegistrationInProgress = true;
          const response = await this.$store.dispatch('user/register', {
            email: this.personalDetails.emailAddress,
            token: this.registrationToken,
            firstname: this.personalDetails.firstName,
            lastname: this.personalDetails.lastName
          });

          if (response.code !== 200) {
            throw new Error('Registration failed');
          } else {
            this.$store.dispatch('notification/spawnNotification', {
              type: 'success',
              message: i18n.t('Successfully logged in!'),
              action1: { label: i18n.t('OK') }
            });
          }
        } catch (error) {
          this.$store.dispatch('notification/spawnNotification', {
            type: 'danger',
            message: i18n.t(error),
            action1: { label: i18n.t('OK') }
          });
          return;
        } finally {
          this.isRegistrationInProgress = false;
        }
      }

      this.$store.commit(
        SET_PERSISTED_CUSTOMER_EMAIL,
        this.personalDetails.emailAddress
      );

      this.$store.commit(
        SET_PERSISTED_CUSTOMER_FIRST_NAME,
        this.personalDetails.firstName
      );

      this.$store.commit(
        SET_PERSISTED_CUSTOMER_LAST_NAME,
        this.personalDetails.lastName
      );

      this.sendDataToCheckout();
    },
    fillLastUsedCustomerData () {
      const customerEmail = this.$store
        .getters[PERSISTED_CUSTOMER_EMAIL];
      const customerFirstName = this.$store
        .getters[PERSISTED_CUSTOMER_FIRST_NAME];
      const customerLastName = this.$store
        .getters[PERSISTED_CUSTOMER_LAST_NAME];

      if (customerEmail && !this.personalDetails.emailAddress) {
        this.personalDetails.emailAddress = customerEmail;
      }

      if (customerFirstName && !this.personalDetails.firstName) {
        this.personalDetails.firstName = customerFirstName;
      }

      if (customerLastName && !this.personalDetails.lastName) {
        this.personalDetails.lastName = customerLastName;
      }
    }
  },
  watch: {
    currentUser (newValue) {
      if (newValue) {
        this.isRegistrationRequired = false;
        this.isLoginFormSubmitting = false;
      }
    }
  }
});
</script>
<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.o-personal-details {
  .california-privacy-notice-link {
    width: 100%;

    --privacy-notice-link-text-align: start;
    --privacy-notice-link-margin: 0;
  }

  .login-form {
    --m-login-buttons-justify-content: flex-end;
    --m-login-buttons-resend-justify-content: flex-end;
    --m-login-buttons-direction: row-reverse;

    margin-bottom: var(--spacer-sm);
  }
}

.title {
  --heading-padding: var(--spacer-base) 0;
  @include for-desktop {
    --heading-padding: var(--spacer-xl) 0 var(--spacer-base) 0;
  }
}
.log-in {
  &__info {
    color: var(--c-dark-variant);
    font: var(--font-light) var(--font-base) / 1.6 var(--font-family-primary);
    @include for-desktop {
      font-weight: var(--font-normal);
      font-size: var(--font-sm);
      margin: var(--spacer-lg) 0;
    }
  }
}

.a-promo-code {
  margin-top: var(--spacer-xl);
}

.form {
  &__action {
    margin: var(--spacer-sm) 0;
    &-button {
      &:first-child {
        --button-height: 4.0625rem;
      }
      &--secondary {
        margin: var(--spacer-base) 0;
      }
    }
  }

  &__element {
      margin: 0 0 var(--spacer-sm) 0;
  }
  @include for-mobile {
    &__checkbox {
      --checkbox-font-family: var(--font-family-primary);
      --checkbox-font-weight: var(--font-light);
      --checkbox-font-size: var(--font-sm);
    }
  }
  @include for-desktop {
    margin: 0 var(--spacer-2xl) 0 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    &__element {
      flex: 0 0 100%;
      &--half {
        flex: 1 1 50%;
        &-even {
          padding: 0 0 0 var(--spacer-lg);
        }
      }
    }
  }
}
</style>
