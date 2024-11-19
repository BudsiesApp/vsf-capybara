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

    <o-order-content :table-items="tableItems" />

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

        <SfButton
          class="_reorder"
          :disabled="isReorderInProgress"
          @click="$emit('reorder-button-clicked', order.increment_id)"
        >
          {{ $t('REORDER') }}
        </SfButton>
      </div>
    </div>

    <div class="_information">
      <div v-if="shippingAddress" class="_section">
        <SfHeading
          :title="$t('Shipping address')"
          :level="4"
          class="sf-heading--left sf-heading--no-underline"
        />

        <div class="_content">
          <address>
            <p>{{ shippingAddress.firstname }} {{ shippingAddress.lastname }}</p>
            <p>{{ shippingAddress.street[0] }} {{ shippingAddress.street[1] }}</p>
            <p>{{ shippingAddress.postcode }} {{ shippingAddress.city }}</p>
            <p>{{ shippingAddress.country }}</p>
          </address>
        </div>
      </div>

      <div v-if="order.shipping_description" class="_section">
        <SfHeading
          :title="$t('Shipping method')"
          :level="4"
          class="sf-heading--left sf-heading--no-underline"
        />

        <div class="_content">
          <p>{{ order.shipping_description }}</p>
        </div>
      </div>

      <div class="_section">
        <SfHeading
          :title="$t('Billing address')"
          :level="4"
          class="sf-heading--left sf-heading--no-underline"
        />

        <div class="_content">
          <address>
            <p>{{ billingAddress.firstname }} {{ billingAddress.lastname }}</p>
            <p>{{ billingAddress.street[0] }} {{ billingAddress.street[1] }}</p>
            <p>{{ billingAddress.postcode }} {{ billingAddress.city }}</p>
            <p>{{ billingAddress.country }}</p>
          </address>
        </div>
      </div>

      <div class="_section">
        <SfHeading
          :title="$t('Payment method')"
          :level="4"
          class="sf-heading--left sf-heading--no-underline"
        />

        <div class="_content">
          <p>{{ paymentMethod }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getThumbnailPath } from '@vue-storefront/core/helpers'
import {
  SfArrow,
  SfBadge,
  SfButton,
  SfHeading,
  SfProperty
} from '@storefront-ui/vue';

import { getCustomizationSystemCartItemThumbnail } from 'src/modules/customization-system';

import OOrderContent from './o-order-content';

export default {
  name: 'OMyAccountOrderDetails',
  inject: {
    imageHandlerService: { from: 'ImageHandlerService' }
  },
  components: {
    OOrderContent,
    SfArrow,
    SfBadge,
    SfButton,
    SfHeading,
    SfProperty
  },
  props: {
    order: {
      type: Object,
      required: true,
      default: () => {}
    },
    isReorderInProgress: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    paymentMethod () {
      return this.order && this.order.payment.additional_information[0]
    },
    billingAddress () {
      return this.order && this.order.billing_address
    },
    products () {
      return this.order.items;
    },
    shippingAddress () {
      return this.order && this.order.extension_attributes.shipping_assignments[0].shipping.address
    },
    tableItems () {
      return this.products.map((product) => {
        return {
          key: product.id,
          thumbnail: this.getThumbnailForProduct(product),
          name: product.name,
          qty: product.qty_ordered,
          regularPrice: `$${product.row_total_incl_tax}`,
          customizations: product.customizations,
          customizationState: product.extension_attributes?.customization_state,
          customOptions: product.custom_options
        }
      });
    }
  },
  methods: {
    getThumbnailForProduct (product) {
      const customizationSystemThumbnail = getCustomizationSystemCartItemThumbnail(product, this.imageHandlerService);

      if (customizationSystemThumbnail) {
        return customizationSystemThumbnail;
      }

      if (product.thumbnail.includes('https://')) {
        return product.thumbnail;
      }

      return getThumbnailPath(product.thumbnail, 100, 142)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.o-my-account-order-details {
  --heading-padding: 0;

  ._title {
    display: flex;
    align-items: center;
    margin: 0;
  }

  ._back {
    margin-right: var(--spacer-base);
  }

  ._status {
    margin-left: var(--spacer-base);
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

  ._reorder {
    margin-top: var(--spacer-base);
    width: 100%;
  }

  .o-order-content {
    margin-top: var(--spacer-base);
  }

  ._information {
    display: flex;
    flex-direction: column;
    justify-content: center;

    .sf-heading {
      margin-top: var(--spacer-xl);
    }

    p {
      margin: var(--spacer) 0 0 0;
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

  ._summary {
    .sf-property__name {
      min-width: 100px;
    }

    .sf-property__value {
      min-width: 180px;
      text-align: center;
    }
  }

  ._content {
    margin-top: var(--spacer-sm);
  }

  @include for-desktop {
    ._information {
      margin-top: var(--spacer-xl);
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: flex-start;
    }

    ._back {
      margin-right: var(--spacer-lg);
    }

    ._status {
      margin-left: var(--spacer-lg);
    }

    ._section {
      flex: 1;
      margin-right: var(--spacer-base);
      min-width: 10rem;

      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
