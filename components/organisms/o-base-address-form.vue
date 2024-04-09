<template>
  <div class="o-base-address-form form">
    <validation-provider
      slim
      rules="required|min:2"
      v-slot="{errors}"
    >
      <SfInput
        v-model="firstName"
        class="form__element form__element--half"
        name="first-name"
        autocomplete="given-name"
        :label="$t('First name')"
        :required="true"
        :disabled="isFormFieldsDisabled"
        :valid="!errors.length"
        :error-message="errors[0]"
      />
    </validation-provider>

    <validation-provider
      slim
      rules="required"
      v-slot="{errors}"
    >
      <SfInput
        v-model="lastName"
        class="form__element form__element--half"
        name="last-name"
        autocomplete="family-name"
        :label="$t('Last name')"
        :required="true"
        :disabled="isFormFieldsDisabled"
        :valid="!errors.length"
        :error-message="errors[0]"
      />
    </validation-provider>

    <validation-provider
      slim
      rules="required"
      v-slot="{errors}"
    >
      <SfInput
        v-model="streetAddress"
        class="form__element"
        name="street-address"
        autocomplete="street-address"
        :label="$t('Address')"
        :required="true"
        :disabled="isFormFieldsDisabled"
        :valid="!errors.length"
        :error-message="errors[0]"
      />
    </validation-provider>

    <validation-provider
      slim
      rules="required"
      v-slot="{errors}"
    >
      <MMultiselect
        v-model="country"
        class="form__element form__element--half form__select"
        name="country-name"
        autocomplete="country-name"
        :label="$t('Country')"
        :required="true"
        id-field="code"
        label-field="name"
        :options="countries"
        :valid="!errors.length"
        :error-message="errors[0]"
        :disabled="isFormFieldsDisabled"
        @change="onChangeCountry"
      />
    </validation-provider>

    <SfInput
      v-if="!isSelectedCountryHasStates"
      v-model="state"
      class="form__element form__element--half"
      name="address-level1"
      autocomplete="address-level1"
      :label="$t('State / Province')"
      :disabled="isFormFieldsDisabled"
    />

    <validation-provider
      slim
      rules="required"
      ref="stateValidator"
      v-slot="{errors}"
      v-if="isSelectedCountryHasStates && canShowStateSelector"
    >
      <MMultiselect
        v-model="regionId"
        class="form__element form__element--half form__select"
        name="address-level1"
        autocomplete="address-level1"
        :label="$t('State / Province')"
        :required="true"
        id-field="id"
        label-field="name"
        :options="statesForSelectedCountry"
        :valid="!errors.length"
        :error-message="errors[0]"
        :disabled="isFormFieldsDisabled"
      />
    </validation-provider>

    <validation-provider
      slim
      rules="required"
      v-slot="{errors}"
    >
      <SfInput
        v-model="city"
        class="form__element form__element--half"
        name="city"
        autocomplete="address-level2"
        :label="$t('City')"
        :required="true"
        :disabled="isFormFieldsDisabled"
        :valid="!errors.length"
        :error-message="errors[0]"
      />
    </validation-provider>

    <validation-provider
      slim
      rules="required|min:3"
      v-slot="{errors}"
    >
      <SfInput
        v-model="zipCode"
        class="form__element form__element--half"
        name="zipCode"
        autocomplete="postal-code"
        :label="$t('Zip-code')"
        :required="true"
        :disabled="isFormFieldsDisabled"
        :valid="!errors.length"
        :error-message="errors[0]"
        @blur="onZipCodeBlur"
      />
    </validation-provider>

    <validation-provider
      v-slot="{ errors }"
      :rules="phoneValidationRules"
      ref="phoneValidator"
      slim
    >
      <SfInput
        v-model="phoneNumber"
        :required="isPhoneNumberRequired"
        :valid="!errors.length"
        :error-message="errors[0]"
        class="form__element"
        name="phone"
        autocomplete="tel"
        :label="$t('Phone number')"
        :disabled="isFormFieldsDisabled"
      />
    </validation-provider>
  </div>
</template>

<script lang="ts">
import { extend, ValidationProvider } from 'vee-validate';
import { min, regex, required } from 'vee-validate/dist/rules';
import Vue, { PropType } from 'vue';
import { SfInput } from '@storefront-ui/vue';

import { BaseAddressFormValue } from 'theme/components/interfaces/base-address-form-value.interface';

import MMultiselect from 'theme/components/molecules/m-multiselect.vue';

const Countries = require('@vue-storefront/i18n/resource/countries.json');
const States = require('@vue-storefront/i18n/resource/states.json');

const phoneValidationRegex = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;

extend('required', {
  ...required,
  message: 'Field is required'
});
extend('min', min);
extend('regex', {
  ...regex,
  message: 'Please, enter valid phone number'
});

export default Vue.extend({
  name: 'OBaseAddressForm',
  props: {
    value: {
      type: Object as PropType<BaseAddressFormValue>,
      required: true
    },
    isFormFieldsDisabled: {
      type: Boolean,
      default: false
    }
  },
  components: {
    SfInput,
    MMultiselect,
    ValidationProvider
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
    phoneValidationRules (): any {
      return {
        required: this.isPhoneNumberRequired,
        regex: phoneValidationRegex
      }
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
    regionId: {
      get (): number | null {
        return this.value.regionId
      },
      set (value: number | null) {
        this.updateValueField({ regionId: value });
      }
    },
    state: {
      get (): string | null {
        return this.value.state;
      },
      set (value: string | null) {
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
      if (!this.fZipCodeChanged) {
        return;
      }

      this.fZipCodeChanged = false;

      this.$emit('zip-code-blur');
    },
    validateCountryRelatedFields (): void {
      type validatorType = InstanceType<typeof ValidationProvider> | undefined;

      const stateValidator = this.$refs.stateValidator as validatorType;
      const phoneValidator = this.$refs.phoneValidator as validatorType;

      if (stateValidator) {
        stateValidator.validate();
      }

      if (phoneValidator) {
        phoneValidator.validate();
      }
    },
    updateValueField (field: Record<string, string | number | null>): void {
      this.$emit('input', { ...this.value, ...field });
    }
  },
  watch: {
    country: {
      handler (after, before) {
        this.fCanShowStateSelector = false;

        if (after && before) {
          this.state = null;
          this.regionId = null;
        }

        this.$nextTick(() => {
          this.fCanShowStateSelector = true;
        })
      },
      immediate: true
    },
    isSelectedCountryHasStates: {
      handler (val) {
        if (val) {
          this.state = null;
          return;
        }

        (this.regionId as any) = null;
      },
      immediate: true
    },
    zipCode: {
      handler () {
        this.fZipCodeChanged = true;
      },
      immediate: true
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
    column-gap: var(--spacer-xl);

    &__element {
      flex: 0 0 100%;

      &--half {
        flex: 1 1 40%;
      }
    }
  }
}
</style>
