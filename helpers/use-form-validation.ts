import { ValidationObserver } from 'vee-validate';
import { Ref } from '@vue/composition-api';

import { Logger } from '@vue-storefront/core/lib/logger';
import { isVue } from 'src/modules/shared';

export function getFieldAnchorName (field: string, prefix?: string): string {
  // Strip quotes
  let fieldName = field.replace(/^['"]+|['"]+$/g, '');
  // Strip spaces & convert to lower case
  fieldName = fieldName.toLowerCase().replace(/ /g, '-');

  let anchorName = `${fieldName}-field-anchor`;

  if (prefix) {
    anchorName = `${prefix}-${anchorName}`;
  }

  return anchorName;
}

export function useFormValidation (
  validationObserver: Ref<InstanceType<typeof ValidationObserver> | null>,
  getFormFieldsRefs: () => Record<string, Vue | Element | Vue[] | Element[]>,
  prefix?: string
) {
  function getNameOfFirstFieldWithError (
    errors: Record<string, string[]>
  ): string | undefined {
    const fieldsWithErrors = Object.keys(errors).filter(
      key => errors[key] && !!errors[key].length
    );

    if (!fieldsWithErrors.length) {
      return undefined;
    }

    const refs = getFormFieldsRefs();

    return fieldsWithErrors.sort((a, b) => {
      let refA = refs[getFieldAnchorName(a, prefix)];
      let refB = refs[getFieldAnchorName(b, prefix)];

      if (!refA || !refB) {
        return 0;
      }

      if (Array.isArray(refA)) {
        refA = refA[0];
      }

      if (Array.isArray(refB)) {
        refB = refB[0];
      }

      const elA = (isVue(refA) ? (refA as Vue).$el : refA) as HTMLElement;
      const elB = (isVue(refB) ? (refB as Vue).$el : refB) as HTMLElement;

      const position = elA.compareDocumentPosition(elB);

      if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1;
      }

      if (position & Node.DOCUMENT_POSITION_PRECEDING) {
        return 1;
      }

      return 0;
    })[0];
  }

  function goToFieldByName (
    field: string
  ): void {
    const fieldAnchorName = getFieldAnchorName(field, prefix);

    const refs = getFormFieldsRefs();
    let ref = refs[fieldAnchorName];

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

    let focusable = (ref as HTMLElement).querySelector<HTMLElement>(
      '[tabindex="0"]'
    );

    if (!focusable) {
      focusable = (ref as HTMLElement).querySelector<HTMLElement>(
        'input, select, textarea, a[href], button:not([disabled])'
      );
    }

    focusable?.focus();
  }

  function validate (): Promise<boolean> {
    if (!validationObserver.value) {
      throw new Error('Validation observer is not defined');
    }

    return validationObserver.value.validate();
  }

  async function goToFirstError (): Promise<void> {
    if (!validationObserver.value) {
      throw new Error('Validation observer is not defined');
    }

    const fieldName = getNameOfFirstFieldWithError(validationObserver.value.errors);

    if (!fieldName) {
      return;
    }

    goToFieldByName(fieldName);
  }

  async function validateAndGoToFirstError (): Promise<boolean> {
    if (!validationObserver.value) {
      throw new Error('Validation observer is not defined');
    }

    if (await validate()) {
      return true;
    }

    goToFirstError();
    return false;
  }

  return {
    getFieldAnchorName,
    goToFieldByName,
    validateAndGoToFirstError,
    validate,
    goToFirstError
  }
}
