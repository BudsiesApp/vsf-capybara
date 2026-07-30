<template>
  <div class="m-subscription-form">
    <slot />

    <validation-observer
      ref="validationObserver"
      v-slot="{passes}"
      slim
    >
      <form
        @submit.prevent="() => passes(() => onSubmitForm())"
        class="_form"
        v-if="displayForm"
      >
        <validation-provider
          v-slot="{errors}"
          rules="required|email"
          slim
          name="E-mail"
        >
          <SfInput
            v-model="email"
            class="_input"
            :name="emailInputName"
            :label="$t('E-mail address')"
            autocomplete="email"
            :disabled="isSubmitting"
            :valid="!errors.length && !submitError"
            :error-message="errors[0] || submitError"
            @input="onEmailInput"
          />
        </validation-provider>

        <MSpinnerButton
          class="_submit-button"
          :show-spinner="isSubmitting"
          button-type="submit"
        >
          {{ buttonText }}
        </MSpinnerButton>
      </form>

      <template v-if="financialIncentiveLinks.length">
        <component
          :is="linkComponent.component"
          :key="linkComponent.key"
          v-for="linkComponent in financialIncentiveLinks"
        />
      </template>

      <div class="_success-message" v-if="!displayForm">
        {{ successMessage }}
      </div>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import { extend, ValidationProvider, ValidationObserver } from 'vee-validate';
import { email, required } from 'vee-validate/dist/rules';
import Vue, { PropType, ref } from 'vue';

import { SfInput } from '@storefront-ui/vue';
import Task from '@vue-storefront/core/lib/sync/types/Task';
import i18n from '@vue-storefront/i18n';
import {
  AdditionalContentEntry,
  AdditionalContentOutlet,
  useAdditionalContent
} from '@vue-storefront/core/additional-content';

import { usePersistedEmail } from 'src/modules/persisted-customer-data';

import MSpinnerButton from 'theme/components/molecules/m-spinner-button.vue';

extend('required', {
  ...required,
  message: 'Field is required'
});

extend('email', email);

export default Vue.extend({
  name: 'MSubscriptionForm',
  components: {
    MSpinnerButton,
    SfInput,
    ValidationProvider,
    ValidationObserver
  },
  props: {
    name: {
      type: String,
      default: 'newsletter-subscription-form'
    },
    buttonText: {
      type: String,
      default: () => {
        return i18n.t('Join').toString()
      }
    },
    successMessage: {
      type: String,
      default: () => {
        return i18n.t('Thank you for your subscription!').toString();
      }
    },
    subscribeAction: {
      type: Function as PropType<(email: string) => Promise<Task>>,
      required: true
    }
  },
  setup () {
    const financialIncentiveLinks = useAdditionalContent(
      AdditionalContentOutlet.FINANCIAL_INCENTIVE_LINKS
    );
    const email = ref<string | undefined>(undefined);
    const submitError = ref<string | undefined>(undefined);

    function handleError (task: Task): void {
      if (task.result.errorMessage) {
        submitError.value = task.result.errorMessage;
        return;
      }

      submitError.value = i18n.t('Something went wrong.').toString();
    }

    function onEmailInput (): void {
      submitError.value = undefined;
    }

    return {
      email,
      financialIncentiveLinks: financialIncentiveLinks as unknown as
        readonly AdditionalContentEntry[],
      handleError,
      onEmailInput,
      submitError,
      ...usePersistedEmail(email)
    }
  },
  data () {
    return {
      isSuccessSubscribed: false,
      isSubmitting: false
    };
  },
  computed: {
    emailInputName (): string {
      return this.name + '-email-input';
    },
    displayForm (): boolean {
      return !this.isSuccessSubscribed;
    }
  },
  methods: {
    async onSubmitForm (): Promise<void> {
      if (this.isSubmitting || !this.email) {
        return;
      }

      this.isSubmitting = true;
      this.submitError = undefined;

      this.persistLastUsedCustomerEmail(this.email);

      try {
        const response = await this.subscribeAction(this.email);

        if (response.resultCode !== 200) {
          this.handleError(response);
          return;
        }

        this.isSuccessSubscribed = true;
      } catch (_) {
        this.submitError = i18n.t('Something went wrong.').toString();
      } finally {
        this.isSubmitting = false;
      }
    }
  }
});
</script>

<style lang="scss" scoped>
@import "theme/css/base/_breakpoints.scss";

.m-subscription-form {
  --input-background: var(--_c-light-secondary);

  ._form {
    display: flex;
    flex-direction: column;

    ._input {
      width: 100%;
    }

    ._submit-button {
      --button-width: 100%;
    }

    @include for-tablet-up {
      flex-direction: row;
      align-items: flex-start;

      ._input {
        flex: 1;
        width: auto;
      }

      ._submit-button {
        --button-width: auto;
      }
    }
  }

  ::v-deep .sf-input {
    &__label {
      --input-label-font-size: var(--font-sm);
      --input-label-left: var(--spacer-xs);
    }

    input {
      --input-border: none;
      --input-font-size: var(--font-sm);
      --input-padding: var(--spacer-sm) 0 var(--spacer-xs) var(--spacer-xs);

      &:focus {
        & ~ * {
          --input-label-font-size: var(--font-2xs);
        }
      }
    }

    &--has-text,
    &--filled {
      .sf-input__label {
        --input-label-font-size: var(--font-2xs);
      }
    }
  }

  .m-spinner-button {
    margin-top: var(--spacer-sm);
    width: 100%;
    --button-font-size: var(--font-xs);
    --button-padding: calc(var(--spacer-base) * 0.56) var(--spacer-base);

    @include for-tablet-up {
      margin-top: 0;
      margin-left: var(--spacer-base);
      width: auto;
    }
  }

  ._success-message {
    color: var(--c-text);
    margin-bottom: calc(var(--font-xs) * 1.2);
  }

  .california-privacy-notice-link {
    --privacy-notice-link-color: var(--c-white);
    --privacy-notice-link-margin: var(--spacer-xs) var(--spacer-sm) 0 0;
  }

  .notice-of-financial-incentive-link {
    --financial-incentive-link-color: var(--c-white);
    --financial-incentive-link-display: inline-block;
  }
}
</style>
