<template>
  <div class="o-portrait-product-order-form">
    <div class="_info">
      <div class="_zoom-gallery-container">
        <SfHeading
          :title="product.name"
          :level="1"
          class="_product-name-mobile sf-heading--left"
        />

        <m-zoom-gallery
          class="_gallery"
          :images="galleryImages"
          :lazy-load-stage-image="false"
        />
      </div>

      <div class="_form-container">
        <SfHeading :title="product.name" :level="1" class="sf-heading--left _product-name-desktop" />

        <div class="_short-description" v-html="product.short_description" />

        <a-custom-price
          class="_price"
          :regular="totalPrice.regular"
          :special-price="totalPrice.special"
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
                :ref="getFieldAnchorName('Style')"
              >
                {{ $t('Select style') }}
              </div>

              <validation-provider
                v-slot="{errors}"
                name="'Style'"
                tag="div"
                rules="required"
                class="_step-content"
              >
                <SfSelect
                  v-model="selectedStyleOptionId"
                  name="Style"
                  class="sf-select--underlined"
                  :required="true"
                  :size="10"
                  :disabled="isSubmitting"
                  :should-lock-scroll-on-open="isMobile"
                  :error-message="errors[0]"
                  :valid="!errors.length"
                >
                  <SfSelectOption
                    v-for="option in styleOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SfSelectOption>
                </SfSelect>
              </validation-provider>
            </div>

            <div class="_step" v-show="showSizeSelectorStep">
              <div
                class="_step-title"
                :ref="getFieldAnchorName('Size')"
              >
                {{ $t('Select size') }}
              </div>

              <validation-provider
                v-slot="{errors}"
                name="'Size'"
                rules="required"
                tag="div"
                class="_step-content"
              >
                <SfSelect
                  v-if="showSizeOptionsSelect"
                  v-model="selectedSizeOptionId"
                  name="Size"
                  class="sf-select--underlined"
                  :required="true"
                  :size="10"
                  :disabled="isSubmitting"
                  :should-lock-scroll-on-open="isMobile"
                  :error-message="errors[0]"
                  :valid="!errors.length"
                >
                  <SfSelectOption
                    v-for="option in sizeOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </SfSelectOption>
                </SfSelect>
              </validation-provider>
            </div>

            <div class="_step">
              <div class="_step-title" :ref="getFieldAnchorName('Name')">
                {{ nameStepTitle }}
              </div>

              <p class="_step-hint" v-if="nameStepHint" v-html="nameStepHint" />

              <validation-provider
                v-slot="{errors}"
                tag="div"
                class="_step-content"
                rules="required|max:128"
                :name="`'${$t('Name')}'`"
              >
                <SfInput
                  v-model="plushieName"
                  :placeholder="$t('Name')"
                  :disabled="isSubmitting"
                  :valid="!errors.length"
                  :error-message="errors[0]"
                />
              </validation-provider>
            </div>

            <div class="_step">
              <div
                class="_step-title"
                :ref="getFieldAnchorName('Photo')"
              >
                {{ artworkUploadStepTitle }}
              </div>

              <validation-provider
                v-slot="{ errors }"
                name="'Photo'"
                tag="div"
                class="_step-content"
              >
                <input
                  type="hidden"
                  :value="customerImage ? customerImage.id : undefined"
                  required
                >

                <m-artwork-upload
                  ref="artwork-upload"
                  :product-id="backendProductId"
                  :upload-url="artworkUploadUrl"
                  :disabled="isSubmitting"
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

            <m-extra-faces
              ref="extra-faces"
              :available-options="extraPhotoAddonOptions"
              :backend-product-id="backendProductId"
              :disabled="isSubmitting"
              :upload-url="artworkUploadUrl"
              :initial-variant="initialAddonItemId"
              :initial-artworks="initialExtraPhotosArtworks"
              :get-field-anchor-name="getFieldAnchorName"
              v-if="hasExtraPhotoAddonOptions"
              @input="onExtraFacesConfiguratorDataInput"
              @is-busy-changed="onArtworkUploadBusyStatusChanged('extra-faces', $event)"
            />

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
            </div>
          </form>
        </validation-observer>
      </div>
    </div>

    <m-product-description-story
      class="_description-story"
      :product-sku="product.sku"
      :backup-product-sku="product.parentSku"
      :title="$t('Product Details').toString()"
    />
  </div>
</template>

<script lang="ts">
import { extend, ValidationObserver, ValidationProvider } from 'vee-validate';
import { required, max } from 'vee-validate/dist/rules';
import { SfButton, SfHeading, SfInput, SfSelect } from '@storefront-ui/vue';
import { mapMobileObserver, unMapMobileObserver } from '@storefront-ui/vue/src/utilities/mobile-observer';
import { computed, ComputedRef, defineComponent, nextTick, PropType, ref, Ref, toRefs, unref, watch } from '@vue/composition-api'

import { Logger } from '@vue-storefront/core/lib/logger';
import { setBundleProductOptionsAsync } from '@vue-storefront/core/modules/catalog/helpers';
import { getSelectedBundleOptions } from '@vue-storefront/core/modules/catalog/helpers/bundleOptions';
import i18n from '@vue-storefront/i18n';
import CartItem from 'core/modules/cart/types/CartItem';
import { BundleOption, BundleOptionsProductLink } from 'core/modules/catalog/types/BundleOption';
import Product from 'core/modules/catalog/types/Product';
import { CustomerImage, PriceHelper, ServerError } from 'src/modules/shared';

import { getLowestPriceForBundleOptionProductLinks } from 'theme/helpers/get-lowest-price-for-bundle-option.function';
import { useArtworkUpload } from 'theme/helpers/use-artwork-upload';
import { useBackendProductId } from 'theme/helpers/use-backend-product-id';
import { useBundleOption } from 'theme/helpers/use-bundle-options';
import { useExtraFacesAddons } from 'theme/helpers/use-extra-faces-addons';
import { useFormValidation } from 'theme/helpers/use-form-validation';
import { useProductGallery } from 'theme/helpers/use-product-gallery';

import ACustomPrice from 'theme/components/atoms/a-custom-price.vue';
import ACustomProductQuantity from 'theme/components/atoms/a-custom-product-quantity.vue';
import MArtworkUpload from 'theme/components/molecules/m-artwork-upload.vue';
import MExtraFaces from '../molecules/m-extra-faces.vue';
import MFormErrors from 'theme/components/molecules/m-form-errors.vue';
import MProductDescriptionStory from 'theme/components/molecules/m-product-description-story.vue';
import MZoomGallery from 'theme/components/molecules/m-zoom-gallery.vue';

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

extend('max', max);

interface SelectOptionItem {
  value: number | string,
  label: string
}

const STYLE_BUNDLE_OPTION_TITLE = 'variant';
const SIZE_BUNDLE_OPTION_TITLE = 'size';
const PORTRAITS_WITHOUT_FRAME_STYLE_SKU = 'portraits_without_frame';

function useStyleBundleOption (
  product: Ref<Product>,
  existingCartItem: Ref<CartItem | undefined>
) {
  const {
    bundleOption: styleBundleOption,
    setBundleOptionValue
  } = useBundleOption(product, STYLE_BUNDLE_OPTION_TITLE);
  const selectedStyleOptionId = ref<number | undefined>();
  const selectedStyleOption = computed<BundleOptionsProductLink | undefined>(() => {
    if (!styleBundleOption.value) {
      return;
    }

    return styleBundleOption.value.product_links.find(
      (productLink) => Number(productLink.id) === selectedStyleOptionId.value
    )
  });

  const styleOptions = computed<SelectOptionItem[]>(() => {
    if (!styleBundleOption.value) {
      return [];
    }

    const placeholder = {
      value: '',
      label: i18n.t('Select Style').toString()
    };

    const options: SelectOptionItem[] = styleBundleOption.value.product_links.map((productLink) => {
      return {
        value: Number(productLink.id),
        label: productLink.product?.name || ''
      }
    });

    options.unshift(placeholder);

    return options;
  });

  const selectedStyleProduct = computed<Product | undefined>(() => {
    if (!selectedStyleOption.value) {
      return;
    }

    return selectedStyleOption.value.product;
  });

  watch(selectedStyleOptionId, (value, oldValue) => {
    if (value === oldValue) {
      return;
    }

    if (!styleBundleOption.value) {
      Logger.error('styleBundleOption is not defined while attempt to set style was performed', 'budsies')();
      return;
    }

    setBundleOptionValue(
      styleBundleOption.value.option_id,
      1,
      value ? [value] : []
    );
  });

  function fillExistingCartItemData (): void {
    if (!existingCartItem.value || !styleBundleOption.value) {
      selectedStyleOptionId.value = undefined;
      return;
    }

    const selectedBundleOptions = getSelectedBundleOptions(existingCartItem.value);
    const selectedStyleOptions = selectedBundleOptions.find(
      (option) => option.option_id === styleBundleOption.value?.option_id
    );

    if (!selectedStyleOptions || !selectedStyleOptions.option_selections) {
      selectedStyleOptionId.value = undefined;
      return;
    }

    selectedStyleOptionId.value = selectedStyleOptions.option_selections[0];
  }

  fillExistingCartItemData();

  return {
    selectedStyleOption,
    selectedStyleOptionId,
    selectedStyleProduct,
    styleBundleOption,
    styleOptions
  }
}

function useSizeBundleOption (
  product: Ref<Product>,
  selectedStyleOption: ComputedRef<BundleOptionsProductLink | undefined>,
  existingCartItem: Ref<CartItem | undefined>
) {
  const {
    bundleOption: sizeBundleOption,
    setBundleOptionValue
  } = useBundleOption(product, SIZE_BUNDLE_OPTION_TITLE);

  const selectedSizeOptionId = ref<number | undefined>();
  const showSizeOptionsSelect = ref<boolean>(true);

  const sizeOptions = computed<SelectOptionItem[]>(() => {
    if (!sizeBundleOption.value) {
      return [];
    }

    const options: SelectOptionItem[] = [];

    const placeholder = {
      value: '',
      label: i18n.t('Select size').toString()
    };

    sizeBundleOption.value.product_links.forEach((productLink) => {
      if (!selectedStyleOption.value) {
        return;
      }

      const isWithoutFrameStyleSelected = selectedStyleOption.value.sku.startsWith(PORTRAITS_WITHOUT_FRAME_STYLE_SKU);
      const isSizeWithoutFrame = productLink.sku.startsWith(PORTRAITS_WITHOUT_FRAME_STYLE_SKU);

      if (isWithoutFrameStyleSelected !== isSizeWithoutFrame) {
        return;
      }

      options.push({
        value: Number(productLink.id),
        label: productLink.product?.name || ''
      })
    });

    if (!options.length) {
      return options;
    }

    options.unshift(placeholder);

    return options;
  });

  const showSizeSelectorStep = computed<boolean>(() => {
    return !!sizeOptions.value.length;
  });

  const selectedSizeProduct = computed<Product | undefined>(() => {
    if (!selectedSizeOptionId.value || !sizeBundleOption.value) {
      return;
    }

    const selectedProductLink = sizeBundleOption.value.product_links.find(
      (productLink) => Number(productLink.id) === selectedSizeOptionId.value
    );

    return selectedProductLink?.product;
  });

  watch(selectedStyleOption, async () => {
    showSizeOptionsSelect.value = false;
    selectedSizeOptionId.value = undefined;

    await nextTick();

    showSizeOptionsSelect.value = true;
  });

  watch(selectedSizeOptionId, (value, oldValue) => {
    if (value === oldValue) {
      return;
    }

    if (!sizeBundleOption.value) {
      Logger.error('sizeBundleOption is not defined while attempt to set size was performed', 'budsies')();
      return;
    }

    setBundleOptionValue(
      sizeBundleOption.value.option_id,
      1,
      value ? [value] : []
    );
  });

  function fillExistingCartItemData (): void {
    if (!existingCartItem.value || !sizeBundleOption.value) {
      selectedSizeOptionId.value = undefined;
      return;
    }

    const selectedBundleOptions = getSelectedBundleOptions(existingCartItem.value);
    const selectedSizeOptions = selectedBundleOptions.find(
      (option) => option.option_id === sizeBundleOption.value?.option_id
    );

    if (!selectedSizeOptions || !selectedSizeOptions.option_selections) {
      selectedSizeOptionId.value = undefined;
      return;
    }

    selectedSizeOptionId.value = selectedSizeOptions.option_selections[0];
  }

  fillExistingCartItemData();

  return {
    selectedSizeOptionId,
    selectedSizeProduct,
    showSizeOptionsSelect,
    showSizeSelectorStep,
    sizeBundleOption,
    sizeOptions
  }
}

function useProductPrice (
  styleBundleOption: ComputedRef<BundleOption | undefined>,
  selectedStyleProduct: ComputedRef<Product | undefined>,
  sizeBundleOption: ComputedRef<BundleOption | undefined>,
  selectedSizeProduct: ComputedRef<Product | undefined>,
  selectedExtraFacesAddonProduct: ComputedRef<Product | undefined>
) {
  const stylePrice = computed<PriceHelper.ProductPrice>(() => {
    if (selectedStyleProduct.value) {
      return PriceHelper.getProductDefaultPrice(selectedStyleProduct.value, {}, false)
    }

    if (!styleBundleOption.value) {
      throw new Error('styleBundleOption is not defined');
    }

    return getLowestPriceForBundleOptionProductLinks(
      styleBundleOption.value.product_links
    );
  });
  const sizePrice = computed<PriceHelper.ProductPrice>(() => {
    if (selectedSizeProduct.value) {
      return PriceHelper.getProductDefaultPrice(selectedSizeProduct.value, {}, false);
    }

    if (!sizeBundleOption.value) {
      throw new Error('sizeBundleOption is not defined');
    }

    if (!selectedStyleProduct.value) {
      return getLowestPriceForBundleOptionProductLinks(
        sizeBundleOption.value.product_links
      );
    }

    const isWithoutFrameStyleSelected = selectedStyleProduct.value.sku.startsWith(PORTRAITS_WITHOUT_FRAME_STYLE_SKU);

    return getLowestPriceForBundleOptionProductLinks(
      sizeBundleOption.value.product_links.filter(
        (productLink) => {
          const isSizeWithoutFrame = productLink.sku.startsWith(PORTRAITS_WITHOUT_FRAME_STYLE_SKU);
          return isSizeWithoutFrame === isWithoutFrameStyleSelected;
        }
      )
    );
  });
  const extraFacesAddonPrice = computed<PriceHelper.ProductPrice>(() => {
    return PriceHelper.getProductDefaultPrice(selectedExtraFacesAddonProduct.value, {}, false);
  });

  const totalPrice = computed<PriceHelper.ProductPrice>(() => {
    return PriceHelper.getTotalPriceForProductPrices([
      stylePrice.value,
      sizePrice.value,
      extraFacesAddonPrice.value
    ])
  });

  return {
    totalPrice
  }
}

function usePlushieNameInput (
  existingCartItem: Ref<CartItem | undefined>
) {
  const plushieName = ref<string | undefined>();

  function fillExistingCartItemData (): void {
    plushieName.value = undefined;

    if (!existingCartItem.value) {
      return;
    }

    plushieName.value = existingCartItem.value.plushieName;
  }

  fillExistingCartItemData();

  return {
    plushieName
  }
}

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
  name: 'OPortraitProductOrderForm',
  components: {
    ACustomPrice,
    ACustomProductQuantity,
    MArtworkUpload,
    MExtraFaces,
    MFormErrors,
    MProductDescriptionStory,
    MZoomGallery,
    SfButton,
    SfInput,
    SfHeading,
    SfSelect,
    ValidationObserver,
    ValidationProvider
  },
  props: {
    artworkUploadStepTitle: {
      type: String,
      required: true
    },
    artworkUploadUrl: {
      type: String,
      required: true
    },
    existingCartItem: {
      type: Object as PropType<CartItem | undefined>,
      default: undefined
    },
    nameStepHint: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    nameStepTitle: {
      type: String,
      required: true
    },
    product: {
      type: Object as PropType<Product>,
      required: true
    }
  },
  setup (props, setupContext) {
    const { product, existingCartItem } = toRefs(props);
    const validationObserver: Ref<InstanceType<typeof ValidationObserver> | null> = ref(null);

    const isSubmitting = ref<boolean>(false);
    const quantity = ref<number>(1);

    const {
      selectedStyleOption,
      selectedStyleOptionId,
      selectedStyleProduct,
      styleBundleOption,
      styleOptions
    } = useStyleBundleOption(product, existingCartItem);

    const {
      selectedSizeOptionId,
      selectedSizeProduct,
      showSizeOptionsSelect,
      showSizeSelectorStep,
      sizeBundleOption,
      sizeOptions
    } = useSizeBundleOption(product, selectedStyleOption, existingCartItem)

    const artworkUploadFields = useArtworkUpload(
      existingCartItem
    );

    const {
      backendProductId
    } = useBackendProductId(product);

    const extraFacesAddonsFields = useExtraFacesAddons(
      product,
      setupContext.root.$store,
      existingCartItem
    );

    const isSubmitButtonDisabled = computed<boolean>(() => {
      return isSubmitting.value || artworkUploadFields.isSomeUploaderBusy.value;
    })

    return {
      backendProductId,
      isSubmitButtonDisabled,
      isSubmitting,
      styleOptions,
      selectedStyleOptionId,
      selectedSizeOptionId,
      showSizeOptionsSelect,
      showSizeSelectorStep,
      sizeBundleOption,
      sizeOptions,
      validationObserver,
      quantity,
      ...artworkUploadFields,
      ...extraFacesAddonsFields,
      ...useFormValidation(
        validationObserver,
        () => getAllFormRefs(setupContext.refs)
      ),
      ...useProductGallery(
        product,
        styleBundleOption,
        selectedStyleOption
      ),
      ...usePlushieNameInput(existingCartItem),
      ...useProductPrice(
        styleBundleOption,
        selectedStyleProduct,
        sizeBundleOption,
        selectedSizeProduct,
        extraFacesAddonsFields.selectedExtraFacesAddonProduct
      )
    }
  },
  computed: {
    ...mapMobileObserver()
  },
  beforeDestroy (): void {
    unMapMobileObserver();
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

      const additionalArtworks: CustomerImage[] = this.extraPhotosArtworks.map((item) => {
        if (!this.imageHandlerService) {
          throw new Error('Image Handler Service is not defined');
        }

        return {
          id: item.id,
          url: this.imageHandlerService.getOriginalImageUrl(item.url)
        }
      });

      try {
        try {
          await this.$store.dispatch('cart/addItem', {
            productToAdd: Object.assign({}, this.product, {
              qty: this.quantity,
              customerImages: [this.customerImage, ...additionalArtworks],
              uploadMethod: 'upload-now',
              plushieName: this.plushieName
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
    goToCrossSells (): void {
      this.$router.push({
        name: 'cross-sells',
        params: { parentSku: this.product.sku }
      });
    },
    onFailure (message: any): void {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: message,
        action1: { label: i18n.t('OK') }
      });
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
    onSuccessAddToCart (): void {
      this.goToCrossSells();
    },
    onSuccessExistingCartItemUpdate (): void {
      this.$router.push({ name: 'detailed-cart' });
    },
    async updateClientAndServerItem (payload: {
      product: CartItem,
      forceUpdateServerItem?: boolean,
      forceClientState?: boolean
    }): Promise<void> {
      await this.$store.dispatch('cart/updateClientAndServerItem', payload);
    },
    async updateExistingCartItem (): Promise<void> {
      if (this.isSubmitting) {
        return;
      }

      if (!this.existingCartItem) {
        throw new Error('Cart item is not defined');
      }

      this.isSubmitting = true;

      const additionalArtworks: CustomerImage[] = this.extraPhotosArtworks.map(item => {
        let url = item.url;

        if (!this.initialExtraPhotosArtworks.find((image) => image.id === item.id)) {
          if (!this.imageHandlerService) {
            throw new Error('Image Handler Service is not defined');
          }

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
              plushieName: this.plushieName
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
  }
})
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.o-portrait-product-order-form {
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

  ._step-hint {
    font-size: var(--font-sm);
    margin: var(--spacer-sm) 0 0;
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
    font-size: var(--font-xs);
    margin-top: var(--spacer-xs);
    color: var(--c-danger-variant);
    height: calc(var(--font-xs)* 1.2);
  }

  .sf-select {
    --select-padding: 0;
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
