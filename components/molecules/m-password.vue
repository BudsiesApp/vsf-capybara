<template>
  <div class="m-password">
    <SfInput
      v-model="password"
      type="password"
      class="_input sf-input--required"
      name="password"
      :has-show-password="true"
      :label="$t('Password')"
      :valid="!$v.value.password || !$v.value.password.$error"
      :error-message="
        !$v.value.password || !$v.value.password.required
          ? $t('Field is required')
          : $t('Password must have at least 6 symbols.')
      "
      @blur="() => $v.value.password && $v.value.password.$touch()"
    />

    <SfInput
      v-model="repeatPassword"
      type="password"
      class="_input sf-input--required"
      name="password-confirm"
      :has-show-password="true"
      :label="$t('Repeat password')"
      :valid="!$v.value.repeatPassword || !$v.value.repeatPassword.$error"
      :error-message="
        !$v.value.repeatPassword || !$v.value.repeatPassword.required
          ? $t('Field is required')
          : $t('Passwords must be identical.')
      "
      @blur="() => $v.value.repeatPassword && $v.value.repeatPassword.$touch()"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { required, minLength, sameAs } from 'vuelidate/lib/validators';
import { SfInput } from '@storefront-ui/vue';

export default Vue.extend({
  components: {
    SfInput
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
  validations: {
    value: {
      password: {
        required,
        minLength: minLength(6)
      },
      repeatPassword: {
        required,
        sameAsPassword: sameAs('password')
      }
    }
  },
  methods: {
    getIsPasswordValid (): boolean {
      this.$v.$touch();

      return !this.$v.$invalid;
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
