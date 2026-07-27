<template>
  <div id="order-item-customize" :class="`-${formComponent}`">
    <SfHeading :level="1" :title="mainTitleText" v-if="mainTitleText" />

    <MBlockStory
      :story-slug="topStorySlug"
      class="_top-block"
      v-if="topStorySlug"
    />

    <component
      v-if="showForm"
      :is="formComponent"
      :product="currentProduct"
      :plushie-type="plushieType"
      :can-use-persisted-customization-state="true"
      :customization-mode="ProductCustomizationMode.CUSTOMIZE"
      :draft-order-item="draftOrderItem"
      :additional-steps="additionalSteps"
      :load-additional-steps-data="loadAdditionalStepsData"
      @hook:mounted="onFormMounted"
    />

    <template v-if="formPlaceholderComponent">
      <component
        :is="formPlaceholderComponent"
        v-show="showPlaceholder"
        class="_placeholder"
      />
    </template>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  toRefs
} from 'vue';
import { SfHeading } from '@storefront-ui/vue';

import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import { ProductCustomizationMode } from 'src/modules/customization-system';
import { OrderItem, useOrderDetails } from 'src/modules/orders-history';
import { useRootInstance } from 'src/modules/shared';

import { PlushieType } from 'theme/interfaces/plushie.type';
import { useDraftOrderItem } from 'theme/helpers/use-draft-order-item';
import { useOrderItemAlterationProductLoader } from 'theme/helpers/use-order-item-alteration-product-loader';
import { useProductPage } from 'theme/helpers/use-product-page';
import {
  LayoutType,
  useProductFormLayout
} from 'theme/helpers/use-product-form-layout';
import { CreationWizardFormAdditionalStep } from 'theme/components/customization-system/forms/creation-wizard-form.vue';
import OrderItemCustomizeUpgradesStep from 'theme/components/customization-system/forms/order-item-customize-upgrades-step.vue';

import FormWithImagesGalleryPlaceholder from 'theme/components/customization-system/forms/placeholders/form-with-images-gallery-placeholder.vue';
import VerticalStepsFormPlaceholder from 'theme/components/customization-system/forms/placeholders/vertical-steps-form-placeholder.vue';
import PhrasePillowFormPlaceholder from 'theme/components/customization-system/forms/placeholders/phrase-pillow-form-placeholder.vue';
import CreationWizardFormPlaceholder from 'theme/components/customization-system/forms/placeholders/creation-wizard-form-placeholder.vue';
import MBlockStory from 'theme/components/molecules/m-block-story.vue';

export default defineComponent({
  name: 'OrderItemCustomize',
  components: {
    CreationWizardForm: () =>
      import(
        /* webpackChunkName: "vsf-creation-wizard-form" */ 'theme/components/customization-system/forms/creation-wizard-form.vue'
      ),
    CreationWizardFormPlaceholder,
    FormWithImagesGallery: () =>
      import(
        /* webpackChunkName: "vsf-images-gallery-form" */ 'theme/components/customization-system/forms/form-with-images-gallery.vue'
      ),
    FormWithImagesGalleryPlaceholder,
    PhrasePillowForm: () =>
      import(
        /* webpackChunkName: "vsf-phrase-pillow-form" */ 'theme/components/customization-system/forms/phrase-pillow-form.vue'
      ),
    PhrasePillowFormPlaceholder,
    VerticalStepsForm: () =>
      import(
        /* webpackChunkName: "vsf-vertical-form" */ 'theme/components/customization-system/forms/vertical-steps-form.vue'
      ),
    VerticalStepsFormPlaceholder,
    MBlockStory,
    SfHeading
  },
  props: {
    sku: {
      type: String,
      required: true
    },
    orderItemId: {
      type: String,
      required: true
    },
    orderId: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    layout: {
      type: String as PropType<LayoutType>,
      default: () => LayoutType.WITH_IMAGES_GALLERY
    },
    plushieType: {
      type: String as PropType<PlushieType | undefined>,
      default: undefined
    }
  },
  setup (props, context) {
    const root = useRootInstance();
    const { sku, orderItemId, orderId, layout, plushieType } = toRefs(props);

    const { currentProduct, isDataLoaded: isProductLoaded } = useProductPage(sku);
    const { draftOrderItem, isDataLoaded: isDraftOrderItemLoaded } = useDraftOrderItem(orderItemId);

    const orderDetails = useOrderDetails(orderId.value || '')

    const order = computed(() => {
      return orderDetails.order.value || undefined;
    });

    const orderItem = computed<OrderItem | undefined>(() => {
      if (!order.value) {
        return;
      }

      const targetOrderItemId = Number(orderItemId.value);

      return order.value.items.find((item) => item.item_id === targetOrderItemId);
    });

    const shouldWaitForAlterationProduct = computed<boolean>(() => {
      if (!orderId.value) {
        return false;
      }

      if (orderDetails.isLoading.value) {
        return true;
      }

      return !!orderItem.value?.extension_attributes?.alteration_product;
    });

    const {
      alterationProduct
    } = useOrderItemAlterationProductLoader(
      orderItem,
      order
    );

    const additionalSteps = computed<CreationWizardFormAdditionalStep[]>(() => {
      if (!orderItem.value || !alterationProduct.value) {
        return [];
      }

      return [
        {
          name: 'Upgrades',
          component: OrderItemCustomizeUpgradesStep,
          props: {
            orderItem: orderItem.value,
            alterationProduct: alterationProduct.value
          }
        }
      ];
    });

    function loadAdditionalStepsData (): Promise<void> {
      return orderDetails.loadOrder();
    }

    const showForm = computed<boolean>(() => {
      const isAlterationProductReady = !shouldWaitForAlterationProduct.value || !!alterationProduct.value;

      return (
        isProductLoaded.value &&
        isDraftOrderItemLoaded.value &&
        isAlterationProductReady &&
        !!currentProduct.value &&
        !!draftOrderItem.value
      );
    });

    const {
      formComponent,
      formPlaceholderComponent,
      isFormMounted,
      onFormMounted
    } = useProductFormLayout(layout);

    const showPlaceholder = computed<boolean>(() => {
      return !showForm.value || !isFormMounted.value;
    });

    const mainTitleText = computed<string | undefined>(() => {
      if (!plushieType.value) {
        return;
      }

      const title =
        plushieType.value === PlushieType.FOREVERS
          ? root.$t('Customize Your Forevers Plush')
          : root.$t('Customize Your Golf Head Covers');

      return title.toString();
    });

    const topStorySlug = computed<string | undefined>(() => {
      if (!plushieType.value) {
        return;
      }

      return plushieType.value === PlushieType.FOREVERS
        ? 'petsies_creation_page_top'
        : 'golf_cover_creation_page_top';
    });

    return {
      LayoutType,
      ProductCustomizationMode,
      currentProduct,
      draftOrderItem,
      additionalSteps,
      formComponent,
      formPlaceholderComponent,
      mainTitleText,
      onFormMounted,
      showForm,
      showPlaceholder,
      topStorySlug,
      loadAdditionalStepsData
    };
  },
  beforeRouteLeave (to, from, next) {
    this.$store.commit(`product/${PRODUCT_UNSET_CURRENT}`);
    next();
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#order-item-customize {
  box-sizing: border-box;
  padding: 0 1rem;

  &.-creation-wizard-form {
    padding: var(--spacer-lg) 0 0;

    ._top-block {
      margin: var(--spacer-base) auto 0;
      max-width: 45em;
      text-align: center;
      padding: 0 var(--spacer-sm);
    }
  }

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

    &.-creation-wizard-form {
      padding: var(--spacer-lg) 1rem 0;
    }
  }

  @include for-desktop {
    &.-creation-wizard-form {
      width: 100%;
    }
  }
}
</style>
