<template>
  <div class="o-clay-product-order-form">
    <SfHeading
      :level="1"
      :title="pageTitle"
    />

    <MBlockStory
      :story-slug="topStorySlug"
      class="_top-block"
      v-if="topStorySlug"
    />

    <validation-observer v-slot="{passes}" ref="validation-observer">
      <form @submit.prevent="() => passes(() => onSubmit())">
        <div class="_step">
          <SfDivider class="_step-divider" />

          <SfHeading class="_step-title" :level="3" :title="$t('Step {number}', {number: 1})" />

          <SfHeading class="_step-subtitle -required" :level="3" :title="$t('Upload Your Photo')" />

          <div class="_content">
            <div class="_upload-now" v-show="isUploadNow">
              <p>
                {{ $t('We recommend 3 photos from different angles. Please try to show your pet\'s special markings') }}.
              </p>

              <p>
                {{ $t('Don\'t have your photos? You can finalize your order and') }} <a
                  class="_popup-link"
                  href="javascript:void(0)"
                  @click.stop.prevent="switchToUploadLater"
                >{{ $t('send them to us later.') }}</a>
              </p>

              <validation-provider
                v-slot="{ errors }"
                name="'Artwork'"
                :rules="isUploadNow ? 'required' : ''"
                tag="div"
              >
                <input
                  type="hidden"
                  name="uploaded_artwork_ids[]"
                  :value="customerImages"
                >

                <m-artwork-upload
                  ref="artwork-upload"
                  :product-id="backendProductId"
                  :disabled="isSubmitting"
                  :upload-url="artworkUploadUrl"
                  :initial-items="initialCustomerImages"
                  :max-files="3"
                  :allow-multiple="true"
                  @file-added="onArtworkAdd"
                  @file-removed="onArtworkRemove"
                  v-if="backendProductId"
                />

                <div class="_error-text">
                  {{ errors[0] }}
                </div>
              </validation-provider>

              <div class="_helper-text">
                {{ $t('You may provide up to 3 photos') }}

                <br>

                {{ $t('Read our') }} <a
                  class="_popup-link"
                  href="javascript:void(0)"
                  @click.stop.prevent="showPhotoTips = true"
                >{{ $t('photo tips!') }}</a>
              </div>
            </div>
          </div>

          <div class="_upload-email" v-show="!isUploadNow">
            <p>
              {{ $t('Want to upload photos now? Please use') }} <a
                class="_popup-link"
                href="javascript:void(0)"
                @click.stop.prevent="switchToUploadNow"
              >{{ $t('our uploader.') }}</a>
            </p>

            <p>
              {{ $t('When you\'re ready, please email a photo of the design to:') }} <br> <a
                class="_popup-link"
                href="mailto:photos@mypetsies.com"
              >photos@mypetsies.com</a>
            </p>

            <p>{{ $t('Include this design\'s magic word in the subject line of the email:') }}</p>
            <p><b>{{ shortcode }}</b></p>

            <p>
              {{ $t('Don\'t worry, we\'ll send you a reminder with this code after you complete your order.') }}
              <br>
              {{ $t('You may include up to 3 photos in your email (all of the same pet)') }}
              <br> <a
                class="_popup-link"
                href="mailto:photos@mypetsies.com"
              >photos@mypetsies.com</a>
              {{ $t('is an automated inbox used only for receiving images.') }}
            </p>

            <p>
              {{ $t('NOTE: Proceed to Step 2 to complete your order. You may send us your photo within the next 5 days.') }}
            </p>
          </div>
        </div>

        <div class="_step">
          <SfDivider class="_step-divider" />

          <SfHeading class="_step-title" :level="3" :title="$t('Step {number}', {number: 2})" />

          <SfHeading class="_step-subtitle -required" :level="3" :title="customizeStepSubtitle" />

          <div class="_content">
            <validation-provider
              v-slot="{ errors }"
              rules="required"
              :name="$t('Description')"
            >
              <textarea
                name="description"
                rows="4"
                v-model="description"
                :placeholder="$t('Tell us about your pet\'s coloration and defining feature(s).')"
                :disabled="isSubmitting"
              />

              <div class="_error-text">
                {{ errors[0] }}
              </div>
            </validation-provider>

            <validation-provider
              v-slot="{ errors }"
              class="_bodypart _section"
              :rules="bodypart.isRequired ? 'required' : ''"
              :name="`'${bodypart.name}'`"
              v-for="bodypart in bodyparts"
              :key="bodypart.id"
              tag="div"
            >
              <SfHeading
                class="-required "
                :level="3"
                :title="bodypart.name"
              />

              <div
                class="_helper-text"
                v-if="bodypart.code === 'forevers_color_palette'"
              >
                {{ $t('You may select up to 3 most prominent color(s) of your animal to assist our team.') }}
              </div>

              <div
                v-if="bodypart.code === 'eye_color'"
              >
                (<a
                  class="_popup-link"
                  href="javascript:void(0)"
                  @click="showEyeColorNotes = true"
                ><b>?</b></a>)
              </div>

              <m-bodypart-option-configurator
                class="_options-list"
                :name="bodypart.code"
                v-model="bodypartsValues[bodypart.id]"
                :max-values="bodypart.maxValues"
                type="bodypart"
                :disabled="isSubmitting"
              />

              <div
                class="_helper-text"
                v-if="bodypart.code === 'forevers_color_palette'"
              >
                {{ $t('Click a selected color to deselect it') }}. <br>

                {{ $t('Your color input is especially helpful when photos are blurry or poorly lit. If left blank, our designers will use their professional judgement.') }}
              </div>

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
              <div class="_quantity-field" :class="classes">
                <SfHeading
                  class="_step-subtitle -required "
                  :level="3"
                  title="Quantity"
                />

                <ACustomProductQuantity
                  v-model="quantity"
                  class="_qty-container"
                  :disabled="isSubmitting"
                />

                <div class="_error-text">
                  {{ errors[0] }}
                </div>

                <a
                  class="_popup-link"
                  href="javascript:void(0)"
                  @click="showQuantityNotes = true"
                >{{ $t('Quantity & Shipping Discounts') }}</a>
              </div>
            </validation-provider>
          </div>
        </div>

        <div class="_step">
          <SfDivider class="_step-divider" />

          <SfHeading class="_step-title" :level="3" :title="$t('Step {number}', {number: 3})" />

          <SfHeading
            class="_step-subtitle"
            :level="3"
            :title="upgradesSubtitle"
          />

          <p>
            {{ upgradesText }}
          </p>

          <div class="_content">
            <MAddonsSelector
              v-model="selectedAddons"
              :addons="addons"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <div class="_step" v-show="showEmailStep">
          <SfDivider class="_step-divider" />

          <SfHeading class="_step-title" :level="3" :title="$t('Step {number}', {number: 4})" />

          <SfHeading
            class="_step-subtitle -required"
            :level="3"
            :title="$t('Enter your email address')"
          />

          <div class="_content">
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

              <div><b>{{ $t('Sometimes our team has questions about your design') }}</b></div>
            </validation-provider>
          </div>
        </div>

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
        </div>

        <MBlockStory
          :story-slug="bottomStorySlug"
          v-if="bottomStorySlug"
        />
      </form>
    </validation-observer>

    <SfModal
      :visible="showQuantityNotes"
      @close="showQuantityNotes = false"
    >
      <div class="_popup-content">
        <MBlockStory story-slug="petsies_shipping_qty_discount_popup_content" />
      </div>
    </SfModal>

    <SfModal
      :visible="showEyeColorNotes"
      @close="showEyeColorNotes = false"
    >
      <div class="_popup-content">
        {{ $t('If your pet has different color eyes,') }} <br>
        {{ $t('please indicate in Special Instructions') }}
      </div>
    </SfModal>

    <SfModal
      :visible="showPhotoTips"
      @close="showPhotoTips = false"
    >
      <div class="_popup-content">
        <SfHeading :title="$t('Photo Tips')" :level="3" />

        <ul class="_photo-tips">
          <li>
            {{ $t('Provide a clear photo of the face') }}
          </li>

          <li>
            {{ $t('Please include a photo of the full body') }}
          </li>

          <li>
            {{ $t('Side and back views are also encouraged') }}
          </li>
        </ul>
      </div>
    </SfModal>
  </div>
</template>

<script lang="ts">
import { extend, ValidationObserver, ValidationProvider } from 'vee-validate';
import { required, email } from 'vee-validate/dist/rules';
import Vue, { PropType, VueConstructor } from 'vue';
import { TranslateResult } from 'vue-i18n';
import { SfButton, SfDivider, SfHeading, SfInput, SfModal } from '@storefront-ui/vue';
import i18n from '@vue-storefront/core/i18n';
import { Logger } from '@vue-storefront/core/lib/logger';
import { notifications } from '@vue-storefront/core/modules/cart/helpers';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';
import { setBundleProductOptionsAsync } from '@vue-storefront/core/modules/catalog/helpers';
import * as catalogTypes from '@vue-storefront/core/modules/catalog/store/product/mutation-types';

import {
  vuexTypes as budsiesTypes,
  Bodypart,
  BodypartValue,
  ImageUploadMethod,
  ProductValue,
  BodypartOption
} from 'src/modules/budsies';
import { BundleOption } from 'core/modules/catalog/types/BundleOption';
import Product from 'core/modules/catalog/types/Product';
import { ImageHandlerService, Item } from 'src/modules/file-storage';
import { InjectType, CustomerImage, ServerError } from 'src/modules/shared';
import { getAddonOptionsFromBundleOption } from 'theme/helpers/get-addon-options-from-bundle-option.function';

import AddonOption from '../interfaces/addon-option.interface';
import SelectedAddon from '../interfaces/selected-addon.interface';

import ACustomProductQuantity from '../atoms/a-custom-product-quantity.vue';
import MAddonsSelector from '../molecules/m-addons-selector.vue';
import MArtworkUpload from '../molecules/m-artwork-upload.vue';
import MBlockStory from '../molecules/m-block-story.vue';
import MBodypartOptionConfigurator from '../molecules/m-bodypart-option-configurator.vue';

interface InjectedServices {
  imageHandlerService: ImageHandlerService,
  window: Window
}

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

extend('email', {
  ...email,
  message: 'Please, provide the correct email address'
});

export default (Vue as VueConstructor<Vue & InjectedServices>).extend({
  name: 'OClayProductOrderForm',
  components: {
    SfInput,
    MBodypartOptionConfigurator,
    ValidationObserver,
    ValidationProvider,
    ACustomProductQuantity,
    MArtworkUpload,
    MAddonsSelector,
    SfButton,
    SfDivider,
    SfModal,
    SfHeading,
    MBlockStory
  },
  inject: {
    imageHandlerService: { from: 'ImageHandlerService' },
    window: { from: 'WindowObject' }
  } as unknown as InjectType<InjectedServices>,
  props: {
    artworkUploadUrl: {
      type: String,
      required: true
    },
    customizeStepSubtitle: {
      type: String,
      required: true
    },
    pageTitle: {
      type: String,
      required: true
    },
    product: {
      type: Object as PropType<Product>,
      required: true
    },
    topStorySlug: {
      type: String,
      required: true
    },
    upgradesSubtitle: {
      type: String,
      required: true
    },
    upgradesText: {
      type: String,
      required: true
    },
    bottomStorySlug: {
      type: String,
      default: undefined
    },
    existingPlushieId: {
      type: String,
      default: undefined
    }
  },
  data () {
    return {
      quantity: 1,
      customerImages: [] as CustomerImage[],
      bodypartsValues: {} as unknown as Record<string, BodypartOption | BodypartOption[] | undefined>,
      email: undefined as string | undefined,
      isSubmitting: false,
      shouldMakeAnother: false,
      showQuantityNotes: false,
      showEmailStep: true,
      uploadMethod: ImageUploadMethod.NOW,
      selectedAddons: [] as SelectedAddon[],
      description: '',
      showEyeColorNotes: false,
      showPhotoTips: false,
      initialCustomerImages: [] as CustomerImage[],
      plushieId: undefined as number | undefined
    }
  },
  computed: {
    activeProduct (): Product | CartItem | null {
      return this.existingCartItem ? this.existingCartItem : this.product;
    },
    addons (): AddonOption[] {
      if (!this.addonsBundleOption) {
        return []
      }

      return getAddonOptionsFromBundleOption(this.addonsBundleOption);
    },
    addonsBundleOption (): BundleOption | undefined {
      return this.getBundleOption('addons');
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
    isUploadNow (): boolean {
      return this.uploadMethod === ImageUploadMethod.NOW;
    },
    backendProductId (): ProductValue | undefined {
      switch (this.product.id) {
        case 532:
          return ProductValue.PETSIES_FIGURINES;
        case 528:
          return ProductValue.PETSIES_BOBBLEHEADS;
        default:
          throw new Error(
            `Can't resolve Backend product ID for Magento '${this.product.id}' product ID`
          );
      }
    },
    bodyparts (): Bodypart[] {
      return this.$store.getters['budsies/getProductBodyparts'](this.product.id);
    },
    getBodypartOptions (): (id: string) => BodypartOption[] {
      return this.$store.getters['budsies/getBodypartOptions']
    },
    shortcode (): string | undefined {
      return this.$store.getters['budsies/getPlushieShortcode'](this.plushieId);
    },
    submitButtonText (): TranslateResult {
      return this.existingCartItem
        ? this.$t('Update')
        : this.$t('Add to Cart');
    }
  },
  methods: {
    async addToCart (): Promise<void> {
      const shouldMakeAnother = this.shouldMakeAnother;
      this.shouldMakeAnother = false;

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
          await this.$store.dispatch('cart/addItem', {
            productToAdd: Object.assign({}, this.product, {
              qty: this.quantity,
              plushieId: this.plushieId + '',
              email: this.email,
              plushieDescription: this.description,
              bodyparts: this.getBodypartsData(),
              customerImages: this.isUploadNow && this.customerImages ? this.customerImages : [],
              uploadMethod: this.uploadMethod,
              upgrade_option_values: this.getUpgradeOptionValues()
            })
          });
        } catch (error) {
          if (error instanceof ServerError) {
            throw error;
          }

          Logger.error(error, 'budsies')();
        }

        if (!shouldMakeAnother) {
          this.goToCart();
          return;
        }

        this.onSuccessAndMakeAnother();
      } catch (error) {
        Logger.error(error, 'budsies')();

        this.onFailure('Unexpected error: ' + error);
      }
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
    fillAddons (cartItem: CartItem): void {
      const productOption = cartItem.product_option;
      this.selectedAddons = [];

      if (!this.addonsBundleOption || !productOption) {
        return;
      }

      if (!productOption.extension_attributes.bundle_options[this.addonsBundleOption.option_id]) {
        return;
      }
      const optionSelections = productOption.extension_attributes.bundle_options[this.addonsBundleOption.option_id].option_selections;

      this.selectedAddons = optionSelections.map((selection: number) => {
        const addon = this.addons.find((addon) => addon.optionValueId === selection);
        let optionsValues = {};

        if (addon) {
          const upgradeOptionValues = cartItem.upgrade_option_values?.find(
            ({ upgradeSku }) => upgradeSku === addon.sku
          );

          optionsValues = upgradeOptionValues?.optionsValues || {};
        }

        return {
          addonOptionValueId: selection,
          optionsValues
        }
      });
    },
    fillBodypartsValues (existingCartItem: CartItem): void {
      this.bodypartsValues = {};

      if (!existingCartItem.bodyparts) {
        return;
      }

      const bodyparts: Record<string, any[]> = existingCartItem.bodyparts as Record<string, any[]>;

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
    fillCustomerImagesData (existingCartItem: CartItem): void {
      this.uploadMethod = existingCartItem.uploadMethod
        ? existingCartItem.uploadMethod as ImageUploadMethod
        : ImageUploadMethod.NOW;
      this.customerImages = existingCartItem.customerImages ? existingCartItem.customerImages : [];
      this.initialCustomerImages = this.customerImages;

      const artworkUploadComponent = this.getArtworkUploadComponent();

      if (!artworkUploadComponent) {
        return;
      }

      this.$nextTick(() => {
        artworkUploadComponent.initFiles();
      });
    },
    fillPlushieDataFromCartItem (existingCartItem: CartItem): void {
      this.description = existingCartItem.plushieDescription || '';
      this.quantity = existingCartItem.qty || 1;
      this.plushieId = Number(existingCartItem.plushieId);

      this.fillCustomerImagesData(existingCartItem);
      this.fillBodypartsValues(existingCartItem);
      this.fillAddons(existingCartItem);
    },
    getArtworkUploadComponent (): InstanceType<typeof MArtworkUpload> | undefined {
      return this.$refs['artwork-upload'] as InstanceType<typeof MArtworkUpload> | undefined;
    },
    getBodypartValuesOptions (bodypart: Bodypart): BodypartOption[] {
      const bodypartsValues: BodypartValue[] = this.$store.getters['budsies/getBodypartBodypartsValues'](bodypart.id);

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
    getBundleOption (optionTitle: string): BundleOption | undefined {
      if (!this.activeProduct?.bundle_options) {
        return undefined;
      }

      return this.activeProduct.bundle_options.find(
        (option: BundleOption) => option.title.toLowerCase() === optionTitle
      );
    },
    getUpgradeOptionValues () {
      return this.selectedAddons.map((selectedAddon) => {
        const addonItem = this.addons.find(({ optionValueId }) => optionValueId === selectedAddon.addonOptionValueId);

        if (!addonItem) {
          throw new Error('Unable to find addon by optionValueId');
        }

        return {
          upgradeSku: addonItem.sku,
          optionsValues: selectedAddon.optionsValues
        }
      })
    },
    getUploader (): InstanceType<typeof MArtworkUpload> | undefined {
      return this.$refs['artwork-upload'] as InstanceType<typeof MArtworkUpload> | undefined;
    },
    getValidationObserver (): InstanceType<typeof ValidationObserver> | undefined {
      return this.$refs['validation-observer'] as InstanceType<typeof ValidationObserver> | undefined;
    },
    goToCart (): void {
      this.$router.push({ name: 'detailed-cart' });
    },
    prefillEmail (): void {
      const customerEmail = this.$store.getters['budsies/getPrefilledCustomerEmail'];
      if (customerEmail) {
        this.email = customerEmail;
        this.showEmailStep = false;
      }
    },
    resetForm (): void {
      this.quantity = this.product.qty || 1;
      this.customerImages = [];
      this.initialCustomerImages = [];
      this.selectedAddons = [];
      this.bodypartsValues = {};
      this.description = '';
      this.plushieId = undefined;

      const uploader = this.getUploader();
      if (uploader) {
        uploader.clearInput();
      }

      const validator = this.getValidationObserver();
      validator?.reset();
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
      this.customerImages.push({
        id: value.id,
        url: this.imageHandlerService.getOriginalImageUrl(value.url)
      })
    },
    onArtworkRemove (storageItemId: string): void {
      const index = this.customerImages.findIndex(({ id }) => storageItemId === id);

      if (index < 0) {
        return;
      }

      this.customerImages.splice(index, 1);
    },
    async onSubmit (): Promise<void> {
      if (this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;

      try {
        if (!this.existingCartItem) {
          await this.addToCart();
        } else {
          await this.updateExistingCartItem(this.existingCartItem);
        }
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
        message: this.$t('Product was added to the cart').toString(),
        timeToLive: 5 * 1000
      });

      this.$store.dispatch(
        'notification/spawnNotification',
        notification,
        { root: true }
      );

      this.plushieId = await this.createPlushie();
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
    async updateExistingCartItem (existingCartItem: CartItem): Promise<void> {
      const shouldMakeAnother = this.shouldMakeAnother;
      this.shouldMakeAnother = false;

      try {
        try {
          await this.$store.dispatch('cart/addItem', {
            productToAdd: Object.assign({}, existingCartItem, {
              qty: this.quantity,
              plushieId: this.plushieId + '',
              email: this.email,
              plushieDescription: this.description,
              bodyparts: this.getBodypartsData(),
              customerImages: this.isUploadNow && this.customerImages ? this.customerImages : [],
              uploadMethod: this.uploadMethod,
              upgrade_option_values: this.getUpgradeOptionValues(),
              product_option: setBundleProductOptionsAsync(
                null,
                {
                  product: existingCartItem,
                  bundleOptions: this.$store.state.product.current_bundle_options
                }
              )
            })
          });
        } catch (error) {
          if (error instanceof ServerError) {
            throw error;
          }

          Logger.error(error, 'budsies')();
        }

        if (!shouldMakeAnother) {
          this.goToCart();
          return;
        }

        this.onSuccessAndMakeAnother();
      } catch (error) {
        Logger.error(error, 'budsies')();

        this.onFailure('Unexpected error: ' + error);
      }
    }
  },
  async beforeMount () {
    this.$bus.$once('budsies-store-synchronized', this.prefillEmail);
  },
  async mounted () {
    if (this.existingCartItem) {
      this.fillPlushieDataFromCartItem(this.existingCartItem);
      return;
    }

    this.plushieId = await this.createPlushie();
  },
  created (): void {
    this.resetForm();
    this.prefillEmail();
  },
  beforeDestroy () {
    this.$bus.$off('budsies-store-synchronized', this.prefillEmail);
  },
  watch: {
    existingPlushieId () {
      if (!this.existingCartItem) {
        return;
      }

      this.fillPlushieDataFromCartItem(this.existingCartItem);
    },
    async plushieId (id: number | undefined): Promise<void> {
      if (!id) {
        return;
      }

      await this.$store.dispatch('budsies/loadPlushieShortcode', { plushieId: id });
    },
    async 'product.sku' () {
      if (!this.existingCartItem || this.existingCartItem.sku !== this.product.sku) {
        if (this.existingCartItem) {
          await this.$router.replace({ query: undefined });
        }

        this.resetForm();
        this.plushieId = await this.createPlushie();
        return;
      }

      this.fillPlushieDataFromCartItem(this.existingCartItem);
    },
    selectedAddons (newValue: SelectedAddon[]) {
      if (!this.addonsBundleOption) {
        return
      }

      this.setBundleOptionValue(
        this.addonsBundleOption.option_id,
        1,
        newValue.map(({ addonOptionValueId }) => addonOptionValueId)
      );
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "~@storefront-ui/shared/styles/helpers/layout";

.o-clay-product-order-form {
  text-align: center;

  ._top-block {
    margin-top: var(--spacer-base);
  }

  b,
  strong {
    font-weight: var(--font-semibold);
  }

  ._step {
    margin-top: var(--spacer-lg);

    ._content {
      max-width: 720px;
      width: 100%;
      margin: 0 auto;
    }
  }

  ._step-divider {
    display: none;
  }

  ._step-title {
    @include border(--step-border, 0 0 4px 0, solid, var(--c-warning));
    --heading-title-color: var(--c-warning);
    --heading-title-margin: var(--spacer-xl) 0 0;
    --heading-title-font-size: var(--font-xl);

    display: inline-block;
    text-transform: uppercase;
  }

  ._photo-tips {
    margin-top: var(--spacer-base);
  }

  ._step-subtitle {
    --heading-title-font-weight: var(--font-semibold);
    --heading-title-font-size: var(--font-xl);
    --heading-title-margin: var(--spacer-base) 0 0;

    &.-required {
      ::v-deep .sf-heading__title::after {
        color: var(--c-danger-variant);
        content: "*";
      }
    }
  }

  ._popup-link {
    font-weight: var(--font-medium);
  }

  ._popup-content {
    text-align: left;
  }

  .sf-input {
    --input-width: 20em;

    text-align: center;
    display: inline-block;
  }

  .sf-divider {
    margin-top: var(--spacer-xl);
  }

  .m-bodypart-option-configurator {
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

  textarea {
    box-sizing: border-box;
    border: 1px solid var(--c-light);
    width: 100%;
    padding: 0.5em;
    font-family: var(--font-family-primary);
    resize: vertical;
    margin-top: var(--spacer-sm);
  }

  ._error-text {
    font-size: var(--font-xs);
    margin-top: var(--spacer-sm);
    height: calc(var(--font-xs) * 1.2);
    color: var(--c-danger-variant);
  }

  ._form-errors {
    margin-top: var(--spacer-xl);
    min-height: calc(var(--font-xs) * 1.2 * 4);

    ._error-link {
      color: inherit;
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
