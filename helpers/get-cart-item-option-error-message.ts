import i18n from '@vue-storefront/core/i18n';
import TaskResponseError from '@vue-storefront/core/lib/sync/types/TaskResponseError';

export function getCartItemOptionErrorMessage (error: unknown): string {
  const fallbackMessage = i18n.t('Something went wrong').toString();

  if (error instanceof TaskResponseError) {
    return fallbackMessage;
  }

  return (error as Error)?.message || fallbackMessage;
}
