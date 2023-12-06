<template>
  <div class="o-creativity-kit-product-order-form">
    <SfHeading :level="3" :title="$t('Select Your Box')" />

    <form @submit.prevent="onSubmit" class="_form">
      <div class="_options">
        <m-creativity-kit-form-option
          v-for="option in options"
          :key="option.optionValueId"
          :option="option"
          :disabled="isSubmitting"
          class="_option"
          name="kitOption"
          v-model="selectedOption"
        />
      </div>

      <div class="_action-row">
        <ACustomProductQuantity
          v-model="quantity"
          class="_qty-container"
          :disabled="isSubmitting"
        />

        <SfButton
          class="_add-to-cart color-primary"
          type="submit"
          :disabled="isSubmitting"
        >
          {{ $t('Add to Cart') }}
        </SfButton>
      </div>

      <div class="_note">
        {{ $t('Vouchers include free S&H for Budsie ($13.95 value!).') }}

        <br>

        {{ $t('Available only in U.S.') }}
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { SfButton, SfHeading } from '@storefront-ui/vue';

import { BundleOption, BundleOptionsProductLink } from 'core/modules/catalog/types/BundleOption';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { Logger } from '@vue-storefront/core/lib/logger';
import * as catalogTypes from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import i18n from '@vue-storefront/i18n';
import { getProductDefaultPrice, ServerError } from 'src/modules/shared';
import { getDefaultProductLinkForRequiredBundleOptionsDictionary } from '@vue-storefront/core/modules/catalog/helpers/bundleOptions';

import ACustomProductQuantity from 'theme/components/atoms/a-custom-product-quantity.vue';

import MCreativityKitFormOption, { CreativityKitFormOption } from './m-creativity-kit-form-option.vue';

const productBundleOptionTitle = 'product';
const voucherBundleOptionTitle = 'vouchers';

const voucherSku = 'budsieVoucher16';
const superizeVoucherSku = 'budsieVoucher30';

export default Vue.extend({
  name: 'OCreativityKitProductOrderForm',
  props: {
    product: {
      type: Object as PropType<Product>,
      required: true
    },
    budsieProductPrice: {
      type: Number,
      required: true
    },
    superizedAddonPrice: {
      type: Number,
      required: true
    }
  },
  components: {
    ACustomProductQuantity,
    MCreativityKitFormOption,
    SfButton,
    SfHeading
  },
  data () {
    return {
      isSubmitting: false,
      selectedOption: undefined as CreativityKitFormOption | undefined,
      quantity: 1
    }
  },
  computed: {
    baseProductPrice (): number {
      const price = getProductDefaultPrice(this.product, {}, false);
      return price.special && price.special < price.regular
        ? price.special
        : price.regular;
    },
    defaultBundleOptionsProductLink (): Record<string, BundleOptionsProductLink> {
      return getDefaultProductLinkForRequiredBundleOptionsDictionary(this.product);
    },
    defaultOption (): CreativityKitFormOption | undefined {
      if (!this.productBundleOption) {
        return;
      }

      const defaultProductLink = this.defaultBundleOptionsProductLink[this.productBundleOption.option_id];

      if (!defaultProductLink) {
        return;
      }

      return {
        image: '/assets/images/creativityKit/kit.jpg',
        price: this.baseProductPrice,
        isDefault: false,
        name: this.$t('Creativity Kit').toString(),
        valueText: this.$t('(no Budsie)').toString(),
        bundleOptionId: this.productBundleOption.option_id,
        optionValueId: defaultProductLink.id.toString()
      }
    },
    options (): CreativityKitFormOption[] {
      const options: CreativityKitFormOption[] = [];

      if (this.defaultOption) {
        options.push(this.defaultOption);
      }

      if (!this.voucherBundleOption) {
        return options;
      }

      for (const productLink of this.voucherBundleOption.product_links) {
        if (!productLink.product) {
          continue;
        }

        const price = getProductDefaultPrice(productLink.product, {}, false);
        const finalPrice = price.special && price.special < price.regular
          ? price.special
          : price.regular;

        let image = productLink.product.image;
        let name = productLink.product.name;
        let valueText = '';
        let isDefault = false;

        if (productLink.sku === voucherSku) {
          image = '/assets/images/creativityKit/kit-voucher16.jpg';
          name = this.$t('With 16″ Budsie').toString();
          valueText = `($${this.voucherValue} ${this.$t('value')})`;
          isDefault = true;
        }

        if (productLink.sku === superizeVoucherSku) {
          image = '/assets/images/creativityKit/kit-voucher30.jpg';
          name = this.$t('With 30″ Budsie').toString();
          valueText = `($${this.superizedVoucherValue} ${this.$t('value')})`;
        }

        options.push({
          image,
          price: finalPrice + this.baseProductPrice,
          isDefault,
          name,
          valueText,
          bundleOptionId: this.voucherBundleOption.option_id,
          optionValueId: productLink.id.toString()
        });
      }

      return options;
    },
    productBundleOption (): BundleOption | undefined {
      return this.getBundleOptionByTitle(productBundleOptionTitle);
    },
    voucherBundleOption (): BundleOption | undefined {
      return this.getBundleOptionByTitle(voucherBundleOptionTitle);
    },
    voucherValue (): number {
      return Math.round(this.baseProductPrice + this.budsieProductPrice);
    },
    superizedVoucherValue (): number {
      return Math.round(this.voucherValue + this.superizedAddonPrice);
    }
  },
  created (): void {
    this.setDefaultSelectedOption();

    if (!this.productBundleOption) {
      return;
    }

    this.setBundleOptionValue(
      this.productBundleOption.option_id,
      1,
      [Number.parseInt(this.productBundleOption.product_links[0].id as string)]
    )
  },
  methods: {
    async onSubmit (): Promise<void> {
      if (this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;

      await this.$store.dispatch(
        'product/setBundleOptions',
        { product: this.product, bundleOptions: this.$store.state.product.current_bundle_options }
      );

      try {
        try {
          await this.$store.dispatch('cart/addItem', {
            productToAdd: Object.assign({}, this.product, {
              qty: this.quantity
            })
          });
        } catch (error) {
          if (error instanceof ServerError) {
            throw error;
          }

          Logger.error(error, 'budsies')();
        }

        this.goToCrossSells();
      } catch (error) {
        Logger.error(error, 'budsies')();

        this.onFailure('Unexpected error: ' + error);
      } finally {
        this.isSubmitting = false;
      }
    },
    getBundleOptionByTitle (title: string): BundleOption | undefined {
      if (!this.product.bundle_options) {
        return;
      }

      return this.product.bundle_options.find((option) => option.title.toLowerCase() === title);
    },
    onFailure (message: any): void {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: message,
        action1: { label: i18n.t('OK') }
      });
    },
    goToCrossSells (): void {
      this.$router.push({
        name: 'cross-sells',
        params: {
          parentSku: this.product.sku
        }
      });
    },
    setBundleOptionValue (
      optionId: number,
      optionQty: number,
      optionSelections: number[]
    ): void {
      this.$store.commit('product' + '/' + catalogTypes.PRODUCT_SET_BUNDLE_OPTION, { optionId, optionQty, optionSelections });
    },
    setDefaultSelectedOption (): void {
      this.selectedOption = this.options.find(({ isDefault }) => isDefault);
    }
  },
  watch: {
    selectedOption (newValue: CreativityKitFormOption): void {
      if (!this.productBundleOption) {
        Logger.error('productBundleOption is not defined while attempt to select option was performed', 'budsies')();
        return;
      }

      if (!this.voucherBundleOption) {
        Logger.error('voucherBundleOption is not defined while attempt to select option was performed', 'budsies')();
        return;
      }

      const isBaseOptionSelected = !!newValue &&
        newValue.bundleOptionId === this.productBundleOption.option_id;

      if (!isBaseOptionSelected) {
        this.setBundleOptionValue(
          newValue.bundleOptionId,
          1,
          [Number.parseInt(newValue.optionValueId)]
        );

        return;
      }

      this.setBundleOptionValue(
        this.voucherBundleOption.option_id,
        1,
        []
      );
    }
  }
})
</script>

<style lang="scss" scoped>
@import "theme/css/base/_breakpoints.scss";

.o-creativity-kit-product-order-form {
  ._form {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: var(--spacer-lg);

    ._options {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      column-gap: var(--spacer-lg);
      row-gap: var(--spacer-xl);
    }

    ._option {
      width: 100%;
    }
  }

  ._action-row {
    margin-top: var(--spacer-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  ._add-to-cart {
    margin-top: var(--spacer-base);
  }

  ._note {
    margin-top: var(--spacer-lg);
    text-align: center;
    opacity: 0.7;
  }

  @include for-tablet-up {
    ._form {
      ._options {
        flex-wrap: nowrap;
      }
    }

    ._action-row {
      flex-direction: row;
      column-gap: var(--spacer-lg);
    }

    ._add-to-cart {
      margin-top: 0;
    }
  }
}
</style>
