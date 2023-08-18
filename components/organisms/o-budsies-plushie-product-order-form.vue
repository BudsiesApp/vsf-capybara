<template>
  <div class="o-budsies-plushie-product-order-form" :class="skinClass">
    <SfHeading
      :level="1"
      :title="pageTitle"
      class="_title"
    />

    <MBlockStory
      :story-slug="topStorySlug"
      class="_top-block"
      v-if="topStorySlug"
    />

    <validation-observer
      v-slot="{errors: formErrors}"
      ref="validationObserver"
    >
      <form @submit.prevent="onSubmit">
        <div class="_step">
          <SfHeading
            class="_step-title" :level="3" :title="$t('Step {number}', {number: 1})"
          />

          <SfHeading
            class="_step-subtitle -required"
            :level="3"
            :title="$t('Upload Your Artwork')"
            :ref="getFieldAnchorName('Artwork')"
          />

          <div class="_content">
            <div class="_upload-now" v-show="isUploadNow">
              <p>
                {{ artworkUploadTopHelperText }}.
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

                <slot name="artwork-upload-bottom-block" />

                <div class="_error-text">
                  {{ errors[0] }}
                </div>
              </validation-provider>
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
                href="mailto:art@budsies.com"
              >art@budsies.com</a>
            </p>

            <p>{{ $t('Include this design\'s magic word in the subject line of the email:') }}</p>
            <p><b>{{ shortcode }}</b></p>

            <p>
              {{ $t('Don\'t worry, we\'ll send you a reminder with this code after you complete your order.') }}
              <br>
              {{ emailUploadImagesCountText }}
              <br> <a
                class="_popup-link"
                href="mailto:art@budsies.com"
              >Art@budsies.com</a>
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

          <SfHeading
            class="_step-subtitle -required"
            :level="3"
            :title="customizeStepSubtitle"
            :ref="getFieldAnchorName('Description')"
          />

          <div class="_content">
            <validation-provider
              v-slot="{ errors }"
              rules="required"
              :name="`'${$t('Description')}''`"
            >
              <textarea
                name="description"
                rows="4"
                v-model="description"
                :placeholder="descriptionPlaceholderText"
                :disabled="isSubmitting"
              />

              <div class="_helper-text">
                <slot name="description-helper-text" />
              </div>

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
                class="-required _step-subtitle _body-part-heading"
                :level="3"
                :title="bodypart.name"
                :ref="getFieldAnchorName(bodypart.name)"
              />

              <m-bodypart-option-configurator
                class="_options-list"
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

                <a
                  class="_popup-link"
                  href="javascript:void(0)"
                  @click="showQuantityNotes = true"
                >{{ $t('Quantity & Shipping Discounts') }}</a>
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
              >
                <template #subtitle>
                  <p>
                    {{ $t('Skip to the front of the line!') }}
                  </p>
                </template>
              </MProductionTimeSelector>

              <span class="_production-time-hint">
                {{ $t('*We will refund the rush fee in the unlikely event we do not meet a promised delivery date.') }}
              </span>
            </div>
          </div>
        </div>

        <div class="_step" v-if="showAddonsStep">
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
              :get-field-anchor-name="getFieldAnchorName"
            />
          </div>
        </div>

        <div class="_step" v-show="showEmailStep">
          <SfDivider class="_step-divider" />

          <SfHeading
            class="_step-title"
            :level="3"
            :title="$t('Step {number}', {number: emailStepNumber})"
          />

          <SfHeading
            class="_step-subtitle -required"
            :level="3"
            :title="$t('Enter your email address')"
            :ref="getFieldAnchorName('Email')"
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
        </div>

        <MBlockStory
          :story-slug="bottomStorySlug"
          class="_bottom-block"
          v-if="bottomStorySlug"
        />

        <div class="_agreement">
          {{ $t('I agree to') }}
          <router-link to="/terms-of-service/" target="_blank">
            {{ $t('Terms of Service') }},
          </router-link>

          <router-link to="/privacy-policy/" target="_blank">
            {{ $t('Privacy Policy') }},
          </router-link>

          {{ $t('and') }}
          <a href="http://support.budsies.com/support/solutions/folders/5000249005" target="_blank">{{ $t('Refund Policy') }}</a>.
          {{ $t('I understand that Budsies happily takes care of all tears, defects, and shipping damage with either a refund or a repair.') }}
        </div>
      </form>
    </validation-observer>

    <SfModal
      :visible="showQuantityNotes"
      @close="showQuantityNotes = false"
    >
      <div class="_popup-content">
        <MBlockStory story-slug="budsies_shipping_qty_discount_popup_content" />
      </div>
    </SfModal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { PropType, defineComponent, ref, Ref, inject } from '@vue/composition-api';
import { extend, ValidationObserver, ValidationProvider } from 'vee-validate';
import { required, email } from 'vee-validate/dist/rules';
import { TranslateResult } from 'vue-i18n';
import { SfButton, SfDivider, SfHeading, SfInput, SfModal } from '@storefront-ui/vue';
import i18n from '@vue-storefront/core/i18n';
import { Logger } from '@vue-storefront/core/lib/logger';
import { localizedRoute } from '@vue-storefront/core/lib/multistore';
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
import { CustomerImage, ServerError } from 'src/modules/shared';
import { getAddonOptionsFromBundleOption } from 'theme/helpers/get-addon-options-from-bundle-option.function';
import { useFormValidation } from 'theme/helpers/use-form-validation';
import getProductionTimeOptions from 'theme/helpers/get-production-time-options';
import getCurrentThemeClass from 'theme/helpers/get-current-theme-class';

import AddonOption from '../interfaces/addon-option.interface';
import SelectedAddon from '../interfaces/selected-addon.interface';
import ProductionTimeOption from '../interfaces/production-time-option.interface';

import ACustomProductQuantity from '../atoms/a-custom-product-quantity.vue';
import MAddonsSelector from '../molecules/m-addons-selector.vue';
import MArtworkUpload from '../molecules/m-artwork-upload.vue';
import MBlockStory from '../molecules/m-block-story.vue';
import MFormErrors from '../molecules/m-form-errors.vue';
import MBodypartOptionConfigurator from '../molecules/m-bodypart-option-configurator.vue';
import MProductionTimeSelector from '../molecules/m-production-time-selector.vue';

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

extend('email', {
  ...email,
  message: 'Please, provide the correct email address'
});

export default defineComponent({
  name: 'OBudsiesPlushieProductOrderForm',
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

    return {
      imageHandlerService,
      validationObserver,
      window,
      ...useFormValidation(
        validationObserver,
        () => setupContext.refs
      )
    }
  },
  components: {
    SfInput,
    MBodypartOptionConfigurator,
    ValidationObserver,
    ValidationProvider,
    ACustomProductQuantity,
    MArtworkUpload,
    MAddonsSelector,
    MProductionTimeSelector,
    SfButton,
    SfDivider,
    SfModal,
    SfHeading,
    MBlockStory,
    MFormErrors
  },
  props: {
    artworkUploadUrl: {
      type: String,
      required: true
    },
    artworkUploadTopHelperText: {
      type: String,
      required: true
    },
    bottomStorySlug: {
      type: String,
      required: true
    },
    customizeStepSubtitle: {
      type: String,
      required: true
    },
    descriptionPlaceholderText: {
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
    existingPlushieId: {
      type: String,
      default: undefined
    },
    emailUploadImagesCountText: {
      type: String,
      required: true
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
      initialCustomerImages: [] as CustomerImage[],
      plushieId: undefined as number | undefined,
      productionTime: undefined as ProductionTimeOption | undefined
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
    emailStepNumber (): number {
      return this.showAddonsStep ? 4 : 3;
    },
    isUploadNow (): boolean {
      return this.uploadMethod === ImageUploadMethod.NOW;
    },
    backendProductId (): ProductValue | undefined {
      switch (this.product.id) {
        case 11:
        case 428:
          return ProductValue.BUDSIE;
        case 12:
        case 430:
          return ProductValue.SELFIE;
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
    shortcode (): string | undefined {
      return this.$store.getters['budsies/getPlushieShortcode'](this.plushieId);
    },
    submitButtonText (): TranslateResult {
      return this.existingCartItem
        ? this.$t('Update')
        : this.$t('Add to Cart');
    },
    showAddonsStep (): boolean {
      return this.addons.length > 0;
    },
    showProductionTimeOptions (): boolean {
      return this.productionTimeOptions.length > 0;
    },
    skinClass (): string {
      return getCurrentThemeClass();
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
              upgradeOptionValues: this.getUpgradeOptionValues()
            })
          });
        } catch (error) {
          if (error instanceof ServerError) {
            throw error;
          }

          Logger.error(error, 'budsies')();
        }

        this.showEmailStep = false;

        if (!shouldMakeAnother) {
          this.goToCrossSells();
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
          const upgradeOptionValues = cartItem.upgradeOptionValues?.find(
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
      this.fillProductionTime(existingCartItem);
    },
    fillProductionTime (cartItem: CartItem): void {
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
    goToCart (): void {
      this.$router.push(localizedRoute({ name: 'detailed-cart' }));
    },
    goToCrossSells (): void {
      this.$router.push(localizedRoute({
        name: 'cross-sells',
        params: { parentSku: this.product.sku }
      }
      ));
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
      this.uploadMethod = ImageUploadMethod.NOW;
      this.selectedAddons = [];
      this.bodypartsValues = {};
      this.description = '';
      this.plushieId = undefined;

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
          await this.updateClientAndServerItem({
            product: Object.assign({}, existingCartItem, {
              qty: this.quantity,
              plushieId: this.plushieId + '',
              email: this.email,
              plushieDescription: this.description,
              bodyparts: this.getBodypartsData(),
              customerImages: this.isUploadNow && this.customerImages ? this.customerImages : [],
              uploadMethod: this.uploadMethod,
              upgradeOptionValues: this.getUpgradeOptionValues(),
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
    },
    productionTime: {
      handler (newValue: ProductionTimeOption | undefined) {
        if (!this.productionTimeBundleOption) {
          return
        }

        this.setBundleOptionValue(
          this.productionTimeBundleOption.option_id,
          1,
          newValue?.optionValueId ? [newValue.optionValueId] : []
        );
      },
      immediate: false
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "~@storefront-ui/shared/styles/helpers/layout";
@import "theme/css/mixins/body-part";

.o-budsies-plushie-product-order-form {
  text-align: center;

  ._title {
    margin-top: var(--spacer-lg);
  }

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

  ._production-time-selector-section {
    margin-top: var(--spacer-base);
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
  }

  ._bottom-block {
    margin-top: var(--spacer-base);
  }

  ._agreement {
    margin: var(--spacer-xl) auto 0;
    font-size: var(--font-xs);
    text-align: left;
    max-width: 45rem;
  }

  &.-skin-budsies {
    ._body-part-heading {
      @include heading-background;
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
