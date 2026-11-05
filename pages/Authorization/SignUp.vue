<template>
  <div class="sign-up-page">
    <div class="_content">
      <SfHeading :level="1" :title="$t('Sign Up')" />

      <m-login
        v-if="!showRegistrationForm"
        :email.sync="email"
        :email-submit-button-text="$t('Sign Up').toString()"
        @otp-submitted="resetPostAuthRedirectPath"
        @otp-requested="onOtpRequested"
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
import { defineComponent, onBeforeMount, ref } from 'vue';
import { SfHeading } from '@storefront-ui/vue';

import { useAuthorizationPage } from 'theme/helpers/use-authorization-page';
import { useAuthorizationRouteRestoration } from 'theme/helpers/use-authorization-route-restoration';
import { useRegistrationForm } from 'theme/helpers/use-registration-form';

import MLogin from '../../components/molecules/m-login.vue';
import MRegister from '../../components/molecules/m-register.vue';

export default defineComponent({
  name: 'SignUpPage',
  components: {
    MLogin,
    MRegister,
    SfHeading
  },
  setup (_, context) {
    const email = ref<string>('')

    const {
      prefilledEmail,
      redirectTarget
    } = useAuthorizationPage();
    const { persistPostAuthRedirectPath, resetPostAuthRedirectPath } = useAuthorizationRouteRestoration();

    function onOtpRequested () {
      persistPostAuthRedirectPath(redirectTarget.value);
    }

    onBeforeMount(() => {
      if (prefilledEmail.value) {
        email.value = prefilledEmail.value;
      }
    });

    return {
      ...useRegistrationForm(),
      email,
      onOtpRequested,
      resetPostAuthRedirectPath
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
  margin: auto 0;

  ._content {
    padding: var(--spacer-xl) var(--spacer-sm) var(--spacer-base);
    box-sizing: border-box;
    margin: 0 auto;
    max-width: 28rem;
    width: 100%;
  }

  .m-login,
  .m-register {
    margin-top: var(--spacer-xl);
  }
}
</style>
