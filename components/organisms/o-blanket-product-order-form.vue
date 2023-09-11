<template>
  <div class="o-blanket-product-order-form">
    <div class="_info">
      <div class="_zoom-gallery-container">
        <SfHeading
          :title="product.name"
          :level="1"
          class="_product-name-mobile sf-heading--left"
        />

        <m-zoom-gallery class="_gallery" :images="galleryImages" />
      </div>

      <div class="_form-container">
        <SfHeading :title="product.name" :level="1" class="sf-heading--left _product-name-desktop" />

        <div class="_short-description" v-html="shortDescription" />

        <a-custom-price
          class="_price"
          :regular="regularPrice"
          :special-price="specialPrice"
        />

        <validation-observer
          v-slot="{ errors: formErrors }"
          slim
          ref="validationObserver"
        >
          <form @submit.prevent="onSubmit">
            <div class="_step">
              <div
                class="_step-title"
                :ref="getFieldAnchorName('Design Option')"
              >
                {{ $t('Select design') }}
              </div>

              <validation-provider
                v-slot="{errors}"
                rules="required"
                name="'Design Option'"
                mode="passive"
                tag="div"
                ref="design-option-validation-provider"
              >
                <m-design-selector
                  class="_design-selector"
                  :value="selectedDesign"
                  :design-products="designProductOptions"
                  :disabled="isDisabled"
                  field-name="design-product-sku"
                  @input="onDesignSelect"
                />

                <div class="_error-text">
                  {{ errors[0] }}
                </div>
              </validation-provider>
            </div>

            <div class="_step">
              <div
                class="_step-title"
                :ref="getFieldAnchorName('Photo')"
              >
                {{ $t('Upload photo') }}
              </div>

              <validation-provider
                v-slot="{ errors }"
                name="'Photo'"
                tag="div"
              >
                <input
                  type="hidden"
                  :value="customerImageId"
                  required
                >

                <m-artwork-upload
                  ref="artwork-upload"
                  :product-id="backendProductId"
                  :upload-url="artworkUploadUrl"
                  :disabled="isDisabled"
                  :initial-items="artworkUploadInitialItems"
                  @file-added="onArtworkAdd"
                  @file-removed="onArtworkRemove"
                  @is-busy-changed="onArtworkUploadBusyStatusChanged"
                />

                <div class="_error-text">
                  {{ errors[0] }}
                </div>
              </validation-provider>
            </div>

            <div class="_step">
              <div
                class="_step-title"
                :ref="getFieldAnchorName('Size Option')"
              >
                {{ $t('Select size and material') }}
              </div>

              <validation-provider
                v-slot="{ errors }"
                rules="required"
                name="'Size Option'"
                tag="div"
              >
                <SfSelect
                  class="sf-select--underlined"
                  name="size_option"
                  required
                  v-model="selectedSizeOption"
                  :size="10"
                  :disabled="isDisabled"
                  :should-lock-scroll-on-open="isMobile"
                >
                  <SfSelectOption
                    v-for="option in sizeOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SfSelectOption>
                </SfSelect>

                <div class="_error-text">
                  {{ errors[0] }}
                </div>
              </validation-provider>

              <validation-provider
                v-slot="{ errors, classes }"
                rules="required"
                :name="'Quantity'"
                slim
              >
                <div
                  class="_quantity-field"
                  :class="classes"
                  :ref="getFieldAnchorName('Quantity')"
                >
                  <a-custom-product-quantity
                    v-model="quantity"
                    class="_qty-container"
                    :disabled="isSubmitting"
                  />

                  <div class="_error-text">
                    {{ errors[0] }}
                  </div>
                </div>
              </validation-provider>

              <m-form-errors
                class="_form-errors"
                :form-errors="formErrors"
                @item-click="goToFieldByName"
              />

              <div class="_actions">
                <SfButton
                  class="_add-to-cart color-primary"
                  type="submit"
                  :disabled="isSubmitButtonDisabled"
                >
                  Add to Cart
                </SfButton>
              </div>
            </div>
          </form>
        </validation-observer>
      </div>
    </div>

    <m-product-description-story
      class="_description-story"
      :product-sku="selectedDesign ? selectedDesign : product.sku"
      :backup-product-sku="product.parentSku"
      :title="$t('Product Details').toString()"
    />
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent, ref, Ref, inject } from '@vue/composition-api';
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import { mapGetters, mapMutations } from 'vuex';
import { SfButton, SfHeading, SfSelect } from '@storefront-ui/vue';
import { mapMobileObserver } from '@storefront-ui/vue/src/utilities/mobile-observer';

import { Logger } from '@vue-storefront/core/lib/logger';
import { localizedRoute } from '@vue-storefront/core/lib/multistore';
import { getSelectedBundleOptions } from '@vue-storefront/core/modules/catalog/helpers/bundleOptions';
import { PRODUCT_SET_BUNDLE_OPTION } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import { BundleOption, BundleOptionsProductLink } from '@vue-storefront/core/modules/catalog/types/BundleOption';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { getThumbnailForProduct } from '@vue-storefront/core/modules/cart/helpers';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';
import { getProductGallery as getGalleryByProduct, setBundleProductOptionsAsync } from '@vue-storefront/core/modules/catalog/helpers';

import { ProductValue, Dictionary } from 'src/modules/budsies';
import { ImageHandlerService, Item } from 'src/modules/file-storage';
import { CustomerImage, getProductDefaultPrice, ServerError } from 'src/modules/shared';
import ZoomGalleryImage from 'theme/interfaces/zoom-gallery-image.interface';
import { useFormValidation } from 'theme/helpers/use-form-validation';

import DesignProduct from '../interfaces/design-product.interface';
import GalleryProductImages from '../interfaces/gallery-product-images.interface';

import ACustomPrice from '../atoms/a-custom-price.vue';
import ACustomProductQuantity from '../atoms/a-custom-product-quantity.vue';
import MArtworkUpload from '../molecules/m-artwork-upload.vue';
import MDesignSelector from '../molecules/m-design-selector.vue';
import MProductDescriptionStory from '../molecules/m-product-description-story.vue';
import MZoomGallery from '../molecules/m-zoom-gallery.vue';
import MFormErrors from '../molecules/m-form-errors.vue';

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

interface SizeOption {
  value: string,
  label: string
}

const DESIGN_BUNDLE_OPTION_TITLE = 'product';
const SIZE_BUNDLE_OPTION_TITLE = 'size';
const DESIGN_PROCESSING_LEVEL_BUNDLE_OPTION_TITLE = 'design processing level';

export default defineComponent({
  name: 'OBlanketProductOrderForm',
  setup (_, setupContext) {
    const imageHandlerService = inject<ImageHandlerService>('ImageHandlerService');
    const validationObserver: Ref<InstanceType<typeof ValidationObserver> | null> = ref(null);

    if (!imageHandlerService) {
      throw new Error('ImageHandlerService is not defined');
    }

    return {
      imageHandlerService,
      validationObserver,
      ...useFormValidation(
        validationObserver,
        () => setupContext.refs
      )
    }
  },
  components: {
    SfButton,
    SfHeading,
    SfSelect,
    MZoomGallery,
    ACustomPrice,
    ValidationObserver,
    ValidationProvider,
    MDesignSelector,
    MArtworkUpload,
    ACustomProductQuantity,
    MProductDescriptionStory,
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
    selectedDesign: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    existingCartItem: {
      type: Object as PropType<CartItem | undefined>,
      default: undefined
    }
  },
  data () {
    return {
      quantity: 1,
      customerImage: undefined as CustomerImage | undefined,
      isSubmitting: false,
      artworkUploadInitialItems: [] as CustomerImage[],
      selectedSizeOption: undefined as string | undefined,
      isArtworkUploaderBusy: false
    }
  },
  computed: {
    ...mapMobileObserver(),
    ...mapGetters({
      getProductGallery: 'product/getProductGallery'
    }),
    availableDesignsProductDictionary (): Dictionary<Product> {
      return this.getProductsByBundleOption(this.designBundleOption);
    },
    backendProductId (): ProductValue {
      switch (this.product.id) {
        case 487:
          return ProductValue.RENAISSANCE_BLANKETS;
        case 504:
          return ProductValue.CUT_OUT_BLANKETS;
        default:
          throw new Error(
            `Can't resolve Backend product id for Magento '${this.product.id}' product ID`
          );
      }
    },
    defaultDesignProduct (): Product | undefined {
      if (!this.designBundleOption) {
        return;
      }

      const defaultLink = this.designBundleOption.product_links.find(
        (productLink) => productLink.is_default
      );

      if (!defaultLink) {
        return;
      }

      return defaultLink.product;
    },
    designBundleOption (): BundleOption | undefined {
      if (!this.product.bundle_options) {
        return;
      }

      return this.product.bundle_options.find(
        (bundleOption) => bundleOption.title.toLowerCase() === DESIGN_BUNDLE_OPTION_TITLE
      );
    },
    designProcessingLevelBundleOption (): BundleOption | undefined {
      if (!this.product.bundle_options) {
        return;
      }

      return this.product.bundle_options.find(
        (bundleOption) => bundleOption.title.toLowerCase() === DESIGN_PROCESSING_LEVEL_BUNDLE_OPTION_TITLE
      )
    },
    designProductOptions (): DesignProduct[] {
      const designs: DesignProduct[] = [];

      if (!this.designBundleOption) {
        return designs;
      }

      for (const productLink of this.designBundleOption.product_links) {
        if (!productLink.product) {
          continue;
        }

        const product = productLink.product;

        designs.push({
          id: Number(product.id),
          sku: product.sku,
          name: product.name,
          thumbnail: getThumbnailForProduct(product as any),
          price: 0,
          images: [],
          optionId: this.designBundleOption.option_id.toString(),
          optionValueId: productLink.id.toString()
        })
      }
      return designs;
    },
    galleryImages (): ZoomGalleryImage[] {
      const productImages = this.productImages.find(
        (item) => item.sku === this.selectedDesign
      );

      if (
        !productImages ||
        !productImages.images.length ||
        !this.selectedDesign
      ) {
        return this.productImages[0]['images'];
      }

      return productImages['images'];
    },
    isDisabled (): boolean {
      return this.isSubmitting;
    },
    isSubmitButtonDisabled (): boolean {
      return this.isDisabled || this.isArtworkUploaderBusy;
    },
    productImages (): GalleryProductImages[] {
      const images = this.getProductGallery.map((imageObject: any) => ({
        stage: imageObject.src,
        thumb: imageObject.src,
        big: imageObject.src
      }));

      let result: GalleryProductImages[] = [
        {
          sku: this.product.sku,
          images: images
        }
      ]

      if (!this.designBundleOption) {
        return result;
      }

      for (const productLink of this.designBundleOption.product_links) {
        if (!productLink.product) {
          continue;
        }

        const gallery = getGalleryByProduct(productLink.product);

        const images = gallery.map((imageObject: any) => ({
          stage: imageObject.src,
          thumb: imageObject.src,
          big: imageObject.src
        }));

        result.push({
          sku: productLink.product.sku,
          images: images
        });
      }

      return result;
    },
    regularPrice (): number {
      return this.totalPrice.regular;
    },
    selectedDesignProduct (): Product | undefined {
      if (!this.selectedDesign) {
        return;
      }

      return this.availableDesignsProductDictionary[this.selectedDesign];
    },
    selectedDesignProductPrice (): { regular: number | string, special: number | string } {
      if (!this.selectedDesignProduct) {
        return getProductDefaultPrice(this.defaultDesignProduct, {}, false);
      }

      return getProductDefaultPrice(this.selectedDesignProduct, {}, false);
    },
    selectedSizeProduct (): Product | undefined {
      if (!this.selectedSizeOption || !this.sizeBundleOption) {
        return;
      }

      const productLink = this.sizeBundleOption.product_links.find(
        (productLink) => productLink.id === this.selectedSizeOption
      );

      if (!productLink) {
        return;
      }

      return productLink.product;
    },
    shortDescription (): string | undefined {
      if (!this.selectedDesignProduct || !this.selectedDesignProduct.short_description) {
        return this.product.short_description;
      }

      return this.selectedDesignProduct.short_description;
    },
    sizeBundleOption (): BundleOption | undefined {
      if (!this.product.bundle_options) {
        return;
      }

      return this.product.bundle_options.find(
        (bundleOption) => bundleOption.title.toLowerCase() === SIZE_BUNDLE_OPTION_TITLE
      );
    },
    sizeOptions (): SizeOption[] {
      const sizeOptions: SizeOption[] = [];

      if (!this.sizeBundleOption) {
        return [];
      }

      for (const productLink of this.sizeBundleOption.product_links) {
        sizeOptions.push({
          value: productLink.id.toString(),
          label: this.getLabelForSizeOptionByProductLink(productLink)
        })
      }

      return sizeOptions;
    },
    specialPrice (): number {
      return this.totalPrice.special;
    },
    totalPrice (): {regular: number, special: number} {
      const sizePrice = getProductDefaultPrice(this.selectedSizeProduct, {}, false);

      return {
        regular: this.selectedDesignProductPrice.regular + sizePrice.regular,
        special: this.selectedDesignProductPrice.special + sizePrice.special
      }
    },
    customerImageId (): string | undefined {
      return this.customerImage?.id;
    }
  },
  created () {
    if (this.existingCartItem) {
      this.fillExistingCartItemData(this.existingCartItem);
      return;
    }

    this.fillDefaultSelectedSizeOption();
  },
  methods: {
    ...mapMutations('product', {
      setBundleOptionValue: PRODUCT_SET_BUNDLE_OPTION
    }),
    async addToCart (): Promise<void> {
      if (this.isSubmitting) {
        return;
      }

      this.setDesignProcessingLevel();

      this.isSubmitting = true;

      await this.$store.dispatch(
        'product/setBundleOptions',
        { product: this.product, bundleOptions: this.$store.state.product.current_bundle_options }
      );

      try {
        try {
          await this.$store.dispatch('cart/addItem', {
            productToAdd: Object.assign({}, this.product, {
              qty: this.quantity,
              customerImages: [this.customerImage],
              uploadMethod: 'upload-now'
            })
          });
        } catch (err) {
          if (err instanceof ServerError) {
            throw err;
          }

          Logger.error(err, 'budsies')();
        }

        this.onSuccessAddToCart();
      } catch (err) {
        Logger.error(err, 'budsies')();

        this.onFailure('Unexpected error: ' + err);
      } finally {
        this.isSubmitting = false;
      }
    },
    clearArtworkUploader (): void {
      const artworkUpload = this.getArtworkUploader();

      if (!artworkUpload) {
        return;
      }

      artworkUpload.clearInput();
    },
    fillDefaultSelectedSizeOption (): void {
      const defaultSizeProductLink = this.sizeBundleOption?.product_links[0];

      if (!defaultSizeProductLink) {
        return;
      }

      this.selectedSizeOption = defaultSizeProductLink.id.toString();
    },
    fillEmptyCustomerImage (): void {
      this.customerImage = undefined;
      this.artworkUploadInitialItems = [];
      this.clearArtworkUploader();
    },
    fillExistingCartItemCustomerImage (cartItem: CartItem): void {
      if (!cartItem.customerImages?.length) {
        this.fillEmptyCustomerImage();
        return;
      }

      this.customerImage = cartItem.customerImages[0];
      this.artworkUploadInitialItems = cartItem.customerImages;
    },
    fillExistingCartItemSize (cartItem: CartItem): void {
      if (!this.sizeBundleOption) {
        this.fillDefaultSelectedSizeOption();
        return;
      }

      const selectedBundleOptions = getSelectedBundleOptions(cartItem);
      const selectedSizeOptions = selectedBundleOptions.find(
        (option) => option.option_id === this.sizeBundleOption.option_id
      );

      if (!selectedSizeOptions || !selectedSizeOptions.option_selections[0]) {
        return;
      }

      this.selectedSizeOption = selectedSizeOptions.option_selections[0].toString();
    },
    fillExistingCartItemData (cartItem: CartItem): void {
      this.fillExistingCartItemCustomerImage(cartItem);
      this.fillExistingCartItemSize(cartItem);
      this.fillExistingQuantity(cartItem);
    },
    fillExistingQuantity (cartItem: CartItem): void {
      this.quantity = cartItem.qty;
    },
    getArtworkUploader (): InstanceType<typeof MArtworkUpload> | undefined {
      return this.$refs['artwork-upload'] as InstanceType<typeof MArtworkUpload> | undefined;
    },
    getDesignOptionValidationProvider (): InstanceType<typeof ValidationProvider> | undefined {
      return this.$refs['design-option-validation-provider'] as InstanceType<typeof ValidationProvider> | undefined;
    },
    getLabelForSizeOptionByProductLink (productLink: BundleOptionsProductLink): string {
      if (!productLink.product) {
        throw new Error('Product is undefined for product link');
      }

      const finalDesignPrice = this.selectedDesignProductPrice.special ? this.selectedDesignProductPrice.special : this.selectedDesignProductPrice.regular;
      const sizePrice = getProductDefaultPrice(productLink.product, {}, false);
      const finalSizePrice = sizePrice.special ? sizePrice.special : sizePrice.regular;

      return `${productLink.product.name} $${finalDesignPrice + finalSizePrice}`
    },
    getProductsByBundleOption (bundleOption: BundleOption | undefined): Dictionary<Product> {
      const products: Dictionary<Product> = {};

      if (!bundleOption) {
        return products;
      }

      for (const productLink of bundleOption.product_links) {
        const product = productLink.product;

        if (!product) {
          continue;
        }

        products[product.sku] = product;
      }

      return products;
    },
    goToCrossSells (): void {
      this.$router.push(localizedRoute({
        name: 'cross-sells',
        params: { parentSku: this.product.sku }
      }
      ));
    },
    onArtworkAdd (value: Item): void {
      this.customerImage = {
        id: value.id,
        url: this.imageHandlerService.getOriginalImageUrl(value.url)
      };
    },
    onArtworkRemove (): void {
      this.customerImage = undefined;
    },
    onArtworkUploadBusyStatusChanged (isBusy: boolean): void {
      this.isArtworkUploaderBusy = isBusy;
    },
    onDesignSelect (value?: string): void {
      this.$emit('design-selected', value);
    },
    onFailure (message: any): void {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: message,
        action1: { label: this.$t('OK') }
      });
    },
    onSuccessAddToCart (): void {
      this.resetData();
      this.goToCrossSells();
    },
    onSuccessExistingCartItemUpdate (): void {
      this.resetData();

      this.$router.push(localizedRoute({
        name: 'detailed-cart'
      }));
    },
    async onSubmit (): Promise<void> {
      const isValid = await this.validateAndGoToFirstError();

      if (!isValid) {
        return;
      }

      if (!this.existingCartItem) {
        void this.addToCart();
      } else {
        void this.updateExistingCartItem();
      }
    },
    resetData (): void {
      this.fillDefaultSelectedSizeOption();
      this.fillEmptyCustomerImage();
      this.onDesignSelect(undefined);
    },
    setDesignProcessingLevel (): void {
      if (!this.designProcessingLevelBundleOption) {
        throw new Error('Design processing level bundle option is not defined');
      }

      this.setBundleOptionValue({
        optionId: this.designProcessingLevelBundleOption.option_id,
        optionQty: 1,
        optionSelections: [this.designProcessingLevelBundleOption.product_links[0].id]
      });
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
        throw new Error('Cart item is not defined');
      }

      this.setDesignProcessingLevel();

      this.isSubmitting = true;

      try {
        try {
          await this.updateClientAndServerItem({
            product: Object.assign({}, this.existingCartItem, {
              qty: this.quantity,
              customerImages: [this.customerImage],
              product_option: setBundleProductOptionsAsync(null, { product: this.existingCartItem, bundleOptions: this.$store.state.product.current_bundle_options }),
              uploadMethod: 'upload-now'
            }),
            forceUpdateServerItem: true
          });
        } catch (err) {
          if (err instanceof ServerError) {
            throw err;
          }

          Logger.error(err, 'budsies')();
        }

        this.onSuccessExistingCartItemUpdate();
      } catch (err) {
        Logger.error(err, 'budsies')();

        this.onFailure('Unexpected error: ' + err);
      } finally {
        this.isSubmitting = false;
      }
    }
  },
  watch: {
    existingCartItem (newValue?: CartItem, oldValue?: CartItem) {
      if (oldValue && !newValue) {
        this.resetData();
      }

      if (newValue) {
        this.fillExistingCartItemData(newValue);
      }
    },
    selectedSizeOption: {
      immediate: true,
      handler (val: string | undefined, oldVal: string | undefined) {
        if (val === oldVal) {
          return;
        }

        if (!this.sizeBundleOption) {
          Logger.error('sizeBundleOption is not defined while attempt to set size was performed', 'budsies')();
          return;
        }

        if (!val) {
          this.fillDefaultSelectedSizeOption();
          return;
        }

        this.setBundleOptionValue({
          optionId: this.sizeBundleOption.option_id,
          optionQty: 1,
          optionSelections: val ? [val] : []
        });
      }
    },
    selectedDesign: {
      immediate: true,
      handler (val: string | undefined, oldVal: string | undefined) {
        if (val === oldVal) {
          return;
        }

        if (!this.designBundleOption) {
          Logger.error('designBundleOption is not defined while attempt to set design was performed', 'budsies')();
          return;
        }

        const selectedDesign = this.designBundleOption.product_links.find(
          (productLink) => productLink.product && productLink.product.sku === val
        );

        this.setBundleOptionValue({
          optionId: this.designBundleOption.option_id,
          optionQty: 1,
          optionSelections: selectedDesign ? [selectedDesign.id] : []
        })

        const designOptionValidationProvider = this.getDesignOptionValidationProvider();

        if (!designOptionValidationProvider) {
          return;
        }

        this.$nextTick().then(() => {
          designOptionValidationProvider.validate();
        });
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.o-blanket-product-order-form {
  ._info {
    display: flex;
    flex-direction: column;
  }

  ._price {
    margin-top: var(--spacer-base);
  }

  ._zoom-gallery-container,
  ._form-container {
    flex-grow: 1;
    width: 100%;
  }

  ._product-name-desktop {
    display: none;
  }

  ._product-name-mobile {
    margin-top: var(--spacer-lg);
  }

  ._gallery {
    margin-top: var(--spacer-xs);
  }

  ._step {
    margin-top: var(--spacer-base);
  }

  ._step-title {
    font-size: var(--font-base);
    font-weight: 800;
    text-align: left;
  }

  .m-artwork-upload {
    margin-top: var(--spacer-sm);
  }

  ._quantity-field,
  ._actions {
    margin-top: var(--spacer-base);
  }

  ._add-to-cart {
    width: 100%;
  }

  ._error-text {
    font-size: 0.8em;
    margin-top: var(--spacer-xs);
    color: var(--c-danger-variant);
  }

  ._upload-photo-hint {
    font-size: var(--font-xs);
    margin-top: var(--spacer-xs);
  }

  ._form-errors {
    margin-top: var(--spacer-xl);
  }

  @media (min-width: $tablet-min) {
    ._info {
      flex-direction: row;
      justify-content: space-between;
    }

    ._zoom-gallery-container,
    ._form-container {
      max-width: 48.5%;
    }

    ._product-name-desktop {
        display: block;
    }

    ._product-name-mobile {
        display: none;
    }

    ._gallery {
      margin-top: 0;
    }

    ._add-to-cart {
      width: auto;
    }
  }
}
</style>
