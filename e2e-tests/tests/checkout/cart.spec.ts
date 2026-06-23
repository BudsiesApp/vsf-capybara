import { expect, test } from '../../fixtures/cart-page';

const simpleProductUrl = '/p/voice-recorder/';

test('buttons are disabled when item is removing', async ({ page, cartPage, printedSocksPage, simpleProductPage }) => {
  await page.goto(simpleProductUrl);
  await simpleProductPage.addToCartAndVerifyResponse();

  await printedSocksPage.goto();
  await printedSocksPage.addProductToCart();

  await cartPage.goto();
  await expect(cartPage.cartItems).toHaveCount(2);
  const deleteResponse = cartPage.waitForDeleteResponse();
  await cartPage.removeCartItemWithDelay(cartPage.cartItems.first());
  await expect(cartPage.cartItems).toHaveCount(1);

  for (const cartItem of await cartPage.cartItems.all()) {
    await expect(cartItem.locator('button:has-text("Remove")')).toBeDisabled();
    const editButton = cartItem.locator('button:has-text("Edit")');

    if (await editButton.isVisible()) {
      await expect(cartItem.locator('button:has-text("Edit")')).toBeDisabled();
    }

    const quantityControl = cartItem.locator('.a-custom-product-quantity');

    if (await quantityControl.isVisible()) {
      await expect(quantityControl).toHaveClass(/-disabled/);
    }
  }

  const response = await deleteResponse;
  expect(response.ok()).toBeTruthy();
});
