<template>
  <div id="plushie-product" itemscope itemtype="http://schema.org/Product">
    <o-plushie-creation-wizard
      :artwork-upload-url="artworkUploadUrl"
      :existing-plushie-id="existingPlushieId"
      :preselected-product-type="preselectedProductType"
      :preselected-size="preselectedSize"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import config from 'config';
import { htmlDecode } from '@vue-storefront/core/filters';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';

import Product from 'core/modules/catalog/types/Product';

import OPlushieCreationWizard from 'theme/components/organisms/o-plushie-creation-wizard.vue.js';

export default Vue.extend({
  name: 'PlushieProduct',
  components: {
    OPlushieCreationWizard
  },
  computed: {
    getCurrentProduct (): Product | null {
      return this.$store.getters['product/getCurrentProduct'];
    },
    artworkUploadUrl (): string {
      return config.images.fileuploaderUploadUrl;
    },
    existingPlushieId (): string {
      return String(this.$route.query?.id);
    },
    preselectedProductType (): string | undefined {
      return this.$route.query?.product;
    },
    preselectedSize (): string | undefined {
      return this.$route.query?.size;
    }
  },
  beforeRouteLeave (to, from, next) {
    this.$store.commit(`product/${PRODUCT_UNSET_CURRENT}`);
    next();
  },
  metaInfo () {
    const productName = this.getCurrentProduct?.meta_title || this.getCurrentProduct?.name || 'Forevers';

    return {
      title: htmlDecode(productName),
      meta: this.getCurrentProduct?.meta_description
        ? [
          {
            vmid: 'description',
            name: 'description',
            content: htmlDecode(this.getCurrentProduct?.meta_description)
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
