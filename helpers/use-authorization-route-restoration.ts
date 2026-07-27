import { useRouter } from '@vue-storefront/core/application-services';
import { StorageManager } from '@vue-storefront/core/lib/storage-manager'

export function useAuthorizationRouteRestoration () {
  const applicationRouter = useRouter();
  const urlStorage = StorageManager.get('url');
  const postAuthRedirectPathLocalStorageKey = 'postAuthRedirectPath';

  async function persist (route: string): Promise<void> {
    await urlStorage.setItem(postAuthRedirectPathLocalStorageKey, route);
  }

  function reset (): void {
    urlStorage.removeItem(postAuthRedirectPathLocalStorageKey);
  }

  async function restore (): Promise<void> {
    const route = await urlStorage.getItem(postAuthRedirectPathLocalStorageKey);

    if (!route) {
      await applicationRouter.replace({ name: 'orders-history' });
      return;
    }

    await applicationRouter.replace(route);
    reset();
  }

  async function getPersistedPostAuthRedirectPath (): Promise<string | undefined> {
    return urlStorage.getItem(postAuthRedirectPathLocalStorageKey);
  }

  return {
    persistPostAuthRedirectPath: persist,
    navigateToPostAuthRedirectPath: restore,
    resetPostAuthRedirectPath: reset,
    getPersistedPostAuthRedirectPath
  };
}
