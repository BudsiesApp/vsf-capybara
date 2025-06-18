<template>
  <div class="sign-up-page">
    <div class="_content">
      <SfHeading :level="1" :title="$t('Sign Up')" />

      <m-login
        :email.sync="email"
        :email-submit-button-text="$t('Sign Up')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref } from '@vue/composition-api';
import { SfHeading } from '@storefront-ui/vue';

import { useAuthorizationPage } from 'theme/helpers/use-authorization-page';

import MLogin from '../../components/molecules/m-login.vue';

export default defineComponent({
  name: 'SignUpPage',
  components: {
    MLogin,
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
      email
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
    padding: var(--spacer-xl) var(--spacer-sm) var(--spacer-base);
    box-sizing: border-box;
    margin: 0 auto;
    max-width: 28rem;
    width: 100%;
  }
}
</style>
