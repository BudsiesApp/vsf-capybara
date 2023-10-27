<template>
  <SfButton
    class="a-add-to-cart sf-button--full-width"
    :disabled="isProductDisabled"
    @click.native="addToCart"
  >
    {{ $t('Add to cart') }}
  </SfButton>
</template>

<script>
import { SfButton } from '@storefront-ui/vue';
import { formatProductMessages } from '@vue-storefront/core/filters/product-messages';
import { notifications } from '@vue-storefront/core/modules/cart/helpers';
import { mapGetters } from 'vuex';
import ServerError from 'src/modules/shared/types/server-error';
import { CART_ADDING_ITEM } from '@vue-storefront/core/modules/cart/store/mutation-types'
import { cartHooksExecutors } from '@vue-storefront/core/modules/cart/hooks';
import throwServerErrorFromDiffLog from '@vue-storefront/core/modules/cart/helpers/throwServerErrorFromDiffLog';

export default {
  name: 'AAddToCart',
  components: {
    SfButton
  },
  props: {
    product: {
      required: true,
      type: Object
    },
    disabled: {
      type: Boolean,
      default: false
    },
    qty: {
      type: Number,
      default: 1
    },
    additionalProducts: {
      type: Array,
      default: () => ([])
    }
  },
  computed: {
    ...mapGetters({
      isAddingToCart: 'cart/getIsAdding'
    }),
    isProductDisabled () {
      return (
        this.disabled ||
        formatProductMessages(this.product.errors) !== '' ||
        this.isAddingToCart
      );
    }
  },
  methods: {
    async addToCart () {
      try {
        const productsToAdd = [
          this.product,
          ...this.additionalProducts
        ].map((product) => {
          const productToAdd = Object.assign({}, product, { qty: this.qty })
          const { cartItem } = cartHooksExecutors.beforeAddToCart({ cartItem: productToAdd })
          return cartItem;
        });

        this.$store.commit(`cart/${CART_ADDING_ITEM}`, { isAdding: true })

        const diffLog = await this.$store.dispatch('cart/addItems', {
          productsToAdd
        });

        throwServerErrorFromDiffLog(diffLog);

        diffLog.clientNotifications.forEach(notificationData => {
          notificationData.type = 'info'
          notificationData.timeToLive = 10 * 1000

          this.$store.dispatch(
            'notification/spawnNotification',
            notificationData,
            { root: true }
          );
        });
      } catch (error) {
        if (!(error instanceof ServerError)) {
          return;
        }

        this.$store.dispatch(
          'notification/spawnNotification',
          notifications.createNotification({ type: 'danger', message: error, timeToLive: 10 * 1000 }),
          { root: true }
        );
      } finally {
        this.$store.commit(`cart/${CART_ADDING_ITEM}`, { isAdding: false })
      }
    }
  }
};
</script>
