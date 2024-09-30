<template>
  <a-custom-price
    :regular="price.regular"
    :special-price="price.special"
  />
</template>

<script>
import ACustomPrice from '../atoms/a-custom-price.vue';
import { getProductDefaultPrice } from 'src/modules/shared'

export default {
  name: 'AProductPrice',
  components: {
    ACustomPrice
  },
  props: {
    product: {
      type: Object,
      default: () => ({})
    },
    customOptions: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    campaignContent () {
      return this.$store.getters['promotionPlatform/campaignContent'];
    },
    price () {
      const _ = this.campaignContent;
      return getProductDefaultPrice(this.product, this.customOptions, false)
    }
  }
}
</script>
