<template>
  <div class="o-plushie-creation-wizard product" :class="skinClass">
    <SfHeading
      :level="1"
      :title="mainTitleText"
    />

    <div class="_content">
      <div class="_steps-container">
        <SfSteps
          class="_steps"
          :active="currentStep"
          :steps="steps"
          :can-go-back="canGoBack"
          @change="onChangeStep"
        >
          <SfStep name="Type">
            <MProductTypeChooseStep
              :value="productTypeStepData"
              :disabled="isBusy"
              :set-product-type-action="setProductType"
              :product-type-buttons-list="productTypeButtonsList"
              @next-step="nextStep"
            />
          </SfStep>

          <SfStep name="Photo">
            <MImageUploadStep
              :initial-value="imageUploadStepData"
              :artwork-upload-url="artworkUploadUrl"
              :product="activeProduct"
              :plushie-id="plushieId"
              :disabled="isBusy"
              :plushie-type="plushieType"
              :top-story-slug="imageUploadStepTopStorySlug"
              :bottom-story-slug="imageUploadStepBottomStorySlug"
              @input="onImageUploadStepDataInput"
              @next-step="nextStep"
              v-if="plushieId"
            />
          </SfStep>

          <SfStep name="Pet Info">
            <MPetInfoStep
              :value="petInfoStepData"
              :plushie-id="plushieId"
              :product="activeProduct"
              :disabled="isBusy"
              :plushie-type="plushieType"
              @next-step="nextStep"
              @input="onPetInfoStepDataInput"
            />
          </SfStep>

          <SfStep name="Customize">
            <MCustomizeStep
              v-model="customizeStepData"
              :plushie-id="plushieId"
              :product="activeProduct"
              :addons-bundle-option="addonsBundleOption"
              :production-time-bundle-option="productionTimeBundleOption"
              :size-bundle-option="sizeBundleOption"
              :sizes="sizes"
              :add-to-cart="onAddToCartHandler"
              :disabled="isBusy"
              :show-size-selector="showSizeSelector"
              @next-step="nextStep"
            />
          </SfStep>
        </SfSteps>
      </div>

      <MFloatingPhoto
        v-if="showFloatingPhoto"
        :image-url="floatingPhotoImageUrl"
        :pet-name="petInfoStepData.name"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType, VueConstructor } from 'vue';
import { TranslateResult } from 'vue-i18n';
import { Logger } from '@vue-storefront/core/lib/logger';
import i18n from '@vue-storefront/i18n';
import { setBundleProductOptionsAsync } from '@vue-storefront/core/modules/catalog/helpers';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { localizedRoute } from '@vue-storefront/core/lib/multistore';
import * as catalogTypes from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import { SfHeading, SfSteps } from '@storefront-ui/vue';
import Product from 'core/modules/catalog/types/Product';
import { BundleOption } from 'core/modules/catalog/types/BundleOption';
import CartItem from 'core/modules/cart/types/CartItem';

import {
  ImageUploadMethod,
  vuexTypes as budsiesTypes,
  BodypartOption,
  BodyPartValueContentType,
  PlushieWizardEvents
} from 'src/modules/budsies';
import ServerError from 'src/modules/shared/types/server-error';
import { CustomerImage, InjectType, getProductDefaultPrice } from 'src/modules/shared';

import foreversCreationWizardPersistedStateService from 'theme/helpers/plushie-creation-wizard-persisted-state.service';
import getForeversSizeSkuBySizeAndType from 'theme/helpers/get-forevers-size-sku-by-size-and-type.function';
import getForeversTypeByBundleSku from 'theme/helpers/get-forevers-type-by-bundle-sku.function';
import { getAddonOptionsFromBundleOption } from 'theme/helpers/get-addon-options-from-bundle-option.function';
import { PlushieType } from 'theme/interfaces/plushie.type';
import getPlushieSkuByTypes from 'theme/helpers/get-plushie-sku-by-types.function';
import PlushieProductType from 'theme/interfaces/plushie-product-type';
import getCurrentThemeClass from 'theme/helpers/get-current-theme-class';

import MProductTypeChooseStep from './OPlushieCreationWizard/m-product-type-choose-step.vue';
import MImageUploadStep from './OPlushieCreationWizard/m-image-upload-step.vue';
import MPetInfoStep from './OPlushieCreationWizard/m-pet-info-step.vue';
import MCustomizeStep from './OPlushieCreationWizard/m-customize-step.vue';
import MFloatingPhoto from './OPlushieCreationWizard/m-floating-photo.vue';

import PlushieWizardProductTypeStepData from '../interfaces/plushie-wizard-product-type-step-data.interface';
import PlushieWizardImageUploadStepData from '../interfaces/plushie-wizard-image-upload-step-data.interface';
import PlushieWizardPetInfoStepData from '../interfaces/plushie-wizard-pet-info-step-data.interface';
import PlushieWizardCustomizeStepData from '../interfaces/plushie-wizard-customize-step-data.interface';
import PlushieCreationWizardPersistedState from '../interfaces/plushie-creation-wizard-persisted-state.interface';
import SizeOption from '../interfaces/size-option';
import SelectedAddon from '../interfaces/selected-addon.interface';
import AddonOption from '../interfaces/addon-option.interface';
import ProductTypeButton from '../interfaces/product-type-button.interface';

interface InjectedServices {
  window: Window
}

export default (Vue as VueConstructor<Vue & InjectedServices>).extend({
  name: 'OPlushieCreationWizard',
  components: {
    SfSteps,
    SfHeading,
    MProductTypeChooseStep,
    MImageUploadStep,
    MPetInfoStep,
    MCustomizeStep,
    MFloatingPhoto
  },
  inject: {
    window: { from: 'WindowObject' }
  } as unknown as InjectType<InjectedServices>,
  props: {
    artworkUploadUrl: {
      type: String,
      required: true
    },
    existingPlushieId: {
      type: String,
      default: undefined
    },
    preselectedProductType: {
      type: String,
      default: undefined
    },
    preselectedSize: {
      type: String,
      default: undefined
    },
    plushieType: {
      type: String as PropType<PlushieType>,
      required: true
    }
  },
  data () {
    return {
      currentStep: 0,

      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      productTypeStepData: {
        product: undefined,
        plushieId: undefined
      } as PlushieWizardProductTypeStepData,
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      imageUploadStepData: {
        uploadMethod: ImageUploadMethod.NOW,
        customerImages: []
      } as PlushieWizardImageUploadStepData,
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      petInfoStepData: {
        name: undefined,
        breed: undefined,
        email: undefined
      } as PlushieWizardPetInfoStepData,
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      customizeStepData: {
        bodypartsValues: {},
        addons: [],
        description: undefined,
        productionTime: undefined,
        size: undefined,
        quantity: 1
      } as PlushieWizardCustomizeStepData,

      isSubmitting: false,
      isWizardInitializing: false
    }
  },
  computed: {
    addons (): AddonOption[] {
      if (!this.addonsBundleOption) {
        return []
      }

      return getAddonOptionsFromBundleOption(this.addonsBundleOption);
    },
    canGoBack (): boolean {
      return !this.isSubmitting && (this.currentStep !== 1 || !this.existingCartItem);
    },
    getBodypartOptions (): (id: string) => BodypartOption[] {
      return this.$store.getters['budsies/getBodypartOptions']
    },
    cartItems (): CartItem[] {
      return this.$store.getters['cart/getCartItems']
    },
    customerImages (): CustomerImage[] {
      if (this.imageUploadStepData.uploadMethod !== ImageUploadMethod.NOW) {
        return [];
      }

      return this.imageUploadStepData.customerImages;
    },
    isBusy (): boolean {
      return this.isSubmitting ||
       this.isWizardInitializing;
    },
    skinClass (): string {
      return getCurrentThemeClass();
    },
    activeProduct (): Product | CartItem | null {
      return this.existingCartItem ? this.existingCartItem : this.product;
    },
    product (): Product | null {
      return this.$store.getters['product/getCurrentProduct'];
    },
    plushieId (): number | undefined {
      return this.productTypeStepData.plushieId;
    },
    addonsBundleOption (): BundleOption | undefined {
      return this.getBundleOption('addons');
    },
    productionTimeBundleOption (): BundleOption | undefined {
      return this.getBundleOption('production time');
    },
    sizeBundleOption (): BundleOption | undefined {
      return this.getBundleOption('product');
    },
    sizes (): SizeOption[] {
      if (!this.sizeBundleOption) {
        return [];
      }

      let availableSizes: SizeOption[] = [];
      for (const productLink of this.sizeBundleOption.product_links) {
        if (
          !productLink.product ||
          ['simpleForeversDog', 'simpleForeversCat', 'simpleForeversOther']
            .includes(productLink.product.sku)
        ) {
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
    existingCartItem (): CartItem | undefined {
      return this.cartItems.find(({ plushieId }) => plushieId && String(plushieId) === this.existingPlushieId);
    },
    steps (): TranslateResult[] {
      return [
        this.$t('Type'),
        this.$t('Photo'),
        this.$t('Pet Info'),
        this.$t('Customize')
      ]
    },
    showFloatingPhoto (): boolean {
      return (this.currentStep === this.steps.length - 1) && !!this.floatingPhotoImageUrl;
    },
    floatingPhotoImageUrl (): string | undefined {
      return this.customerImages[0] ? this.customerImages[0].url : undefined;
    },
    imageUploadStepBottomStorySlug (): string {
      return this.plushieType === PlushieType.FOREVERS
        ? 'petsies_creation_page_bottom'
        : 'golf_cover_creation_page_bottom';
    },
    imageUploadStepTopStorySlug (): string {
      return this.plushieType === PlushieType.FOREVERS
        ? 'petsies_creation_page_top'
        : 'golf_cover_creation_page_top';
    },
    mainTitleText (): string {
      const title = this.plushieType === PlushieType.FOREVERS
        ? this.$t('Create Your Custom Forevers Plush')
        : this.$t('Create Your Custom Golf Head Covers');

      return title.toString();
    },
    showSizeSelector (): boolean {
      return this.plushieType === PlushieType.FOREVERS;
    },
    foreversProductTypeButtons (): ProductTypeButton[] {
      return [
        {
          title: this.$t('Forevers Dog').toString(),
          type: PlushieProductType.DOG,
          imageSrc: '/assets/plushies/dog-icon1_1.png'
        },
        {
          title: this.$t('Forevers Cat').toString(),
          type: PlushieProductType.CAT,
          imageSrc: '/assets/plushies/cat-icon1_1.png'
        },
        {
          title: this.$t('Forevers Other').toString(),
          type: PlushieProductType.OTHER,
          imageSrc: '/assets/plushies/other-icon1_1.png'
        }
      ]
    },
    golfCoversProductTypeButtons (): ProductTypeButton[] {
      return [
        {
          title: this.$t('Dog Golf Head Covers').toString(),
          type: PlushieProductType.DOG,
          imageSrc: '/assets/plushies/dog-icon1_1.png'
        },
        {
          title: this.$t('Cat Golf Head Covers').toString(),
          type: PlushieProductType.CAT,
          imageSrc: '/assets/plushies/cat-icon1_1.png'
        },
        {
          title: this.$t('Other Golf Head Covers').toString(),
          type: PlushieProductType.OTHER,
          imageSrc: '/assets/plushies/other-icon1_1.png'
        }
      ]
    },
    productTypeButtonsList (): ProductTypeButton[] {
      return this.plushieType === PlushieType.FOREVERS
        ? this.foreversProductTypeButtons
        : this.golfCoversProductTypeButtons;
    }
  },
  methods: {
    async addToCart (): Promise<void> {
      if (this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;

      await this.$store.dispatch(
        'product/setBundleOptions',
        { product: this.product, bundleOptions: this.$store.state.product.current_bundle_options }
      );

      this.$store.commit(
        budsiesTypes.SN_BUDSIES + '/' + budsiesTypes.CUSTOMER_EMAIL_SET,
        { email: this.petInfoStepData.email }
      );

      try {
        try {
          await this.$store.dispatch('cart/addItem', {
            productToAdd: Object.assign({}, this.product, {
              qty: this.customizeStepData.quantity,
              plushieId: this.plushieId + '',
              email: this.petInfoStepData.email?.trim(),
              plushieName: this.petInfoStepData.name?.trim(),
              plushieBreed: this.petInfoStepData.breed?.trim(),
              plushieDescription: this.customizeStepData.description?.trim(),
              bodyparts: this.getBodypartsData(),
              uploadMethod: this.imageUploadStepData.uploadMethod,
              customerImages: this.customerImages,
              upgradeOptionValues: this.getUpgradeOptionValues()
            })
          });
        } catch (error) {
          if (error instanceof ServerError) {
            throw error;
          }

          Logger.error(error, 'budsies')();
        }

        this.goToCrossSells();

        if (!this.plushieId) {
          throw new Error('Plushie Id is undefined');
        }

        await foreversCreationWizardPersistedStateService.removeStateByPlushieId(this.plushieId);
      } catch (error) {
        Logger.error(error, 'budsies')();

        this.onFailure('Unexpected error: ' + error);
      } finally {
        this.isSubmitting = false;
      }
    },
    clearPlushieRelatedStepsData (): void {
      this.imageUploadStepData.uploadMethod = ImageUploadMethod.NOW;
      this.imageUploadStepData.customerImages = [];

      this.petInfoStepData.name = undefined;
      this.petInfoStepData.breed = undefined;

      this.customizeStepData.bodypartsValues = {};
      this.customizeStepData.addons = [];
      this.customizeStepData.description = undefined;
      this.customizeStepData.productionTime = undefined;
      this.customizeStepData.size = undefined;
      this.customizeStepData.quantity = 1;
    },
    async setProductType (type: string): Promise<void> {
      const productSku: string = getPlushieSkuByTypes(type, this.plushieType);

      if (this.productTypeStepData.product?.sku === productSku) {
        return;
      }

      const product = await this.$store.dispatch('product/loadProduct', {
        parentSku: productSku,
        childSku: null
      });

      const plushieCreationTask = await this.$store.dispatch('budsies/createNewPlushie', { productId: product.id });

      const plushieId = plushieCreationTask.result;

      this.productTypeStepData = { product, plushieId };

      if (!this.existingCartItem) {
        await this.persistProductTypeStepData(this.productTypeStepData);
      }

      this.clearPlushieRelatedStepsData();

      this.fillSizeByPreselectedParamAndCurrentProduct();

      EventBus.$emit(
        PlushieWizardEvents.PLUSHIE_WIZARD_TYPE_CHANGE,
        {
          productType: type,
          plushieType: this.plushieType
        }
      );

      this.$router.push({ query: { ...this.$route.query, id: plushieId.toString(10) } });
    },
    fillAddons (cartItem: CartItem): void {
      const productOption = cartItem.product_option;
      this.customizeStepData.addons = [];

      if (!this.addonsBundleOption || !productOption) {
        return;
      }

      if (!productOption.extension_attributes.bundle_options[this.addonsBundleOption.option_id]) {
        return;
      }
      const optionSelections = productOption.extension_attributes.bundle_options[this.addonsBundleOption.option_id].option_selections;

      this.customizeStepData.addons = optionSelections.map((selection: number) => {
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
    fillBodypartsValues (cartItem: CartItem): void {
      this.customizeStepData.bodypartsValues = {};

      if (!cartItem.bodyparts) {
        return;
      }

      const bodyparts: Record<string, any[]> = cartItem.bodyparts as Record<string, any[]>;

      Object.keys(bodyparts).forEach((key: string) => {
        Vue.set(
          this.customizeStepData.bodypartsValues,
          key,
          this.getBodypartOptions(key).filter(
            (bodypartOption: BodypartOption) => bodyparts[key].includes(bodypartOption.id) ||
              bodyparts[key].includes(Number(bodypartOption.id))
          )
        );
      });
    },
    async fillPlushieDataFromCartItem (existingCartItem: CartItem): Promise<void> {
      this.currentStep = 1;

      this.fillImageUploadStepDataFromCartItem(existingCartItem);
      this.fillProductTypeStepDataFromCartItem(existingCartItem);
      this.fillPetInfoStepDataFromCartItem(existingCartItem);

      await this.loadProductOptions(existingCartItem.id);

      this.fillCustomizeStepDataFromCartItem(existingCartItem);
    },
    async fillPlushieDataFromPersistedState (): Promise<void> {
      const persistedState = await foreversCreationWizardPersistedStateService.getStateByPlushieId(Number.parseInt(this.existingPlushieId));

      if (!persistedState) {
        return;
      }

      await this.fillProductTypeStepDataFromPersistedState(persistedState);
      this.fillImageUploadStepDataFromPersistedState(persistedState);
      this.fillPetInfoStepDataFromPersistedState(persistedState);

      this.currentStep = persistedState.currentStepIndex ? persistedState.currentStepIndex : 1;
    },
    fillProductTypeStepDataFromCartItem (cartItem: CartItem): void {
      this.productTypeStepData.product = cartItem;
      this.productTypeStepData.plushieId = cartItem.plushieId ? Number.parseInt(cartItem.plushieId, 10) : undefined;
    },
    async fillProductTypeStepDataFromPersistedState (persistedState?: PlushieCreationWizardPersistedState): Promise<void> {
      if (!persistedState?.productTypeData) {
        this.productTypeStepData = {
          product: undefined,
          plushieId: undefined
        };
        return;
      }

      const product = await this.$store.dispatch(
        'product/loadProduct',
        { parentSku: persistedState.productTypeData.productSku }
      );

      this.productTypeStepData = {
        product,
        plushieId: persistedState.productTypeData.plushieId
      }
    },
    fillImageUploadStepDataFromPersistedState (persistedState?: PlushieCreationWizardPersistedState): void {
      if (!persistedState?.imageUploadStepData) {
        this.imageUploadStepData = {
          uploadMethod: ImageUploadMethod.NOW,
          customerImages: []
        };
        return;
      }

      this.imageUploadStepData = persistedState.imageUploadStepData;
    },
    fillPetInfoStepDataFromPersistedState (persistedState?: PlushieCreationWizardPersistedState): void {
      if (!persistedState?.petInfoStepData) {
        this.petInfoStepData = {
          name: undefined,
          breed: undefined,
          email: undefined
        };
        return;
      }

      this.petInfoStepData = persistedState.petInfoStepData;
    },
    fillProductionTime (cartItem: CartItem): void {
      const productOption = cartItem.product_option;
      this.customizeStepData.productionTime = undefined;
      if (!this.productionTimeBundleOption || !productOption) {
        return;
      }

      if (!productOption.extension_attributes.bundle_options[this.productionTimeBundleOption.option_id]) {
        return;
      }

      this.customizeStepData.productionTime = productOption.extension_attributes.bundle_options[this.productionTimeBundleOption.option_id].option_selections[0];
    },
    fillSizeByPreselectedParams (type: string, size: string): void {
      let sizeSku: string;

      try {
        sizeSku = getForeversSizeSkuBySizeAndType(size, type);
      } catch (error) {
        Logger.error('Unable to fill product by preselected param: ' + error, 'budsies')();
        return;
      }

      const sizeOption = this.sizes.find((size) => size.value === sizeSku);

      if (!sizeOption) {
        return;
      }

      this.customizeStepData.size = sizeOption;
    },
    fillSizeByPreselectedParamAndCurrentProduct (): void {
      if (!this.preselectedSize || !this.product) {
        return;
      }

      this.fillSizeByPreselectedParams(
        getForeversTypeByBundleSku(this.product.sku),
        this.preselectedSize
      );
    },
    fillSizeOption (cartItem: CartItem): void {
      const productOption = cartItem.product_option;
      this.customizeStepData.size = undefined;
      if (!this.sizeBundleOption || !productOption) {
        return;
      }

      const selectedBundleOption = productOption.extension_attributes.bundle_options[this.sizeBundleOption.option_id];

      if (!selectedBundleOption) {
        return;
      }

      this.customizeStepData.size = this.sizes.find((size) => Number.parseInt(size.optionValueId, 10) === selectedBundleOption.option_selections[0])
    },
    fillImageUploadStepDataFromCartItem (cartItem: CartItem): void {
      this.imageUploadStepData.uploadMethod = cartItem.uploadMethod
        ? cartItem.uploadMethod as ImageUploadMethod
        : ImageUploadMethod.NOW;
      this.imageUploadStepData.customerImages = cartItem.customerImages ? cartItem.customerImages : [];
    },
    fillPetInfoStepDataFromCartItem (cartItem: CartItem): void {
      this.petInfoStepData.name = cartItem.plushieName;
      this.petInfoStepData.breed = cartItem.plushieBreed;
      this.petInfoStepData.email = cartItem.email;
    },
    fillCustomizeStepDataFromCartItem (cartItem: CartItem): void {
      this.fillBodypartsValues(cartItem);
      this.fillAddons(cartItem);
      this.fillProductionTime(cartItem);
      this.fillSizeOption(cartItem);
      this.customizeStepData.description = cartItem.plushieDescription;
      this.customizeStepData.quantity = cartItem.qty;
    },
    getUpgradeOptionValues () {
      return this.customizeStepData.addons.map((selectedAddon) => {
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
    async nextStep (): Promise<void> {
      if (this.currentStep === 3) {
        return;
      }

      this.currentStep += 1;

      this.scrollToTop();

      if (!this.existingCartItem) {
        await this.persistCurrentStep(this.currentStep);
      }
    },
    getBodypartsData (): Record<string, string[]> {
      let data: Record<string, string[]> = {};

      for (const bodyPartId in this.customizeStepData.bodypartsValues) {
        let value = this.customizeStepData.bodypartsValues[bodyPartId];

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

      return this.activeProduct.bundle_options.find((option: BundleOption) => option.title.toLowerCase() === optionTitle);
    },
    goToCrossSells (): void {
      let route;
      if (this.product) {
        route = { name: 'cross-sells', params: { parentSku: this.product.sku } }
      } else {
        route = { name: 'detailed-cart' };
      }

      this.$router.push(localizedRoute(route));
    },
    async loadProductOptions (id?: number | string): Promise<void> {
      await Promise.all([
        this.$store.dispatch('budsies/loadProductBodyparts', { productId: id }),
        this.$store.dispatch('budsies/loadProductRushAddons', { productId: id })
      ]);
    },
    onAddToCartHandler (): void {
      if (this.existingCartItem) {
        this.updateExistingCartItem();
      } else {
        this.addToCart();
      }
    },
    async onChangeStep (nextStep: number) {
      if (nextStep < this.currentStep) {
        this.currentStep = nextStep;

        this.scrollToTop();

        await this.persistCurrentStep(nextStep);
      }
    },
    onFailure (message: any): void {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: message,
        action1: { label: i18n.t('OK') }
      });
    },
    async onImageUploadStepDataInput (value: PlushieWizardImageUploadStepData): Promise<void> {
      this.imageUploadStepData = value;

      if (!this.existingCartItem) {
        await this.persistImageUploadStepData(value);
      }
    },
    async onPetInfoStepDataInput (value: PlushieWizardPetInfoStepData): Promise<void> {
      this.petInfoStepData = value;

      if (!this.existingCartItem) {
        await this.persistPetInfoStepData(value);
      }
    },
    async persistCurrentStep (value: number): Promise<void> {
      if (!this.plushieId) {
        throw new Error('Plushie id is undefined');
      }

      await foreversCreationWizardPersistedStateService.saveCurrentStepIndex(this.plushieId, value);
    },
    async persistImageUploadStepData (value: PlushieWizardImageUploadStepData): Promise<void> {
      if (!this.plushieId) {
        throw new Error('Plushie id is undefined');
      }

      await foreversCreationWizardPersistedStateService.saveImageUploadStepData(this.plushieId, value);
    },
    async persistPetInfoStepData (value: PlushieWizardPetInfoStepData): Promise<void> {
      if (!this.plushieId) {
        throw new Error('Plushie id is undefined');
      }

      await foreversCreationWizardPersistedStateService.savePetInfoStepData(this.plushieId, value);
    },
    async persistProductTypeStepData (value: PlushieWizardProductTypeStepData): Promise<void> {
      if (!value.plushieId || !value.product) {
        throw new Error('Plushie Id or Product Sku is undefined');
      }

      await foreversCreationWizardPersistedStateService.saveProductTypeStepData(value.plushieId, value.product.sku);
    },
    scrollToTop (): void {
      this.window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
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

      this.isSubmitting = true;

      try {
        try {
          await this.updateClientAndServerItem({
            product: Object.assign({}, this.existingCartItem, {
              qty: this.customizeStepData.quantity,
              plushieId: this.plushieId + '',
              email: this.petInfoStepData.email?.trim(),
              plushieName: this.petInfoStepData.name?.trim(),
              plushieBreed: this.petInfoStepData.breed?.trim(),
              plushieDescription: this.customizeStepData.description?.trim(),
              bodyparts: this.getBodypartsData(),
              uploadMethod: this.imageUploadStepData.uploadMethod,
              product_option: setBundleProductOptionsAsync(null, { product: this.existingCartItem, bundleOptions: this.$store.state.product.current_bundle_options }),
              customerImages: this.customerImages,
              upgradeOptionValues: this.getUpgradeOptionValues()
            }),
            forceUpdateServerItem: true
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
    }
  },
  async created (): Promise<void> {
    this.$store.dispatch('budsies/loadBreeds');
  },
  async beforeMount (): Promise<void> {
    this.isWizardInitializing = true;

    try {
      if (this.existingCartItem) {
        await this.fillPlushieDataFromCartItem(this.existingCartItem);
        return;
      }

      if (this.existingPlushieId) {
        await this.fillPlushieDataFromPersistedState();
      }

      if (this.preselectedProductType && !this.product) {
        await this.setProductType(this.preselectedProductType);
        this.nextStep();
      }

      this.fillSizeByPreselectedParamAndCurrentProduct();
    } finally {
      this.isWizardInitializing = false;
    }
  },
  watch: {
    product: {
      async handler () {
        if (!this.product) {
          return;
        }

        await this.loadProductOptions(this.product.id);
      },
      immediate: true

    },
    'customizeStepData.addons': {
      handler (newValue: SelectedAddon[]) {
        if (!this.addonsBundleOption) {
          return
        }

        this.setBundleOptionValue(
          this.addonsBundleOption.option_id,
          1,
          newValue.map(({ addonOptionValueId }) => addonOptionValueId)
        );
      },
      immediate: false
    },
    'customizeStepData.size': {
      handler (newValue: SizeOption | undefined) {
        if (!this.sizeBundleOption) {
          Logger.error('sizeBundleOption is not defined while attempt to set size was performed', 'budsies')();
          return
        }

        this.setBundleOptionValue(
          this.sizeBundleOption.option_id,
          1,
          newValue ? [Number.parseInt(newValue.optionValueId, 10)] : []
        );
      },
      immediate: false
    },
    'customizeStepData.productionTime': {
      handler (newValue: number | undefined) {
        if (!this.productionTimeBundleOption) {
          return
        }

        this.setBundleOptionValue(this.productionTimeBundleOption.option_id,
          1,
          newValue ? [newValue] : []
        );
      },
      immediate: false
    },
    async existingPlushieId (value: string) {
      this.isWizardInitializing = true;

      try {
        if (this.existingCartItem) {
          await this.fillPlushieDataFromCartItem(this.existingCartItem);
        } else if (value) {
          await this.fillPlushieDataFromPersistedState();
        }
      } finally {
        this.isWizardInitializing = false;
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "~@storefront-ui/shared/styles/helpers/typography";
@import "~@storefront-ui/shared/styles/helpers/layout";
@import "~@storefront-ui/shared/styles/components/atoms/SfHeading";

.o-plushie-creation-wizard {
  --steps-content-padding: var(--spacer-base) var(--spacer-sm) 0;
  $floating-photo-width: 14%;

  text-align: center;

  .sf-step {
    max-width: 760px;
    margin-left: auto;
    margin-right: auto;
  }

  b,
  strong {
    font-weight: var(--font-semibold);
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

    &._email-step {
      margin-top: var(--spacer-2xl);
    }
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

  ._popup-link {
    font-weight: var(--font-medium);
  }

  ._popup-content {
    text-align: left;
  }

  .sf-input {
    text-align: center;
    display: inline-block;
    --input-width: 20em;
  }

  .sf-modal {
    --modal-top: 3.75rem;
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

  ._error-text {
      font-size: var(--font-xs);
      margin-top: var(--spacer-sm);
      height: calc(var(--font-xs) * 1.2);
  }

  ._form-errors {
    margin-top: var(--spacer-xl);
    min-height: calc(var(--font-xs) * 1.2 * 4);

    ._error-link {
      color: inherit;
    }
  }

  ._order-agreement {
    max-width: 50em;
    font-size: var(--font-xs);

  }

  &.-skin-petsies {
      ._error-text {
          color: var(--c-danger-variant);
      }
  }

  .m-floating-photo {
    position: absolute;
    top: 0;
    display: none;
    width: $floating-photo-width;
    right: 0;
    height: 100%;
  }

  ._content {
    display: flex;
    justify-content: center;
    position: relative;
    margin-top: var(--spacer-base);
  }

  ._steps-container {
    display: flex;
    justify-content: center;
    flex-grow: 1;
  }

  ._steps {
    flex-grow: 1;
  }

  @media (min-width: $tablet-min) {

    ._step-divider {
      display: block;
    }
  }

@include for-desktop {
  .m-floating-photo {
    display: block;
  }

  ._steps-container {
    max-width: calc(100% - #{$floating-photo-width} * 2 - 50px);
  }

  ._steps {
    max-width: 77.5rem;
  }

  .sf-modal {
    --modal-top: 50%;
  }
}

}
</style>
