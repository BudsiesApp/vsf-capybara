<template>
  <div id="order-items-bulk-customize">
    <SfHeading :level="1" :title="$t('Customize Your Order Items')" />

    <section class="form-hints">
      <SfHeading :level="3" :title="$t('How drag & drop works')" />

      <div class="_hints-section">
        <strong>Drop files anywhere on the page (outside the individual upload boxes)</strong>
        <ul>
          <li>Images are automatically distributed into the empty upload slots.</li>
          <li>Each empty uploader receives one image, in order, until there are no more empty uploaders or files.</li>
        </ul>
      </div>

      <div class="_hints-section">
        <strong>Drop files onto a specific uploader box</strong>
        <ul>
          <li>All files you drop onto that single box are added to that particular item.</li>
          <li>Use this when you want multiple images for one product/item.</li>
        </ul>
      </div>
    </section>

    <vertical-steps-form-placeholder v-if="isLoading && !showForm" />

    <order-items-bulk-customization-form
      v-else-if="showForm"
      :order-items-customization-forms-data="orderItemsCustomizationData"
      :is-disabled="isLoading"
      @confirmed="onCustomizationConfirmed"
    />

    <div class="_not-found" v-else>
      <SfHeading :level="4" :title="$t('No Customizable Order Items Found')" />

      <router-link
        class="sf-button _order-history-link"
        :to="{name: 'orders-history'}"
      >
        {{ $t('Go To Order History') }}
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { useRouter, useStore } from '@vue-storefront/core/application-services';
import {
  defineComponent,
  Ref,
  ref,
  computed,
  PropType
} from 'vue';
import { SfHeading } from '@storefront-ui/vue';
import { SearchQuery } from 'storefront-query-builder';

import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { Logger } from '@vue-storefront/core/lib/logger';
import { DraftOrderItem, fetchOrderItemsCustomizationsStates } from 'src/modules/customization-system';

import { OrderItemCustomizationFormData } from 'theme/interfaces/order-item-customization-form-data.interface';

import OrderItemsBulkCustomizationForm from 'theme/components/customization-system/forms/order-items-bulk-customization-form.vue';
import VerticalStepsFormPlaceholder from 'theme/components/customization-system/forms/placeholders/vertical-steps-form-placeholder.vue';
import { BudsieStatus } from 'src/modules/shared';

function useOrderItemsBulkCustomizations (
  orderItemIds: Ref<string[]>
) {
  const applicationStore = useStore();
  const isLoading = ref(true);

  const draftOrderItemsByProductSku = ref<Record<string, DraftOrderItem[]>>({});
  const productBySkuDictionary = computed<Record<string, Product>>(() => {
    return applicationStore.getters['product/getProductBySkuDictionary'];
  });

  const orderItemsCustomizationData = computed<OrderItemCustomizationFormData[]>(() => {
    const data: OrderItemCustomizationFormData[] = [];

    for (const productSku of Object.keys(draftOrderItemsByProductSku.value)) {
      const product = productBySkuDictionary.value[productSku];

      if (!product) {
        Logger.error(`Product with SKU "${productSku}" not found`, 'bulk-customize')();
        continue;
      }

      const items = draftOrderItemsByProductSku.value[productSku];
      const isMultipleItems = items.length > 1;

      for (const [index, item] of items.entries()) {
        data.push({
          id: item.id,
          title: isMultipleItems ? `${product.name} (${index + 1})` : product.name,
          draftOrderItem: item,
          product,
          isCustomized: item.status_id !== BudsieStatus.AWAITING_CUSTOMIZATION
        });
      }
    }

    return data;
  });

  async function loadData (): Promise<void> {
    isLoading.value = true;

    try {
      const draftOrderItems = await fetchOrderItemsCustomizationsStates(orderItemIds.value);
      const _draftOrderItemsByProductSku: Record<string, DraftOrderItem[]> = {};

      for (const item of draftOrderItems) {
        const productSku = item.product_sku;

        if (!productSku) {
          Logger.error(`Draft order item with ID "${item.id}" has no product SKU`, 'bulk-customize')();
          continue;
        }

        if (!_draftOrderItemsByProductSku[productSku]) {
          _draftOrderItemsByProductSku[productSku] = [];
        }

        _draftOrderItemsByProductSku[productSku].push(item);
      }

      const productSkus = Object.keys(_draftOrderItemsByProductSku);
      let notExistingProductsSkus: string[] = [];

      for (const sku of productSkus) {
        if (!productBySkuDictionary.value[sku]) {
          notExistingProductsSkus.push(sku);
        }
      }

      let productsQuery = new SearchQuery();
      productsQuery = productsQuery
        .applyFilter({ key: 'sku', value: { 'in': notExistingProductsSkus } });

      await applicationStore.dispatch('product/findProducts', {
        query: productsQuery,
        options: {
          prefetchGroupProducts: false
        }
      });

      // TODO: temporary - current TS version don't handle `value` type right in this case
      (draftOrderItemsByProductSku.value as unknown as Record<string, DraftOrderItem[]>) = _draftOrderItemsByProductSku;
    } catch (error) {
      // TODO: temporary - current TS version don't handle `value` type right in this case
      (draftOrderItemsByProductSku.value as unknown as Record<string, DraftOrderItem[]>) = {};
      Logger.error(`Failed to load draft order items: ${error}`, 'bulk-customize')();
    } finally {
      isLoading.value = false;
    }
  }

  void loadData();

  return {
    isLoading,
    loadData,
    orderItemsCustomizationData
  };
}

export default defineComponent({
  name: 'OrderItemsBulkCustomize',
  components: {
    SfHeading,
    OrderItemsBulkCustomizationForm,
    VerticalStepsFormPlaceholder

  },
  props: {
    orderItemIds: {
      type: Array as PropType<string[] | string>,
      required: true
    }
  },
  setup (props) {
    const applicationRouter = useRouter();
    const orderItemIds = computed<string[]>(() => {
      return Array.isArray(props.orderItemIds) ? props.orderItemIds : [props.orderItemIds];
    });

    const { isLoading, loadData, orderItemsCustomizationData } = useOrderItemsBulkCustomizations(
      orderItemIds
    );

    const showForm = computed<boolean>(() => {
      return orderItemsCustomizationData.value.length > 0;
    });

    async function onCustomizationConfirmed (): Promise<void> {
      await loadData();

      const allItemsCustomized = orderItemsCustomizationData.value.every((item) => item.isCustomized);

      if (allItemsCustomized) {
        applicationRouter.replace({ name: 'orders-history' });
      }
    }

    return {
      isLoading,
      onCustomizationConfirmed,
      orderItemsCustomizationData,
      showForm
    }
  },
  metaInfo () {
    return { title: 'Customize Your Order Items' };
  }
});
</script>

<style lang="scss" scoped>
#order-items-bulk-customize {
  padding: var(--spacer-lg) var(--spacer-sm) 0;

  .form-hints {
    max-width: 960px;
    margin: var(--spacer-base) auto 0;

    ._section-title {
      text-align: center;
    }

    ._hints-section {
      margin-top: var(--spacer-sm);

      &:first-child {
        margin-top: 0;
      }
    }
  }

  ._not-found {
    margin-top: var(--spacer-xl);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  ._order-history-link {
    margin-top: var(--spacer-base);

    &:hover {
      color: var(--c-white);
    }
  }
}
</style>
