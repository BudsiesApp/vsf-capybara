<template>
  <div id="plushie-product">
    <SfHeading :level="1" :title="mainTitleText" />

    <creation-wizard-form
      :existing-cart-item="existingCartItem"
      :plushie-type="plushieType"
      :product-type-buttons-list="productTypeButtonsList"
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  toRefs
} from '@vue/composition-api';
import { SfHeading } from '@storefront-ui/vue';

import { htmlDecode } from '@vue-storefront/core/filters';
import i18n from '@vue-storefront/core/i18n';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import Product from 'core/modules/catalog/types/Product';

import ProductTypeButton from 'theme/components/interfaces/product-type-button.interface';
import PlushieProductType from 'theme/interfaces/plushie-product-type';
import { PlushieType } from 'theme/interfaces/plushie.type';
import { useExistingCartItem } from 'theme/helpers/use-existing-cart-item';

import CreationWizardForm from 'theme/components/customization-system/forms/creation-wizard-form.vue';

export default defineComponent({
  name: 'PlushieProduct',
  components: {
    CreationWizardForm,
    SfHeading
  },
  props: {
    plushieType: {
      type: String as PropType<PlushieType>,
      required: true
    },
    existingPlushieId: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    preselectedProductSize: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    preselectedProductType: {
      type: String as PropType<string | undefined>,
      default: undefined
    }
  },
  setup (props, context) {
    const { existingPlushieId, plushieType } = toRefs(props);

    const currentProduct = computed<Product | undefined>(
      () => context.root.$store.getters[`product/getCurrentProduct`]
    );

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
    const golfCoversProductTypeButtons = computed<ProductTypeButton[]>(() => {
      return [
        {
          title: i18n.t('Dog Golf Head Covers').toString(),
          type: PlushieProductType.DOG,
          imageSrc: '/assets/plushies/dog-icon1_1.png'
        },
        {
          title: i18n.t('Cat Golf Head Covers').toString(),
          type: PlushieProductType.CAT,
          imageSrc: '/assets/plushies/cat-icon1_1.png'
        },
        {
          title: i18n.t('Other Golf Head Covers').toString(),
          type: PlushieProductType.OTHER,
          imageSrc: '/assets/plushies/other-icon1_1.png'
        }
      ];
    });
    const productTypeButtonsList = computed<ProductTypeButton[]>(() => {
      return plushieType.value === PlushieType.FOREVERS
        ? foreversProductTypeButtons.value
        : golfCoversProductTypeButtons.value;
    });
    const mainTitleText = computed<string>(() => {
      const title =
        plushieType.value === PlushieType.FOREVERS
          ? i18n.t('Create Your Custom Forevers Plush')
          : i18n.t('Create Your Custom Golf Head Covers');

      return title.toString();
    });
    return {
      ...useExistingCartItem(existingPlushieId, context),
      currentProduct,
      mainTitleText,
      productTypeButtonsList
    };
  },
  beforeRouteLeave (to, from, next) {
    this.$store.commit(`product/${PRODUCT_UNSET_CURRENT}`);
    next();
  },
  metaInfo () {
    const defaultProductName =
      this.plushieType === PlushieType.FOREVERS
        ? 'Forevers'
        : 'Golf Head Covers';
    const productName =
      this.currentProduct?.meta_title ||
      this.currentProduct?.name ||
      defaultProductName;

    return {
      title: htmlDecode(productName),
      meta: this.currentProduct?.meta_description
        ? [
          {
            vmid: 'description',
            name: 'description',
            content: htmlDecode(this.currentProduct?.meta_description)
          }
        ]
        : []
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#plushie-product {
  padding: var(--spacer-lg) 0 0;
  box-sizing: border-box;

  @media (min-width: $tablet-min) {
    padding: var(--spacer-lg) 1rem 0;
  }

  @include for-desktop {
    width: 100%;
  }
}
</style>
