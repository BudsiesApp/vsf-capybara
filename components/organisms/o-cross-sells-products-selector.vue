<template>
  <div
    class="o-cross-sells-products-selector"
    v-if="productOptions.length"
  >
    <SfHeading
      :level="3"
      :title="$t('Optional upgrades:')"
      class="_title"
    />

    <m-addons-selector
      class="_selector"
      v-model="selectedProducts"
      :addons="productOptions"
      :disabled="isDisabled"
      :get-field-anchor-name="getFieldAnchorName"
    />
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent, onBeforeMount, onServerPrefetch, toRefs } from '@vue/composition-api';
import { SfHeading } from '@storefront-ui/vue';

import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { getProductGallery } from '@vue-storefront/core/modules/catalog/helpers';
import CampaignContent from 'src/modules/promotion-platform/types/CampaignContent.model';
import { PriceHelper } from 'src/modules/shared';
import { getFinalPrice } from 'src/modules/shared/helpers/price';

import { CROSS_SELL, useRelatedProducts } from 'theme/helpers/use-related-products';
import { getFieldAnchorName } from 'theme/helpers/use-form-validation';

import AddonOption from '../interfaces/addon-option.interface';

import MAddonsSelector from '../molecules/m-addons-selector.vue';

function getAddonOptionFromProduct (
  product: Product,
  productPriceDictionary: Record<string, PriceHelper.ProductPrice>
): AddonOption {
  const price = productPriceDictionary[product.id];

  return {
    id: product.id as number,
    sku: product.sku,
    name: product.name,
    description: product.short_description || '',
    price: getFinalPrice(price),
    specialPrice: price.special,
    regularPrice: price.regular,
    images: getProductGallery(product).map((item: any) => item.src),
    optionId: product.id as number,
    optionValueId: product.id as number
  }
}

export default defineComponent({
  name: 'OCrossSellsProductsSelector',
  props: {
    value: {
      type: Array as PropType<Product[]>,
      default: () => []
    },
    product: {
      type: Object as PropType<Product>,
      required: true
    }
  },
  components: {
    MAddonsSelector,
    SfHeading
  },
  setup (props) {
    const {
      relatedProducts,
      loadList,
      getRelatedProductById
    } = useRelatedProducts(
      toRefs(props).product,
      CROSS_SELL,
      true
    );

    onServerPrefetch(() => {
      return loadList();
    });

    onBeforeMount(() => {
      return loadList();
    })

    return {
      relatedProducts,
      getRelatedProductById,
      getFieldAnchorName
    }
  },
  computed: {
    isDisabled (): boolean {
      return this.$store.getters['cart/getIsAdding'];
    },
    productPriceDictionary (): Record<string, PriceHelper.ProductPrice> {
      return this.$store.getters['product/productPriceDictionary'];
    },
    productOptions (): AddonOption[] {
      return this.relatedProducts.map(
        (product) => getAddonOptionFromProduct(
          product,
          this.productPriceDictionary
        )
      );
    },
    selectedProducts: {
      get (): number[] {
        return this.value.map((product) => product.id as number);
      },
      set (value: number[]) {
        this.$emit(
          'input',
          value.map(
            (optionId) => this.getRelatedProductById(
              optionId
            )
          )
        );
      }
    }
  }
})
</script>

<style lang="scss">
.o-cross-sells-products-selector {
  ._title {
    text-align: start;
  }

  ._selector {
    margin-top: var(--spacer-base);
  }
}
</style>
