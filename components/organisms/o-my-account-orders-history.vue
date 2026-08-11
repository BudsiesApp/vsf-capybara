<template>
  <div class="o-my-account-orders-history">
    <SfHeading
      ref="headingElement"
      :title="$t('My orders')"
      :level="2"
      class="_title"
      tabindex="-1"
    />

    <div class="_panel">
      <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {{ ordersAnnouncement }}
      </p>

      <p class="sr-only" role="alert" aria-atomic="true">
        {{ isError ? $t('Error loading orders') : '' }}
      </p>

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
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { SfHeading, SfLoader } from '@storefront-ui/vue';
import { useI18n } from '@vue-storefront/core/application-services';

import {
  OrdersHistoryList,
  useOrderHistoryList
} from 'src/modules/orders-history';

import { useAlterationProductsLoader } from 'theme/helpers/use-alteration-products-loader';
import { useHeadingFocus } from 'theme/helpers/use-heading-focus';

import AlterationProductForm from 'theme/components/customization-system/forms/alteration-product-form.vue';
import OrdersHistorySuggestedItems from 'theme/components/orders-history/orders-history-suggested-items.vue';

export default defineComponent({
  name: 'OMyAccountOrdersHistory',
  components: {
    SfHeading,
    SfLoader,
    OrdersHistoryList,
    OrdersHistorySuggestedItems
  },
  provide: {
    AlterationProductForm
  },
  setup () {
    const applicationI18n = useI18n();
    const { heading: headingElement } = useHeadingFocus();
    const {
      activeOrdersList,
      completedOrdersList,
      isError,
      isLoading,
      ordersList
    } = useOrderHistoryList();

    const {
      alterationProductByOrderItemId
    } = useAlterationProductsLoader(ordersList);

    const showLoadingIndicator = computed<boolean>(() => {
      return isLoading.value && !isError.value;
    });
    const showEmptyOrdersHistoryMessage = computed<boolean>(() => {
      return !showLoadingIndicator.value && !isError.value && ordersList.value.length === 0;
    });
    const showOrdersHistoryList = computed<boolean>(() => {
      return !isLoading.value && !isError.value && !showEmptyOrdersHistoryMessage.value;
    });
    const ordersAnnouncement = computed<string>(() => {
      if (showLoadingIndicator.value) {
        return applicationI18n.t('Loading orders').toString();
      }

      if (showEmptyOrdersHistoryMessage.value) {
        return applicationI18n.t('Your order history is empty').toString();
      }

      if (showOrdersHistoryList.value) {
        return applicationI18n.t('{count} orders loaded', { count: ordersList.value.length }).toString();
      }

      return '';
    });

    return {
      activeOrdersList,
      alterationProductByOrderItemId,
      completedOrdersList,
      headingElement,
      isError,
      isLoading,
      ordersList,
      ordersAnnouncement,
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
  ._title {
    display: none;
  }

  ._panel {
    border-top: 1px solid var(--c-light);
    padding: var(--spacer-base) var(--spacer-sm);
    color: var(--c-text);
    font: var(--font-light) var(--font-base) / 1.6 var(--font-family-primary);
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
    ._title {
      display: inline-flex;
      position: relative;
      z-index: 1;
      margin: 0 var(--spacer-lg) -2px 0;
      padding: var(--spacer-xs) 0;
      border-bottom: 2px solid var(--c-text);
      --heading-text-align: left;
      --heading-title-margin: 0;
      --heading-title-color: var(--c-text);
      --heading-title-font: var(--font-normal) var(--h4-font-size) / 1.4 var(--font-family-secondary);
      --heading-title-font-size: var(--h4-font-size);
      --heading-title-font-weight: var(--font-normal);
    }

    ._panel {
      border-top-width: 2px;
      padding: var(--spacer-base) 0;
    }
  }
}
</style>
