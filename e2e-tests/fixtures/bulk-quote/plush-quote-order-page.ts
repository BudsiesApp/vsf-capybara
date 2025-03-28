import { PlushQuoteOrderPage } from '../../page-model/bulk-qoute/plush-order';
import { testFactory as baseTestFactory } from './quote-order-page';

interface PlushQuoteOrderPageFixture {
  plushQuoteOrderPage: PlushQuoteOrderPage
}

const PAGE_SELECTOR = '#bulk-quote';

export const test = baseTestFactory(
  PlushQuoteOrderPage.PLUSH_QUOTE_ORDER_PAGE_URL,
  PAGE_SELECTOR
).extend<PlushQuoteOrderPageFixture>({
  plushQuoteOrderPage: async ({ page }, use) => {
    const pillowQuoteOrderPage = new PlushQuoteOrderPage(page, PAGE_SELECTOR);
    await use(pillowQuoteOrderPage);
  }
});

export { expect } from '@playwright/test';
