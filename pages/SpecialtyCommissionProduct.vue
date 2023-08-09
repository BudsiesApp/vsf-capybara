<template>
  <div id="specialty-commission-product" itemscope itemtype="http://schema.org/Product">
    <o-specialty-commission-product-order-form
      :artwork-upload-url="artworkUploadUrl"
      :product="getCurrentProduct"
      :existing-plushie-id="existingPlushieId"
      v-if="showForm"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import config from 'config';
import { htmlDecode } from '@vue-storefront/core/filters';
import { catalogHooksExecutors } from '@vue-storefront/core/modules/catalog-next/hooks';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';

import Product from 'core/modules/catalog/types/Product';
import { SN_RAFFLE, getters, ParticipantData, actions } from 'src/modules/raffle';

import OSpecialtyCommissionProductOrderForm from 'theme/components/organisms/o-specialty-commission-product-order-form.vue';

const specialtyCommissionSku = 'specialtyCommission_bundle';

export default Vue.extend({
  name: 'SpecialtyCommissionProduct',
  components: {
    OSpecialtyCommissionProductOrderForm
  },
  props: {
    existingPlushieId: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    token: {
      type: String as PropType<string | undefined>,
      default: undefined
    }
  },
  data () {
    return {
      isDataLoaded: false,
      showPhotoTips: false
    };
  },
  computed: {
    getCurrentProduct (): Product | null {
      const product = this.$store.getters['product/getCurrentProduct'];
      if (!product?.sku || product.sku !== specialtyCommissionSku) {
        return null;
      }

      return product;
    },
    artworkUploadUrl () {
      return config.images.fileuploaderUploadUrl;
    },
    showForm (): boolean {
      return this.isDataLoaded && !!this.getCurrentProduct;
    },
    participantData (): ParticipantData | undefined {
      return this.$store.getters[`${SN_RAFFLE}/${getters.GET_PARTICIPANT_DATA}`];
    }
  },
  async serverPrefetch () {
    if (this.$ssrContext) this.$ssrContext.output.cacheTags.add('product')

    const isAvailable = await (this as any).checkPageAvailability();

    if (!isAvailable) {
      await this.$router.replace({ name: 'raffle' });
      return;
    }

    await (this as any).loadData();
  },
  async beforeMount () {
    const isAvailable = await this.checkPageAvailability();

    if (!isAvailable) {
      await this.$router.replace({ name: 'raffle' });
      return;
    }

    if (!this.getCurrentProduct) {
      await this.loadData();
    }

    this.isDataLoaded = true;
  },
  beforeRouteLeave (to, from, next) {
    this.$store.commit(`product/${PRODUCT_UNSET_CURRENT}`);
    next();
  },
  methods: {
    async checkPageAvailability (): Promise<boolean> {
      if (!this.token) {
        return false;
      }

      await this.$store.dispatch(`${SN_RAFFLE}/${actions.VERIFY_TOKEN}`, this.token);

      if (!this.participantData) {
        return false;
      }

      return this.participantData.isWinner;
    },
    async loadData (): Promise<void> {
      this.isDataLoaded = false;

      const product = await this.$store.dispatch('product/loadProduct', {
        parentSku: specialtyCommissionSku,
        setCurrent: true
      });

      catalogHooksExecutors.productPageVisited(product);

      await this.$store.dispatch('budsies/loadProductRushAddons', { productId: product.id });
      await this.$store.dispatch('budsies/loadProductBodyparts', { productId: product.id })

      this.isDataLoaded = true;
    }
  },
  metaInfo () {
    const description = this.getCurrentProduct?.meta_description || this.getCurrentProduct?.short_description;

    return {
      title: htmlDecode(
        this.getCurrentProduct?.meta_title || this.getCurrentProduct?.name
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

#specialty-commission-product {
  box-sizing: border-box;
  padding: var(--spacer-lg) 1rem 0;

  @media (min-width: $tablet-min) {
    max-width: 1272px;
    width: 100%;
    margin: 0 auto;
  }
}
</style>
