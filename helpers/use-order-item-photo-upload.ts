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
  CustomizationStateItem,
  DraftOrderItem,
  fetchOrderItemCustomizationsState,
  useCustomizationState,
  useEntityBusyState,
  WidgetType
} from 'src/modules/customization-system';

import { useCustomizeAction } from 'theme/helpers/use-customize-action';

export function useOrderItemPhotoUpload (
  orderItemId: Ref<number>,
  productSku: Ref<string>,
  validate: () => Promise<boolean>,
  onSubmitted: () => void
) {
  const applicationStore = useStore();
  const i18n = useI18n();
  const product = ref<Product>();
  const customization = ref<Customization>();
  const draftOrderItem = ref<DraftOrderItem>();
  const savedState = ref<CustomizationStateItem[]>([]);
  const isReady = ref(false);
  const isFormOpen = ref(false);
  const isPending = ref(false);
  const {
    customizationOptionValue,
    customizationState,
    mergeCustomizationState,
    resetCustomizationState,
    updateCustomizationOptionValue
  } = useCustomizationState();
  const { isSomeEntityBusy, onEntityBusyChanged } = useEntityBusyState();
  const { confirmCustomization } = useCustomizeAction(customizationState, draftOrderItem);
  const hasImages = computed(() => {
    const value = customization.value && customizationOptionValue.value[customization.value.id];
    return Array.isArray(value) ? value.length > 0 : !!value;
  });
  const isCancelDisabled = computed(() => isPending.value || isSomeEntityBusy.value);
  const isSubmitDisabled = computed(() => isCancelDisabled.value || !hasImages.value);

  onMounted(async () => {
    try {
      product.value = await applicationStore.dispatch('product/loadProduct', {
        parentSku: productSku.value,
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

      draftOrderItem.value = await fetchOrderItemCustomizationsState(orderItemId.value.toString());
      if (!draftOrderItem.value) {
        throw new Error('Draft order item is not available');
      }

      const selectedState = draftOrderItem.value.customization_state.find(entry => entry.customization_id === customization.value.id);
      savedState.value = selectedState ? [selectedState] : [];
      mergeCustomizationState(savedState.value);
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

  function openForm (): void {
    isFormOpen.value = true;
  }

  function cancel (): void {
    if (isCancelDisabled.value) {
      return;
    }

    resetCustomizationState();
    mergeCustomizationState(savedState.value);
    isFormOpen.value = false;
  }

  async function submitPhotos (): Promise<void> {
    if (isSubmitDisabled.value) {
      return;
    }

    isPending.value = true;
    try {
      if (!await validate()) {
        isPending.value = false;
        return;
      }

      await confirmCustomization();
    } catch (error) {
      isPending.value = false;
      applicationStore.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: i18n.t('Something went wrong. Please try again.'),
        action1: { label: i18n.t('OK') }
      });
      Logger.error(error, 'order-item-photo-upload')();
      return;
    }

    // The item is no longer awaiting artwork, so the form stays locked until the parent removes it.
    applicationStore.dispatch('notification/spawnNotification', {
      type: 'success',
      message: i18n.t('Your photos have been submitted.'),
      action1: { label: i18n.t('OK') }
    });
    onSubmitted();
  }

  return {
    product,
    customization,
    customizationOptionValue,
    isReady,
    isFormOpen,
    isPending,
    isCancelDisabled,
    isSubmitDisabled,
    openForm,
    cancel,
    onEntityBusyChanged,
    updateCustomizationOptionValue,
    submitPhotos
  };
}
