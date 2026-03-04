<template>
  <div id="auth-page">
    <div v-if="isLoading" class="loading-message">
      <SfLoader :loading="true" />
      <p>{{ $t('Authenticating...') }}</p>
    </div>

    <div v-else-if="errorMessage" class="error-message">
      <h2>{{ $t('Authentication Failed') }}</h2>
      <p>{{ errorMessage }}</p>

      <SfButton
        class="sf-button--full-width login-again-button"
        @click="onLoginAgain"
      >
        {{ $t('Login again') }}
      </SfButton>
    </div>

    <div v-else-if="isSuccess" class="success-message">
      <h2>{{ $t('Authentication Successful') }}</h2>
    </div>

    <div v-else-if="showRegistrationForm" class="registration-form">
      <SfHeading :level="1" :title="$t('Sign Up')" />

      <MRegister
        :email="email"
        :registration-token="registrationToken"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  ref,
  PropType,
  onBeforeUnmount,
  watch,
  computed
} from '@vue/composition-api';
import { SfLoader, SfHeading, SfButton } from '@storefront-ui/vue';

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { Logger } from '@vue-storefront/core/lib/logger';
import { AuthenticateRequestResponse } from '@vue-storefront/core/modules/user';

import { REDIRECT_TARGET_QUERY_KEY } from 'theme/interfaces/redirect-target-query-key';
import { useRegistrationForm } from 'theme/helpers/use-registration-form';
import { PageName } from 'theme/pages/page-name';

import MRegister from 'theme/components/molecules/m-register.vue';
import { useAuthorizationRouteRestoration } from 'theme/helpers/use-authorization-route-restoration';

export default defineComponent({
  name: 'Auth',
  components: {
    MRegister,
    SfButton,
    SfHeading,
    SfLoader
  },
  props: {
    token: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    email: {
      type: String,
      required: true
    }
  },
  setup (props, context) {
    const root = context.root;

    const isLoading = ref<boolean>(true);
    const isSuccess = ref<boolean>(false);
    const errorMessage = ref<string>('');
    const {
      showRegistrationForm,
      onRegistrationRequired,
      registrationToken
    } = useRegistrationForm();
    const {
      navigateToPostAuthRedirectPath,
      persistPostAuthRedirectPath,
      getPersistedPostAuthRedirectPath
    } = useAuthorizationRouteRestoration(context);

    const isUserLoggedIn = computed<boolean>(() => {
      return root.$store.getters['user/isLoggedIn'];
    });

    const authenticate = async (): Promise<void> => {
      if (isUserLoggedIn.value) {
        root.$router.push('/');
        return;
      }

      if (!props.token) {
        errorMessage.value = root.$t('No authentication token provided').toString();
        isLoading.value = false;
        return;
      }

      try {
        const response = await root.$store.dispatch('user/authenticate', {
          email: props.email,
          token: props.token
        });

        if (response.code !== 200) {
          const error = response.result.errorMessage || root.$t('Authentication failed').toString();
          errorMessage.value = error;
          Logger.error('Authentication failed with response:', JSON.stringify(response.result), 'auth-page')();
          return;
        }

        const result: AuthenticateRequestResponse = response.result;

        if (result.is_new_customer) {
          onRegistrationRequired(result.token);
          return;
        }

        root.$store.dispatch('notification/spawnNotification', {
          type: 'success',
          message: root.$t('Successfully logged in!'),
          action1: { label: root.$t('OK') }
        });
      } catch (error) {
        Logger.error(error, 'auth-page')();
        errorMessage.value = root.$t('Authentication failed. Please try again.').toString();
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      if (!root.$store.getters['user/getIsSessionStarted']) {
        EventBus.$once('session-after-started', authenticate);
        return;
      }

      authenticate();
    });

    onBeforeUnmount(() => {
      EventBus.$off('session-after-started', authenticate);
    });

    watch(
      isUserLoggedIn,
      (newValue) => {
        if (newValue) {
          isSuccess.value = true;
          navigateToPostAuthRedirectPath();
        }
      }
    );

    async function onLoginAgain (): Promise<void> {
      type RouteQueryValue = string | (string | null)[] | null | undefined;

      const query: Record<string, RouteQueryValue> = {};
      const currentRouteQuery = root.$route.query as Record<string, RouteQueryValue>;

      for (const [key, value] of Object.entries(currentRouteQuery)) {
        if (key === 'token') {
          continue;
        }

        query[key] = value;
      }

      const existingRedirectTargetValue = root.$route.query[REDIRECT_TARGET_QUERY_KEY];

      let redirectTarget = typeof existingRedirectTargetValue === 'string'
        ? existingRedirectTargetValue
        : undefined;

      if (!redirectTarget) {
        redirectTarget = await getPersistedPostAuthRedirectPath();
      }

      if (redirectTarget) {
        query[REDIRECT_TARGET_QUERY_KEY] = redirectTarget;
        await persistPostAuthRedirectPath(redirectTarget);
      }

      root.$router.push({ name: PageName.SIGN_IN, query });
    }

    return {
      isLoading,
      isSuccess,
      errorMessage,
      onLoginAgain,
      showRegistrationForm,
      registrationToken
    };
  },
  async serverPrefetch (): Promise<void> {
    this.$ssrContext.output.cacheTags.add('no-cache');
  },
  metaInfo (): any {
    return {
      title: this.$t('Authentication')
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#auth-page {
  box-sizing: border-box;
  margin: auto 0;
  padding: var(--spacer-base) var(--spacer-sm);
  display: flex;
  justify-content: center;

  .m-register {
    margin-top: var(--spacer-xl);
  }

  @include for-desktop {
    max-width: 1272px;
    width: 100%;
    margin: auto;
  }
}
</style>
