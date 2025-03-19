import { expect, Locator, Page } from '@playwright/test';

const MULTISELECT_ERROR_MESSAGE = '.m-multiselect__error-message';
const MULTISELECT_SELECTED_OPTION = '.multiselect__single';
const OPTIONS_LIST = '.multiselect__content';
const MULTISELECT = '.m-multiselect';

export class MultiselectFormField {
  public formField: Locator;

  public get selector (): Locator {
    return this.formField.locator(this.selectSelector);
  }

  public get error (): Locator {
    return this.formField.locator(MULTISELECT_ERROR_MESSAGE);
  }

  public get optionsList (): Locator {
    return this.formField.locator(OPTIONS_LIST);
  }

  public get selectedOption (): Locator {
    return this.formField.locator(MULTISELECT_SELECTED_OPTION);
  }

  public async selectByOptionTitle (title: string): Promise<void> {
    await this.selector.click();
    await this.optionsList.locator('li').getByText(title).click();
  }

  public async expectOptionToBeSelected (title: string): Promise<void> {
    await expect(this.selectedOption).toHaveText(title);
  }

  public async expectToHaveErrorMessage (errorMessage: string): Promise<void> {
    await expect(this.error).toHaveText(errorMessage);
  }

  public constructor (
    public readonly formFieldLocator: Locator,
    public readonly selectSelector: string,
    public readonly page: Page
  ) {
    const multiSelect = page.locator(MULTISELECT);

    this.formField = formFieldLocator.and(multiSelect)
      .filter(
        {
          has: page.locator(selectSelector)
        }
      );
  }
}
