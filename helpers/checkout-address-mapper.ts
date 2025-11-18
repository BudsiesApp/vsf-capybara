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
): BaseAddressDetails {
  return {
    ...address,
    city: value.city,
    country: value.country,
    firstName: value.firstName,
    lastName: value.lastName,
    phoneNumber: value.phoneNumber,
    state: value.state || '',
    streetAddress: value.streetAddress,
    zipCode: value.zipCode,
    region_id: value.regionId,
    vat_id: value.vatId
  };
}
