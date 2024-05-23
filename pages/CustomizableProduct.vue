<template>
  <div id="customizable-product">
    <product-structured-data
      v-if="currentProduct"
      :product="currentProduct"
    />

    <form-with-images-gallery
      :product="currentProduct"
      :existing-cart-item="existingCartItem"
      v-if="showForm"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs } from '@vue/composition-api';

import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import { htmlDecode } from '@vue-storefront/core/filters';

import { ProductStructuredData } from 'src/modules/budsies';

import { useExistingCartItem } from 'theme/helpers/use-existing-cart-item';
import { useProductPage } from 'theme/helpers/use-product-page';

import FormWithImagesGallery from 'theme/components/customization-system/forms/form-with-images-gallery.vue';

export default defineComponent({
  name: 'CustomizableProduct',
  components: {
    FormWithImagesGallery,
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
  setup (props, context) {
    const { existingPlushieId, sku } = toRefs(props);

    const { currentProduct, isDataLoaded } = useProductPage(sku, context);

    const showForm = computed<boolean>(() => {
      return isDataLoaded.value && !!currentProduct.value;
    });

    return {
      ...useExistingCartItem(existingPlushieId, context),
      currentProduct,
      showForm
    }
  },
  beforeRouteLeave (to, from, next) {
    this.$store.commit(`product/${PRODUCT_UNSET_CURRENT}`);
    next();
  },
  metaInfo () {
    const description = this.currentProduct?.meta_description || this.currentProduct?.short_description;

    return {
      title: htmlDecode(
        this.currentProduct?.meta_title || this.currentProduct?.name
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

  #customizable-product {
    box-sizing: border-box;
    padding: 0 1rem;

    .form-with-images-gallery {
      margin-top: var(--spacer-lg);
    }

    @media (min-width: $tablet-min) {
      max-width: 1272px;
      width: 100%;
      margin: 0 auto;
    }
  }
  </style>
