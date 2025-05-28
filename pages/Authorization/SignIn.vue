<template>
  <div class="sign-in-page">
    <div class="_content">
      <SfHeading :level="1" :title="$t('Sign In')" />

      <m-login
        :prefilled-email="prefilledEmail"
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

import MLogin from '../../components/molecules/m-login.vue';

export default defineComponent({
  name: 'SignInPage',
  components: {
    MLogin,
    SfHeading
  },
  setup (_, setupContext) {
    const {
      onFormSwitched,
      onLoginSuccess,
      prefilledEmail
    } = useAuthorizationPage(setupContext);

    return {
      onFormSwitched,
      onLoginSuccess,
      prefilledEmail
    }
  },
  metaInfo (): any {
    return {
      title: this.$t('Sign In')
    };
  }
});
</script>

<style lang="scss" scoped>
.sign-in-page {
  ._content {
    padding: var(--spacer-xl) var(--spacer-sm) var(--spacer-base);
    box-sizing: border-box;
    margin: 0 auto;
    max-width: 28rem;
    width: 100%;
  }
}
</style>
