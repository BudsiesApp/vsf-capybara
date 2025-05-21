<template>
  <div class="sign-up-page">
    <m-register
      @form-switched="onFormSwitched"
      @login-successed="onLoginSuccessed"
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
