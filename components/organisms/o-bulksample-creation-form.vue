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

      <template v-if="showPillowSizeSelector || showSimpleSizeInput">
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

          <template v-if="showPillowSizeSelector">
            <SfHeading
              :level="3"
              :title="$t('Size in inches')"
              class="_step-title -required"
            />

            <SfSelect
              v-model="pillowSize"
              :valid="!errors.length"
              :error-message="errors[0]"
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
            v-else-if="showSimpleSizeInput"
            v-model="size"
            class="-required"
            :label="$t('Size in inches')"
            :disabled="isDisabled"
            :error-message="errors[0]"
            :valid="!errors.length"
          />
        </validation-provider>

        <SfDivider />
      </template>

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
            :title="$t('STEP {number}', {number: nameStepNumber})"
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
          :title="$t('STEP {number}', {number: addonsStepNumber})"
          class="_step-number"
        />

        <SfHeading
          :level="3"
          :title="addonsTitleText"
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

      <SfDivider v-show="showEmailStep" />

      <div v-show="showEmailStep" class="_step-container">
        <SfHeading
          :level="3"
          :title="$t('STEP {number}', {number: emailStepNumber})"
          class="_step-number"
        />

        <validation-provider
          v-slot="{ errors }"
          :name="$t('\'E-mail\'')"
          rules="required"
          slim
        >
          <SfInput
            :label="$t('Enter your email address')"
            v-model="email"
            class="-required"
            :disabled="isDisabled"
            :error-message="errors[0]"
            :valid="!errors.length"
          />
        </validation-provider>

        <span class="_input-hint">
          {{ $t('Sometimes our team has questions about your design') }}
        </span>

        <validation-provider
          :rules="{ required: { allowFalse: false } }"
          :name="$t('Agreement')"
          v-slot="{errors}"
          slim
        >
          <SfCheckbox
            class="_agreement"
            :disabled="isDisabled"
            v-model="agreement"
          >
            <template #label>
              <span>
                {{ $t('I agree to ') }}

                <a href="" target="_blank">{{ $t('Bulk Order Customer Agreement') }}</a>,

                <a href="/terms-of-service/">{{ $t('Terms of Service') }}</a>, and

                <a href="/privacy-policy/">{{ $t('Privacy Policy') }}</a>.

                {{ $t('I understand that Stuffed Animal Pros happily takes care of all tears, defects, and shipping damage with a refund, replacement, or repair.') }}
              </span>
            </template>
          </SfCheckbox>

          <div class="_error-text">
            {{ errors[0] }}
          </div>
        </validation-provider>
      </div>

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
import { TranslateResult } from 'vue-i18n';
import { SfButton, SfCheckbox, SfHeading, SfSelect, SfDivider, SfInput } from '@storefront-ui/vue'
import { Logger } from '@vue-storefront/core/lib/logger';
import { getProductGallery as getGalleryByProduct, setBundleProductOptionsAsync } from '@vue-storefront/core/modules/catalog/helpers';
import * as catalogTypes from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import { BundleOption, BundleOptionsProductLink } from '@vue-storefront/core/modules/catalog/types/BundleOption';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import i18n from '@vue-storefront/i18n';

import { Bodypart, BodypartOption, BodypartValue, ProductId, ProductValue, vuexTypes as budsiesTypes, ImageUploadMethod, Dictionary } from 'src/modules/budsies';
import { ImageHandlerService, Item } from 'src/modules/file-storage';
import { CustomerImage, getProductDefaultPrice, ServerError } from 'src/modules/shared';

import BulksampleProduct from 'theme/interfaces/bulksample-product.type';

import AddonOption from '../interfaces/addon-option.interface';
import CustomerType from '../interfaces/customer-type.interface';

import MAddonsSelector from 'theme/components/molecules/m-addons-selector.vue';
import MArtworkUpload from 'theme/components/molecules/m-artwork-upload.vue';
import MBodypartOptionConfigurator from 'theme/components/molecules/m-bodypart-option-configurator.vue';

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

extend('between', {
  ...between,
  message: 'The {_field_} field must be between {min} and {max}'
});

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
    type: {
      type: String as PropType<BulksampleProduct>,
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
    ValidationObserver,
    SfCheckbox
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
    addonsStepNumber (): number {
      return this.nameStepNumber + 1;
    },
    addonsTitleText (): TranslateResult {
      return this.$t(
        'Upgrade Your Bulk {productName} Sample (optional)',
        { productName: this.productNameByType }
      )
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
        case ProductId.BULK_KEYCHAIN_SAMPLE:
          return ProductValue.KEYCHAIN_BULK_SAMPLE;
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
      return this.$t(
        'Please provide a description of the design to help us most accurately create the Bulk {productName} Sample',
        { productName: this.productNameByType }
      )
    },
    descriptionTitleText (): TranslateResult {
      return this.$t(
        'Describe Your Bulk {productName} Sample',
        { productName: this.productNameByType }
      );
    },
    emailStepNumber (): number {
      return this.customerTypeStepNumber + 1;
    },
    getBodypartOptions (): (id: string) => BodypartOption[] {
      return this.$store.getters['budsies/getBodypartOptions']
    },
    isDisabled (): boolean {
      return this.isSubmitting;
    },
    customerTypeOptions (): CustomerType[] {
      const customerTypes: Dictionary<string> | undefined = this.$store.getters['budsies/getCustomerTypes'];

      if (!customerTypes) {
        return [];
      }

      return Object.entries(customerTypes)
        .map(([key, value]) => {
          return {
            id: key,
            value: key,
            title: value
          }
        });
    },
    customerTypeStepNumber (): number {
      return this.showAddonsStep ? this.addonsStepNumber + 1 : this.nameStepNumber + 1;
    },
    existingCartItem (): CartItem | undefined {
      if (!this.existingPlushieId) {
        return;
      }

      return this.cartItems.find((item) => item.plushieId === this.existingPlushieId);
    },
    mainTitleText (): TranslateResult {
      return this.$t(
        'Bulk {productName} Sample Order Form',
        { productName: this.productNameByType }
      )
    },
    nameStepNumber (): number {
      return this.showPillowSizeSelector || this.showSimpleSizeInput ? 3 : 2;
    },
    orderHintText (): TranslateResult {
      return this.$t(
        'Please order each unique design as a separate Bulk {productName} Sample',
        { productName: this.productNameByType }
      )
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
    },
    productNameByType (): TranslateResult {
      switch (this.type) {
        case BulksampleProduct.PLUSH:
          return this.$t('Plush');
        case BulksampleProduct.PILLOW:
          return this.$t('Pillow');
        case BulksampleProduct.KEYCHAIN:
          return this.$t('Keychain');
        default:
          return '';
      }
    },
    sizeFieldRules (): string {
      return this.type === BulksampleProduct.PILLOW
        ? 'required'
        : 'required|between:6,16';
    },
    showAddonsStep (): boolean {
      return this.addons.length > 0;
    },
    showColorPalette (): boolean {
      return this.type === BulksampleProduct.PLUSH && !!this.colorPaletteBodypart;
    },
    showPillowSizeSelector (): boolean {
      return this.type === BulksampleProduct.PILLOW;
    },
    showSimpleSizeInput (): boolean {
      return this.type === BulksampleProduct.PLUSH;
    }
  },
  data () {
    return {
      size: '',
      plushieName: '',
      description: '',
      customerType: undefined as string | undefined,
      color: undefined as BodypartOption[] | undefined,
      selectedAddons: [] as number [],
      customerImages: [] as CustomerImage[],
      email: '',
      showEmailStep: true,
      plushieId: undefined as number | undefined,
      artworkUploadInitialItems: [] as CustomerImage[],
      isSubmitting: false,
      pillowSize: undefined as string | undefined,
      agreement: false
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
            plushieName: this.plushieName,
            customerImages: this.customerImages,
            customerType: this.customerType,
            plushieId: this.plushieId.toString(),
            uploadMethod: ImageUploadMethod.NOW
          }

          if (this.type === BulksampleProduct.PLUSH) {
            data.bodyparts = this.getBodypartsData();
            data.plushieDescription = `Size: ${this.size} ${this.description}`;
          } else {
            data.plushieDescription = this.description;
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
      if (this.type === BulksampleProduct.PLUSH) {
        this.description = this.getDescriptionFromExistingCartItem(existingCartItem);
        return;
      }

      this.description = existingCartItem.plushieDescription || '';
    },
    fillPlushieDataFromCartItem (existingCartItem: CartItem): void {
      this.plushieName = existingCartItem.plushieName || '';
      this.customerType = existingCartItem.customerType;

      this.fillSizeFromCartItem(existingCartItem);
      this.fillDescriptionFromCartItem(existingCartItem);
      this.fillCustomerImagesFromCartItem(existingCartItem);
      this.fillAddonsDataFromCartItem(existingCartItem);
      this.fillBodypartsFromCartItem(existingCartItem);
    },
    fillSizeFromCartItem (existingCartItem: CartItem): void {
      this.size = '';
      this.pillowSize = undefined;

      if (this.type === BulksampleProduct.KEYCHAIN) {
        return;
      }

      if (this.type === BulksampleProduct.PILLOW) {
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

          if (this.type === BulksampleProduct.PLUSH) {
            data.bodyparts = this.getBodypartsData();
            data.plushieDescription = `Size: ${this.size} ${this.description}`;
          } else {
            data.plushieDescription = this.description;
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
    --divider-display: none;

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
        margin: 0 auto var(--spacer-2xl);
        text-align: center;
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
        font-weight: var(--font-medium);
    }

    .m-artwork-upload {
        margin: var(--spacer-sm) 0 var(--spacer-xl);
        width: 100%;
    }

    .m-bodypart-option-configurator {
        text-align: center;
    }

    .sf-input {
        --input-margin: 0;
        --input-width: 100%;

        text-align: start;

        &.-required {
            --input-label-required: " *";
        }
    }

    .sf-select {
      --select-padding: 0;

        width: 100%;
    }

    textarea {
        box-sizing: border-box;
        border: 1px solid var(--c-light);
        width: 100%;
        padding: 0.5em;
        font-family: var(--font-family-primary);
        resize: vertical;
    }

    ._agreement {
      margin-top: var(--spacer-xl);
      font-size: var(--font-sm);
      text-align: start;

      ::v-deep {
        .sf-checkbox {
          &__container {
            align-items: flex-start;
          }

          &__checkmark {
            flex-shrink: 0;
            margin-right: var(--spacer-sm);
          }
        }
      }
    }

    ._buttons-container {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    @media screen and (min-width: $mobile-max) {
      --divider-display: block;

      ._step-container {
        margin-bottom: var(--spacer-xl);
      }

      .sf-input {
        --input-width: 70%;

        min-width: 15rem;
      }

      .sf-select {
        --select-padding: 0 0 calc(var(--font-xs) * 1.2) 0;

        width: 70%;
        min-width: 15rem;
      }
      ._step-number {
        margin-bottom: var(--spacer-base);
      }
    }
}
</style>
