<template>
  <div id="order-items-bulk-customize" class="order-items-bulk-customize">
    <SfHeading :level="1" :title="$t('Order Items Customize')" />

    <order-items-bulk-customization-form
      v-if="!isLoading"
      :order-items-customization-forms-data="orderItemsCustomizationData"
    />

    <vertical-steps-form-placeholder v-else />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  Ref,
  ref,
  SetupContext,
  computed
} from '@vue/composition-api';
import { SfHeading } from '@storefront-ui/vue';
import { SearchQuery } from 'storefront-query-builder';

import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { Logger } from '@vue-storefront/core/lib/logger';
import { DraftOrderItem, fetchOrderItemsCustomizationsStates } from 'src/modules/customization-system';

import { OrderItemCustomizationFormData } from 'theme/interfaces/order-item-customization-form-data.interface';

import OrderItemsBulkCustomizationForm from 'theme/components/customization-system/forms/order-items-bulk-customization-form.vue';
import VerticalStepsFormPlaceholder from 'theme/components/customization-system/forms/placeholders/vertical-steps-form-placeholder.vue';

function useOrderItemsBulkCustomizations (
  orderItemIds: Ref<string[]>,
  { root }: SetupContext
) {
  const isLoading = ref(true);

  const draftOrderItemsByProductSku = ref<Record<string, DraftOrderItem[]>>({});
  const productBySkuDictionary = computed<Record<string, Product>>(() => {
    return root.$store.getters['product/getProductBySkuDictionary'];
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
          isCustomized: !!item.is_customized
        });
      }
    }

    return data;
  });

  async function loadData (): Promise<void> {
    isLoading.value = true;
    // TODO: temporary - current TS version don't handle `value` type right in this case
    (draftOrderItemsByProductSku.value as unknown as Record<string, DraftOrderItem[]>) = {};

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

      await root.$store.dispatch('product/findProducts', {
        query: productsQuery,
        options: {
          prefetchGroupProducts: false
        }
      });

      // TODO: temporary - current TS version don't handle `value` type right in this case
      (draftOrderItemsByProductSku.value as unknown as Record<string, DraftOrderItem[]>) = _draftOrderItemsByProductSku;
    } catch (error) {
      console.error(error);
      Logger.error('Failed to load draft order items', 'bulk-customize')();
    } finally {
      isLoading.value = false;
    }
  }

  void loadData();

  return {
    isLoading,
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
      type: Array as () => string[],
      required: true
    }
  },
  setup (props, context) {
    const { isLoading, orderItemsCustomizationData } = useOrderItemsBulkCustomizations(
      ref(props.orderItemIds),
      context
    );

    return {
      orderItemsCustomizationData,
      isLoading
    }
  },
  metaInfo () {
    return { title: 'Order Items Customize' };
  }
});
</script>

<style lang="scss" scoped>
#order-items-bulk-customize {
  padding: var(--spacer-lg) var(--spacer-sm) 0;
}
</style>
