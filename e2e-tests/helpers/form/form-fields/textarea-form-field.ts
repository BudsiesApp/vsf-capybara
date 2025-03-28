import { Locator, Page } from '@playwright/test';

import { InputFormField } from './input-form-field';

export class TextAreaFormField extends InputFormField {
  public get error (): Locator {
    return this.formField.locator(this.errorMessageSelector);
  }

  public constructor (
    formFieldLocator: Locator,
    inputSelector: string,
    public errorMessageSelector: string,
    page: Page
  ) {
    super(formFieldLocator, inputSelector, page);
  }
}
