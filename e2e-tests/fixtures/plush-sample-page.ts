import { testFactory as baseTestFactory } from './vertical-steps-product-page';
import { PlushSamplePage } from '../page-model/product/plush-sample';

interface PlushSamplePageFixture {
  plushSamplePage: PlushSamplePage
}

const PRODUCT_NAME = 'Bulk Plush Sample';
const DESCRIPTION_CUSTOMIZATION_OPTION_VALUE = 'Describe Your Bulk Plush Sample';
const PAGE_URL = '/bulk-samples/create/';

export const test = baseTestFactory(PAGE_URL).extend<PlushSamplePageFixture>({
  plushSamplePage: async ({ customizableProductPage, page }, use) => {
    const plushSamplePage = new PlushSamplePage(
      page,
      customizableProductPage,
      PRODUCT_NAME,
      DESCRIPTION_CUSTOMIZATION_OPTION_VALUE,
      true
    );
    await use(plushSamplePage);
  }
});

export { expect } from '@playwright/test';
