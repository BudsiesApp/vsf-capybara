<template>
  <div id="customizable-product" :class="`-${formComponent}`">
    <product-structured-data v-if="currentProduct" :product="currentProduct" />

    <component
      :can-use-persisted-customization-state="canUsePersistedCustomizationState"
      :is="formComponent"
      :product="currentProduct"
      :existing-cart-item="existingCartItem"
      v-if="showForm"
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  ref,
  toRefs
} from '@vue/composition-api';

import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import { htmlDecode } from '@vue-storefront/core/filters';

import { ProductStructuredData } from 'src/modules/budsies';

import { useExistingCartItem } from 'theme/helpers/use-existing-cart-item';
import { useProductPage } from 'theme/helpers/use-product-page';

enum LayoutType {
  WITH_IMAGES_GALLERY = 'with-images-gallery',
  VERTICAL = 'vertical',
  PHRASE_PILLOW = 'phrase-pillow',
}

export default defineComponent({
  name: 'CustomizableProduct',
  components: {
    FormWithImagesGallery: () =>
      import(
        /* webpackChunkName: "vsf-images-gallery-form" */ 'theme/components/customization-system/forms/form-with-images-gallery.vue'
      ),
    ProductStructuredData,
    PhrasePillowForm: () =>
      import(
        /* webpackChunkName: "vsf-phrase-pillow-form" */ 'theme/components/customization-system/forms/phrase-pillow-form.vue'
      ),
    VerticalStepsForm: () =>
      import(
        /* webpackChunkName: "vsf-vertical-form" */ 'theme/components/customization-system/forms/vertical-steps-form.vue'
      )
  },
  props: {
    sku: {
      type: String,
      required: true
    },
    existingPlushieId: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    layout: {
      type: String as PropType<LayoutType>,
      default: () => LayoutType.WITH_IMAGES_GALLERY
    }
  },
  setup (props, context) {
    const { existingPlushieId, sku } = toRefs(props);

    const { currentProduct, isDataLoaded } = useProductPage(sku, context);
    const canUsePersistedCustomizationState = ref<boolean>(false);

    const showForm = computed<boolean>(() => {
      return isDataLoaded.value && !!currentProduct.value;
    });
    const formComponent = computed<string>(() => {
      switch (props.layout) {
        case LayoutType.WITH_IMAGES_GALLERY:
          return 'form-with-images-gallery';
        case LayoutType.VERTICAL:
          return 'vertical-steps-form';
        case LayoutType.PHRASE_PILLOW:
          return 'phrase-pillow-form';
      }
    });

    return {
      ...useExistingCartItem(existingPlushieId, context),
      canUsePersistedCustomizationState,
      currentProduct,
      formComponent,
      showForm
    };
  },
  beforeRouteEnter (to, from, next) {
    next((vm) => {
      (vm as any).canUsePersistedCustomizationState = !from || to.path === from.path;
    });
  },
  beforeRouteLeave (to, from, next) {
    this.$store.commit(`product/${PRODUCT_UNSET_CURRENT}`);
    next();
  },
  metaInfo () {
    const description =
      this.currentProduct?.meta_description ||
      this.currentProduct?.short_description;

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

  &.-phrase-pillow-form {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding: 0;
  }

  @media (min-width: $tablet-min) {
    max-width: 1272px;
    width: 100%;
    margin: 0 auto;

    &.-phrase-pillow-form {
      margin-top: 60px;
    }
  }
}
</style>
