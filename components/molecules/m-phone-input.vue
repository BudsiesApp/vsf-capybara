<template>
  <div class="phone-input">
    <div class="phone-input__country">
      <span
        class="phone-input__calling-code"
        aria-hidden="true"
      >
        +{{ callingCode }} ▾
      </span>
      <select
        :id="`${id}-country`"
        v-model="country"
        :aria-label="countryLabel"
        @change="update"
      >
        <option
          v-for="option in countries"
          :key="option.code"
          :value="option.code"
        >
          {{ option.name }} (+{{ option.callingCode }})
        </option>
      </select>
    </div>
    <SfInput
      :id="id"
      ref="input"
      v-model="text"
      class="phone-input__number"
      type="tel"
      autocomplete="tel"
      :label="$t('Phone number')"
      :required="required"
      :valid="!showError"
      :error-message="$t('Please enter a valid phone number')"
      @input="update"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { SfInput } from '@storefront-ui/vue';
import { getCountryCallingCode } from 'libphonenumber-js';
import { useI18n } from '@vue-storefront/core/application-services';
import { phoneCountries } from 'theme/helpers/phone-input';
import { usePhoneInput } from 'theme/helpers/use-phone-input';

export default defineComponent({
  name: 'MPhoneInput',
  components: {
    SfInput
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default: 'phone-number'
    },
    required: {
      type: Boolean,
      default: false
    },
    showError: {
      type: Boolean,
      default: false
    }
  },
  setup (props, { emit }) {
    const input = ref<{ $el: HTMLElement } | null>(null);
    const { country, text, update } = usePhoneInput(() => props.value, emit);
    const { t } = useI18n();
    const callingCode = computed(() => getCountryCallingCode(country.value));
    const countryLabel = computed(() => String(t('Country calling code')));

    function focus () {
      input.value?.$el.querySelector('input')?.focus();
    }

    return {
      input,
      country,
      text,
      update,
      focus,
      callingCode,
      countryLabel,
      countries: phoneCountries
    };
  }
});
</script>

<style lang="scss" scoped>
.phone-input {
  display: flex;
  align-items: flex-start;
  gap: var(--spacer-xs);
  width: 100%;

  &__country {
    position: relative;
    flex: 0 0 4.75rem;

    select {
      box-sizing: border-box;
      width: 100%;
      padding: var(--spacer-sm) 0 var(--spacer-xs);
      border: 0;
      border-bottom: 1px solid var(--c-light);
      background: transparent;
      color: transparent;
      appearance: none;
      font: var(--font-normal) var(--font-lg) / normal var(--font-family-secondary);

      option {
        color: var(--c-text);
      }
    }
  }

  &__calling-code {
    position: absolute;
    top: var(--spacer-sm);
    left: 0;
    pointer-events: none;
    color: var(--c-text);
    font: var(--font-normal) var(--font-lg) / 1.5rem var(--font-family-secondary);
    white-space: nowrap;
  }

  &__number {
    flex: 1;
    min-width: 0;
  }
}
</style>
