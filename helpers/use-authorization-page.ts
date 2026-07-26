import { onBeforeMount, computed, watch } from 'vue';

import { useRootInstance } from 'src/modules/shared';
import { REDIRECT_TARGET_QUERY_KEY } from 'theme/interfaces/redirect-target-query-key';

export function useAuthorizationPage () {
  const root = useRootInstance();
  const isUserLoggedIn = computed<boolean>(() => {
    return root.$store.getters['user/isLoggedIn'];
  });

  const redirectTarget = computed<string>(() => {
    const query = { ...root.$route.query };

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
    if (typeof root.$route.query?.email !== 'string') {
      return;
    }

    return root.$route.query.email;
  });

  onBeforeMount(async () => {
    if (isUserLoggedIn.value) {
      return root.$router.replace(redirectTarget.value);
    }
  });

  watch(isUserLoggedIn, (isLoggedIn) => {
    if (isLoggedIn) {
      root.$router.replace(redirectTarget.value);
    }
  });

  return {
    prefilledEmail,
    redirectTarget
  }
}
