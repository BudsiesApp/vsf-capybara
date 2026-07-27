<template>
  <div class="m-register modal-content">
    <form @submit.prevent="register" class="form">
      <SfInput
        v-model="firstName"
        name="first-name"
        :label="$t('First name')"
        :valid="!$v.firstName.$error"
        :disabled="isSubmitting"
        :error-message="
          !$v.firstName.required
            ? $t('Field is required')
            : $t('Field is not valid')
        "
        class="form__element"
      />

      <SfInput
        v-model="lastName"
        name="last-name"
        :label="$t('Last name')"
        :valid="!$v.lastName.$error"
        :disabled="isSubmitting"
        :error-message="
          !$v.lastName.required
            ? $t('Field is required')
            : $t('Field is not valid')
        "
        class="form__element"
      />

      <SfButton
        :disabled="isSubmitting"
        class="sf-button--full-width form__submit"
      >
        {{ $t('Create an account') }}
      </SfButton>
    </form>

    <template v-if="privacyPolicyLinks.length">
      <component :is="linkComponent.component" :key="linkComponent.key" v-for="linkComponent in privacyPolicyLinks" />
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { SfInput, SfButton } from '@storefront-ui/vue';
import { required } from 'vuelidate/lib/validators';

import Task from '@vue-storefront/core/lib/sync/types/Task';
import { Logger } from '@vue-storefront/core/lib/logger';
import i18n from '@vue-storefront/i18n';
import {
  AdditionalContentEntry,
  AdditionalContentOutlet,
  useAdditionalContent
} from '@vue-storefront/core/additional-content';

import MPassword from 'theme/components/molecules/m-password.vue';

export default Vue.extend({
  name: 'MRegister',
  components: {
    SfInput,
    SfButton,
    MPassword
  },
  props: {
    email: {
      type: String,
      required: true
    },
    registrationToken: {
      type: String,
      required: true
    }
  },
  setup () {
    const privacyPolicyLinks = useAdditionalContent(
      AdditionalContentOutlet.PRIVACY_POLICY_LINKS
    );

    return {
      privacyPolicyLinks: privacyPolicyLinks as unknown as
        readonly AdditionalContentEntry[]
    };
  },
  data () {
    return {
      firstName: '',
      lastName: '',
      serverErrorFields: [] as string[],
      isSubmitting: false
    };
  },
  methods: {
    async register () {
      if (this.isSubmitting) {
        return;
      }

      this.serverErrorFields = [];
      this.$v.$touch();

      if (this.$v.$invalid) {
        this.$store.dispatch('notification/spawnNotification', {
          type: 'danger',
          message: this.$t('Please fix the validation errors'),
          action1: { label: this.$t('OK') }
        });
        return;
      }

      this.isSubmitting = true;

      try {
        const response = await this.$store.dispatch('user/register', {
          email: this.email,
          token: this.registrationToken,
          firstname: this.firstName,
          lastname: this.lastName
        });

        if (response.code !== 200) {
          this.processError(response)
        } else {
          this.onSuccess(i18n.t('You are logged in!').toString());
        }
      } catch (err) {
        this.onFailure('Unexpected authorization error. Check your Network conection.');
        Logger.error(err, 'user')();
      } finally {
        this.isSubmitting = false;
      }
    },
    onSuccess (message: string) {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'success',
        message: message,
        action1: { label: i18n.t('OK') }
      });
    },
    onFailure (message: string) {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: i18n.t(message),
        action1: { label: i18n.t('OK') }
      });
    },
    processError (result: Task) {
      if (typeof result.result === 'string') {
        this.onFailure(result.result);
        return;
      }

      if (result.code !== 400 || !Array.isArray(result.result) || !result.result.length) {
        this.onFailure('Something went wrong');
        return;
      }

      this.processBadRequestErrors(result.result);
    },
    processBadRequestErrors (errorsList: any[]) {
      for (const error of errorsList) {
        if (!error.dataPath) {
          continue;
        }

        const dataPath = error.dataPath.split('.');
        const fieldName = dataPath[dataPath.length - 1];

        if (!fieldName) {
          continue;
        }

        this.serverErrorFields.push(fieldName);
      }

      this.$v.$touch();
    },
    serverErrorsValidator (fieldName: string) {
      return !this.serverErrorFields.find((field) => fieldName === field);
    }
  },
  validations () {
    return {
      firstName: {
        required,
        serverErrors: () => this.serverErrorsValidator('firstname')
      },
      lastName: {
        required,
        serverErrors: () => this.serverErrorsValidator('lastname')
      }
    }
  }
});
</script>

<style lang="scss" scoped>
.m-register {
  &.modal-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .form {
    width: 100%;

    &__element,
    &__submit {
      margin-top: var(--spacer-base);

      &:first-child {
        margin-top: 0;
      }
    }
  }

  .california-privacy-notice-link {
    --privacy-notice-link-display: inline;
    --privacy-notice-link-margin: 0;
  }
}
</style>
