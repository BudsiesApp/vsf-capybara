import { computed, Ref } from '@vue/composition-api';

let instanceId = 0;

export function useErrorAccessibility (componentName: string, hasError: Ref<boolean>) {
  const id = `${componentName}-${instanceId++}`;

  const errorMessageId = computed<string>(() => {
    return `${id}-error-message`;
  });

  const ariaDescribedby = computed<string | undefined>(() => {
    return hasError.value
      ? errorMessageId.value
      : undefined;
  });

  const ariaInvalid = computed<string>(() => {
    return hasError.value ? 'true' : 'false';
  });

  return {
    ariaDescribedby,
    ariaInvalid,
    errorMessageId
  };
}
