<template>
  <div id="password-reset-page">
    <SfHeading :level="1" :title="$t('Reset a Password')" />

    <div class="_content">
      <div class="_success" v-if="isSuccess">
        {{ $t('Your password has been updated') }}
      </div>

      <validation-observer
        v-slot="{passes}"
        tag="div"
        class="_form"
        v-else-if="showForm"
      >
        <m-password v-model="passwordData" />

        <div class="_error" v-if="apiError">
          {{ apiError }}
        </div>

        <SfButton
          class="_button"
          @click.prevent="passes(() => onSubmit())"
        >
          {{ $t('Reset a Password') }}
        </SfButton>
      </validation-observer>

      <div class="_error" v-else>
        {{ $t('Your password reset link has expired.') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ValidationObserver } from 'vee-validate';
import { SfButton, SfHeading } from '@storefront-ui/vue';

import { ModalList } from 'theme/store/ui/modals';

import MPassword from 'theme/components/molecules/m-password.vue';

export default Vue.extend({
  name: 'PasswordReset',
  props: {
    email: {
      type: String,
      default: ''
    },
    token: {
      type: String,
      default: ''
    }
  },
  components: {
    MPassword,
    SfButton,
    SfHeading,
    ValidationObserver
  },
  data () {
    return {
      passwordData: {
        password: '',
        repeatPassword: ''
      },
      isSubmitting: false,
      apiError: undefined as string | undefined,
      isSuccess: false
    }
  },
  computed: {
    showForm (): boolean {
      return !!this.email && !!this.token;
    }
  },
  mounted (): void {
    if (!this.showForm) {
      this.$store.dispatch(
        'ui/openModal',
        { name: ModalList.Auth, payload: 'forgot-pass' }
      );
    }
  },
  methods: {
    async onSubmit (): Promise<void> {
      if (this.isSubmitting) {
        return;
      }

      this.apiError = undefined;

      this.isSubmitting = true;

      try {
        await this.$store.dispatch('user/passwordResetConfirm', {
          email: this.email,
          resetToken: this.token,
          newPassword: this.passwordData.password
        });

        this.isSuccess = true;
        this.$store.dispatch('ui/openModal', { name: ModalList.Auth, payload: 'login' });
      } catch (error) {
        this.apiError = (error as Error).message;
      } finally {
        this.isSubmitting = false;
      }
    }
  },
  metaInfo () {
    return {
      title: this.$t('Reset a Password').toString()
    }
  }
});
</script>

<style lang="scss" scoped>
#password-reset-page {
  max-width: 1272px;
  width: 100%;
  margin: 0 auto;
  padding: var(--spacer-xl);
  box-sizing: border-box;

  ._content {
    display: flex;
    justify-content: center;
    width: 100%;
    max-width: 35rem;
    margin: var(--spacer-base) auto 0;
  }

  ._form {
    --password-inputs-margin: var(--spacer-base) 0 0;

    flex-grow: 1;
  }

  ._error {
    color: var(--c-danger-variant);
    margin-top: var(--spacer-sm);
  }

  ._button {
    margin-top: var(--spacer-sm);
  }

  ._success {
    text-align: center;
    color: var(--c-success);
  }
}
</style>
