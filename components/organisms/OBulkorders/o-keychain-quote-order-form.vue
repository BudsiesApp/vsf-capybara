<template>
  <div class="o-keychain-quote-order-form">
    <SfHeading :level="1" :title="$t('Keychain Bulk Order Quote')" class="_title" />

    <m-base-form
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
    onSubmit (): void {
      //
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
