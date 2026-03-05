<template>
  <div
    class="storyblok-paypal-pay-later-messaging"
    :class="cssClasses"
    :style="styles"
  >
    <editor-block-icons :item="item" />

    <PayPalPayLaterMessaging
      v-if="amount > 0"
      :amount="amount"
      :alignment="alignment"
      placement="product"
    />
  </div>
</template>

<script lang="ts">
import { VueConstructor } from 'vue';

import { PRODUCT_PRICE_DICTIONARY } from '@vue-storefront/core/modules/catalog';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { registerModule } from '@vue-storefront/core/lib/modules'
import { PriceHelper } from 'src/modules/shared';
import { Blok } from 'src/modules/vsf-storyblok-module/components';
import PayPalPayLaterMessaging from 'src/modules/payment-braintree/components/PayPalPayLaterMessaging.vue';
import { Braintree } from 'src/modules/payment-braintree';

import PayPalPayLaterMessageData from './interfaces/paypal-pay-later-message-data.interface';

export default (Blok as VueConstructor<InstanceType<typeof Blok>>).extend({
  name: 'StoryblokPayPalPayLaterMessaging',
  components: {
    PayPalPayLaterMessaging
  },
  data () {
    return {
      product: undefined as Product | undefined
    }
  },
  computed: {
    itemData (): PayPalPayLaterMessageData {
      return this.item as PayPalPayLaterMessageData;
    },
    productPriceDictionary (): Record<string, PriceHelper.ProductPrice> {
      return this.$store.getters[PRODUCT_PRICE_DICTIONARY];
    },
    amount (): number {
      if (!this.product) {
        return 0;
      }

      const price = this.productPriceDictionary[this.product.id];

      return PriceHelper.getFinalPrice(price);
    },
    alignment (): string {
      return this.itemData.alignment;
    }
  },
  beforeMount (): void {
    registerModule(Braintree)
  },
  async created (): Promise<void> {
    await this.loadProduct();
  },
  methods: {
    async loadProduct (): Promise<void> {
      if (!this.itemData.product) {
        return;
      }

      this.product = await this.$store.dispatch(
        'product/single',
        {
          options: {
            id: this.itemData.product
          },
          key: 'id',
          skipCache: false
        }
      );
    }
  }
});
</script>
