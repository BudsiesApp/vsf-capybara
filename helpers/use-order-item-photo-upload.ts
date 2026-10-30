import {
  computed,
  onMounted,
  Ref,
  ref
} from 'vue';
import {
  useI18n,
  useStore
} from '@vue-storefront/core/application-services';
import { Logger } from '@vue-storefront/core/lib/logger';
import Product from '@vue-storefront/core/modules/catalog/types/Product';

import {
  Customization,
  CustomizationAvailabilityFlow,
  DraftOrderItem,
  fetchOrderItemCustomizationsState,
  useCustomizationState,
  useEntityBusyState,
  WidgetType
} from 'src/modules/customization-system';
import { FETCH_ORDERS_HISTORY_ACTION } from 'src/modules/orders-history';
import { OrderItem } from 'src/modules/orders-history/types/order-item';

import { useCustomizeAction } from 'theme/helpers/use-customize-action';

export function useOrderItemPhotoUpload (orderItem: Ref<OrderItem>, validate: () => Promise<boolean>) {
  const applicationStore = useStore();
  const i18n = useI18n();
  const product = ref<Product>();
  const customization = ref<Customization>();
  const draftOrderItem = ref<DraftOrderItem>();
  const isReady = ref(false);
  const isPending = ref(false);
  const {
    customizationOptionValue,
    customizationState,
    mergeCustomizationState,
    updateCustomizationOptionValue
  } = useCustomizationState();
  const { isSomeEntityBusy, onEntityBusyChanged } = useEntityBusyState();
  const { confirmCustomization } = useCustomizeAction(customizationState, draftOrderItem);
  const hasImages = computed(() => {
    const value = customization.value && customizationOptionValue.value[customization.value.id];
    return Array.isArray(value) ? value.length > 0 : !!value;
  });
  const isSubmitDisabled = computed(() => isPending.value || isSomeEntityBusy.value || !hasImages.value);

  onMounted(async () => {
    try {
      product.value = await applicationStore.dispatch('product/loadProduct', {
        parentSku: orderItem.value.product.sku,
        setCurrent: false
      });
      if (!product.value) {
        throw new Error('Product is not available');
      }

      customization.value = product.value.customizations?.find(option =>
        option.optionData?.displayWidget === WidgetType.IMAGE_UPLOAD &&
        option.isLocked === false &&
        option.flowAvailability?.includes(CustomizationAvailabilityFlow.CUSTOMIZE_LATER_COMPLETION)
      );
      if (!customization.value) {
        return;
      }

      draftOrderItem.value = await fetchOrderItemCustomizationsState(orderItem.value.item_id.toString());
      if (!draftOrderItem.value) {
        throw new Error('Draft order item is not available');
      }

      const selectedState = draftOrderItem.value.customization_state.find(entry => entry.customization_id === customization.value.id);
      mergeCustomizationState(selectedState ? [selectedState] : []);
      isReady.value = true;
    } catch (error) {
      applicationStore.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: i18n.t('We could not load photo upload. Please try again later.'),
        action1: { label: i18n.t('OK') }
      });
      Logger.error(error, 'order-item-photo-upload')();
    }
  });

  async function submitPhotos (): Promise<void> {
    if (isSubmitDisabled.value) {
      return;
    }

    isPending.value = true;
    try {
      if (!await validate()) {
        return;
      }

      await confirmCustomization();
      applicationStore.dispatch('notification/spawnNotification', {
        type: 'success',
        message: i18n.t('Your photos have been submitted.'),
        action1: { label: i18n.t('OK') }
      });
      await applicationStore.dispatch(FETCH_ORDERS_HISTORY_ACTION, { filters: { excludeAlterationProducts: true } });
    } catch (error) {
      applicationStore.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: i18n.t('Something went wrong. Please try again.'),
        action1: { label: i18n.t('OK') }
      });
      Logger.error(error, 'order-item-photo-upload')();
    } finally {
      isPending.value = false;
    }
  }

  return {
    product,
    customization,
    customizationOptionValue,
    isReady,
    isPending,
    isSubmitDisabled,
    onEntityBusyChanged,
    updateCustomizationOptionValue,
    submitPhotos
  };
}
