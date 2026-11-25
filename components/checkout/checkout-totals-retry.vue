<template>
  <div v-if="!hasPaymentTotals">
    <p>{{ $t('Order totals are unavailable. Refresh totals to continue.') }}</p>
    <SfButton :disabled="isRetrying || isSyncingTotals" @click="refreshTotals">
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
  setup () {
    const store = useStore();
    const hasPaymentTotals = computed(() => !!store.getters['cart/getPaymentTotals']);
    const isSyncingTotals = computed(() => store.getters[IS_TOTALS_SYNCING]);
    const isRetrying = ref(false);

    async function refreshTotals (): Promise<void> {
      if (hasPaymentTotals.value || isSyncingTotals.value || isRetrying.value) return;
      isRetrying.value = true;
      try {
        await store.dispatch('cart/syncTotals', { forceServerSync: true });
      } catch { /* Keep the retry available. */ } finally {
        isRetrying.value = false;
      }
      if (!hasPaymentTotals.value) requirePaymentTotals(store);
    }

    return { hasPaymentTotals, isSyncingTotals, isRetrying, refreshTotals };
  }
});
</script>
