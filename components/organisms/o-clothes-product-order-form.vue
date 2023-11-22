<template>
  <div class="o-clothes-product-order-form">
    <div class="_info">
      <div class="_zoom-gallery-container">
        <SfHeading
          :title="product.name"
          :level="1"
          class="_product-name-mobile sf-heading--left"
        />

        <m-zoom-gallery :images="galleryImages" class="_gallery" />
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
            <div class="_step" v-if="showStyleSelectorStep">
              <div
                class="_step-title"
                :ref="getFieldAnchorName('Style Option')"
              >
                {{ $t('Select style') }}
              </div>

              <validation-provider
                v-slot="{errors}"
                rules="required"
                name="'Style Option'"
                class="_step-content"
                tag="div"
              >
                <m-clothes-style-selector
                  :options="styleOptions"
                  name="clothes-style-selector"
                  :disabled="isDisabled"
                  :value="selectedStyle"
                  @input="onStyleSelected"
                />

                <div class="_error-text">
                  {{ errors[0] }}
                </div>
              </validation-provider>
            </div>

            <div class="_step" v-if="showVariantSelectStep">
              <div class="_step-title" :ref="getFieldAnchorName('Set Option')">
                {{ $t('Select set') }}
              </div>

              <validation-provider
                v-slot="{errors}"
                name="'Set Option'"
                tag="div"
                class="_step-content"
              >
                <SfSelect
                  class="sf-select--underlined"
                  name="set_option"
                  required
                  v-if="showVariantSelectorComponent"
                  v-model="selectedVariantOption"
                  :size="10"
                  :disabled="isDisabled"
                  :should-lock-scroll-on-open="isMobile"
                >
                  <SfSelectOption
                    v-for="option in variantOptions"
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
            </div>

            <div class="_step" v-if="showSizeSelectStep">
              <div
                class="_step-title"
                :ref="getFieldAnchorName('Size Option')"
              >
                {{ $t('Select size') }}
              </div>

              <validation-provider
                v-slot="{ errors }"
                rules="required"
                name="'Size Option'"
                tag="div"
                class="_step-content"
              >
                <SfSelect
                  class="sf-select--underlined"
                  name="size_option"
                  required
                  v-if="showSizeSelectorComponent"
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
            </div>

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
                mode="passive"
                name="'Design Option'"
                tag="div"
                class="_step-content"
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
                class="_step-content"
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
                  @is-busy-changed="onArtworkUploadBusyStatusChanged('main', $event)"
                />

                <div class="_error-text">
                  {{ errors[0] }}
                </div>
              </validation-provider>
            </div>

            <div class="_step">
              <MExtraFaces
                ref="extra-faces"
                :available-options="extraFacesAddons"
                :backend-product-id="backendProductId"
                :disabled="isSubmitting"
                :upload-url="artworkUploadUrl"
                :initial-variant="initialAddonItemId"
                :initial-artworks="initialAdditionalArtworks"
                :get-field-anchor-name="getFieldAnchorName"
                step-title="Add more people"
                default-option-label="No extra people"
                v-if="hasExtraFaceAddons"
                @input="extraFacesData = $event"
                @is-busy-changed="onArtworkUploadBusyStatusChanged('extra-faces', $event)"
              />
            </div>

            <div
              class="_step"
              :ref="getFieldAnchorName('Quantity')"
            >
              <validation-provider
                v-slot="{ errors, classes }"
                rules="required"
                :name="'Quantity'"
                slim
              >
                <div class="_quantity-field" :class="classes">
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
                :form-errors="formErrors"
                @item-click="goToFieldByName"
              />

              <div class="_actions">
                <SfButton
                  class="_add-to-cart color-primary"
                  type="submit"
                  :disabled="isSubmitButtonDisabled"
                >
                  {{ $t('Add to Cart') }}
                </SfButton>
              </div>

              <california-privacy-notice-link />
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
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import Vue from 'vue'
import { defineComponent, ref, Ref, inject, PropType } from '@vue/composition-api';
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

import { ProductValue, Dictionary, ExtraPhotoAddon } from 'src/modules/budsies';
import { ImageHandlerService, Item } from 'src/modules/file-storage';
import { CustomerImage, getProductDefaultPrice, ServerError } from 'src/modules/shared';
import { CaliforniaPrivacyNoticeLink } from 'src/modules/true-vault';
import ZoomGalleryImage from 'theme/interfaces/zoom-gallery-image.interface';
import { useFormValidation } from 'theme/helpers/use-form-validation';

import DesignProduct from '../interfaces/design-product.interface';
import GalleryProductImages from '../interfaces/gallery-product-images.interface';
import ClothesStyleOption from '../interfaces/clothes-style-option.interface';
import ExtraPhotoAddonOption from '../interfaces/extra-photo-addon-option.interface';
import ExtraFacesConfiguratorData from '../interfaces/extra-faces-configurator-data.interface';

import ACustomPrice from '../atoms/a-custom-price.vue';
import ACustomProductQuantity from '../atoms/a-custom-product-quantity.vue';
import MArtworkUpload from '../molecules/m-artwork-upload.vue';
import MDesignSelector from '../molecules/m-design-selector.vue';
import MProductDescriptionStory from '../molecules/m-product-description-story.vue';
import MZoomGallery from '../molecules/m-zoom-gallery.vue';
import MClothesStyleSelector from './OClothesProductOrderForm/m-clothes-style-selector.vue';
import MExtraFaces from '../molecules/m-extra-faces.vue';
import MFormErrors from '../molecules/m-form-errors.vue';

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

interface SelectOptionItem {
  value: string,
  label: string
}

const SHIRTS_DESIGN_BUNDLE_OPTION_TITLE = 'design';
const PAJAMAS_DESIGN_BUNDLE_OPTION_TITLE = 'product';
const SIZE_BUNDLE_OPTION_TITLE = 'size';
const EXTRA_FACES_BUNDLE_OPTION_TITLE = 'extra faces';
const VARIANT_BUNDLE_OPTION_TITLE = 'variant';

function getAllFormRefs (
  refs: Record<string, Vue | Element | Vue[] | Element[]>
): Record<string, Vue | Element | Vue[] | Element[]> {
  const extraFaces = refs['extra-faces'] as InstanceType<typeof MExtraFaces> | undefined;

  let refsDictionary: Record<string, Vue | Element | Vue[] | Element[]> = { ...refs };

  if (extraFaces) {
    refsDictionary = { ...refsDictionary, ...extraFaces.$refs };
  }

  return refsDictionary;
}

export default defineComponent({
  name: 'OClothesProductOrderForm',
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
        () => getAllFormRefs(setupContext.refs)
      )
    }
  },
  components: {
    CaliforniaPrivacyNoticeLink,
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
    MClothesStyleSelector,
    MExtraFaces,
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
    const artworkUploaderBusyState: Dictionary<boolean> = {};

    return {
      quantity: 1,
      customerImage: undefined as CustomerImage | undefined,
      isSubmitting: false,
      artworkUploadInitialItems: [] as CustomerImage[],
      selectedSizeOption: undefined as string | undefined,
      selectedVariantOption: undefined as string | undefined,
      selectedStyle: undefined as string | undefined,
      showVariantSelectorComponent: true,
      showSizeSelectorComponent: true,
      initialAddonItemId: undefined as string | undefined,
      additionalArtworks: [] as CustomerImage[],
      initialAdditionalArtworks: [] as CustomerImage[],
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      extraFacesDataAddon: undefined as ExtraPhotoAddonOption | undefined,
      artworkUploaderBusyState
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
    extraFacesAddonsBundleOption (): BundleOption | undefined {
      if (!this.product?.bundle_options) {
        return undefined;
      }

      return this.product.bundle_options.find(item => item.title.toLowerCase() === EXTRA_FACES_BUNDLE_OPTION_TITLE);
    },
    extraFacesAddons (): ExtraPhotoAddonOption[] {
      if (!this.extraFacesAddonsBundleOption) {
        return []
      }

      const addons: ExtraPhotoAddon[] = this.$store.getters['budsies/getPrintedProductAddons'](this.product.id);

      if (!addons.length) {
        return [];
      }

      let addonOptions: Record<string, number> = {};

      for (const productLink of this.extraFacesAddonsBundleOption.product_links) {
        if (!productLink.product) {
          continue;
        }

        addonOptions[productLink.product.sku] = +productLink.id;
      }

      const result: ExtraPhotoAddonOption[] = [];

      for (const addon of addons) {
        const addonOption = addonOptions[addon.id];

        if (!addonOption && addon.id) {
          Logger.warn('The option product of extra photo addon is not found: ' + addon.id, 'budsies')();
          continue;
        }

        result.push({
          id: addon.id,
          label: addon.label,
          value: addon.value,
          optionId: this.extraFacesAddonsBundleOption.option_id,
          optionValueId: addonOption
        })
      }

      return result;
    },
    extraFacesData: {
      get (): ExtraFacesConfiguratorData {
        return {
          addon: this.extraFacesDataAddon,
          storageItems: this.additionalArtworks
        }
      },
      set (value: ExtraFacesConfiguratorData): void {
        this.extraFacesDataAddon = value.addon;
        this.additionalArtworks = value.storageItems;
      }
    },
    hasExtraFaceAddons (): boolean {
      return (
        this.extraFacesAddons.length > 0
      );
    },
    backendProductId (): ProductValue.PAJAMAS | ProductValue.HAWAIIAN_SHIRTS | ProductValue.GOLF_SHIRTS {
      switch (this.product.id) {
        case 558:
          return ProductValue.PAJAMAS;
        case 645:
          return ProductValue.HAWAIIAN_SHIRTS;
        case 626:
          return ProductValue.GOLF_SHIRTS;
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
        (bundleOption) => bundleOption.title.toLowerCase() === this.designBundleOptionTitle
      );
    },
    designBundleOptionTitle (): string {
      switch (this.backendProductId) {
        case ProductValue.PAJAMAS:
          return PAJAMAS_DESIGN_BUNDLE_OPTION_TITLE;
        case ProductValue.GOLF_SHIRTS:
        case ProductValue.HAWAIIAN_SHIRTS:
          return SHIRTS_DESIGN_BUNDLE_OPTION_TITLE;
      }
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
      return this.isDisabled || this.isSomeUploaderBusy;
    },
    isSomeUploaderBusy (): boolean {
      return !!Object.values(this.artworkUploaderBusyState)
        .find((isBusy) => isBusy);
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
    selectedDesignProductPrice (): { regular: number, special: number } {
      if (!this.selectedDesignProduct) {
        return getProductDefaultPrice(this.defaultDesignProduct, {}, false);
      }

      return getProductDefaultPrice(this.selectedDesignProduct, {}, false);
    },
    defaultVariantProduct (): Product | undefined {
      return this.variantBundleOptionProductLinks[0]?.product;
    },
    selectedExtraFaceProduct (): Product | undefined {
      if (!this.extraFacesDataAddon || !this.extraFacesAddonsBundleOption) {
        return;
      }

      const productLink = this.extraFacesAddonsBundleOption.product_links.find(
        (productLink) => productLink.id.toString() === this.extraFacesDataAddon?.optionValueId.toString()
      );

      return productLink?.product;
    },
    selectedVariantProduct (): Product | undefined {
      if (!this.selectedVariantOption || !this.variantsBundleOption) {
        return;
      }

      const productLink = this.variantsBundleOption.product_links.find(
        (productLink) => productLink.id === this.selectedVariantOption
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
    sizeBundleOptionProductLinks (): BundleOptionsProductLink[] {
      if (!this.sizeBundleOption) {
        return [];
      }

      return this.sizeBundleOption.product_links
    },
    sizeOptions (): SelectOptionItem[] {
      const options: SelectOptionItem[] = [];

      if (this.variantsBundleOption && !this.selectedStyle) {
        return options;
      }

      if (!this.sizeBundleOption) {
        return options;
      }

      this.sizeBundleOptionProductLinks.forEach((productLink) => {
        if (!productLink.product) {
          throw new Error('Product is defined for product link');
        }

        const styleCode = productLink.sku.split('_')[2];
        if (!styleCode) {
          return;
        }

        if (this.selectedStyle && this.selectedStyle !== styleCode) {
          return;
        }

        options.push({
          value: productLink.id.toString(),
          label: productLink.product.name
        });
      })

      return options;
    },
    specialPrice (): number {
      return this.totalPrice.special;
    },
    totalPrice (): {regular: number, special: number} {
      const extraFacesPrice = getProductDefaultPrice(this.selectedExtraFaceProduct, {}, false);

      return {
        regular: this.selectedDesignProductPrice.regular +
          this.simpleProductPrice.regular +
          extraFacesPrice.regular,
        special: this.selectedDesignProductPrice.special +
          this.simpleProductPrice.special +
          extraFacesPrice.special
      }
    },
    customerImageId (): string | undefined {
      return this.customerImage?.id;
    },
    simpleProductPrice (): {regular: number, special: number} {
      switch (this.backendProductId) {
        case ProductValue.PAJAMAS:
          const variantPrice = getProductDefaultPrice(this.selectedVariantProduct, {}, false);
          const defaultVariantPrice = getProductDefaultPrice(this.defaultVariantProduct, {}, false);

          return variantPrice.regular ? variantPrice : defaultVariantPrice;
        case ProductValue.GOLF_SHIRTS:
        case ProductValue.HAWAIIAN_SHIRTS:
          return getProductDefaultPrice(this.product, {}, false);
      }
    },
    styleOptions (): ClothesStyleOption[] {
      const styleCodes: Record<string, ClothesStyleOption> = {};

      this.variantBundleOptionProductLinks.forEach((productLink) => {
        if (!productLink.product) {
          throw new Error('Product link is not defined');
        }

        const styleCode = productLink.sku.split('_')[1];
        if (!styleCode || !!styleCodes[styleCode] || !productLink.product.image) {
          return;
        }

        styleCodes[styleCode] = {
          code: styleCode,
          image: productLink.product.image,
          name: styleCode
        };
      });

      return Object.values(styleCodes);
    },
    variantsBundleOption (): BundleOption | undefined {
      if (!this.product.bundle_options) {
        return;
      }

      return this.product.bundle_options.find((option) => {
        return option.title.toLowerCase() === VARIANT_BUNDLE_OPTION_TITLE
      })
    },
    variantBundleOptionProductLinks (): BundleOptionsProductLink[] {
      if (!this.variantsBundleOption) {
        return [];
      }

      return this.variantsBundleOption.product_links
    },
    variantOptions (): SelectOptionItem[] {
      const options: SelectOptionItem[] = [];

      if (!this.selectedStyle) {
        return options;
      }

      this.variantBundleOptionProductLinks.forEach((productLink) => {
        if (!productLink.product) {
          throw new Error('Product is defined for product link');
        }

        const styleCode = productLink.sku.split('_')[1];
        if (!styleCode) {
          return;
        }

        if (this.selectedStyle !== styleCode) {
          return;
        }

        options.push({
          value: productLink.id.toString(),
          label: this.getLabelForVariantOptionByProductLink(productLink)
        });
      })

      return options;
    },
    showStyleSelectorStep (): boolean {
      return this.styleOptions.length > 0;
    },
    showVariantSelectStep (): boolean {
      return this.variantOptions.length > 0;
    },
    showSizeSelectStep (): boolean {
      return this.sizeOptions.length > 0;
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

      this.isSubmitting = true;

      await this.$store.dispatch(
        'product/setBundleOptions',
        { product: this.product, bundleOptions: this.$store.state.product.current_bundle_options }
      );

      const additionalArtworks: CustomerImage[] = this.additionalArtworks.map((item) => ({
        id: item.id,
        url: this.imageHandlerService.getOriginalImageUrl(item.url)
      }));

      try {
        try {
          await this.$store.dispatch('cart/addItem', {
            productToAdd: Object.assign({}, this.product, {
              qty: this.quantity,
              customerImages: [this.customerImage, ...additionalArtworks],
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
    fillAdditionalArtworksData (existingCartItem: CartItem): void {
      if (!existingCartItem.customerImages || existingCartItem.customerImages.length <= 1) {
        this.fillEmptyAdditionalArtworks();
        return;
      }
      const customerAdditionalArtworksImages = [...existingCartItem.customerImages];
      customerAdditionalArtworksImages.splice(0, 1);

      this.additionalArtworks = customerAdditionalArtworksImages;
      this.initialAdditionalArtworks = [...customerAdditionalArtworksImages];
    },
    fillDefaultSelectedSizeOption (): void {
      const defaultSizeProductLink = this.sizeBundleOption?.product_links[0];

      if (!defaultSizeProductLink) {
        return;
      }

      this.selectedSizeOption = defaultSizeProductLink.id.toString();
    },
    fillDefaultStyle (): void {
      this.selectedStyle = undefined;
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
      this.artworkUploadInitialItems = [cartItem.customerImages[0]];
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
      this.fillExistingCartItemVariant(cartItem);
      this.fillExistingCartItemStyle();
      this.fillAdditionalArtworksData(cartItem);
      this.fillExtraFacesDataAddon(cartItem);
      this.fillExistingQuantity(cartItem);
    },
    fillExistingCartItemStyle (): void {
      this.selectedStyle = undefined;

      if (!this.selectedVariantProduct) {
        return;
      }

      const styleCode = this.selectedVariantProduct.sku.split('_')[1];
      if (!styleCode) {
        return;
      }

      this.selectedStyle = styleCode;
    },
    fillExistingQuantity (cartItem: CartItem): void {
      this.quantity = cartItem.qty;
    },
    fillExistingCartItemVariant (cartItem: CartItem): void {
      this.selectedVariantOption = undefined;
      const selectedBundleOptions = getSelectedBundleOptions(cartItem);

      if (!this.variantsBundleOption || !selectedBundleOptions.length) {
        return;
      }

      const selectedVariant = selectedBundleOptions.find(
        (option) => option.option_id === this.variantsBundleOption?.option_id
      )

      if (!selectedVariant || !selectedVariant.option_selections[0]) {
        return;
      }

      this.selectedVariantOption = selectedVariant.option_selections[0].toString();
    },
    fillExtraFacesDataAddon (cartItem: CartItem): void {
      const selectedBundleOptions = getSelectedBundleOptions(cartItem);

      if (!this.extraFacesAddons.length || !selectedBundleOptions.length) {
        this.fillEmptyExtraFacesDataAddon();
        return;
      }

      const selectedAddon: ExtraPhotoAddonOption | undefined = this.extraFacesAddons.find(
        (addon) => selectedBundleOptions.find(
          (selectedOption) => selectedOption.option_id === addon.optionId &&
         selectedOption.option_selections.includes(addon.optionValueId)
        )
      )

      if (!selectedAddon) {
        this.fillEmptyExtraFacesDataAddon();
        return;
      }

      this.extraFacesDataAddon = selectedAddon;
      this.initialAddonItemId = selectedAddon.id;
    },
    fillEmptyExtraFacesDataAddon (): void {
      this.extraFacesDataAddon = undefined;
      this.initialAddonItemId = undefined;
    },
    fillEmptyAdditionalArtworks (): void {
      this.initialAdditionalArtworks = [];
      this.additionalArtworks = [];
    },
    getArtworkUploader (): InstanceType<typeof MArtworkUpload> | undefined {
      return this.$refs['artwork-upload'] as InstanceType<typeof MArtworkUpload> | undefined;
    },
    getLabelForVariantOptionByProductLink (productLink: BundleOptionsProductLink): string {
      if (!productLink.product) {
        throw new Error('Product is undefined for product link');
      }

      const finalDesignPrice = this.selectedDesignProductPrice.special
        ? this.selectedDesignProductPrice.special
        : this.selectedDesignProductPrice.regular;
      const variantPrice = getProductDefaultPrice(productLink.product, {}, false);
      const finalVariantPrice = variantPrice.special ? variantPrice.special : variantPrice.regular;

      return `${productLink.product.name} $${finalDesignPrice + finalVariantPrice}`
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
    getDesignOptionValidationProvider (): InstanceType<typeof ValidationProvider> | undefined {
      return this.$refs['design-option-validation-provider'] as InstanceType<typeof ValidationProvider> | undefined;
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
    onArtworkUploadBusyStatusChanged (key: string, isBusy: boolean): void {
      Vue.set(this.artworkUploaderBusyState, key, isBusy);
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
    onStyleSelected (style: string | undefined) {
      this.selectedStyle = style;
      this.showVariantSelectorComponent = false;
      this.showSizeSelectorComponent = false;

      this.setDefaultVariant();
      this.setDefaultSize();

      this.$nextTick()
        .then(() => {
          this.showVariantSelectorComponent = true;
          this.showSizeSelectorComponent = true;
        })
    },
    onSuccessAddToCart (): void {
      this.resetData();
      this.goToCrossSells();
    },
    onSuccessExistingCartItemUpdate (): void {
      this.resetData();

      this.$router.push({ name: 'detailed-cart' });
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
      this.fillEmptyAdditionalArtworks();
      this.fillEmptyExtraFacesDataAddon();
      this.fillDefaultStyle();
      this.onDesignSelect(undefined);
    },
    setDefaultVariant (): void {
      if (!this.variantOptions.length) {
        return;
      }

      this.selectedVariantOption = this.variantOptions[0].value;
    },
    setDefaultSize (): void {
      if (!this.sizeOptions.length) {
        return;
      }

      this.selectedSizeOption = this.sizeOptions[0].value;
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

      this.isSubmitting = true;

      const additionalArtworks: CustomerImage[] = this.additionalArtworks.map(item => {
        let url = item.url;

        if (!this.initialAdditionalArtworks.find((image) => image.id === item.id)) {
          url = this.imageHandlerService.getOriginalImageUrl(item.url);
        }

        return {
          id: item.id,
          url
        }
      });

      try {
        try {
          await this.updateClientAndServerItem({
            product: Object.assign({}, this.existingCartItem, {
              qty: this.quantity,
              customerImages: [this.customerImage, ...additionalArtworks],
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
        });

        const designOptionValidationProvider = this.getDesignOptionValidationProvider();

        if (!designOptionValidationProvider) {
          return;
        }

        this.$nextTick().then(() => {
          designOptionValidationProvider.validate();
        });
      }
    },
    selectedVariantOption: {
      handler (val: string | undefined, oldVal: string | undefined) {
        if (val === oldVal) {
          return;
        }

        if (!this.variantsBundleOption) {
          Logger.error('variantsBundleOption is not defined while attempt to set variant was performed', 'budsies')();
          return;
        }

        this.setBundleOptionValue({
          optionId: this.variantsBundleOption.option_id,
          optionQty: 1,
          optionSelections: val ? [val] : []
        });
      }
    },
    extraFacesAddons () {
      if (!this.existingCartItem) {
        return;
      }

      this.fillExtraFacesDataAddon(this.existingCartItem);
    },
    extraFacesDataAddon: {
      handler (newValue: ExtraPhotoAddonOption | undefined) {
        if (!this.extraFacesAddonsBundleOption) {
          return
        }

        this.setBundleOptionValue({
          optionId: this.extraFacesAddonsBundleOption.option_id,
          optionQty: 1,
          optionSelections: newValue ? [newValue.optionValueId] : []
        });
      },
      immediate: false
    }
  }
})
</script>

  <style lang="scss" scoped>
  @import "~@storefront-ui/shared/styles/helpers/breakpoints";

  .o-clothes-product-order-form {
    --select-selected-padding: 0 var(--spacer-lg) var(--spacer-xs) var(--spacer-2xs);

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

    ._step-content {
      margin-top: var(--spacer-sm);
    }

    .m-extra-faces {
      ::v-deep {
        ._extra-face-uploader-wrapper {
          margin-top: var(--spacer-sm);
        }
      }
    }

    .m-form-errors {
      margin-top: var(--spacer-base);
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
