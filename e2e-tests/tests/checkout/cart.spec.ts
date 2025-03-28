import { mergeTests } from '@playwright/test';

import { expect, test as cartTest } from '../../fixtures/cart-page';
import { testFactory } from '../../fixtures/bulk-quote/quote-order-page';

const keychainQuoteUrl = '/keychain-quote/';

const quoteTest = testFactory(keychainQuoteUrl, '#keychain-quote');
const test = mergeTests(quoteTest, cartTest);

test(
  'buttons are disabled when item is removing',
  async ({ bulkQuotationPage, cartPage, quoteOrderPage }) => {
    test.setTimeout(60_000);

    await quoteOrderPage.fillRequiredData();
    await quoteOrderPage.submitFormAndVerifyResponse();
    await bulkQuotationPage.waitPageToBeVisible();
    await bulkQuotationPage.submitQuoteAndVerifyResponse();

    await quoteOrderPage.page.goto(keychainQuoteUrl);
    await quoteOrderPage.fillRequiredData();
    await quoteOrderPage.submitFormAndVerifyResponse();
    await bulkQuotationPage.waitPageToBeVisible();
    await bulkQuotationPage.submitQuoteAndVerifyResponse();

    await cartPage.goto();
    await cartPage.waitPageToBeVisible();

    await expect(cartPage.cartItems).toHaveCount(2);
    const deleteResponse = cartPage.waitForDeleteResponse();
    await cartPage.removeCartItemWithDelay(cartPage.cartItems.first(), 500);
    await expect(cartPage.cartItems).toHaveCount(1);

    for (const cartItem of await cartPage.cartItems.all()) {
      await expect(cartItem.locator('button:has-text("Remove")')).toBeDisabled();
      const editButton = cartItem.locator('button:has-text("Edit")');

      if (await editButton.isVisible()) {
        await expect(cartItem.locator('button:has-text("Edit")')).toBeDisabled();
      }
    }

    const response = await deleteResponse;
    expect(response.ok()).toBeTruthy();
  }
);
