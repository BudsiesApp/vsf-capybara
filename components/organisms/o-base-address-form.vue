<template>
  <div class="o-base-address-form form">
    <SfInput
      v-model.trim="firstName"
      class="form__element form__element--half"
      name="first-name"
      :label="$t('First name')"
      :required="true"
      :disabled="isFormFieldsDisabled"
      :valid="!$v.firstName || !$v.firstName.$error"
      :error-message="
        !$v.firstName || !$v.firstName.required
          ? $t('Field is required')
          : $t('Name must have at least 2 letters.')
      "
      @blur="() => $v.firstName && $v.firstName.$touch()"
    />

    <SfInput
      v-model.trim="lastName"
      class="form__element form__element--half form__element--half-even"
      name="last-name"
      :label="$t('Last name')"
      :required="true"
      :disabled="isFormFieldsDisabled"
      :valid="!$v.lastName || !$v.lastName.$error"
      :error-message="$t('Field is required')"
      @blur="() => $v.lastName && $v.lastName.$touch()"
    />

    <SfInput
      v-model.trim="streetAddress"
      class="form__element"
      name="street-address"
      :label="$t('Address')"
      :required="true"
      :disabled="isFormFieldsDisabled"
      :valid="!$v.streetAddress || !$v.streetAddress.$error"
      :error-message="$t('Field is required')"
      @blur="() => $v.streetAddress && $v.streetAddress.$touch()"
    />

    <SfInput
      v-model.trim="city"
      class="form__element form__element--half"
      name="city"
      :label="$t('City')"
      :required="true"
      :disabled="isFormFieldsDisabled"
      :valid="!$v.city || !$v.city.$error"
      :error-message="$t('Field is required')"
      @blur="() => $v.city && $v.city.$touch()"
    />

    <SfInput
      v-if="!isSelectedCountryHasStates"
      v-model.trim="state"
      class="form__element form__element--half form__element--half-even"
      name="state"
      :label="$t('State / Province')"
      :disabled="isFormFieldsDisabled"
    />

    <MMultiselect
      v-if="isSelectedCountryHasStates && canShowStateSelector"
      v-model.trim="state"
      class="form__element form__element--half form__element--half-even form__select"
      name="state"
      :label="$t('State / Province')"
      :required="true"
      id-field="code"
      label-field="name"
      :options="statesForSelectedCountry"
      :valid="!$v.state || !$v.state.$error"
      :error-message="$t('Field is required')"
      :disabled="isFormFieldsDisabled"
    />

    <SfInput
      v-model.trim="zipCode"
      class="form__element form__element--half"
      name="zipCode"
      :label="$t('Zip-code')"
      :required="true"
      :disabled="isFormFieldsDisabled"
      :valid="!$v.zipCode || !$v.zipCode.$error"
      :error-message="
        !$v.zipCode || !$v.zipCode.required
          ? $t('Field is required')
          : $t('Zip code must have at least 3 letters.')
      "
      @blur="onZipCodeBlur"
    />

    <MMultiselect
      v-model="country"
      class="form__element form__element--half form__element--half-even form__select"
      name="countries"
      :label="$t('Country')"
      :required="true"
      id-field="code"
      label-field="name"
      :options="countries"
      :valid="!$v.country || !$v.country.$error"
      :error-message="$t('Field is required')"
      :disabled="isFormFieldsDisabled"
      @change="onChangeCountry"
    />

    <SfInput
      v-model.trim="phoneNumber"
      :required="isPhoneNumberRequired"
      :valid="!$v.phoneNumber || !$v.phoneNumber.$error"
      :error-message="$t('Field is required')"
      class="form__element"
      name="phone"
      :label="$t('Phone number')"
      :disabled="isFormFieldsDisabled"
      @blur="() => $v.phoneNumber && $v.phoneNumber.$touch()"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { required, requiredIf, minLength } from 'vuelidate/lib/validators';
import { SfInput } from '@storefront-ui/vue';
import { unicodeAlpha, unicodeAlphaNum } from '@vue-storefront/core/helpers/validators';

import MMultiselect from 'theme/components/molecules/m-multiselect.vue';

const Countries = require('@vue-storefront/i18n/resource/countries.json');
const States = require('@vue-storefront/i18n/resource/states.json');

export default Vue.extend({
  name: 'OBaseAddressForm',
  props: {
    value: {
      type: Object,
      required: true
    },
    isFormFieldsDisabled: {
      type: Boolean,
      default: false
    }
  },
  components: {
    SfInput,
    MMultiselect
  },
  data () {
    return {
      states: States,
      fCanShowStateSelector: true,
      fZipCodeChanged: false,
      countries: Countries
    }
  },
  computed: {
    canShowStateSelector (): boolean {
      return this.fCanShowStateSelector
    },
    isPhoneNumberRequired (): boolean {
      return !!this.country && this.country !== 'US';
    },
    isSelectedCountryHasStates () {
      if (!this.value.country || !this.states) {
        return false;
      }

      return this.states.hasOwnProperty(this.value.country);
    },
    city: {
      get (): string {
        return this.value.city;
      },
      set (value: string) {
        this.updateValueField({ city: value });
      }
    },
    country: {
      get (): string {
        return this.value.country;
      },
      set (value: string) {
        this.updateValueField({ country: value });
      }
    },
    firstName: {
      get (): string {
        return this.value.firstName;
      },
      set (value: string) {
        this.updateValueField({ firstName: value });
      }
    },
    lastName: {
      get (): string {
        return this.value.lastName;
      },
      set (value: string) {
        this.updateValueField({ lastName: value });
      }
    },
    phoneNumber: {
      get (): string {
        return this.value.phoneNumber;
      },
      set (value: string) {
        this.updateValueField({ phoneNumber: value });
      }
    },
    state: {
      get (): string {
        return this.value.state;
      },
      set (value: string) {
        this.updateValueField({ state: value });
      }
    },
    streetAddress: {
      get (): string {
        return this.value.streetAddress;
      },
      set (value: string) {
        this.updateValueField({ streetAddress: value });
      }
    },
    zipCode: {
      get (): string {
        return this.value.zipCode;
      },
      set (value: string) {
        this.updateValueField({ zipCode: value });
      }
    },
    statesForSelectedCountry (): any[] {
      if (!this.isSelectedCountryHasStates) {
        return [];
      }

      return this.states[this.country];
    }
  },
  methods: {
    async onChangeCountry (): Promise<void> {
      await this.$nextTick();
      this.validateCountryRelatedFields();
      this.$emit('country-changed');
    },
    onZipCodeBlur (): void {
      if (!this.$v.zipCode || !this.$v.country) {
        return;
      }

      this.$v.zipCode.$touch();

      if (!this.fZipCodeChanged) {
        return;
      }

      if (this.$v.country.$invalid) {
        return;
      }

      if (this.$v.zipCode.$invalid) {
        return;
      }

      this.fZipCodeChanged = false;

      this.$emit('zip-code-blur');
    },
    validateCountryRelatedFields (): void {
      if (this.$v.state) {
        this.$v.state.$touch();
      }

      if (this.$v.phoneNumber) {
        this.$v.phoneNumber.$touch();
      }
    },
    updateValueField (field: Record<string, string>): void {
      this.$emit('input', { ...this.value, ...field });
    }
  },
  watch: {
    country: {
      handler (after, before) {
        this.fCanShowStateSelector = false;

        if (after && before) {
          this.state = '';
        }

        this.$nextTick(() => {
          this.fCanShowStateSelector = true;
        })
      },
      immediate: true
    },
    zipCode: {
      handler () {
        this.fZipCodeChanged = true;
      },
      immediate: true
    },
    '$v.$invalid': {
      handler (value: boolean) {
        this.$emit('validation-state-change', !value);
      },
      immediate: true
    }
  },
  validations () {
    const isSelectedCountryHasStates = () => this.isSelectedCountryHasStates;
    const isPhoneNumberRequired = () => this.isPhoneNumberRequired;

    return {
      firstName: {
        required,
        minLength: minLength(2),
        unicodeAlpha
      },
      lastName: {
        required,
        unicodeAlpha
      },
      country: {
        required
      },
      state: {
        required: requiredIf(isSelectedCountryHasStates)
      },
      streetAddress: {
        required,
        unicodeAlphaNum
      },
      zipCode: {
        required,
        minLength: minLength(3),
        unicodeAlphaNum
      },
      city: {
        required,
        unicodeAlpha
      },
      phoneNumber: {
        required: requiredIf(isPhoneNumberRequired)
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.form {
  &__element {
      margin: 0 0 var(--spacer-sm) 0;
  }

  @include for-desktop {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    &__element {
      flex: 0 0 100%;

      &--half {
        flex: 1 1 50%;

        &-even {
          padding: 0 0 0 var(--spacer-xl);
        }
      }
    }
  }
}
</style>
