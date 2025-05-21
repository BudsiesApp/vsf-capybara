<template>
  <div class="sign-in-page">
    <m-login
      @form-switched="onFormSwitched"
      @login-successed="onLoginSuccessed"
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
    const { onFormSwitched, onLoginSuccessed } = useAuthorizationPage(setupContext);

    return {
      onFormSwitched,
      onLoginSuccessed
    }
  }
  // metaInfo (): any {
  //  // TODO
  //  return {};
  // }
});
</script>
