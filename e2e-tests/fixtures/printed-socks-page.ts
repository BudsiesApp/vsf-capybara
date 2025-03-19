import { testFactory as baseTestFactory } from './images-gallery-product-page';

import { PrintedSocksPage } from '../page-model/product/printed-socks';

interface PrintedSocksPageFixture {
  printedSocksPage: PrintedSocksPage
}

export function testFactory (productPageUrl: string) {
  const baseTest = baseTestFactory(productPageUrl);

  return baseTest.extend<PrintedSocksPageFixture>({
    printedSocksPage: async ({ crossSellsPage, customizableProductPage, page }, use) => {
      const printedSocksPage = new PrintedSocksPage(page, customizableProductPage, crossSellsPage);
      await use(printedSocksPage);
    }
  });
}

export { expect } from '@playwright/test';
