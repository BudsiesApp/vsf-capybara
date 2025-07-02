<template>
  <div id="auth-page">
    <div v-if="isLoading" class="loading-message">
      <SfLoader :loading="true" />
      <p>{{ $t('Authenticating...') }}</p>
    </div>

    <div v-else-if="errorMessage" class="error-message">
      <h2>{{ $t('Authentication Failed') }}</h2>
      <p>{{ errorMessage }}</p>
    </div>

    <div v-else-if="isSuccess" class="success-message">
      <h2>{{ $t('Authentication Successful') }}</h2>
      <p>{{ $t('The authentication was successful, you can close this tab now!') }}</p>
    </div>

    <div v-else-if="showRegistrationForm" class="registration-form">
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
import { SfLoader } from '@storefront-ui/vue';

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { Logger } from '@vue-storefront/core/lib/logger';
import { AuthenticateRequestResponse } from '@vue-storefront/core/modules/user';

import { useRegistrationForm } from 'theme/helpers/use-registration-form';

import MRegister from 'theme/components/molecules/m-register.vue';

export default defineComponent({
  name: 'Auth',
  components: {
    MRegister,
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
  setup (props, { root }) {
    const isLoading = ref<boolean>(true);
    const isSuccess = ref<boolean>(false);
    const errorMessage = ref<string>('');
    const {
      showRegistrationForm,
      onRegistrationRequired,
      registrationToken
    } = useRegistrationForm();

    const isUserLoggedIn = computed<boolean>(() => {
      return root.$store.getters['user/isLoggedIn'];
    });

    const authenticate = async (): Promise<void> => {
      if (isUserLoggedIn.value) {
        root.$router.push('/');
        return;
      }

      if (!props.token) {
        errorMessage.value = root.$t('No authentication token provided') as string;
        isLoading.value = false;
        return;
      }

      try {
        const response = await root.$store.dispatch('user/authenticate', {
          email: props.email,
          token: props.token
        });

        if (response.code !== 200) {
          errorMessage.value = root.$t('Invalid authentication token') as string;
          Logger.error('Authentication failed with response:', response, 'auth-page')();
          return;
        }

        const result: AuthenticateRequestResponse = response.result;

        if (result.is_new_customer) {
          onRegistrationRequired(result.token);
          return;
        }

        Logger.info('Authentication successful', 'auth-page')();
      } catch (error) {
        Logger.error(error, 'auth-page')();
        errorMessage.value = root.$t('Authentication failed. Please try again.') as string;
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
        }
      }
    );

    return {
      isLoading,
      isSuccess,
      errorMessage,
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
  padding: var(--spacer-base) var(--spacer-sm);
  display: flex;
  justify-content: center;

  @include for-desktop {
    max-width: 1272px;
    width: 100%;
    margin: 0 auto;
  }
}
</style>
