import { onBeforeMount, watch } from '@vue/composition-api';

import { StorageManager } from '@vue-storefront/core/lib/storage-manager';
import { SN_BUDSIES } from 'src/modules/budsies/store/mutation-types';
import BulkordersBaseFormData from 'theme/components/interfaces/bulkorders-base-form-data.interface';

interface PersistedStateData {
  country: string,
  customerFirstName: string,
  customerLastName: string,
  customerEmail: string,
  customerPhone: string
}

const key = 'bulkorder-base-form-data';

export function useBulkorderBaseFormPersistanceState (
  bulkordersBaseFormData: BulkordersBaseFormData
) {
  const storage = StorageManager.get(SN_BUDSIES);

  async function savePersistedState (): Promise<void> {
    const persistedStateData = {
      country: bulkordersBaseFormData.country,
      customerFirstName: bulkordersBaseFormData.customerFirstName,
      customerEmail: bulkordersBaseFormData.customerEmail,
      customerPhone: bulkordersBaseFormData.customerPhone,
      customerLastName: bulkordersBaseFormData.customerLastName
    };

    await storage.setItem(key, persistedStateData);
  }

  async function getPersistedState (): Promise<PersistedStateData | undefined> {
    return storage.getItem(key);
  }

  onBeforeMount(async () => {
    const state = await getPersistedState();

    if (!state) {
      return;
    }

    bulkordersBaseFormData.country = state.country;
    bulkordersBaseFormData.customerFirstName = state.customerFirstName;
    bulkordersBaseFormData.customerEmail = state.customerEmail;
    bulkordersBaseFormData.customerPhone = state.customerPhone;
    bulkordersBaseFormData.customerLastName = state.customerLastName;
  });

  watch(bulkordersBaseFormData, () => {
    savePersistedState();
  });
}
