<template>
  <div class="o-pillow-product-order-form product" :class="skinClass">
    <SfHeading
      :level="1"
      title="Pillow Order Form"
    />

    <MBlockStory
      story-slug="buddy_pillow_creation_page_top"
    />

    <validation-observer
      v-slot="{ errors: formErrors }"
      slim
      ref="validationObserver"
    >
      <form
        class="_form"
        @submit.prevent="onSubmit"
      >
        <div
          class="_step-number"
          ref="artwork-field-anchor"
        >
          Step 1
        </div>

        <SfHeading
          class="_step-title -required "
          :level="2"
          title="Upload your photo"
          :ref="getFieldAnchorName('Artwork')"
        />

        <div class="_upload-now" v-show="isUploadNow">
          <p>We do not edit your photos. The photo you submit will be printed on the pillow as is.</p>
          <p>
            Don't have your photos? You can finalize your order and <a
              class="_popup-link"
              href="javascript:void(0)"
              @click.stop.prevent="switchToUploadLater"
            >send them to us later.</a>
          </p>

          <validation-provider
            v-slot="{ errors }"
            name="'Artwork'"
            tag="div"
          >
            <input
              type="hidden"
              name="uploaded_artwork_ids[]"
              :value="customerImage"
              :required="isUploadNow"
            >

            <MArtworkUpload
              ref="artwork-upload"
              class="_file-uploader"
              :product-id="backendProductId"
              :disabled="isSubmitting"
              :upload-url="artworkUploadUrl"
              :initial-items="initialCustomerImages"
              @file-added="onArtworkAdd"
              @file-removed="onArtworkRemove"
              v-if="backendProductId"
            />

            <p class="_artwork-upload-helper">
              <strong>
                Please Note: We recommend high resolution, clear photos for our Pillows!
                <br>
                Low quality, dark or blurry photos may impact photo clarity on your Pillow.
              </strong>
            </p>

            <div class="_error-text">
              {{ errors[0] }}
            </div>
          </validation-provider>
        </div>

        <div class="_upload-email" v-show="!isUploadNow">
          <p>
            Want to upload photos now? Please use <a
              class="_popup-link"
              href="javascript:void(0)"
              @click.stop.prevent="switchToUploadNow"
            >our uploader.</a>
          </p>

          <p>
            When you're ready, please email a photo of the design to: <br> <a
              class="_popup-link"
              href="mailto:art@budsies.com"
            >art@budsies.com</a>
          </p>

          <p>Include this design's magic word in the subject line of the email:</p>
          <p><b>{{ shortcode }}</b></p>

          <p>
            Don't worry, we'll send you a reminder with this code after you complete your order. <br> You may include only one photo per Pillow. <br> <a
              class="_popup-link"
              href="mailto:art@budsies.com"
            >Art@budsies.com</a> is an automated inbox used only for receiving images.
          </p>

          <p>NOTE: Proceed to Step 2 to complete your order. You may send us your photo within the next 5 days.</p>
        </div>

        <SfDivider class="_step-divider" />

        <div
          class="_step-number"
          ref="size-field-anchor"
        >
          Step 2
        </div>

        <SfHeading
          class="_step-title -required "
          :level="2"
          title="Size"
          :ref="getFieldAnchorName('Size')"
        />

        <validation-provider
          v-slot="{ errors }"
          rules="required"
          name="'Size'"
          tag="div"
        >
          <m-plushie-size-selector
            name="pillow_size"
            v-model="size"
            :options="sizes"
            :disabled="isSubmitting"
          />

          <div class="_error-text">
            {{ errors[0] }}
          </div>
        </validation-provider>

        <SfDivider class="_step-divider" />

        <div
          class="_step-number"
          ref="pillow-type-field-anchor"
        >
          Step 3
        </div>

        <div
          v-for="bodypart in bodyparts"
          :key="bodypart.id"
        >
          <SfHeading
            class="_step-title _body-part-heading"
            :class="{ '-required': bodypart.isRequired }"
            :level="2"
            :title="bodypart.name"
            :ref="getFieldAnchorName(bodypart.name)"
          />

          <validation-provider
            v-slot="{ errors }"
            :rules="bodypart.isRequired ? 'required' : ''"
            :name="`'${bodypart.name}'`"
            tag="div"
          >
            <m-bodypart-option-configurator
              :name="bodypart.code"
              v-model="bodypartsValues[bodypart.id]"
              :max-values="bodypart.maxValues"
              :options="getBodypartOptions(bodypart.id)"
              type="bodypart"
              :disabled="isSubmitting"
            />

            <div class="_error-text">
              {{ errors[0] }}
            </div>
          </validation-provider>
        </div>

        <SfDivider class="_step-divider" />

        <div
          class="_step-number"
        >
          Step 4
        </div>

        <validation-provider
          v-slot="{ errors, classes }"
          rules="required"
          :name="'Quantity'"
          slim
        >
          <div class="_quantity-field" :class="classes">
            <SfHeading
              class="_step-title -required "
              :level="2"
              title="Quantity"
              :ref="getFieldAnchorName('Quantity')"
            />

            <ACustomProductQuantity
              v-model="quantity"
              class="_qty-container"
              :disabled="isSubmitting"
            />

            <div class="_error-text">
              {{ errors[0] }}
            </div>
          </div>
        </validation-provider>

        <div
          class="_production-time-selector-section"
          v-if="showProductionTimeOptions"
        >
          <MProductionTimeSelector
            v-model="productionTime"
            :production-time-options="productionTimeOptions"
            :product-id="product.id"
            :disabled="isSubmitting"
          />
        </div>

        <div v-show="showEmailStep">
          <SfDivider class="_step-divider" />

          <div
            class="_step-number"
            ref="email-field-anchor"
          >
            Step 5
          </div>

          <SfHeading
            class="_step-title -required"
            :level="2"
            title="Enter your email address"
            :ref="getFieldAnchorName('email')"
          />

          <validation-provider
            v-slot="{ errors }"
            rules="required|email"
            name="'Email'"
            tag="div"
          >
            <SfInput
              name="email"
              type="email"
              v-model="email"
              placeholder="sample@email.com"
              :disabled="isSubmitting"
              :required="false"
              :valid="!errors.length"
              :error-message="errors[0]"
            />

            <div>{{ $t('Sometimes our team has questions about your design') }}</div>
          </validation-provider>
        </div>

        <m-form-errors
          class="_form-errors"
          :form-errors="formErrors"
          @item-click="goToFieldByName"
        />

        <div class="_actions">
          <SfButton
            class="_add-to-cart color-primary"
            type="submit"
            :disabled="isSubmitting"
            @click="shouldMakeAnother = false"
          >
            {{ submitButtonText }}
          </SfButton>

          <SfButton
            class="_add-to-cart-and-make-another color-secondary"
            type="submit"
            :disabled="isSubmitting"
            @click="shouldMakeAnother = true"
            v-show="!existingCartItem"
          >
            {{ $t('Save & Make Another') }}
          </SfButton>

          <div class="_agreement">
            {{ $t('I agree to') }}
            <router-link to="/terms-of-service/" target="_blank">
              {{ $t('Terms of Service') }},
            </router-link>

            <router-link to="/privacy-policy/" target="_blank">
              {{ $t('Privacy Policy') }}
            </router-link>,
            {{ $t('and') }} <a href="http://support.budsies.com/support/solutions/folders/5000249005" target="_blank">{{ $t('Refund Policy') }}</a>.
            {{ $t('I understand that Budsies happily takes care of all tears, defects, and shipping damage with either a refund or a repair.') }}
          </div>
        </div>
      </form>
    </validation-observer>

    <MBlockStory
      story-slug="buddy_pillow_creation_page_bottom"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Route } from 'vue-router';
import { PropType, Ref, ref, defineComponent, inject } from '@vue/composition-api';
import { mapMutations } from 'vuex';
import { notifications } from '@vue-storefront/core/modules/cart/helpers';
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate';
import { required, email } from 'vee-validate/dist/rules';
import { Logger } from '@vue-storefront/core/lib/logger';
import i18n from '@vue-storefront/i18n';
import { localizedRoute } from '@vue-storefront/core/lib/multistore';
import * as catalogTypes from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import {
  SfButton,
  SfDivider,
  SfInput,
  SfModal,
  SfHeading,
  SfSelect
} from '@storefront-ui/vue';
import { BundleOption } from 'core/modules/catalog/types/BundleOption';
import Product from 'core/modules/catalog/types/Product';

import { ImageHandlerService, Item } from 'src/modules/file-storage';
import { CustomerImage, getProductDefaultPrice } from 'src/modules/shared';
import {
  vuexTypes as budsiesTypes,
  Bodypart,
  ImageUploadMethod,
  BodyPartValueContentType,
  ProductValue,
  BodypartOption
} from 'src/modules/budsies';
import ServerError from 'src/modules/shared/types/server-error';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';
import { getSelectedBundleOptions } from '@vue-storefront/core/modules/catalog/helpers/bundleOptions';
import { setBundleProductOptionsAsync } from '@vue-storefront/core/modules/catalog/helpers';

import ACustomProductQuantity from '../atoms/a-custom-product-quantity.vue';
import MArtworkUpload from '../molecules/m-artwork-upload.vue';
import MBodypartOptionConfigurator from '../molecules/m-bodypart-option-configurator.vue';
import MPlushieSizeSelector from '../molecules/m-plushie-size-selector.vue';
import MFormErrors from '../molecules/m-form-errors.vue';
import SizeOption from '../interfaces/size-option';
import ProductionTimeOption from '../interfaces/production-time-option.interface';
import getProductionTimeOptions from '../../helpers/get-production-time-options';
import MBlockStory from 'theme/components/molecules/m-block-story.vue';
import MProductionTimeSelector from 'theme/components/molecules/m-production-time-selector.vue';
import { useFormValidation } from 'theme/helpers/use-form-validation';
import getCurrentThemeClass from 'theme/helpers/get-current-theme-class';
import { usePersistedEmail } from 'src/modules/persisted-customer-data';

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

extend('email', {
  ...email,
  message: 'Please, provide the correct email address'
});

export default defineComponent({
  name: 'OPillowProductOrderForm',
  setup (_, setupContext) {
    const imageHandlerService = inject<ImageHandlerService>('ImageHandlerService');
    const window = inject<Window>('WindowObject');

    const validationObserver: Ref<InstanceType<typeof ValidationObserver> | null> = ref(null);

    if (!window) {
      throw new Error('Window is not defined');
    }

    if (!imageHandlerService) {
      throw new Error('ImageHandlerService is not defined');
    }

    const email = ref<string | undefined>(undefined);

    return {
      imageHandlerService,
      validationObserver,
      window,
      ...useFormValidation(
        validationObserver,
        () => setupContext.refs
      ),
      email,
      ...usePersistedEmail(email)
    }
  },
  components: {
    MBodypartOptionConfigurator,
    ValidationObserver,
    ValidationProvider,
    ACustomProductQuantity,
    MArtworkUpload,
    SfButton,
    SfDivider,
    SfInput,
    SfModal,
    SfHeading,
    SfSelect,
    MBlockStory,
    MProductionTimeSelector,
    MPlushieSizeSelector,
    MFormErrors
  },
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
    }
  },
  data () {
    return {
      quantity: 1,
      customerImage: undefined as CustomerImage | undefined,
      size: undefined as SizeOption | undefined,
      bodypartsValues: {} as unknown as Record<string, BodypartOption | BodypartOption[] | undefined>,
      isSubmitting: false,
      shouldMakeAnother: false,
      uploadMethod: ImageUploadMethod.NOW,
      productionTime: undefined as ProductionTimeOption | undefined,
      plushieId: undefined as number | undefined,
      initialCustomerImages: [] as CustomerImage[]
    }
  },
  computed: {
    skinClass (): string {
      return getCurrentThemeClass();
    },
    isUploadNow (): boolean {
      return this.uploadMethod === ImageUploadMethod.NOW;
    },
    backendProductId (): ProductValue | undefined {
      switch (this.product.id) {
        case 273:
          return ProductValue.PILLOW;
        default:
          throw new Error(
            `Can't resolve Backend product ID for Magento '${this.product.id}' product ID`
          );
      }
    },
    bodyparts (): Bodypart[] {
      return this.$store.getters['budsies/getProductBodyparts'](this.product.id);
    },
    productionTimeBundleOption (): BundleOption | undefined {
      if (!this.product?.bundle_options) {
        return undefined;
      }

      return this.product.bundle_options.find(item => item.title.toLowerCase() === 'production time');
    },
    productionTimeOptions (): ProductionTimeOption[] {
      if (!this.productionTimeBundleOption) {
        return []
      }

      return getProductionTimeOptions(this.productionTimeBundleOption, this.product, this.$store);
    },
    sizeBundleOption (): BundleOption | undefined {
      if (!this.product?.bundle_options) {
        return undefined;
      }

      return this.product.bundle_options.find(item => item.title.toLowerCase() === 'product');
    },
    sizes (): SizeOption[] {
      if (!this.sizeBundleOption) {
        return [];
      }

      let availableSizes: SizeOption[] = [];
      for (const productLink of this.sizeBundleOption.product_links) {
        if (!productLink.product) {
          continue;
        }

        const price = getProductDefaultPrice(productLink.product, {}, false);

        availableSizes.push({
          id: String(productLink.product.id),
          label: productLink.product.name,
          finalPrice: price.special ? price.special : price.regular,
          specialPrice: price.special,
          regularPrice: price.regular,
          value: productLink.product.sku,
          isSelected: false,
          contentTypeId: BodyPartValueContentType.IMAGE,
          image: productLink.product.image,
          optionId: this.sizeBundleOption.option_id,
          optionValueId: productLink.id.toString(),
          group: 'default'
        });
      }

      return availableSizes;
    },
    shortcode (): string | undefined {
      return this.$store.getters['budsies/getPlushieShortcode'](this.plushieId);
    },
    cartItems (): CartItem[] {
      return this.$store.getters['cart/getCartItems'];
    },
    existingCartItem (): CartItem | undefined {
      if (!this.existingPlushieId) {
        return;
      }

      return this.cartItems.find((item) => item.plushieId && item.plushieId === this.existingPlushieId);
    },
    getBodypartOptions (): (id: string) => BodypartOption[] {
      return this.$store.getters['budsies/getBodypartOptions']
    },
    submitButtonText (): string {
      return (
        this.existingCartItem
          ? this.$t('Update')
          : this.$t('Add to Cart')
      ).toString();
    },
    showProductionTimeOptions (): boolean {
      return this.productionTimeOptions.length > 0;
    },
    showEmailStep (): boolean {
      return !this.hasPrefilledEmail;
    }
  },
  async mounted (): Promise<void> {
    if (this.existingCartItem) {
      this.fillPlushieDataFromCartItem(this.existingCartItem);
      return;
    } else if (this.existingPlushieId) {
      await this.clearExistingPlushieId();
    }

    this.plushieId = await this.createPlushie();
  },
  methods: {
    ...mapMutations('product', {
      setBundleOptionValue: catalogTypes.PRODUCT_SET_BUNDLE_OPTION
    }),
    async addToCart (): Promise<void> {
      const shouldMakeAnother = this.shouldMakeAnother;
      this.shouldMakeAnother = false;

      await this.$store.dispatch(
        'product/setBundleOptions',
        { product: this.product, bundleOptions: this.$store.state.product.current_bundle_options }
      );

      try {
        await this.$store.dispatch('cart/addItem', {
          productToAdd: Object.assign({}, this.product, {
            qty: this.quantity,
            plushieId: this.plushieId + '',
            email: this.email,
            bodyparts: this.getBodypartsData(),
            customerImages: this.isUploadNow && this.customerImage ? [this.customerImage] : [],
            uploadMethod: this.uploadMethod
          })
        });

        this.persistLastUsedCustomerEmail(this.email);
      } catch (error) {
        if (error instanceof ServerError) {
          throw error;
        }

        Logger.error(error, 'budsies')();
      }

      if (!shouldMakeAnother) {
        this.goToCrossSells();
        return;
      }

      this.onSuccessAndMakeAnother();
    },
    async fillPlushieDataFromCartItem (cartItem: CartItem): Promise<void> {
      const isPlushieExist = await this.checkExistingPlushie();

      if (!isPlushieExist) {
        return this.onCartItemPlushieRemoved();
      }

      this.quantity = cartItem.qty || 1;
      this.plushieId = Number(cartItem.plushieId);

      this.fillCustomerImagesFromCartItem(cartItem);
      this.fillSizeFromCartItem(cartItem);
      this.fillBodypartsValuesFromCartItem(cartItem);
      this.fillProductionTimeFromCartItem(cartItem);
    },
    fillBodypartsValuesFromCartItem (cartItem: CartItem): void {
      this.bodypartsValues = {};

      if (!cartItem.bodyparts) {
        return;
      }

      const bodyparts: Record<string, any[]> = cartItem.bodyparts as Record<string, any[]>;

      Object.keys(bodyparts).forEach((key: string) => {
        Vue.set(
          this.bodypartsValues,
          key,
          this.getBodypartOptions(key).filter(
            (bodypartOption: BodypartOption) => bodyparts[key].includes(bodypartOption.id) ||
              bodyparts[key].includes(Number(bodypartOption.id))
          )
        );
      });
    },
    fillCustomerImagesFromCartItem (cartItem: CartItem): void {
      this.customerImage = cartItem.customerImages ? cartItem.customerImages[0] : undefined;
      this.initialCustomerImages = this.customerImage ? [this.customerImage] : [];
      this.uploadMethod = cartItem.uploadMethod as ImageUploadMethod || ImageUploadMethod.NOW;

      const artworkUploadComponent = this.getArtworkUploadComponent();

      if (!artworkUploadComponent) {
        return;
      }

      this.$nextTick(() => {
        artworkUploadComponent.initFiles();
      });
    },
    fillProductionTimeFromCartItem (cartItem: CartItem): void {
      const productOption = cartItem.product_option;
      this.productionTime = undefined;

      if (!this.productionTimeBundleOption || !productOption) {
        return;
      }

      if (this.productionTimeOptions.length) {
        this.productionTime = this.productionTimeOptions[0];
      }

      if (!productOption.extension_attributes.bundle_options[this.productionTimeBundleOption.option_id]) {
        return;
      }

      const selectedOptionValueId = productOption.extension_attributes.bundle_options[this.productionTimeBundleOption.option_id].option_selections[0];
      this.productionTime = this.productionTimeOptions.find((item) => item.optionValueId === selectedOptionValueId);
    },
    fillSizeFromCartItem (cartItem: CartItem): void {
      const selectedBundleOptions = getSelectedBundleOptions(cartItem);

      if (!this.sizes.length || !selectedBundleOptions.length) {
        this.size = undefined;
        return;
      }

      const selectedSize: SizeOption | undefined = this.sizes.find(
        (sizeOption) => selectedBundleOptions.find(
          (selectedOption) => selectedOption.option_id === sizeOption.optionId &&
          selectedOption.option_selections.includes(Number.parseInt(sizeOption.optionValueId))
        )
      );

      this.size = selectedSize;
    },
    getArtworkUploadComponent (): InstanceType<typeof MArtworkUpload> | undefined {
      return this.$refs['artwork-upload'] as InstanceType<typeof MArtworkUpload> | undefined;
    },
    getBodypartsData (): Record<string, string[]> {
      let data: Record<string, string[]> = {};

      for (const bodyPartId in this.bodypartsValues) {
        let value = this.bodypartsValues[bodyPartId];

        if (value === undefined) {
          continue;
        }

        if (!Array.isArray(value)) {
          value = [value]
        }

        data[bodyPartId] = value.map(item => item.id);
      }

      return data;
    },
    getUploader (): InstanceType<typeof MArtworkUpload> | undefined {
      return this.$refs['artwork-upload'] as InstanceType<typeof MArtworkUpload> | undefined;
    },
    goToCrossSells (): void {
      this.$router.push(localizedRoute({
        name: 'cross-sells',
        params: {
          parentSku: this.product.sku
        }
      }));
    },
    goToCart (): void {
      this.$router.push(localizedRoute({
        name: 'detailed-cart'
      }));
    },
    resetForm (): void {
      this.quantity = this.product.qty || 1;
      this.customerImage = undefined;
      this.uploadMethod = ImageUploadMethod.NOW;
      this.size = undefined;
      this.plushieId = undefined;

      for (const bodypart of this.bodyparts) {
        this.bodypartsValues[bodypart.id] = undefined;
      }

      const uploader = this.getUploader();
      if (uploader) {
        uploader.clearInput();
      }

      this.productionTime = undefined;
      if (this.productionTimeOptions.length) {
        this.productionTime = this.productionTimeOptions[0];
      }

      this.validationObserver?.reset();
    },
    switchToUploadNow (): void {
      if (this.isSubmitting) {
        return;
      }

      this.uploadMethod = ImageUploadMethod.NOW;
    },
    switchToUploadLater (): void {
      if (this.isSubmitting) {
        return;
      }

      this.uploadMethod = ImageUploadMethod.EMAIL;
    },
    toggleUploadMethod (): void {
      if (this.isSubmitting) {
        return;
      }

      this.uploadMethod = this.uploadMethod === ImageUploadMethod.EMAIL ? ImageUploadMethod.NOW : ImageUploadMethod.EMAIL;
    },
    onArtworkAdd (value: Item): void {
      this.customerImage = {
        id: value.id,
        url: this.imageHandlerService.getOriginalImageUrl(value.url)
      };
    },
    onArtworkRemove (storageItemId: string): void {
      this.customerImage = undefined;
    },
    async onSubmit (): Promise<void> {
      if (this.isSubmitting) {
        return;
      }

      const isValid = await this.validateAndGoToFirstError();

      if (!isValid) {
        return;
      }

      this.isSubmitting = true;

      try {
        if (!this.existingCartItem) {
          await this.addToCart();
        } else {
          await this.updateExistingCartItem(this.existingCartItem);
        }
      } catch (error) {
        Logger.error(error, 'budsies')();

        this.onFailure('Unexpected error: ' + error);
      } finally {
        this.isSubmitting = false;
      }
    },
    onFailure (message: any): void {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: message,
        action1: { label: i18n.t('OK') }
      });
    },
    async onSuccessAndMakeAnother (): Promise<void> {
      this.resetForm();
      this.window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

      const notification = notifications.createNotification({
        type: 'info',
        message: 'Product was added to the cart',
        timeToLive: 5 * 1000
      });

      this.$store.dispatch(
        'notification/spawnNotification',
        notification,
        { root: true }
      );

      this.plushieId = await this.createPlushie();
    },
    async createPlushie (): Promise<number> {
      if (!this.product) {
        throw new Error('Current product is not set!');
      }

      const task = await this.$store.dispatch(
        'budsies/createNewPlushie',
        {
          productId: this.product.id
        }
      );
      return task.result;
    },
    async updateClientAndServerItem (payload: {
      product: CartItem,
      forceUpdateServerItem?: boolean,
      forceClientState?: boolean
    }): Promise<void> {
      await this.$store.dispatch('cart/updateClientAndServerItem', payload);
    },
    async updateExistingCartItem (existingCartItem: CartItem): Promise<void> {
      try {
        const isPlushieExist = await this.checkExistingPlushie();

        if (!isPlushieExist) {
          return this.onCartItemPlushieRemoved();
        }

        await this.updateClientAndServerItem({
          product: Object.assign({}, existingCartItem, {
            qty: this.quantity,
            plushieId: existingCartItem.plushieId,
            email: this.email,
            bodyparts: this.getBodypartsData(),
            customerImages: this.isUploadNow && this.customerImage ? [this.customerImage] : [],
            uploadMethod: this.uploadMethod,
            product_option: setBundleProductOptionsAsync(
              null,
              {
                product: existingCartItem,
                bundleOptions: this.$store.state.product.current_bundle_options
              }
            )
          }),
          forceUpdateServerItem: true
        });
      } catch (error) {
        if (error instanceof ServerError) {
          throw error;
        }

        Logger.error(error, 'budsies')();
      }

      this.goToCart();
    },
    async checkExistingPlushie (): Promise<boolean> {
      if (!this.existingPlushieId) {
        return false;
      }

      const response = await this.$store.dispatch(
        'budsies/fetchPlushieById',
        { plushieId: this.existingPlushieId }
      );

      if (response.resultCode !== 200 || !response.result) {
        return false;
      }

      return true;
    },
    async onCartItemPlushieRemoved (): Promise<void> {
      await this.$store.dispatch('cart/pullServerCart');

      this.resetForm();
      this.window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      this.showRemovedCartItemNotification();
      await this.clearExistingPlushieId();

      this.plushieId = await this.createPlushie();
    },
    showRemovedCartItemNotification (): void {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'warning',
        message: i18n.t('Looks like this cart item was removed'),
        action1: { label: i18n.t('OK') }
      });
    },
    clearExistingPlushieId (): Promise<Route> {
      return this.$router.push({ query: { ...this.$route.query, existingPlushieId: undefined } });
    }
  },
  created (): void {
    this.resetForm();
  },
  watch: {
    size: {
      handler (newValue: SizeOption | undefined) {
        if (!this.sizeBundleOption) {
          Logger.error('sizeBundleOption is not defined while attempt to set size was performed', 'budsies')();
          return
        }

        this.setBundleOptionValue({
          optionId: this.sizeBundleOption.option_id,
          optionQty: 1,
          optionSelections: newValue ? [newValue.optionValueId] : []
        });
      },
      immediate: false
    },
    productionTime: {
      handler (newValue: ProductionTimeOption | undefined) {
        if (!this.productionTimeBundleOption) {
          Logger.error('productionTimeBundleOption is not defined while attempt to set it was performed', 'budsies')();
          return
        }

        this.setBundleOptionValue({
          optionId: this.productionTimeBundleOption.option_id,
          optionQty: 1,
          optionSelections: newValue?.optionValueId ? [newValue.optionValueId] : []
        });
      },
      immediate: false
    },
    plushieId: {
      handler () {
        if (!this.plushieId) {
          return;
        }

        this.$store.dispatch('budsies/loadPlushieShortcode', { plushieId: this.plushieId });
      },
      immediate: true
    },
    existingPlushieId (value): void {
      if (!this.existingCartItem) {
        if (value) {
          this.clearExistingPlushieId();
        }
        return;
      }

      this.fillPlushieDataFromCartItem(this.existingCartItem);
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "~@storefront-ui/shared/styles/helpers/typography";
@import "~@storefront-ui/shared/styles/helpers/layout";
@import "~@storefront-ui/shared/styles/components/atoms/SfHeading";
@import "theme/css/mixins/body-part";

.o-pillow-product-order-form {
  text-align: center;

  b,
  strong {
    font-weight: var(--font-semibold);
  }

  ._form {
    margin-top: var(--spacer-lg);
  }

  ._step-divider {
    display: none;
  }

  ._step-number {
    display: inline-block;
    margin-top: var(--spacer-lg);
    text-transform: uppercase;
    color: var(--_c-light-primary);
    font-size: var(--font-xl);
    font-weight: var(--font-semibold);
    @include border(--step-border, 0 0 4px 0, solid, var(--_c-light-primary));
  }

  ._step-title {
    margin-top: var(--spacer-base);
    --heading-title-font-size: var(--font-xl);
    --heading-title-font-weight: var(--font-semibold);

    &.-required {
      ::v-deep .sf-heading__title::after {
        color: var(--c-danger-variant);
        content: "*";
      }
    }
  }

  ._popup-content {
    text-align: left;
  }

  .sf-input {
    --input-width: 20em;

    max-width: 100%;
    text-align: center;
    display: inline-block;
  }

  .sf-divider {
    margin-top: var(--spacer-xl);
  }

  .m-bodypart-option-configurator,
  .m-plushie-size-selector {
    margin-top: var(--spacer-base);
  }

  .m-artwork-upload {
    margin: var(--spacer-lg) auto;
    max-width: 610px;
  }

  ._qty-container {
      margin-top: var(--spacer-xs);
  }

  ._actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: var(--spacer-xl);

    ._add-to-cart-and-make-another {
      margin: var(--spacer-lg) 0 0 0;
      font-size: var(--font-sm);
    }
  }

  ._qty-container {
      ::v-deep ._quantity {
          ._header {
              font-weight: 800;
          }
      }
  }

  ._error-text {
    font-size: var(--font-xs);
    margin-top: var(--spacer-xs);
    height: calc(var(--font-xs) * 1.2);
  }

  ._form-errors {
    margin-top: var(--spacer-xl);
  }

  ._agreement {
    margin: var(--spacer-xl) auto 0;
    font-size: var(--font-xs);
    text-align: left;
    max-width: 45rem;
  }

  ._production-time-selector-section {
    margin-top: var(--spacer-xl);
  }

  &.-skin-petsies,
  &.-skin-budsies {
      ._error-text {
          color: var(--c-danger-variant);
      }
  }

  &.-skin-budsies {
    ._body-part-heading {
      @include heading-background;
    }

    ._step-number {
      color: var(--c-danger);
      @include border(--step-border, 0 0 4px 0, solid, var(--c-danger));
    }

    ._artwork-upload-helper {
      font-size: var(--font-xs);
    }
  }

  @media (min-width: $tablet-min) {
    ._step-divider {
      display: block;
    }
  }

@include for-desktop {
  .sf-modal {
    --modal-top: 50%;
  }
}

}
</style>
