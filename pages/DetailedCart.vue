<template>
  <div id="detailed-cart" :class="{ '-loading': isLoading }">
    <div class="loader-container" v-if="isLoading">
      <div class="loader" />
    </div>
    <div class="detailed-cart" v-else>
      <div class="detailed-cart__main">
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
                    :product-options="getProductOptions(product)"
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
                    v-if="getProductRegularPrice(product)"
                    :regular="getProductRegularPrice(product)"
                    :special="getProductSpecialPrice(product)"
                  />
                </template>

                <template #more-actions>
                  <div />
                </template>
              </SfCollectedProduct>
            </transition-group>

            <div class="_buttons-container">
              <SfButton
                class="color-secondary _button"
              >
                <router-link class="_inner" :to="{name: 'bulk-quote'}">
                  Add Another Design
                </router-link>
              </SfButton>

              <SfButton
                class="color-secondary _button"
              >
                <router-link class="_inner" :to="{name: 'plush-sample'}">
                  Order Another Sample
                </router-link>
              </SfButton>
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
        <OrderSummary
          :is-updating-quantity="isUpdatingQuantity"
        />
      </div>
    </div>
  </div>
</template>
<script>
import debounce from 'lodash-es/debounce';
import {
  SfPrice,
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
import { onlineHelper } from '@vue-storefront/core/helpers';
import getCartItemKey from 'src/modules/budsies/helpers/get-cart-item-key.function';
import CartEvents from 'src/modules/shared/types/cart-events';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { mapMobileObserver } from '@storefront-ui/vue/src/utilities/mobile-observer';
import { CART_UPD_ITEM } from '@vue-storefront/core/modules/cart/store/mutation-types'
import { getCustomizationSystemCartItemThumbnail } from 'src/modules/customization-system';
import { htmlDecode } from '@vue-storefront/core/filters';
import { getProductMaxSaleQuantity } from 'theme/helpers/get-product-max-sale-quantity.function';
import CartItemConfiguration from 'theme/components/customization-system/cart-item-configuration.vue';

const CHANGE_QUANTITY_DEBOUNCE_TIME = 1000;

const pillowSampleProductSku = 'pillowBulkSample_bundle';
const keychainSampleProductSku = 'keychainBulkSample_bundle';
const plushSampleProductSku = 'CustomBulkSample_bundle';

const bulkSampleProductSkus = [
  plushSampleProductSku,
  pillowSampleProductSku,
  keychainSampleProductSku
];

const editableProductsSkus = [
  ...bulkSampleProductSkus
];

export default {
  name: 'DetailedCart',
  inject: {
    imageHandlerService: { from: 'ImageHandlerService' }
  },
  components: {
    CartItemConfiguration,
    SfPrice,
    SfCollectedProduct,
    SfButton,
    SfHeading,
    SfQuantitySelector,
    OrderSummary
  },
  data () {
    return {
      isUpdatingQuantity: false,
      isDropdownOpen: false,
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
    getProductOptions (product) {
      const options = onlineHelper.isOnline && product.totals && product.totals.options
        ? product.totals.options
        : product.options || [];

      return options.map((option) => {
        return {
          value: option.value,
          label: option.label,
          isCustom: !!product.custom_options?.find((customOption) => customOption.title === option.label)
        }
      })
    },
    getPlushieName (product) {
      if (!product.plushieName) {
        return '';
      }

      let name = product.plushieName;

      if (product.plushieBreed) {
        name += ', ' + product.plushieBreed;
      }

      return this.truncate(name);
    },
    getPlushieDesc (product) {
      if (!product.plushieDescription) {
        return '';
      }

      return this.truncate(product.plushieDescription, 150, 50);
    },
    editHandler (product) {
      if (bulkSampleProductSkus.includes(product.sku)) {
        let routeName;

        if (product.sku === pillowSampleProductSku) {
          routeName = 'pillow-sample';
        } else if (product.sku === keychainSampleProductSku) {
          routeName = 'keychain-sample'
        } else {
          routeName = 'plush-sample';
        }

        this.$router.push({ name: routeName, query: { existingPlushieId: product.extension_attributes?.plushie_id } })
      }
    },
    getProductRegularPrice (product) {
      return getCartItemPrice(product, {}).regular;
    },
    getProductSpecialPrice (product) {
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
    truncate (text, desktopLength = 75, mobileLength = 50) {
      const maxLength = this.isMobile ? mobileLength : desktopLength;

      if (text.length <= maxLength) {
        return text;
      }

      return text.substring(0, maxLength) + '...';
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

._buttons-container {
  ._button {
    --c-link: var(--c-primary);
    --c-link-hover: var(--c-primary);
    --button-padding: 0;

    margin-top: var(--spacer-base);

    ._inner {
      padding: var(--spacer-sm) calc(var(--spacer-sm) * 1.5);
    }
  }
}

.detailed-cart {
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
    margin: var(--spacer-base) 0 0;
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

  ._buttons-container ._button ._inner {
    padding: var(--spacer-sm) calc(var(--spacer-sm) * 2);
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
