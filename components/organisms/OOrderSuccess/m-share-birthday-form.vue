<template>
  <div class="m-share-birthday-form">
    <validation-observer slim v-slot="{ passes }">
      <div class="_birthday-added" v-if="isBirthdayAdded">
        <p class="_thank-you">
          {{ $t('Thank You') }}
        </p>

        <SfButton
          class="color-secondary"
          type="button"
          @click.prevent="() => isBirthdayAdded = false"
        >
          {{ addAnotherButtonText }}
        </SfButton>
      </div>

      <form class="_form" v-else>
        <p class="_text">
          {{ topHelperText }}
        </p>

        <div class="_fields">
          <validation-provider
            rules="required"
            :name="nameInputLabel"
            tag="div"
            class="_field -input"
            v-slot="{ errors }"
          >
            <SfInput
              class="_input"
              name="name"
              :required="true"
              v-model="name"
              :valid="!errors.length"
              :error-message="errors[0]"
              :disabled="isDisabled"
              :label="nameInputLabel"
            />
          </validation-provider>

          <validation-provider
            rules="required-short"
            :name="$t('Month')"
            tag="div"
            class="_field -select"
            v-slot="{ errors, classes }"
          >
            <SfSelect
              v-model="birthMonth"
              :required="true"
              :valid="!errors.length"
              :error-message="errors[0]"
              :disabled="isDisabled"
              :title="$t('Month')"
              class="_select sf-select--underlined"
              :class="classes"
            >
              <SfSelectOption
                v-for="monthItem in monthsOptions"
                :key="monthItem.title"
                :value="monthItem.value !== undefined ? monthItem.value : ''"
              >
                {{ monthItem.title }}
              </SfSelectOption>
            </SfSelect>
          </validation-provider>

          <validation-provider
            rules="required-short"
            :name="$t('Day')"
            tag="div"
            class="_field -select"
            v-slot="{ errors, classes }"
          >
            <SfSelect
              :key="daysOptions.length"
              v-model="birthDay"
              :required="true"
              :valid="!errors.length"
              :error-message="errors[0]"
              :title="$t('Day')"
              :disabled="isDisabled"
              class="_select sf-select--underlined"
              :class="classes"
            >
              <SfSelectOption
                v-for="dayItem in daysOptions"
                :key="dayItem.title"
                :value="dayItem.value !== undefined ? dayItem.value : ''"
              >
                {{ dayItem.title }}
              </SfSelectOption>
            </SfSelect>
          </validation-provider>
        </div>

        <div class="_button-container">
          <SfButton
            class="_submit-button color-secondary"
            type="submit"
            :disabled="isDisabled"
            @click.prevent="() => passes(() => onSubmit())"
          >
            {{ submitButtonText }}
          </SfButton>
        </div>

        <template v-if="privacyPolicyLinks.length">
          <component :is="linkComponent.component" :key="linkComponent.key" v-for="linkComponent in privacyPolicyLinks" />
        </template>
      </form>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import { ValidationObserver, ValidationProvider, extend } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import Vue, { VueConstructor } from 'vue'
import { SfButton, SfInput, SfSelect } from '@storefront-ui/vue';
import { getDaysInMonth } from 'src/modules/budsies';
import { notifications } from '@vue-storefront/core/modules/cart/helpers';
import {
  AdditionalContentEntry,
  AdditionalContentOutlet,
  useAdditionalContent
} from '@vue-storefront/core/additional-content';

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

extend('required-short', {
  ...required,
  message: 'Field is required'
});

function getOptionsList (length: number, placeholder: string): OptionItem[] {
  const options: OptionItem[] = Array.from({ length }, (_, i) => {
    const item = i + 1;

    return {
      value: item,
      title: item >= 10 ? item.toString(10) : `0${item}`
    }
  });

  options.unshift({
    value: undefined,
    title: placeholder
  });

  return options;
}

interface OptionItem {
  value?: number,
  title: string
}

interface NonReactiveData {
  monthsOptions: OptionItem[]
}

export default (Vue as VueConstructor<Vue & NonReactiveData>).extend({
  name: 'MShareBirthdayForm',
  props: {
    orderId: { type: Number, required: true },
    email: { type: String, required: true },
    addAnotherButtonText: {
      type: String,
      required: true
    },
    topHelperText: {
      type: String,
      required: true
    },
    nameInputLabel: {
      type: String,
      required: true
    },
    submitButtonText: {
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
  components: {
    SfButton,
    SfInput,
    SfSelect,
    ValidationProvider,
    ValidationObserver
  },
  data () {
    return {
      name: '',
      birthMonth: undefined as number | '' | undefined,
      birthDay: undefined as number | undefined,
      isDisabled: false,
      isBirthdayAdded: false
    }
  },
  computed: {
    daysOptions (): OptionItem[] {
      const days = typeof this.birthMonth === 'number' ? getDaysInMonth(this.birthMonth) : 31;
      return getOptionsList(days, this.$t('DD').toString());
    }
  },
  watch: {
    birthMonth () {
      if (this.birthDay !== undefined && this.birthDay >= this.daysOptions.length) {
        this.birthDay = undefined;
      }
    }
  },
  created () {
    this.monthsOptions = getOptionsList(12, this.$t('MM').toString());
  },
  methods: {
    clearForm () {
      this.name = '';
      this.birthMonth = undefined;
      this.birthDay = undefined;
    },
    async onSubmit () {
      if (this.isDisabled) {
        return;
      }

      this.isDisabled = true;
      try {
        await this.$store.dispatch('budsies/shareBirthday', {
          name: this.name,
          birthMonth: this.birthMonth,
          birthDay: this.birthDay,
          email: this.email,
          orderId: this.orderId
        });

        this.isBirthdayAdded = true;
        this.clearForm();
      } catch (error) {
        this.$store.dispatch(
          'notification/spawnNotification',
          notifications.createNotification({
            type: 'danger',
            message: (this.$t('Something went wrong') as string),
            timeToLive: 10 * 1000
          }),
          { root: true }
        );
      } finally {
        this.isDisabled = false;
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.m-share-birthday-form {
  ._text {
    text-align: center;
  }

  ._form {
    display: flex;
    flex-direction: column;
  }

  ._fields {
    display: flex;
    margin-bottom: var(--spacer-sm);
  }

  ._field {
    margin-right: var(--spacer-sm);

    &:last-child {
      margin-right: 0;
    }

    &.-input {
      flex: 1;
    }

    &.-select {
      width: 22%;
    }
  }

  ._input {
    ::v-deep {
      input {
        height: auto;
        line-height: 1.2;
      }
    }
  }

  ._select {
    padding: 0;

    &.invalid {
      --select-border-color: var(--c-danger);
    }
  }

  ._button-container {
    display: flex;
    justify-content: center;
  }

  ._birthday-added {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: var(--spacer-sm);

    ._thank-you {
      margin-bottom: var(--spacer-sm);
    }
  }

  .california-privacy-notice-link {
    --privacy-notice-link-text-align: end;
    --privacy-notice-link-width: 100%;
  }

  @include for-mobile {
    ._fields {
      flex-wrap: wrap;
    }

    ._field {
      &.-input {
        flex: 0 0 100%;
        margin-right: 0;
        margin-bottom: var(--spacer-xs);
      }

      &.-select {
        flex: 1;
        width: auto;
      }
    }
  }

  @include for-desktop {
    ._text {
      text-align: start;
    }

    ._button-container {
      justify-content: flex-end;
    }
  }

}
</style>
