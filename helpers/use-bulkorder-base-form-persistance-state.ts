import { Ref, onBeforeMount, watch } from '@vue/composition-api';

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
  bulkordersBaseFormData: Ref<BulkordersBaseFormData>
) {
  const storage = StorageManager.get(SN_BUDSIES);

  async function savePersistedState (): Promise<void> {
    const value = bulkordersBaseFormData.value;

    const persistedStateData = {
      country: value.country,
      customerFirstName: value.customerFirstName,
      customerEmail: value.customerEmail,
      customerPhone: value.customerPhone,
      customerLastName: value.customerLastName
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

    bulkordersBaseFormData.value = {
      ...bulkordersBaseFormData.value,
      ...state
    };
  });

  watch(bulkordersBaseFormData, () => {
    savePersistedState();
  });
}
