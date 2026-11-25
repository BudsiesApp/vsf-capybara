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
import { defineComponent } from 'vue';
import { IS_TOTALS_SYNCING } from '@vue-storefront/core/modules/cart';
import { requirePaymentTotals } from '@vue-storefront/core/modules/checkout/helpers/require-payment-totals';

export default defineComponent({
  name: 'CheckoutTotalsRetry',
  components: { SfButton },
  data () {
    return { isRetrying: false };
  },
  computed: {
    hasPaymentTotals () { return !!this.$store.getters['cart/getPaymentTotals']; },
    isSyncingTotals () { return this.$store.getters[IS_TOTALS_SYNCING]; }
  },
  methods: {
    async refreshTotals () {
      if (this.hasPaymentTotals || this.isSyncingTotals || this.isRetrying) return;
      this.isRetrying = true;
      try {
        await this.$store.dispatch('cart/syncTotals', { forceServerSync: true });
      } catch { /* Keep the retry available. */ } finally {
        this.isRetrying = false;
      }
      if (!this.hasPaymentTotals) requirePaymentTotals(this.$store);
    }
  }
});
</script>
