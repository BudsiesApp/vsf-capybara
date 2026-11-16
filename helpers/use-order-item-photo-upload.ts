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
  const isSubmitted = ref(false);
  const submissionError = ref('');
  const {
    customizationOptionValue,
    customizationState,
    mergeCustomizationState,
    resetCustomizationState,
    updateCustomizationOptionValue
  } = useCustomizationState();
  const { isSomeEntityBusy, onEntityBusyChanged } = useEntityBusyState();
  const { confirmCustomization } = useCustomizeAction(customizationState, draftOrderItem);
  const imageCount = computed(() => {
    const value = customization.value && customizationOptionValue.value[customization.value.id];
    if (Array.isArray(value)) {
      return value.length;
    }

    return value ? 1 : 0;
  });
  const hasImages = computed(() => imageCount.value > 0);
  const isUploading = computed(() => isSomeEntityBusy.value);
  const isCancelDisabled = computed(() => isPending.value || isSubmitted.value || isSomeEntityBusy.value);
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
    if (isSubmitted.value) {
      return;
    }

    isFormOpen.value = true;
  }

  function cancel (): void {
    if (isCancelDisabled.value) {
      return;
    }

    resetCustomizationState();
    mergeCustomizationState(savedState.value);
    submissionError.value = '';
    isFormOpen.value = false;
  }

  async function submitPhotos (): Promise<void> {
    if (isSubmitDisabled.value) {
      return;
    }

    isPending.value = true;
    submissionError.value = '';
    try {
      if (!await validate()) {
        isPending.value = false;
        return;
      }

      await confirmCustomization();
    } catch (error) {
      isPending.value = false;
      submissionError.value = i18n.t('Something went wrong. Please try again.').toString();
      Logger.error(error, 'order-item-photo-upload')();
      return;
    }

    // Submission is final: the order refresh is only background synchronization and must not unlock the form.
    isSubmitted.value = true;
    isPending.value = false;
    onSubmitted();
  }

  return {
    product,
    customization,
    customizationOptionValue,
    isReady,
    isFormOpen,
    isPending,
    isSubmitted,
    isUploading,
    imageCount,
    submissionError,
    isCancelDisabled,
    isSubmitDisabled,
    openForm,
    cancel,
    onEntityBusyChanged,
    updateCustomizationOptionValue,
    submitPhotos
  };
}
