import { testFactory as baseTestFactory } from './vertical-steps-product-page';
import { PlushSamplePage } from '../page-model/product/plush-sample';

interface PlushKeychainSamplePageFixture {
  plushKeychainSamplePage: PlushSamplePage
}

const PRODUCT_NAME = 'Bulk Plush Keychain Sample';
const DESCRIPTION_CUSTOMIZATION_OPTION_VALUE = 'Describe Your Bulk Plush Keychain Sample';
const PAGE_URL = '/bulk-plush-keychain-samples/create/';

export const test = baseTestFactory(PAGE_URL).extend<PlushKeychainSamplePageFixture>({
  plushKeychainSamplePage: async ({ customizableProductPage, page }, use) => {
    const plushKeychainSamplePage = new PlushSamplePage(
      page,
      customizableProductPage,
      PRODUCT_NAME,
      DESCRIPTION_CUSTOMIZATION_OPTION_VALUE,
      false
    );
    await use(plushKeychainSamplePage);
  }
});

export { expect } from '@playwright/test';
