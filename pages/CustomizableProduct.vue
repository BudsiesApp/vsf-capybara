<template>
  <div id="customizable-product" :class="`-${formComponent}`">
    <product-structured-data v-if="currentProduct" :product="currentProduct" />

    <component
      :can-use-persisted-customization-state="canUsePersistedCustomizationState"
      :is="formComponent"
      :product="currentProduct"
      :existing-cart-item="existingCartItem"
      :image-url="imageUrl"
      @hook:mounted="onFormMounted"
      v-if="showForm"
    />

    <template v-if="formPlaceholderComponent">
      <component
        :is="formPlaceholderComponent"
        class="_placeholder"
        v-show="showPlaceholder"
      />
    </template>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  ref,
  toRefs,
  watch
} from 'vue';

import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import { htmlDecode } from '@vue-storefront/core/filters';
import { isServer } from '@vue-storefront/core/helpers';

import { ProductStructuredData } from 'src/modules/budsies';
import { getCanonicalUrl, useRootInstance } from 'src/modules/shared';

import { useExistingCartItem } from 'theme/helpers/use-existing-cart-item';
import { useProductPage } from 'theme/helpers/use-product-page';

import FormWithImagesGalleryPlaceholder from 'theme/components/customization-system/forms/placeholders/form-with-images-gallery-placeholder.vue';
import VerticalStepsFormPlaceholder from 'theme/components/customization-system/forms/placeholders/vertical-steps-form-placeholder.vue';
import PhrasePillowFormPlaceholder from 'theme/components/customization-system/forms/placeholders/phrase-pillow-form-placeholder.vue';

enum LayoutType {
  WITH_IMAGES_GALLERY = 'with-images-gallery',
  VERTICAL = 'vertical',
}

export default defineComponent({
  name: 'CustomizableProduct',
  components: {
    FormWithImagesGalleryPlaceholder,
    FormWithImagesGallery: () =>
      import(
        /* webpackChunkName: "vsf-images-gallery-form" */ 'theme/components/customization-system/forms/form-with-images-gallery.vue'
      ),
    ProductStructuredData,
    VerticalStepsForm: () =>
      import(
        /* webpackChunkName: "vsf-vertical-form" */ 'theme/components/customization-system/forms/vertical-steps-form.vue'
      ),
    VerticalStepsFormPlaceholder
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
    const root = useRootInstance();
    const { existingPlushieId, sku } = toRefs(props);

    const { currentProduct, isDataLoaded } = useProductPage(sku);
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
      }
    });
    const formPlaceholderComponent = computed<string | undefined>(() => {
      switch (props.layout) {
        case LayoutType.WITH_IMAGES_GALLERY:
          return 'form-with-images-gallery-placeholder';
        case LayoutType.VERTICAL:
          return 'vertical-steps-form-placeholder';
        default:
          return undefined;
      }
    });

    const isFormMounted = ref(isServer);
    const isLeavePage = ref(false);

    function onFormMounted () {
      isFormMounted.value = true;
    }

    const showPlaceholder = computed<boolean>(() => {
      return !isLeavePage.value && (!showForm.value || !isFormMounted.value);
    });

    watch(
      sku,
      (newValue, oldValue) => {
        if (newValue === oldValue) {
          return;
        }

        isFormMounted.value = false;
        isLeavePage.value = false;
      }
    );

    const imageUrl = computed<string | undefined>(() => {
      let url = root.$route.query['image-url'];

      if (Array.isArray(url)) {
        url = url[0] || '';
      }

      if (!url) {
        return;
      }

      return url;
    });

    return {
      ...useExistingCartItem(existingPlushieId),
      canUsePersistedCustomizationState,
      currentProduct,
      imageUrl,
      formComponent,
      formPlaceholderComponent,
      isLeavePage,
      onFormMounted,
      showForm,
      showPlaceholder
    };
  },
  beforeRouteEnter (to, from, next) {
    next((vm) => {
      (vm as any).canUsePersistedCustomizationState = !from || to.path === from.path;
    });
  },
  beforeRouteLeave (to, from, next) {
    this.$store.commit(`product/${PRODUCT_UNSET_CURRENT}`);
    this.isLeavePage = true;
    next();
  },
  metaInfo () {
    const description =
      this.currentProduct?.meta_description ||
      this.currentProduct?.short_description;

    const meta: any[] = [];

    if (description) {
      meta.push(
        {
          vmid: 'description',
          name: 'description',
          content: htmlDecode(description)
        }
      );
    }

    return {
      title: htmlDecode(
        this.currentProduct?.meta_title || this.currentProduct?.name || ''
      ),
      meta,
      link: [
        {
          rel: 'canonical',
          href: getCanonicalUrl(this.$ssrContext, this.$router)
        }
      ]
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#customizable-product {
  box-sizing: border-box;
  padding: 0 1rem;

  .form-with-images-gallery,
  .form-with-images-gallery-placeholder {
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
