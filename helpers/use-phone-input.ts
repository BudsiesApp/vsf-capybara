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

  // Switches the country and strips the calling code only for a possible number
  // with a resolvable country; otherwise the text stays as given.
  function showParsedNumber (parsed: PhoneNumber, textToKeep: string): void {
    const resolvedCountry = parsed.isPossible() ? resolveCountry(parsed) : undefined;

    if (!resolvedCountry) {
      text.value = textToKeep;

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

    showParsedNumber(parsed, value);
    emit('validity', parsed.isValid());
  }

  watch(getValue, onValueChange, { immediate: true });

  function update (): void {
    const isInternational = text.value.trim().startsWith('+');
    const parsed = parsePhoneNumberFromString(text.value, country.value);
    const isValid = Boolean(parsed?.isValid());

    if (isInternational && parsed) {
      showParsedNumber(parsed, text.value);
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
