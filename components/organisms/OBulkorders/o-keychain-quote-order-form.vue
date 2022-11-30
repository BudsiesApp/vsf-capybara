<template>
  <div class="o-keychain-quote-order-form">
    <SfHeading :level="1" :title="$t('Keychain Bulk Order Quote')" class="_title" />

    <m-base-form
      ref="baseForm"
      :product="product"
      :is-disabled="isDisabled"
      :artwork-upload-url="artworkUploadUrl"
      v-model="bulkordersBaseFormData"
      :show-calculation-animation="showCalculationAnimation"
      @calculation-animation-finished="onCalculationAnimationFinished"
    />

    <div class="_button-container">
      <SfButton @click="onSubmit" :disabled="isDisabled">
        {{ $t('Get My Quote') }}
      </SfButton>
    </div>
  </div>
</template>

<script lang="ts">
import i18n from '@vue-storefront/i18n';
import { PropType } from 'vue';
import { SfButton, SfHeading } from '@storefront-ui/vue';

import Product from 'core/modules/catalog/types/Product';
import BulkordersBaseFormData from 'theme/components/interfaces/bulkorders-base-form-data.interface';
import { BulkorderQuoteProductId, BulkOrderStatus, BulkOrderInfo } from 'src/modules/budsies';

import MBaseForm from './m-base-form.vue';
import BulkorderBaseFormPersistanceState from 'theme/mixins/bulkorder-base-form-persistance-state';

export default BulkorderBaseFormPersistanceState.extend({
  name: 'OKeychainQuoteOrderForm',
  props: {
    product: {
      type: Object as PropType<Product>,
      required: true
    },
    artworkUploadUrl: {
      type: String,
      required: true
    }
  },
  components: {
    MBaseForm,
    SfButton,
    SfHeading
  },
  data () {
    const bulkordersBaseFormData: BulkordersBaseFormData = {
      name: '',
      description: '',
      quantity: undefined,
      additionalQuantity: undefined,
      deadline: undefined,
      deadlineDate: undefined,
      country: '',
      customerFirstName: '',
      customerLastName: undefined,
      customerEmail: '',
      customerPhone: '',
      customerImages: [],
      customerType: undefined,
      agreement: false
    }

    return {
      bulkordersBaseFormData,
      isSubmitting: false,
      showCalculationAnimation: false,
      onCalculationAnimationFinished: () => {}
    }
  },
  computed: {
    bulkOrderInfo (): BulkOrderInfo | undefined {
      return this.$store.getters['budsies/getBulkorderInfo'];
    },
    isDisabled (): boolean {
      return this.isSubmitting;
    }
  },
  async beforeMount (): Promise<void> {
    const state = await this.getPersistedState();

    if (!state) {
      return;
    }

    this.bulkordersBaseFormData = { ...this.bulkordersBaseFormData, ...state };
  },
  methods: {
    getBaseFormComponent (): InstanceType<typeof MBaseForm> | undefined {
      return this.$refs.baseForm as InstanceType<typeof MBaseForm> | undefined;
    },
    getDataToPersist () {
      return {
        country: this.bulkordersBaseFormData.country,
        customerFirstName: this.bulkordersBaseFormData.customerFirstName,
        customerEmail: this.bulkordersBaseFormData.customerEmail,
        customerPhone: this.bulkordersBaseFormData.customerPhone,
        customerLastName: this.bulkordersBaseFormData.customerLastName
      }
    },
    async onSubmit (): Promise<void> {
      const form = this.getBaseFormComponent();

      if (this.isDisabled || !form || !form.getValidationState()) {
        return;
      }

      this.showCalculationAnimation = true;

      const calculationAnimationPromise = new Promise<void>((resolve) => {
        this.onCalculationAnimationFinished = resolve;
      });

      Promise.all([
        calculationAnimationPromise,
        this.submitBulkorder()
      ]).then(() => {
        this.redirect();
      }).catch((error) => {
        this.onFailure(error.message);

        throw error;
      }).finally(() => {
        this.showCalculationAnimation = false;
      });
    },
    async submitBulkorder (): Promise<void> {
      this.isSubmitting = true;

      try {
        const bulkOrderId = await this.$store.dispatch(
          'budsies/createBulkorder',
          {
            product_id: BulkorderQuoteProductId.KEYCHAIN,
            qty: this.bulkordersBaseFormData.quantity,
            project_name: this.bulkordersBaseFormData.name,
            description: this.bulkordersBaseFormData.description,
            uploaded_artwork_ids: this.bulkordersBaseFormData.customerImages.map((image) => image.id),
            email: this.bulkordersBaseFormData.customerEmail,
            phone: this.bulkordersBaseFormData.customerPhone,
            country_id: this.bulkordersBaseFormData.country,
            first_name: this.bulkordersBaseFormData.customerFirstName,
            last_name: this.bulkordersBaseFormData.customerLastName,
            alternative_qty: this.bulkordersBaseFormData.additionalQuantity || '',
            deadline_date: this.bulkordersBaseFormData.deadlineDate,
            client_type_id: this.bulkordersBaseFormData.customerType || '',
            agreement: this.bulkordersBaseFormData.agreement
          }
        );

        await this.$store.dispatch('budsies/loadBulkOrderInfo', bulkOrderId);

        if (!this.bulkOrderInfo || this.bulkOrderInfo.id !== bulkOrderId) {
          throw new Error('Unable to resolve status for created BulkOrder');
        }
      } catch (e) {
        throw e;
      } finally {
        this.isSubmitting = false;
      }
    },
    redirect (): void {
      if (!this.bulkOrderInfo) {
        return;
      }

      switch (this.bulkOrderInfo.statusId) {
        case BulkOrderStatus.WAITING_FOR_QUOTE:
          this.$router.push({ name: 'bulkorder-confirmation' });
          break;
        default:
          this.$router.push({ name: 'bulkorder-quotation', params: { bulkorderId: this.bulkOrderInfo.id } });
      }
    },
    onFailure (message: any): void {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: message,
        action1: { label: i18n.t('OK') }
      });
    }
  },
  watch: {
    'bulkordersBaseFormData.customerFirstName': {
      handler (): void {
        this.savePersistedState()
      }
    },
    'bulkordersBaseFormData.customerEmail': {
      handler (): void {
        this.savePersistedState();
      }
    },
    'bulkordersBaseFormData.country': {
      handler (): void {
        this.savePersistedState();
      }
    },
    'bulkordersBaseFormData.customerPhone': {
      handler (): void {
        this.savePersistedState();
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.o-keychain-quote-order-form {
  padding: var(--spacer-lg);

  ._title {
    margin-bottom: var(--spacer-2xl);
  }

  .m-base-form {
    margin-bottom: var(--spacer-lg);
  }

  ._button-container {
    display: flex;
    justify-content: center;
  }
}
</style>
