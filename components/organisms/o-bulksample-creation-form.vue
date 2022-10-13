<template>
  <validation-observer
    v-slot="{ passes }"
    tag="form"
    class="o-bulksample-creation-form"
    @submit.prevent="() => passes(() => onFormSubmit())"
  >
    <SfHeading
      :level="1"
      :title="$t('Bulk Plush Sample Order Form')"
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
        {{ $t('Please order each unique design as a separate Bulk Plush Sample') }}
      </span>

      <m-artwork-upload
        :allow-multiple="true"
        :disabled="isDisabled"
        :product-id="backendProductId"
        :upload-url="artworkUploadUrl"
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
      rules="required"
      tag="div"
      class="_step-container"
    >
      <SfHeading
        :level="3"
        :title="$t('STEP {number}', {number: 2})"
        class="_step-number"
      />

      <SfInput
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
          v-model="name"
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
          :title="$t('Describe Your Bulk Plush Sample')"
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
          {{ $t('Please provide a description of the design to help us most accurately create the Bulk Plush Sample') }}
        </span>
      </validation-provider>

      <validation-provider
        v-if="colorPaletteBodypart"
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
          :name="colorPaletteBodypart.name"
          :max-values="colorPaletteBodypart.maxValues"
          :options="colorPaletteOptions"
          :disabled="isDisabled"
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

    <div class="_step-container">
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
        :title="$t('STEP {number}', {number: 5})"
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
          :title="$t('STEP {number}', {number: 6})"
          class="_step-number"
        />

        <SfInput
          :label="$t('Enter your email address')"
          v-model="email"
          class="-required"
          :disabled="isDisabled"
          :error="errors[0]"
          :valid="!errors.length"
        />

        <span class="_input-hint">
          {{ $t('Sometimes our team has questions about your design') }}
        </span>
      </div>
    </validation-provider>

    <div class="_buttons-container">
      <SfButton type="submit">
        {{ $t('SAVE') }}
      </SfButton>
    </div>
  </validation-observer>
</template>

<script lang="ts">
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import Vue, { PropType, VueConstructor } from 'vue'
import { SfButton, SfHeading, SfSelect, SfDivider, SfInput } from '@storefront-ui/vue'
import { Logger } from '@vue-storefront/core/lib/logger';
import { getProductGallery as getGalleryByProduct } from '@vue-storefront/core/modules/catalog/helpers';
import { BundleOption } from '@vue-storefront/core/modules/catalog/types/BundleOption';
import Product from '@vue-storefront/core/modules/catalog/types/Product';

import { Bodypart, BodypartOption, BodypartValue, ProductId, ProductValue } from 'src/modules/budsies';
import { ImageHandlerService, Item } from 'src/modules/file-storage';
import { CustomerImage, getProductDefaultPrice, ServerError } from 'src/modules/shared';

import AddonOption from '../interfaces/addon-option.interface';

import MAddonsSelector from 'theme/components/molecules/m-addons-selector.vue';
import MArtworkUpload from 'theme/components/molecules/m-artwork-upload.vue';
import MBodypartOptionConfigurator from 'theme/components/molecules/m-bodypart-option-configurator.vue';

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

interface CustomerType {
  id: number,
  value: string,
  title: string
}

interface InjectedServices {
  imageHandlerService: ImageHandlerService
}

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
    plushieId: {
      type: Number as PropType<number | undefined>,
      default: undefined
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
    colorPaletteBodypart (): Bodypart | undefined {
      return this.bodyparts.find((bodypart) => {
        return bodypart.name.toLowerCase() === 'color palette';
      })
    },
    colorPaletteOptions (): BodypartOption[] {
      if (!this.colorPaletteBodypart) {
        return;
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
    isDisabled (): boolean {
      return this.fIsDisabled || this.isSubmitting;
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
    showEmailStep (): boolean {
      return true; // TODO
    }
  },
  data () {
    return {
      size: '',
      name: '',
      description: '',
      customerType: undefined,
      color: undefined as BodypartOption | undefined,
      selectedAddons: [] as number [],
      customerImages: [] as CustomerImage[],
      email: ''
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

      try {
        try {
          await this.$store.dispatch('cart/addItem', {
            productToAdd: Object.assign({}, this.product, {
              qty: this.customizeStepData.quantity,
              bodyparts: this.getBodypartsData(),
              uploadMethod: this.imageUploadStepData.uploadMethod,
              customerImages: this.customerImages
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
      } catch (error) {
        Logger.error(error, 'budsies')();

        this.onFailure('Unexpected error: ' + error);
      } finally {
        this.isSubmitting = false;
      }
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
    onFormSubmit (): void {
      //
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
