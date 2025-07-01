<template>
  <div class="sign-in-page">
    <div class="_content">
      <SfHeading :level="1" :title="$t('Sign In')" />

      <m-login
        v-if="!showRegistrationForm"
        :email.sync="email"
        @registration-required="onRegistrationRequired"
      />

      <MRegister
        v-else
        :email="email"
        :registration-token="registrationToken"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeMount } from '@vue/composition-api';
import { SfHeading } from '@storefront-ui/vue';

import { useAuthorizationPage } from 'theme/helpers/use-authorization-page';
import { useRegistrationForm } from 'theme/helpers/use-registration-form';

import MLogin from '../../components/molecules/m-login.vue';
import MRegister from '../../components/molecules/m-register.vue';

export default defineComponent({
  name: 'SignInPage',
  components: {
    MLogin,
    MRegister,
    SfHeading
  },
  setup (_, setupContext) {
    const email = ref<string>('')

    const {
      prefilledEmail
    } = useAuthorizationPage(setupContext);

    onBeforeMount(() => {
      if (prefilledEmail.value) {
        email.value = prefilledEmail.value;
      }
    });

    return {
      ...useRegistrationForm(),
      email
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
