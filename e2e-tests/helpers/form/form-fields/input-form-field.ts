import { expect, Locator, Page } from '@playwright/test';

const SF_INPUT_ERROR_MESSAGE = '.sf-input__error-message';

export class InputFormField {
  public formField: Locator;

  public get input (): Locator {
    return this.formField.locator(this.inputSelector);
  }

  public get error (): Locator {
    return this.formField.locator(SF_INPUT_ERROR_MESSAGE);
  }

  public async expectToHaveErrorMessage (errorMessage: string): Promise<void> {
    await expect(this.error).toHaveText(errorMessage);
  }

  public async expectToHaveValue (value: string): Promise<void> {
    await expect(this.input).toHaveValue(value);
  }

  public async fill (value: string): Promise<void> {
    await this.input.fill(value);
  }

  public constructor (
    public readonly formFieldLocator: Locator,
    public readonly inputSelector: string,
    public page: Page
  ) {
    this.formField = formFieldLocator.filter({
      has: page.locator(inputSelector)
    });
  }
}
