import BaseAddressDetails from '@vue-storefront/core/modules/checkout/types/BaseAddressDetails';

import { BaseAddressFormValue } from '../components/interfaces/base-address-form-value.interface';

export function mapCheckoutAddressToFormValue (
  address: BaseAddressDetails
): BaseAddressFormValue {
  return {
    city: address.city || '',
    country: address.country || '',
    firstName: address.firstName || '',
    lastName: address.lastName || '',
    phoneNumber: address.phoneNumber || '',
    state: address.state || null,
    streetAddress: address.streetAddress || '',
    zipCode: address.zipCode || '',
    regionId: address.region_id || null,
    vatId: address.vat_id || ''
  };
}

export function mapFormValueToCheckoutAddress (
  value: BaseAddressFormValue,
  address: BaseAddressDetails
) {
  address.city = value.city;
  address.country = value.country;
  address.firstName = value.firstName;
  address.lastName = value.lastName;
  address.phoneNumber = value.phoneNumber;
  address.state = value.state || '';
  address.streetAddress = value.streetAddress;
  address.zipCode = value.zipCode;
  address.region_id = value.regionId;
  address.vat_id = value.vatId;

  return address;
}
