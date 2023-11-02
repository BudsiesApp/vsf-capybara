<template>
  <div class="o-printed-product-order-form product" :class="skinClass">
    <div class="_info">
      <div>
        <header class="sf-heading sf-heading--no-underline sf-heading--left">
          <h1 class="_product-name-mobile sf-heading__title">
            {{ product.name }}
          </h1>
        </header>

        <m-zoom-gallery
          ref="gallery"
          class="_gallery"
          :images="galleryImages"
        />
      </div>

      <div>
        <header class="sf-heading sf-heading--no-underline sf-heading--left">
          <h1 class="_product-name-desktop sf-heading__title">
            {{ product.name }}
          </h1>
        </header>

        <div class="_short-description" v-html="shortDescription" />

        <a-custom-price
          class="_price"
          :regular="price"
          :special-price="specialPrice"
        />

        <validation-observer
          v-slot="{ errors: formErrors }"
          slim
          ref="validationObserver"
        >
          <form
            @submit.prevent="onSubmit"
          >
            <validation-provider
              v-slot="{ errors }"
              rules="required"
              name="'Size'"
              tag="div"
              class="_size-selector"
              v-if="sizesOptions.length"
            >
              <m-plushie-size-selector
                name="pillow_size"
                v-model="selectedSize"
                :options="sizesOptions"
                :disabled="isSubmitting"
                :small="true"
              />

              <div class="_error-text">
                {{ errors[0] }}
              </div>
            </validation-provider>

            <div class="_additional-options">
              <div v-show="hasStyleSelections">
                <div
                  class="_step-title"
                  :ref="getFieldAnchorName('Style Option')"
                >
                  Design
                </div>

                <validation-provider
                  v-slot="{ errors }"
                  rules="required"
                  name="'Style Option'"
                  mode="passive"
                  tag="div"
                  ref="style-option-validation-provider"
                >
                  <SfSelect
                    :selected="selectedStyle"
                    @change="selectStyle"
                    v-if="shouldShowDesignSelector"
                    name="design_option"
                    required
                    class="sf-select--underlined"
                    :size="10"
                    :disabled="isSubmitting"
                    :should-lock-scroll-on-open="isMobile"
                  >
                    <SfSelectOption
                      v-for="option in designSelectorOptions"
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
            </div>

            <div class="_artwork-upload">
              <MTitledArtworkUpload
                ref="artwork-upload"
                class="_titled-artwork-upload"
                field-name="'Photo'"
                :title="$t('Upload photo')"
                :backend-product-id="backendProductId"
                :upload-url="artworkUploadUrl"
                :disabled="isSubmitting"
                :initial-artworks="artworkInitialItems"
                :uploaded-artwork="customerImage"
                :is-required="true"
                :get-field-anchor-name="getFieldAnchorName"
                @file-added="onArtworkAdd"
                @file-removed="onArtworkRemove"
                @is-busy-changed="onArtworkUploadBusyStatusChanged('main', $event)"
              />
            </div>

            <div v-if="isFeltedProduct" class="_felted-magnets-additional-info">
              <MTitledArtworkUpload
                ref="side-view-upload"
                class="_titled-artwork-upload"
                field-name="'Side View Photo'"
                :title="$t('Upload Side View photo')"
                :backend-product-id="backendProductId"
                :upload-url="artworkUploadUrl"
                :disabled="isSubmitting"
                :initial-artworks="sideViewInitialArtworks"
                :uploaded-artwork="additionalArtworks[0]"
                :get-field-anchor-name="getFieldAnchorName"
                @file-added="(value) => onAdditionalArtworkAdd(0, value)"
                @file-removed="onAdditionalArtworkRemove"
                @is-busy-changed="onArtworkUploadBusyStatusChanged('side', $event)"
              />

              <MTitledArtworkUpload
                ref="back-view-upload"
                class="_titled-artwork-upload"
                field-name="'Back View Photo'"
                :title="$t('Upload Back View photo')"
                :backend-product-id="backendProductId"
                :upload-url="artworkUploadUrl"
                :disabled="isSubmitting"
                :initial-artworks="backViewInitialArtworks"
                :uploaded-artwork="additionalArtworks[1]"
                :get-field-anchor-name="getFieldAnchorName"
                @file-added="(value) => onAdditionalArtworkAdd(1, value)"
                @file-removed="onAdditionalArtworkRemove"
                @is-busy-changed="onArtworkUploadBusyStatusChanged('back', $event)"
              />
            </div>

            <div class="_body-parts" v-if="bodyparts.length">
              <div class="_bodypart-selector-container" v-for="bodypart in bodyparts" :key="bodypart.code">
                <div
                  class="_step-title _body-part-heading"
                  :ref="getFieldAnchorName(bodypart.name)"
                >
                  {{ $t(bodypart.name) }}
                </div>

                <validation-provider
                  v-slot="{ errors }"
                  :rules="bodypart.isRequired ? 'required' : ''"
                  :name="`'${bodypart.name}'`"
                  class="_bodypart-selector"
                  tag="div"
                >
                  <m-bodypart-option-configurator
                    :name="bodypart.code"
                    v-model="bodypartValues[bodypart.id]"
                    :max-values="bodypart.maxValues"
                    :options="getBodypartOptions(bodypart.id)"
                    :disabled="isSubmitting"
                    type="bodypart"
                  />

                  <div class="_error-text">
                    {{ errors[0] }}
                  </div>
                </validation-provider>
              </div>
            </div>

            <MExtraFaces
              ref="extra-faces"
              :available-options="addons"
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

            <MProductionTimeSelector
              class="_production-time-selector"
              v-model="selectedProductionTimeOption"
              :production-time-options="productionTimeOptions"
              :product-id="product.id"
              :disabled="isSubmitting"
              v-if="hasProductionTimeOptions"
            />

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

            <m-form-errors
              class="_form-errors"
              :form-errors="formErrors"
              @item-click="goToFieldByName"
            />

            <div class="_actions">
              <div class="row">
                <div class="medium-8 large-6 columns">
                  <SfButton
                    class="_add-to-cart color-primary"
                    type="submit"
                    :disabled="isSubmitButtonDisabled"
                  >
                    Add to Cart
                  </SfButton>
                </div>
              </div>
            </div>

            <a class="truevault-polaris-privacy-notice" target="_blank" href="https://privacy.budsies.com/privacy-policy#california-privacy-notice" noreferrer noopener hidden>California Privacy Notice</a>
          </form>
        </validation-observer>
      </div>
    </div>

    <MProductDescriptionStory
      :product-sku="selectedStyle ? selectedStyle : product.sku"
      :backup-product-sku="product.parentSku"
      :title="$t('Product Details').toString()"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { defineComponent, ref, Ref, inject, PropType } from '@vue/composition-api';
import { mapGetters, mapMutations } from 'vuex';
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import { Logger } from '@vue-storefront/core/lib/logger';
import i18n from '@vue-storefront/i18n';
import { notifications } from '@vue-storefront/core/modules/cart/helpers';
import { localizedRoute } from '@vue-storefront/core/lib/multistore';
import * as types from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import { getSelectedBundleOptions } from '@vue-storefront/core/modules/catalog/helpers/bundleOptions';
import {
  mapMobileObserver,
  unMapMobileObserver
} from '@storefront-ui/vue/src/utilities/mobile-observer';

import { SfButton, SfSelect } from '@storefront-ui/vue';
import Product from 'core/modules/catalog/types/Product';
import { BundleOption } from 'core/modules/catalog/types/BundleOption';
import { getProductGallery as getGalleryByProduct, setBundleProductOptionsAsync } from '@vue-storefront/core/modules/catalog/helpers';
import CartItem from 'core/modules/cart/types/CartItem';

import { ImageHandlerService, Item } from 'src/modules/file-storage';
import { Bodypart, BodypartOption, Dictionary, ExtraPhotoAddon, ProductValue } from 'src/modules/budsies';
import ServerError from 'src/modules/shared/types/server-error';
import { CustomerImage, getProductDefaultPrice, InjectType } from 'src/modules/shared';

import { useBundleOption } from 'theme/helpers/use-bundle-options';
import { useFormValidation } from 'theme/helpers/use-form-validation';
import { useProductionTimeSelector } from 'theme/helpers/use-production-time-selector';
import { useSizeSelector } from 'theme/helpers/use-size-selector';
import getCurrentThemeClass from 'theme/helpers/get-current-theme-class';

import GalleryProductImages from '../interfaces/gallery-product-images.interface';
import SizeOption from '../interfaces/size-option';

import ACustomPrice from '../atoms/a-custom-price.vue';
import ACustomProductQuantity from '../atoms/a-custom-product-quantity.vue';
import MProductDescriptionStory from '../molecules/m-product-description-story.vue';
import MZoomGallery from '../molecules/m-zoom-gallery.vue';
import MExtraFaces from '../molecules/m-extra-faces.vue';
import MTitledArtworkUpload from '../molecules/m-titled-artwork-upload.vue';
import ZoomGalleryImage from '../../interfaces/zoom-gallery-image.interface';
import ExtraPhotoAddonOption from '../interfaces/extra-photo-addon-option.interface';
import ExtraFacesConfiguratorData from '../interfaces/extra-faces-configurator-data.interface';
import MBodypartOptionConfigurator from '../molecules/m-bodypart-option-configurator.vue';
import MFormErrors from '../molecules/m-form-errors.vue';
import MPlushieSizeSelector from '../molecules/m-plushie-size-selector.vue';
import MProductionTimeSelector from '../molecules/m-production-time-selector.vue';

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

export interface SelectOption {
  optionId: number,
  optionValueId: number,
  value: string,
  label: string,
  description: string,
  shortDescription: string,
  price: number,
  specialPrice: number,
  productId?: string
}

const feltedMagnetSku = 'customFeltedMagnets_bundle';
const feltedOrnamentsSku = 'customFeltedOrnaments_bundle';

const sizeBundleOptionTitle = 'size';

function getAllFormRefs (
  refs: Record<string, Vue | Element | Vue[] | Element[]>
): Record<string, Vue | Element | Vue[] | Element[]> {
  const artworkUpload = refs['artwork-upload'] as InstanceType<typeof MTitledArtworkUpload> | undefined;
  const sideViewUpload = refs['side-view-upload'] as InstanceType<typeof MTitledArtworkUpload> | undefined;
  const backViewUpload = refs['back-view-upload'] as InstanceType<typeof MTitledArtworkUpload> | undefined;
  const extraFaces = refs['extra-faces'] as InstanceType<typeof MExtraFaces> | undefined;

  let refsDictionary: Record<string, Vue | Element | Vue[] | Element[]> = { ...refs };

  if (artworkUpload) {
    refsDictionary = { ...refsDictionary, ...artworkUpload.$refs };
  }

  if (sideViewUpload) {
    refsDictionary = { ...refsDictionary, ...sideViewUpload.$refs };
  }

  if (backViewUpload) {
    refsDictionary = { ...refsDictionary, ...backViewUpload.$refs };
  }

  if (extraFaces) {
    refsDictionary = { ...refsDictionary, ...extraFaces.$refs };
  }

  return refsDictionary;
}

export default defineComponent({
  name: 'OPrintedProductOrderForm',
  setup ({ product, styleBundleOptionTitle }, setupContext) {
    const imageHandlerService = inject<ImageHandlerService>('ImageHandlerService');
    const validationObserver: Ref<InstanceType<typeof ValidationObserver> | null> = ref(null);

    if (!imageHandlerService) {
      throw new Error('ImageHandlerService is not defined');
    }
    const { bundleOption: styleBundleOption } = useBundleOption(product, styleBundleOptionTitle);

    const {
      bundleOption: sizeBundleOption,
      selectedSize,
      sizesOptions
    } = useSizeSelector(product, sizeBundleOptionTitle);

    return {
      imageHandlerService,
      validationObserver,
      sizeBundleOption,
      styleBundleOption,
      selectedSize,
      sizesOptions,
      ...useFormValidation(
        validationObserver,
        () => getAllFormRefs(setupContext.refs)
      ),
      ...useProductionTimeSelector(product)
    }
  },
  components: {
    ValidationObserver,
    ValidationProvider,
    ACustomPrice,
    ACustomProductQuantity,
    MZoomGallery,
    MExtraFaces,
    SfSelect,
    SfButton,
    MProductDescriptionStory,
    MTitledArtworkUpload,
    MBodypartOptionConfigurator,
    MFormErrors,
    MPlushieSizeSelector,
    MProductionTimeSelector
  },
  props: {
    artworkUploadUrl: {
      type: String,
      required: true
    },
    styleBundleOptionTitle: {
      type: String,
      required: true
    },
    product: {
      type: Object as PropType<Product>,
      required: true
    },
    selectedStyle: {
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
    const bodypartValues: Record<string, BodypartOption | BodypartOption[] | undefined> = {};

    return {
      quantity: 1,
      customerImage: undefined as CustomerImage | undefined,
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      extraFacesDataAddon: undefined as ExtraPhotoAddonOption | undefined,
      isSubmitting: false,
      shouldShowDesignSelector: true,
      artworkInitialItems: [] as CustomerImage[],
      initialAddonItemId: undefined as string | undefined,
      additionalArtworks: [] as CustomerImage[],
      initialAdditionalArtworks: [] as CustomerImage[],
      bodypartValues,
      artworkUploaderBusyState
    }
  },
  computed: {
    ...mapMobileObserver(),
    ...mapGetters({
      getCurrentCustomOptions: 'product/getCurrentCustomOptions',
      getProductGallery: 'product/getProductGallery'
    }),
    skinClass (): string {
      return getCurrentThemeClass();
    },
    addonsBundleOption (): BundleOption | undefined {
      if (!this.product?.bundle_options) {
        return undefined;
      }

      return this.product.bundle_options.find(item => item.title.toLowerCase() === 'extra faces');
    },
    addons (): ExtraPhotoAddonOption[] {
      if (!this.addonsBundleOption) {
        return []
      }

      const addons: ExtraPhotoAddon[] = this.$store.getters['budsies/getPrintedProductAddons'](this.product.id);

      if (!addons.length) {
        return [];
      }

      let addonOptions: Record<string, number> = {};

      for (const productLink of this.addonsBundleOption.product_links) {
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
          optionId: this.addonsBundleOption.option_id,
          optionValueId: addonOption
        })
      }

      return result;
    },
    bodyparts (): Bodypart[] {
      const productIds: string[] = [];

      if (this.product && this.product.id) {
        productIds.push(this.product.id.toString());
      }

      if (this.selectedStyleOption && this.selectedStyleOption.productId) {
        productIds.push(this.selectedStyleOption.productId);
      }

      const bodyparts = this.$store.getters['budsies/getProductsBodyPartsByProductIds'](productIds);

      if (!bodyparts.length) {
        return [];
      }

      return bodyparts;
    },
    designSelectorOptions (): {
      value: string,
      label: string
    }[] {
      const placeholder = {
        value: '',
        label: this.$t('Select Design Variant').toString()
      }
      return [placeholder, ...this.availableStyles];
    },
    availableStyles (): SelectOption[] {
      if (!this.styleBundleOption) {
        return []
      }

      let availableStyles: SelectOption[] = [];
      for (const productLink of this.styleBundleOption.product_links) {
        if (!productLink.product) {
          continue;
        }

        const priceData = getProductDefaultPrice(productLink.product, {}, false);

        availableStyles.push({
          optionId: this.styleBundleOption.option_id,
          optionValueId: +productLink.id,
          value: productLink.product.sku,
          label: productLink.product.name,
          description: productLink.product.description,
          shortDescription: productLink.product.short_description ? productLink.product.short_description : '',
          price: priceData.regular,
          specialPrice: priceData.special,
          productId: productLink.product.id?.toString()
        });
      }

      return availableStyles;
    },
    selectedStyleOption (): SelectOption | undefined {
      return this.availableStyles.find((style) => style.value === this.selectedStyle);
    },
    backendProductId (): ProductValue {
      switch (this.product.id) {
        case 277:
          return ProductValue.PRINTED_SOCKS;
        case 340:
          return ProductValue.PRINTED_MASKS;
        case 353:
          return ProductValue.PRINTED_KEYCHAINS;
        case 446:
          return ProductValue.FELTED_MAGNETS;
        case 448:
          return ProductValue.FELTED_ORNAMENTS;
        case 603:
          return ProductValue.CARTOON_PILLOW;
        default:
          throw new Error(
            `Can't resolve Backend product ID for Magento '${this.product.id}' product ID`
          );
      }
    },
    galleryImages (): ZoomGalleryImage[] {
      const productImages = this.productImages.find(
        (item) => item.sku === this.selectedStyle
      );

      if (
        !productImages ||
        !productImages.images.length ||
        !this.selectedStyle
      ) {
        return this.productImages[0]['images'];
      }

      return productImages['images'];
    },
    bundleProductPrice (): {regular: any, special: any} {
      return getProductDefaultPrice(this.product, this.getCurrentCustomOptions, false);
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

      if (!this.styleBundleOption) {
        return result;
      }

      for (const productLink of this.styleBundleOption.product_links) {
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
    price (): number {
      const style = this.availableStyles.find(
        (item) => item.value === this.selectedStyle
      );
      const sizePrice = this.selectedSize?.regularPrice || 0;

      if (!style || !style.price) {
        return this.bundleProductPrice.regular + sizePrice;
      }

      return style.price + sizePrice;
    },
    specialPrice (): number {
      const style = this.availableStyles.find(
        (item) => item.value === this.selectedStyle
      );

      const sizePrice = this.selectedSize?.specialPrice || 0;

      if (!style || !style.specialPrice) {
        return this.bundleProductPrice.special + sizePrice;
      }

      return style.specialPrice + sizePrice;
    },
    hasStyleSelections (): boolean {
      return !(
        this.availableStyles.length === 1 &&
            this.selectedStyle !== undefined
      );
    },
    hasExtraFaceAddons (): boolean {
      return (
        this.addons.length > 0
      );
    },
    isSomeUploaderBusy (): boolean {
      return !!Object.values(this.artworkUploaderBusyState)
        .find((isBusy) => isBusy);
    },
    isSubmitButtonDisabled (): boolean {
      return this.isSubmitting || this.isSomeUploaderBusy;
    },
    description (): string | undefined {
      const style = this.availableStyles.find(
        (item) => item.value === this.selectedStyle
      );

      if (!style || !style.description) {
        return this.product.description;
      }

      return style.description;
    },
    shortDescription (): string | undefined {
      const style = this.availableStyles.find(
        (item) => item.value === this.selectedStyle
      );

      if (!style || !style.shortDescription) {
        return this.product.short_description;
      }

      return style.shortDescription;
    },
    hasOnlyOneAvailableStyle (): boolean {
      return this.availableStyles.length === 1;
    },
    getBodypartOptions (): (id: string) => BodypartOption[] {
      return this.$store.getters['budsies/getBodypartOptions']
    },
    sideViewInitialArtworks (): CustomerImage[] {
      return this.initialAdditionalArtworks[0] ? [this.initialAdditionalArtworks[0]] : [];
    },
    backViewInitialArtworks (): CustomerImage[] {
      return this.initialAdditionalArtworks[1] ? [this.initialAdditionalArtworks[1]] : [];
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
    isFeltedProduct () {
      const skus = [this.product.parentSku, this.product.sku];
      return skus.includes(feltedMagnetSku) || skus.includes(feltedOrnamentsSku);
    }
  },
  methods: {
    ...mapMutations('product', {
      setBundleOptionValue: types.PRODUCT_SET_BUNDLE_OPTION
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
              uploadMethod: 'upload-now',
              bodyparts: this.getBodypartsData()
            })
          });
        } catch (err) {
          if (err instanceof ServerError) {
            throw err;
          }

          Logger.error(err, 'budsies')();
        }

        this.onSuccess();
      } catch (err) {
        Logger.error(err, 'budsies')();

        this.onFailure('Unexpected error: ' + err);
      } finally {
        this.isSubmitting = false;
      }
    },
    cleanExistingProductData (): void {
      this.fillEmptyCustomerImagesData();
      this.fillEmptyExtraFacesDataAddon();
      this.fillEmptyAdditionalArtworks();
      this.fillEmptyBodypartsValues();
      this.resetSelectedProductionTimeOption();
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
    onArtworkUploadBusyStatusChanged (key: string, isBusy: boolean): void {
      Vue.set(this.artworkUploaderBusyState, key, isBusy);
    },
    onAdditionalArtworkAdd (index: number, value: CustomerImage): void {
      this.additionalArtworks.splice(index, 0, value);
    },
    onAdditionalArtworkRemove (artworkId: string): void {
      const artworkIndex = this.additionalArtworks.findIndex(({ id }) => artworkId === id);

      if (artworkIndex < 0) {
        return;
      }

      this.additionalArtworks.splice(artworkIndex, 1);
    },
    async onSubmit (): Promise<void> {
      const isValid = await this.validateAndGoToFirstError();

      if (!isValid) {
        return;
      }

      if (!this.existingCartItem) {
        this.addToCart();
      } else {
        this.updateExistingCartItem();
      }
    },
    async onSuccess (): Promise<void> {
      try {
        const uploader = this.getUploader();
        if (uploader) {
          uploader.clearInput();
        }

        const extraFaces = this.getExtraFaces();
        if (extraFaces) {
          extraFaces.clearUploaders();
        }

        const sideViewUpload = this.getSideViewUpload();
        if (sideViewUpload) {
          sideViewUpload.clearInput();
        }

        const backViewUpload = this.getBackViewUpload();
        if (backViewUpload) {
          backViewUpload.clearInput();
        }

        this.goToCrossSells();
      } catch (e) {
        this.$store.dispatch(
          'notification/spawnNotification',
          notifications.createNotification({ type: 'danger', message: e.message, timeToLive: 10 * 1000 }),
          { root: true }
        );
      }
    },
    onFailure (message: any): void {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: message,
        action1: { label: i18n.t('OK') }
      });
    },
    getBodypartsData (): Record<string, string[]> {
      let data: Record<string, string[]> = {};

      for (const bodyPartId in this.bodypartValues) {
        let value = this.bodypartValues[bodyPartId];

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
    getGallery (): HTMLElement | undefined {
      return this.$refs['gallery'] as HTMLElement | undefined;
    },
    getUploader (): InstanceType<typeof MTitledArtworkUpload> | undefined {
      return this.$refs['artwork-upload'] as InstanceType<typeof MTitledArtworkUpload> | undefined;
    },
    getSideViewUpload (): InstanceType<typeof MTitledArtworkUpload> | undefined {
      return this.$refs['side-view-upload'] as InstanceType<typeof MTitledArtworkUpload> | undefined;
    },
    getBackViewUpload (): InstanceType<typeof MTitledArtworkUpload> | undefined {
      return this.$refs['back-view-upload'] as InstanceType<typeof MTitledArtworkUpload> | undefined;
    },
    getExtraFaces (): InstanceType<typeof MExtraFaces> | undefined {
      return this.$refs['extra-faces'] as InstanceType<typeof MExtraFaces> | undefined;
    },
    getStyleOptionValidationProvider (): InstanceType<typeof ValidationProvider> | undefined {
      return this.$refs['style-option-validation-provider'] as InstanceType<typeof ValidationProvider> | undefined;
    },
    goToCrossSells (): void {
      this.$router.push(localizedRoute({
        name: 'cross-sells',
        params: {
          parentSku: this.product.sku
        }
      }));
    },
    selectStyle (styleValue: string): void {
      if (styleValue === this.selectedStyle) {
        return;
      }

      this.$emit('style-selected', styleValue);
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
    fillBodypartsValues (existingCartItem: CartItem): void {
      this.bodypartValues = {};

      if (!existingCartItem.bodyparts) {
        return;
      }

      const bodyparts: Record<string, any[]> = existingCartItem.bodyparts as Record<string, any[]>;

      Object.keys(bodyparts).forEach((key: string) => {
        Vue.set(
          this.bodypartValues,
          key,
          this.getBodypartOptions(key).filter(
            (bodypartOption: BodypartOption) => bodyparts[key].includes(bodypartOption.id) ||
              bodyparts[key].includes(Number(bodypartOption.id))
          )
        );
      });
    },
    fillCustomerImagesData (existingCartItem: CartItem): void {
      if (!existingCartItem.customerImages?.length) {
        this.fillEmptyCustomerImagesData();
        return;
      }

      this.customerImage = existingCartItem.customerImages[0];
      this.artworkInitialItems = [{ ...this.customerImage }]
    },
    fillDefaultSize (): void {
      if (!this.sizesOptions.length) {
        this.fillEmptySize();
        return;
      }

      this.selectedSize = this.sizesOptions[0];
    },
    fillEmptyAdditionalArtworks (): void {
      this.initialAdditionalArtworks = [];
      this.additionalArtworks = [];
    },
    fillEmptyBodypartsValues (): void {
      this.bodypartValues = {};
    },
    fillEmptyCustomerImagesData (): void {
      this.customerImage = undefined;
      this.artworkInitialItems = [];
    },
    fillEmptyExtraFacesDataAddon (): void {
      this.extraFacesDataAddon = undefined;
      this.initialAddonItemId = undefined;
    },
    fillEmptySize (): void {
      this.selectedSize = undefined;
    },
    fillProductDataFromExistingCartItem (existingCartItem: CartItem): void {
      if (!existingCartItem) {
        throw new Error('Existing cart item is undefined');
      }

      this.fillCustomerImagesData(existingCartItem);

      this.fillAdditionalArtworksData(existingCartItem);
      this.fillBodypartsValues(existingCartItem);
      this.fillExtraFacesDataAddon(existingCartItem);
      this.fillProductionTimeFromCartItem(existingCartItem);
      this.fillSize(existingCartItem);

      this.fillQuantity(existingCartItem);
    },
    fillExtraFacesDataAddon (existingCartItem: CartItem): void {
      const selectedBundleOptions = getSelectedBundleOptions(existingCartItem);

      if (!this.addons.length || !selectedBundleOptions.length) {
        this.fillEmptyExtraFacesDataAddon();
        return;
      }

      const selectedAddon: ExtraPhotoAddonOption | undefined = this.addons.find(
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
    fillSize (existingCartItem: CartItem): void {
      const selectedBundleOptions = getSelectedBundleOptions(existingCartItem);

      if (!this.sizesOptions.length || !selectedBundleOptions.length) {
        this.fillEmptySize();
        return;
      }

      const selectedSize: SizeOption | undefined = this.sizesOptions.find(
        (sizeOption) => selectedBundleOptions.find(
          (selectedOption) => selectedOption.option_id === sizeOption.optionId &&
          selectedOption.option_selections.includes(Number.parseInt(sizeOption.optionValueId))
        )
      );

      this.selectedSize = selectedSize;
    },
    fillQuantity (existingCartItem: CartItem): void {
      this.quantity = existingCartItem.qty;
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
        throw new Error('Cart item is undefined');
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
              uploadMethod: 'upload-now',
              bodyparts: this.getBodypartsData()
            }),
            forceUpdateServerItem: true
          });
        } catch (err) {
          if (err instanceof ServerError) {
            throw err;
          }

          Logger.error(err, 'budsies')();
        }

        this.onSuccess();
      } catch (err) {
        Logger.error(err, 'budsies')();

        this.onFailure('Unexpected error: ' + err);
      } finally {
        this.isSubmitting = false;
      }
    }
  },
  created (): void {
    if (this.product.qty) {
      this.quantity = this.product.qty;
    }

    if (this.existingCartItem) {
      this.fillProductDataFromExistingCartItem(this.existingCartItem);
    }

    if (this.selectedSize) {
      return;
    }

    this.fillDefaultSize();
  },
  beforeDestroy () {
    unMapMobileObserver();
  },
  watch: {
    addons () {
      if (!this.existingCartItem) {
        return;
      }

      this.fillExtraFacesDataAddon(this.existingCartItem);
    },
    availableStyles: {
      handler (): void {
        // SfSelect doesn't support options updating in the current package version
        this.shouldShowDesignSelector = false;

        this.$nextTick(() => {
          this.shouldShowDesignSelector = true;
        });
      }
    },
    existingCartItem (newValue?: CartItem, oldValue?: CartItem) {
      if (oldValue && !newValue) {
        this.cleanExistingProductData();
      }

      if (newValue) {
        this.fillProductDataFromExistingCartItem(newValue);
      }
    },
    product: {
      handler (newValue: Product, oldValue: Product | undefined) {
        if (newValue.id === oldValue?.id) {
          return;
        }

        this.fillEmptyBodypartsValues();
        this.fillDefaultSize();

        if (!this.selectedStyle && this.hasOnlyOneAvailableStyle) {
          this.selectStyle(this.availableStyles[0].value);
        }

        const extraFacesComponent = this.getExtraFaces();
        if (extraFacesComponent) {
          extraFacesComponent.reset();
        }

        this.validationObserver?.reset();
      },
      immediate: true
    },
    selectedStyle: {
      handler (val: string | undefined, oldVal: string | undefined) {
        if (val === oldVal) {
          return;
        }

        this.fillEmptyBodypartsValues();

        if (!this.styleBundleOption) {
          Logger.error('styleBundleOption is not defined while attempt to set style was performed', 'budsies')();
          return;
        }

        if (!val && this.hasOnlyOneAvailableStyle) {
          this.selectStyle(this.availableStyles[0].value);
          return;
        }

        const selectedDesign = this.availableStyles.find(design => design.value === val);

        this.setBundleOptionValue({
          optionId: this.styleBundleOption.option_id,
          optionQty: 1,
          optionSelections: selectedDesign ? [selectedDesign.optionValueId] : []
        });

        const styleOptionValidationProvider = this.getStyleOptionValidationProvider();

        if (!styleOptionValidationProvider) {
          return;
        }

        this.$nextTick().then(() => {
          styleOptionValidationProvider.validate();
        });
      },
      immediate: true
    },
    extraFacesDataAddon: {
      handler (newValue: ExtraPhotoAddonOption | undefined) {
        if (!this.addonsBundleOption) {
          return
        }

        this.setBundleOptionValue({
          optionId: this.addonsBundleOption.option_id,
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
@import "~@storefront-ui/shared/styles/helpers/typography";
@import "~@storefront-ui/shared/styles/components/atoms/SfHeading";

.o-printed-product-order-form {
    ._info {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    ._info > div {
      width: 100%;
      flex-grow: 1;
    }

    ._product-name-desktop {
        display: none;
    }

    ._short-description {
      @include font(
        --product-description-font,
        var(--font-light),
        var(--font-base),
        1.6,
        var(--font-family-primary)
      );
    }

    ._price,
    ._size-selector,
    ._additional-options,
    ._artwork-upload,
    ._qty-container,
    ._actions,
    ._production-time-selector {
        margin-top: var(--spacer-base);
    }

    ._design-option-list {
        display: block;
    }

    ._actions {
        ._add-to-cart {
            margin: 0;
            width: 100%;
        }
    }

    ._step-title {
        font-size: var(--font-base);
        font-weight: 800;
        text-align: left;
    }

    ._bodypart-selector-container {
      margin-top: var(--spacer-base);
    }

    ._bodypart-selector {
      margin-top: var(--spacer-xs);
      text-align: center;
    }

    ._production-time-selector {
      --production-time-selector-option-font-size: var(--font-base);
      --heading-title-font-size: var(--font-base);
      --heading-title-font-weight: var(--font-bold);
      --select-margin: var(--spacer-xs) 0 0;

      &::v-deep .sf-heading {
        --heading-text-align: left;
      }
    }

    ._artwork-upload {
        ._uploader-wrapper {
            margin-top: 0.25em;
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
        font-size: 0.8em;
        margin-top: 0.5em;
    }

    ._titled-artwork-upload {
      margin-top: var(--spacer-base);
    }

    ._product-name-mobile {
      margin-top: var(--spacer-lg);
    }

    ._gallery {
      margin-top: var(--spacer-xs);
    }

  ._form-errors {
    margin-top: var(--spacer-xl);
  }

    ._description {
        margin-top: calc(var(--spacer-lg) * 2);

        ._product-description {
            margin-top: 1em;

            ::v-deep h1,
            ::v-deep h2,
            ::v-deep h3,
            ::v-deep h4,
            ::v-deep h5,
            ::v-deep h6 {
              //@extend .sf-heading;
              text-align: var(--heading-text-align, center);
              margin-top: var(--spacer-lg);
              @extend .sf-heading__title;
            }

            ::v-deep h2 {
              @extend .sf-heading__title--h2;
            }

            ::v-deep h3 {
              @extend .sf-heading__title--h3;
            }

            ::v-deep h4 {
              @extend .sf-heading__title--h4;
            }

            ::v-deep h5 {
              @extend .sf-heading__title--h5;
            }

            ::v-deep h6 {
              @extend .sf-heading__title--h6;
            }
        }
    }

    .sf-select {
      --select-padding: 0;
    }

    .sf-select-option[disabled] {
      pointer-events: none;
      opacity: 0.8;
    }

    &.-skin-budsies,
    &.-skin-petsies {
        ._error-text {
            color: var(--c-danger-variant);
        }
    }

  .truevault-polaris-privacy-notice {
    margin-top: var(--spacer-sm);
    display: inline-block;
  }

  @media (min-width: $tablet-min) {
    ._info {
      flex-direction: row;
    }

    ._info > div {
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
  }
}
</style>
