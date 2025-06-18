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
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  ref,
  PropType,
  onBeforeUnmount
} from '@vue/composition-api';
import { SfLoader } from '@storefront-ui/vue';

import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { Logger } from '@vue-storefront/core/lib/logger';

export default defineComponent({
  name: 'Auth',
  components: {
    SfLoader
  },
  props: {
    token: {
      type: String as PropType<string | undefined>,
      default: undefined
    }
  },
  setup (props, { root }) {
    const isLoading = ref<boolean>(true);
    const isSuccess = ref<boolean>(false);
    const errorMessage = ref<string>('');

    const authenticate = async (): Promise<void> => {
      if (root.$store.getters['user/isLoggedIn']) {
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
          token: props.token
        });

        if (response.code === 200) {
          isSuccess.value = true;
          Logger.info('Authentication successful', 'auth-page')();
        } else {
          errorMessage.value = root.$t('Invalid authentication token') as string;
          Logger.error('Authentication failed with response:', response, 'auth-page')();
        }
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

    return {
      isLoading,
      isSuccess,
      errorMessage
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
