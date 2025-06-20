<template>
  <div id="plushie-customize" :class="`-${formComponent}`">
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <component
      v-if="showForm"
      :is="formComponent"
      :product="currentProduct"
      :flow="'customize'"
      :initial-customization-state="draftPlushie.customization_state"
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
  onMounted,
  PropType,
  ref,
  toRefs
} from '@vue/composition-api';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';

import { useProductPage } from 'theme/helpers/use-product-page';
import {
  LayoutType,
  useProductFormLayout
} from 'theme/helpers/use-product-form-layout';
import FormWithImagesGalleryPlaceholder from 'theme/components/customization-system/forms/placeholders/form-with-images-gallery-placeholder.vue';
import VerticalStepsFormPlaceholder from 'theme/components/customization-system/forms/placeholders/vertical-steps-form-placeholder.vue';
import PhrasePillowFormPlaceholder from 'theme/components/customization-system/forms/placeholders/phrase-pillow-form-placeholder.vue';
// import CreationWizardFormPlaceholder from 'theme/components/customization-system/forms/placeholders/creation-wizard-form-placeholder.vue';
import { Logger } from '@vue-storefront/core/lib/logger';
import { DraftPlushie } from 'src/modules/customization-system';

export default defineComponent({
  name: 'PlushieCustomize',
  components: {
    CreationWizardForm: () =>
      import(
        /* webpackChunkName: "vsf-creation-wizard-form" */ 'theme/components/customization-system/forms/creation-wizard-form.vue'
      ),
    // CreationWizardFormPlaceholder,
    FormWithImagesGalleryPlaceholder,
    FormWithImagesGallery: () =>
      import(
        /* webpackChunkName: "vsf-images-gallery-form" */ 'theme/components/customization-system/forms/form-with-images-gallery.vue'
      ),
    PhrasePillowForm: () =>
      import(
        /* webpackChunkName: "vsf-phrase-pillow-form" */ 'theme/components/customization-system/forms/phrase-pillow-form.vue'
      ),
    PhrasePillowFormPlaceholder,
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
    draftPlushieId: {
      type: String,
      required: true
    },
    layout: {
      type: String as PropType<LayoutType>,
      default: () => LayoutType.WITH_IMAGES_GALLERY
    }
  },
  setup (props, context) {
    const root = context.root;
    const { sku, draftPlushieId, layout } = toRefs(props);

    const { currentProduct, isDataLoaded: isProductLoaded } = useProductPage(
      sku,
      context
    );

    const isDraftPlushieLoaded = ref(false);
    const errorMessage = ref<string | null>(null);

    const draftPlushie = computed<DraftPlushie>(
      () => root.$store.getters['customization-system/getDraftPlushie']
    );

    const showForm = computed<boolean>(() => {
      return (
        isProductLoaded.value &&
        isDraftPlushieLoaded.value &&
        !!currentProduct.value
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

    onMounted(async () => {
      try {
        await root.$store.dispatch('customization-system/loadDraftPlushie', draftPlushieId.value);
        isDraftPlushieLoaded.value = true;
      } catch (e) {
        Logger.error('PlushieCustomize', e)();
        if (e.message.includes('Access Denied')) {
          errorMessage.value = 'Access Denied: You do not have permission to customize this item.';
        } else {
          errorMessage.value = 'There was an error loading your customization. Please try again later.';
        }
      }
    });

    return {
      currentProduct,
      draftPlushie,
      errorMessage,
      formComponent,
      formPlaceholderComponent,
      onFormMounted,
      showForm,
      showPlaceholder
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
