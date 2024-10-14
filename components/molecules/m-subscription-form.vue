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
            :disabled="isSubmitting"
            :valid="!errors.length"
            :error-message="errors[0]"
          />
        </validation-provider>

        <MSpinnerButton :show-spinner="isSubmitting">
          {{ buttonText }}
        </MSpinnerButton>
      </form>

      <california-privacy-notice-link />

      <notice-of-financial-incentive-link />

      <div class="_success-message" v-if="!displayForm">
        {{ successMessage }}
      </div>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import { extend, ValidationProvider, ValidationObserver } from 'vee-validate';
import { email, required } from 'vee-validate/dist/rules';
import { PropType, defineComponent, ref } from '@vue/composition-api';

import { SfInput } from '@storefront-ui/vue';
import Task from '@vue-storefront/core/lib/sync/types/Task';
import i18n from '@vue-storefront/i18n';

import { usePersistedEmail } from 'src/modules/persisted-customer-data';
import { CaliforniaPrivacyNoticeLink, NoticeOfFinancialIncentiveLink } from 'src/modules/true-vault';

import MSpinnerButton from 'theme/components/molecules/m-spinner-button.vue';

extend('required', {
  ...required,
  message: 'Field is required'
});

extend('email', email);

export default defineComponent({
  name: 'MSubscriptionForm',
  components: {
    CaliforniaPrivacyNoticeLink,
    MSpinnerButton,
    NoticeOfFinancialIncentiveLink,
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
    const email = ref<string | undefined>(undefined);

    return {
      email,
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

      this.persistLastUsedCustomerEmail(this.email);

      try {
        const response = await this.subscribeAction(this.email);

        if (response.result.errorMessage) {
          const validationObserver = this.$refs.validationObserver as InstanceType<typeof ValidationObserver>;

          validationObserver.setErrors({
            [this.emailInputName]: response.result.errorMessage
          })
          return;
        }

        if (response.resultCode !== 200) {
          return;
        }

        this.isSuccessSubscribed = true;
      } finally {
        this.isSubmitting = false;
      }
    }
  }
});
</script>

<style lang="scss" scoped>
.m-subscription-form {
  --input-background: var(--_c-light-secondary);

  ._form {
    display: flex;
    align-items: flex-start;

    ._input {
      flex: 1;
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
    margin-left: var(--spacer-base);
    --button-font-size: var(--font-xs);
    --button-padding: calc(var(--spacer-base) * 0.56) var(--spacer-base);
  }

  ._success-message {
    color: var(--c-text);
    margin-bottom: calc(var(--font-xs) * 1.2);
  }

  .california-privacy-notice-link {
    --privacy-notice-link-margin: var(--spacer-xs) var(--spacer-sm) 0 0;
  }

  .notice-of-financial-incentive-link {
    --financial-incentive-link-display: inline-block;
  }
}
</style>
