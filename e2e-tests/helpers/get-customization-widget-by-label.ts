import { Locator, Page } from '@playwright/test';

export function getCustomizationWidgetByLabel (page: Page, label: string): Locator {
  const labelElement = page.getByText(label);
  const parent = labelElement.locator('..');

  return parent.locator('> ._widget').first();
}
