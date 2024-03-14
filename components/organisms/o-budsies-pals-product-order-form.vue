<template>
  <div class="o-budsies-pals-product-order-form">
    <SfHeading
      :level="1"
      :title="$t('Budsies Pals Order Form')"
      class="_title"
    />

    <MBlockStory
      story-slug="budsies_pals_creation_page_top"
      class="_top-block"
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
            :title="$t('Upload a Picture of Your Child\'s Artwork or Photo')"
            :ref="getFieldAnchorName('Artwork')"
          />

          <div class="_content">
            <div class="_upload-now">
              <validation-provider
                v-slot="{ errors }"
                name="'Artwork'"
                rules="required"
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
                  :max-files="2"
                  :allow-multiple="true"
                  @file-added="onArtworkAdd"
                  @file-removed="onArtworkRemove"
                  v-if="backendProductId"
                />

                <div class="_error-text">
                  {{ errors[0] }}
                </div>
              </validation-provider>
            </div>
          </div>
        </div>

        <div class="_step">
          <SfDivider class="_step-divider" />

          <SfHeading class="_step-title" :level="3" :title="$t('Step {number}', {number: 2})" />

          <SfHeading
            class="_step-subtitle -required"
            :level="3"
            :title="$t('Describe Your Child\'s Artwork or Photo')"
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
                <span>{{ $t('Please provide as much direction as possible to help us understand the artwork. Features, colors, & even mood are all very important.') }}</span>
              </div>

              <div class="_error-text">
                {{ errors[0] }}
              </div>
            </validation-provider>
          </div>
        </div>

        <div class="_step">
          <SfDivider class="_step-divider" />

          <SfHeading
            class="_step-title"
            :level="3"
            :title="$t('Step {number}', {number: 3})"
          />

          <SfHeading
            class="_step-subtitle -required"
            :level="3"
            :title="$t('Select Your Hospital')"
            :ref="getFieldAnchorName('Hospital')"
          />

          <div class="_content">
            <validation-provider
              v-slot="{ errors }"
              rules="required"
              name="'Hospital'"
              tag="div"
            >
              <SfSelect
                class="sf-select--underlined _select"
                v-model="selectedHospitalId"
                :disabled="isSubmitting"
                :valid="!errors.length"
                :error-message="errors[0]"
              >
                <SfSelectOption
                  v-for="option in hospitalsList"
                  :key="option.name"
                  :value="option.id"
                >
                  {{ option.name }}
                </SfSelectOption>
              </SfSelect>
            </validation-provider>
          </div>
        </div>

        <div class="_step">
          <SfDivider class="_step-divider" />

          <SfHeading
            class="_step-title"
            :level="3"
            :title="$t('Step {number}', {number: 4})"
          />

          <SfHeading
            class="_step-subtitle -required"
            :level="3"
            :title="$t('Enter your Information')"
          />

          <div class="_content">
            <validation-provider
              v-slot="{ errors }"
              rules="required"
              name="'Budsies Pals Participant Name'"
              tag="div"
              class="_field"
              :ref="getFieldAnchorName('Budsies Pals Participant Name')"
            >
              <SfInput
                name="Budsies Pals Participant Name"
                v-model="participantName"
                :placeholder="$t('Budsies Pals Participant Name')"
                :disabled="isSubmitting"
                :valid="!errors.length"
                :error-message="errors[0]"
              />
            </validation-provider>

            <validation-provider
              v-slot="{ errors }"
              rules="required"
              name="'Parent Name'"
              tag="div"
              class="_field"
              :ref="getFieldAnchorName('Parent Name')"
            >
              <SfInput
                name="Parent Name"
                v-model="parentName"
                :placeholder="$t('Parent/Guardian Name')"
                :disabled="isSubmitting"
                :valid="!errors.length"
                :error-message="errors[0]"
              />
            </validation-provider>

            <validation-provider
              v-slot="{ errors }"
              rules="required|email"
              name="'Email'"
              tag="div"
              class="_field"
              :ref="getFieldAnchorName('Email')"
              v-show="showEmailStep"
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
        </div>

        <validation-provider
          v-slot="{ errors }"
          :rules="{ required: { allowFalse: false } }"
          name="'Agreement'"
          tag="div"
          :ref="getFieldAnchorName('Agreement')"
        >
          <m-checkbox
            class="_agreement _checkbox"
            v-model="agreement"
            :disable="isSubmitting"
            :valid="!errors.length"
            :label="agreementCheckboxLabel"
          />
        </validation-provider>

        <m-form-errors
          class="_form-errors"
          :form-errors="formErrors"
          @item-click="goToFieldByName"
        />

        <div class="_agreement">
          {{ $t('I agree to') }}
          <router-link to="/terms-of-service/" target="_blank">
            {{ $t('Terms of Service') }},
          </router-link>

          <privacy-policy-link />

          {{ $t('and') }}
          <a href="http://support.budsies.com/support/solutions/folders/5000249005" target="_blank">{{ $t('Refund Policy') }}</a>.
          {{ $t('I understand that Budsies happily takes care of all tears, defects, and shipping damage with either a refund or a repair.') }}
        </div>

        <div class="_actions">
          <SfButton
            class="_add-to-cart color-primary"
            type="submit"
            :disabled="isSubmitting"
          >
            {{ submitButtonText }}
          </SfButton>
        </div>

        <california-privacy-notice-link />
      </form>
    </validation-observer>
  </div>
</template>

<script lang="ts">
import { Route } from 'vue-router';
import { PropType, defineComponent, ref, Ref, inject } from '@vue/composition-api';
import { extend, ValidationObserver, ValidationProvider } from 'vee-validate';
import { required, email } from 'vee-validate/dist/rules';
import { SfButton, SfDivider, SfHeading, SfInput, SfSelect } from '@storefront-ui/vue';
import i18n from '@vue-storefront/core/i18n';
import { Logger } from '@vue-storefront/core/lib/logger';
import { localizedRoute } from '@vue-storefront/core/lib/multistore';
import CartItem from '@vue-storefront/core/modules/cart/types/CartItem';

import {
  ImageUploadMethod,
  ProductValue,
  Hospital
} from 'src/modules/budsies';
import { usePersistedEmail } from 'src/modules/persisted-customer-data';
import { CaliforniaPrivacyNoticeLink, PrivacyPolicyLink } from 'src/modules/true-vault';
import Product from 'core/modules/catalog/types/Product';
import { ImageHandlerService, Item } from 'src/modules/file-storage';
import { CustomerImage, ServerError } from 'src/modules/shared';
import { useFormValidation } from 'theme/helpers/use-form-validation';

import MArtworkUpload from '../molecules/m-artwork-upload.vue';
import MBlockStory from '../molecules/m-block-story.vue';
import MCheckbox from '../molecules/m-checkbox.vue';
import MFormErrors from '../molecules/m-form-errors.vue';

extend('required', {
  ...required,
  message: 'The {_field_} field is required'
});

extend('email', {
  ...email,
  message: 'Please, provide the correct email address'
});

export default defineComponent({
  name: 'OBudsiesPalsProductOrderForm',
  setup (_, setupContext) {
    const imageHandlerService = inject<ImageHandlerService>('ImageHandlerService');
    const window = inject<Window>('WindowObject');

    const validationObserver: Ref<InstanceType<typeof ValidationObserver> | null> = ref(null);

    if (!imageHandlerService) {
      throw new Error('ImageHandlerService is not defined');
    }

    if (!window) {
      throw new Error('Window is not provided');
    }
    const email = ref<string | undefined>(undefined);

    return {
      imageHandlerService,
      validationObserver,
      email,
      window,
      ...useFormValidation(
        validationObserver,
        () => setupContext.refs
      ),
      ...usePersistedEmail(email)
    }
  },
  components: {
    CaliforniaPrivacyNoticeLink,
    PrivacyPolicyLink,
    SfInput,
    SfSelect,
    ValidationObserver,
    ValidationProvider,
    MArtworkUpload,
    SfButton,
    SfDivider,
    SfHeading,
    MBlockStory,
    MCheckbox,
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
      customerImages: [] as CustomerImage[],
      isSubmitting: false,
      description: '',
      initialCustomerImages: [] as CustomerImage[],
      plushieId: undefined as number | undefined,
      selectedHospitalId: undefined as number | undefined,
      participantName: undefined as string | undefined,
      parentName: undefined as string | undefined,
      agreement: false
    }
  },
  computed: {
    activeProduct (): Product | CartItem | null {
      return this.existingCartItem ? this.existingCartItem : this.product;
    },
    agreementCheckboxLabel (): string {
      return this.$t(
        'I understand that my child\'s artwork, artwork description, photo, and first name, may be displayed on the Budsies website, social media, promotional materials, and within emails for the promotion of this program and Budsies plush services. Other media and promotion partners, such as television, newspapers, and magazines may also publish this content for related stories. No direct communication between my family and the sponsor is expected or required. If a sponsor is not identified, Budsies will sponsor my child’s custom plushie with no charge to you. Production may take up to 6 weeks. Thank you for reading this legalese as required by attorneys... now let\'s make some magical plush experiences!'
      ).toString();
    },
    backendProductId (): ProductValue | undefined {
      switch (this.product.id) {
        case 266:
          return ProductValue.BUDSIES_PALS;
        default:
          throw new Error(
            `Can't resolve Backend product ID for Magento '${this.product.id}' product ID`
          );
      }
    },
    cartItems (): CartItem[] {
      return this.$store.getters['cart/getCartItems'];
    },
    descriptionPlaceholderText (): string {
      return this.$t(
        'Oinker is a pig that\'s purple with green spots. Has a ball-shaped nose, really big toes, one green eye and one red eye, and a green curly tail.'
      ).toString();
    },
    existingCartItem (): CartItem | undefined {
      if (!this.existingPlushieId) {
        return;
      }

      return this.cartItems.find((item) => item.plushieId && item.plushieId === this.existingPlushieId);
    },
    hospitalsList (): Hospital[] {
      return this.$store.getters['budsies/getHospitals'];
    },
    submitButtonText (): string {
      return (this.existingCartItem
        ? this.$t('Update')
        : this.$t('Add to Cart')).toString();
    },
    showEmailStep (): boolean {
      return !this.hasPrefilledEmail;
    }
  },
  methods: {
    async addToCart (): Promise<void> {
      await this.$store.dispatch(
        'product/setBundleOptions',
        { product: this.product, bundleOptions: this.$store.state.product.current_bundle_options }
      );

      try {
        try {
          await this.$store.dispatch('cart/addItem', {
            productToAdd: Object.assign({}, this.product, {
              qty: 1,
              plushieId: this.plushieId + '',
              email: this.email,
              plushieDescription: this.description,
              customerImages: this.customerImages ? this.customerImages : [],
              uploadMethod: ImageUploadMethod.NOW,
              participantName: this.participantName,
              hospitalId: this.selectedHospitalId,
              parentName: this.parentName
            })
          });

          this.persistLastUsedCustomerEmail(this.email);
        } catch (error) {
          if (error instanceof ServerError) {
            throw error;
          }

          Logger.error(error, 'budsies')();
        }

        this.goToCrossSells();
        return;
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
    fillCustomerImagesData (existingCartItem: CartItem): void {
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
    async fillPlushieDataFromCartItem (existingCartItem: CartItem): Promise<void> {
      const isPlushieExist = await this.checkExistingPlushie();

      if (!isPlushieExist) {
        return this.onCartItemPlushieRemoved();
      }

      this.description = existingCartItem.plushieDescription || '';
      this.plushieId = Number(existingCartItem.plushieId);
      this.selectedHospitalId = existingCartItem.hospitalId;
      this.participantName = existingCartItem.participantName;
      this.parentName = existingCartItem.parentName;

      this.fillCustomerImagesData(existingCartItem);
    },
    getArtworkUploadComponent (): InstanceType<typeof MArtworkUpload> | undefined {
      return this.$refs['artwork-upload'] as InstanceType<typeof MArtworkUpload> | undefined;
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
    resetForm (): void {
      this.customerImages = [];
      this.initialCustomerImages = [];
      this.description = '';
      this.plushieId = undefined;
      this.selectedHospitalId = undefined;
      this.parentName = undefined;
      this.participantName = undefined;

      const uploader = this.getUploader();
      if (uploader) {
        uploader.clearInput();
      }

      this.validationObserver?.reset();
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
    async updateClientAndServerItem (payload: {
      product: CartItem,
      forceUpdateServerItem?: boolean,
      forceClientState?: boolean
    }): Promise<void> {
      await this.$store.dispatch('cart/updateClientAndServerItem', payload);
    },
    async updateExistingCartItem (existingCartItem: CartItem): Promise<void> {
      try {
        try {
          const isPlushieExist = await this.checkExistingPlushie();

          if (!isPlushieExist) {
            return this.onCartItemPlushieRemoved();
          }

          await this.updateClientAndServerItem({
            product: Object.assign({}, existingCartItem, {
              qty: 1,
              plushieId: this.plushieId + '',
              email: this.email,
              plushieDescription: this.description,
              customerImages: this.customerImages ? this.customerImages : [],
              uploadMethod: ImageUploadMethod.NOW,
              participantName: this.participantName,
              hospitalId: this.selectedHospitalId,
              parentName: this.parentName
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
      } catch (error) {
        Logger.error(error, 'budsies')();

        this.onFailure('Unexpected error: ' + error);
      }
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
  async mounted () {
    if (this.existingCartItem) {
      this.fillPlushieDataFromCartItem(this.existingCartItem);
      return;
    } else if (this.existingPlushieId) {
      await this.clearExistingPlushieId();
    }

    this.plushieId = await this.createPlushie();
  },
  created (): void {
    this.resetForm();
  },
  watch: {
    existingPlushieId (value) {
      if (!this.existingCartItem) {
        if (value) {
          this.clearExistingPlushieId();
        }
        return;
      }

      this.fillPlushieDataFromCartItem(this.existingCartItem);
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";
@import "~@storefront-ui/shared/styles/helpers/layout";

.o-budsies-pals-product-order-form {
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
      margin: var(--spacer-base) auto 0;
    }
  }

  ._step-divider {
    display: none;
  }

  ._step-title {
    @include border(--step-border, 0 0 4px 0, solid, var(--c-danger));
    --heading-title-color: var(--c-danger);
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

  .sf-input,
  .sf-select {
    margin-left: auto;
    margin-right: auto;
  }

  .sf-input {
    text-align: center;
  }

  ._field {
    margin-top: var(--spacer-sm);

    &:first-child {
      margin-top: 0;
    }
  }

  .sf-divider {
    margin-top: var(--spacer-xl);
  }

  .m-artwork-upload {
    margin: var(--spacer-lg) auto;
    max-width: 610px;
  }

  ._actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: var(--spacer-xl);
  }

  textarea {
    box-sizing: border-box;
    border: 1px solid var(--c-light);
    width: 100%;
    padding: 0.5em;
    font-family: var(--font-family-primary);
    resize: vertical;
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

  ._agreement {
    margin: var(--spacer-xl) auto 0;
    font-size: var(--font-xs);
    text-align: left;
    max-width: 45rem;
  }

  ._checkbox {
    --m-checkbox-align-items: flex-start;
  }

  @media (min-width: $tablet-min) {
    ._step-divider {
      display: block;
    }

    .sf-input,
    .sf-select {
      max-width: 30rem;
    }
  }
}
</style>
