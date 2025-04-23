<template>
  <div class="o-my-account-orders-history">
    <SfTabs :open-tab="1">
      <SfTab :title="$t('My orders')" class="_orders-tab">
        <orders-history-list />
      </SfTab>
    </SfTabs>
  </div>
</template>

<script>
import i18n from '@vue-storefront/i18n';
import UserOrder from '@vue-storefront/core/modules/order/components/UserOrdersHistory';
import { SfTabs } from '@storefront-ui/vue';
import { ModalList } from 'theme/store/ui/modals';

import { OrdersHistoryList } from 'src/modules/orders-history';

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
    OrdersHistoryList
  },
  data () {
    return {
      reorderingOrderIncrementId: undefined
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
            value: this.$options.filters.capitalize(item.status_label),
            columnClass: ColumnClass.STATUS
          }
        })
      });

      return rows;
    },
    isReorderButtonDisabled () {
      return !!this.reorderingOrderIncrementId;
    }
  },
  methods: {
    downloadAll () {
      this.$store.dispatch('ui/openModal', { name: ModalList.FeatureNotImplemented })
    },
    onStartShoppingButtonClick () {
      this.$router.push('/');
    },
    async reorder (orderIncrementId) {
      if (this.reorderingOrderIncrementId) {
        return;
      }

      this.reorderingOrderIncrementId = orderIncrementId;

      const order = this.ordersHistory.find((item) => item.increment_id === orderIncrementId);

      try {
        if (!this.$store.getters['cart/getCartToken']) {
          await this.$store.dispatch('cart/connect', {});
        }

        const { resultCode } = await this.$store.dispatch('budsies/reorder', { orderId: order.id });

        if (resultCode !== 200) {
          this.onFailure();
          return;
        }

        await this.$store.dispatch('cart/pullServerCart', true);
        this.$router.push({ name: 'detailed-cart' });
      } catch (error) {
        this.onFailure();
      } finally {
        this.reorderingOrderIncrementId = undefined;
      }
    },
    isReorderInProgressFor (orderIncrementId) {
      return this.reorderingOrderIncrementId && this.reorderingOrderIncrementId === orderIncrementId;
    },
    onFailure () {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: i18n.t('Something went wrong'),
        action1: { label: i18n.t('OK') }
      });
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
