<template>
  <validation-observer
    v-slot="{ passes }"
    slim
  >
    <form
      class="o-bulksample-creation-form"
      @submit.prevent="() => passes(() => onFormSubmit())"
    >
      <SfHeading
        :level="1"
        :title="mainTitleText"
        class="_main-heading"
      />

      <validation-provider
        v-slot="{ errors }"
        :name="$t('\'Artwork\'')"
        rules="required"
        tag="div"
        class="_step-container"
      >
        <SfHeading
          :level="3"
          :title="$t('STEP {number}', {number: 1})"
          class="_step-number"
        />

        <SfHeading
          :level="3"
          :title="$t('Please upload your awesome design')"
          class="_step-title -required"
        />

        <span class="_order-hint">
          {{ orderHintText }}
        </span>

        <input
          type="hidden"
          name="uploaded_artwork_ids[]"
          v-model="customerImages"
        >

        <m-artwork-upload
          :allow-multiple="true"
          :disabled="isDisabled"
          :product-id="backendProductId"
          :upload-url="artworkUploadUrl"
          :initial-items="artworkUploadInitialItems"
          :max-files="3"
          @file-added="onArtworkAdd"
          @file-removed="onArtworkRemove"
        />

        <div class="_error-text">
          {{ errors[0] }}
        </div>

        <span class="_artwork-hint">
          {{ $t('One image is typically sufficient, but you may upload up to three images of your design') }}
        </span>
      </validation-provider>

      <SfDivider />

      <validation-provider
        v-slot="{ errors }"
        :name="$t('\'Size\'')"
        :rules="sizeFieldRules"
        tag="div"
        class="_step-container"
      >
        <SfHeading
          :level="3"
          :title="$t('STEP {number}', {number: 2})"
          class="_step-number"
        />

        <template v-if="isPillowSample">
          <SfHeading
            :level="3"
            :title="$t('Size in inches')"
            class="_step-title -required"
          />

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
        </template>

        <SfInput
          v-else
          v-model="size"
          class="-required"
          :label="$t('Size in inches')"
          :disabled="isDisabled"
          :error-message="errors[0]"
          :valid="!errors.length"
        />
      </validation-provider>

      <SfDivider />

      <div class="_step-container">
        <validation-provider
          v-slot="{ errors }"
          :name="$t('\'Name\'')"
          rules="required"
          tag="div"
          class="_step-subsection"
        >
          <SfHeading
            :level="3"
            :title="$t('STEP {number}', {number: 3})"
            class="_step-number"
          />

          <SfInput
            v-model="plushieName"
            class="-required"
            :label="$t('Name')"
            :disabled="isDisabled"
            :error-message="errors[0]"
            :valid="!errors.length"
          />

          <span class="_input-hint">
            {{ $t('This could be the name of your character or name of your project (e.g., \'Danny the Dolphin\')') }}
          </span>
        </validation-provider>

        <validation-provider
          v-slot="{ errors }"
          :name="$t('\'Description\'')"
          rules="required"
          tag="div"
          class="_step-subsection"
        >
          <SfHeading
            :level="3"
            :title="descriptionTitleText"
            class="_step-title -required -subsection"
          />

          <textarea
            name="description"
            rows="5"
            v-model="description"
            :placeholder="$t('Dark blue octopus with 8 legs and one large white eye')"
            :disabled="isDisabled"
          />

          <div class="_error-text">
            {{ errors[0] }}
          </div>

          <span class="_input-hint">
            {{ descriptionHintText }}
          </span>
        </validation-provider>

        <validation-provider
          v-if="showColorPalette"
          v-slot="{ errors }"
          :name="$t('\'Colors\'')"
          rules="required"
          tag="div"
          class="_step-subsection"
        >
          <SfHeading
            :level="3"
            :title="$t('Color Palette')"
            class="_step-title -required -subsection"
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
            {{ errors[0] }}
          </div>

          <span class="_input-hint">
            {{ $t('Click an existing color to deselect it.') }}
          </span>

          <br>

          <span class="_input-hint">
            {{ $t('Please note any special requests in the description above') }}
          </span>
        </validation-provider>
      </div>

      <SfDivider />

      <div class="_step-container" v-if="showAddonsStep">
        <SfHeading
          :level="3"
          :title="$t('STEP {number}', {number: 4})"
          class="_step-number"
        />

        <SfHeading
          :level="3"
          :title="$t('Upgrade Your Bulk Plush Sample (optional)')"
          class="_step-title"
        />

        <m-addons-selector
          v-model="selectedAddons"
          :addons="addons"
          :disabled="isDisabled"
        />
      </div>

      <SfDivider />

      <div class="_step-container">
        <SfHeading
          :level="3"
          :title="$t('STEP {number}', {number: customerTypeStepNumber})"
          class="_step-number"
        />

        <SfHeading
          :level="3"
          :title="$t('Which of the following best describes you?')"
          class="_step-title"
        />

        <SfSelect
          v-model="customerType"
          :disabled="isDisabled"
          class="sf-select--underlined"
        >
          <SfSelectOption
            v-for="option in customerTypeOptions"
            :key="option.id"
            :value="option.value"
          >
            {{ option.title }}
          </SfSelectOption>
        </SfSelect>
      </div>

      <validation-provider
        v-if="showEmailStep"
        v-slot="{ errors }"
        :name="$t('\'E-mail\'')"
        rules="required"
        tag="div"
      >
        <SfDivider />

        <div class="_step-container">
          <SfHeading
            :level="3"
            :title="$t('STEP {number}', {number: emailStepNumber})"
            class="_step-number"
          />

          <SfInput
            :label="$t('Enter your email address')"
            v-model="email"
            class="-required"
            :disabled="isDisabled"
            :error-message="errors[0]"
            :valid="!errors.length"
          />

          <span class="_input-hint">
            {{ $t('Sometimes our team has questions about your design') }}
          </span>
        </div>
      </validation-provider>

      <div class="_buttons-container">
        <SfButton type="submit" :disabled="isDisabled">
          {{ $t('SAVE') }}
        </SfButton>
      </div>
    </form>
  </validation-observer>
</template>

<script lang="ts">
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate';
import { required, between } from 'vee-validate/dist/rules';
import Vue, { PropType, VueConstructor } from 'vue'
import { SfButton, SfHeading, SfSelect, SfDivider, SfInput } from '@storefront-ui/vue'
import { Logger } from '@vue-storefront/core/lib/logger';
import { getProductGallery as getGalleryByProduct, setBundleProductOptionsAsync } from '@vue-storefront/core/modules/catalog/helpers';
import * as catalogTypes from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import { BundleOption, BundleOptionsProductLink } from '@vue-storefront/core/modules/catalog/types/BundleOption';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';
import Product, { ProductLink } from '@vue-storefront/core/modules/catalog/types/Product';
import i18n from '@vue-storefront/i18n';

import { Bodypart, BodypartOption, BodypartValue, ProductId, ProductValue, vuexTypes as budsiesTypes, ImageUploadMethod } from 'src/modules/budsies';
import { ImageHandlerService, Item } from 'src/modules/file-storage';
import { CustomerImage, getProductDefaultPrice, ServerError } from 'src/modules/shared';

import AddonOption from '../interfaces/addon-option.interface';

import MAddonsSelector from 'theme/components/molecules/m-addons-selector.vue';
import MArtworkUpload from 'theme/components/molecules/m-artwork-upload.vue';
import MBodypartOptionConfigurator from 'theme/components/molecules/m-bodypart-option-configurator.vue';
import { TranslateResult } from 'vue-i18n';

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

extend('between', {
  ...between,
  message: 'The {_field_} field must be between {min} and {max}'
});

interface CustomerType {
  id: number,
  value: string,
  title: string
}

interface InjectedServices {
  imageHandlerService: ImageHandlerService
}

interface PillowSizeOption {
  id: number | string,
  value: number | string,
  title: string
}

const sizeFromDescriptionRegex = /Size: (\d{1,2})/;

export default (Vue as VueConstructor<Vue & InjectedServices>).extend({
  props: {
    artworkUploadUrl: {
      type: String,
      required: true
    },
    product: {
      type: Object as PropType<Product>,
      required: true
    },
    existingPlushieId: {
      type: String,
      default: undefined
    },
    isPillowSample: {
      type: Boolean,
      default: false
    }
  },
  inject: {
    imageHandlerService: { from: 'ImageHandlerService' }
  },
  components: {
    SfButton,
    SfDivider,
    SfInput,
    SfHeading,
    SfSelect,
    MAddonsSelector,
    MArtworkUpload,
    MBodypartOptionConfigurator,
    ValidationProvider,
    ValidationObserver
  },
  computed: {
    addons (): AddonOption[] {
      if (!this.addonsBundleOption) {
        return []
      }

      let result: AddonOption[] = [];
      for (const productLink of this.addonsBundleOption.product_links) {
        if (!productLink.product) {
          continue;
        }

        const images: string[] = getGalleryByProduct(productLink.product).map((i: any) => i.src);
        const price = getProductDefaultPrice(productLink.product, {}, false);

        result.push({
          id: Number(productLink.product.id),
          sku: productLink.product.sku,
          name: productLink.product.name,
          description: productLink.product.short_description || '',
          price: price.special ? price.special : price.regular,
          images: images,
          optionId: this.addonsBundleOption.option_id,
          optionValueId: ((typeof productLink.id === 'number') ? productLink.id : Number.parseInt(productLink.id, 10) as number),
          videoUrl: (productLink.product as any).video_url
        });
      }

      return result;
    },
    addonsBundleOption (): BundleOption | undefined {
      if (!this.product.bundle_options) {
        return;
      }

      return this.product.bundle_options.find((option: BundleOption) => option.title.toLowerCase() === 'addons');
    },
    backendProductId (): string | undefined {
      if (!this.product) {
        return undefined;
      }

      switch (this.product.id) {
        case ProductId.BULK_PLUSH_SAMPLE:
          return ProductValue.BULK_SAMPLE;
        case ProductId.BULK_PILLOW_SAMPLE:
          return ProductValue.PILLOW_BULK_SAMPLE;
        default:
          throw new Error(
            `Can't resolve Backend product ID for Magento '${this.product.id}' product ID`
          );
      }
    },
    bodyparts (): Bodypart[] {
      return this.$store.getters['budsies/getProductBodyparts'](this.product.id);
    },
    cartItems (): CartItem[] {
      return this.$store.getters['cart/getCartItems']
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
    descriptionHintText (): TranslateResult {
      return this.isPillowSample
        ? this.$t('Please provide a description of the design to help us most accurately create the Bulk Pillow Sample')
        : this.$t('Please provide a description of the design to help us most accurately create the Bulk Plush Sample');
    },
    descriptionTitleText (): TranslateResult {
      return this.isPillowSample
        ? this.$t('Describe Your Bulk Pillow Sample')
        : this.$t('Describe Your Bulk Plush Sample');
    },
    emailStepNumber (): 5 | 6 {
      return this.showAddonsStep ? 6 : 5;
    },
    getBodypartOptions (): (id: string) => BodypartOption[] {
      return this.$store.getters['budsies/getBodypartOptions']
    },
    isDisabled (): boolean {
      return this.isSubmitting;
    },
    customerTypeOptions (): CustomerType[] {
      return [
        {
          id: 0,
          value: '0',
          title: 'Small Business'
        }
      ]
    },
    customerTypeStepNumber (): 5 | 4 {
      return this.showAddonsStep ? 5 : 4;
    },
    existingCartItem (): CartItem | undefined {
      if (!this.existingPlushieId) {
        return;
      }

      return this.cartItems.find((item) => item.plushieId === this.existingPlushieId);
    },
    mainTitleText (): TranslateResult {
      return this.isPillowSample
        ? this.$t('Bulk Pillow Sample Order Form')
        : this.$t('Bulk Plush Sample Order Form')
    },
    orderHintText (): TranslateResult {
      return this.isPillowSample
        ? this.$t('Please order each unique design as a separate Bulk Pillow Sample')
        : this.$t('Please order each unique design as a separate Bulk Plush Sample')
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
        console.log(productLink);
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

      return this.product.bundle_options.find((bundleOption) => bundleOption.title.toLowerCase() === 'product');
    },
    sizeFieldRules (): string {
      return this.isPillowSample
        ? 'required'
        : 'required|between:6,16';
    },
    showAddonsStep (): boolean {
      return this.addons.length > 0;
    },
    showColorPalette (): boolean {
      return !this.isPillowSample && !!this.colorPaletteBodypart;
    }
  },
  data () {
    return {
      size: '',
      plushieName: '',
      description: '',
      customerType: undefined,
      color: undefined as BodypartOption[] | undefined,
      selectedAddons: [] as number [],
      customerImages: [] as CustomerImage[],
      email: '',
      showEmailStep: false,
      plushieId: undefined as number | undefined,
      artworkUploadInitialItems: [] as CustomerImage[],
      isSubmitting: false,
      pillowSize: undefined as string | undefined
    }
  },
  methods: {
    async addToCart (): Promise<void> {
      if (this.isSubmitting) {
        return;
      }

      if (!this.plushieId) {
        this.plushieId = await this.createPlushie();
      }

      this.isSubmitting = true;

      await this.$store.dispatch(
        'product/setBundleOptions',
        { product: this.product, bundleOptions: this.$store.state.product.current_bundle_options }
      );

      this.$store.commit(
        budsiesTypes.SN_BUDSIES + '/' + budsiesTypes.CUSTOMER_EMAIL_SET,
        { email: this.email }
      );

      try {
        try {
          const data: any = {
            plushieDescription: this.isPillowSample
              ? this.description
              : `Size: ${this.size} ${this.description}`,
            plushieName: this.plushieName,
            customerImages: this.customerImages,
            customerType: this.customerType,
            plushieId: this.plushieId.toString(),
            uploadMethod: ImageUploadMethod.NOW
          }

          if (!this.isPillowSample) {
            data.bodyparts = this.getBodypartsData();
          }

          await this.$store.dispatch('cart/addItem', {
            productToAdd: Object.assign({}, this.product, data)
          });
        } catch (error) {
          if (error instanceof ServerError) {
            throw error;
          }

          Logger.error(error, 'budsies')();
        }

        this.$router.push({ name: 'detailed-cart' });
      } catch (error) {
        Logger.error(error, 'budsies')();

        this.onFailure('Unexpected error: ' + error);
      } finally {
        this.isSubmitting = false;
      }
    },
    async createPlushie (): Promise<number> {
      if (!this.product) {
        throw new Error('Current product is not set!');
      }

      const task = await this.$store.dispatch('budsies/createNewPlushie', { productId: this.product.id });
      return task.result;
    },
    fillAddonsDataFromCartItem (existingCartItem: CartItem): void {
      const productOption = existingCartItem.product_option;

      if (!this.addonsBundleOption || !productOption) {
        return;
      }

      if (!productOption.extension_attributes.bundle_options[this.addonsBundleOption.option_id]) {
        return;
      }

      const selectedAddonsProductOption =
       productOption.extension_attributes.bundle_options[this.addonsBundleOption.option_id];

      this.selectedAddons = selectedAddonsProductOption.option_selections;
    },
    fillBodypartsFromCartItem (existingCartItem: CartItem): void {
      this.color = undefined;

      if (!existingCartItem.bodyparts || !this.colorPaletteBodypart) {
        return;
      }

      const cartItemColorBodypart =
       existingCartItem.bodyparts[this.colorPaletteBodypart.id];

      if (!cartItemColorBodypart) {
        return;
      }

      this.color = this.colorPaletteOptions.filter((option: BodypartOption) => {
        return cartItemColorBodypart.includes(option.id) ||
        cartItemColorBodypart.includes(Number(option.id))
      });
    },
    fillCustomerImagesFromCartItem (existingCartItem: CartItem): void {
      this.customerImages = existingCartItem.customerImages || [];
      this.artworkUploadInitialItems = [ ...this.customerImages ];
    },
    fillDescriptionFromCartItem (existingCartItem: CartItem): void {
      if (this.isPillowSample) {
        this.description = existingCartItem.plushieDescription || '';
        return;
      }

      this.description = this.getDescriptionFromExistingCartItem(existingCartItem);
    },
    fillPlushieDataFromCartItem (existingCartItem: CartItem): void {
      this.plushieName = existingCartItem.plushieName || '';
      this.customerType = (existingCartItem as any).customerType; // todo

      this.fillSizeFromCartItem(existingCartItem);
      this.fillDescriptionFromCartItem(existingCartItem);
      this.fillCustomerImagesFromCartItem(existingCartItem);
      this.fillAddonsDataFromCartItem(existingCartItem);
      this.fillBodypartsFromCartItem(existingCartItem);
    },
    fillSizeFromCartItem (existingCartItem: CartItem): void {
      this.size = '';
      this.pillowSize = undefined;

      if (this.isPillowSample) {
        this.pillowSize = this.getPillowSizeFromCartItem(existingCartItem);
        return;
      }

      this.size = this.getSizeFromExistingCartItem(existingCartItem);
    },
    getBodypartsData (): Record<string, string[]> {
      let data: Record<string, string[]> = {};

      if (!this.colorPaletteBodypart || !this.color) {
        return data;
      }

      data[this.colorPaletteBodypart.id] = this.color.map(item => item.id);

      return data;
    },
    getPillowSizeFromCartItem (existingCartItem: CartItem): string | undefined {
      if (!this.productBundleOption) {
        return;
      }

      const pillowSizeBundleOption =
       existingCartItem.product_option?.extension_attributes.bundle_options[this.productBundleOption.option_id];

      if (!pillowSizeBundleOption) {
        return;
      }

      const selectedOption = pillowSizeBundleOption.option_selections[0];

      if (selectedOption === undefined) {
        return;
      }

      return selectedOption.toString();
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
    getSizeFromExistingCartItem (existingCartItem: CartItem): string {
      if (!existingCartItem.plushieDescription) {
        return '';
      }

      const match = existingCartItem.plushieDescription.match(sizeFromDescriptionRegex);
      if (!match || !match[1]) {
        return '';
      }

      return match[1];
    },
    getDescriptionFromExistingCartItem (existingCartItem: CartItem): string {
      return existingCartItem.plushieDescription?.replace(sizeFromDescriptionRegex, '').trim() || '';
    },
    onArtworkAdd (value: Item): void {
      this.customerImages.push({
        id: value.id,
        url: this.imageHandlerService.getOriginalImageUrl(value.url)
      });
    },
    onArtworkRemove (storageItemId: string): void {
      const index = this.customerImages.findIndex(({ id }) => id === storageItemId);

      if (index === -1) {
        return;
      }

      this.customerImages.splice(index, 1);
    },
    onFailure (message: any): void {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: message,
        action1: { label: i18n.t('OK') }
      });
    },
    onFormSubmit (): void {
      if (!this.existingCartItem) {
        void this.addToCart();
      } else {
        void this.updateExistingCartItem();
      }
    },
    prefillEmail (): void {
      const customerEmail = this.$store.getters['budsies/getPrefilledCustomerEmail'];
      if (customerEmail) {
        this.email = customerEmail;
        this.showEmailStep = false;
      }
    },
    setBundleOptionValue (optionId: number, optionQty: number, optionSelections: number[]): void {
      this.$store.commit('product' + '/' + catalogTypes.PRODUCT_SET_BUNDLE_OPTION, { optionId, optionQty, optionSelections });
    },
    async updateClientAndServerItem (payload: {
      product: CartItem,
      forceUpdateServerItem?: boolean,
      forceClientState?: boolean
    }): Promise<void> {
      await this.$store.dispatch('cart/updateClientAndServerItem', payload);
    },
    async updateExistingCartItem (): Promise<void> {
      if (!this.existingCartItem) {
        throw new Error('Cart Item not found!');
      }

      if (!this.existingPlushieId) {
        throw new Error('Plushie ID is not defined!');
      }

      this.isSubmitting = true;

      try {
        try {
          const data: any = {
            plushieDescription: this.isPillowSample
              ? this.description
              : `Size: ${this.size} ${this.description}`,
            plushieName: this.plushieName,
            customerImages: this.customerImages,
            customerType: this.customerType,
            plushieId: this.existingPlushieId,
            uploadMethod: ImageUploadMethod.NOW,
            product_option: setBundleProductOptionsAsync(
              null,
              {
                product: this.existingCartItem,
                bundleOptions: this.$store.state.product.current_bundle_options
              }
            )
          }

          if (!this.isPillowSample) {
            data.bodyparts = this.getBodypartsData();
          }

          await this.updateClientAndServerItem({
            product: Object.assign({}, this.existingCartItem, data),
            forceUpdateServerItem: true
          });
        } catch (error) {
          if (error instanceof ServerError) {
            throw error;
          }

          Logger.error(error, 'budsies')();
        }

        this.$router.push({ name: 'detailed-cart' });
      } catch (error) {
        Logger.error(error, 'budsies')();

        this.onFailure('Unexpected error: ' + error);
      } finally {
        this.isSubmitting = false;
      }
    }
  },
  created (): void {
    this.prefillEmail();

    if (this.existingCartItem) {
      this.fillPlushieDataFromCartItem(this.existingCartItem)
    }
  },
  beforeMount (): void {
    this.$bus.$once('budsies-store-synchronized', this.prefillEmail);
  },
  beforeDestroy (): void {
    this.$bus.$off('budsies-store-synchronized', this.prefillEmail);
  },
  watch: {
    selectedAddons: {
      handler (newValue: number[]) {
        if (!this.addonsBundleOption) {
          return;
        }

        this.setBundleOptionValue(
          this.addonsBundleOption.option_id,
          1,
          newValue
        );
      }
    },
    pillowSize: {
      handler (newValue: number | string) {
        if (!this.productBundleOption) {
          return;
        }

        this.setBundleOptionValue(
          this.productBundleOption.option_id,
          1,
          newValue ? [Number(newValue)] : []
        )
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.o-bulksample-creation-form {
    --divider-margin: 0 0 var(--spacer-xl);
    --divider-border-color: rgba(0, 0, 0, 0.1);

    padding: var(--spacer-xl) 0;

    ._main-heading {
        margin-bottom: var(--spacer-xl);
    }

    ._order-hint {
        margin-top: var(--spacer-sm);
    }

    ._step-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 760px;
        margin: 0 auto var(--spacer-xl);
    }

    ._step-number {
        --heading-title-color: var(--c-primary);
        --heading-title-font-family: var(--font-family-primary);
        --heading-padding: 0 0 var(--spacer-xs);

        display: inline-block;
        border-bottom: 4px solid var(--c-primary);
        margin-bottom: var(--spacer-sm);
    }

    ._step-title {
        margin-bottom: var(--spacer-sm);

        &.-subsection {
            margin-top: var(--spacer-xl);
        }

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

    ._subtitle {
        margin-bottom: var(--spacer-sm);
    }

    ._input-hint {
        margin-top: var(--spacer-sm);
        font-weight: 600;
    }

    ._step-subsection {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }

    ._error-text {
        color: var(--c-danger-variant);
        font-size: var(--font-xs);
        margin-top: var(--spacer-xs);
        height: calc(var(--font-xs) * 1.2);
    }

    .m-artwork-upload {
        margin: var(--spacer-sm) 0 var(--spacer-xl);
        width: 100%;
        // max-width: 45rem;
        // min-width: 25rem;
    }

    .m-bodypart-option-configurator {
        text-align: center;
    }

    // textarea,
    // .sf-input,
    // .sf-select {
    //     --input-width: 50%;
    //     --input-margin: 0;

    //     max-width: 30rem;
    //     min-width: 15rem;
    // }

    .sf-input {
        --input-margin: 0;
        --input-width: 70%;

        min-width: 15rem;

        &.-required {
            --input-label-required: " *";
        }
    }

    .sf-select {
        width: 70%;

        min-width: 15rem;
    }

    textarea {
        box-sizing: border-box;
        border: 1px solid var(--c-light);
        width: 100%;
        padding: 0.5em;
        font-family: var(--font-family-primary);
        resize: vertical;
    }

    ._buttons-container {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    @include for-desktop {
        ._step-number {
            margin-bottom: var(--spacer-base);
        }
    }
}
</style>
