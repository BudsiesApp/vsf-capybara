import { Ref } from 'vue';
import { Store } from 'vuex';
import i18n from '@vue-storefront/i18n';
import { Logger } from '@vue-storefront/core/lib/logger';

function notifyProductsLoadingFailed (store: Store<any>, error: unknown): void {
  Logger.error(error, 'category-products-loading')();
  store.dispatch('notification/spawnNotification', {
    type: 'danger',
    message: i18n.t('Something went wrong. Please try again.'),
    action1: { label: i18n.t('OK') }
  });
}

/**
 * Runs a products load for an already shown category. A failure shows a notification
 * and leaves the shown products untouched, so the next attempt can retry.
 *
 * @returns whether the load succeeded
 */
export async function runRecoverableProductsLoad (
  store: Store<any>,
  load: () => Promise<unknown>
): Promise<boolean> {
  try {
    await load();
    return true;
  } catch (error) {
    notifyProductsLoadingFailed(store, error);
    return false;
  }
}

export async function loadMoreCategoryProducts (
  store: Store<any>,
  isProductsLoading: Ref<boolean>
): Promise<void> {
  if (isProductsLoading.value) {
    return;
  }

  isProductsLoading.value = true;

  try {
    await runRecoverableProductsLoad(
      store,
      () => store.dispatch('category-next/loadMoreCategoryProducts')
    );
  } finally {
    isProductsLoading.value = false;
  }
}
