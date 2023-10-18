<template>
  <div class="o-bulk-quote-order-form">
    <SfHeading :level="1" :title="$t('Bulk Order Quote')" class="_title" />

    <validation-observer
      ref="validationObserver"
      v-slot="{errors: formErrors}"
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
        <template #bodyparts v-if="colorPaletteBodypart">
          <div class="_section">
            <AOrderedHeading
              :order="4"
              :level="3"
              :title="$t('Color Palette')"
              class="_title -required"
              :ref="getFieldAnchorName('Color Palette')"
            />

            <span class="_subtitle">
              {{ $t('Please select the colors of your design to help us accurately bring your character to life.') }}
            </span>

            <validation-provider
              v-slot="{ errors }"
              rules="required"
              name="'Color Palette'"
              slim
            >
              <m-bodypart-option-configurator
                v-model="color"
                :name="colorPaletteBodypart.code"
                :max-values="colorPaletteBodypart.maxValues"
                :options="colorPaletteOptions"
                :disabled="isDisabled"
                compact-mode
                type="bodypart"
                class="_color-palette"
              />

              <div class="_error-text -center" v-if="errors.length">
                {{ errors[0] }}
              </div>
            </validation-provider>

            <span class="_input-hint">
              {{ $t('Click an existing color to deselect it.') }}
            </span>

            <span class="_input-hint">
              {{ $t('Please note any special requests in the description above') }}
            </span>
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
              {{ $t('Typical sizes are 6" (small), 8" (regular), 12" (large), and 16" (maximum). It\'s OK if you’re not sure.') }}
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
            {{ $t('Need less than 50? Order directly from our sister brand, Budsies. Budsies specializes in one-off or low quantity production at a simple, flat price. You\'ll automatically get discounts of 10-20% when you add qty 10 or 20 to your cart.') }}

            <a :href="budsiesStoreDomain" target="_blank">
              {{ $t('Visit Budsies!') }}
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
import config from 'config';
import { ValidationObserver, ValidationProvider, extend } from 'vee-validate';
import { between, required } from 'vee-validate/dist/rules';
import { SfButton, SfHeading, SfInput } from '@storefront-ui/vue';
import i18n from '@vue-storefront/i18n';
import { defineComponent, PropType, Ref, ref } from '@vue/composition-api';

import Product from 'core/modules/catalog/types/Product';
import { Bodypart, BodypartOption, BodypartValue, BulkorderQuoteProductId, BulkOrderStatus, BulkOrderInfo, Dictionary } from 'src/modules/budsies';
import { useBulkOrdersBaseForm } from 'theme/helpers/use-bulkorders-base-form';
import { useFormValidation } from 'theme/helpers/use-form-validation';
import { SET_LAST_USED_CUSTOMER_EMAIL, SET_LAST_USED_CUSTOMER_FIRST_NAME, SET_LAST_USED_CUSTOMER_LAST_NAME, SET_LAST_USED_CUSTOMER_PHONE_NUMBER, SET_LAST_USED_CUSTOMER_SHIPPING_COUNTRY, SN_PERSISTED_CUSTOMER_DATA } from 'src/modules/persisted-customer-data';

import MBaseForm from './m-base-form.vue';
import MBodypartOptionConfigurator from '../../molecules/m-bodypart-option-configurator.vue';
import AOrderedHeading from '../../atoms/a-ordered-heading.vue';
import MFormErrors from '../../molecules/m-form-errors.vue';

extend('required', {
  ...required,
  message: '{_field_} field is required'
})

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

  return { ...refs, ...baseForm.$refs }
}

export default defineComponent({
  name: 'OBulkQuoteOrderForm',
  setup (_, setupContext) {
    const validationObserver: Ref<InstanceType<typeof ValidationObserver> | null> = ref(null);

    return {
      validationObserver,
      ...useBulkOrdersBaseForm(),
      ...useFormValidation(
        validationObserver,
        () => getFormAllRefs(setupContext.refs)
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
      color: undefined as BodypartOption[] | undefined,
      showCalculationAnimation: false,
      onCalculationAnimationFinished: () => {}
    }
  },
  computed: {
    bulkOrderInfo (): BulkOrderInfo | undefined {
      return this.$store.getters['budsies/getBulkorderInfo'];
    },
    bodyparts (): Bodypart[] {
      return this.$store.getters['budsies/getProductBodyparts'](this.product.id);
    },
    colorPaletteBodypart (): Bodypart | undefined {
      return this.bodyparts.find((bodypart) => {
        return bodypart.name.toLowerCase() === 'color palette';
      })
    },
    colorPaletteOptions (): BodypartOption[] {
      if (!this.colorPaletteBodypart) {
        return [];
      }

      const bodypartsValues: BodypartValue[] =
       this.$store.getters['budsies/getBodypartBodypartsValues'](this.colorPaletteBodypart.id);

      if (!bodypartsValues.length) {
        return [];
      }

      const result: BodypartOption[] = [];

      for (const bodypartValue of bodypartsValues) {
        result.push({
          id: bodypartValue.id,
          label: bodypartValue.name,
          value: bodypartValue.code,
          isSelected: false,
          contentTypeId: bodypartValue.contentTypeId,
          color: bodypartValue.color,
          image: bodypartValue.image,
          group: 'default'
        });
      }

      return result;
    },
    isDisabled (): boolean {
      return this.isSubmitting;
    },
    budsiesStoreDomain (): string {
      return `https://${config.budsies.budsiesStoreDomain}`;
    }
  },
  methods: {
    getBodypartsData (): Dictionary<string[]> {
      if (!this.color || !this.colorPaletteBodypart) {
        return {};
      }

      return { [this.colorPaletteBodypart.id]: this.color.map(item => item.id) };
    },
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
            uploaded_artwork_ids: this.bulkordersBaseFormData.customerImages.map((image) => image.id),
            email: this.bulkordersBaseFormData.customerEmail,
            phone: this.bulkordersBaseFormData.customerPhone,
            country_id: this.bulkordersBaseFormData.country,
            first_name: this.bulkordersBaseFormData.customerFirstName,
            last_name: this.bulkordersBaseFormData.customerLastName,
            alternative_qty: this.bulkordersBaseFormData.additionalQuantity || '',
            deadline_date: this.bulkordersBaseFormData.deadlineDate,
            client_type_id: this.bulkordersBaseFormData.customerType || '',
            body_parts: this.getBodypartsData(),
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
    },
    persistCustomerData (): void {
      const baseForm = getBaseForm(this.$refs);

      baseForm.persistCustomerData();
    }
  }
})
</script>

<style lang="scss" scoped>
.o-bulk-quote-order-form {
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
