<template>
  <div v-if="needsRetry">
    <p>{{ $t('Order totals are unavailable. Refresh totals to continue.') }}</p>
    <SfButton :disabled="isRetrying || isBusy" @click="refreshTotals">
      {{ $t('Refresh totals') }}
    </SfButton>
  </div>
</template>

<script lang="ts">
import { SfButton } from '@storefront-ui/vue';
import { computed, defineComponent, ref } from 'vue';
import { useStore } from '@vue-storefront/core/application-services';
import { IS_TOTALS_SYNCING } from '@vue-storefront/core/modules/cart';
import { requirePaymentTotals } from '@vue-storefront/core/modules/checkout/helpers/require-payment-totals';

export default defineComponent({
  name: 'CheckoutTotalsRetry',
  components: { SfButton },
  props: { express: { type: Boolean, default: false } },
  setup (props) {
    const store = useStore();
    const hasPaymentTotals = computed(() => !!store.getters['cart/getPaymentTotals']);
    const isSyncingTotals = computed(() => store.getters[IS_TOTALS_SYNCING]);
    const needsRetry = computed(() => !hasPaymentTotals.value || (props.express && store.getters['cart/hasTotalsRefreshFailed']));
    const isBusy = computed(() => props.express ? store.getters['cart/isCartBusy'] : isSyncingTotals.value);
    const isRetrying = ref(false);

    async function refreshTotals (): Promise<void> {
      if (!needsRetry.value || isBusy.value || isRetrying.value) return;
      isRetrying.value = true;
      try {
        await store.dispatch('cart/syncTotals', { forceServerSync: true });
      } catch { /* Keep the retry available. */ } finally {
        isRetrying.value = false;
      }
      if (!hasPaymentTotals.value) requirePaymentTotals(store);
    }

    return { needsRetry, isBusy, isRetrying, refreshTotals };
  }
});
</script>
