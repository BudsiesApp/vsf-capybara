import { SetupContext, onBeforeMount, computed, watch } from '@vue/composition-api';

import { REDIRECT_TARGET_QUERY_KEY } from 'theme/interfaces/redirect-target-query-key';

export function useAuthorizationPage (
  { root }: SetupContext
) {
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

    return `${target}?${new URLSearchParams(query).toString()}`;
  });

  const prefilledEmail = computed<string | undefined>(() => {
    if (typeof root.$route.query?.email !== 'string') {
      return;
    }

    return root.$route.query.email;
  });

  onBeforeMount(async () => {
    if (isUserLoggedIn.value) {
      return root.$router.push(redirectTarget.value);
    }
  });

  watch(isUserLoggedIn, (isLoggedIn) => {
    if (isLoggedIn) {
      root.$router.push(redirectTarget.value);
    }
  });

  return {
    prefilledEmail,
    redirectTarget
  }
}
