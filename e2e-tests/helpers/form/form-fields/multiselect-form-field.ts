import { Locator, Page } from '@playwright/test';

import { DropdownFormFieldBase } from './dropdown-form-field-base';

const MULTISELECT_ERROR_MESSAGE = '.m-multiselect__error-message';
const MULTISELECT_SELECTED_OPTION = '.multiselect__single';
const OPTIONS_LIST = '.multiselect__content';
const MULTISELECT_TRIGGER = '.multiselect__tags';

export class MultiselectFormField extends DropdownFormFieldBase {
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
