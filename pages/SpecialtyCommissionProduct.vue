<template>
  <div id="specialty-commission-product">
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
import rootStore from '@vue-storefront/core/store'

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
    }
  },
  async beforeRouteEnter (to, from, next): Promise<void> {
    if (!config.budsies.enableRaffle) {
      next();
      return;
    }

    const existingParticipantData: ParticipantData | undefined = rootStore.getters[`${SN_RAFFLE}/${getters.GET_PARTICIPANT_DATA}`];

    if (existingParticipantData?.canPurchaseSpecComm) {
      next();
      return;
    }

    if (!to.query.token) {
      next({ name: 'raffle' });
      return;
    }

    await rootStore.dispatch(`${SN_RAFFLE}/${actions.VERIFY_TOKEN}`, to.query.token);

    const participantData: ParticipantData = rootStore.getters[`${SN_RAFFLE}/${getters.GET_PARTICIPANT_DATA}`];

    if (!participantData?.canPurchaseSpecComm) {
      next({ name: 'raffle' });
      return;
    }

    next();
  },
  async serverPrefetch (): Promise<void> {
    if (this.$ssrContext) this.$ssrContext.output.cacheTags.add('product')

    await (this as any).loadData();
  },
  async beforeMount (): Promise<void> {
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
    async loadData (): Promise<void> {
      this.isDataLoaded = false;

      const product = await this.$store.dispatch('product/loadProduct', {
        parentSku: specialtyCommissionSku,
        setCurrent: true
      });

      catalogHooksExecutors.productPageVisited(product);

      await Promise.all([
        this.$store.dispatch('budsies/loadProductRushAddons', { productId: product.id }),
        this.$store.dispatch('budsies/loadProductBodyparts', { productId: product.id })
      ]);

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
