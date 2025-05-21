import { SetupContext, onBeforeMount, computed } from '@vue/composition-api';

import { AuthorizationFormCode } from 'theme/interfaces/authorization-form-code';
import { REDIRECT_TARGET_QUERY_KEY } from 'theme/interfaces/redirect-target-query-key';

const ROUTE_NAME = {
  [AuthorizationFormCode.LOGIN]: 'sign-in',
  [AuthorizationFormCode.REGISTER]: 'sign-up',
  [AuthorizationFormCode.FORGOT_PASSWORD]: 'restore-password'
};

export function useAuthorizationPage (
  { root }: SetupContext
) {
  const isUserLoggedIn = computed<boolean>(() => {
    return root.$store.getters['user/isLoggedIn'];
  });

  const redirectTarget = computed<string>(() => {
    if (root.$route.query[REDIRECT_TARGET_QUERY_KEY]) {
      return root.$route.query[REDIRECT_TARGET_QUERY_KEY] as string;
    }

    return '/';
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
    redirectTarget
  }
}
