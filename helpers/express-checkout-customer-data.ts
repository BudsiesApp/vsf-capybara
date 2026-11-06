import { ExpressCheckoutData } from 'src/modules/shared';

type ExpressCheckoutCustomerData = ExpressCheckoutData.ExpressCheckoutAuthorizedCallbackData<unknown>['customer'];

function normalizeEmail (email?: string | null): string {
  return (email || '').trim().toLowerCase();
}

export function resolveExpressCheckoutCustomerData (
  customerData: ExpressCheckoutCustomerData,
  persistedCustomerEmail?: string | null
): ExpressCheckoutCustomerData {
  const customerEmail = persistedCustomerEmail?.trim();

  if (!customerEmail) {
    return customerData;
  }

  if (normalizeEmail(customerData.emailAddress) === normalizeEmail(customerEmail)) {
    return customerData;
  }

  return {
    ...customerData,
    emailAddress: customerEmail
  };
}