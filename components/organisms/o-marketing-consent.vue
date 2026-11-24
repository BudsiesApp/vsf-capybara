<template>
  <div
    v-if="offered.email || offered.sms"
    class="o-marketing-consent"
  >
    <SfCheckbox
      v-if="offered.email"
      :selected="value.emailConsent"
      :disabled="disabled"
      class="o-marketing-consent__field"
      @change="update({ emailConsent: $event })"
    >
      <template #label>
        <span
          class="sf-checkbox__label"
          v-html="settings.emailConsentLabel"
        />
      </template>
    </SfCheckbox>

    <SfCheckbox
      v-if="offered.sms"
      :selected="value.smsConsent"
      :disabled="disabled"
      class="o-marketing-consent__field"
      @change="update({ smsConsent: $event })"
    >
      <template #label>
        <span
          class="sf-checkbox__label"
          v-html="settings.smsConsentLabel"
        />
      </template>
    </SfCheckbox>

    <MPhoneInput
      v-if="isPhoneRequired"
      ref="phoneInput"
      :value="value.phone"
      :required="true"
      :show-error="isPhoneErrorVisible"
      :disabled="disabled"
      class="o-marketing-consent__field"
      @input="onPhoneInput"
      @validity="isPhoneValid = $event"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, PropType, ref } from 'vue';
import { SfCheckbox } from '@storefront-ui/vue';

import { useMarketingConsentSettings } from 'src/modules/checkout-marketing-consent/composables/use-marketing-consent-settings';
import { MarketingConsentValue } from 'src/modules/checkout-marketing-consent/types/marketing-consent';

import MPhoneInput from 'theme/components/molecules/m-phone-input.vue';

interface PhoneInputHandle {
  focus(): void;
}

export default defineComponent({
  name: 'OMarketingConsent',
  components: {
    SfCheckbox,
    MPhoneInput
  },
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: {
      type: Object as PropType<MarketingConsentValue>,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup (props, { emit }) {
    const { settings, offered } = useMarketingConsentSettings();
    const phoneInput = ref<PhoneInputHandle | null>(null);
    const isPhoneValid = ref(false);
    const hasValidationFailed = ref(false);

    const isPhoneRequired = computed<boolean>(() => {
      return offered.value.sms && props.value.smsConsent;
    });
    const isPhoneErrorVisible = computed<boolean>(() => {
      return hasValidationFailed.value && !isPhoneValid.value;
    });

    function update (change: Partial<MarketingConsentValue>): void {
      emit('input', { ...props.value, ...change });
    }

    function onPhoneInput (phone: string): void {
      // An unfinished number is emitted as an empty string. The last valid
      // phone is kept, but the change still has to reach the parent as an edit.
      update({ phone: phone || props.value.phone });
    }

    function validate (): boolean {
      const isValid = !isPhoneRequired.value || isPhoneValid.value;

      hasValidationFailed.value = !isValid;

      if (isValid) {
        return true;
      }

      nextTick(() => phoneInput.value?.focus());

      return false;
    }

    return {
      settings,
      offered,
      phoneInput,
      isPhoneValid,
      isPhoneRequired,
      isPhoneErrorVisible,
      update,
      onPhoneInput,
      validate
    };
  }
});
</script>

<style lang="scss" scoped>
.o-marketing-consent {
  width: 100%;

  &__field {
    margin: 0 0 var(--spacer-sm) 0;
  }
}
</style>
