<template>
  <div class="o-bulk-quote-order-form">
    <SfHeading :level="1" :title="$t('Bulk Order Quote')" class="_title" />

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
        :has-bodyparts="true"
        :show-calculation-animation="showCalculationAnimation"
        v-model="bulkordersBaseFormData"
        :get-field-anchor-name="getFieldAnchorName"
        @calculation-animation-finished="onCalculationAnimationFinished"
      >
        <template #bodyparts v-if="colorPaletteCustomization">
          <div class="_section">
            <customization-option
              class="_customization-option"
              ref="customizationOption"
              :customization="colorPaletteCustomization"
              :is-disabled="isDisabled"
              :option-values="colorPaletteCustomizationOptionValues"
              :product-id="product.id"
              :value="
                customizationOptionValue[colorPaletteCustomization.id]
              "
              @input="onCustomizationOptionInput"
            >
              <template #label="{ label }">
                <AOrderedHeading
                  :order="4"
                  :level="3"
                  :title="label"
                  class="_title -required"
                />
              </template>
            </customization-option>
          </div>
        </template>

        <template #size>
          <div class="_section">
            <AOrderedHeading
              :order="7"
              :level="3"
              :title="$t('What’s your preferred size?')"
              class="_title"
              :ref="getFieldAnchorName('Size')"
            />

            <div class="_helper">
              {{
                $t(
                  'Typical sizes are 6" (small), 8" (regular), 12" (large), and 16" (maximum). It\'s OK if you’re not sure.'
                )
              }}
            </div>

            <validation-provider
              v-slot="{ errors }"
              :name="$t('\'Size\'')"
              rules="required|between:6,16"
              slim
            >
              <SfInput
                :label="$t('Size')"
                :valid="!errors.length"
                :error-message="errors[0]"
                name="size"
                class="sf-input--required"
                v-model="bulkSize"
              />
            </validation-provider>
          </div>
        </template>

        <template #quantity-helper>
          <span class="_helper">
            {{
              $t(
                "Need less than 50? Order directly from our sister brand, Budsies. Budsies specializes in one-off or low quantity production at a simple, flat price. You'll automatically get discounts of 10-20% when you add qty 10 or 20 to your cart."
              )
            }}

            <a :href="budsiesStoreDomain" target="_blank">
              {{ $t("Visit Budsies!") }}
            </a>
          </span>
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
    </validation-observer>
  </div>
</template>

<script lang="ts">
import config from 'config';
import { ValidationObserver, ValidationProvider, extend } from 'vee-validate';
import { between, required } from 'vee-validate/dist/rules';
import { SfButton, SfHeading, SfInput } from '@storefront-ui/vue';
import i18n from '@vue-storefront/i18n';
import {
  computed,
  defineComponent,
  PropType,
  Ref,
  ref,
  toRefs
} from '@vue/composition-api';

import Product from 'core/modules/catalog/types/Product';
import {
  BulkorderQuoteProductId,
  BulkOrderStatus,
  BulkOrderInfo
} from 'src/modules/budsies';
import {
  Customization,
  CustomizationOptionValue,
  getCustomizationSelectedValues,
  OptionValue,
  useAvailableCustomizations,
  useCustomizationState
} from 'src/modules/customization-system';
import { useBulkOrdersBaseForm } from 'theme/helpers/use-bulkorders-base-form';
import { useFormValidation } from 'theme/helpers/use-form-validation';

import MBaseForm from './m-base-form.vue';
import AOrderedHeading from '../../atoms/a-ordered-heading.vue';
import CustomizationOption from '../../customization-system/customization-option.vue';
import MBodypartOptionConfigurator from '../../molecules/m-bodypart-option-configurator.vue';
import MFormErrors from '../../molecules/m-form-errors.vue';

extend('required', {
  ...required,
  message: 'The \'{_field_}\' field is required'
});

extend('between', {
  ...between,
  message: 'The {_field_} field must be between {min} and {max}'
});

function getBaseForm (
  refs: Record<string, Vue | Element | Vue[] | Element[]>
): InstanceType<typeof MBaseForm> {
  const baseForm = refs.baseForm as InstanceType<typeof MBaseForm> | undefined;

  if (!baseForm) {
    throw new Error('Base Form is not defined');
  }

  return baseForm;
}

function getFormAllRefs (
  refs: Record<string, Vue | Element | Vue[] | Element[]>
): Record<string, Vue | Element | Vue[] | Element[]> {
  const baseForm = getBaseForm(refs);

  return { ...refs, ...baseForm.$refs, ...(refs.customizationOption as any).$refs };
}

const COLOR_PALETTE_CUSTOMIZATION_SKU = 'bulk_sample_color_palette';

export default defineComponent({
  name: 'OBulkQuoteOrderForm',
  setup (props, setupContext) {
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

    const { availableCustomizations, customizationAvailableOptionValues } =
      useAvailableCustomizations(
        productCustomizations,
        selectedOptionValuesIds,
        customizationOptionValue,
        updateCustomizationOptionValue
      );

    const colorPaletteCustomization = computed<Customization | undefined>(
      () => {
        return availableCustomizations.value.find(
          (item) => item.optionData?.sku?.toLowerCase() === COLOR_PALETTE_CUSTOMIZATION_SKU
        );
      }
    );

    const colorPaletteCustomizationOptionValues = computed<OptionValue[]>(
      () => {
        return colorPaletteCustomization.value?.optionData?.values || [];
      }
    );

    function onCustomizationOptionInput (payload: {
      customizationId: string,
      value: CustomizationOptionValue
    }) {
      updateCustomizationOptionValue(payload);
    }

    return {
      colorPaletteCustomization,
      colorPaletteCustomizationOptionValues,
      customizationAvailableOptionValues,
      customizationOptionValue,
      customizationState,
      onCustomizationOptionInput,
      validationObserver,
      ...useBulkOrdersBaseForm(),
      ...useFormValidation(validationObserver, () =>
        getFormAllRefs(setupContext.refs)
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
    AOrderedHeading,
    CustomizationOption,
    MBaseForm,
    MBodypartOptionConfigurator,
    MFormErrors,
    SfButton,
    SfHeading,
    SfInput,
    ValidationObserver,
    ValidationProvider
  },
  data () {
    return {
      isSubmitting: false,
      bulkSize: undefined as string | undefined,
      showCalculationAnimation: false,
      onCalculationAnimationFinished: () => {}
    };
  },
  computed: {
    bulkOrderInfo (): BulkOrderInfo | undefined {
      return this.$store.getters['budsies/getBulkorderInfo'];
    },
    isDisabled (): boolean {
      return this.isSubmitting;
    },
    budsiesStoreDomain (): string {
      return `https://${config.budsies.budsiesStoreDomain}`;
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

      Promise.all([calculationAnimationPromise, this.submitBulkorder()])
        .then(() => {
          this.redirect();
        })
        .catch((error) => {
          this.onFailure(error.message);

          throw error;
        })
        .finally(() => {
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
            product_id: BulkorderQuoteProductId.PLUSHIE,
            size: this.bulkSize,
            qty: this.bulkordersBaseFormData.quantity,
            project_name: this.bulkordersBaseFormData.name,
            description: this.bulkordersBaseFormData.description,
            uploaded_artwork_ids:
              this.bulkordersBaseFormData.customerImages.map(
                (image) => image.id
              ),
            email: this.bulkordersBaseFormData.customerEmail,
            phone: this.bulkordersBaseFormData.customerPhone,
            country_id: this.bulkordersBaseFormData.country,
            first_name: this.bulkordersBaseFormData.customerFirstName,
            last_name: this.bulkordersBaseFormData.customerLastName,
            alternative_qty:
              this.bulkordersBaseFormData.additionalQuantity || '',
            deadline_date: this.bulkordersBaseFormData.deadlineDate,
            client_type_id: this.bulkordersBaseFormData.customerType || '',
            customization_state: this.customizationState,
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
.o-bulk-quote-order-form {
  padding: var(--spacer-lg);

  ._customization-option {
    --customization-option-align-items: center;
    --customization-option-hint-align: center;
    --widget-error-message-font: var(--font-normal) var(--font-xs) var(--font-family-primary);

    width: 100%;
    text-align: center;
  }

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

  ._input-hint {
    text-align: center;
    font-weight: 600;
  }

  ._error-text {
    color: var(--c-danger-variant);
    font-size: var(--font-xs);
    margin-top: var(--spacer-xs);
    height: calc(var(--font-xs) * 1.2);
    font-weight: var(--font-medium);

    &.-center {
      text-align: center;
      margin-bottom: var(--spacer-sm);
    }
  }

  ._section {
    margin-bottom: var(--spacer-2xl);
    display: flex;
    flex-direction: column;

    ._title {
      margin-bottom: var(--spacer-base);

      &.-required {
        ::v-deep .sf-heading__title {
          &::after {
            content: "*";
            color: var(--c-warning);
            margin-left: -0.3em;
          }
        }
      }
    }
  }

  ._subtitle {
    text-align: center;
  }

  ._color-palette {
    text-align: center;
    margin: var(--spacer-base) 0;
  }
}
</style>
