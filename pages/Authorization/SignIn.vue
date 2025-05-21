<template>
  <div class="sign-in-page">
    <m-login
      @form-switched="onFormSwitched"
      @login-success="onLoginSuccess"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

import { useAuthorizationPage } from 'theme/helpers/use-authorization-page';

import MLogin from '../../components/molecules/m-login.vue';

export default defineComponent({
  name: 'SignInPage',
  components: {
    MLogin
  },
  setup (_, setupContext) {
    const { onFormSwitched, onLoginSuccess } = useAuthorizationPage(setupContext);

    return {
      onFormSwitched,
      onLoginSuccess
    }
  }
  // metaInfo (): any {
  //  // TODO
  //  return {};
  // }
});
</script>
