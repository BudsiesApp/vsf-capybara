import { Locator, Page } from '@playwright/test';

import { DropdownFormFieldBase } from './dropdown-form-field-base';

const SF_SELECT_ERROR_MESSAGE = '.sf-select__error-message';
const OPTIONS_LIST = '.sf-select__dropdown';
const SELECTED_OPTION = '.sf-select__selected';
const SELECT = '.sf-select';

export class SelectFormField extends DropdownFormFieldBase {
  public constructor (
    public readonly formFieldLocator: Locator,
    public readonly fieldSelector: string,
    public page: Page
  ) {
    super(
      formFieldLocator,
      fieldSelector,
      page,
      SELECT,
      SF_SELECT_ERROR_MESSAGE,
      SELECTED_OPTION,
      OPTIONS_LIST
    );
  }
}
