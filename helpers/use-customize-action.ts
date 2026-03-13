import { ref, Ref, SetupContext } from '@vue/composition-api';

import { CustomizationStateItem, DraftOrderItem, filterCustomizationState, saveOrderItemCustomizationsState, submitOrderItemCustomizationsState } from 'src/modules/customization-system';

export function useCustomizeAction (
  customizationStateItems: Ref<CustomizationStateItem[]>,
  draftOrderItem: Ref<DraftOrderItem | undefined>,
  { root }: SetupContext
) {
  const isSubmitting = ref(false);

  async function confirmCustomization () {
    if (!draftOrderItem.value) {
      throw new Error('Draft order item is not defined');
    }

    if (isSubmitting.value) {
      return;
    }

    isSubmitting.value = true;
    const userToken = root.$store.getters['user/getUserToken'];

    try {
      const saveResult = await saveOrderItemCustomizationsState(
        [{
          id: draftOrderItem.value.id,
          customization_state: filterCustomizationState(customizationStateItems.value),
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
