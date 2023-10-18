<template>
  <div class="o-personal-details">
    <SfHeading
      :title="`${$t('Contact')}`"
      :level="3"
      class="sf-heading--left sf-heading--no-underline title"
    />

    <div v-if="!currentUser" class="log-in desktop-only">
      <SfButton class="log-in__button color-secondary" @click="login">
        {{ $t('Log in to your account') }}
      </SfButton>
      <p class="log-in__info">
        {{ $t('or fill the details below') }}:
      </p>
    </div>
    <div class="form">
      <SfInput
        v-model.trim="personalDetails.firstName"
        class="form__element form__element--half"
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
        name="last-name"
        :label="$t('Last name')"
        :required="true"
        :valid="!$v.personalDetails.lastName.$error"
        :error-message="$t('Field is required')"
        @blur="$v.personalDetails.lastName.$touch()"
      />
      <SfInput
        v-model.trim="personalDetails.emailAddress"
        class="form__element"
        name="email-address"
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
      <template v-if="!currentUser">
        <div class="form__element">
          <SfCheckbox
            v-model="createAccount"
            :label="$t('I want to create an account')"
            class="form__checkbox"
            name="createAccount"
          />
        </div>
        <template v-if="createAccount">
          <m-password ref="password" v-model="passwordData" />

          <div class="form__element form__group">
            <SfCheckbox
              v-model="acceptConditions"
              class="form__checkbox"
              name="acceptConditions"
              :required="true"
              @blur="$v.acceptConditions.$touch()"
            >
              <template #label>
                <span class="sf-checkbox__label">
                  {{ $t('I accept') }}

                  <router-link
                    target="_blank"
                    to="/terms-of-service/"
                  >
                    {{ $t('Terms of Service') }}
                  </router-link>

                  <span>
                    {{ $t('and') }}
                  </span>

                  <router-link
                    target="_blank"
                    to="/privacy-policy/"
                  >
                    {{ $t('Privacy Policy') }}
                  </router-link>
                </span>
              </template>
            </SfCheckbox>
          </div>
        </template>
      </template>
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
          class="sf-button--full-width form__action-button"
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
    </div>
  </div>
</template>
<script>
import { required, minLength, email } from 'vuelidate/lib/validators';
import { PersonalDetails } from '@vue-storefront/core/modules/checkout/components/PersonalDetails';
import { SfInput, SfButton, SfHeading, SfCheckbox } from '@storefront-ui/vue';
import { ModalList } from 'theme/store/ui/modals'
import { mapActions } from 'vuex';

import { LAST_USED_CUSTOMER_EMAIL, LAST_USED_CUSTOMER_FIRST_NAME, LAST_USED_CUSTOMER_LAST_NAME, SET_LAST_USED_CUSTOMER_EMAIL, SET_LAST_USED_CUSTOMER_FIRST_NAME, SET_LAST_USED_CUSTOMER_LAST_NAME, SN_PERSISTED_CUSTOMER_DATA } from 'src/modules/persisted-customer-data';

import { createSmoothscroll } from 'theme/helpers';

import APromoCode from 'theme/components/atoms/a-promo-code'
import MPassword from 'theme/components/molecules/m-password'

export default {
  name: 'OPersonalDetails',
  components: {
    APromoCode,
    SfInput,
    SfButton,
    SfHeading,
    SfCheckbox,
    MPassword
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
      required
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

      if (isInvalid) return;

      this.$store.commit(
        `${SN_PERSISTED_CUSTOMER_DATA}/${SET_LAST_USED_CUSTOMER_EMAIL}`,
        this.personalDetails.emailAddress
      );

      this.$store.commit(
        `${SN_PERSISTED_CUSTOMER_DATA}/${SET_LAST_USED_CUSTOMER_FIRST_NAME}`,
        this.personalDetails.firstName
      );

      this.$store.commit(
        `${SN_PERSISTED_CUSTOMER_DATA}/${SET_LAST_USED_CUSTOMER_LAST_NAME}`,
        this.personalDetails.lastName
      );

      this.sendDataToCheckout();
    },
    fillLastUsedCustomerData () {
      const customerEmail = this.$store
        .getters[`${SN_PERSISTED_CUSTOMER_DATA}/${LAST_USED_CUSTOMER_EMAIL}`];
      const customerFirstName = this.$store
        .getters[`${SN_PERSISTED_CUSTOMER_DATA}/${LAST_USED_CUSTOMER_FIRST_NAME}`];
      const customerLastName = this.$store
        .getters[`${SN_PERSISTED_CUSTOMER_DATA}/${LAST_USED_CUSTOMER_LAST_NAME}`];

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
