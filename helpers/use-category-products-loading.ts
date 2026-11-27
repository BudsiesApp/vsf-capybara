import { ref } from 'vue';
import { useI18n, useStore } from '@vue-storefront/core/application-services';
import { Logger } from '@vue-storefront/core/lib/logger';

export function useCategoryProductsLoading () {
  const applicationStore = useStore();
  const i18n = useI18n();
  const isProductsLoading = ref(false);

  /**
   * Runs a products load for an already shown category. A failure shows a notification
   * and leaves the shown products untouched, so the next attempt can retry.
   *
   * @returns whether the load succeeded
   */
  async function runRecoverableProductsLoad (
    load: () => Promise<unknown>
  ): Promise<boolean> {
    try {
      await load();
      return true;
    } catch (error) {
      Logger.error(error, 'category-products-loading')();
      applicationStore.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: i18n.t('Something went wrong. Please try again.'),
        action1: { label: i18n.t('OK') }
      });
      return false;
    }
  }

  async function loadMoreProducts (): Promise<void> {
    if (isProductsLoading.value) {
      return;
    }

    isProductsLoading.value = true;

    try {
      await runRecoverableProductsLoad(
        () => applicationStore.dispatch('category-next/loadMoreCategoryProducts')
      );
    } finally {
      isProductsLoading.value = false;
    }
  }

  return {
    isProductsLoading,
    loadMoreProducts,
    runRecoverableProductsLoad
  };
}
