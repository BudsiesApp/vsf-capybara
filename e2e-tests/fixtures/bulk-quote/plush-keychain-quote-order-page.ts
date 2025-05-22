import { PlushKeychainQuoteOrderPage } from '../../page-model/bulk-quote/plush-keychain-order';
import { testFactory as baseTestFactory } from './quote-order-page';

interface PlushKeychainQuoteOrderPageFixture {
  plushKeychainQuoteOrderPage: PlushKeychainQuoteOrderPage
}

const PAGE_SELECTOR = '#bulk-quote';

export const test = baseTestFactory(
  PlushKeychainQuoteOrderPage.PLUSH_QUOTE_ORDER_PAGE_URL,
  PAGE_SELECTOR
).extend<PlushKeychainQuoteOrderPageFixture>({
  plushKeychainQuoteOrderPage: async ({ page }, use) => {
    const plushKeychainQuoteOrderPage = new PlushKeychainQuoteOrderPage(page, PAGE_SELECTOR);
    await use(plushKeychainQuoteOrderPage);
  }
});

export { expect } from '@playwright/test';
