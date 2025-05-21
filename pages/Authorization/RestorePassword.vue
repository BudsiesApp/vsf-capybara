<template>
  <div class="restore-password-page">
    <div class="_content">
      <SfHeading :level="1" :title="$t('Reset Password')" />

      <m-reset-password
        class="_form"
        @form-switched="onFormSwitched"
        @restore-success="onPasswordRestoreSuccess"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { SfHeading } from '@storefront-ui/vue';

import { useAuthorizationPage } from 'theme/helpers/use-authorization-page';

import MResetPassword from '../../components/molecules/m-reset-password.vue';

export default defineComponent({
  name: 'ResetPasswordPage',
  components: {
    MResetPassword,
    SfHeading

  },
  setup (_, setupContext) {
    const { onFormSwitched, redirectTarget } = useAuthorizationPage(setupContext);

    function onPasswordRestoreSuccess () {
      localStorage.setItem('passwordResetRedirectTarget', redirectTarget.value);
    }

    return {
      onFormSwitched,
      onPasswordRestoreSuccess
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
  ._content {
    padding-top: var(--spacer-lg);
    margin: 0 auto;
    max-width: 28rem;
    width: 100%;
  }

  ._form {
    margin-top: var(--spacer-base);
  }
}
</style>
