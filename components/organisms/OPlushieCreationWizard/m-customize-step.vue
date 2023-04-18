<template>
  <validation-observer
    v-slot="{ passes, errors: formErrors }"
    class="plushie-wizard-customization-step"
    tag="div"
    ref="validation-observer"
  >
    <SfHeading
      :level="2"
      :title="$t('Customize your Petsies plush')"
    />

    <div class="_content">
      <validation-provider
        v-slot="{ errors }"
        class="_size _section"
        rules="required"
        tag="div"
        :name="$t('\'Size\'')"
      >
        <SfHeading
          class="-required"
          :level="3"
          :title="$t('Size')"
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
            class="-required"
            :level="3"
            :title="bodyPart.name"
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
            :title="childBodyPart.name"
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
        :name="$t('Description')"
        slim
      >
        <div class="_description-field _section" :class="classes">
          <SfHeading
            class="-required "
            :level="3"
            :title="$t('Describe Your Pet\'s Physical Features')"
            ref="description-field-anchor"
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
            name="Production time"
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
                :title="$t('How many Petsies of this exact same design?')"
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
              :title="$t('Upgrade Your Petsies (optional)')"
            />

            <MAddonsSelector
              v-model="selectedAddons"
              :addons="addons"
              :disabled="disabled"
            />
          </div>
        </div>
      </div>

      <div class="_form-errors">
        <template
          v-for="(fieldErrors, field) in formErrors"
        >
          <div
            class="_error-text"
            :key="field"
            v-if="fieldErrors.length > 0"
          >
            <a
              class="_error-link"
              href="javascript:void(0)"
              @click.prevent="goToFieldByName(field.toString())"
            >
              {{ fieldErrors.join('. ') }}
            </a>
          </div>
        </template>
      </div>

      <div class="_actions _section">
        <SfButton
          class="_add-to-cart color-primary"
          type="submit"
          :disabled="disabled"
          @click="(event) => passes(() => submitStep())"
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
import Vue, { PropType } from 'vue';
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';

import { SfHeading, SfButton, SfModal } from '@storefront-ui/vue';
import Product from 'core/modules/catalog/types/Product';
import { BundleOption } from 'core/modules/catalog/types/BundleOption';
import { Logger } from '@vue-storefront/core/lib/logger';

import { isVue } from 'src/modules/shared';
import { BodypartOption } from 'src/modules/budsies';

import MAddonsSelector from '../../molecules/m-addons-selector.vue';
import ACustomProductQuantity from '../../atoms/a-custom-product-quantity.vue';
import MBlockStory from '../../molecules/m-block-story.vue';
import MBodyPartsSection from '../../molecules/m-body-parts-section.vue';
import MProductionTimeSelector from '../../molecules/m-production-time-selector.vue';
import MPlushieSizeSelector from '../../molecules/m-plushie-size-selector.vue';

import AddonOption from '../../interfaces/addon-option.interface';
import ProductionTimeOption from '../../interfaces/production-time-option.interface';
import ForeversWizardCustomizeStepData from '../../interfaces/plushie-wizard-customize-step-data.interface';
import getProductionTimeOptions from '../../../helpers/get-production-time-options';
import SizeOption from 'theme/components/interfaces/size-option';
import SelectedAddon from 'theme/components/interfaces/selected-addon.interface';
import { getAddonOptionsFromBundleOption } from 'theme/helpers/get-addon-options-from-bundle-option.function';

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

export default Vue.extend({
  name: 'MCustomizeStep',
  components: {
    SfHeading,
    SfButton,
    SfModal,
    ValidationProvider,
    ValidationObserver,
    MAddonsSelector,
    ACustomProductQuantity,
    MBlockStory,
    MBodyPartsSection,
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
    addons (): AddonOption[] {
      if (!this.addonsBundleOption) {
        return []
      }

      return getAddonOptionsFromBundleOption(this.addonsBundleOption);
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
    getFieldAnchorName (field: string): string {
      field = field.toLowerCase().replace(/ /g, '-');

      return `${field}-field-anchor`
    },
    goToFieldByName (field: string): void {
      // Strip quotes
      let refName = field.replace(/^['"]+|['"]+$/g, '');
      // Strip spaces & convert to lower case
      refName = refName.toLowerCase().replace(/ /g, '-');

      refName += '-field-anchor';

      let ref = this.$refs[refName] as (HTMLElement | Vue) | (HTMLElement|Vue)[] | undefined;
      if (!ref) {
        Logger.warn(`Reference for the field with error not found. Field: ${field}, ref: ${refName}`, 'budsies')();
        return;
      }

      if (Array.isArray(ref)) {
        ref = ref[0];
      }

      if (isVue(ref)) {
        ref = ref.$el as HTMLElement;
      }

      ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    async submitStep (): Promise<void> {
      await this.addToCart();
    },
    updateProductionTime (productionTimeOption: ProductionTimeOption) {
      this.productionTime = productionTimeOption.optionValueId
    }
  },
  mounted () {
    if (!this.productionTimeOptions.length || this.productionTime) {
      return;
    }

    this.productionTime = this.productionTimeOptions[0].optionValueId
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
    min-height: calc(var(--font-xs) * 1.2 * 4);

    ._error-link {
      color: inherit;
    }
  }

  ._actions {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  ._order-agreement {
    max-width: 50em;
    font-size: var(--font-xs);
  }
}
</style>
