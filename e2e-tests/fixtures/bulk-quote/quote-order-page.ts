import { test as baseTest } from '@playwright/test';

import { BulkQuotationPage } from '../../page-model/bulk-quote/bulk-quotation';
import { CartPage } from '../../page-model/cart/cart';
import { QuoteOrderPage } from '../../page-model/bulk-quote/quote-order';

interface QuoteOrderPageFixture {
  bulkQuotationPage: BulkQuotationPage,
  quoteOrderPage: QuoteOrderPage,
  cartPage: CartPage
}

export const testFactory = (pageUrl: string, pageSelector: string) => {
  return baseTest.extend<QuoteOrderPageFixture>({
    bulkQuotationPage: async ({ page }, use) => {
      const bulkQuotationPage = new BulkQuotationPage(page);
      await use(bulkQuotationPage);
    },
    quoteOrderPage: async ({ page }, use) => {
      const quoteOrderPage = new QuoteOrderPage(page, pageSelector);
      await page.goto(pageUrl);
      await quoteOrderPage.waitPageToBeVisible();
      await use(quoteOrderPage);
    },
    cartPage: async ({ page }, use) => {
      const cartPage = new CartPage(page);
      await use(cartPage);
    }
  });
}

export { expect } from '@playwright/test';
