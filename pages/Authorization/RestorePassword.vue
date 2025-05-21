<template>
  <div class="restore-password-page">
    <m-reset-password
      @form-switched="onFormSwitched"
      @restore-successed="onPasswordRestoreSuccessed"
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

    function onPasswordRestoreSuccessed () {
      localStorage.setItem('passwordResetRedirectTarget', redirectTarget.value);
    }

    return {
      onFormSwitched,
      onPasswordRestoreSuccessed
    }
  }
  // metaInfo (): any {
  //  // TODO
  //  return {};
  // }
});
</script>
