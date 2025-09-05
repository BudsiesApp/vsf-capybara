<template>
  <div class="o-base-address-form form">
    <validation-provider
      slim
      rules="required|min:2"
      name="'First name'"
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
      name="'Last name'"
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
      name="'Address'"
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
      name="'Country'"
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
      key="state"
      v-model="state"
      class="form__element form__element--half"
      name="address-level1"
      autocomplete="address-level1"
      :label="$t('State / Province')"
      :disabled="isFormFieldsDisabled"
    />

    <div
      class="form__element form__element--half form__select"
      key="stateMultiselect"
      v-else
    >
      <validation-provider
        slim
        rules="required"
        name="'State'"
        ref="stateValidator"
        v-slot="{errors}"
      >
        <MMultiselect
          v-model="regionId"
          name="address-level1"
          autocomplete="address-level1"
          :autocomplete-value-search="stateCodeAutocompleteOptionSearch"
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
    </div>

    <validation-provider
      slim
      rules="required"
      name="'City'"
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
      name="'Zip Code'"
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
      name="'Phone number'"
      ref="phoneValidator"
      slim
    >
      <SfInput
        v-model="formattedPhoneNumber"
        :required="isPhoneNumberRequired"
        :valid="!errors.length"
        :error-message="errors[0]"
        class="form__element"
        :class="{ 'form__element--half': showVatIdField }"
        name="phone"
        autocomplete="tel"
        :label="$t('Phone number')"
        :disabled="isFormFieldsDisabled"
        @blur="onPhoneNumberBlur"
      />
    </validation-provider>

    <validation-provider
      v-slot="{ errors }"
      :rules="vatIdValidationRules"
      key="taxId"
      name="'Tax ID'"
      v-if="showVatIdField"
      tag="div"
      class="form__element form__element--half"
    >
      <SfInput
        v-model.trim="vatId"
        name="vat_id"
        :label="$t('Tax ID')"
        :disabled="isFormFieldsDisabled"
        :valid="!errors.length"
        :error-message="errors[0]"
      />
    </validation-provider>
  </div>
</template>

<script lang="ts">
import { extend, ValidationProvider } from 'vee-validate';
import { min, required } from 'vee-validate/dist/rules';
import Vue, { PropType } from 'vue';
import { SfInput } from '@storefront-ui/vue';
import { parsePhoneNumberWithError } from 'libphonenumber-js';

import { stateCodeAutocompleteOptionSearch, createPhoneHelpers } from 'src/modules/shared';
import { BaseAddressFormValue } from 'theme/components/interfaces/base-address-form-value.interface';

import MMultiselect from 'theme/components/molecules/m-multiselect.vue';

const Countries = require('@vue-storefront/i18n/resource/countries.json');
const States = require('@vue-storefront/i18n/resource/states.json');

const unitedStatesCountryCode = 'US';
const phoneHelpers = createPhoneHelpers(parsePhoneNumberWithError);

extend('required', {
  ...required,
  message: 'Field is required'
});
extend('min', {
  ...min,
  message: 'Field must have at least {length} characters'
});
extend('phone', {
  params: ['country'],
  validate (value, { country }: Record<string, any>) {
    return phoneHelpers.isValidPhoneNumber(value, country);
  },
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
      fZipCodeChanged: false,
      countries: Countries,
      formattedPhoneNumber: ''
    }
  },
  computed: {
    isPhoneNumberRequired (): boolean {
      return !!this.country && this.country !== unitedStatesCountryCode;
    },
    isSelectedCountryHasStates (): boolean {
      if (!this.value.country || !this.states) {
        return false;
      }

      return this.states.hasOwnProperty(this.value.country);
    },
    phoneValidationRules (): any {
      return {
        required: this.isPhoneNumberRequired,
        phone: { country: this.country }
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
    vatId: {
      get (): string {
        return this.value.vatId;
      },
      set (value: string) {
        this.updateValueField({ vatId: value });
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
    showVatIdField (): boolean {
      return !!this.country && this.country !== unitedStatesCountryCode;
    },
    statesForSelectedCountry (): any[] {
      if (!this.isSelectedCountryHasStates) {
        return [];
      }

      return this.states[this.country];
    },
    vatIdValidationRules (): any {
      if (!this.vatId) {
        return {};
      }

      return {
        min: 3
      }
    }
  },
  methods: {
    stateCodeAutocompleteOptionSearch,
    onPhoneNumberBlur (): void {
      if (!this.formattedPhoneNumber) {
        this.phoneNumber = '';
        return;
      }

      const normalizedNumber = phoneHelpers.formatPhoneNumberToE164(this.formattedPhoneNumber, this.country);

      if (normalizedNumber === this.phoneNumber) {
        this.updateFormattedPhoneNumber(normalizedNumber);
      }

      if (normalizedNumber) {
        this.phoneNumber = normalizedNumber;
      }
    },
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
    },
    updateFormattedPhoneNumber (phoneNumber: string): void {
      this.formattedPhoneNumber = phoneHelpers.formatPhoneNumberForDisplay(phoneNumber, this.country);
    }
  },
  watch: {
    country: {
      handler (after, before) {
        if (after && before && after !== before) {
          this.state = null;
          this.regionId = null;
        }
      },
      immediate: true
    },
    phoneNumber: {
      handler (value: string) {
        this.updateFormattedPhoneNumber(value);
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
    showVatIdField (value) {
      if (!value) {
        this.vatId = '';
      }
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
