import { ref, watch } from 'vue';
import { CountryCode, PhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js';

import { countryForCallingCode } from './phone-input';

export interface PhoneInputEvents {
  (event: 'input', value: string): void;
  (event: 'validity', value: boolean): void;
}

const DEFAULT_COUNTRY: CountryCode = 'US';

export function usePhoneInput (
  getValue: () => string,
  emit: PhoneInputEvents
) {
  const country = ref<CountryCode>(DEFAULT_COUNTRY);
  const text = ref('');
  let lastEmittedValue: string | null = null;

  function resolveCountry (parsed: PhoneNumber): CountryCode | undefined {
    if (parsed.country) {
      return parsed.country;
    }

    return countryForCallingCode(parsed.countryCallingCode, country.value);
  }

  function showNationalNumber (parsed: PhoneNumber): void {
    const resolvedCountry = resolveCountry(parsed);

    if (!resolvedCountry) {
      return;
    }

    country.value = resolvedCountry;
    text.value = parsed.nationalNumber;
  }

  function onValueChange (value: string): void {
    const isEcho = value === lastEmittedValue && Boolean(text.value);

    lastEmittedValue = null;

    if (isEcho) {
      return;
    }

    if (!value) {
      text.value = '';
      emit('validity', false);

      return;
    }

    const parsed = parsePhoneNumberFromString(value, country.value);

    if (!parsed) {
      return;
    }

    if (resolveCountry(parsed)) {
      showNationalNumber(parsed);
    } else {
      text.value = value;
    }

    emit('validity', parsed.isValid());
  }

  watch(getValue, onValueChange, { immediate: true });

  function update (): void {
    const isInternational = text.value.trim().startsWith('+');
    const parsed = parsePhoneNumberFromString(text.value, country.value);
    const isValid = Boolean(parsed?.isValid());

    if (isInternational && parsed?.isPossible()) {
      showNationalNumber(parsed);
    }

    lastEmittedValue = isValid && parsed ? parsed.number : '';

    emit('input', lastEmittedValue);
    emit('validity', isValid);
  }

  return {
    country,
    text,
    update
  };
}
