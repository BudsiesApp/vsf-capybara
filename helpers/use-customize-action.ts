import { ref, Ref, SetupContext } from '@vue/composition-api';

import { Logger } from '@vue-storefront/core/lib/logger';

import { CustomizationStateItem, DraftPlushie, saveOrderItemCustomizationsState, submitOrderItemCustomizationsState } from 'src/modules/customization-system';

export function useCustomizeAction (
  customizationStateItems: Ref<CustomizationStateItem[]>,
  draftPlushie: Ref<DraftPlushie | undefined>,
  { root }: SetupContext
) {
  const isSubmitting = ref(false);

  async function confirmCustomization () {
    if (!draftPlushie.value) {
      throw new Error('Draft plushie is not defined');
    }

    if (isSubmitting.value) {
      return;
    }

    isSubmitting.value = true;

    try {
      await saveOrderItemCustomizationsState({
        id: draftPlushie.value.id,
        customization_state: customizationStateItems.value
      });
      await submitOrderItemCustomizationsState({ orderItemId: draftPlushie.value.id });

      root.$router.push({ name: 'orders-history' });
    } catch (e) {
      Logger.error(e, 'draft-plushie')();
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    isSubmitting,
    confirmCustomization
  };
}
