import { useRoute, useRouter, useStore } from '@vue-storefront/core/application-services';
import { onBeforeMount, computed, watch } from 'vue';

import { REDIRECT_TARGET_QUERY_KEY } from 'theme/interfaces/redirect-target-query-key';

export function useAuthorizationPage () {
  const applicationStore = useStore();
  const applicationRouter = useRouter();
  const currentRoute = useRoute();
  const isUserLoggedIn = computed<boolean>(() => {
    return applicationStore.getters['user/isLoggedIn'];
  });

  const redirectTarget = computed<string>(() => {
    const query = { ...currentRoute.query };

    let target = '/';

    if (query[REDIRECT_TARGET_QUERY_KEY]) {
      target = query[REDIRECT_TARGET_QUERY_KEY] as string;
      delete query[REDIRECT_TARGET_QUERY_KEY];
    }

    const searchParams = new URLSearchParams();

    for (const key in query) {
      const value = query[key];

      if (!value) {
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          if (!item) {
            continue;
          }

          searchParams.append(key, item);
        }
      } else {
        searchParams.append(key, value);
      }
    }

    const queryString = searchParams.toString();

    if (!queryString) {
      return target;
    }

    return `${target}?${queryString}`;
  });

  const prefilledEmail = computed<string | undefined>(() => {
    if (typeof currentRoute.query?.email !== 'string') {
      return;
    }

    return currentRoute.query.email;
  });

  onBeforeMount(async () => {
    if (isUserLoggedIn.value) {
      return applicationRouter.replace(redirectTarget.value);
    }
  });

  watch(isUserLoggedIn, (isLoggedIn) => {
    if (isLoggedIn) {
      applicationRouter.replace(redirectTarget.value);
    }
  });

  return {
    prefilledEmail,
    redirectTarget
  }
}
