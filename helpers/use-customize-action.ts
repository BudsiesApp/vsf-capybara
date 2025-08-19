import { ref, Ref, SetupContext } from '@vue/composition-api';

import { CustomizationStateItem, DraftOrderItem, saveOrderItemCustomizationsState, submitOrderItemCustomizationsState } from 'src/modules/customization-system';

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
      await saveOrderItemCustomizationsState(
        [{
          id: draftOrderItem.value.id,
          customization_state: customizationStateItems.value
        }],
        userToken
      );

      await submitOrderItemCustomizationsState(
        [draftOrderItem.value.id],
        userToken
      );
    } catch (error) {
      if (!error.messages) {
        throw error;
      }

      throw new Error(error.messages[0]);
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    isSubmitting,
    confirmCustomization
  };
}
