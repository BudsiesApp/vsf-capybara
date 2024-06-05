<template>
  <div id="plushie-product">
    <creation-wizard-form
      :plushie-type="plushieType"
      :existing-cart-item="existingCartItem"
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

import { htmlDecode } from '@vue-storefront/core/filters';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import Product from 'core/modules/catalog/types/Product';

import { PlushieType } from 'theme/interfaces/plushie.type';
import { useExistingCartItem } from 'theme/helpers/use-existing-cart-item';

import CreationWizardForm from 'theme/components/customization-system/forms/creation-wizard-form.vue';

export default defineComponent({
  name: 'PlushieProduct',
  components: {
    CreationWizardForm
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
    return {
      ...useExistingCartItem(existingPlushieId, context),
      currentProduct
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
