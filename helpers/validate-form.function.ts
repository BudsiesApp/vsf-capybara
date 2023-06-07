import { ValidationObserver } from 'vee-validate';

import { getFirstFieldWithErrorName } from './get-first-field-with-error-name.function';
import { goToFieldByName } from './go-to-field-by-name.function';

export async function validateForm (
  validationObserver: InstanceType<typeof ValidationObserver>,
  refs: Record<string, Vue | Element | Vue[] | Element[]>
): Promise<boolean> {
  const isValid = await validationObserver.validate();

  if (isValid) {
    return isValid;
  }

  const fieldName = getFirstFieldWithErrorName(validationObserver.errors);

  if (!fieldName) {
    return isValid;
  }

  goToFieldByName(fieldName, refs);
  return isValid;
}
