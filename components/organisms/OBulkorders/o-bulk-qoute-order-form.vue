<template>
  <div class="o-bulk-quote-order-form">
    <SfHeading :level="1" :title="$t('Bulk Order Quote')" class="_title" />

    <m-base-form
      ref="baseForm"
      :product="product"
      :is-disabled="isDisabled"
      :artwork-upload-url="artworkUploadUrl"
      v-model="bulkordersBaseFormData"
    >
      <template #bodyparts>
        <AOrderedHeading
          :order="4"
          :level="3"
          :title="$t('Color Pallette')"
          class="_title -required"
        />

        <span class="_subtitle">
          {{ $t('Please select the colors of your design to help us accurately bring your character to life.') }}
        </span>

        <m-bodypart-option-configurator
          v-model="color"
          :name="colorPaletteBodypart.code"
          :max-values="colorPaletteBodypart.maxValues"
          :options="colorPaletteOptions"
          :disabled="isDisabled"
          type="bodypart"
        />

        <div class="_error-text">
          <!-- {{  }} -->
        </div>

        <span class="_input-hint">
          {{ $t('Click an existing color to deselect it.') }}
        </span>

        <br>

        <span class="_input-hint">
          {{ $t('Please note any special requests in the description above') }}
        </span>
      </template>

      <template #size>
        <div class="_size-section">
          <AOrderedHeading
            :order="7"
            :level="3"
            :title="$t('What’s your preferred size?')"
            class="_title -required"
          />

          <div class="_hint">
            {{ $t('Typical sizes are 6" (small), 8" (regular), 12" (large), and 16" (maximum). It\'s OK if you’re not sure.') }}
          </div>

          <SfInput
            :label="$t('Size')"
            v-model="bulkSize"
          />
        </div>
      </template>
    </m-base-form>

    <div class="_button-container">
      <SfButton @click="onSubmit">
        {{ $t('Get My Quote') }}
      </SfButton>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { SfButton, SfHeading, SfInput, SfSelect } from '@storefront-ui/vue';

import Product from 'core/modules/catalog/types/Product';
import { product } from 'core/modules/url/test/unit/helpers/data';
import BulkordersBaseFormData from 'theme/components/interfaces/bulkorders-base-form-data.interface';
import { Bodypart, BodypartOption, BodypartValue, BulkorderQuoteProductId } from 'src/modules/budsies';

import MBaseForm from './m-base-form.vue';
import AOrderedHeading from '../../atoms/a-ordered-heading.vue';

export default Vue.extend({
  name: 'OBulkQuoteOrderForm',
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
      bulkSize: undefined as string | undefined,
      color: undefined as BodypartOption[] | undefined
    }
  },
  computed: {
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
    }
  },
  methods: {
    getBaseFormComponent (): InstanceType<typeof MBaseForm> | undefined {
      return this.$refs.baseForm as InstanceType<typeof MBaseForm> | undefined;
    },
    getBodypartsData (): Record<string, string[]> {
      let data: Record<string, string[]> = {};

      if (!this.colorPaletteBodypart || !this.color) {
        return data;
      }

      data[this.colorPaletteBodypart.id] = this.color.map(item => item.id);

      return data;
    },
    async onSubmit (): Promise<void> {
      const form = this.getBaseFormComponent();

      if (this.isDisabled || !form || !form.getValidationState()) {
        return;
      }

      this.isSubmitting = true;

      try {
        await this.$store.dispatch(
          'budsies/createBulkorder',
          {
            product_id: BulkorderQuoteProductId.PLUSHIE,
            size: this.bulkSize,
            qty: this.bulkordersBaseFormData.quantity,
            project_name: this.bulkordersBaseFormData.name,
            description: this.bulkordersBaseFormData.description,
            uploaded_artworks_ids: this.bulkordersBaseFormData.customerImages.map((image) => image.id),
            email: this.bulkordersBaseFormData.customerEmail,
            phone: this.bulkordersBaseFormData.customerPhone,
            country_id: this.bulkordersBaseFormData.country,
            first_name: this.bulkordersBaseFormData.customerFirstName,
            last_name: this.bulkordersBaseFormData.customerLastName,
            alternative_qty: this.bulkordersBaseFormData.additionalQuantity,
            deadline_date: this.bulkordersBaseFormData.deadlineDate,
            client_type_id: this.bulkordersBaseFormData.customerType,
            body_parts: this.getBodypartsData()
          }
        );
      } finally {
        this.isSubmitting = false;
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

      .m-base-form {
        margin-bottom: var(--spacer-lg);
      }

      ._button-container {
        display: flex;
        justify-content: center;
      }

    ._subtitle {
      margin-bottom: var(--spacer-sm);
    }

    ._input-hint {
        margin-top: var(--spacer-sm);
        font-weight: 600;
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
