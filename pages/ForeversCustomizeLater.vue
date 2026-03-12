<template>
  <div id="forevers-customize-later">
    <product-structured-data v-if="currentProduct" :product="currentProduct" />

    <div v-if="activeProduct" class="_form-container">
      <form-with-images-gallery
        :can-use-persisted-customization-state="canUsePersistedCustomizationState"
        :customization-availability-flow="customizationAvailabilityFlow"
        :existing-cart-item="existingCartItem"
        :key="activeProduct.sku"
        :product="activeProduct"
      >
        <template #product-details-extra>
          <div class="_product-type-buttons">
            <button
              v-for="button in productTypeButtonsList"
              :key="button.type"
              class="_product-type-button"
              :class="{ '-active': selectedProductType === button.type, '-disabled': isSelectorDisabled }"
              type="button"
              :disabled="isSelectorDisabled"
              @click="onProductTypeClick(button.type)"
            >
              <img :src="button.imageSrc" :alt="button.title" class="_product-type-button-image">
              <span>{{ button.title }}</span>
            </button>
          </div>
        </template>
      </form-with-images-gallery>
    </div>
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
} from '@vue/composition-api';
import { SfHeading } from '@storefront-ui/vue';

import { htmlDecode } from '@vue-storefront/core/filters';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import Product from 'core/modules/catalog/types/Product';
import { ProductStructuredData } from 'src/modules/budsies';
import {
  CustomizationAvailabilityFlow,
  updateProductProductionTimeCustomizationData
} from 'src/modules/customization-system';
import { getCanonicalUrl } from 'src/modules/shared';

import ProductTypeButton from 'theme/components/interfaces/product-type-button.interface';
import FormWithImagesGallery from 'theme/components/customization-system/forms/form-with-images-gallery.vue';
import MBlockStory from 'theme/components/molecules/m-block-story.vue';
import getForeversTypeByBundleSku from 'theme/helpers/get-forevers-type-by-bundle-sku.function';
import { useExistingCartItem } from 'theme/helpers/use-existing-cart-item';
import getPlushieSkuByTypes from 'theme/helpers/get-plushie-sku-by-types.function';
import PlushieProductType from 'theme/interfaces/plushie-product-type';
import { PlushieType } from 'theme/interfaces/plushie.type';
import i18n from '@vue-storefront/core/i18n';

export default defineComponent({
  name: 'ForeversCustomizeLater',
  components: {
    FormWithImagesGallery,
    MBlockStory,
    ProductStructuredData,
    SfHeading
  },
  props: {
    existingPlushieId: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    preselectedProductType: {
      type: String as PropType<string | undefined>,
      default: undefined
    }
  },
  setup (props, context) {
    const { existingPlushieId, preselectedProductType } = toRefs(props);
    const plushieType = ref<PlushieType>(PlushieType.FOREVERS);
    const canUsePersistedCustomizationState = ref<boolean>(false);
    const customizationAvailabilityFlow = ref<CustomizationAvailabilityFlow>(
      CustomizationAvailabilityFlow.CUSTOMIZE_LATER_PURCHASE
    );
    const isProductsLoading = ref<boolean>(false);
    const preloadedProductsByType = ref<Record<string, Product>>({});

    const foreversProductTypeButtons = computed<ProductTypeButton[]>(() => {
      return [
        {
          title: i18n.t('Forevers Dog').toString(),
          type: PlushieProductType.DOG,
          imageSrc: '/assets/plushies/dog-icon1_1.png'
        },
        {
          title: i18n.t('Forevers Cat').toString(),
          type: PlushieProductType.CAT,
          imageSrc: '/assets/plushies/cat-icon1_1.png'
        },
        {
          title: i18n.t('Forevers Other').toString(),
          type: PlushieProductType.OTHER,
          imageSrc: '/assets/plushies/other-icon1_1.png'
        }
      ];
    });

    const { existingCartItem } = useExistingCartItem(existingPlushieId, context);
    const isSelectorDisabled = computed<boolean>(() => {
      return !!existingCartItem.value;
    });

    const selectedProductType = ref<string | undefined>(preselectedProductType.value);

    const currentProduct = computed<Product | undefined>(
      () => context.root.$store.getters['product/getCurrentProduct']
    );

    const activeProduct = computed<Product | undefined>(() => {
      if (!selectedProductType.value) {
        return currentProduct.value;
      }

      return preloadedProductsByType.value[selectedProductType.value] || currentProduct.value;
    });

    function getDefaultProductType (): string {
      if (existingCartItem.value?.sku) {
        return getForeversTypeByBundleSku(existingCartItem.value.sku);
      }

      if (preselectedProductType.value) {
        return preselectedProductType.value;
      }

      return foreversProductTypeButtons.value[0].type;
    }

    async function loadProductBySku (sku: string): Promise<Product | undefined> {
      let [product] = await Promise.all([
        context.root.$store.dispatch('product/loadProduct', {
          parentSku: sku,
          childSku: null,
          setCurrent: false
        }),
        context.root.$store.dispatch('budsies/loadProductsRushAddons', {
          productSku: sku
        })
      ]);

      if (!product) {
        return;
      }

      return updateProductProductionTimeCustomizationData(product, context.root.$store);
    }

    async function preloadProducts (): Promise<void> {
      isProductsLoading.value = true;

      try {
        const entries = await Promise.all(
          foreversProductTypeButtons.value.map(async (button) => {
            const sku = getPlushieSkuByTypes(button.type, plushieType.value);
            const product = await loadProductBySku(sku);

            return [button.type, product] as [string, Product | undefined];
          })
        );

        const nextProductsByType: Record<string, Product> = {};

        for (const [type, product] of entries) {
          if (!product) {
            continue;
          }

          nextProductsByType[type] = product;
        }

        preloadedProductsByType.value = nextProductsByType;
      } finally {
        isProductsLoading.value = false;
      }
    }

    async function setActiveProductType (type: string): Promise<void> {
      const product = preloadedProductsByType.value[type];

      if (!product) {
        return;
      }

      selectedProductType.value = type;
      await context.root.$store.dispatch('product/setCurrent', product);
    }

    function setSelectedProductTypeFromProduct (): void {
      if (!activeProduct.value?.sku) {
        return;
      }

      try {
        selectedProductType.value = getForeversTypeByBundleSku(activeProduct.value.sku);
      } catch (error) {
        if (!selectedProductType.value) {
          selectedProductType.value = getDefaultProductType();
        }
      }
    }

    async function onProductTypeClick (type: string): Promise<void> {
      if (isSelectorDisabled.value) {
        return;
      }

      await setActiveProductType(type);
    }

    void preloadProducts().then(async () => {
      await setActiveProductType(getDefaultProductType());
    });

    watch(activeProduct, () => {
      setSelectedProductTypeFromProduct();
    }, { immediate: true });

    return {
      activeProduct,
      canUsePersistedCustomizationState,
      currentProduct,
      customizationAvailabilityFlow,
      existingCartItem,
      isProductsLoading,
      isSelectorDisabled,
      onProductTypeClick,
      productTypeButtonsList: foreversProductTypeButtons,
      selectedProductType
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
    const productName = this.currentProduct?.meta_title || this.currentProduct?.name || 'Forevers';
    const description = this.currentProduct?.meta_description;
    const meta: any[] = [];

    if (description) {
      meta.push({
        vmid: 'description',
        name: 'description',
        content: htmlDecode(description)
      });
    }

    return {
      title: htmlDecode(productName),
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

#forevers-customize-later {
  box-sizing: border-box;
  padding: 0 1rem;

  ._form-container {
    .form-with-images-gallery {
      margin-top: var(--spacer-lg);
    }
  }

  ._product-type-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacer-sm);
    margin: 0 0 var(--spacer-base);
  }

  ._product-type-button {
    display: inline-flex;
    align-items: center;
    gap: var(--spacer-xs);
    padding: var(--spacer-sm) var(--spacer-base);
    border: 1px solid var(--c-light);
    background: var(--c-white);
    cursor: pointer;

    &.-active {
      border-color: var(--c-primary);
    }

    &.-disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  ._product-type-button-image {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }

  @media (min-width: $tablet-min) {
    max-width: 1272px;
    width: 100%;
    margin: 0 auto;
  }
}
</style>
