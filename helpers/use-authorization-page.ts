import { SetupContext, onBeforeMount, computed } from '@vue/composition-api';

import { AuthorizationFormCode } from 'theme/interfaces/authorization-form-code';
import { REDIRECT_TARGET_QUERY_KEY } from 'theme/interfaces/redirect-target-query-key';
import { PageName } from 'theme/pages/page-name';

const ROUTE_NAME = {
  [AuthorizationFormCode.LOGIN]: PageName.SIGN_IN,
  [AuthorizationFormCode.REGISTER]: PageName.SIGN_UP,
  [AuthorizationFormCode.FORGOT_PASSWORD]: PageName.RESTORE_PASSWORD
};

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

  async function onFormSwitched (formCode: AuthorizationFormCode) {
    const routeName = ROUTE_NAME[formCode];

    await root.$router.push({
      name: routeName,
      query: root.$route.query
    });
  };

  async function onLoginSuccess () {
    await root.$router.push(redirectTarget.value);
  }

  return {
    onFormSwitched,
    onLoginSuccess,
    prefilledEmail,
    redirectTarget
  }
}
