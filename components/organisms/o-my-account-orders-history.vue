<template>
  <div class="o-my-account-orders-history">
    <SfTabs :open-tab="1">
      <SfTab :title="$t('My orders')" class="_orders-tab">
        <div v-if="showOrdersHistoryList" class="_content">
          <orders-history-list
            :orders="activeOrdersList"
            :alteration-products="alterationProductByOrderItemId"
            :title="$t('Active Orders').toString()"
            v-if="activeOrdersList.length"
          />

          <orders-history-suggested-items class="_suggested-items" />

          <orders-history-list
            :orders="completedOrdersList"
            :alteration-products="alterationProductByOrderItemId"
            :title="$t('Completed Orders').toString()"
            v-if="completedOrdersList.length"
          />
        </div>

        <div v-else-if="showLoadingIndicator" class="_loading-indicator">
          <SfLoader class="_sf-loader" :loading="true" />
        </div>

        <div v-else-if="showEmptyOrdersHistoryMessage" class="_empty">
          {{ $t('Your order history is empty') }}
        </div>

        <div v-else-if="isError" class="_error">
          {{ $t('Error loading orders') }}
        </div>
      </SfTab>
    </SfTabs>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api';
import { SfLoader, SfTabs } from '@storefront-ui/vue';

import {
  OrdersHistoryList,
  useOrderHistoryList
} from 'src/modules/orders-history';

import { useAlterationProductsLoader } from 'theme/helpers/use-alteration-products-loader';

import AlterationProductForm from 'theme/components/customization-system/forms/alteration-product-form.vue';
import OrdersHistorySuggestedItems from 'theme/components/orders-history/orders-history-suggested-items.vue';

export default defineComponent({
  name: 'OMyAccountOrdersHistory',
  components: {
    SfLoader,
    SfTabs,
    OrdersHistoryList,
    OrdersHistorySuggestedItems
  },
  provide: {
    AlterationProductForm
  },
  setup (_, context) {
    const {
      activeOrdersList,
      completedOrdersList,
      isError,
      isLoading,
      ordersList
    } = useOrderHistoryList(context);

    const {
      alterationProductByOrderItemId
    } = useAlterationProductsLoader(ordersList, context);

    const showLoadingIndicator = computed<boolean>(() => {
      return isLoading.value && !isError.value;
    });
    const showEmptyOrdersHistoryMessage = computed<boolean>(() => {
      return !showLoadingIndicator.value && !isError.value && ordersList.value.length === 0;
    });
    const showOrdersHistoryList = computed<boolean>(() => {
      return !isLoading.value && !isError.value && !showEmptyOrdersHistoryMessage.value;
    });

    return {
      activeOrdersList,
      alterationProductByOrderItemId,
      completedOrdersList,
      isError,
      isLoading,
      showLoadingIndicator,
      showEmptyOrdersHistoryMessage,
      showOrdersHistoryList
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.o-my-account-orders-history {
  ::v-deep {
    .sf-tabs__title {
      display: none;
    }
  }

  ._content {
    display: flex;
    flex-direction: column;
    row-gap: var(--spacer-xl);
  }

  ._suggested-items {
    margin-bottom: var(--spacer-base);
  }

  ._loading-indicator {
    padding: var(--spacer-lg);
  }

  @include for-desktop {
    ::v-deep {
      .sf-tabs__title {
        display: flex;
      }
    }
  }
}
</style>
