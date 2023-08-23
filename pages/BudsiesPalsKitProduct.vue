<template>
  <div id="budsies-pals-kit-product">
    <product-structured-data
      v-if="getCurrentProduct"
      :product="getCurrentProduct"
    />

    <SfHeading
      :title="$t('Budsies Pals Kit')"
      :level="1"
    />

    <m-block-story
      story-slug="budsies_pals_kit_page_top"
      class="_story"
    />

    <div class="_form-wrapper">
      <div class="_image">
        <div class="_image-container">
          <img src="/assets/images/kit-product.jpg">
        </div>
      </div>

      <div class="_form-container">
        <SfHeading
          :title="$t('Purchase a Budsies Pals Kit')"
          :level="3"
        />

        <ul class="_dot-list">
          <li class="_dot-item">
            {{ $t('Each child is paired with a sponsor from our Budsies Community (that\'s you!).') }}
          </li>

          <li class="_dot-item">
            {{ $t('The Budsies Pals Kits are delivered to the kiddos, so they can draw and create their own Budsies stuffed animal.') }}
          </li>

          <li class="_dot-item">
            {{ $t('The Budsies stuffed animals are handmade with love by our designers and sent to the kiddos or their loved ones to offer them comfort & happiness.') }}
          </li>
        </ul>

        <o-budsies-pals-kit-product-order-form
          class="_form"
          :product="getCurrentProduct"
          v-if="showForm"
        />
      </div>
    </div>

    <m-block-story
      story-slug="budsies_pals_kit_page_bottom"
      class="_story"
    />
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { SfHeading } from '@storefront-ui/vue';

import { htmlDecode } from '@vue-storefront/core/filters';
import { catalogHooksExecutors } from '@vue-storefront/core/modules/catalog-next/hooks';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import Product from 'core/modules/catalog/types/Product';

import { ProductStructuredData } from 'src/modules/budsies';

import OBudsiesPalsKitProductOrderForm from 'theme/components/organisms/o-budsies-pals-kit-product-order-form.vue';
import MBlockStory from 'theme/components/molecules/m-block-story.vue';

interface InjectedServices {
  window: Window
}

const budsiesPalsKitSku = 'palsKit';

export default (Vue as VueConstructor<Vue & InjectedServices>).extend({
  name: 'BudsiesPalsKitProduct',
  components: {
    MBlockStory,
    OBudsiesPalsKitProductOrderForm,
    ProductStructuredData,
    SfHeading
  },
  inject: {
    window: { from: 'WindowObject' }
  },
  data () {
    return {
      isDataLoaded: false
    }
  },
  computed: {
    getCurrentProduct (): Product | null {
      const product = this.$store.getters['product/getCurrentProduct'];

      if (product?.sku !== budsiesPalsKitSku) {
        return null;
      }

      return product;
    },
    showForm (): boolean {
      return this.isDataLoaded && !!this.getCurrentProduct;
    }
  },
  async serverPrefetch () {
    if (this.$ssrContext) this.$ssrContext.output.cacheTags.add('product')

    await (this as any).loadData();
  },
  async beforeMount () {
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

      const [product] = await Promise.all([
        this.$store.dispatch('product/loadProduct', {
          parentSku: budsiesPalsKitSku,
          setCurrent: true
        }),
        this.$store.dispatch('budsies/fetchHospitalsList')
      ]);

      this.isDataLoaded = true;
      catalogHooksExecutors.productPageVisited(product);
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
})
</script>

<style lang="scss" scoped>
@import "theme/css/base/_breakpoints.scss";
@import "theme/css/mixins/wave.scss";

#budsies-pals-kit-product {
  box-sizing: border-box;
  padding: var(--spacer-lg) var(--spacer-sm) 0;

  ._story {
    width: 100%;
    max-width: 960px;
    margin-left: auto;
    margin-right: auto;
    margin-top: var(--spacer-lg);

    &:last-child {
      margin-top: var(--spacer-2xl);
    }
  }

  ._image,
  ._form-container {
    flex-basis: 100%;
  }

  ._image-container {
    position: relative;
    display: flex;
  }

  ._image {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start;

    img {
      max-width: 100%;
      border-radius: 27px;
      object-fit: contain;
    }
  }

  ._form {
    margin-top: var(--spacer-lg);
  }

  ._form-wrapper {
    margin: var(--spacer-2xl) auto 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    box-sizing: border-box;

    ._form-container {
      margin-top: var(--spacer-xl);
    }
  }

  ._dot-list {
    margin-top: var(--spacer-lg);
  }

  ._dot-item {
    margin-top: var(--spacer-sm);

    &:first-child {
      margin-top: 0;
    }
  }

  @include for-desktop {
    max-width: 1140px;
    width: 100%;
    margin: 0 auto;
    padding: var(--spacer-2xl) var(--spacer-lg) 0;

    ._image {
      justify-content: flex-start;
    }

    ._form-wrapper {
      flex-wrap: nowrap;
      column-gap: var(--spacer-xl);

      ._form-container {
        margin-top: var(--spacer-lg);
      }
    }
  }
}
</style>
