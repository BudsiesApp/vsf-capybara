<template>
  <div class="o-my-account-orders-history">
    <SfTabs :open-tab="1">
      <SfTab :title="$t('My orders')" class="_orders-tab">
        <template v-if="!activeOrder">
          <div v-if="ordersHistory.length === 0" class="no-orders">
            <p class="no-orders__title">
              {{ $t('You currently have no orders') }}
            </p>

            <SfButton @click="onStartShoppingButtonClick" class="no-orders__button">
              {{ $t('Start shopping') }}
            </SfButton>
          </div>

          <SfTable v-else class="orders">
            <SfTableHeading>
              <SfTableHeader
                v-for="tableHeader in tableHeaders"
                :key="tableHeader.title"
                :class="tableHeader.class"
              >
                {{ tableHeader.title }}
              </SfTableHeader>

              <SfTableHeader class="orders__element--right _view-button" />
            </SfTableHeading>

            <SfTableRow
              v-for="row in tableRows"
              :key="row.order_id.value"
              @click.native="setActiveOrderById(row.order_id.value)"
            >
              <SfTableData v-for="(data, key) in row" :key="key" :class="data.columnClass">
                <template v-if="key === 'status'">
                  <span
                    :class="{
                      'text-success': data.value === 'Complete',
                      'text-danger': data.value === 'Canceled' || data.value === 'Closed',
                      'text-warning': data.value !== 'Complete' && data.value !== 'Canceled' && data.value !== 'Closed'
                    }"
                  >{{ data.value }}</span>
                </template>

                <template v-else>
                  {{ data.value }}
                </template>
              </SfTableData>

              <SfTableData class="orders__view orders__element--right _view-button">
                <SfButton
                  class="sf-button--text color-secondary"
                  @click.native="setActiveOrderById(row.order_id.value)"
                >
                  {{ $t('VIEW') }}
                </SfButton>

                <SfButton
                  class="sf-button--text color-secondary"
                  :disabled="isReorderInProgress"
                  @click.native.stop="reorder(row.order_id.value)"
                >
                  {{ $t('REORDER') }}
                </SfButton>
              </SfTableData>
            </SfTableRow>
          </SfTable>
        </template>

        <template v-else>
          <OMyAccountOrderDetails
            :order="activeOrder"
            :is-reorder-in-progress="isReorderInProgress"
            @close="setActiveOrderById(null)"
            @reorder-button-clicked="reorder"
          />
        </template>
      </SfTab>
    </SfTabs>
  </div>
</template>

<script>
import UserOrder from '@vue-storefront/core/modules/order/components/UserOrdersHistory';
import OMyAccountOrderDetails from 'theme/components/organisms/o-my-account-order-details';
import { SfTabs, SfTable, SfButton } from '@storefront-ui/vue';
import { ModalList } from 'theme/store/ui/modals';

const ColumnClass = {
  ORDER_ID: '_order-id',
  ORDER_DATE: '_order-date',
  PAYMENT_METHOD: '_payment-method',
  AMOUNT: '_amount',
  STATUS: '_status'
}

export default {
  name: 'OMyAccountOrdersHistory',
  mixins: [UserOrder],
  components: {
    SfTabs,
    SfTable,
    SfButton,
    OMyAccountOrderDetails
  },
  data () {
    return {
      tableHeaders: [
        { title: this.$t('Order ID'), class: ColumnClass.ORDER_ID },
        { title: this.$t('Order date'), class: ColumnClass.ORDER_DATE },
        { title: this.$t('Payment method'), class: ColumnClass.PAYMENT_METHOD },
        { title: this.$t('Amount'), class: ColumnClass.AMOUNT },
        { title: this.$t('Status'), class: ColumnClass.STATUS }
      ],
      activeOrder: null,
      isReorderInProgress: false
    };
  },
  computed: {
    tableRows () {
      let rows = [];

      this.ordersHistory.forEach(item => {
        rows.push({
          'order_id': {
            value: item.increment_id,
            columnClass: ColumnClass.ORDER_ID
          },
          'order_date': {
            value: this.$options.filters.date(item.created_at),
            columnClass: ColumnClass.ORDER_DATE
          },
          'payment_method': {
            value: item.payment.additional_information[0],
            columnClass: ColumnClass.PAYMENT_METHOD
          },
          'amount': {
            value: this.$options.filters.price(item.grand_total),
            columnClass: ColumnClass.AMOUNT
          },
          'status': {
            value: this.$options.filters.capitalize(item.status),
            columnClass: ColumnClass.STATUS
          }
        })
      });

      return rows;
    }
  },
  methods: {
    downloadAll () {
      this.$store.dispatch('ui/openModal', { name: ModalList.FeatureNotImplemented })
    },
    setActiveOrderById (orderId) {
      this.activeOrder = orderId
        ? this.ordersHistory.find(item => {
          return orderId.toString() === item.increment_id.toString()
        })
        : null
    },
    onStartShoppingButtonClick () {
      this.$router.push('/');
    },
    async reorder (orderIncrementId) {
      if (this.isReorderInProgress) {
        return;
      }

      this.isReorderInProgress = true;

      const order = this.ordersHistory.find((item) => item.increment_id === orderIncrementId);

      try {
        if (!this.$store.getters['cart/getCartToken']) {
          await this.$store.dispatch('cart/connect', {});
        }

        await this.$store.dispatch('budsies/reorder', { orderId: order.id });
        await this.$store.dispatch('cart/pullServerCart', true);
      } finally {
        this.isReorderInProgress = false;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.o-my-account-orders-history {
  ._order-id {
    flex-grow: 2;
    display: none;
  }

  ._order-date {
    flex-grow: 3;
  }

  ._payment-method {
    flex-grow: 3;
    display: none;
  }

  ._amount {
    flex-grow: 2;
  }

  ._status {
    flex-grow: 2;
  }

  ._view-button {
    flex-grow: 1;
    display: none;
  }

  .orders {
    --table-column-text-align: center;
    --table-column-padding: 0 var(--spacer-xs);
    --table-column-flex: 1;
  }

  .no-orders {
    &__title {
      margin: 0 0 var(--spacer-base) 0;
    }

    &__button {
      --button-width: 100%;
      margin: var(--spacer-2xl) 0 0 0;
    }
  }

  ::v-deep {
    .sf-table__heading,
    .sf-table__row {
      flex-wrap: nowrap;
    }

    .sf-tabs__title {
      display: none;
    }
  }

  @media screen and (min-width: 400px) {
    ._order-id {
      display: table-cell;
    }
  }

  @media screen and (min-width: 460px) {
    ._payment-method {
      display: table-cell;
    }
  }

  @media screen and (min-width: 570px) {
    ._view-button {
      display: table-cell;
    }
  }

  @include for-desktop {
    .no-orders {
      &__button {
        --button-width: 17.375rem;
      }
    }

    .orders {
      &__element {
        &--right {
          text-align: right;
        }
      }
    }

    ::v-deep {
      .sf-tabs__title {
        display: flex;
      }
    }
  }
}
</style>
