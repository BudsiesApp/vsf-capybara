import { expect, testFactory } from '../../fixtures/bulk-quote/quote-order-page';

const keychainQuoteUrl = '/keychain-quote/';
const quoteTest = testFactory(keychainQuoteUrl, '#keychain-quote');

quoteTest('quote result redesign is selectable and keeps sample submission flow', async ({ bulkQuotationPage, quoteOrderPage }) => {
  await quoteOrderPage.fillRequiredData();
  await quoteOrderPage.submitFormAndVerifyResponse();

  await bulkQuotationPage.waitPageToBeVisible();
  await bulkQuotationPage.expectDraftQuoteResultRedesign();

  if (await bulkQuotationPage.quoteRows.count() > 1) {
    await bulkQuotationPage.selectQuoteRow(1);
    await expect(bulkQuotationPage.quoteRows.nth(1)).toHaveClass(/-selected/);
  }

  await bulkQuotationPage.submitQuoteAndVerifyResponse();
});
