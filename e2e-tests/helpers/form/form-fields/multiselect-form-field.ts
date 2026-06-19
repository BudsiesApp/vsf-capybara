import { Locator, Page } from '@playwright/test';

import { DropdownFormFieldBase } from './dropdown-form-field-base';

const MULTISELECT_ERROR_MESSAGE = '.m-multiselect__error-message';
const MULTISELECT_SELECTED_OPTION = '.multiselect__single';
const OPTIONS_LIST = '.multiselect__content';
const MULTISELECT_TRIGGER = '.multiselect__tags';

export class MultiselectFormField extends DropdownFormFieldBase {
  protected async triggerOptionsListOpening (): Promise<void> {
    const chevron = this.formField.locator('._chevron').first();

    if (await chevron.isVisible()) {
      await chevron.click();
      return;
    }

    const searchInput = this.formField.locator('input[id$="-input"]').first();

    await searchInput.focus();
    await searchInput.press('ArrowDown');
  }

  public constructor (
    public readonly formFieldLocator: Locator,
    public readonly fieldSelector: string,
    public readonly page: Page
  ) {
    super(
      formFieldLocator,
      fieldSelector,
      page,
      MULTISELECT_TRIGGER,
      MULTISELECT_ERROR_MESSAGE,
      MULTISELECT_SELECTED_OPTION,
      OPTIONS_LIST
    );
  }
}
