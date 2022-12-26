<template>
  <div class="o-my-account-order-details">
    <SfHeading
      :title="$t('Order #') + order.increment_id"
      :level="2"
      class="sf-heading--left sf-heading--no-underline title"
    >
      <template #title="{title}">
        <h3 class="_title">
          <SfArrow class="sf-arrow--transparent _back" @click.native="$emit('close')" />

          {{ title }}

          <SfBadge
            class="_status"
            :class="{
              'color-success': order.status === 'complete',
              'color-danger': order.status === 'canceled' || order.status === 'closed',
              'color-warning': order.status !== 'canceled' && order.status !== 'closed' && order.status !== 'complete'
            }"
          >
            {{ order.status | capitalize }}
          </SfBadge>
        </h3>
      </template>
    </SfHeading>

    <div class="_products">
      <SfCollectedProduct
        v-for="product in products"
        :key="product.id"
        :image="getThumbnailForProduct(product)"
        image-width="140"
        image-height="140"
        :title="product.name"
        class="sf-collected-product--detailed collected-product"
      >
        <template #configuration>
          <div class="collected-product__properties" v-if="getPlushieName(product)">
            {{ getPlushieName(product) | htmlDecode }}
          </div>

          <div class="collected-product__properties" v-if="getPlushieDesc(product)">
            {{ getPlushieDesc(product) | htmlDecode }}
          </div>

          <div class="collected-product__properties">
            <div
              v-for="option in getBundleProductOptions(product)"
              :key="option.id"
            >
              <SfIcon
                icon="check"
                size="xxs"
                color="blue-primary"
                class="collected-product__properties__icon"
              />
              {{ option.name }}
            </div>
          </div>
        </template>

        <template #input>
          {{ $t('Quantity') }}: {{ product.qty_ordered }}
        </template>

        <template #price>
          <div />
        </template>

        <template #remove>
          <SfPrice
            :regular="product.row_total_incl_tax"
          />
        </template>

        <template #more-actions>
          <div />
        </template>
      </SfCollectedProduct>
    </div>

    <div class="_summary">
      <div>
        <SfProperty
          :name="$t('Subtotal')"
          :value="order.subtotal | price"
          class="sf-property--full-width property"
        />

        <SfProperty
          :name="$t('Tax')"
          :value="order.tax_amount + order.discount_tax_compensation_amount | price"
          class="sf-property--full-width property"
        />

        <SfProperty
          :name="$t('Shipping')"
          :value="order.shipping_amount | price"
          class="sf-property--full-width property"
        />

        <SfProperty
          v-if="order.discount_amount"
          :name="$t('Discount')"
          :value="order.discount_amount | price"
          class="sf-property--full-width property"
        />

        <SfProperty
          :name="$t('Total')"
          :value="order.grand_total | price"
          class="sf-property--full-width property-total"
        />
      </div>
    </div>

    <div class="_informations">
      <div v-if="shippingAddress">
        <SfHeading
          :title="$t('Shipping address')"
          :level="4"
          class="sf-heading--left sf-heading--no-underline"
        />

        <address>
          <p>{{ shippingAddress.firstname }} {{ shippingAddress.lastname }}</p>
          <p>{{ shippingAddress.street[0] }} {{ shippingAddress.street[1] }}</p>
          <p>{{ shippingAddress.postcode }} {{ shippingAddress.city }}</p>
          <p>{{ shippingAddress.country }}</p>
        </address>
      </div>

      <div v-if="order.shipping_description">
        <SfHeading
          :title="$t('Shipping method')"
          :level="4"
          class="sf-heading--left sf-heading--no-underline"
        />

        <p>{{ order.shipping_description }}</p>
      </div>

      <div>
        <SfHeading
          :title="$t('Billing address')"
          :level="4"
          class="sf-heading--left sf-heading--no-underline"
        />

        <address>
          <p>{{ billingAddress.firstname }} {{ billingAddress.lastname }}</p>
          <p>{{ billingAddress.street[0] }} {{ billingAddress.street[1] }}</p>
          <p>{{ billingAddress.postcode }} {{ billingAddress.city }}</p>
          <p>{{ billingAddress.country }}</p>
        </address>
      </div>

      <div>
        <SfHeading
          :title="$t('Payment method')"
          :level="4"
          class="sf-heading--left sf-heading--no-underline"
        />

        <p>{{ paymentMethod }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { SearchQuery } from 'storefront-query-builder';
import { getThumbnailPath, productThumbnailPath } from '@vue-storefront/core/helpers'
import {
  SfCollectedProduct,
  SfIcon,
  SfHeading,
  SfArrow,
  SfBadge,
  SfTable,
  SfPrice,
  SfProperty,
  SfImage
} from '@storefront-ui/vue';

export default {
  name: 'OMyAccountOrderDetails',
  components: {
    SfCollectedProduct,
    SfIcon,
    SfHeading,
    SfArrow,
    SfBadge,
    SfTable,
    SfPrice,
    SfProperty,
    SfImage
  },
  props: {
    order: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  data () {
    return {
      products: []
    }
  },
  computed: {
    paymentMethod () {
      return this.order && this.order.payment.additional_information[0]
    },
    billingAddress () {
      return this.order && this.order.billing_address
    },
    shippingAddress () {
      return this.order && this.order.extension_attributes.shipping_assignments[0].shipping.address
    }
  },
  methods: {
    getBundleProductOptions (product) {
      return product.upgrades ? product.upgrades : [];
    },
    async getOrderedProducts () {
      let arrayOfSKUs = []
      this.order.items.forEach(product => {
        if (arrayOfSKUs.indexOf(product.sku) === -1) {
          arrayOfSKUs.push(product.sku)
        }
      })

      let searchQuery = new SearchQuery();
      searchQuery = searchQuery.applyFilter({ key: 'configurable_children.sku.keyword', value: { 'in': arrayOfSKUs } })

      const result = await this.$store.dispatch(
        'product/findProducts',
        {
          query: searchQuery,
          start: 0,
          size: this.order.items.length,
          updateState: false
        },
        { root: true }
      );

      this.order.items.forEach(orderItem => {
        let responseItem = result.items.find(item => { return item.sku === orderItem.sku });

        this.products.push(Object.assign(responseItem || {}, orderItem))
      })
    },
    getPlushieName (product) {
      if (!product.plushieName) {
        return '';
      }

      let name = product.plushieName;

      if (product.plushieBreed) {
        name += ', ' + product.plushieBreed;
      }

      return this.truncate(name);
    },
    getPlushieDesc (product) {
      if (!product.plushieDescription) {
        return '';
      }

      return this.truncate(product.plushieDescription, 150, 50);
    },
    getThumbnailForProduct (product) {
      if (product.thumbnail.includes('https://')) {
        return product.thumbnail;
      }

      return getThumbnailPath(product.thumbnail, 100, 142)
    },
    truncate (text, desktopLength = 75, mobileLength = 50) {
      const maxLength = this.isMobile ? mobileLength : desktopLength;

      if (text.length <= maxLength) {
        return text;
      }

      return text.substring(0, maxLength) + '...';
    }
  },
  mounted () {
    this.getOrderedProducts()
  }
}
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.o-my-account-order-details {
  ._title {
    display: flex;
    align-items: center;
    margin: 0;
  }

  ._back {
    margin-right: var(--spacer-lg);
  }

  ._status {
    margin-left: var(--spacer-lg);
  }

  ._products {
    margin-top: var(--spacer-xl);

    img {
      display: block;
    }

    .sf-table__header--center {
      text-align: center;
    }
  }

  ._summary {
    margin-top: var(--spacer-lg);
    display: flex;
    justify-content: flex-end;

    div {
      width: 10rem;
    }
  }

  ._informations {
    display: flex;
    flex-direction: column;
    justify-content: center;

    @include for-desktop {
      margin-top: var(--spacer-xl);
      flex-direction: row;
      justify-content: space-between;
    }

    .sf-heading {
      margin-top: var(--spacer-xl);
    }

    p {
      margin: var(--spacer) 0 0 0;
    }

    .sf-collected-product {
    &__remove {
      position: static;
    }
  }
  }

  .collected-product {
    --collected-product-padding: var(--spacer-sm) 0;
    --collected-product-title-font-size: var(--font-sm);
    --collected-product-title-font-weight: var(--font-semibold);
    --collected-product-image-background: none;
    --collected-product-main-margin: 0 var(--spacer-sm);

  border: 1px solid var(--c-light);
  border-width: 1px 0 0 0;

    .sf-price {
      align-items: flex-start;
      flex-direction: column;
    }

  ::v-deep {
    .sf-link {
      pointer-events: none;
      cursor: default;
    }

    .sf-collected-product__actions {
      display: none;
    }
  }

  &__properties {
    font-size: var(--font-xs);
    margin-bottom: var(--spacer-sm);

    &__icon {
      display: inline-block;
    }
  }

  &__properties > div {
    margin-bottom: var(--spacer-xs);
  }

  @include for-mobile {
    --collected-product-remove-bottom: var(--spacer-sm);

    &:first-of-type {
      border: none;
    }
  }

  @include for-desktop {
    --collected-product-padding: var(--spacer-lg) 0;
    --collected-product-title-font-size: var(--font-base);
  }
}

@include for-desktop {
    .sf-collected-product {
      .sf-price {
        flex-direction: row;
      }

      ::v-deep &__details {
        flex-grow: 3;
      }
    }

    &__main {
      flex: 1;
    }

    &__aside {
      flex: 0 0 26.8125rem;
      margin: 0 0 0 var(--spacer-xl);
    }
  }
}

.property {
  margin: 0 0 var(--spacer-base) 0;
  @include for-desktop {
    margin: 0 0 var(--spacer-sm) 0;
    &__total {
      padding: var(--spacer-base) 0 0 0;
    }
  }
}

.property-total {
  --property-name-font-weight: 500;
  --property-value-font-weight: 500;
}

.order-details__summary {
  .sf-property__name {
    min-width: 100px;
  }

  .sf-property__value {
    min-width: 180px;
    text-align: center;
  }
}
</style>
