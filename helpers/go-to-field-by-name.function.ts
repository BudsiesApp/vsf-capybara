import { Logger } from '@vue-storefront/core/lib/logger';

import { isVue } from 'src/modules/shared';

import { getFieldAnchorName } from './get-field-anchor-name.function';

export function goToFieldByName (
  field: string,
  refs: Record<string, Vue | Element | Vue[] | Element[]>
): void {
  const fieldAnchorName = getFieldAnchorName(field);

  let ref = refs[fieldAnchorName] as (HTMLElement | Vue) | (HTMLElement|Vue)[] | undefined;

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
