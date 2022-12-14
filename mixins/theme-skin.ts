import Vue from 'vue';
import { currentStoreView } from '@vue-storefront/core/lib/multistore'

export default Vue.extend({
  computed: {
    skinClass (): string {
      const { storeId } = currentStoreView();

      switch (storeId) {
        case 5:
          return '-skin-bulkorders';
        case 3:
          return '-skin-petsies';
        default:
          throw new Error(`Unable to find skin class for store ID: ${storeId}`)
      }
    }
  }
})
