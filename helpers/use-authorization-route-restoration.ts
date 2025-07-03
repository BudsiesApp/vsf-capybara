import { SetupContext } from '@vue/composition-api';
import { RawLocation } from 'vue-router';

import { StorageManager } from '@vue-storefront/core/lib/storage-manager'

export function useAuthorizationRouteRestoration (
  { root }: SetupContext
) {
  const urlStorage = StorageManager.get('url');
  const targetRouteLocalStorageKey = 'targetRoute';

  async function persist (route: string): Promise<void> {
    await urlStorage.setItem(targetRouteLocalStorageKey, route);
  }

  function reset (): void {
    urlStorage.removeItem(targetRouteLocalStorageKey);
  }

  async function restore (): Promise<void> {
    const route = await urlStorage.getItem(targetRouteLocalStorageKey);

    if (!route) {
      return;
    }

    await root.$router.push(route);
    reset();
  }

  return {
    persistTargetRoute: persist,
    navigateToTargetRoute: restore,
    resetTargetRoute: reset
  };
}
