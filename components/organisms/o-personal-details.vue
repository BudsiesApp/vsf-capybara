<template>
  <div class="o-personal-details">
    <SfHeading
      :title="`${$t('Contact')}`"
      :level="3"
      class="sf-heading--left sf-heading--no-underline title"
    />

    <div class="form">
      <div
        v-if="showLoginForm"
        class="log-in form__element"
      >
        <m-login
          ref="login-form"
          :email.sync="personalDetails.emailAddress"
          :email-submit-button-text="$t('Log In/Create account')"
          @registration-required="onRegistrationRequired"
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
        :required="true"
        :valid="!$v.personalDetails.emailAddress.$error"
        :error-message="
          !$v.personalDetails.emailAddress.required
            ? $t('Field is required')
            : $t('Please provide valid e-mail address.')
        "
        @blur="$v.personalDetails.emailAddress.$touch()"
      />

      <SfInput
        v-model.trim="personalDetails.firstName"
        class="form__element form__element--half"
        :class="{[vuelidateErrorClassName]: $v.personalDetails.firstName.$error}"
        name="first-name"
        :label="$t('First name')"
        :required="true"
        :valid="!$v.personalDetails.firstName.$error"
        :error-message="$t('Field is required')"
        @blur="$v.personalDetails.firstName.$touch()"
      />
      <SfInput
        v-model.trim="personalDetails.lastName"
        class="form__element form__element--half form__element--half-even"
        :class="{[vuelidateErrorClassName]: $v.personalDetails.lastName.$error}"
        name="last-name"
        :label="$t('Last name')"
        :required="true"
        :valid="!$v.personalDetails.lastName.$error"
        :error-message="$t('Field is required')"
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
          @click="onContinueButtonClick"
        >
          {{
            $t(isVirtualCart ? "Continue to payment" : "Continue to shipping")
          }}
        </SfButton>
        <SfButton
          v-if="!currentUser"
          class="sf-button--full-width sf-button--text form__action-button form__action-button--secondary mobile-only"
          @click="login"
        >
          {{ $t('or login to your account') }}
        </SfButton>
      </div>

      <template v-if="$additionalContent.privacyPolicyAdditionalLinks">
        <component :is="linkComponent.component" :key="linkComponent.key" v-for="linkComponent in $additionalContent.privacyPolicyAdditionalLinks" />
      </template>
    </div>
  </div>
</template>
<script>
import { required, minLength, email, sameAs } from 'vuelidate/lib/validators';
import { PersonalDetails } from '@vue-storefront/core/modules/checkout/components/PersonalDetails';
import { SfInput, SfButton, SfHeading, SfCheckbox } from '@storefront-ui/vue';
import { ModalList } from 'theme/store/ui/modals'
import { mapActions } from 'vuex';

import i18n from '@vue-storefront/i18n';
import { PERSISTED_CUSTOMER_EMAIL, PERSISTED_CUSTOMER_FIRST_NAME, PERSISTED_CUSTOMER_LAST_NAME, SET_PERSISTED_CUSTOMER_EMAIL, SET_PERSISTED_CUSTOMER_FIRST_NAME, SET_PERSISTED_CUSTOMER_LAST_NAME } from 'src/modules/persisted-customer-data';
import { PrivacyPolicyLink } from 'src/modules/shared';

import { createSmoothscroll } from 'theme/helpers';
import { vuelidateErrorClassName, vuelidateScrollToFirstError } from 'theme/helpers/vuelidate-scroll-to-first-error.function';

import APromoCode from 'theme/components/atoms/a-promo-code'
import MPassword from 'theme/components/molecules/m-password'
import MLogin from 'theme/components/molecules/m-login';

export default {
  name: 'OPersonalDetails',
  components: {
    APromoCode,
    PrivacyPolicyLink,
    SfInput,
    SfButton,
    SfHeading,
    SfCheckbox,
    MPassword,
    MLogin
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
      registrationToken: ''
    }
  },
  computed: {
    showLoginForm () {
      return !this.currentUser && !this.isRegistrationRequired;
    }
  },
  beforeMount () {
    this.$bus.$on('checkout-after-load', this.fillLastUsedCustomerData)
  },
  beforeDestroy () {
    this.$bus.$off('checkout-after-load', this.fillLastUsedCustomerData)
  },
  mounted () {
    createSmoothscroll(
      document.documentElement.scrollTop || document.body.scrollTop,
      0
    );

    this.fillLastUsedCustomerData();
  },
  methods: {
    ...mapActions('ui', {
      openModal: 'openModal'
    }),
    onRegistrationRequired (token) {
      this.isRegistrationRequired = true;
      this.registrationToken = token;
    },
    login () {
      this.openModal({ name: ModalList.Auth, payload: 'login' })
    },
    async onContinueButtonClick () {
      let isInvalid = false;

      if (this.createAccount) {
        const isPasswordValid = await this.$refs.password.getIsPasswordValid();
        this.$v.$touch();
        isInvalid = this.$v.$invalid || !isPasswordValid;
      } else {
        this.$v.personalDetails.$touch();
        isInvalid = this.$v.personalDetails.$invalid;
      }

      const loginForm = this.$refs['login-form'];

      if (loginForm?.validateForm) {
        const isLoginFormValid = await loginForm.validateForm();

        if (!isLoginFormValid) {
          isInvalid = true;
        }
      }

      if (isInvalid) {
        await this.$nextTick();
        vuelidateScrollToFirstError(this.$el);
        return;
      }

      if (this.isRegistrationRequired) {
        try {
          const response = await this.$store.dispatch('user/register', {
            email: this.email,
            token: this.registrationToken,
            firstname: this.personalDetails.firstName,
            lastname: this.personalDetails.lastName
          });

          if (response.code !== 200) {
            throw new Error('Registration failed');
          } else {
            this.onSuccess(i18n.t('You are logged in!').toString());
          }
        } catch (error) {
          this.$store.dispatch('notification/spawnNotification', {
            type: 'danger',
            message: i18n.t(error),
            action1: { label: i18n.t('OK') }
          });
          return;
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
  }
};
</script>
<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.o-personal-details {
  --password-inputs-margin: 0 0 var(--spacer-sm) 0;

  .m-password {
    flex: 0 0 100%;
  }

  .california-privacy-notice-link {
    width: 100%;

    --privacy-notice-link-text-align: start;
    --privacy-notice-link-margin: 0;
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
