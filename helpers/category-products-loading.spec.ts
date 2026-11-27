import { ref } from 'vue';

import {
  loadMoreCategoryProducts,
  runRecoverableProductsLoad
} from './category-products-loading';

jest.mock('@vue-storefront/i18n', () => ({ __esModule: true, default: { t: (value: string) => value } }));
jest.mock('@vue-storefront/core/lib/logger', () => ({ Logger: { error: jest.fn(() => () => {}) } }));

const notification = {
  type: 'danger',
  message: 'Something went wrong. Please try again.',
  action1: { label: 'OK' }
};

describe('category products loading', () => {
  it('returns true without notifying when the load succeeds', async () => {
    const store: any = { dispatch: jest.fn() };

    await expect(runRecoverableProductsLoad(store, async () => undefined)).resolves.toBe(true);
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('notifies once and returns false when the load fails', async () => {
    const store: any = { dispatch: jest.fn() };

    await expect(runRecoverableProductsLoad(store, async () => {
      throw new Error('failed');
    })).resolves.toBe(false);
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith('notification/spawnNotification', notification);
  });

  it('unlocks loading after a failed load more and retries the same request', async () => {
    const isLoading = ref(false);
    const store: any = {
      dispatch: jest.fn()
        .mockRejectedValueOnce(new Error('failed'))
        .mockResolvedValue(undefined)
    };

    await loadMoreCategoryProducts(store, isLoading);

    expect(isLoading.value).toBe(false);
    expect(store.dispatch).toHaveBeenCalledWith('notification/spawnNotification', notification);

    await loadMoreCategoryProducts(store, isLoading);

    expect(store.dispatch.mock.calls.filter(([type]: [string]) => type === 'category-next/loadMoreCategoryProducts')).toHaveLength(2);
  });
});
