<template>
  <div
    id="detailed-cart"
    :class="{ '-loading': isLoading, [skinClass]: true }"
  >
    <div class="loader-container" v-if="isLoading">
      <div class="loader" />
    </div>
    <div class="detailed-cart" v-else>
      <div class="detailed-cart__main">
        <ProductionSpotCountdown
          :can-show="canShowProductionSpotCountdown"
          class="_production-spot-countdown"
        />

        <transition name="fade" mode="out-in">
          <div
            v-if="totalItems"
            key="detailed-cart"
            class="collected-product-list"
          >
            <transition-group name="fade" tag="div">
              <SfCollectedProduct
                v-for="product in products"
                :key="getCartItemKey(product)"
                :image="getThumbnailForProductExtend(product)"
                image-width="140"
                image-height="140"
                :title="product.name"
                class="sf-collected-product--detailed collected-product"
              >
                <template #configuration>
                  <cart-item-configuration
                    :customizations="product.customizations"
                    :customization-state="(product.extension_attributes || {}).customization_state"
                    :product-options="getCartItemOptions(product)"
                  />
                </template>

                <template #input>
                  <SfQuantitySelector
                    :qty="product.qty"
                    :disabled="isUpdatingQuantity"
                    @input="changeProductQuantity(product, $event)"
                    v-if="showQuantitySelectorForProduct(product)"
                  />

                  <div class="_quantity" v-else>
                    {{ product.qty }}
                  </div>
                </template>

                <template #price>
                  <div />
                </template>

                <template #actions>
                  <SfButton
                    v-if="showEditButton(product.sku)"
                    class="sf-button--text actions__button"
                    @click="editHandler(product)"
                  >
                    Edit
                  </SfButton>

                  <SfButton
                    class="sf-button--text sf-collected-product__remove sf-collected-product__remove--text actions__button"
                    @click="removeHandler(product)"
                  >
                    Remove
                  </SfButton>
                </template>

                <template #remove>
                  <SfPrice
                    v-if="getProductRegularPrice(product, campaignContent)"
                    :regular="getProductRegularPrice(product, campaignContent)"
                    :special="getProductSpecialPrice(product, campaignContent)"
                  />
                </template>

                <template #more-actions>
                  <div />
                </template>
              </SfCollectedProduct>
            </transition-group>
            <div
              class="_dropdown-container"
              :class="{ '-open': isDropdownOpen }"
            >
              <SfButton
                class="color-secondary"
                @click.prevent.self="isDropdownOpen = !isDropdownOpen"
              >
                Order More
              </SfButton>

              <MDropdown
                :is-open="isDropdownOpen"
                @click:close="isDropdownOpen = false"
              >
                <SfList>
                  <SfListItem
                    v-for="action in dropdownActions"
                    :key="action.label"
                  >
                    <router-link
                      :to="action.url"
                      @click.native="onDropdownActionClick(action)"
                    >
                      {{ action.label }}
                    </router-link>
                  </SfListItem>
                </SfList>
              </MDropdown>
            </div>
          </div>

          <div v-else key="empty-cart" class="empty-cart">
            <SfHeading
              title="Your cart is empty"
              :level="2"
              subtitle="Looks like you haven’t added any items to the cart yet. Start
                shopping to fill it in."
            />

            <SfButton
              class="sf-button--full-width color-primary empty-cart__button"
              @click="processStartShopping"
            >
              Start shopping
            </SfButton>
          </div>
        </transition>
      </div>

      <div v-if="totalItems" class="detailed-cart__aside">
        <OrderSummary :is-updating-quantity="isUpdatingQuantity" />

        <div class="_shipping-handling-block">
          <SfHeading :level="3" title="Shipping &amp; Handling" />
          <p>Once completed, your Budsies will ship via USPS Priority Mail (US); First Class Mail (Int'l)</p>
          <ul>
            <li>Custom Plushies: (<strong>US</strong>) $14.95, $7.95 for each additional; (<strong>International</strong>) $26.95, $7.95 for each additional</li>
            <li>Custom Pillows: <strong>(US</strong>) starting at $4.95;&nbsp;(<strong>International)</strong> $14.95</li>
            <li>International shipping rates will increase if supersized items are purchased.</li>
            <li>Read more about rates&nbsp;<a href="https://support.budsies.com/support/solutions/articles/13000033713-shipping-handling-fees" target="_blank">here</a>. Rates determined by weight</li>
            <li>Tracking number will be emailed to you at time of shipment</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import debounce from 'lodash-es/debounce';
import {
  SfPrice,
  SfList,
  SfCollectedProduct,
  SfButton,
  SfHeading,
  SfQuantitySelector
} from '@storefront-ui/vue';
import { OrderSummary } from './DetailedCart/index.js';
import { mapGetters, mapState } from 'vuex';
import { getCartItemPrice } from 'src/modules/shared';
import { localizedRoute } from '@vue-storefront/core/lib/multistore';
import { getThumbnailForProduct } from '@vue-storefront/core/modules/cart/helpers';
import getCartItemKey from 'src/modules/budsies/helpers/get-cart-item-key.function';
import CartEvents from 'src/modules/shared/types/cart-events';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { mapMobileObserver } from '@storefront-ui/vue/src/utilities/mobile-observer';
import { CART_UPD_ITEM } from '@vue-storefront/core/modules/cart/store/mutation-types';
import ProductionSpotCountdown from 'src/modules/promotion-platform/components/ProductionSpotCountdown.vue';
import { getCustomizationSystemCartItemThumbnail } from 'src/modules/customization-system';
import isCustomProduct from 'src/modules/shared/helpers/is-custom-product.function';
import { htmlDecode } from '@vue-storefront/core/filters';
import { getProductMaxSaleQuantity } from 'theme/helpers/get-product-max-sale-quantity.function';
import getCurrentThemeClass from 'theme/helpers/get-current-theme-class';
import MDropdown from 'theme/components/molecules/m-dropdown.vue';
import CartItemConfiguration from 'theme/components/customization-system/cart-item-configuration.vue';
import { getCartItemOptions } from 'theme/helpers/get-cart-item-options.function';

const CHANGE_QUANTITY_DEBOUNCE_TIME = 1000;

const foreversProductsSkus = [
  'ForeversDog_bundle',
  'ForeversCat_bundle',
  'ForeversOther_bundle'
];

const golfHeadCoversProductsSkus = [
  'golfHeadCoversDog_bundle',
  'golfHeadCoversCat_bundle',
  'golfHeadCoversOther_bundle'
];

const printedProductSkus = [
  'customPrintedSocks_bundle',
  'customPrintedMasks_bundle',
  'customPrintedKeychains_bundle',
  'customFeltedMagnets_bundle',
  'customFeltedOrnaments_bundle',
  'customCartoonPillows_bundle'
]

const blanketProductsSkus = [
  'customRenaissanceBlankets_bundle',
  'customCutOutBlankets_bundle'
]

const clayPlushieProductSkus = [
  'figurines_bundle',
  'bobbleheads_bundle'
]

const clothesProductSkus = [
  'customPajamas_bundle',
  'customHawaiianShirts_bundle',
  'customGolfShirts_bundle'
];

const customPillowSku = 'customPillow_bundle';

const budsiesPlushieProductSkus = [
  'CustomBudsie1_bundle',
  'budsiesPuppet_bundle'
];

const selfiesProductSkus = [
  'CustomSelfie_bundle',
  'selfiesPuppet_bundle'
];

const specialtyCommissionSku = 'specialtyCommission_bundle';
const budsiesPalsSku = 'customPals_bundle';
const buddyPillowSku = 'customBuddyPillow_bundle';
const nftBudsieSku = 'budsieNft_bundle';
const customPhotoPortraitsSku = 'customPhotoPortraits_bundle';

const editableProductsSkus = [
  ...foreversProductsSkus,
  ...printedProductSkus,
  ...blanketProductsSkus,
  ...clayPlushieProductSkus,
  ...golfHeadCoversProductsSkus,
  ...clothesProductSkus,
  ...budsiesPlushieProductSkus,
  ...selfiesProductSkus,
  specialtyCommissionSku,
  budsiesPalsSku,
  buddyPillowSku,
  nftBudsieSku,
  customPillowSku,
  customPhotoPortraitsSku
];

export default {
  name: 'DetailedCart',
  inject: {
    imageHandlerService: { from: 'ImageHandlerService' }
  },
  components: {
    CartItemConfiguration,
    MDropdown,
    SfPrice,
    SfList,
    SfCollectedProduct,
    SfButton,
    SfHeading,
    SfQuantitySelector,
    OrderSummary,
    ProductionSpotCountdown
  },
  data () {
    return {
      isUpdatingQuantity: false,
      isDropdownOpen: false,
      dropdownActions: [
        {
          label: 'Budsies',
          url: '/budsies-services/'
        },
        {
          label: 'Selfies',
          url: '/selfies-services/'
        },
        {
          label: 'Puppets',
          url: '/custom-puppets/'
        },
        {
          label: 'Buddy Pillows',
          url: '/buddy-pillows/'
        },
        {
          label: 'Photo Pillows',
          url: {
            name: 'category',
            params: {
              slug: 'photo-pillows-designs'
            }
          }
        },
        {
          label: this.$t('Shirts'),
          url: '/custom-shirts/'
        },
        {
          label: this.$t('Blankets'),
          url: {
            name: 'cut-out-blankets'
          }
        },
        {
          label: 'Socks',
          url: {
            name: 'printed-socks-creation-page'
          }
        },
        {
          label: 'Cartoon Pillows',
          url: '/plushie/index/cartoonPillows/'
        },
        {
          label: 'Keychains',
          url: {
            name: 'printed-keychains-creation-page'
          }
        },
        {
          label: 'Bobbleheads',
          url: '/bobbleheads/create/'
        },
        {
          label: 'Figurines',
          url: '/figurines/create/'
        },
        {
          label: this.$t('Pajamas'),
          url: {
            name: 'pajamas-creation'
          }
        },
        // {
        //   label: this.$t('Hawaiian Shirts'),
        //   url: {
        //     name: 'hawaiian-shirts-creation'
        //   }
        // },
        // {
        //   label: this.$t('Golf Shirts'),
        //   url: {
        //     name: 'golf-shirts-creation'
        //   }
        // },
        // {
        //   label: 'Photo Portraits',
        //   url: {
        //     name: 'photo-portraits-creation-page'
        //   }
        // },
        {
          label: 'Accessories',
          url: {
            name: 'category',
            params: {
              slug: 'accessories-for-custom-products'
            }
          }
        },
        {
          label: 'Gift Boxes',
          url: {
            name: 'giftbox'
          }
        },
        {
          label: this.$t('Gift Cards'),
          url: '/purchase-gift-card/'
        }
      ],
      isMounted: false,
      syncQuantityDebounced: undefined
    };
  },
  props: {
    isActive: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    ...mapState({
      cartIsLoaded: (state) => state.cart.cartIsLoaded
    }),
    ...mapGetters({
      products: 'cart/getCartItems'
    }),
    ...mapMobileObserver(),
    totalItems () {
      return this.products.reduce(
        (totalItems, product) => totalItems + parseInt(product.qty, 10),
        0
      );
    },
    isLoading () {
      return !this.isMounted || !this.cartIsLoaded;
    },
    canShowProductionSpotCountdown () {
      return this.products.some((product) => isCustomProduct(product.id));
    },
    skinClass () {
      return getCurrentThemeClass();
    },
    campaignContent () {
      return this.$store.getters['promotionPlatform/campaignContent'];
    }
  },
  async mounted () {
    this.syncQuantityDebounced = debounce(
      this.syncQuantity,
      CHANGE_QUANTITY_DEBOUNCE_TIME
    );
    await this.$nextTick();
    this.isMounted = true;
  },
  beforeDestroy () {
    this.syncQuantityDebounced.cancel();
  },
  methods: {
    getCartItemOptions,
    editHandler (product) {
      if (product.sku === customPhotoPortraitsSku) {
        this.$router.push({
          name: 'photo-portraits-creation-page',
          query: {
            existingPlushieId: product.extension_attributes?.plushie_id
          }
        });
      } else if (product.sku === customPillowSku) {
        this.$router.push({
          name: 'pillow-product',
          query: {
            existingPlushieId: product.extension_attributes?.plushie_id
          }
        })
      } else if (product.sku === nftBudsieSku) {
        this.$router.push({
          name: 'nft-budsies-create',
          query: {
            existingPlushieId: product.extension_attributes?.plushie_id
          }
        });
      } else if (product.sku === buddyPillowSku) {
        this.$router.push({
          name: 'pillow-product',
          query: {
            existingPlushieId: product.extension_attributes?.plushie_id
          }
        })
      } else if (product.sku === budsiesPalsSku) {
        this.$router.push({
          name: 'budsies-pals-creation',
          query: {
            existingPlushieId: product.extension_attributes?.plushie_id
          }
        });
      } else if (product.sku === specialtyCommissionSku) {
        this.$router.push({
          name: 'specialty-commissions-creation',
          query: {
            existingPlushieId: product.extension_attributes?.plushie_id
          }
        });
      } else if (selfiesProductSkus.includes(product.sku)) {
        const routeName = product.sku === 'CustomSelfie_bundle'
          ? 'selfies-creation'
          : 'selfies-puppets-creation';

        this.$router.push({
          name: routeName,
          query: {
            existingPlushieId: product.extension_attributes?.plushie_id
          }
        });
      } else if (budsiesPlushieProductSkus.includes(product.sku)) {
        const routeName = product.sku === 'CustomBudsie1_bundle'
          ? 'budsie-creation'
          : 'budsies-puppets-creation';

        this.$router.push({
          name: routeName,
          query: {
            existingPlushieId: product.extension_attributes?.plushie_id
          }
        });
      } else if (clothesProductSkus.includes(product.sku)) {
        this.$router.push({
          name: 'clothes-product',
          params: { sku: product.sku },
          query: {
            existingPlushieId: product.extension_attributes?.plushie_id
          }
        });
      } else if (golfHeadCoversProductsSkus.includes(product.sku)) {
        this.$router.push({
          name: 'golf-covers-create',
          query: { id: product.extension_attributes?.plushie_id }
        });
      } else if (foreversProductsSkus.includes(product.sku)) {
        this.$router.push({
          name: 'forevers-create',
          query: { id: product.extension_attributes?.plushie_id }
        });
      } else if (printedProductSkus.includes(product.sku)) {
        this.$router.push({
          name: 'printed-product',
          params: { sku: product.sku },
          query: {
            existingPlushieId: product.extension_attributes?.plushie_id
          }
        });
      } else if (blanketProductsSkus.includes(product.sku)) {
        const routeName = product.sku === 'customCutOutBlankets_bundle'
          ? 'cut-out-blankets'
          : 'renaissance-blankets';

        this.$router.push({
          name: routeName,
          query: {
            existingPlushieId: product.extension_attributes?.plushie_id
          }
        });
      } else if (clayPlushieProductSkus.includes(product.sku)) {
        const routeName = product.sku === 'bobbleheads_bundle'
          ? 'bobbleheads-creation'
          : 'figurines-creation';

        this.$router.push({
          name: routeName,
          query: {
            existingPlushieId: product.extension_attributes?.plushie_id
          }
        });
      }
    },
    // TODO: campaignContent param is quick fix, need to refactor
    getProductRegularPrice (product, campaignContent) {
      return getCartItemPrice(product, {}).regular;
    },
    // TODO: campaignContent param is quick fix, need to refactor
    getProductSpecialPrice (product, campaignContent) {
      return getCartItemPrice(product, {}).special;
    },
    removeHandler (product) {
      this.$store.dispatch('cart/removeItem', { product: product });
    },
    getThumbnailForProductExtend (product) {
      const customizationSystemThumbnail =
        getCustomizationSystemCartItemThumbnail(
          product,
          this.imageHandlerService
        );

      if (customizationSystemThumbnail) {
        return customizationSystemThumbnail;
      }

      if (product.thumbnail && product.thumbnail.includes('://')) {
        return product.thumbnail;
      }

      return getThumbnailForProduct(product);
    },
    async changeProductQuantity (product, qty) {
      this.$store.commit(`cart/${CART_UPD_ITEM}`, { product, qty });

      if (this.$store.getters['cart/isCartSyncEnabled']) {
        this.syncQuantityDebounced();
      }
    },
    showQuantitySelectorForProduct (product) {
      return getProductMaxSaleQuantity(product) > 1;
    },
    syncQuantity () {
      this.isUpdatingQuantity = true;

      return this.$store
        .dispatch('cart/sync', {
          forceClientState: true
        })
        .finally(() => {
          this.isUpdatingQuantity = false;
        });
    },
    onDropdownActionClick (action) {
      EventBus.$emit(CartEvents.MAKE_ANOTHER_FROM_CART, action.label);
    },
    showEditButton (productSku) {
      return editableProductsSkus.includes(productSku);
    },
    getCartItemKey (cartItem) {
      return getCartItemKey(cartItem);
    },
    processStartShopping () {
      this.$router.push(localizedRoute('/'));
    }
  },
  watch: {
    isLoading (value) {
      if (value) {
        return;
      }

      EventBus.$emit(CartEvents.CART_VIEWED, {
        products: this.products,
        platformTotals: this.$store.state.cart.platformTotals
      });
    }
  },
  metaInfo () {
    return {
      title: htmlDecode(this.$t('Shopping Cart'))
    };
  }
};
</script>
<style lang="scss" scoped>
@import "~@storefront-ui/vue/styles";
#detailed-cart {
  box-sizing: border-box;

  &.-loading {
    height: 100%;
  }

  @include for-desktop {
    max-width: 1272px;
    width: 100%;
    margin: auto;
    padding: 0 var(--spacer-sm);
  }

  &.-skin-budsies {
    ._dropdown-container {
      .sf-dropdown {
        --dropdown-background: var(--c-blue);
      }

      --button-transition: box-shadow, border-radius 150ms ease-in-out;

      .sf-dropdown {
        .sf-list__item {
          &:hover {
            background-color: var(--c-black);
          }
        }
      }

      ::v-deep {
        .sf-dropdown__container {
          overflow: hidden;
          border-radius: 0 0 var(--button-border-radius-size) var(--button-border-radius-size);
        }
      }

      &.-open {
        .sf-button {
          --button-border-radius: var(--button-border-radius-size) var(--button-border-radius-size) 0 0;
        }
      }
    }
  }
}

.loader-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .loader {
    position: absolute;
    width: 4.8em;
    height: 4.8em;
    border-radius: 100%;
    border: 2px solid var(--c-secondary);
    border-bottom-color: var(--c-primary);
    animation: rotate 1s linear infinite;
  }
}

.detailed-cart {
  ._production-spot-countdown {
    margin: var(--spacer-sm) 0;
  }

  .sf-collected-product {
    --collected-product-image-background: none;
    --collected-product-main-margin: 0 var(--spacer-sm);

    .sf-price {
      align-items: flex-start;
      flex-direction: column;
    }

    &__remove {
      position: static;
    }
  }
  ._dropdown-container {
    display: inline-block;
    position: relative;
    margin: var(--spacer-lg) auto;
    align-self: center;
    .sf-button {
      --button-font-size: var(--font-sm);
      --button-font-line-height: 1;
    }
    .sf-dropdown {
      left: 0;
      --dropdown-background: var(--c-primary);
      --c-link: var(--c-light-variant);
      --c-link-hover: var(--c-light-variant);
      --list-item-padding: var(--spacer-xs) var(--spacer-sm);

      .sf-list__item {
        &:hover {
          background-color: var(--c-light);
        }
      }
    }
  }
  .sf-quantity-selector {
    ::v-deep {
      .sf-quantity-selector__button {
        --button-background: transparent;
      }
    }
  }
  &__main {
    padding: 0 var(--spacer-sm);
    position: relative;
    z-index: 1;

    @include for-desktop {
      padding: 0;
    }
  }
  &__aside {
    box-sizing: border-box;
    width: 100%;

    ._shipping-handling-block {
      margin: var(--spacer-xl) 0;
      padding: 0 var(--spacer-xl);
      font-size: var(--font-xs);
      line-height: 1.6;
    }
  }

  ._quantity {
    line-height: initial;
    text-align: center;
    margin-top: var(--spacer-sm);
    font-size: var(--font-lg);
  }

  @include for-desktop {
    display: flex;
    .sf-collected-product {
      .sf-price {
        flex-direction: row;
      }
      ::v-deep &__details {
        flex-grow: 3;
      }
      ::v-deep &__actions {
        flex-grow: 1;
      }
    }
    &__main {
      flex: 1;
    }
    &__aside {
      flex: 0 0 26.8125rem;
      margin: 0 0 0 var(--spacer-xl);
    }
  }
}
.collected-product-list {
  text-align: left;
}
.collected-product {
  --collected-product-padding: var(--spacer-sm) 0;
  --collected-product-title-font-size: var(--font-sm);
  --collected-product-title-font-weight: var(--font-semibold);
  border: 1px solid var(--c-light);
  border-width: 1px 0 0 0;

  ::v-deep {
    .sf-link {
      pointer-events: none;
      cursor: default;
    }
  }

  @include for-mobile {
    --collected-product-remove-bottom: var(--spacer-sm);
    &:first-of-type {
      border: none;
    }
  }
  @include for-desktop {
    --collected-product-padding: var(--spacer-lg) 0;
    --collected-product-title-font-size: var(--font-base);
  }
}
.actions {
  &__button {
    margin-bottom: var(--spacer-xs);
    align-self: flex-start;
  }
}
.empty-cart {
  --heading-title-color: var(--c-primary);
  --heading-title-margin: var(--spacer-2xl) 0 var(--spacer-base) 0;
  --heading-subtitle-margin: 0 0 var(--spacer-xl) 0;
  --heading-title-font-weight: var(--font-semibold);
  display: flex;
  flex: 1;
  align-items: center;
  flex-direction: column;
  @include for-desktop {
    &__button {
      --button-width: 20.9375rem;
    }
  }
}
</style>
