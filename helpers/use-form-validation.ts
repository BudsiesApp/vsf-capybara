import { ValidationObserver } from 'vee-validate';
import { Ref, ref } from '@vue/composition-api';

import { Logger } from '@vue-storefront/core/lib/logger';
import { isVue } from 'src/modules/shared';

export function useFormValidation (
  getFormFieldsRefs: () => Record<string, Vue | Element | Vue[] | Element[]>
) {
  const validationObserver: Ref<InstanceType<typeof ValidationObserver> | null> = ref(null);

  function getFieldAnchorName (field: string): string {
    // Strip quotes
    let fieldName = field.replace(/^['"]+|['"]+$/g, '');
    // Strip spaces & convert to lower case
    fieldName = fieldName.toLowerCase().replace(/ /g, '-');

    return `${fieldName}-field-anchor`;
  }

  function getNameOfFirstFieldWithError (
    errors: Record<string, string[]>
  ): string | undefined {
    for (const key in errors) {
      if (errors[key] && !!errors[key].length) {
        return key;
      }
    }
  }

  function goToFieldByName (
    field: string
  ): void {
    const fieldAnchorName = getFieldAnchorName(field);

    let ref = getFormFieldsRefs()[fieldAnchorName];

    if (!ref) {
      Logger.warn(`Reference for the field with error not found. Field: ${field}, ref: ${fieldAnchorName}`, 'budsies')();
      return;
    }

    if (Array.isArray(ref)) {
      ref = ref[0];
    }

    if (isVue(ref)) {
      ref = ref.$el as HTMLElement;
    }

    ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function validateAndGoToFirstError (): Promise<boolean> {
    if (!validationObserver.value) {
      throw new Error('Validation observer is not defined');
    }

    const isValid = await validationObserver.value.validate();

    if (isValid) {
      return isValid;
    }

    const fieldName = getNameOfFirstFieldWithError(validationObserver.value.errors);

    if (!fieldName) {
      return isValid;
    }

    goToFieldByName(fieldName);
    return isValid;
  }

  return {
    getFieldAnchorName,
    goToFieldByName,
    validateAndGoToFirstError,
    validationObserver
  }
}
