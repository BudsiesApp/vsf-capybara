<template>
  <validation-observer
    v-slot="{ errors: formErrors }"
    class="plushie-wizard-customization-step"
    tag="div"
    ref="validationObserver"
  >
    <SfHeading
      :level="2"
      :title="$t('Customize your {productType}', {productType})"
    />

    <div class="_content">
      <validation-provider
        v-slot="{ errors }"
        class="_size _section"
        rules="required"
        tag="div"
        :name="$t('\'Size\'')"
        v-if="showSizeSelector"
      >
        <SfHeading
          class="-required"
          :level="3"
          :title="$t('Size')"
          :ref="getFieldAnchorName('size')"
        />

        <m-plushie-size-selector
          name="pillow_size"
          class="_options-list"
          v-model="size"
          :show-full-price="false"
          :show-most-popular-icon="true"
          :options="sizes"
          :disabled="disabled"
        />

        <div class="_error-text">
          {{ errors[0] }}
        </div>
      </validation-provider>

      <m-body-parts-section
        v-if="product"
        :disabled="disabled"
        :product-id="product.id"
        v-model="bodypartsValues"
      >
        <template #main-body-part-heading="{ bodyPart }">
          <SfHeading
            :level="3"
            :title="getBodyPartTitle(bodyPart)"
            :ref="getFieldAnchorName(bodyPart.name)"
          />
        </template>

        <template #top-helper-text="{ bodyPart }">
          <div
            class="_helper-text"
            v-if="bodyPart.code === 'forevers_color_palette'"
          >
            {{ $t('You may select up to 3 most prominent color(s) of your animal to assist our team.') }}
          </div>
        </template>

        <template #child-body-part-heading="{ childBodyPart }">
          <SfHeading
            :level="3"
            :title="getBodyPartTitle(childBodyPart)"
            :ref="getFieldAnchorName(childBodyPart.name)"
          />
        </template>

        <template #bottom-helper-text="{ bodyPart }">
          <div
            class="_helper-text"
            v-if="bodyPart.code === 'forevers_color_palette'"
          >
            {{ $t('Click a selected color to deselect it') }}. <br>

            {{ $t('Your color input is especially helpful when photos are blurry or poorly lit. If left blank, our designers will use their professional judgement.') }}
          </div>
        </template>
      </m-body-parts-section>

      <validation-provider
        v-slot="{ errors, classes }"
        rules="required"
        :name="`'${$t('Description')}'`"
        slim
      >
        <div class="_description-field _section" :class="classes">
          <SfHeading
            class="-required "
            :level="3"
            :title="$t('Describe Your Pet\'s Physical Features')"
            :ref="getFieldAnchorName('description')"
          />

          <textarea
            name="description"
            rows="4"
            v-model="description"
            :placeholder="$t('Tell us about your pet\'s coloration and defining feature(s).')"
            :disabled="disabled"
            :required="true"
            :valid="!errors.length"
            :error-message="errors[0]"
          />

          <div class="_error-text">
            {{ errors[0] }}
          </div>
        </div>
      </validation-provider>

      <div class="_section">
        <SfHeading
          :level="2"
          :title="$t('Final Options')"
        />

        <div class="_final-options-content">
          <validation-provider
            v-slot="{ errors }"
            name="'Production time'"
            :ref="getFieldAnchorName('Production time')"
            rules="required"
            class="_section"
            tag="div"
            v-if="showProductionTimeOptions"
          >
            <MProductionTimeSelector
              :value="productionTimeOption"
              :production-time-options="productionTimeOptions"
              :product-id="product.id"
              :disabled="disabled"
              @input="updateProductionTime"
              :invalid="!!errors.length"
            />

            <div class="_error-text">
              {{ errors[0] }}
            </div>
          </validation-provider>

          <validation-provider
            v-slot="{ errors, classes }"
            rules="required"
            :name="$t('Quantity')"
            slim
          >
            <div class="_section" :class="classes">
              <SfHeading
                class="-required"
                :level="3"
                :title="$t(
                  'How many {productType} of this exact same design?',
                  {productType}
                )"
                :ref="getFieldAnchorName('quantity')"
              />

              <ACustomProductQuantity
                v-model="quantity"
                :disabled="disabled"
                class="_qty-container"
                ref="quantity-field-anchor"
              />

              <div class="_error-text">
                {{ errors[0] }}
              </div>

              <a
                class="_popup-link"
                href="javascript:void(0)"
                @click="areQuantityNotesVisible = true"
              >{{ $t('Quantity & Shipping Discounts') }}</a>
            </div>
          </validation-provider>

          <div class="_addons _section">
            <SfHeading
              :level="3"
              :title="$t(
                'Upgrade Your {productType} (optional)',
                {productType}
              )"
            />

            <MAddonsSelector
              v-model="selectedAddons"
              ref="addons-selector"
              :addons="addons"
              :disabled="disabled"
              :get-field-anchor-name="getFieldAnchorName"
            />
          </div>
        </div>
      </div>

      <m-form-errors
        class="_form-errors"
        :form-errors="formErrors"
        @item-click="goToFieldByName"
      />

      <div class="_actions _section">
        <SfButton
          class="_add-to-cart color-primary"
          type="submit"
          :disabled="disabled"
          @click="onAddToCartClick"
        >
          {{ $t('Add to Cart') }}
        </SfButton>

        <MBlockStory
          story-slug="order_submit_agreement_petsies"
        />
      </div>
    </div>

    <SfModal
      :visible="areQuantityNotesVisible"
      @close="areQuantityNotesVisible = false"
    >
      <div class="_popup-content">
        <MBlockStory
          story-slug="petsies_shipping_qty_discount_popup_content"
        />
      </div>
    </SfModal>
  </validation-observer>
</template>

<script lang="ts">
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import { PropType, Ref, defineComponent, ref } from '@vue/composition-api';

import { SfHeading, SfButton, SfModal } from '@storefront-ui/vue';
import Product from 'core/modules/catalog/types/Product';
import { BundleOption } from 'core/modules/catalog/types/BundleOption';

import { Bodypart, BodypartOption } from 'src/modules/budsies';

import MAddonsSelector from '../../molecules/m-addons-selector.vue';
import ACustomProductQuantity from '../../atoms/a-custom-product-quantity.vue';
import MBlockStory from '../../molecules/m-block-story.vue';
import MBodyPartsSection from '../../molecules/m-body-parts-section.vue';
import MFormErrors from '../../molecules/m-form-errors.vue';
import MProductionTimeSelector from '../../molecules/m-production-time-selector.vue';
import MPlushieSizeSelector from '../../molecules/m-plushie-size-selector.vue';

import AddonOption from '../../interfaces/addon-option.interface';
import ProductionTimeOption from '../../interfaces/production-time-option.interface';
import ForeversWizardCustomizeStepData from '../../interfaces/plushie-wizard-customize-step-data.interface';
import getProductionTimeOptions from '../../../helpers/get-production-time-options';
import SizeOption from 'theme/components/interfaces/size-option';
import SelectedAddon from 'theme/components/interfaces/selected-addon.interface';
import { getAddonOptionsFromBundleOption } from 'theme/helpers/get-addon-options-from-bundle-option.function';
import { useFormValidation } from 'theme/helpers/use-form-validation';
import { filterAddonBasedOnSizeOption } from 'theme/helpers/filter-addons-based-on-size-option.function';

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

function getAllFormRefs (
  refs: Record<string, Vue | Element | Vue[] | Element[]>
): Record<string, Vue | Element | Vue[] | Element[]> {
  const addonsSelector = refs['addons-selector'] as InstanceType<typeof MAddonsSelector> | undefined;

  let refsDictionary: Record<string, Vue | Element | Vue[] | Element[]> = { ...refs };

  if (addonsSelector) {
    refsDictionary = { ...refsDictionary, ...addonsSelector.$refs };
  }

  return refsDictionary;
}

export default defineComponent({
  name: 'MCustomizeStep',
  setup (_, setupContext) {
    const validationObserver: Ref<InstanceType<typeof ValidationObserver> | null> = ref(null);

    return {
      validationObserver,
      ...useFormValidation(
        validationObserver,
        () => getAllFormRefs(setupContext.refs)
      )
    }
  },
  components: {
    ACustomProductQuantity,
    SfHeading,
    SfButton,
    SfModal,
    ValidationProvider,
    ValidationObserver,
    MAddonsSelector,
    MBlockStory,
    MBodyPartsSection,
    MFormErrors,
    MProductionTimeSelector,
    MPlushieSizeSelector
  },
  props: {
    value: {
      type: Object as PropType<ForeversWizardCustomizeStepData>,
      default: () => ({
        bodypartsValues: {},
        addons: [],
        description: undefined,
        productionTime: undefined,
        quantity: 1,
        size: undefined
      })
    },
    product: {
      type: Object as PropType<Product>,
      required: true
    },
    plushieId: {
      type: Number,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    addonsBundleOption: {
      type: Object as PropType<BundleOption | undefined>,
      default: undefined
    },
    productionTimeBundleOption: {
      type: Object as PropType<BundleOption | undefined>,
      default: undefined
    },
    sizeBundleOption: {
      type: Object as PropType<BundleOption | undefined>,
      default: undefined
    },
    addToCart: {
      type: Function as PropType<() => Promise<void>>,
      required: true
    },
    sizes: {
      type: Array as PropType<SizeOption[]>,
      default: () => []
    },
    showSizeSelector: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      areQuantityNotesVisible: false
    }
  },
  computed: {
    size: {
      get (): SizeOption | undefined {
        return this.value.size;
      },
      set (value: SizeOption) {
        const newValue = { ...this.value, size: value };
        this.$emit('input', newValue);
      }
    },
    selectedAddons: {
      get (): SelectedAddon[] {
        return this.value.addons;
      },
      set (value: SelectedAddon[]): void {
        const newValue = { ...this.value, addons: value };
        this.$emit('input', newValue);
      }
    },
    bodypartsValues: {
      get (): Record<string, BodypartOption | BodypartOption[] | undefined> {
        return this.value.bodypartsValues;
      },
      set (value: Record<string, BodypartOption | BodypartOption[] | undefined>): void {
        const newValue: ForeversWizardCustomizeStepData = { ...this.value, bodypartsValues: value };
        this.$emit('input', newValue);
      }
    },
    description: {
      get (): string | undefined {
        return this.value.description;
      },
      set (value: string): void {
        const newValue: ForeversWizardCustomizeStepData = { ...this.value, description: value };
        this.$emit('input', newValue);
      }
    },
    quantity: {
      get (): number {
        return this.value.quantity;
      },
      set (value: number): void {
        const newValue: ForeversWizardCustomizeStepData = { ...this.value, quantity: value };
        this.$emit('input', newValue);
      }
    },
    productionTime: {
      get (): number | undefined {
        return this.value.productionTime;
      },
      set (value: number | undefined): void {
        const newValue: ForeversWizardCustomizeStepData = { ...this.value, productionTime: value };
        this.$emit('input', newValue);
      }
    },
    productionTimeOption (): ProductionTimeOption | undefined {
      return this.productionTimeOptions.find(option => option.optionValueId === this.productionTime)
    },
    productType (): string {
      const defaultProductType = 'Plush';

      if (!this.product.category) {
        return defaultProductType;
      }

      const firstCategory = this.product.category[0];

      if (!firstCategory) {
        return defaultProductType;
      }

      return firstCategory.name;
    },
    addons (): AddonOption[] {
      if (!this.addonsBundleOption) {
        return []
      }

      return getAddonOptionsFromBundleOption(this.addonsBundleOption)
        .filter((addonOption) => {
          return filterAddonBasedOnSizeOption(
            addonOption,
            this.size
          )
        });
    },
    productionTimeOptions (): ProductionTimeOption[] {
      if (!this.productionTimeBundleOption) {
        return []
      }

      return getProductionTimeOptions(this.productionTimeBundleOption, this.product, this.$store);
    },
    showProductionTimeOptions (): boolean {
      return this.productionTimeOptions.length > 0;
    }
  },
  methods: {
    getBodyPartTitle (bodyPart: Bodypart): string {
      let prefix = !bodyPart.isRequired
        ? `${this.$t('Optional')}:`
        : '';

      return `${prefix} ${bodyPart.name}`;
    },
    async onAddToCartClick (): Promise<void> {
      const isValid = await this.validateAndGoToFirstError();

      if (!isValid) {
        return;
      }

      await this.submitStep();
    },
    async submitStep (): Promise<void> {
      await this.addToCart();
    },
    updateProductionTime (productionTimeOption: ProductionTimeOption) {
      this.productionTime = productionTimeOption.optionValueId
    }
  }
});

</script>

<style lang="scss" scoped>
.plushie-wizard-customization-step {
  ._section {
    margin-top: var(--spacer-base);

    &:first-child {
      margin-top: 0;
    }
  }

  ._content,
  ._final-options-content {
    margin-top: var(--spacer-xl);
  }

  ._description-field,
  ._addons {
    margin-top: calc(2 * var(--spacer-base));
  }

  textarea,
  .a-custom-product-quantity,
  .m-addons-selector {
    margin-top: var(--spacer-sm);
  }

  ._helper-text {
    font-size: var(--font-xs);
  }

  ._size,
  .m-body-parts-section {
    ._helper-text,
    ._options-list {
      margin-top: var(--spacer-sm);
    }
  }

  textarea {
    box-sizing: border-box;
    border: 1px solid var(--c-light);
    width: 100%;
    padding: 0.5em;
    font-family: var(--font-family-primary);
    resize: vertical;
  }

  ._error-text {
    color: var(--c-danger-variant);
    font-size: var(--font-xs);
    margin-top: var(--spacer-xs);
    height: calc(var(--font-xs) * 1.2);
  }

  ._form-errors {
    margin-top: var(--spacer-xl);
  }

  ._actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: var(--spacer-xl);
  }

  ._order-agreement {
    max-width: 50em;
    font-size: var(--font-xs);
  }
}
</style>
