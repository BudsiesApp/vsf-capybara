<template>
  <div class="o-pillow-quote-order-form">
    <SfHeading :level="1" :title="$t('Pillow Bulk Order Quote')" class="_title" />

    <validation-observer v-slot="{passes, errors: formErrors}" slim>
      <m-base-form
        ref="baseForm"
        :product="product"
        :is-disabled="isDisabled"
        :artwork-upload-url="artworkUploadUrl"
        :has-size="true"
        v-model="bulkordersBaseFormData"
        :show-calculation-animation="showCalculationAnimation"
        @calculation-animation-finished="onCalculationAnimationFinished"
      >
        <template #size>
          <validation-provider
            tag="div"
            class="_section"
            name="'Size'"
            v-slot="{errors}"
          >
            <AOrderedHeading
              :order="6"
              :level="3"
              :title="$t('What\'s your preferred size?')"
              class="_title -required"
              :ref="getFieldAnchorName('Size')"
            />

            <div class="_hint">
              {{ $t('It\'s OK if you\'re not sure.') }}
            </div>

            <SfSelect
              v-model="pillowSize"
              :disabled="isDisabled"
              class="sf-select--underlined"
            >
              <SfSelectOption
                v-for="sizeOption in pillowSizeOptions"
                :key="sizeOption.id"
                :value="sizeOption.value"
              >
                {{ sizeOption.title }}
              </SfSelectOption>
            </SfSelect>

            <div class="_error-text" v-if="errors.length">
              {{ errors[0] }}
            </div>
          </validation-provider>
        </template>
      </m-base-form>

      <m-form-errors
        class="_form-errors"
        :form-errors="formErrors"
        @go-to-field="onGoToField"
      />

      <div class="_button-container">
        <SfButton
          @click="() => passes(() => onSubmit())"
          :disabled="isDisabled"
        >
          {{ $t('Get My Quote') }}
        </SfButton>
      </div>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import i18n from '@vue-storefront/i18n';
import { ValidationObserver, ValidationProvider, extend } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import { PropType } from 'vue';
import { TranslateResult } from 'vue-i18n';
import { SfButton, SfSelect, SfHeading } from '@storefront-ui/vue';

import Product from 'core/modules/catalog/types/Product';
import { BundleOption, BundleOptionsProductLink } from 'core/modules/catalog/types/BundleOption';
import { BulkorderQuoteProductId, BulkOrderStatus, BulkOrderInfo, vuexTypes as budsiesTypes } from 'src/modules/budsies';
import BulkordersBaseFormData from 'theme/components/interfaces/bulkorders-base-form-data.interface';
import BulkorderBaseFormPersistanceState from 'theme/mixins/bulkorder-base-form-persistance-state';
import { getFieldAnchorName } from 'theme/helpers/get-field-anchor-name.function';
import { goToFieldByName } from 'theme/helpers/go-to-field-by-name.function';

import MBaseForm from './m-base-form.vue';
import AOrderedHeading from '../../atoms/a-ordered-heading.vue';
import MFormErrors from '../../molecules/m-form-errors.vue';

interface PillowSizeOption {
  id: number | string,
  value: number | string,
  title: string
}

extend('required', {
  ...required,
  message: '{_field_} field is required'
})

export default BulkorderBaseFormPersistanceState.extend({
  name: 'OPillowQuoteOrderForm',
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
    AOrderedHeading,
    SfSelect,
    SfHeading,
    ValidationObserver,
    ValidationProvider
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
      pillowSize: undefined as string | undefined,
      showCalculationAnimation: false,
      onCalculationAnimationFinished: () => {}
    }
  },
  computed: {
    bulkOrderInfo (): BulkOrderInfo | undefined {
      return this.$store.getters['budsies/getBulkorderInfo'];
    },
    defaultPillowSizeValue (): string | undefined {
      return this.pillowSizeOptions[0]?.value.toString();
    },
    isDisabled (): boolean {
      return this.isSubmitting;
    },
    pillowSizeOptions (): PillowSizeOption[] {
      const options: PillowSizeOption[] = [];

      if (!this.productBundleOption) {
        return options;
      }

      this.productBundleOption.product_links.forEach((productLink) => {
        if (!productLink.product) {
          return;
        }

        options.push({
          id: productLink.id,
          value: this.getPillowSizeValue(productLink).toString(),
          title: this.getPillowSizeTitle(productLink).toString()
        });
      })

      return options;
    },
    productBundleOption (): BundleOption | undefined {
      if (!this.product.bundle_options) {
        return;
      }

      return this.product.bundle_options.find(
        (bundleOption) => bundleOption.title.toLowerCase() === 'product'
      );
    }
  },
  async beforeMount (): Promise<void> {
    const state = await this.getPersistedState();
    this.pillowSize = this.defaultPillowSizeValue;

    if (!state) {
      return;
    }

    this.bulkordersBaseFormData = { ...this.bulkordersBaseFormData, ...state };
  },
  methods: {
    getBaseForm (): InstanceType<typeof MBaseForm> | undefined {
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
    getFieldAnchorName (fieldName: string): string {
      return getFieldAnchorName(fieldName);
    },
    getFormAllRefs (): Record<string, Vue | Element | Vue[] | Element[]> {
      const baseForm = this.getBaseForm();

      if (!baseForm) {
        return this.$refs;
      }

      return { ...this.$refs, ...baseForm.$refs };
    },
    getPillowSizeTitle (sizeProductLink: BundleOptionsProductLink): TranslateResult {
      switch (sizeProductLink.sku) {
        case 'simplePillowBulkSample_small':
          return this.$t('12" small');
        case 'simplePillowBulkSample_medium':
          return this.$t('16" medium');
        case 'simplePillowBulkSample_large':
          return this.$t('18" large');
        default:
          throw new Error('Wrong pillow size sku!');
      }
    },
    getPillowSizeValue (sizeProductLink: BundleOptionsProductLink): number {
      switch (sizeProductLink.sku) {
        case 'simplePillowBulkSample_small':
          return 12;
        case 'simplePillowBulkSample_medium':
          return 16;
        case 'simplePillowBulkSample_large':
          return 18;
        default:
          throw new Error('Wrong pillow size sku!');
      }
    },
    onGoToField (fieldName: string): void {
      const refs = this.getFormAllRefs();

      goToFieldByName(fieldName, refs);
    },
    async onSubmit (): Promise<void> {
      if (this.isDisabled) {
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
            product_id: BulkorderQuoteProductId.PILLOW,
            size: this.pillowSize,
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
  .o-pillow-quote-order-form {
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

    ._section {
        margin-bottom: var(--spacer-2xl);
        display: flex;
        flex-direction: column;

        ._title {
            margin-bottom: var(--spacer-base);
        }
    }

    ._error-text {
        color: var(--c-danger-variant);
        font-size: var(--font-xs);
        margin-top: var(--spacer-xs);
        height: calc(var(--font-xs) * 1.2);
        font-weight: var(--font-medium);
    }
  }
  </style>
