import { useStore } from '@vue-storefront/core/application-services';

import { useCategoryProductsLoading } from './use-category-products-loading';

jest.mock('@vue-storefront/core/application-services', () => ({
  useStore: jest.fn(),
  useI18n: () => ({ t: (value: string) => value })
}));
jest.mock('@vue-storefront/core/lib/logger', () => ({ Logger: { error: jest.fn(() => () => {}) } }));

const notification = {
  type: 'danger',
  message: 'Something went wrong. Please try again.',
  action1: { label: 'OK' }
};

function setup (dispatch: jest.Mock) {
  (useStore as jest.Mock).mockReturnValue({ dispatch });

  return useCategoryProductsLoading();
}

describe('useCategoryProductsLoading', () => {
  it('returns true without notifying when the load succeeds', async () => {
    const dispatch = jest.fn();

    await expect(setup(dispatch).runRecoverableProductsLoad(async () => undefined)).resolves.toBe(true);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('notifies once and returns false when the load fails', async () => {
    const dispatch = jest.fn();

    await expect(setup(dispatch).runRecoverableProductsLoad(async () => {
      throw new Error('failed');
    })).resolves.toBe(false);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith('notification/spawnNotification', notification);
  });

  it('unlocks loading after a failed load more and retries the same request', async () => {
    const dispatch = jest.fn()
      .mockRejectedValueOnce(new Error('failed'))
      .mockResolvedValue(undefined);
    const { isProductsLoading, loadMoreProducts } = setup(dispatch);

    await loadMoreProducts();

    expect(isProductsLoading.value).toBe(false);
    expect(dispatch).toHaveBeenCalledWith('notification/spawnNotification', notification);

    await loadMoreProducts();

    expect(dispatch.mock.calls.filter(([type]) => type === 'category-next/loadMoreCategoryProducts')).toHaveLength(2);
  });
});
