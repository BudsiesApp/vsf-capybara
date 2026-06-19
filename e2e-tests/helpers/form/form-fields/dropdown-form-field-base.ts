import { expect, Locator, Page } from '@playwright/test';

export class DropdownFormFieldBase {
  public formField: Locator;

  public get selector (): Locator {
    return this.formField.locator(this.selectSelector);
  }

  public get error (): Locator {
    return this.formField.locator(this.errorMessageSelector);
  }

  public get optionsList (): Locator {
    return this.formField.locator(this.optionsListSelector);
  }

  public get selectedOption (): Locator {
    return this.formField.locator(this.selectedOptionSelector);
  }

  public async selectByOptionTitle (title: string): Promise<void> {
    await this.openOptionsList();
    await this.optionsList.locator('li').getByText(title).click();
  }

  protected async openOptionsList (): Promise<void> {
    await this.scrollFormFieldIntoView();
    await this.triggerOptionsListOpening();
    await expect(this.optionsList).toBeVisible();
  }

  protected async triggerOptionsListOpening (): Promise<void> {
    await this.selector.click();
  }

  protected async scrollFormFieldIntoView (): Promise<void> {
    await this.formField.evaluate((element: HTMLElement) => {
      element.scrollIntoView({
        block: 'center',
        inline: 'nearest'
      });
    });
  }

  public async expectOptionToBeSelected (title: string): Promise<void> {
    await expect(this.selectedOption).toHaveText(title);
  }

  public async expectToHaveErrorMessage (errorMessage: string): Promise<void> {
    await expect(this.error).toHaveText(errorMessage);
  }

  public constructor (
    public readonly formFieldLocator: Locator,
    public readonly fieldSelector: string,
    public readonly page: Page,
    public readonly selectSelector: string,
    public readonly errorMessageSelector: string,
    public readonly selectedOptionSelector: string,
    public readonly optionsListSelector: string
  ) {
    this.formField = formFieldLocator
      .filter(
        {
          has: page.locator(fieldSelector)
        }
      );
  }
}
