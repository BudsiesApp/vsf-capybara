import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { useStore } from '@vue-storefront/core/application-services';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';

import { useBeginCheckoutEvent } from './use-begin-checkout-event';

jest.mock('@vue-storefront/core/application-services', () => ({ useStore: jest.fn() }));
jest.mock('@vue-storefront/core/compatibility/plugins/event-bus', () => ({
  __esModule: true,
  default: { $emit: jest.fn() }
}));
jest.mock('@vue-storefront/core/modules/cart', () => ({
  IS_CART_SYNCING: 'cart/IS_CART_SYNCING',
  IS_TOTALS_SYNCING: 'cart/IS_TOTALS_SYNCING',
  IS_COUPON_PROCESSING: 'cart/IS_COUPON_PROCESSING'
}));

Vue.use(Vuex);

const mountedPages: Vue[] = [];
const synchronizedTotals = { cartServerLastTotalsSyncDate: 100, totalsSyncRequired: false };

function createCart (overrides = {}) {
  return new Store({
    modules: {
      cart: {
        namespaced: true,
        state: {
          cartIsLoaded: true,
          cartItems: [{ sku: 'PLUSH-1', qty: 1 }],
          cartServerLastTotalsSyncDate: 0,
          isCartSyncing: false,
          isTotalsSyncing: false,
          isCouponProcessing: false,
          totalsSyncEnabled: true,
          totalsSyncRequired: true,
          ...overrides
        },
        getters: {
          getCartItems: (state) => state.cartItems,
          isCartEmpty: (state) => state.cartItems.length === 0,
          isTotalsSyncEnabled: (state) => state.totalsSyncEnabled,
          isTotalsSyncRequired: (state) => state.totalsSyncRequired,
          getLastTotalsSyncDate: (state) => state.cartServerLastTotalsSyncDate,
          IS_CART_SYNCING: (state) => state.isCartSyncing,
          IS_TOTALS_SYNCING: (state) => state.isTotalsSyncing,
          IS_COUPON_PROCESSING: (state) => state.isCouponProcessing
        },
        mutations: {
          update: (state, changes) => Object.assign(state, changes)
        }
      }
    }
  });
}

function mountCheckout (store: Store<any>) {
  jest.mocked(useStore).mockReturnValue(store);
  const page = new Vue({
    setup () { useBeginCheckoutEvent(); },
    render: (createElement) => createElement('div')
  }).$mount();
  mountedPages.push(page);
  return page;
}

afterEach(() => {
  mountedPages.splice(0).forEach((page) => page.$destroy());
  jest.clearAllMocks();
});

describe('begin checkout readiness', () => {
  it('waits for the first totals response after a page load', async () => {
    const store = createCart({ isCartSyncing: true });
    mountCheckout(store);
    await Vue.nextTick();
    expect(EventBus.$emit).not.toHaveBeenCalled();

    store.commit('cart/update', { ...synchronizedTotals, isCartSyncing: false });
    await Vue.nextTick();
    expect(EventBus.$emit).toHaveBeenCalledTimes(1);
    expect(EventBus.$emit).toHaveBeenCalledWith('beginCheckout');
  });

  it('reports once when mounted with synchronized totals', async () => {
    const store = createCart(synchronizedTotals);
    mountCheckout(store);
    await Vue.nextTick();
    expect(EventBus.$emit).toHaveBeenCalledTimes(1);

    store.commit('cart/update', { isTotalsSyncing: true });
    await Vue.nextTick();
    store.commit('cart/update', { isTotalsSyncing: false, cartServerLastTotalsSyncDate: 200 });
    await Vue.nextTick();
    expect(EventBus.$emit).toHaveBeenCalledTimes(1);
  });

  it('does not report an empty cart', async () => {
    mountCheckout(createCart({ cartItems: [] }));
    await Vue.nextTick();
    expect(EventBus.$emit).not.toHaveBeenCalled();
  });

  it('does not report after the checkout page is destroyed before readiness', async () => {
    const store = createCart();
    const page = mountCheckout(store);
    await Vue.nextTick();
    page.$destroy();

    store.commit('cart/update', synchronizedTotals);
    await Vue.nextTick();
    expect(EventBus.$emit).not.toHaveBeenCalled();
  });
});
