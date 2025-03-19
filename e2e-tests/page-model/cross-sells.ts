import { expect, Page } from '@playwright/test';

export class CrossSellsPage {
  public constructor (public readonly page: Page) { }

  public async waitPageToBeVisible () {
    await expect(this.page.locator('#cross-sells')).toBeVisible();
  }
}
