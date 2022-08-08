import Vue from 'vue';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import { Logger } from '@vue-storefront/core/lib/logger';

import ForeversWizardEvents from 'src/modules/shared/types/forevers-wizard-events';

import ForeversWizardProductTypeStepData from 'theme/components/interfaces/forevers-wizard-product-type-step-data.interface';
import getForeversSkuByType from 'theme/helpers/get-forevers-sku-by-type.function';

export default Vue.extend({
  data () {
    return {
      isPlushieCreatingInProcess: false
    };
  },
  methods: {
    async createPlushie (type: string): Promise<ForeversWizardProductTypeStepData | undefined> {
      const productSku: string = getForeversSkuByType(type);

      this.isPlushieCreatingInProcess = true;

      try {
        const product = await this.$store.dispatch('product/loadProduct', {
          parentSku: productSku,
          childSku: null
        });

        const [plushieCreationTask] = await Promise.all([
          await this.$store.dispatch('budsies/createNewPlushie', { productId: product.id })
        ])

        const plushieId = plushieCreationTask.result;

        const newValue: ForeversWizardProductTypeStepData = { product, plushieId };

        EventBus.$emit(ForeversWizardEvents.TYPE_CHANGE, type);
        return newValue;
      } catch (error) {
        Logger.error('Unable to create plushie: ' + error, 'budsies')();
      } finally {
        this.isPlushieCreatingInProcess = false;
      }
    }
  }
});
