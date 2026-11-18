import { useStore } from '@vue-storefront/core/application-services';
import { ref, Ref } from 'vue';

import { BudsieStatus } from 'src/modules/shared';
import { Customization, CustomizationStateItem, DraftOrderItem, filterCustomizationState, isImageUploadCustomization, saveOrderItemCustomizationsState, submitOrderItemCustomizationsState } from 'src/modules/customization-system';

export function useCustomizeAction (
  customizationStateItems: Ref<CustomizationStateItem[]>,
  draftOrderItem: Ref<DraftOrderItem | undefined>,
  productCustomizations: Ref<Customization[]>
) {
  const applicationStore = useStore();
  const isSubmitting = ref(false);

  async function confirmCustomization () {
    if (!draftOrderItem.value) {
      throw new Error('Draft order item is not defined');
    }

    if (isSubmitting.value) {
      return;
    }

    isSubmitting.value = true;
    const userToken = applicationStore.getters['user/getUserToken'];

    try {
      let state = customizationStateItems.value;
      if (draftOrderItem.value.status_id === BudsieStatus.AWAITING_ARTWORK) {
        const imageIds = new Set(productCustomizations.value.filter(isImageUploadCustomization).map(customization => customization.id));
        state = state.filter(entry => imageIds.has(entry.customization_id));
      }

      const saveResult = await saveOrderItemCustomizationsState(
        [{
          id: draftOrderItem.value.id,
          customization_state: filterCustomizationState(state),
          status_id: draftOrderItem.value.status_id
        }],
        userToken
      );

      if (saveResult.errors[0]) {
        throw new Error(saveResult.errors[0].errorMessage);
      }

      const submitResult = await submitOrderItemCustomizationsState(
        [draftOrderItem.value.id],
        userToken
      );

      if (submitResult.errors[0]) {
        throw new Error(submitResult.errors[0].errorMessage);
      }
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    isSubmitting,
    confirmCustomization
  };
}
