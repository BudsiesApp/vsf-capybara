<template>
  <div class="m-base-form">
    <div class="_section">
      <AOrderedHeading
        :order="1"
        :level="3"
        :title="$t('Please upload your awesome design')"
        class="_title -required"
      />

      <MArtworkUpload
        :allow-multiple="true"
        :disabled="isDisabled"
        :product-id="backendProductId"
        :upload-url="artworkUploadUrl"
        :initial-items="artworkUploadInitialItems"
        :max-files="3"
        @file-added="onArtworkAdd"
        @file-removed="onArtworkRemove"
      />
    </div>

    <div class="_section">
      <AOrderedHeading
        :order="2"
        :level="3"
        :title="$t('Project Name')"
        class="_title -required"
      />

      <SfInput :label="$t('Project Name')" v-model="name" :disabled="isDisabled" />

      <span class="_hint">
        {{ $t('This could be the name of your character or name of your project(e.g., \'Danny the Dolphin\')') }}
      </span>
    </div>

    <div class="_section">
      <AOrderedHeading
        :order="3"
        :level="3"
        :title="$t('Describe your design')"
        class="_title -required"
      />

      <textarea
        name="description"
        rows="5"
        v-model="description"
        :placeholder="$t('Give us any additional direction as we create your plush prototype')"
        :disabled="isDisabled"
      />
    </div>

    <div class="_section">
      <AOrderedHeading
        :order="4"
        :level="3"
        :title="$t('What quantity are you interested in?')"
        class="_title -required"
      />

      <span class="_quantity-helper">
        {{ $t('Best price breaks occur at volumes of 100, 500, and 1,000.') }}
      </span>

      <SfInput :label="$t('Quantity')" :disabled="isDisabled" v-model="quantity" />

      <div class="_additional-quantity" v-show="showAdditionalQuantity">
        <span class="_quantity-helper">
          {{ $t('Don\'t worry, we will quote you the quantity you enter and the quantity with the next price break. However, you can also enter another quantity below and we\'ll quote you both!') }}
        </span>

        <SfInput :label="$t('Also quote this quantity:')" :disabled="isDisabled" v-model="additionalQuantity" />
      </div>

      <SfButton class="sf-button--text">
        {{ quantityButtonText }}
      </SfButton>
    </div>

    <div class="_section">
      <AOrderedHeading
        :order="5"
        :level="3"
        :title="$t('Do you have a deadline for delivery?')"
        class="_title -required"
      />

      <SfRadio
        :value="0"
        :label="$t('No firm deadline - the sooner the better!')"
        v-model="deadline"
      />

      <SfRadio
        :value="1"
        :label="$t('I need them for a specific date')"
        v-model="deadline"
      />

      date selector
    </div>

    <div class="_section">
      <AOrderedHeading
        :order="6"
        :level="3"
        :title="$t('Do you have a deadline for delivery?')"
        class="_title -required"
      />

      <div class="_helper">
        {{ $t('This helps us estimate freight costs.') }}
      </div>

      <SfSelect
        v-model="country"
        :should-lock-scroll-on-open="isMobile"
        class="sf-select--underlined"
      >
        <SfSelectOption
          v-for="item in countries"
          :key="item.code"
          :value="item.code"
        >
          {{ item.name }}
        </SfSelectOption>
      </SfSelect>
    </div>

    <div class="_section">
      <AOrderedHeading
        :order="7"
        :level="3"
        :title="$t('Customer Information')"
        class="_title -required"
      />

      <SfInput :label="$t('First Name')" />

      <SfInput :label="$t('Last Name')" />

      <SfInput :label="$t('Your e-mail address')" />

      <SfInput :label="$t('Phone number')" />
    </div>

    <div class="_section">
      <AOrderedHeading
        :order="8"
        :level="3"
        :title="$t('Last question')"
        class="_title"
      />

      <div class="_helper">
        {{ $t('Which of the following best describes you?') }}
      </div>

      <SfSelect
        v-model="country"
        :should-lock-scroll-on-open="isMobile"
        class="sf-select--underlined"
      >
        <SfSelectOption
          v-for="item in countries"
          :key="item.code"
          :value="item.code"
        >
          {{ item.name }}
        </SfSelectOption>
      </SfSelect>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { SfInput, SfRadio, SfSelect } from '@storefront-ui/vue';
import {
  mapMobileObserver,
  unMapMobileObserver
} from '@storefront-ui/vue/src/utilities/mobile-observer';

import BulkordersBaseFormData from 'theme/components/interfaces/bulkorders-base-form-data.interface';

import AOrderedHeading from 'theme/components/atoms/a-ordered-heading.vue';
import MArtworkUpload from 'theme/components/molecules/m-artwork-upload.vue';
import MCheckbox from 'theme/components/molecules/m-checkbox.vue';
import { CustomerImage } from 'src/modules/shared';
import { TranslateResult } from 'vue-i18n';
import Product from 'core/modules/catalog/types/Product';

const Countries = require('@vue-storefront/i18n/resource/countries.json')

export default Vue.extend({
  name: 'MBaseForm',
  components: {
    AOrderedHeading,
    MCheckbox,
    SfInput,
    SfRadio,
    SfSelect
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
    isDisabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object as PropType<BulkordersBaseFormData>,
      required: true
    }
  },
  data () {
    return {
      countries: Countries,
      showAdditionalQuantity: false
    }
  },
  computed: {
    ...mapMobileObserver(),
    artworkUploadInitialItems (): CustomerImage[] {
      return []; // todo
    },
    backendProductId (): string | undefined {
      if (!this.product) {
        return undefined;
      }

      switch (this.product.id) {
        // case ProductId.BULK_PLUSH_SAMPLE:
        //   return ProductValue.BULK_SAMPLE;
        // case ProductId.BULK_PILLOW_SAMPLE:
        //   return ProductValue.PILLOW_BULK_SAMPLE;
        // case ProductId.BULK_KEYCHAIN_SAMPLE:
        //   return ProductValue.KEYCHAIN_BULK_SAMPLE;
        default:
          throw new Error(
            `Can't resolve Backend product ID for Magento '${this.product.id}' product ID`
          );
      }
    },
    name: {
      get (): string {
        return this.value.name;
      },
      set (value: string) {
        this.updateValue({ name: value });
      }
    },
    description: {
      get (): string {
        return this.value.description;
      },
      set (value: string) {
        this.updateValue({ description: value });
      }
    },
    quantity: {
      get (): number {
        return this.value.quantity;
      },
      set (value: number) {
        this.updateValue({ quantity: value });
      }
    },
    additionalQuantity: {
      get (): number {
        return this.value.additionalQuantity;
      },
      set (value: number) {
        this.updateValue({ additionalQuantity: value });
      }
    },
    deadline: {
      get (): Date | undefined {
        return this.value.deadline;
      },
      set (value: Date | undefined) {
        this.updateValue({ deadline: value });
      }
    },
    country: {
      get (): string {
        return this.value.country;
      },
      set (value: string) {
        this.updateValue({ country: value });
      }
    },
    customerFirstName: {
      get (): string {
        return this.value.customerFirstName;
      },
      set (value: string) {
        this.updateValue({ customerFirstName: value });
      }
    },
    customerLastName: {
      get (): string | undefined {
        return this.value.customerLastName;
      },
      set (value: string | undefined) {
        this.updateValue({ customerLastName: value });
      }
    },
    customerEmail: {
      get (): string {
        return this.value.customerEmail;
      },
      set (value: string) {
        this.updateValue({ customerEmail: value });
      }
    },
    customerPhone: {
      get (): string {
        return this.value.customerPhone;
      },
      set (value: string) {
        this.updateValue({ customerPhone: value });
      }
    },
    quantityButtonText (): TranslateResult {
      return this.showAdditionalQuantity
        ? this.$t('Remove')
        : this.$t('Not Sure?');
    }
  },
  methods: {
    onArtworkAdd (): void {
      // todo
    },
    onArtworkRemove (): void {
      // todo
    },
    updateValue (value: Record<string, any>): void {
      this.$emit('input', { ...this.value, ...value })
    }
  },
  beforeDestroy () {
    unMapMobileObserver();
  }
})
</script>

<style lang="scss">
.m-base-form {

}
</style>
