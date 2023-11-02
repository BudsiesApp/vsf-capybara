<template>
  <div class="m-register modal-content">
    <form @submit.prevent="register" class="form">
      <SfInput
        v-model="email"
        name="email"
        type="email"
        :label="$t('Your email')"
        :valid="!$v.email.$error"
        :error-message="
          !$v.email.required
            ? $t('Field is required.')
            : $t('Please provide valid e-mail address.')
        "
        class="form__element"
      />

      <SfInput
        v-model="firstName"
        name="first-name"
        :label="$t('First name')"
        :valid="!$v.firstName.$error"
        :error-message="$t('Field is required.')"
        class="form__element"
      />

      <SfInput
        v-model="lastName"
        name="last-name"
        :label="$t('Last name')"
        :valid="!$v.lastName.$error"
        :error-message="$t('Field is required.')"
        class="form__element"
      />

      <m-password ref="password" v-model="passwordData" />

      <SfButton class="sf-button--full-width form__submit">
        {{ $t('Create an account') }}
      </SfButton>
    </form>

    <SfButton class="sf-button--text action-button" @click.native="switchElem('login')">
      {{ `${$t('or')} ${$t('login in to your account')}` }}
    </SfButton>

    <a class="truevault-polaris-privacy-notice" target="_blank" href="https://privacy.budsies.com/privacy-policy#california-privacy-notice" noreferrer noopener hidden>California Privacy Notice</a>
  </div>
</template>

<script>
import i18n from '@vue-storefront/i18n';
import { Logger } from '@vue-storefront/core/lib/logger';
import { required, email } from 'vuelidate/lib/validators';
import { SfInput, SfButton } from '@storefront-ui/vue';
import { ModalList } from 'theme/store/ui/modals'
import { mapActions } from 'vuex';

import MPassword from 'theme/components/molecules/m-password.vue';

export default {
  name: 'MRegister',
  components: {
    SfInput,
    SfButton,
    MPassword
  },
  data () {
    return {
      email: '',
      passwordData: {
        password: '',
        repeatPassword: ''
      },
      firstName: '',
      lastName: ''
    };
  },
  methods: {
    ...mapActions('ui', {
      openModal: 'openModal',
      closeModal: 'closeModal'
    }),
    switchElem (to) {
      this.$v.$reset();
      this.openModal({ name: ModalList.Auth, payload: to })
    },
    async register () {
      this.$v.$touch();
      const isPasswordValid = await this.$refs.password.getIsPasswordValid();

      if (this.$v.$invalid || !isPasswordValid) {
        this.$store.dispatch('notification/spawnNotification', {
          type: 'danger',
          message: this.$t('Please fix the validation errors'),
          action1: { label: this.$t('OK') }
        });
        return;
      }
      this.$bus.$emit(
        'notification-progress-start',
        this.$t('Registering the account ...')
      );
      this.$store
        .dispatch('user/register', {
          email: this.email,
          password: this.passwordData.password,
          firstname: this.firstName,
          lastname: this.lastName
        })
        .then(result => {
          this.$bus.$emit('notification-progress-stop');
          if (result.code !== 200) {
            this.onFailure(result);
          } else {
            this.$store.dispatch('user/login', {
              username: this.email,
              password: this.passwordData.password
            });
            this.onSuccess(i18n.t('You are logged in!'));
            this.closeModal({ name: ModalList.Auth });
          }
        })
        .catch(err => {
          this.onFailure({
            result:
              'Unexpected authorization error. Check your Network conection.'
          });
          this.$bus.$emit('notification-progress-stop');
          Logger.error(err, 'user')();
        });
    },
    onSuccess (message) {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'success',
        message: message,
        action1: { label: i18n.t('OK') }
      });
    },
    onFailure (result) {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: i18n.t(result.result),
        action1: { label: i18n.t('OK') }
      });
    }
  },
  validations: {
    email: {
      required,
      email
    },
    firstName: {
      required
    },
    lastName: {
      required
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.form {
  width: 100%;
  &__element {
    margin: var(--spacer-base) 0;
  }
  &__submit {
    margin: var(--spacer-xl) 0 0 0;
  }
}
.action-button {
  margin: var(--spacer-xl) 0;
}
</style>
