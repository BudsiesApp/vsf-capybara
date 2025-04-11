import { expect, testFactory } from '../../fixtures/bulk-quote/quote-order-page';

const keychainQuoteUrl = '/keychain-quote/';
const quoteTest = testFactory(keychainQuoteUrl, '#keychain-quote');

quoteTest('message form is correct', async ({ bulkQuotationPage, quoteOrderPage }) => {
  await quoteOrderPage.fillRequiredData();
  await quoteOrderPage.submitFormAndVerifyResponse();

  await bulkQuotationPage.waitPageToBeVisible();

  await bulkQuotationPage.messageFormOpenButton.click();
  await bulkQuotationPage.messageFormSubmitButton.click();
  await expect(bulkQuotationPage.messageTextareaField.error).toBeVisible();
  await bulkQuotationPage.submitQuestionAndVerifyResponse();
});
