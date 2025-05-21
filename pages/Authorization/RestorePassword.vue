<template>
  <div class="restore-password-page">
    <m-reset-password
      @form-switched="onFormSwitched"
      @restore-success="onPasswordRestoreSuccess"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

import { useAuthorizationPage } from 'theme/helpers/use-authorization-page';

import MResetPassword from '../../components/molecules/m-reset-password.vue';

export default defineComponent({
  name: 'ResetPasswordPage',
  components: {
    MResetPassword
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
  }
  // metaInfo (): any {
  //  // TODO
  //  return {};
  // }
});
</script>
