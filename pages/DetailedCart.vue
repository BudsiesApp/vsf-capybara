<template>
  <div id="detailed-cart" :class="{ '-loading': isLoading }">
    <span
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ cartItemRemovalAnnouncement }}
    </span>

    <span
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ isCartSyncing ? $t('Cart is syncing') : $t('Cart is synchronized') }}
    </span>

    <div class="loader-container" v-if="isLoading">
      <div class="loader" />
    </div>
    <div class="detailed-cart" v-else>
      <div class="detailed-cart__main">
        <ProductionSpotCountdown
          :can-show="canShowProductionSpotCountdown"
          class="_production-spot-countdown"
        />

        <transition
          name="fade"
          mode="out-in"
          @after-enter="onCartTransitionComplete"
        >
          <div
            v-if="totalItems"
            key="detailed-cart"
          >
            <transition-group
              name="fade"
              tag="div"
              class="collected-product-list"
              @after-leave="onCartItemLeaveComplete"
            >
              <CartLineItem
                v-for="product in products"
                ref="cartLineItems"
                :key="getCartItemKey(product)"
                :product="product"
                @removing="onItemRemoving"
                @removed="onItemRemoved"
              />
            </transition-group>

            <div
              class="_dropdown-container"
              v-click-outside="() => isDropdownOpen = false"
            >
              <SfButton
                id="order-more-toggle"
                class="color-secondary"
                :aria-expanded="isDropdownOpen.toString()"
                aria-controls="order-more-options"
                type="button"
                @click="isDropdownOpen = !isDropdownOpen"
              >
                {{ $t('Order More') }}
              </SfButton>

              <MDropdown
                :is-open="isDropdownOpen"
                :title="$t('Order More')"
                :close-on-outside-click="false"
                @click:close="isDropdownOpen = false"
              >
                <div
                  id="order-more-options"
                  aria-labelledby="order-more-toggle"
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
                </div>
              </MDropdown>
            </div>
          </div>

          <div
            v-else
            key="empty-cart"
            class="empty-cart"
          >
            <SfHeading
              :level="2"
              subtitle="Looks like you haven’t added any items to the cart yet. Start
                shopping to fill it in."
            >
              <template #title>
                <h2
                  ref="emptyCartHeading"
                  class="sf-heading__title sf-heading__title--h2"
                  tabindex="-1"
                >
                  {{ $t('Your cart is empty') }}
                </h2>
              </template>
            </SfHeading>

            <SfButton
              class="sf-button--full-width color-primary empty-cart__button"
              @click="processStartShopping"
            >
              {{ $t('Start shopping') }}
            </SfButton>
          </div>
        </transition>
      </div>

      <div v-if="totalItems" class="detailed-cart__aside">
        <OrderSummary />

        <div class="_shipping-handling-block">
          <MBlockStory story-slug="cart_shipping_handling" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {
  SfList,
  SfButton,
  SfHeading
} from '@storefront-ui/vue';

import { clickOutside } from '@storefront-ui/vue/src/utilities/directives'

import { OrderSummary } from './DetailedCart/index.js';
import CartLineItem from './DetailedCart/cart-line-item.vue';
import { mapGetters, mapState } from 'vuex';
import { localizedRoute } from '@vue-storefront/core/lib/multistore';
import getCartItemKey from '@vue-storefront/core/modules/cart/helpers/get-cart-item-key.function';
import CartEvents from 'src/modules/shared/types/cart-events';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { mapMobileObserver } from '@storefront-ui/vue/src/utilities/mobile-observer';
import { nextTick, ref } from 'vue';
import ProductionSpotCountdown from 'src/modules/promotion-platform/components/ProductionSpotCountdown.vue';
import { htmlDecode } from '@vue-storefront/core/filters';
import { ORDER_ERROR_EVENT } from '@vue-storefront/core/modules/checkout';
import { IS_CART_SYNCING } from '@vue-storefront/core/modules/cart';
import { ModalList } from 'theme/store/ui/modals';
import MBlockStory from 'theme/components/molecules/m-block-story.vue';
import MDropdown from 'theme/components/molecules/m-dropdown.vue';
import { useRenderedOrderTemplateRefs } from 'theme/helpers/use-rendered-order-template-refs';

export default {
  name: 'DetailedCart',
  components: {
    CartLineItem,
    MBlockStory,
    MDropdown,
    SfList,
    SfButton,
    SfHeading,
    OrderSummary,
    ProductionSpotCountdown
  },
  directives: {
    clickOutside
  },
  data () {
    return {
      isDropdownOpen: false,
      cartItemRemovalAnnouncement: '',
      pendingCartItemFocusKey: null,
      shouldFocusEmptyCart: false,
      dropdownActions: [
        {
          label: this.$t('Forevers Pet'),
          url: '/forevers-pet-plush/'
        },
        {
          label: this.$t('Huggables Pet'),
          url: '/huggables/'
        },
        {
          label: this.$t('Golf Club Headcovers'),
          url: '/golf-headcovers/'
        },
        {
          label: 'Pet Pillow',
          url: '/pet-pillow/'
        },
        {
          label: 'Photo Pillow',
          url: {
            name: 'category',
            params: {
              slug: 'photo-pillows-designs'
            }
          }
        },
        {
          label: this.$t('Pet Photo Blankets'),
          url: {
            name: 'cut-out-blankets'
          }
        },
        {
          label: this.$t('Renaissance Blankets'),
          url: {
            name: 'renaissance-blankets'
          }
        },
        {
          label: 'Socks',
          url: {
            name: 'printed-socks-creation-page'
          }
        },
        // {
        //   label: 'Face Masks',
        //   url: {
        //     name: 'printed-masks-creation-page'
        //   }
        // },
        {
          label: 'Bobbleheads & Figurines',
          url: '/pet-bobblehead-figurines/'
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
        {
          label: this.$t('Golf Shirts'),
          url: {
            name: 'golf-shirts-creation'
          }
        },
        {
          label: 'Pet Keychains',
          url: {
            name: 'printed-keychains-creation-page'
          }
        },
        {
          label: 'Pet Magnets',
          url: {
            name: 'felted-magnets-creation-page'
          }
        },
        {
          label: 'Pet Ornaments',
          url: {
            name: 'felted-ornaments-creation-page'
          }
        },
        {
          label: 'Pet Portraits',
          url: {
            name: 'photo-portraits-creation-page'
          }
        },
        {
          label: this.$t('Tumblers'),
          url: {
            name: 'tumblers-creation'
          }
        }
      ],
      isMounted: false
    };
  },
  setup () {
    const emptyCartHeading = ref(null);
    const {
      templateRef: cartLineItems,
      getRefsInRenderedOrder: getCartLineItemsInRenderedOrder
    } = useRenderedOrderTemplateRefs();

    const focusCartLineItem = (cartItemKey) => {
      const cartLineItem = getCartLineItemsInRenderedOrder().find(
        (cartLineItem) => cartLineItem.getItemKey() === cartItemKey
      );

      return cartLineItem?.focusCartItem() || false;
    };

    const focusEmptyCartHeading = () => {
      const emptyCartHeadingElement = emptyCartHeading.value;

      if (!(emptyCartHeadingElement instanceof HTMLElement)) {
        return;
      }

      emptyCartHeadingElement.focus();
    };

    return {
      cartLineItems,
      emptyCartHeading,
      focusCartLineItem,
      focusEmptyCartHeading
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
      products: 'cart/getCartItems',
      isCartSyncing: IS_CART_SYNCING
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
      return this.products.some((product) => Boolean(product.is_custom_product));
    }
  },
  async mounted () {
    await this.$nextTick();
    this.isMounted = true;
  },
  beforeMount () {
    EventBus.$on(ORDER_ERROR_EVENT, this.onOrderErrorEventHandler);
  },
  beforeDestroy () {
    EventBus.$off(ORDER_ERROR_EVENT, this.onOrderErrorEventHandler);
  },
  methods: {
    onItemRemoving (cartItemKey) {
      this.cartItemRemovalAnnouncement = '';

      nextTick(() => {
        this.cartItemRemovalAnnouncement = this.$t('Product removed from cart.').toString();
      });

      const cartItemIndex = this.products.findIndex(
        (product) => this.getCartItemKey(product) === cartItemKey
      );
      const nextCartItem = this.products[cartItemIndex + 1];
      const previousCartItem = this.products[cartItemIndex - 1];
      const focusCartItem = nextCartItem || previousCartItem;

      this.pendingCartItemFocusKey = focusCartItem
        ? this.getCartItemKey(focusCartItem)
        : null;
    },
    onItemRemoved () {
      if (this.totalItems) {
        return;
      }

      this.pendingCartItemFocusKey = null;
      this.shouldFocusEmptyCart = true;
    },
    onCartItemLeaveComplete () {
      const cartItemFocusKey = this.pendingCartItemFocusKey;

      this.pendingCartItemFocusKey = null;

      if (!cartItemFocusKey) {
        return;
      }

      this.focusCartLineItem(cartItemFocusKey);
    },
    onCartTransitionComplete () {
      if (!this.shouldFocusEmptyCart || this.totalItems) {
        return;
      }

      this.shouldFocusEmptyCart = false;
      this.focusEmptyCartHeading();
    },
    onDropdownActionClick (action) {
      EventBus.$emit(CartEvents.MAKE_ANOTHER_FROM_CART, action.label);
    },
    getCartItemKey (cartItem) {
      return getCartItemKey(cartItem);
    },
    processStartShopping () {
      this.$router.push(localizedRoute('/'));
    },
    onOrderErrorEventHandler (payload) {
      this.$store.dispatch('ui/openModal', { name: ModalList.OrderError, payload });
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

.detailed-cart {
  ._production-spot-countdown {
    margin: var(--spacer-sm) 0;
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
    }
  }

  @include for-desktop {
    display: flex;
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
  display: flex;
  flex-direction: column;
  row-gap: var(--spacer-xl);
  margin-top: var(--spacer-sm);
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
