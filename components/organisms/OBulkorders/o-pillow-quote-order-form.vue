<template>
  <div class="o-pillow-quote-order-form">
    <SfHeading
      :level="1"
      :title="$t('Pillow Bulk Order Quote')"
      class="_title"
    />

    <validation-observer
      ref="validationObserver"
      v-slot="{ errors: formErrors }"
      slim
    >
      <m-base-form
        ref="baseForm"
        :product="product"
        :is-disabled="isDisabled"
        :artwork-upload-url="artworkUploadUrl"
        :has-size="true"
        v-model="bulkordersBaseFormData"
        :show-calculation-animation="showCalculationAnimation"
        :get-field-anchor-name="getFieldAnchorName"
        @calculation-animation-finished="onCalculationAnimationFinished"
      >
        <template #size>
          <validation-provider
            tag="div"
            class="_section"
            name="Size"
            v-slot="{ errors }"
          >
            <AOrderedHeading
              :order="6"
              :level="3"
              :title="$t('What\'s your preferred size?')"
              class="_title -required"
              :ref="getFieldAnchorName('Size')"
            />

            <div class="_hint">
              {{ $t("It's OK if you're not sure.") }}
            </div>

            <SfSelect
              v-model="pillowSize"
              :disabled="isDisabled"
              class="sf-select--underlined _size-select"
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
        :form-errors="formErrors"
        @item-click="goToFieldByName"
      />

      <div class="_button-container">
        <SfButton @click="onSubmit" :disabled="isDisabled">
          {{ $t("Get My Quote") }}
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
import i18n from '@vue-storefront/i18n';
import { ValidationObserver, ValidationProvider, extend } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import { SfButton, SfSelect, SfHeading } from '@storefront-ui/vue';
import Vue, { computed, PropType, Ref, ref, toRefs } from 'vue';

import Product from 'core/modules/catalog/types/Product';
import {
  BulkorderQuoteProductId,
  BulkOrderStatus,
  BulkOrderInfo
} from 'src/modules/budsies';
import {
  Customization,
  CustomizationOptionValue,
  OptionValue,
  useAvailableCustomizations,
  useCustomizationState
} from 'src/modules/customization-system';
import { useCurrentInstance } from 'src/modules/shared';

import {
  FormRefs,
  getNestedFormRefs,
  useFormValidation
} from 'theme/helpers/use-form-validation';
import { useBulkOrdersBaseForm } from 'theme/helpers/use-bulkorders-base-form';
import {
  useBulkRequestLeadSource
} from 'theme/helpers/use-bulk-request-lead-source';

import MBaseForm from './m-base-form.vue';
import AOrderedHeading from '../../atoms/a-ordered-heading.vue';
import CustomizationOption from '../../customization-system/customization-option.vue';
import MFormErrors from '../../molecules/m-form-errors.vue';

interface PillowSizeOption {
  id: number | string,
  value: number | string,
  title: string
}

extend('required', {
  ...required,
  message: 'The \'{_field_}\' field is required'
})

function getBaseForm (
  refs: FormRefs
): InstanceType<typeof MBaseForm> {
  const baseForm = refs.baseForm as InstanceType<typeof MBaseForm> | undefined;

  if (!baseForm) {
    throw new Error('Base Form is not defined');
  }

  return baseForm;
}

function getFormAllRefs (
  refs: FormRefs
): FormRefs {
  return {
    ...refs,
    ...getNestedFormRefs(refs, 'baseForm'),
    ...getNestedFormRefs(refs, 'customizationOption')
  };
}

const SIZE_CUSTOMIZATION_NAME = 'size';

export default Vue.extend({
  name: 'OPillowQuoteOrderForm',
  setup (props) {
    const refs = useCurrentInstance().$refs;
    const { product } = toRefs(props);
    const productCustomizations = computed<Customization[]>(() => {
      return product.value.customizations || [];
    });
    const validationObserver: Ref<InstanceType<
      typeof ValidationObserver
    > | null> = ref(null);

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
      get leadSourceCustomization () {
        return leadSourceCustomization.value;
      },
      get leadSourceCustomizationOptionValues () {
        return leadSourceCustomizationOptionValues.value;
      },
      get leadSourceOtherDetailsCustomization () {
        return leadSourceOtherDetailsCustomization.value;
      },
      leadSourcePayload,
      onCustomizationOptionInput,
      validationObserver,
      ...useBulkOrdersBaseForm(),
      ...useFormValidation(
        validationObserver,
        () => getFormAllRefs(refs)
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
    }
  },
  components: {
    MBaseForm,
    MFormErrors,
    SfButton,
    AOrderedHeading,
    CustomizationOption,
    SfSelect,
    SfHeading,
    ValidationObserver,
    ValidationProvider
  },
  data () {
    return {
      isSubmitting: false,
      pillowSize: undefined as string | undefined,
      showCalculationAnimation: false,
      onCalculationAnimationFinished: () => {}
    };
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
    pillowSizeCustomization (): Customization | undefined {
      return this.product.customizations?.find(
        (customization) => customization.name.toLowerCase() === SIZE_CUSTOMIZATION_NAME
      );
    },
    pillowSizeOptions (): PillowSizeOption[] {
      const options: PillowSizeOption[] = [];

      if (!this.pillowSizeCustomization?.optionData?.values) {
        return options;
      }

      this.pillowSizeCustomization.optionData.values.forEach((item) => {
        const value = this.getPillowSizeValue(item);

        if (!item.name || !value) {
          return;
        }

        options.push({
          id: item.id,
          value: value.toString(),
          title: item.name
        });
      });

      return options;
    }
  },
  async beforeMount (): Promise<void> {
    this.pillowSize = this.defaultPillowSizeValue;
  },
  methods: {
    getPillowSizeValue (optionValue: OptionValue): number | undefined {
      switch (optionValue.sku) {
        case 'simplePillowBulkSample_xsmall':
          return 8;
        case 'simplePillowBulkSample_small':
          return 12;
        case 'simplePillowBulkSample_medium':
          return 16;
        case 'simplePillowBulkSample_large':
          return 18;
        default:
          return undefined;
      }
    },
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
            agreement: this.bulkordersBaseFormData.agreement,
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
          this.$router.push({
            name: 'bulkorder-quotation',
            params: { bulkorderId: this.bulkOrderInfo.id }
          });
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
      const baseForm = getBaseForm(this.$refs);

      baseForm.persistCustomerData();
    }
  }
});
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
    width: 100%;

    ::v-deep ._widget {
      width: 100%;
    }

    ::v-deep .text-input-widget {
      max-width: 100%;
    }
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

  ._notice-link-container {
    text-align: center;
  }
}
</style>
