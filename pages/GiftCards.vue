<template>
  <div id="gift-cards-page">
    <SfModal
      :visible="showPreviewModal"
      @close="closePreviewModal"
      class="_preview-modal"
    >
      <GiftCardTemplateComponent
        :gift-card-template="selectedGiftCardTemplate"
        :recipient-name="recipientName"
        :sender-name="customerName"
        :price-amount="priceAmount"
        :custom-message="customMessage"
      />

      <template #close>
        <div class="_close-preview" />
      </template>
    </SfModal>

    <product-structured-data v-if="product" :product="product" />

    <div class="_content">
      <div class="_col -left">
        <GiftCardTemplateComponent
          class="_template"
          :gift-card-template="selectedGiftCardTemplate"
          :recipient-name="recipientName"
          :sender-name="customerName"
          :price-amount="priceAmount"
          :custom-message="customMessage"
          @click.native="onGiftCardTemplateClick"
        />

        <div class="_giftcard-banner">
          Multiple styles available! Select your favorite -->
        </div>
      </div>

      <div class="_form _col -right">
        <OGiftCardOrderForm
          :gift-card-order-form-data.sync="giftCardOrderFormData"
          :gift-card-templates-list="giftCardTemplatesList"
          :is-disabled="isSubmitting"
          :price-amount-list="priceAmountList"
          :custom-amount-values="customAmountValues"
          @submit-form="onFormSubmit"
          @show-preview="onShowPreviewModalHandler"
        />
      </div>

      <MProductDescriptionStory
        v-if="showStory"
        class="_giftcard-detailed-information"
        :product="product"
        :product-sku="product.sku"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { getThumbnailPath, isServer } from '@vue-storefront/core/helpers';
import Product from '@vue-storefront/core/modules/catalog/types/Product';
import { localizedRoute } from '@vue-storefront/core/lib/multistore';
import { Logger } from '@vue-storefront/core/lib/logger';
import i18n from '@vue-storefront/i18n';
import { PRODUCT_UNSET_CURRENT } from '@vue-storefront/core/modules/catalog/store/product/mutation-types';
import { htmlDecode } from '@vue-storefront/core/filters';

import { SfModal } from '@storefront-ui/vue';

import GiftCardTemplateComponent from 'src/modules/gift-card/components/GiftCardTemplate.vue';
import OGiftCardOrderForm from 'theme/components/organisms/o-gift-card-order-form.vue';
import MProductDescriptionStory from 'theme/components/molecules/m-product-description-story.vue';

import GiftCardTemplate from 'src/modules/gift-card/types/GiftCardTemplate.interface';
import { ImageHandlerService } from 'src/modules/file-storage';
import { InjectType, ProductEvent } from 'src/modules/shared';
import {
  AMASTY_GIFT_CARD_SKU,
  AmGiftCardType,
  GiftCardOptions,
  GiftCardTemplateSize
} from 'src/modules/gift-card';
import ServerError from 'src/modules/shared/types/server-error';

import { ProductStructuredData } from 'src/modules/budsies';
import {
  LAST_USED_CUSTOMER_FIRST_NAME,
  LAST_USED_CUSTOMER_LAST_NAME
} from 'src/modules/persisted-customer-data';

import GiftCardOrderFormData from 'theme/components/interfaces/gift-card-order-form-data.interface';

const defaultGiftCardOrderFormData: GiftCardOrderFormData = {
  selectedTemplateId: undefined,
  priceAmount: 200,
  shouldSendFriend: true,
  customerName: '',
  recipientName: '',
  recipientEmail: '',
  shouldShipPhysically: false,
  customMessage: '',
  qty: 1,
  customPriceAmount: 0
};

const giftCardSku = 'GiftCard';

interface InjectedServices {
  imageHandlerService: ImageHandlerService
}

export default (Vue as VueConstructor<Vue & InjectedServices>).extend({
  components: {
    GiftCardTemplateComponent,
    OGiftCardOrderForm,
    SfModal,
    MProductDescriptionStory,
    ProductStructuredData
  },
  inject: {
    imageHandlerService: { from: 'ImageHandlerService' }
  } as unknown as InjectType<InjectedServices>,
  computed: {
    customAmountValues (): {min?: number, max?: number} | undefined {
      if (!this.product) {
        return;
      }

      return {
        min: this.product.am_open_amount_min,
        max: this.product.am_open_amount_max
      }
    },
    customerName (): string {
      return this.giftCardOrderFormData.shouldSendFriend
        ? this.giftCardOrderFormData.customerName
        : '';
    },
    customMessage (): string {
      return this.giftCardOrderFormData.shouldSendFriend
        ? this.giftCardOrderFormData.customMessage
        : '';
    },
    firstGiftCardTemplate (): GiftCardTemplate | undefined {
      return this.giftCardTemplatesList[0];
    },
    getProductBySkuDictionary (): Record<string, Product> {
      return this.$store.getters['product/getProductBySkuDictionary'];
    },
    giftCardTemplatesList (): GiftCardTemplate[] {
      if (!this.product) {
        return [];
      }

      if (this.product.sku === AMASTY_GIFT_CARD_SKU) {
        return this.getGiftCardTemplatesFromProduct(this.product);
      }
      return this.$store.getters['giftCard/currentStoreGiftCardTemplates'];
    },
    loggedUserFullName (): string {
      const firstName = this.$store.getters[LAST_USED_CUSTOMER_FIRST_NAME];
      const lastName = this.$store.getters[LAST_USED_CUSTOMER_LAST_NAME];

      let fullName = '';

      if (firstName) {
        fullName = `${firstName} `;
      }

      if (lastName) {
        fullName += lastName;
      }

      return fullName.trim();
    },
    priceAmount (): number {
      return (
        this.giftCardOrderFormData.priceAmount ||
        this.giftCardOrderFormData.customPriceAmount
      );
    },
    priceAmountList (): number[] | undefined {
      if (!this.product) {
        return;
      }

      return this.product.am_gift_card_prices
    },
    product (): Product | null {
      const product = this.$store.getters['product/getCurrentProduct'];

      if (
        product?.sku !== giftCardSku &&
        product?.sku !== AMASTY_GIFT_CARD_SKU
      ) {
        return null;
      }

      return product;
    },
    recipientEmail (): string {
      return this.giftCardOrderFormData.shouldShipPhysically
        ? ''
        : this.giftCardOrderFormData.recipientEmail;
    },
    recipientName (): string {
      return this.giftCardOrderFormData.shouldSendFriend && !this.giftCardOrderFormData.shouldShipPhysically
        ? this.giftCardOrderFormData.recipientName
        : '';
    },
    selectedGiftCardTemplate (): GiftCardTemplate | undefined {
      if (
        !this.giftCardTemplatesList.length ||
        !this.giftCardOrderFormData.selectedTemplateId
      ) {
        return undefined;
      }

      const card = this.giftCardTemplatesList.find(
        (item) => item.id === this.giftCardOrderFormData.selectedTemplateId
      );

      if (!card) {
        return;
      }

      const pathType = this.product?.sku === AMASTY_GIFT_CARD_SKU
        ? 'am_gift_card'
        : 'giftcard'

      return {
        ...card,
        backgroundImage: getThumbnailPath(
          card.backgroundImage,
          GiftCardTemplateSize.width,
          GiftCardTemplateSize.height,
          pathType
        )
      };
    },
    showStory (): boolean {
      return !!this.product;
    }
  },
  data () {
    return {
      giftCardOrderFormData:
        defaultGiftCardOrderFormData as GiftCardOrderFormData,
      showPreviewModal: false,
      isSubmitting: false
    };
  },
  async mounted (): Promise<void> {
    await this.setCurrentProduct();
    this.updateCustomerName();
    this.initEventBusListeners();

    this.giftCardOrderFormData.selectedTemplateId =
      this.firstGiftCardTemplate?.id;

    EventBus.$emit(ProductEvent.PRODUCT_PAGE_SHOW, this.product);
  },
  beforeRouteLeave (to, from, next) {
    this.$store.commit(`product/${PRODUCT_UNSET_CURRENT}`);
    next();
  },
  beforeDestroy (): void {
    this.removeEventBusListeners();
  },
  async asyncData ({ store }): Promise<void> {
    let product: Product | undefined = await store.dispatch(
      'product/loadProduct',
      {
        parentSku: AMASTY_GIFT_CARD_SKU,
        setCurrent: false
      }
    );

    if (!product) {
      const result = await Promise.all([
        store.dispatch('giftCard/loadGiftCardsTemplates'),
        store.dispatch('product/loadProduct', {
          parentSku: giftCardSku,
          setCurrent: false
        })
      ]);

      product = result[1] as Product | undefined;
    }

    if (isServer) {
      await store.dispatch('product/setCurrent', product);
    }
  },
  methods: {
    async addCartItem (): Promise<void> {
      if (!this.product || !this.giftCardOrderFormData.selectedTemplateId) {
        return;
      }

      try {
        const giftCardData = this.getGiftCardData();

        const productToAdd: any = {
          ...this.product,
          ...giftCardData,
          qty: this.giftCardOrderFormData.qty
        };

        try {
          await this.$store.dispatch('cart/addItem', {
            productToAdd
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
    closePreviewModal (): void {
      this.showPreviewModal = false;
    },
    getGiftCardData () {
      if (!this.product) {
        throw new Error('Product is not defined');
      }

      if (!this.giftCardOrderFormData.selectedTemplateId) {
        throw new Error('Gift Card template is not selected');
      }

      if (this.product.sku === AMASTY_GIFT_CARD_SKU) {
        const options = {
          am_giftcard_image: this.giftCardOrderFormData.selectedTemplateId,
          am_giftcard_amount: this.giftCardOrderFormData.priceAmount,
          am_giftcard_amount_custom:
            this.giftCardOrderFormData.customPriceAmount,
          am_giftcard_sender_name: this.customerName,
          am_giftcard_recipient_name: this.recipientName,
          am_giftcard_recipient_email: this.recipientEmail,
          am_giftcard_message: this.customMessage,
          am_giftcard_type: this.giftCardOrderFormData.shouldShipPhysically
            ? AmGiftCardType.PHYSICAL
            : AmGiftCardType.VIRTUAL
        };

        return {
          product_option: {
            extension_attributes: {
              am_giftcard_options: options
            }
          }
        };
      }

      const giftCardOptions: GiftCardOptions = {
        product: this.product.id as number,
        related_product: '',
        qty: this.giftCardOrderFormData.qty,
        price_amount: this.priceAmount,
        amount: this.priceAmount,
        giftcard_template_id: this.giftCardOrderFormData.selectedTemplateId,
        send_friend: this.giftCardOrderFormData.shouldSendFriend ? 1 : '',
        customer_name: this.customerName,
        recipient_name: this.recipientName,
        recipient_email: this.recipientEmail,
        recipient_address: '',
        message: this.customMessage,
        notify_success: 0
      };

      if (this.giftCardOrderFormData.shouldShipPhysically) {
        giftCardOptions.recipient_ship = 'yes';
      }

      return {
        giftcard_options: giftCardOptions
      };
    },
    getGiftCardTemplatesFromProduct (product: Product): GiftCardTemplate[] {
      if (!product.gift_card_images_data) {
        return [];
      }

      return product.gift_card_images_data.map((item) => {
        return {
          id: item.id,
          name: item.gift_card_title || item.title,
          backgroundImage: item.image_path,
          textColor: '#003e6b'
        };
      });
    },
    goToCart (): void {
      this.$router.push(localizedRoute({ name: 'detailed-cart' }));
    },
    initEventBusListeners (): void {
      EventBus.$on('session-after-started', this.updateCustomerName);
      EventBus.$on('user-after-logout', this.updateCustomerName);
      EventBus.$on('user-after-loggedin', this.updateCustomerName);
    },
    onFailure (message: any): void {
      this.$store.dispatch('notification/spawnNotification', {
        type: 'danger',
        message: message,
        action1: { label: i18n.t('OK') }
      });
    },
    async onFormSubmit (): Promise<void> {
      this.isSubmitting = true;
      await this.addCartItem();
      this.isSubmitting = false;
    },
    onGiftCardTemplateClick (): void {
      this.showPreviewModal = true;
    },
    onShowPreviewModalHandler (): void {
      this.showPreviewModal = true;
    },
    removeEventBusListeners (): void {
      EventBus.$off('session-after-started', this.updateCustomerName);
      EventBus.$off('user-after-logout', this.updateCustomerName);
      EventBus.$off('user-after-loggedin', this.updateCustomerName);
    },
    async setCurrentProduct (): Promise<void> {
      if (this.product) {
        return;
      }

      const product =
        this.getProductBySkuDictionary[AMASTY_GIFT_CARD_SKU] ||
        this.getProductBySkuDictionary[giftCardSku];
      await this.$store.dispatch('product/setCurrent', product);
    },
    updateCustomerName (): void {
      this.giftCardOrderFormData.customerName = this.loggedUserFullName;
    }
  },
  metaInfo () {
    return {
      title: htmlDecode(this.product?.meta_title || this.product?.name),
      meta: this.product?.meta_description
        ? [
          {
            vmid: 'description',
            name: 'description',
            content: htmlDecode(this.product?.meta_description)
          }
        ]
        : []
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

#gift-cards-page {
  padding: var(--spacer-lg) 0;

  * {
    box-sizing: border-box;
  }

  ._content {
    display: flex;
    flex-wrap: wrap;
  }

  ._template {
    cursor: pointer;
  }

  ._col {
    padding: 0 var(--spacer-sm);
    width: 100%;

    &.-left {
      display: flex;
      flex-direction: column;
    }
  }

  ._form {
    width: 100%;
  }

  ._giftcard-banner {
    padding: var(--spacer-xs) var(--spacer-lg);
    margin-top: var(--spacer-base);
    text-align: center;
    background-color: #fce0e1;
    width: 100%;
  }

  ._giftcard-detailed-information {
    padding: 0 var(--spacer-sm);
    flex-grow: 1;
  }

  ._preview-modal {
    --modal-content-padding: 0;
    --modal-close-right: -18px;
    --modal-close-top: -15px;
    --modal-width: auto;
    --modal-top: 50%;
    --modal-left: 50%;
    --modal-bottom: none;
    --modal-right: none;
    --modal-transform: translate3d(-50%, -50%, 0);
    --modal-height: auto;
    --modal-index: 201;
    --overlay-z-index: 200;

    ._close-preview {
      width: 35px;
      height: 35px;
      background: url("../assets/giftcards/close.png");
      z-index: 15;
      position: relative;
    }

    ::v-deep {
      .sf-modal__container {
        max-width: calc(100% - var(--spacer-xl));
      }

      .sf-modal__bar {
        display: none !important;
      }

      .sf-modal__close {
        display: block !important;
      }
    }
  }

  @media (min-width: $tablet-min) {
    max-width: 71.75rem;
    width: 100%;
    margin: 0 auto;
  }

  @media (min-width: $mobile-max) {
    ._col {
      &.-left {
        flex: 7;
        width: 58%;
      }

      &.-right {
        flex: 5;
        width: 41%;
      }
    }
  }

  @include for-desktop {
    padding: 3em 0;

    ._col {
      &.-left {
        flex: 8;
        width: 66%;
      }

      &.-right {
        flex: 4;
        width: 33%;
      }
    }
  }
}
</style>
