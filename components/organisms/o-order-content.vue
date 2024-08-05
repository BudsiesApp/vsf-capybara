<template>
  <SfTable
    class="sf-table--bordered o-order-content"
    :class="{ 'o-order-content--hidden-header': !shouldShowHeader }"
  >
    <SfTableHeading class="table__row" v-if="shouldShowHeader">
      <SfTableHeader class="table__header table__image">
        {{ $t("Thumbnail") }}
      </SfTableHeader>

      <SfTableHeader
        v-for="tableHeader in tableHeaders"
        :key="tableHeader"
        class="table__header"
        :class="{
          table__description: tableHeader === $t('Description'),
          table__price: tableHeader === $t('Price'),
        }"
      >
        {{ tableHeader }}
      </SfTableHeader>
    </SfTableHeading>

    <SfTableRow v-for="item in tableItems" :key="item.key" class="table__row">
      <SfTableData class="table__image">
        <SfImage :src="item.thumbnail" />
      </SfTableData>

      <SfTableData class="table__description">
        <div class="product-title">
          {{ item.name | htmlDecode }}
        </div>

        <cart-item-configuration
          :customizations="item.customizations"
          :customization-state="item.customizationState"
          :product-options="item.customOptions"
        />
      </SfTableData>

      <SfTableData class="table__data">
        {{ getItemQuantity(item) }}
      </SfTableData>

      <SfTableData class="table__data">
        <SfPrice
          :regular="item.regularPrice"
          :special="item.specialPrice"
          class="product-price"
        />
      </SfTableData>
    </SfTableRow>
  </SfTable>
</template>

<script lang="ts">
import { PropType } from 'vue';
import { SfImage, SfPrice, SfTable } from '@storefront-ui/vue';
import { mapMobileObserver } from '@storefront-ui/vue/src/utilities/mobile-observer';

import { OrderContentItem } from '../interfaces/order-content-item.interface';

import CartItemConfiguration from 'theme/components/customization-system/cart-item-configuration.vue';

export default {
  name: 'OOrderContent',
  components: {
    CartItemConfiguration,
    SfImage,
    SfPrice,
    SfTable
  },
  props: {
    shouldShowHeader: {
      type: Boolean,
      default: true
    },
    tableItems: {
      type: Array as PropType<OrderContentItem[]>,
      default: () => []
    }
  },
  data () {
    return {
      tableHeaders: [
        this.$t('Description'),
        this.$t('Quantity'),
        this.$t('Price')
      ]
    };
  },
  computed: {
    ...mapMobileObserver()
  },
  methods: {
    getItemQuantity (product: OrderContentItem): number | string {
      return this.shouldShowHeader ? product.qty : `x ${product.qty}`;
    },
    truncate (text: string, desktopLength = 75, mobileLength = 50): string {
      const maxLength = this.isMobile ? mobileLength : desktopLength;

      if (text.length <= maxLength) {
        return text;
      }

      return text.substring(0, maxLength) + '...';
    }
  }
};
</script>

  <style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.o-order-content {
  --table-column-flex: 1;
  --table-heading-padding: var(--spacer-sm) var(--spacer-sm);
  --table-row-padding: var(--spacer-sm) var(--spacer-sm);

  margin: 0 0 var(--spacer-base) 0;

  .table__row {
    justify-content: space-between;
    align-items: center;
  }

  .sf-table {
    &__data {
      --table-data-color: var(--c-text);

      min-width: 5rem;
    }

    &__header {
      min-width: 5rem;
    }

    &__row {
      --table-row-box-shadow: none;
    }
  }

  .product-price {
    --price-old-font-size: var(--font-sm);
    --price-special-font-size: var(--font-sm);

    align-items: center;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  &.o-order-content--hidden-header {
    .table__description {
      flex-basis: 6rem;
    }

    .table__image {
      --image-width: 8.125rem;

      min-width: var(--image-width);
      margin-right: 1em;
    }
  }

  .table__header {
    text-align: center;

    &:last-child {
      text-align: right;
    }
  }

  .table__data {
    text-align: center;
  }

  .table__description {
    text-align: left;
    flex: 1 0 5rem;
    order: unset;

    .product-title {
      font-weight: var(--font-semibold);
    }

    .bundle-product-option,
    .custom-plushie-name {
      font-size: var(--font-xs);

      &__icon {
        display: inline-block;
      }
    }
  }

  .table__image {
    --image-width: 5.125rem;

    text-align: left;
    margin-right: var(--spacer-sm);
    min-width: var(--image-width);
    display: none;
  }

  @media (min-width: 480px) {
    .table__image {
      display: table-cell;
    }
  }
}
</style>
