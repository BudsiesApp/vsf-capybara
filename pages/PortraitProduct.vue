<template>
  <div id="portrait-product">
    <product-structured-data
      v-if="getCurrentProduct"
      :product="getCurrentProduct"
    />

    <o-portrait-product-order-form
      v-if="getCurrentProduct && isDataLoaded"
      :artwork-upload-step-title="artworkUploadStepTitle"
      :artwork-upload-url="artworkUploadUrl"
      :existing-cart-item="existingCartItem"
      :name-step-hint="nameStepHint"
      :name-step-title="nameStepTitle"
      :product="getCurrentProduct"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import config from 'config';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { htmlDecode } from '@vue-storefront/core/filters';
import { catalogHooksExecutors } from '@vue-storefront/core/modules/catalog-next/hooks';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';

import CartItem from 'core/modules/cart/types/CartItem';
import Product from 'core/modules/catalog/types/Product';

import { ProductStructuredData } from 'src/modules/budsies';
import { ProductEvent } from 'src/modules/shared';

import OPortraitProductOrderForm from 'theme/components/organisms/o-portrait-product-order-form.vue';

export default Vue.extend({
  name: 'PortraitProduct',
  components: {
    OPortraitProductOrderForm,
    ProductStructuredData
  },
  props: {
    sku: {
      type: String,
      required: true
    },
    existingPlushieId: {
      type: String as PropType<string | undefined>,
      default: undefined
    }
  },
  data () {
    return {
      isDataLoaded: false
    };
  },
  computed: {
    artworkUploadStepTitle (): string {
      return this.$t('Upload photo').toString();
    },
    getCurrentProduct (): Product | null {
      const product = this.$store.getters['product/getCurrentProduct'];
      if (!product?.sku || product.sku !== this.sku) {
        return null;
      }

      return product;
    },
    artworkUploadUrl (): string {
      return config.images.fileuploaderUploadUrl;
    },
    cartItems (): CartItem[] {
      return this.$store.getters['cart/getCartItems'];
    },
    existingCartItem (): CartItem | undefined {
      if (!this.existingPlushieId) {
        return;
      }

      return this.cartItems.find((item) => item.plushieId && item.plushieId === this.existingPlushieId);
    },
    nameStepHint (): string {
      return this.$t('<strong>Please note:</strong> Write exactly what you\'d like printed above the pet\'s photo here. It\'s printed as written. If you have multiple pets, you can separate each pet\'s name with a comma or "&". Next, select "Add more pets" below and upload each pet\'s photo separately in the order you wrote their names. Pets will be positioned from left to right in the order below, 1, 2, 3, etc.')
        .toString()
    },
    nameStepTitle (): string {
      return this.$t('Name').toString();
    }
  },
  async serverPrefetch (): Promise<void> {
    if (this.$ssrContext) this.$ssrContext.output.cacheTags.add('product')

    await (this as any).loadData();
  },
  async beforeMount (): Promise<void> {
    if (!this.getCurrentProduct) {
      await this.loadData();
    }

    this.isDataLoaded = true;
    EventBus.$emit(ProductEvent.PRODUCT_PAGE_SHOW, this.getCurrentProduct);
  },
  beforeRouteLeave (to, from, next): void {
    this.$store.commit(`product/${PRODUCT_UNSET_CURRENT}`);
    next();
  },
  methods: {
    async loadData (): Promise<void> {
      this.isDataLoaded = false;

      const product = await this.$store.dispatch('product/loadProduct', {
        parentSku: this.sku,
        setCurrent: true
      });

      await this.$store.dispatch('budsies/loadExtraPhotosAddons', { productId: product.id });

      this.isDataLoaded = true;

      catalogHooksExecutors.productPageVisited(product);
    }
  },
  metaInfo () {
    const description = this.getCurrentProduct?.meta_description || this.getCurrentProduct?.short_description;

    return {
      title: htmlDecode(
        (this.getCurrentProduct?.meta_title || this.getCurrentProduct?.name || this.$t('Photo Portraits')).toString()
      ),
      meta: description
        ? [
          {
            vmid: 'description',
            name: 'description',
            content: htmlDecode(description)
          }
        ]
        : []
    };
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#portrait-product {
  box-sizing: border-box;
  padding: 0 var(--spacer-sm);

  @media (min-width: $tablet-min) {
    max-width: 1272px;
    width: 100%;
    margin: 0 auto;

    .o-portrait-product-order-form {
      margin-top: var(--spacer-lg);
    }
  }
}
</style>
