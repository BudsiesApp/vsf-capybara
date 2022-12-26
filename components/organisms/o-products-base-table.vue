<template>
  <SfTable
    class="sf-table--bordered o-products-base-table desktop-only"
    :class="{'o-products-base-table--hidden-header': !shouldShowHeader}"
  >
    <SfTableHeading class="table__row" v-if="shouldShowHeader">
      <SfTableHeader class="table__header table__image">
        {{ $t('Thumbnail') }}
      </SfTableHeader>

      <SfTableHeader
        v-for="tableHeader in tableHeaders"
        :key="tableHeader"
        class="table__header"
        :class="{
          table__description: tableHeader === $t('Description'),
          table__price: tableHeader === $t('Price')
        }"
      >
        {{ tableHeader }}
      </SfTableHeader>
    </SfTableHeading>

    <SfTableRow
      v-for="item in tableItems"
      :key="item.key"
      class="table__row"
    >
      <SfTableData class="table__image">
        <SfImage :src="item.thumbnail" />
      </SfTableData>

      <SfTableData class="table__description">
        <div class="product-title">
          {{ item.name | htmlDecode }}
        </div>

        <div class="custom-plushie-name" v-if="getPlushieName(item)">
          {{ getPlushieName(item) | htmlDecode }}
        </div>

        <div
          class="bundle-product-option"
          v-for="option in item.bundleOptions"
          :key="option"
        >
          <SfIcon
            icon="check"
            size="xxs"
            color="blue-primary"
            class="bundle-product-option__icon"
          />
          {{ option }}
        </div>

        <div
          class="product-options"
          v-for="option in item.customOptions"
          :key="option.label"
        >
          {{ option.label }}: {{ option.value }}
        </div>
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
import {
  SfIcon,
  SfImage,
  SfPrice,
  SfTable
} from '@storefront-ui/vue';
import { mapMobileObserver } from '@storefront-ui/vue/src/utilities/mobile-observer';

import { ProductBaseTableItem } from '../interfaces/product-base-table-item.interface';

export default {
  name: 'OProductsBaseTable',
  components: {
    SfIcon,
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
      type: Array as PropType<ProductBaseTableItem[]>,
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
    }
  },
  computed: {
    ...mapMobileObserver()
  },
  methods: {
    getItemQuantity (product: ProductBaseTableItem): number | string {
      return this.shouldShowHeader ? product.qty : `x ${product.qty}`;
    },
    getPlushieName (product: ProductBaseTableItem): string {
      if (!product.plushieName) {
        return '';
      }

      let name = product.plushieName;

      if (product.plushieBreed) {
        name += ', ' + product.plushieBreed;
      }

      return this.truncate(name);
    },
    truncate (text: string, desktopLength = 75, mobileLength = 50): string {
      const maxLength = this.isMobile ? mobileLength : desktopLength;

      if (text.length <= maxLength) {
        return text;
      }

      return text.substring(0, maxLength) + '...';
    }
  }
}
</script>

  <style lang="scss" scoped>
  @import "~@storefront-ui/shared/styles/helpers/breakpoints";

  .o-products-base-table {
    margin: 0 0 var(--spacer-base) 0;

    .table__row {
      justify-content: space-between;
      align-items: center;
    }

    .sf-table {
      &__data {
        --table-data-color: var(--c-text);
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

    &.o-products-base-table--hidden-header {
        .product-price {
          ::v-deep .sf-price__old {
              margin: 0;
          }
        }

        .table__description {
          flex-basis: 6rem;
        }

        .table__image {
          --image-width: 8.125rem;
          min-width: var(--image-width);
          margin-right: 1em;
        }
    }

    @include for-desktop {
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
        flex: 1 0 12rem;

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
      }
    }
  }
  </style>
