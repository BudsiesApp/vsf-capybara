<template>
  <div class="m-password">
    <validation-provider
      ref="passwordValidationProvider"
      v-slot="{ errors }"
      rules="required|min:7"
      vid="password"
      slim
    >
      <SfInput
        v-model="password"
        type="password"
        class="_input sf-input--required"
        name="password"
        :has-show-password="true"
        :label="$t('Password')"
        :valid="!errors.length"
        :error-message="errors[0]"
      />
    </validation-provider>

    <validation-provider
      v-slot="{ errors }"
      ref="repeatPasswordValidationProvider"
      rules="required|confirmed:password"
      slim
    >
      <SfInput
        v-model="repeatPassword"
        type="password"
        class="_input sf-input--required"
        name="password-confirm"
        :has-show-password="true"
        :label="$t('Repeat password')"
        :valid="!errors.length"
        :error-message="errors[0]"
      />
    </validation-provider>
  </div>
</template>

<script lang="ts">
import { ValidationProvider, extend } from 'vee-validate';
import { required, min, confirmed } from 'vee-validate/dist/rules';
import Vue, { PropType } from 'vue';
import { SfInput } from '@storefront-ui/vue';

extend('required', {
  ...required,
  message: 'Field is required'
});

extend('min', {
  ...min,
  message: 'Password must have at least {length} symbols.'
});

extend('confirmed', {
  ...confirmed,
  message: 'Passwords must be identical'
})

export default Vue.extend({
  components: {
    SfInput,
    ValidationProvider
  },
  props: {
    value: {
      type: Object as PropType<{
        password: string,
        repeatPassword: string
      }>,
      required: true
    }
  },
  computed: {
    password: {
      get (): string {
        return this.value.password;
      },
      set (value: string) {
        this.$emit('input', {
          repeatPassword: this.value.repeatPassword,
          password: value
        })
      }
    },
    repeatPassword: {
      get (): string {
        return this.value.repeatPassword;
      },
      set (value: string) {
        this.$emit('input', {
          repeatPassword: value,
          password: this.value.password
        })
      }
    }
  },
  methods: {
    async getIsPasswordValid (): Promise<boolean> {
      const passwordValidator = this.$refs.passwordValidationProvider as InstanceType<typeof ValidationProvider>;
      const repeatPasswordValidator = this.$refs.repeatPasswordValidationProvider as InstanceType<typeof ValidationProvider>;

      const [passwordValidationResult, repeatPasswordValidationResult] = await Promise.all([
        passwordValidator.validate(),
        repeatPasswordValidator.validate()
      ]);

      return passwordValidationResult.valid && repeatPasswordValidationResult.valid;
    }
  }
});
</script>

<style lang="scss">
.m-password {
  ._input {
    margin: var(--password-inputs-margin, var(--spacer-base) 0);
  }
}
</style>
