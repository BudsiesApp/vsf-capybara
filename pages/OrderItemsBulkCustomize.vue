<template>
  <div id="order-item-bulk-customize" class="order-items-bulk-customize">
    <SfHeading :level="1" :title="$t('Order Items Customize')" />

    <form
      class="_form"
      @submit.prevent="onFormSubmit"
    >
      <div
        class="_step"
        v-for="item in orderItemsCustomizationData"
        :key="item.id"
      >
        <SfDivider class="_step-divider" />

        <SfHeading
          class="_step-title"
          :level="3"
          :title="item.title"
        />

        <div class="_content">
          <order-item-customization
            class="_customization"
            :is-disabled="isFormDisabled || item.isCustomized"
            :product="item.product"
            :draft-order-item="item.draftOrderItem"
            ref="orderItemCustomization"
            :order-item-id="item.id"
            :title="item.title"
            @order-item-customization-busy-state-changed="onEntityBusyChanged"
          />
        </div>
      </div>

      <m-form-errors
        class="_form-errors"
        :form-errors="orderItemsErrors"
        @item-click="goToOrderItem"
      />

      <div class="_actions">
        <SfButton
          class="_submit-button color-primary"
          type="submit"
          :disabled="isSubmitButtonDisabled"
        >
          {{ $t('Confirm Customization') }}
        </SfButton>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { set, defineComponent, Ref, ref, SetupContext, computed } from '@vue/composition-api';
import { SfButton, SfDivider, SfHeading } from '@storefront-ui/vue';
import { SearchQuery } from 'storefront-query-builder';

import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { Logger } from '@vue-storefront/core/lib/logger';
import {
  DraftOrderItem,
  fetchOrderItemsCustomizationsStates,
  submitOrderItemCustomizationsState,
  saveOrderItemCustomizationsState,
  useEntityBusyState
} from 'src/modules/customization-system';

import { useBulkImagesUpload } from 'theme/helpers/use-bulk-images-upload';

import MFormErrors from 'theme/components/molecules/m-form-errors.vue';
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

type OrderItemCustomizationForm = InstanceType<typeof OrderItemCustomization>;

export default defineComponent({
  name: 'OrderItemsBulkCustomize',
  components: {
    MFormErrors,
    OrderItemCustomization,
    SfButton,
    SfDivider,
    SfHeading
  },
  props: {
    orderItemIds: {
      type: Array as () => string[],
      required: true
    }
  },
  setup (props, context) {
    const orderItemCustomization = ref<OrderItemCustomizationForm[]>([]);
    const orderItemsErrors = ref<Record<string, string>>({});

    const orderItemCustomizationByOrderItemId = computed<Record<string, OrderItemCustomizationForm>>(() => {
      const dictionary: Record<string, OrderItemCustomizationForm> = {};

      // TODO: temporary - current TS version don't handle `value` type right in this case
      for (const orderItemCustomizationForm of ((orderItemCustomization as any).value as unknown as OrderItemCustomizationForm[])) {
        dictionary[orderItemCustomizationForm.draftOrderItem.id] = orderItemCustomizationForm;
      }

      return dictionary;
    });

    function goToOrderItem (orderItemId: string): void {
      const orderItemCustomizationForm = orderItemCustomizationByOrderItemId.value[orderItemId]

      if (!orderItemCustomizationForm) {
        return;
      }

      orderItemCustomizationForm.scrollToFirstError();
    }

    const { isSomeEntityBusy, onEntityBusyChanged } =
      useEntityBusyState();

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

    const isSubmitButtonDisabled = computed(() => {
      return isFormDisabled.value || isSomeEntityBusy.value;
    });

    async function onFormSubmit (): Promise<void> {
      // TODO: temporary - current TS version don't handle `value` type right in this case
      (orderItemsErrors.value as unknown as Record<string, string>) = {};

      if (isFormDisabled.value) {
        return;
      }

      const orderItemsWithError: OrderItemCustomizationForm[] = [];

      // TODO: temporary - current TS version don't handle `value` type right in this case
      for (const item of ((orderItemCustomization as any).value as unknown as OrderItemCustomizationForm[])) {
        const isOrderItemCustomizationsValid = await item.validateForm();

        if (!isOrderItemCustomizationsValid) {
          orderItemsWithError.push(item);
        }
      }

      for (const errorItem of orderItemsWithError) {
        set(
          orderItemsErrors.value,
          errorItem.draftOrderItem.id,
          [`${errorItem.title} form has error`]
        );
      }

      const firstOrderItemWithError = orderItemsWithError[0];

      if (firstOrderItemWithError) {
        firstOrderItemWithError.scrollToFirstError();
        return;
      }

      const draftOrderItemsDictionary: Record<string, DraftOrderItem> = {};

      // TODO: temporary - current TS version don't handle `value` type right in this case
      for (const customization of ((orderItemCustomization as any).value) as unknown as OrderItemCustomizationForm[]) {
        if (customization.isCustomizationStateEmpty) {
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
      ...useBulkImagesUpload(context),
      isFormDisabled,
      isSubmitButtonDisabled,
      goToOrderItem,
      orderItemCustomization,
      orderItemsCustomizationData,
      orderItemsErrors,
      onEntityBusyChanged,
      onFormSubmit
    }
  },
  metaInfo () {
    return { title: 'Order Items Customize' };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.order-items-bulk-customize {
  text-align: center;
  padding: var(--spacer-lg) var(--spacer-sm) 0;
  box-sizing: border-box;

  ._step {
    margin-top: var(--spacer-lg);

    ._content {
      max-width: 720px;
      width: 100%;
      margin: var(--spacer-sm) auto 0;
    }
  }

  ._customization {
    margin-top: var(--spacer-base);
    text-align: left;
  }

  ._step-divider {
    display: none;
    margin-top: var(--spacer-lg);
  }

  ._step-title {
    display: inline-block;
    margin-top: var(--spacer-base);
  }

  ._form-errors {
    margin-top: var(--spacer-xl);
  }

  ._actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: var(--spacer-xl);
  }

  @media (min-width: $tablet-min) {
    padding: var(--spacer-lg) 1rem 0;

    ._step-divider {
      display: block;
    }
  }
}
</style>
