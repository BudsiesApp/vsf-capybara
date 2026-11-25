<template>
  <section v-if="orderId && email && (channels.email || channels.sms)" class="marketing-subscription">
    <p v-if="completed" class="marketing-subscription__acknowledgment">
      {{ $t('Thank you! Your subscription preferences have been saved.') }}
    </p>
    <form v-else novalidate @submit.prevent="submit">
      <h2>{{ $t('Get The Latest Deals & Updates') }}</h2>
      <p class="marketing-subscription__description">
        {{ $t('Sign up for early access to sales, updates on products and holiday deadlines.') }}
      </p>
      <p>{{ $t('We\'ll send emails to {email}.', { email }) }}</p>
      <OMarketingConsent ref="consentControl" v-model="draft" :channels="channels" :always-show-phone="true" :disabled="pending" />
      <SfButton type="submit" class="marketing-subscription__button color-primary" :disabled="pending || !hasSelection">
        {{ $t('Subscribe') }}
      </SfButton>
      <component :is="link.component" v-for="link in privacyPolicyLinks" :key="link.key" />
    </form>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { SfButton } from '@storefront-ui/vue';
import { useI18n, useStore } from '@vue-storefront/core/application-services';
import { AdditionalContentEntry, AdditionalContentOutlet, useAdditionalContent } from '@vue-storefront/core/additional-content';
import { notifications } from '@vue-storefront/core/modules/cart/helpers';
import { ConsentAvailability, MarketingConsentValue, MarketingSubscriptionRequest, remainingConsentChannels, SUBMIT_SUBSCRIPTION_ACTION, useMarketingConsentSettings } from 'src/modules/checkout-marketing-consent';
import OMarketingConsent from 'theme/components/organisms/o-marketing-consent.vue';

interface ConsentControl { validate(): boolean }

export default defineComponent({
  name: 'MMarketingSubscriptionForm',
  components: { OMarketingConsent, SfButton },
  props: {
    orderId: { type: [Number, String] as PropType<number | string>, default: undefined },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    acceptedChannels: { type: Object as PropType<ConsentAvailability>, required: true }
  },
  setup (props) {
    const store = useStore();
    const i18n = useI18n();
    const { settings } = useMarketingConsentSettings();
    const channels = computed(() => remainingConsentChannels(settings.value, props.acceptedChannels));
    const draft = ref<MarketingConsentValue>({ emailConsent: false, smsConsent: false, phone: props.phone });
    const consentControl = ref<ConsentControl | null>(null);
    const pending = ref(false);
    const completed = ref(false);
    const hasSelection = computed(() => (channels.value.email && draft.value.emailConsent) || (channels.value.sms && draft.value.smsConsent));
    const privacyPolicyLinks = useAdditionalContent(AdditionalContentOutlet.PRIVACY_POLICY_LINKS) as unknown as readonly AdditionalContentEntry[];

    async function submit (): Promise<void> {
      if (pending.value || !hasSelection.value || !consentControl.value?.validate()) return;
      const payload: MarketingSubscriptionRequest = { orderId: props.orderId, email: props.email };
      if (channels.value.email) payload.emailConsent = draft.value.emailConsent;
      if (channels.value.sms) {
        payload.smsConsent = draft.value.smsConsent;
        if (draft.value.smsConsent) payload.phone = draft.value.phone;
      }
      pending.value = true;
      try {
        await store.dispatch(SUBMIT_SUBSCRIPTION_ACTION, payload);
        completed.value = true;
      } catch (error) {
        store.dispatch('notification/spawnNotification', notifications.createNotification({
          type: 'danger', message: i18n.t('Something went wrong') as string, timeToLive: 10000
        }), { root: true });
      } finally {
        pending.value = false;
      }
    }
    return { channels, draft, consentControl, pending, completed, hasSelection, privacyPolicyLinks, submit };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
.marketing-subscription {
  background: transparent;
  border: 1px solid var(--c-secondary);
  margin: var(--spacer-lg) auto;
  padding: var(--spacer-sm) var(--spacer-xs);
  max-width: 640px;
  box-sizing: border-box;
  h2, &__description, &__acknowledgment { text-align: center; }
  --privacy-notice-link-display: block;
  h2 { margin-top: 0; }
  &__acknowledgment { margin: 0; }
  &__button {
    display: block;
    width: 100%;
    margin: 0;

    &:disabled { opacity: 0.5; }
  }
  @include for-desktop {
    padding: var(--spacer-sm);
    &__button { width: auto; margin-left: auto; }
  }
}
</style>
