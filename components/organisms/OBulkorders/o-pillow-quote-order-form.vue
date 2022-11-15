<template>
  <div class="o-pillow-quote-order-form">
    <SfHeading :level="1" :title="$t('Pillow Bulk Order Quote')" class="_title" />

    <m-base-form
      ref="baseForm"
      :product="product"
      :is-disabled="isDisabled"
      :artwork-upload-url="artworkUploadUrl"
      :has-size="true"
      v-model="bulkordersBaseFormData"
    >
      <template #size>
        <div class="_section">
          <AOrderedHeading
            :order="6"
            :level="3"
            :title="$t('What\'s your preferred size?')"
            class="_title -required"
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
import { TranslateResult } from 'vue-i18n';
import { SfButton, SfSelect } from '@storefront-ui/vue';

import Product from 'core/modules/catalog/types/Product';
import { BundleOption, BundleOptionsProductLink } from 'core/modules/catalog/types/BundleOption';
import { product } from 'core/modules/url/test/unit/helpers/data';
import BulkordersBaseFormData from 'theme/components/interfaces/bulkorders-base-form-data.interface';
import { BulkorderQuoteProductId } from 'src/modules/budsies';

import MBaseForm from './m-base-form.vue';
import AOrderedHeading from '../../atoms/a-ordered-heading.vue';

interface PillowSizeOption {
  id: number | string,
  value: number | string,
  title: string
}

export default Vue.extend({
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
    SfButton,
    AOrderedHeading,
    SfSelect
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
      pillowSize: undefined
    }
  },
  computed: {
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
          value: productLink.id,
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
  methods: {
    getBaseFormComponent (): InstanceType<typeof MBaseForm> | undefined {
      return this.$refs.baseForm as InstanceType<typeof MBaseForm> | undefined;
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
    async onSubmit (): Promise<void> {
      const form = this.getBaseFormComponent();

      if (this.isDisabled || !form || !form.getValidationState()) {
        return;
      }

      this.isSubmitting = true;
      // (int)$request->product_id,
      //           (int)$request->qty,
      //           (int)$request->size,
      //           $request->project_name,
      //           $request->description,
      //           $request->uploaded_artwork_ids,
      //           $request->email,
      //           $request->phone,
      //           (int)$request->country_id,
      //           $request->first_name,
      //           $lastName,
      //           $request->body_parts ?? [],
      //           (int)$request->alternative_qty ?? null,
      //           $request->deadline_date ?? null,
      //           $clientTypeId

      try {
        await this.$store.dispatch(
          'budsies/createBulkorder',
          {
            product_id: BulkorderQuoteProductId.PILLOW,
            size: this.pillowSize,
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
            client_type_id: this.bulkordersBaseFormData.customerType
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

    ._section {
        margin-bottom: var(--spacer-2xl);
        display: flex;
        flex-direction: column;

        ._title {
            margin-bottom: var(--spacer-base);
        }
    }
  }
  </style>
