<template>
  <div class="sign-up-page">
    <m-register
      @form-switched="onFormSwitched"
      @login-success="onLoginSuccess"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

import { useAuthorizationPage } from 'theme/helpers/use-authorization-page';

import MRegister from '../../components/molecules/m-register.vue';

export default defineComponent({
  name: 'SignUpPage',
  components: {
    MRegister
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
