<template>
  <div class="m-register modal-content">
    <ValidationObserver
      ref="validationObserver"
      slim
    >
      <form @submit.prevent="register" class="form">
        <ValidationProvider
          v-slot="{ errors }"
          rules="required"
          slim
          name="First name"
          vid="first-name"
          mode="eager"
        >
          <SfInput
            v-model.trim="firstName"
            ref="firstNameFieldAnchor"
            name="first-name"
            :label="$t('First name')"
            :valid="!errors.length"
            :disabled="isSubmitting"
            :error-message="errors[0]"
            class="form__element"
            @input="clearServerError('first-name')"
          />
        </ValidationProvider>

        <ValidationProvider
          v-slot="{ errors }"
          rules="required"
          slim
          name="Last name"
          vid="last-name"
          mode="eager"
        >
          <SfInput
            v-model.trim="lastName"
            ref="lastNameFieldAnchor"
            name="last-name"
            :label="$t('Last name')"
            :valid="!errors.length"
            :disabled="isSubmitting"
            :error-message="errors[0]"
            class="form__element"
            @input="clearServerError('last-name')"
          />
        </ValidationProvider>

        <SfButton
          :disabled="isSubmitting"
          class="sf-button--full-width form__submit"
        >
          {{ $t('Create an account') }}
        </SfButton>
      </form>
    </ValidationObserver>

    <template v-if="privacyPolicyLinks.length">
      <component :is="linkComponent.component" :key="linkComponent.key" v-for="linkComponent in privacyPolicyLinks" />
    </template>
  </div>
</template>

<script lang="ts">
import { useI18n, useStore } from '@vue-storefront/core/application-services';
import {
  defineComponent,
  nextTick,
  PropType,
  Ref,
  ref
} from 'vue';
import { SfInput, SfButton } from '@storefront-ui/vue';
import { extend, ValidationObserver, ValidationProvider } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';

import Task from '@vue-storefront/core/lib/sync/types/Task';
import { Logger } from '@vue-storefront/core/lib/logger';
import {
  AdditionalContentEntry,
  AdditionalContentOutlet,
  useAdditionalContent
} from '@vue-storefront/core/additional-content';

import { FormRefs, getFieldAnchorName, useFormValidation } from 'theme/helpers/use-form-validation';

extend('required', {
  ...required,
  message: 'Field is required'
});

type ValidationObserverInstance = InstanceType<typeof ValidationObserver>;
type SfInputInstance = InstanceType<typeof SfInput>;
type RegistrationField = 'first-name' | 'last-name';

const registrationFields: Record<string, RegistrationField> = {
  firstname: 'first-name',
  lastname: 'last-name'
};

interface BackendValidationError {
  dataPath?: string
}

function isBackendValidationError (value: unknown): value is BackendValidationError {
  return typeof value === 'object' && value !== null && 'dataPath' in value;
}

export default defineComponent({
  name: 'MRegister',
  components: {
    SfInput,
    SfButton,
    ValidationProvider,
    ValidationObserver
  },
  props: {
    email: {
      type: String as PropType<string>,
      required: true
    },
    registrationToken: {
      type: String as PropType<string>,
      required: true
    }
  },
  setup (props) {
    const applicationStore = useStore();
    const applicationI18n = useI18n();
    const privacyPolicyLinks = useAdditionalContent(
      AdditionalContentOutlet.PRIVACY_POLICY_LINKS
    );

    const validationObserver: Ref<ValidationObserverInstance | null> = ref(null);
    const firstNameFieldAnchor: Ref<SfInputInstance | null> = ref(null);
    const lastNameFieldAnchor: Ref<SfInputInstance | null> = ref(null);
    const firstName = ref('');
    const lastName = ref('');
    const isSubmitting = ref(false);

    const {
      goToFieldByName,
      validateAndGoToFirstError
    } = useFormValidation(
      validationObserver,
      (): FormRefs => {
        const refs: FormRefs = {};

        if (firstNameFieldAnchor.value) {
          refs[getFieldAnchorName('first-name')] = firstNameFieldAnchor.value;
        }

        if (lastNameFieldAnchor.value) {
          refs[getFieldAnchorName('last-name')] = lastNameFieldAnchor.value;
        }

        return refs;
      }
    );

    const clearServerError = (field: RegistrationField): void => {
      validationObserver.value?.setErrors({ [field]: [] });
    };

    const onSuccess = (message: string): void => {
      applicationStore.dispatch('notification/spawnNotification', {
        type: 'success',
        message,
        action1: { label: applicationI18n.t('OK') }
      });
    };

    const onFailure = (message: string): void => {
      applicationStore.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: applicationI18n.t(message),
        action1: { label: applicationI18n.t('OK') }
      });
    };

    const processBadRequestErrors = async (errors: unknown[]): Promise<void> => {
      const fieldErrors: Partial<Record<RegistrationField, string[]>> = {};

      for (const error of errors) {
        if (!isBackendValidationError(error) || !error.dataPath) {
          continue;
        }

        const pathSegments = error.dataPath.split('.');
        const fieldName = pathSegments[pathSegments.length - 1];
        const field = registrationFields[fieldName];

        if (!field) {
          continue;
        }

        fieldErrors[field] = [applicationI18n.t('Field is not valid').toString()];
      }

      const firstInvalidField = (Object.keys(registrationFields) as string[])
        .map(field => registrationFields[field])
        .find(field => fieldErrors[field]);

      if (!firstInvalidField) {
        onFailure('Something went wrong');
        return;
      }

      validationObserver.value?.setErrors(fieldErrors);

      await nextTick();
      goToFieldByName(firstInvalidField);
    };

    const processError = async (result: Task): Promise<void> => {
      if (typeof result.result === 'string') {
        onFailure(result.result);
        return;
      }

      if (result.code !== 400 || !Array.isArray(result.result) || !result.result.length) {
        onFailure('Something went wrong');
        return;
      }

      await processBadRequestErrors(result.result);
    };

    const register = async (): Promise<void> => {
      if (isSubmitting.value) {
        return;
      }

      const isFormValid = await validateAndGoToFirstError();

      if (!isFormValid) {
        return;
      }

      isSubmitting.value = true;

      try {
        const response = await applicationStore.dispatch('user/register', {
          email: props.email,
          token: props.registrationToken,
          firstname: firstName.value,
          lastname: lastName.value
        });

        if (response.code !== 200) {
          await processError(response);
          return;
        }

        onSuccess(applicationI18n.t('You are logged in!').toString());
      } catch (error) {
        onFailure('Unexpected authorization error. Check your Network conection.');
        Logger.error(error, 'user')();
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      clearServerError,
      firstName,
      firstNameFieldAnchor,
      isSubmitting,
      lastName,
      lastNameFieldAnchor,
      privacyPolicyLinks: privacyPolicyLinks as unknown as readonly AdditionalContentEntry[],
      register,
      validationObserver
    };
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
