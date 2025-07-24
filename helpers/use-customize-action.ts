import { ref, Ref, SetupContext } from '@vue/composition-api';

import { Logger } from '@vue-storefront/core/lib/logger';
import i18n from '@vue-storefront/core/i18n';

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
        {
          id: draftOrderItem.value.id,
          customization_state: customizationStateItems.value
        },
        userToken
      );

      await submitOrderItemCustomizationsState(
        { order_item_id: draftOrderItem.value.id },
        userToken
      );
    } catch (e) {
      throw e;
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    isSubmitting,
    confirmCustomization
  };
}
