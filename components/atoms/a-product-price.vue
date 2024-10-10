<template>
  <a-custom-price
    :regular="price.regular"
    :special-price="price.special"
  />
</template>

<script>
import ACustomPrice from '../atoms/a-custom-price.vue';

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
    productPriceDictionary () {
      return this.$store.getters['product/productPriceDictionary'];
    },
    price () {
      return this.productPriceDictionary[this.product.id];
    }
  }
}
</script>
