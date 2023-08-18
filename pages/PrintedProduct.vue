<template>
  <div id="printed-product">
    <product-structured-data
      v-if="getCurrentProduct"
      :product="getCurrentProduct"
    />

    <o-printed-product-order-form
      :artwork-upload-url="artworkUploadUrl"
      :style-bundle-option-title="styleBundleOptionTitle"
      :product="getCurrentProduct"
      :selected-style="productDesign"
      :existing-cart-item="existingCartItem"
      @style-selected="onStyleSelected"
      v-if="showForm"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import config from 'config';
import { htmlDecode } from '@vue-storefront/core/filters';
import { catalogHooksExecutors } from '@vue-storefront/core/modules/catalog-next/hooks';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import CartItem from 'core/modules/cart/types/CartItem';

import { BundleOption } from 'core/modules/catalog/types/BundleOption';
import Product from 'core/modules/catalog/types/Product';

import { ProductStructuredData } from 'src/modules/budsies';

import OPrintedProductOrderForm from 'theme/components/organisms/o-printed-product-order-form.vue';

const shouldLoadStyleOptionsBodyPartsForProductSkus = [
  'customCartoonPillows_bundle'
];

export default Vue.extend({
  name: 'PrintedProduct',
  components: {
    OPrintedProductOrderForm,
    ProductStructuredData
  },
  props: {
    sku: {
      type: String,
      required: true
    },
    productDesign: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    existingPlushieId: {
      type: String as PropType<string | undefined>,
      default: undefined
    }
  },
  data () {
    return {
      isProductDesignSelectedByForm: false,
      isDataLoaded: false
    };
  },
  computed: {
    styleBundleOptionTitle (): string {
      return 'product';
    },
    getCurrentProduct (): Product | null {
      const product = this.$store.getters['product/getCurrentProduct'];
      if (!product?.sku || product.sku !== this.sku) {
        return null;
      }

      return product;
    },
    artworkUploadUrl () {
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
    showForm (): boolean {
      return this.isDataLoaded && !!this.getCurrentProduct;
    },
    styleBundleOption (): BundleOption | undefined {
      return this.getCurrentProduct?.bundle_options?.find(item => item.title.toLowerCase() === this.styleBundleOptionTitle);
    }
  },
  async serverPrefetch () {
    if (this.$ssrContext) this.$ssrContext.output.cacheTags.add('product')

    await (this as any).loadData();
  },
  async beforeMount () {
    if (!this.getCurrentProduct) {
      await this.loadData();
    }

    this.isDataLoaded = true;
  },
  beforeRouteLeave (to, from, next) {
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

      const productIds: number[] = [product.id];

      if (
        this.styleBundleOption &&
        shouldLoadStyleOptionsBodyPartsForProductSkus.includes(this.sku)
      ) {
        for (const productLink of this.styleBundleOption.product_links) {
          if (!productLink.product || !productLink.product.id) {
            continue;
          }

          productIds.push(+productLink.product.id);
        }
      }

      await Promise.all([
        this.$store.dispatch('budsies/loadExtraPhotosAddons', { productId: product.id }),
        this.$store.dispatch('budsies/loadProductsBodyParts', { productIds })
      ]);

      this.isDataLoaded = true;

      catalogHooksExecutors.productPageVisited(product);
    },
    onStyleSelected (value?: string): void {
      if (value === this.productDesign) {
        return;
      }

      this.isProductDesignSelectedByForm = true;

      this.$router.push({ query: { ...this.$route.query, product_design: value } });
    }
  },
  watch: {
    sku: async function () {
      await this.loadData();
    },
    productDesign () {
      if (this.isProductDesignSelectedByForm || !document.scrollingElement) {
        this.isProductDesignSelectedByForm = false;
        return;
      }

      document.scrollingElement.scrollTop = 0;
    }
  },
  metaInfo () {
    const description = this.getCurrentProduct?.meta_description || this.getCurrentProduct?.short_description;

    return {
      title: htmlDecode(
        this.getCurrentProduct?.meta_title || this.getCurrentProduct?.name
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
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#printed-product {
  box-sizing: border-box;
  padding: 0 1rem;

  ::v-deep {
    .product__colors button {
        border: 1px solid var(--c-light);
    }
  }

  @media (min-width: $tablet-min) {
    max-width: 1272px;
    width: 100%;
    margin: 0 auto;

    .o-printed-product-order-form {
      margin-top: var(--spacer-lg);
    }
  }
}

</style>
