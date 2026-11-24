import { getCountries, getCountryCallingCode, CountryCode } from 'libphonenumber-js';
import metadata from 'libphonenumber-js/metadata.min.json';

export interface CountryNameEntry {
  code: string;
  name: string;
}

export interface PhoneCountry {
  code: CountryCode;
  name: string;
  callingCode: string;
}

const PRIORITY_COUNTRY: CountryCode = 'US';

const MISSING_COUNTRY_NAMES: Record<string, string> = {
  AC: 'Ascension Island',
  SS: 'South Sudan',
  TA: 'Tristan da Cunha'
};

const countryNameEntries: CountryNameEntry[] = require('@vue-storefront/i18n/resource/countries.json');

const countryNames: Record<string, string> = {
  ...Object.fromEntries(countryNameEntries.map((entry) => [entry.code, entry.name])),
  ...MISSING_COUNTRY_NAMES
};

function comparePhoneCountries (first: PhoneCountry, second: PhoneCountry): number {
  if (first.code === PRIORITY_COUNTRY) {
    return -1;
  }

  if (second.code === PRIORITY_COUNTRY) {
    return 1;
  }

  return first.name.localeCompare(second.name);
}

function createPhoneCountry (code: CountryCode): PhoneCountry {
  return {
    code,
    name: countryNames[code],
    callingCode: getCountryCallingCode(code)
  };
}

export const phoneCountries: PhoneCountry[] = getCountries()
  .map(createPhoneCountry)
  .sort(comparePhoneCountries);

export function countryForCallingCode (callingCode: string, selected: CountryCode): CountryCode | undefined {
  const countries = metadata.country_calling_codes[callingCode] as CountryCode[] | undefined;

  if (countries?.includes(selected)) {
    return selected;
  }

  return countries?.[0];
}
