import { PillowQuoteOrderPage } from '../../page-model/bulk-qoute/pillow-order';
import { testFactory as baseTestFactory } from './quote-order-page';

interface PillowQuoteOrderPageFixture {
  pillowQuoteOrderPage: PillowQuoteOrderPage
}

const PAGE_SELECTOR = '#pillow-quote';

export const test = baseTestFactory(
  PillowQuoteOrderPage.PILLOW_QUOTE_ORDER_PAGE_URL,
  PAGE_SELECTOR
).extend<PillowQuoteOrderPageFixture>({
  pillowQuoteOrderPage: async ({ page }, use) => {
    const pillowQuoteOrderPage = new PillowQuoteOrderPage(page, PAGE_SELECTOR);
    await use(pillowQuoteOrderPage);
  }
});

export { expect } from '@playwright/test';
