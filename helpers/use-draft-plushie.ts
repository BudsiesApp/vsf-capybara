import { watch, Ref, ref, SetupContext } from '@vue/composition-api';

import { Logger } from '@vue-storefront/core/lib/logger';
import i18n from '@vue-storefront/i18n'

import { DraftPlushie, fetchOrderItemCustomizationsState } from 'src/modules/customization-system';

export function useDraftPlushie (
  orderItemId: Ref<string>,
  { root }: SetupContext
) {
  const isDataLoaded = ref<boolean>(false);
  const draftPlushie = ref<DraftPlushie | undefined>();

  async function loadData (): Promise<void> {
    isDataLoaded.value = false;

    try {
      draftPlushie.value = await fetchOrderItemCustomizationsState(orderItemId.value);
      isDataLoaded.value = true;
    } catch (error) {
      root.$store.dispatch('notification/spawnNotification', {
        type: 'error',
        message: i18n.t('Failed to load draft plushie data.'),
        action1: { label: i18n.t('OK') }
      })
      Logger.error(error, 'draft-plushie')();
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
    draftPlushie
  }
}
