<template>
  <div class="restore-password-page">
    <div class="_content">
      <SfHeading :level="1" :title="$t('Reset Password')" />

      <m-reset-password
        class="_form"
        :prefilled-email="prefilledEmail"
        @form-switched="onFormSwitched"
        @restore-success="onPasswordRestoreSuccess"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { SfHeading } from '@storefront-ui/vue';

import { PASSWORD_RESET_REDIRECT_TARGET_LOCAL_STORAGE_KEY } from 'theme/interfaces/password-reset-redirect-target-local-storage-key';
import { useAuthorizationPage } from 'theme/helpers/use-authorization-page';

import MResetPassword from '../../components/molecules/m-reset-password.vue';

export default defineComponent({
  name: 'ResetPasswordPage',
  components: {
    MResetPassword,
    SfHeading

  },
  setup (_, setupContext) {
    const {
      onFormSwitched,
      prefilledEmail,
      redirectTarget
    } = useAuthorizationPage(setupContext);

    function onPasswordRestoreSuccess () {
      if (!redirectTarget.value) {
        return;
      }

      localStorage.setItem(PASSWORD_RESET_REDIRECT_TARGET_LOCAL_STORAGE_KEY, redirectTarget.value);
    }

    return {
      onFormSwitched,
      onPasswordRestoreSuccess,
      prefilledEmail
    }
  },
  metaInfo (): any {
    return {
      title: this.$t('Reset Password')
    };
  }
});
</script>

<style lang="scss" scoped>
.restore-password-page {
  margin: auto 0;

  ._content {
    padding: var(--spacer-xl) var(--spacer-sm) var(--spacer-base);
    box-sizing: border-box;
    margin: 0 auto;
    max-width: 28rem;
    width: 100%;
  }

  ._form {
    margin-top: var(--spacer-base);
  }
}
</style>
