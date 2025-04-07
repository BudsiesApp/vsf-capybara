import { Locator, Page } from '@playwright/test';

import { DropdownFormFieldBase } from './dropdown-form-field-base';

const MULTISELECT_ERROR_MESSAGE = '.m-multiselect__error-message';
const MULTISELECT_SELECTED_OPTION = '.multiselect__single';
const OPTIONS_LIST = '.multiselect__content';
const MULTISELECT = '.m-multiselect';

export class MultiselectFormField extends DropdownFormFieldBase {
  public constructor (
    public readonly formFieldLocator: Locator,
    public readonly selectSelector: string,
    public readonly page: Page
  ) {
    super(
      formFieldLocator,
      selectSelector,
      page,
      MULTISELECT,
      MULTISELECT_ERROR_MESSAGE,
      MULTISELECT_SELECTED_OPTION,
      OPTIONS_LIST
    );
  }
}
