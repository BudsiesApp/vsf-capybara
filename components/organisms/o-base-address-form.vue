<template>
  <div class="o-base-address-form">
    <validation-provider
      slim
      rules="required|min:2"
      name="'First name'"
      v-slot="{errors}"
      key="firstName"
    >
      <SfInput
        v-model="firstName"
        :ref="getFieldAnchorName('First name')"
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
      key="lastName"
    >
      <SfInput
        v-model="lastName"
        :ref="getFieldAnchorName('Last name')"
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
      name="'Country'"
      v-slot="{errors}"
      key="country"
    >
      <MMultiselect
        v-model="country"
        :ref="getFieldAnchorName('Country')"
        class="form__element form__select"
        name="country-name"
        autocomplete="country-name"
        :label="$t('Country')"
        :required="true"
        id-field="code"
        label-field="name"
        :options="countries"
        :valid="!errors.length"
        :error-message="errors[0]"
        :disabled="isFormFieldsDisabled || isCountryFieldDisabled"
        @change="onChangeCountry"
      />
    </validation-provider>

    <validation-provider
      slim
      rules="required"
      name="'Address'"
      v-slot="{errors}"
      key="streetAddress"
    >
      <MSuggestionsList
        v-model="streetAddress"
        :ref="getFieldAnchorName('Address')"
        class="form__element"
        :suggestions="autocompleteSuggestions"
        :loading="autocompleteLoading"
        :label="$t('Address')"
        :required="true"
        :disabled="isFormFieldsDisabled"
        :valid="!errors.length"
        :error-message="errors[0]"
        name="street-address"
        autocomplete="street-address"
        @input="onStreetAddressInput"
        @select="onSelectSuggestion"
      >
        <template #bottom>
          <div class="_attribution">
            <img
              alt=""
              :src="googleMapsAttributionLogo"
              class="_logo-icon"
            >
          </div>
        </template>
      </MSuggestionsList>
    </validation-provider>

    <SfInput
      v-model="apartmentNumber"
      :ref="getFieldAnchorName('Apartment')"
      class="form__element"
      name="apartment"
      autocomplete="address-line2"
      :label="$t('Apartment, suite, etc.(Optional)')"
      :disabled="isFormFieldsDisabled"
      key="apartment"
    />

    <template v-if="!isStateHidden">
      <SfInput
        v-if="!isSelectedCountryHasStates"
        key="state"
        v-model="state"
        :ref="getFieldAnchorName('State')"
        class="form__element form__element--half"
        name="address-level1"
        autocomplete="address-level1"
        :label="$t('State / Province')"
        :disabled="isFormFieldsDisabled || isStateFieldDisabled"
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
            v-model="region_id"
            :ref="getFieldAnchorName('State')"
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
            :disabled="isFormFieldsDisabled || isStateFieldDisabled"
          />
        </validation-provider>
      </div>
    </template>

    <validation-provider
      slim
      rules="required"
      name="'City'"
      key="city"
      v-slot="{errors}"
    >
      <SfInput
        v-model="city"
        :ref="getFieldAnchorName('City')"
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
      key="zipCode"
    >
      <SfInput
        v-model="zipCode"
        :ref="getFieldAnchorName('Zip Code')"
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
      key="phoneNumber"
      slim
    >
      <SfInput
        v-model="formattedPhoneNumber"
        :ref="getFieldAnchorName('Phone number')"
        :required="isPhoneNumberRequired"
        :valid="!errors.length"
        :error-message="errors[0]"
        class="form__element form__element--half"
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
        v-model.trim="vat_id"
        :ref="getFieldAnchorName('Tax ID')"
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
import { defineComponent, PropType, ref, computed, watch, nextTick } from '@vue/composition-api';
import { SfInput } from '@storefront-ui/vue';
import { parsePhoneNumberWithError } from 'libphonenumber-js';

import { stateCodeAutocompleteOptionSearch, createPhoneHelpers } from 'src/modules/shared';
import BaseAddressDetails from '@vue-storefront/core/modules/checkout/types/BaseAddressDetails';
import { useAddressAutocomplete } from 'src/modules/address/composables/use-address-autocomplete';
import { googleMapsAttributionLogo } from 'src/modules/address';
import { isStateHidden as checkIfStateHidden } from 'src/modules/address/helpers/is-state-hidden';

import MMultiselect from 'theme/components/molecules/m-multiselect.vue';
import MSuggestionsList from 'theme/components/molecules/m-suggestions-list.vue';

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

export default defineComponent({
  name: 'OBaseAddressForm',
  props: {
    value: {
      type: Object as PropType<BaseAddressDetails>,
      required: true
    },
    isFormFieldsDisabled: {
      type: Boolean,
      default: false
    },
    getFieldAnchorName: {
      type: Function as PropType<(field: string) => string>,
      required: true
    },
    isPhoneRequired: {
      type: Boolean,
      default: false
    },
    isCountryFieldDisabled: {
      type: Boolean,
      default: false
    },
    isStateFieldDisabled: {
      type: Boolean,
      default: false
    }
  },
  components: {
    SfInput,
    MMultiselect,
    MSuggestionsList,
    ValidationProvider
  },
  setup (props, { emit, refs }) {
    const states = States;
    const fZipCodeChanged = ref(false);
    const countries = Countries;
    const formattedPhoneNumber = ref('');
    const stateValidator = ref<InstanceType<typeof ValidationProvider> | undefined>(undefined);
    const phoneValidator = ref<InstanceType<typeof ValidationProvider> | undefined>(undefined);

    const updateValueField = (field: Record<string, string | number | null>): void => {
      emit('input', { ...props.value, ...field });
    };

    const city = computed<string>({
      get (): string {
        return props.value.city;
      },
      set (value: string) {
        updateValueField({ city: value });
      }
    });

    const country = computed<string>({
      get (): string {
        return props.value.country;
      },
      set (value: string) {
        updateValueField({ country: value });
      }
    });

    const firstName = computed<string>({
      get (): string {
        return props.value.firstName;
      },
      set (value: string) {
        updateValueField({ firstName: value });
      }
    });

    const lastName = computed<string>({
      get (): string {
        return props.value.lastName;
      },
      set (value: string) {
        updateValueField({ lastName: value });
      }
    });

    const phoneNumber = computed<string>({
      get (): string {
        return props.value.phoneNumber;
      },
      set (value: string) {
        updateValueField({ phoneNumber: value });
      }
    });

    const region_id = computed<number | null>({
      get (): number | null {
        return props.value.region_id
      },
      set (value: number | null) {
        updateValueField({ region_id: value });
      }
    });

    const state = computed<string>({
      get (): string {
        return props.value.state || '';
      },
      set (value: string) {
        updateValueField({ state: value || '' });
      }
    });

    const streetAddress = computed<string>({
      get (): string {
        return props.value.streetAddress;
      },
      set (value: string) {
        updateValueField({ streetAddress: value });
      }
    });

    const apartmentNumber = computed<string>({
      get (): string {
        return props.value.apartmentNumber;
      },
      set (value: string) {
        updateValueField({ apartmentNumber: value });
      }
    });

    const vat_id = computed<string>({
      get (): string {
        return props.value.vat_id;
      },
      set (value: string) {
        updateValueField({ vat_id: value });
      }
    });

    const zipCode = computed<string>({
      get (): string {
        return props.value.zipCode;
      },
      set (value: string) {
        updateValueField({ zipCode: value });
      }
    });

    const addressRef = computed<BaseAddressDetails>({
      get (): BaseAddressDetails {
        return props.value;
      },
      set (value: BaseAddressDetails) {
        emit('input', value);
      }
    });

    const {
      suggestions: autocompleteSuggestions,
      loading: autocompleteLoading,
      selectSuggestion: selectAutocompleteSuggestion,
      runSuggestionQuery
    } = useAddressAutocomplete(addressRef);

    const isPhoneNumberRequired = computed<boolean>(() => {
      return props.isPhoneRequired || (!!country.value && country.value !== unitedStatesCountryCode);
    });

    const isSelectedCountryHasStates = computed<boolean>(() => {
      if (!props.value.country || !states) {
        return false;
      }

      return states.hasOwnProperty(props.value.country);
    });

    const isStateHidden = computed<boolean>(() => {
      return checkIfStateHidden(country.value);
    });

    const phoneValidationRules = computed<any>(() => {
      return {
        required: isPhoneNumberRequired.value,
        phone: { country: country.value }
      }
    });

    const showVatIdField = computed<boolean>(() => {
      return !!country.value && country.value !== unitedStatesCountryCode;
    });

    const statesForSelectedCountry = computed<any[]>(() => {
      if (!isSelectedCountryHasStates.value) {
        return [];
      }

      return states[country.value];
    });

    const vatIdValidationRules = computed<any>(() => {
      if (!vat_id.value) {
        return {};
      }

      return {
        min: 3
      }
    });

    const onStreetAddressInput = async (value: string): Promise<void> => {
      await runSuggestionQuery(value);
    };

    const updateFormattedPhoneNumber = (phoneNumber: string): void => {
      formattedPhoneNumber.value = phoneHelpers.formatPhoneNumberForDisplay(phoneNumber, country.value);
    };

    const onPhoneNumberBlur = (): void => {
      if (!formattedPhoneNumber.value) {
        phoneNumber.value = '';
        return;
      }

      const normalizedNumber = phoneHelpers.formatPhoneNumberToE164(formattedPhoneNumber.value, country.value);

      if (normalizedNumber === phoneNumber.value) {
        updateFormattedPhoneNumber(normalizedNumber);
      }

      if (normalizedNumber) {
        phoneNumber.value = normalizedNumber;
      }
    };

    const validateCountryRelatedFields = (): void => {
      type validatorType = InstanceType<typeof ValidationProvider> | undefined;

      const stateValidatorInstance = refs.stateValidator as validatorType;
      const phoneValidatorInstance = refs.phoneValidator as validatorType;

      if (stateValidatorInstance) {
        stateValidatorInstance.validate();
      }

      if (phoneValidatorInstance) {
        phoneValidatorInstance.validate();
      }
    };

    const onChangeCountry = async (): Promise<void> => {
      if (props.isCountryFieldDisabled) {
        return;
      }

      await nextTick();
      validateCountryRelatedFields();

      state.value = '';
      region_id.value = null;
      streetAddress.value = '';

      emit('country-changed');
    };

    const onZipCodeBlur = (): void => {
      if (!fZipCodeChanged.value) {
        return;
      }

      fZipCodeChanged.value = false;

      emit('zip-code-blur');
    };

    const onAutocompleteAddressSelected = async (placeId: string | undefined): Promise<void> => {
      if (!placeId) {
        return;
      }

      try {
        await selectAutocompleteSuggestion(placeId);

        await nextTick();
        validateCountryRelatedFields();

        emit('address-autocompleted');
      } catch (error) {
        console.error('Error selecting autocomplete suggestion:', error);
      }
    };

    const onSelectSuggestion = async (placeId: string): Promise<void> => {
      if (!placeId) return;

      await onAutocompleteAddressSelected(placeId);
    };

    watch(phoneNumber, (value: string) => {
      updateFormattedPhoneNumber(value);
    }, { immediate: true });

    watch(isSelectedCountryHasStates, (val) => {
      if (val) {
        state.value = '';
        return;
      }

      region_id.value = null;
    }, { immediate: true });

    watch(isStateHidden, (hidden) => {
      if (hidden) {
        state.value = '';
        region_id.value = null;
      }
    });

    watch(showVatIdField, (value) => {
      if (!value) {
        vat_id.value = '';
      }
    });

    watch(zipCode, () => {
      fZipCodeChanged.value = true;
    }, { immediate: true });

    return {
      states,
      fZipCodeChanged,
      countries,
      formattedPhoneNumber,
      stateValidator,
      phoneValidator,
      autocompleteSuggestions,
      autocompleteLoading,
      selectAutocompleteSuggestion,
      isPhoneNumberRequired,
      isSelectedCountryHasStates,
      isStateHidden,
      phoneValidationRules,
      city,
      country,
      firstName,
      lastName,
      phoneNumber,
      region_id,
      state,
      streetAddress,
      apartmentNumber,
      vat_id,
      zipCode,
      showVatIdField,
      statesForSelectedCountry,
      vatIdValidationRules,
      stateCodeAutocompleteOptionSearch,
      onStreetAddressInput,
      onSelectSuggestion,
      onPhoneNumberBlur,
      onChangeCountry,
      onZipCodeBlur,
      onAutocompleteAddressSelected,
      runSuggestionQuery,
      validateCountryRelatedFields,
      updateValueField,
      updateFormattedPhoneNumber,
      googleMapsAttributionLogo
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.o-base-address-form {
  --multiselect-margin: 0;

  .form__element {
    margin: 0 0 var(--spacer-sm) 0;
  }

  ._attribution {
    width: 100%;
    background-color: var(--c-white);
    padding: var(--spacer-xs);
    display: flex;
    align-items: center;
  }

  @include for-desktop {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: var(--spacer-xl);

    .form__element {
      flex: 0 0 100%;

      &.form__element--half {
        flex: 1 1 40%;
      }
    }
  }
}
</style>
