import { ExpressCheckoutData } from 'src/modules/shared';

type ExpressCheckoutCustomerData = ExpressCheckoutData.ExpressCheckoutAuthorizedCallbackData<unknown>['customer'];

function normalizeEmail (email?: string | null): string {
  return (email || '').trim().toLowerCase();
}

export function resolveExpressCheckoutCustomerData (
  customerData: ExpressCheckoutCustomerData,
  authenticatedCustomerEmail?: string | null
): ExpressCheckoutCustomerData {
  const accountEmail = authenticatedCustomerEmail?.trim();

  if (!accountEmail) {
    return customerData;
  }

  if (normalizeEmail(customerData.emailAddress) === normalizeEmail(accountEmail)) {
    return customerData;
  }

  return {
    ...customerData,
    emailAddress: accountEmail
  };
}