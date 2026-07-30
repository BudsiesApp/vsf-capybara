<template>
  <div id="detailed-cart" :class="{ '-loading': isLoading }">
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
        <transition name="fade" mode="out-in">
          <div
            v-if="totalItems"
            key="detailed-cart"
          >
            <transition-group
              name="fade"
              tag="div"
              class="collected-product-list"
            >
              <CartLineItem
                v-for="product in products"
                :key="getCartItemKey(product)"
                :product="product"
              />
            </transition-group>

            <div class="_buttons-container">
              <SfButton
                class="color-secondary _button"
              >
                <router-link class="_inner" :to="{name: 'bulk-quote'}">
                  Get Another Quote
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

          <div
            v-else
            key="empty-cart"
            class="empty-cart"
          >
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
        <OrderSummary />
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
import { OrderSummary } from './DetailedCart/index.js';
import CartLineItem from './DetailedCart/cart-line-item.vue';
import { mapGetters, mapState } from 'vuex';
import { localizedRoute } from '@vue-storefront/core/lib/multistore';
import getCartItemKey from '@vue-storefront/core/modules/cart/helpers/get-cart-item-key.function';
import CartEvents from 'src/modules/shared/types/cart-events';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { mapMobileObserver } from '@storefront-ui/vue/src/utilities/mobile-observer';
import { htmlDecode } from '@vue-storefront/core/filters';
import { ORDER_ERROR_EVENT } from '@vue-storefront/core/modules/checkout';
import { IS_CART_SYNCING } from '@vue-storefront/core/modules/cart';
import { ModalList } from 'theme/store/ui/modals';
import MBlockStory from 'theme/components/molecules/m-block-story.vue';
import MDropdown from 'theme/components/molecules/m-dropdown.vue';

export default {
  name: 'DetailedCart',
  components: {
    CartLineItem,
    MBlockStory,
    MDropdown,
    SfList,
    SfButton,
    SfHeading,
    OrderSummary
  },
  data () {
    return {
      isDropdownOpen: false,
      isMounted: false
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

._buttons-container {
  ._button {
    --c-link: var(--c-primary);
    --c-link-hover: var(--c-light-variant);
    --button-padding: 0;

    margin-top: var(--spacer-base);

    ._inner {
      padding: var(--spacer-sm) calc(var(--spacer-sm) * 1.5);
    }

    &:hover {
      --c-link: var(--c-light-variant);
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

  ._buttons-container ._button ._inner {
    padding: var(--spacer-sm) calc(var(--spacer-sm) * 2);
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
