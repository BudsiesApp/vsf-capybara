<template>
  <div class="o-keychain-quote-order-form">
    <SfHeading :level="1" :title="$t('Keychain Bulk Order Quote')" class="_title" />

    <m-base-form
      ref="baseForm"
      :product="product"
      :is-disabled="isDisabled"
      :artwork-upload-url="artworkUploadUrl"
      v-model="bulkordersBaseFormData"
    />

    <div class="_button-container">
      <SfButton @click="onSubmit">
        {{ $t('Get My Quote') }}
      </SfButton>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { SfButton, SfHeading } from '@storefront-ui/vue';

import Product from 'core/modules/catalog/types/Product';
import BulkordersBaseFormData from 'theme/components/interfaces/bulkorders-base-form-data.interface';
import { BulkorderQuoteProductId } from 'src/modules/budsies';

import MBaseForm from './m-base-form.vue';

export default Vue.extend({
  name: 'OKeychainQuoteOrderForm',
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
      isSubmitting: false
    }
  },
  computed: {
    isDisabled (): boolean {
      return this.isSubmitting;
    }
  },
  methods: {
    getBaseFormComponent (): InstanceType<typeof MBaseForm> | undefined {
      return this.$refs.baseForm as InstanceType<typeof MBaseForm> | undefined;
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
            product_id: BulkorderQuoteProductId.KEYCHAIN,
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
.o-keychain-quote-order-form {
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
}
</style>
