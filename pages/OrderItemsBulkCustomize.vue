<template>
  <div id="order-item-bulk-customize">
    <validation-observer
      slim
      v-slot="{ errors }"
      ref="validationObserver"
    >
      <form
        class="_form"
        @submit.prevent="onFormSubmit"
      >
        <div
          class="_order-item"
          v-for="item in orderItemsCustomizationData"
          :key="item.id"
        >
          <SfHeading :level="2" :title="item.title" />

          <order-item-customization
            class="_customization"
            :is-disabled="isFormDisabled || item.isCustomized"
            :product="item.product"
            :draft-order-item="item.draftOrderItem"
            :ref="orderItemCustomization"
            :order-item-id="item.id"
          />
        </div>

        <div class="_actions">
          <SfButton
            class="_submit-button color-primary"
            type="submit"
            :disabled="isFormDisabled"
          >
            {{ $t('Confirm Customization') }}
          </SfButton>
        </div>
      </form>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, SetupContext, computed } from '@vue/composition-api';
import { SfHeading } from '@storefront-ui/vue';
import { SearchQuery } from 'storefront-query-builder';
import { ValidationObserver } from 'vee-validate';

import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { Logger } from '@vue-storefront/core/lib/logger';
import { DraftOrderItem, fetchOrderItemsCustomizationsStates, submitOrderItemCustomizationsState, saveOrderItemCustomizationsState } from 'src/modules/customization-system';

import OrderItemCustomization from 'theme/components/customization-system/order-item-customization.vue';

interface OrderItemCustomizationData {
  id: string,
  title: string,
  draftOrderItem: DraftOrderItem,
  product: any,
  isCustomized: boolean
}

function useOrderItemsBulkCustomizationActions (
  { root }: SetupContext
) {
  const isSubmitting = ref(false);

  function spawnError (errorMessage: string): void {
    root.$store.dispatch('notification/spawnNotification', {
      type: 'danger',
      message: errorMessage,
      action1: { label: root.$t('OK') }
    });
    Logger.error(errorMessage, 'bulk-customize')();
  }

  async function confirmCustomization (draftOrderItemsDictionary: Record<string, DraftOrderItem>): Promise<void> {
    if (isSubmitting.value) {
      return;
    }

    isSubmitting.value = true;
    const userToken = root.$store.getters['user/getUserToken'];
    const draftOrderItems = Object.values(draftOrderItemsDictionary);

    try {
      const saveResult = await saveOrderItemCustomizationsState(draftOrderItems, userToken);
      const savedOrderItemsIds = saveResult.success.map((item) => item.orderItemId);

      for (const saveError of saveResult.errors) {
        // const orderItem = draftOrderItemsDictionary[saveError.orderItemId];
        spawnError(saveError.errorMessage);
      }

      const submitResult = await submitOrderItemCustomizationsState(
        savedOrderItemsIds,
        userToken
      );

      for (const submitError of submitResult.errors) {
        spawnError(submitError.errorMessage);
      }
    } catch (error) {
      spawnError((error as any).message || 'An error occurred while confirming customizations');
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    isSubmitting,
    confirmCustomization
  }
}

function useOrderItemsBulkCustomizations (
  orderItemIds: Ref<string[]>,
  { root }: SetupContext
) {
  const isLoading = ref(true);

  const draftOrderItemsByProductSku = ref<Record<string, DraftOrderItem[]>>({});
  const productBySkuDictionary = computed<Record<string, Product>>(() => {
    return root.$store.getters['product/getProductBySkuDictionary'];
  });

  const orderItemsCustomizationData = computed<OrderItemCustomizationData[]>(() => {
    const data: OrderItemCustomizationData[] = [];

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
          isCustomized: item.is_customized
        });
      }
    }

    return data;
  });

  async function loadData (): Promise<void> {
    isLoading.value = true;
    draftOrderItemsByProductSku.value = {};

    try {
      const draftOrderItems = await fetchOrderItemsCustomizationsStates(orderItemIds.value);

      for (const item of draftOrderItems) {
        const productSku = item.product_sku;

        if (!draftOrderItemsByProductSku.value[productSku]) {
          draftOrderItemsByProductSku.value[productSku] = [];
        }

        draftOrderItemsByProductSku.value[productSku].push(item);
      }

      const productSkus = Object.keys(draftOrderItemsByProductSku.value);
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
    } catch (error) {
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
    OrderItemCustomization,
    SfHeading,
    ValidationObserver
  },
  props: {
    orderItemIds: {
      type: Array as () => string[],
      required: true
    }
  },
  setup (props, context) {
    const orderItemCustomization = ref<InstanceType<typeof OrderItemCustomization>[]>([]);

    const { isLoading, orderItemsCustomizationData } = useOrderItemsBulkCustomizations(
      ref(props.orderItemIds),
      context
    );

    const { confirmCustomization, isSubmitting } = useOrderItemsBulkCustomizationActions(
      context
    );

    const isFormDisabled = computed(() => {
      return isLoading.value || isSubmitting.value;
    });

    async function onFormSubmit (): Promise<void> {
      if (isFormDisabled.value) {
        return;
      }

      const draftOrderItemsDictionary: Record<string, DraftOrderItem> = {};

      // TODO: temporary - current TS version don't handle `value` type right in this case
      for (const customization of ((orderItemCustomization as any).value) as unknown as InstanceType<typeof OrderItemCustomization>[]) {
        const isCustomizationStateEmpty = customization.isCustomizationStateEmpty();

        if (isCustomizationStateEmpty) {
          continue;
        }

        const customizationState = customization.getCustomizationState();

        if (customizationState) {
          draftOrderItemsDictionary[customization.draftOrderItem.id] = {
            id: customization.draftOrderItem.id,
            customization_state: customizationState,
            product_sku: customization.draftOrderItem.product_sku,
            is_customized: customization.draftOrderItem.is_customized
          };
        }
      }

      await confirmCustomization(
        draftOrderItemsDictionary
      );
    }

    return {
      isFormDisabled,
      orderItemsCustomizationData,
      onFormSubmit
    }
  }
});
</script>
