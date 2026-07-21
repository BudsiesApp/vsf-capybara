<template>
  <div class="o-keychain-quote-order-form">
    <SfHeading :level="1" :title="formTitle" class="_title" />

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
      >
        <template #last-question-after-customer-type v-if="leadSourceCustomization">
          <div class="_last-question-follow-up">
            <customization-option
              class="_customization-option _lead-source-customization"
              ref="customizationOption"
              :customization="leadSourceCustomization"
              :is-disabled="isDisabled"
              :option-values="leadSourceCustomizationOptionValues"
              :product-id="Number(product.id)"
              :value="customizationOptionValue[leadSourceCustomization.id]"
              @input="onCustomizationOptionInput"
            />

            <customization-option
              v-if="leadSourceOtherDetailsCustomization"
              class="_customization-option _lead-source-other-details"
              ref="customizationOption"
              :customization="leadSourceOtherDetailsCustomization"
              :is-disabled="isDisabled"
              :product-id="Number(product.id)"
              :value="customizationOptionValue[leadSourceOtherDetailsCustomization.id]"
              @input="onCustomizationOptionInput"
            />
          </div>
        </template>
      </m-base-form>

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

      <div class="_notice-link-container">
        <template v-if="$additionalContent.privacyPolicyAdditionalLinks">
          <component :is="linkComponent.component" :key="linkComponent.key" v-for="linkComponent in $additionalContent.privacyPolicyAdditionalLinks" />
        </template>
      </div>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import { ValidationObserver } from 'vee-validate';
import { SfButton, SfHeading } from '@storefront-ui/vue';
import i18n from '@vue-storefront/i18n';
import { computed, defineComponent, PropType, Ref, ref, toRefs } from '@vue/composition-api';

import Product from 'core/modules/catalog/types/Product';
import { BulkorderQuoteProductId, BulkOrderStatus, BulkOrderInfo } from 'src/modules/budsies';
import {
  Customization,
  CustomizationOptionValue,
  OptionValue,
  useAvailableCustomizations,
  useCustomizationState
} from 'src/modules/customization-system';

import {
  FormRefs,
  getNestedFormRefs,
  useFormValidation
} from 'theme/helpers/use-form-validation';
import { useBulkOrdersBaseForm } from 'theme/helpers/use-bulkorders-base-form';
import {
  useBulkRequestLeadSource
} from 'theme/helpers/use-bulk-request-lead-source';

import CustomizationOption from 'theme/components/customization-system/customization-option.vue';
import MFormErrors from 'theme/components/molecules/m-form-errors.vue';

import MBaseForm from './m-base-form.vue';

function getBaseFormRefs (
  refs: FormRefs
): FormRefs {
  return {
    ...getNestedFormRefs(refs, 'baseForm'),
    ...getNestedFormRefs(refs, 'customizationOption')
  };
}

export default defineComponent({
  name: 'OKeychainQuoteOrderForm',
  setup (props, setupContext) {
    const { product } = toRefs(props);
    const productCustomizations = computed<Customization[]>(() => {
      return product.value.customizations || [];
    });
    const validationObserver: Ref<InstanceType<typeof ValidationObserver> | null> = ref(null);

    const {
      customizationOptionValue,
      customizationState,
      selectedOptionValuesIds,
      updateCustomizationOptionValue
    } = useCustomizationState();

    const {
      availableCustomizations,
      customizationAvailableOptionValues
    } = useAvailableCustomizations(
      productCustomizations,
      selectedOptionValuesIds,
      customizationOptionValue,
      updateCustomizationOptionValue
    );

    const {
      leadSourceCustomization,
      leadSourceOtherDetailsCustomization,
      leadSourcePayload,
      leadSourceCustomizationOptionValues
    } = useBulkRequestLeadSource(
      availableCustomizations,
      customizationOptionValue,
      customizationAvailableOptionValues
    );

    function onCustomizationOptionInput (payload: {
      customizationId: string,
      value: CustomizationOptionValue
    }) {
      updateCustomizationOptionValue(payload);
    }

    return {
      customizationOptionValue,
      customizationState,
      leadSourceCustomization,
      leadSourceCustomizationOptionValues,
      leadSourceOtherDetailsCustomization,
      leadSourcePayload,
      onCustomizationOptionInput,
      validationObserver,
      ...useBulkOrdersBaseForm(),
      ...useFormValidation(
        validationObserver,
        () => getBaseFormRefs(setupContext.refs)
      )
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
    },
    formTitle: {
      type: String,
      required: true
    }
  },
  components: {
    MBaseForm,
    CustomizationOption,
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
    },
    bulkorderQuoteProductId (): number {
      switch (this.product.sku) {
        case 'keychainBulkSample_bundle':
          return BulkorderQuoteProductId.KEYCHAIN;
        case 'keychainAcrylicBulkSample_bundle':
          return BulkorderQuoteProductId.ACRYLIC_KEYCHAIN;
        default:
          throw new Error('Unexpected product sku');
      }
    }
  },
  methods: {
    async onSubmit (): Promise<void> {
      if (this.isDisabled) {
        return;
      }

      this.trimValues();
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

      this.persistCustomerData();

      try {
        const bulkOrderId = await this.$store.dispatch(
          'budsies/createBulkorder',
          {
            product_id: this.bulkorderQuoteProductId,
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
            agreement: this.bulkordersBaseFormData.agreement,
            customization_state: this.customizationState,
            ...this.leadSourcePayload
          }
        );

        await this.$store.dispatch('budsies/loadBulkOrderInfo', bulkOrderId);

        if (!this.bulkOrderInfo || this.bulkOrderInfo.id !== bulkOrderId) {
          throw new Error('Unable to resolve status for created BulkOrder');
        }
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
    },
    persistCustomerData (): void {
      const baseForm = this.$refs.baseForm as InstanceType<typeof MBaseForm> | undefined;

      if (!baseForm) {
        throw new Error('Base Form is not defined');
      }

      baseForm.persistCustomerData();
    }
  }
})
</script>

<style lang="scss" scoped>
.o-keychain-quote-order-form {
  padding: var(--spacer-lg);

  ._title {
    margin-bottom: var(--spacer-2xl);
    align-self: center;
  }

  ._form-errors {
    margin-top: var(--spacer-lg);
  }

  ._button-container {
    display: flex;
    justify-content: center;
    margin-top: var(--spacer-lg);
  }

  ._customization-option {
    --dropdown-widget-max-width: 100%;
  }

  ._last-question-follow-up {
    display: flex;
    flex-direction: column;
    gap: var(--spacer-lg);
  }

  ._lead-source-customization,
  ._lead-source-other-details {
    --customization-option-label-size: 1rem;
    --customization-option-label-weight: var(--font-normal);
  }

  ._lead-source-other-details {
    ::v-deep ._widget {
      width: 100%;
    }

    ::v-deep .text-input-widget {
      max-width: 100%;
    }
  }

  ._notice-link-container {
    text-align: center;
  }
}
</style>
