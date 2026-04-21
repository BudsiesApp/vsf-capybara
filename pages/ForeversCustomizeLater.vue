<template>
  <div id="forevers-customize-later">
    <product-structured-data v-if="currentProduct" :product="currentProduct" />

    <div v-if="showForm" class="_form-container">
      <form-with-images-gallery
        :can-use-persisted-customization-state="canUsePersistedCustomizationState"
        :product-purchase-flow="productPurchaseFlow"
        :existing-cart-item="existingCartItem"
        :product="currentProduct"
        :show-gallery="false"
        @hook:mounted="onFormMounted"
      >
        <template #description>
          <MBlockStory
            :story-slug="topStorySlug"
            class="_top-block"
            v-if="topStorySlug"
          />
        </template>

        <template #product-details-extra>
          <div class="_product-type-selector">
            <customization-option
              class="_customization-option"
              :customization="productTypeCustomization"
              :is-disabled="isSelectorDisabled"
              :option-values="productTypeSelectorOptions"
              :product-id="currentProductId"
              :value="selectedProductTypeOptionValueId"
              :disable-validation="true"
              @input="onProductTypeChange"
            />
          </div>
        </template>
      </form-with-images-gallery>
    </div>

    <form-with-images-gallery-placeholder
      v-show="showPlaceholder"
      class="_placeholder"
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

import i18n from '@vue-storefront/core/i18n';
import { htmlDecode } from '@vue-storefront/core/filters';
import { isServer } from '@vue-storefront/core/helpers';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import getHostFromHeaders from '@vue-storefront/core/helpers/get-host-from-headers.function';
import { ProductStructuredData } from 'src/modules/budsies';
import {
  Customization,
  CustomizationOptionValue,
  CustomizationType,
  OptionType,
  OptionValue,
  WidgetType
} from 'src/modules/customization-system';
import {
  FOREVERS_CAT_BUNDLE_SKU,
  FOREVERS_DOG_BUNDLE_SKU,
  FOREVERS_OTHER_BUNDLE_SKU,
  getCanonicalUrl,
  ProductPurchaseFlow
} from 'src/modules/shared';

import { useExistingCartItem } from 'theme/helpers/use-existing-cart-item';
import { useMultiProductsPage } from 'theme/helpers/use-multi-products-page';

import CustomizationOption from 'theme/components/customization-system/customization-option.vue';
import FormWithImagesGallery from 'theme/components/customization-system/forms/form-with-images-gallery.vue';
import FormWithImagesGalleryPlaceholder from 'theme/components/customization-system/forms/placeholders/form-with-images-gallery-placeholder.vue';
import MBlockStory from 'theme/components/molecules/m-block-story.vue';

export default defineComponent({
  name: 'ForeversCustomizeLater',
  components: {
    CustomizationOption,
    FormWithImagesGallery,
    FormWithImagesGalleryPlaceholder,
    MBlockStory,
    ProductStructuredData
  },
  props: {
    existingPlushieId: {
      type: String as PropType<string | undefined>,
      default: undefined
    }
  },
  setup (props, context) {
    const { existingPlushieId } = toRefs(props);
    const canUsePersistedCustomizationState = ref<boolean>(false);
    const productPurchaseFlow = ref<ProductPurchaseFlow>(
      ProductPurchaseFlow.CUSTOMIZE_LATER
    );
    const isFormMounted = ref(isServer);
    const isLeavePage = ref(false);
    const productSkus = ref<string[]>([
      FOREVERS_DOG_BUNDLE_SKU,
      FOREVERS_CAT_BUNDLE_SKU,
      FOREVERS_OTHER_BUNDLE_SKU
    ]);

    const { existingCartItem } = useExistingCartItem(existingPlushieId, context);
    const isSelectorDisabled = computed<boolean>(() => {
      return !!existingCartItem.value;
    });

    const storeUrl = computed<string>(() => {
      const host = context.ssrContext
        ? getHostFromHeaders((context.ssrContext.server.request as any).headers)
        : window.location.host;

      return `https://${host}`;
    });

    const productTypeSelectorOptions = computed<OptionValue[]>(() => {
      return [
        {
          id: FOREVERS_DOG_BUNDLE_SKU,
          name: i18n.t('Forevers Dog').toString(),
          description: i18n.t('Forevers Dog').toString(),
          thumbnailUrl: `${storeUrl.value}/assets/plushies/dog-icon1_1.png`,
          isEnabled: true,
          isDefault: false,
          sn: 0,
          galleryImages: []
        },
        {
          id: FOREVERS_CAT_BUNDLE_SKU,
          name: i18n.t('Forevers Cat').toString(),
          description: i18n.t('Forevers Cat').toString(),
          thumbnailUrl: `${storeUrl.value}/assets/plushies/cat-icon1_1.png`,
          isEnabled: true,
          isDefault: false,
          sn: 1,
          galleryImages: []
        },
        {
          id: FOREVERS_OTHER_BUNDLE_SKU,
          name: i18n.t('Forevers Other').toString(),
          description: i18n.t('Forevers Other').toString(),
          thumbnailUrl: `${storeUrl.value}/assets/plushies/other-icon1_1.png`,
          isEnabled: true,
          isDefault: false,
          sn: 2,
          galleryImages: []
        }
      ];
    });

    const productTypeCustomization = computed<Customization>(() => {
      const customization: Customization = {
        id: 'forevers-product-type-selector',
        name: i18n.t('Choose your Forevers type').toString(),
        title: i18n.t('Choose your Forevers type').toString(),
        type: CustomizationType.OPTION,
        sn: 0,
        isEnabled: true,
        isLocked: false,
        showInCart: false,
        availabilityRules: {
          forActivatedOptionValueIds: []
        },
        optionData: {
          type: OptionType.GENERIC,
          isRequired: true,
          maxValuesCount: 1,
          displayWidget: WidgetType.THUMBNAILS_LIST,
          hasDetailedDescription: false,
          hasGalleryImages: false,
          showInUrlQuery: false,
          displayWidgetOptions: {
            shape: 'round',
            alignment: 'center'
          },
          values: []
        }
      };

      return customization;
    });

    const {
      currentProduct,
      isDataLoaded,
      selectProduct
    } = useMultiProductsPage(productSkus, context);

    const showForm = computed<boolean>(() => {
      return isDataLoaded.value && !!currentProduct.value;
    });

    const topStorySlug = computed<string>(() => {
      if (!currentProduct.value?.sku) {
        return '';
      }

      return `forevers_customize_later_page_top`;
    });

    const showPlaceholder = computed<boolean>(() => {
      return !isLeavePage.value && (!showForm.value || !isFormMounted.value);
    });

    const currentProductId = computed<number>(() => {
      return Number(currentProduct.value?.id) || 0;
    });

    const selectedProductTypeOptionValueId = computed<string | undefined>(() => {
      return currentProduct.value?.sku;
    });

    async function onProductTypeChange ({ value }: {
      customizationId: string,
      value: CustomizationOptionValue
    }): Promise<void> {
      if (isSelectorDisabled.value) {
        return;
      }

      const nextType = Array.isArray(value) ? value[0] : value;

      if (typeof nextType !== 'string' || nextType === currentProduct.value?.sku) {
        return;
      }

      await selectProduct(nextType);
    }

    function onFormMounted (): void {
      isFormMounted.value = true;
    }

    return {
      canUsePersistedCustomizationState,
      currentProductId,
      currentProduct,
      existingCartItem,
      isDataLoaded,
      isLeavePage,
      isSelectorDisabled,
      onFormMounted,
      onProductTypeChange,
      productPurchaseFlow,
      productTypeCustomization,
      productTypeSelectorOptions,
      selectedProductTypeOptionValueId,
      showForm,
      showPlaceholder,
      topStorySlug
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

      ::v-deep {
        .base-list-widget.thumbnails-list-widget {
          --thumbnails-list-widget-item-width: 33%;
        }
      }
    }
  }

  ._placeholder {
    margin-top: var(--spacer-lg);
  }

  @media (min-width: $tablet-min) {
    max-width: 1272px;
    width: 100%;
    margin: 0 auto;
  }
}
</style>
