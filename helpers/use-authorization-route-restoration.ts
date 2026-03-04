import { SetupContext } from '@vue/composition-api';

import { StorageManager } from '@vue-storefront/core/lib/storage-manager'

export function useAuthorizationRouteRestoration (
  { root }: SetupContext
) {
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
      await root.$router.replace({ name: 'orders-history' });
      return;
    }

    await root.$router.replace(route);
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
