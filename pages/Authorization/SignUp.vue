<template>
  <div class="sign-up-page">
    <div class="_content">
      <SfHeading :level="1" :title="$t('Sign Up')" />

      <m-register
        @form-switched="onFormSwitched"
        @login-success="onLoginSuccess"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { SfHeading } from '@storefront-ui/vue';

import { useAuthorizationPage } from 'theme/helpers/use-authorization-page';

import MRegister from '../../components/molecules/m-register.vue';

export default defineComponent({
  name: 'SignUpPage',
  components: {
    MRegister,
    SfHeading
  },
  setup (_, setupContext) {
    const { onFormSwitched, onLoginSuccess } = useAuthorizationPage(setupContext);

    return {
      onFormSwitched,
      onLoginSuccess
    }
  },
  metaInfo (): any {
    return {
      title: this.$t('Sign Up')
    };
  }
});
</script>

<style lang="scss" scoped>
.sign-up-page {
  ._content {
    padding: var(--spacer-lg) var(--spacer-sm) var(--spacer-base);
    box-sizing: border-box;
    margin: 0 auto;
    max-width: 28rem;
    width: 100%;
  }
}
</style>
