import { StorageManager } from '@vue-storefront/core/lib/storage-manager';
import { SN_BUDSIES } from 'src/modules/budsies/store/mutation-types';
import Vue from 'vue';

interface PersistedStateData {
  country: string,
  customerFirstName: string,
  customerLastName: string,
  customerEmail: string,
  customerPhone: string
}

const key = 'bulkorder-base-form-data';

export default Vue.extend({
  data () {
    return {
      storage: StorageManager.get(SN_BUDSIES)
    }
  },
  methods: {
    async savePersistedState (): Promise<void> {
      await this.storage.setItem(key, this.getDataToPersist());
    },
    async getPersistedState (): Promise<PersistedStateData | undefined> {
      return this.storage.getItem(key);
    },
    getDataToPersist (): PersistedStateData {
      throw new Error('Not implemented yet');
    }
  }
})
