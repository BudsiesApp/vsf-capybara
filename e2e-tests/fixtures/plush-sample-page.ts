import { testFactory as baseTestFactory } from './vertical-steps-product-page';
import { PlushSamplePage } from '../page-model/product/plush-sample';

interface PlushSamplePageFixture {
  plushSamplePage: PlushSamplePage
}

export const test = baseTestFactory(PlushSamplePage.PAGE_URL).extend<PlushSamplePageFixture>({
  plushSamplePage: async ({ customizableProductPage, page }, use) => {
    const plushSamplePage = new PlushSamplePage(page, customizableProductPage);
    await use(plushSamplePage);
  }
});

export { expect } from '@playwright/test';
