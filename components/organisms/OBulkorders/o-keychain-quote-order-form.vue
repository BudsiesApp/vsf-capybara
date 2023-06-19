<template>
  <div class="o-keychain-quote-order-form">
    <SfHeading :level="1" :title="$t('Keychain Bulk Order Quote')" class="_title" />

    <validation-observer
      ref="validationObserver"
      v-slot="{errors}"
      slim
    >
      <m-base-form
        ref="baseForm"
        :product="product"
        :is-disabled="isDisabled"
        :artwork-upload-url="artworkUploadUrl"
        v-model="bulkordersBaseFormData"
        :show-calculation-animation="showCalculationAnimation"
        :get-field-anchor-name="getFieldAnchorName"
        @calculation-animation-finished="onCalculationAnimationFinished"
      />

      <m-form-errors
        class="_form-errors"
        :form-errors="errors"
        @item-click="goToFieldByName"
      />

      <div class="_button-container">
        <SfButton
          @click="onSubmit"
          :disabled="isDisabled"
        >
          {{ $t('Get My Quote') }}
        </SfButton>
      </div>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import { ValidationObserver } from 'vee-validate';
import { SfButton, SfHeading } from '@storefront-ui/vue';
import i18n from '@vue-storefront/i18n';
import { defineComponent, PropType } from '@vue/composition-api';

import Product from 'core/modules/catalog/types/Product';
import { BulkorderQuoteProductId, BulkOrderStatus, BulkOrderInfo, vuexTypes as budsiesTypes } from 'src/modules/budsies';
import { useFormValidation } from 'theme/helpers/use-form-validation';
import { useBulkOrdersBaseForm } from 'theme/helpers/use-bulkorders-base-form';

import MFormErrors from 'theme/components/molecules/m-form-errors.vue';

import MBaseForm from './m-base-form.vue';

function getBaseFormRefs (
  refs: Record<string, Vue | Element | Vue[] | Element[]>
): Record<string, Vue | Element | Vue[] | Element[]> {
  const baseForm = refs.baseForm as InstanceType<typeof MBaseForm> | undefined;

  if (!baseForm) {
    throw new Error('Base Form is not defined');
  }

  return baseForm.$refs;
}

export default defineComponent({
  name: 'OKeychainQuoteOrderForm',
  setup (_, setupContext) {
    return {
      ...useBulkOrdersBaseForm(),
      ...useFormValidation(() => getBaseFormRefs(setupContext.refs))
    };
  },
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
    MFormErrors,
    SfButton,
    SfHeading,
    ValidationObserver
  },
  data () {
    return {
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
  methods: {
    async onSubmit (): Promise<void> {
      if (this.isDisabled) {
        return;
      }

      const isValid = await this.validateAndGoToFirstError();

      if (!isValid) {
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

      this.$store.commit(
        budsiesTypes.SN_BUDSIES + '/' + budsiesTypes.CUSTOMER_EMAIL_SET,
        { email: this.bulkordersBaseFormData.customerEmail }
      );

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
  }
})
</script>

<style lang="scss" scoped>
.o-keychain-quote-order-form {
  padding: var(--spacer-lg);

  ._title {
    margin-bottom: var(--spacer-2xl);
  }

  ._form-errors {
    margin-top: var(--spacer-lg);
  }

  ._button-container {
    display: flex;
    justify-content: center;
    margin-top: var(--spacer-lg);
  }
}
</style>
