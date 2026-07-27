import { watch, Ref, ref } from 'vue';

import { Logger } from '@vue-storefront/core/lib/logger';
import i18n from '@vue-storefront/core/i18n'

import { DraftOrderItem, fetchOrderItemCustomizationsState } from 'src/modules/customization-system';
import { useRootInstance } from 'src/modules/shared';

export function useDraftOrderItem (
  orderItemId: Ref<string>
) {
  const root = useRootInstance();
  const isDataLoaded = ref<boolean>(false);
  const draftOrderItem = ref<DraftOrderItem | undefined>();

  async function loadData (): Promise<void> {
    isDataLoaded.value = false;

    try {
      draftOrderItem.value = await fetchOrderItemCustomizationsState(orderItemId.value);
      isDataLoaded.value = true;
    } catch (error) {
      root.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: i18n.t('Failed to load draft order item data.'),
        action1: { label: i18n.t('OK') }
      });
      Logger.error(error, 'draft-order-item')();
    }
  }

  watch(
    orderItemId,
    () => {
      void loadData();
    },
    {
      immediate: true
    }
  );

  return {
    isDataLoaded,
    draftOrderItem
  }
}
