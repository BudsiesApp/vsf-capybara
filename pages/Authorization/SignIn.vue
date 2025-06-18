<template>
  <div class="sign-in-page">
    <div class="_content">
      <SfHeading :level="1" :title="$t('Sign In')" />

      <m-login
        :email.sync="email"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onBeforeMount } from '@vue/composition-api';
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
