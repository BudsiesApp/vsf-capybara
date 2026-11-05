import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { useStore } from '@vue-storefront/core/application-services';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';

import { useCartViewEvent } from './use-cart-view-event';

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

const mountedViews: Vue[] = [];
const item = { sku: 'PLUSH-1', qty: 1 };
const totals = { quote_currency_code: 'USD', coupon_code: 'SAVE10' };

function createCart (overrides = {}) {
  return new Store({
    modules: {
      cart: {
        namespaced: true,
        state: {
          cartIsLoaded: true,
          cartItems: [item],
          platformTotals: null,
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

function mountCartView (store: Store<any>) {
  jest.mocked(useStore).mockReturnValue(store);
  const view = new Vue({
    setup () { useCartViewEvent(); },
    render: (createElement) => createElement('div')
  }).$mount();
  mountedViews.push(view);
  return view;
}

afterEach(() => {
  mountedViews.splice(0).forEach((view) => view.$destroy());
  jest.clearAllMocks();
});

describe('cart view readiness', () => {
  it('waits for successful totals and idle cart synchronization after a reload', async () => {
    const store = createCart({ isCartSyncing: true, isTotalsSyncing: true });
    mountCartView(store);
    await Vue.nextTick();
    expect(EventBus.$emit).not.toHaveBeenCalled();

    // The request flag clears before its totals have been applied.
    store.commit('cart/update', { isTotalsSyncing: false });
    await Vue.nextTick();
    expect(EventBus.$emit).not.toHaveBeenCalled();

    const synchronizedItems = [{ ...item, qty: 2 }];
    store.commit('cart/update', {
      cartItems: synchronizedItems,
      platformTotals: totals,
      cartServerLastTotalsSyncDate: 100,
      totalsSyncRequired: false
    });
    await Vue.nextTick();
    expect(EventBus.$emit).not.toHaveBeenCalled();

    store.commit('cart/update', { isCartSyncing: false });
    await Vue.nextTick();
    expect(EventBus.$emit).toHaveBeenCalledTimes(1);
    expect(EventBus.$emit).toHaveBeenCalledWith('cartViewed', {
      products: synchronizedItems,
      platformTotals: totals
    });
  });

  it('reports once on navigation and allows another view after remounting', async () => {
    const store = createCart({
      platformTotals: totals,
      cartServerLastTotalsSyncDate: 100,
      totalsSyncRequired: false
    });
    const view = mountCartView(store);
    await Vue.nextTick();
    expect(EventBus.$emit).toHaveBeenCalledTimes(1);

    store.commit('cart/update', { isTotalsSyncing: true, isCouponProcessing: true });
    await Vue.nextTick();
    store.commit('cart/update', {
      platformTotals: { quote_currency_code: 'USD' },
      cartServerLastTotalsSyncDate: 200,
      isTotalsSyncing: false,
      isCouponProcessing: false
    });
    await Vue.nextTick();
    expect(EventBus.$emit).toHaveBeenCalledTimes(1);

    view.$destroy();
    mountCartView(store);
    await Vue.nextTick();
    expect(EventBus.$emit).toHaveBeenCalledTimes(2);
    expect(EventBus.$emit).toHaveBeenLastCalledWith('cartViewed', {
      products: [item],
      platformTotals: { quote_currency_code: 'USD' }
    });
  });

  it('waits for local cart loading even when totals are available', async () => {
    const store = createCart({ cartIsLoaded: false, cartServerLastTotalsSyncDate: 100, totalsSyncRequired: false });
    mountCartView(store);
    await Vue.nextTick();
    expect(EventBus.$emit).not.toHaveBeenCalled();

    store.commit('cart/update', { cartIsLoaded: true });
    await Vue.nextTick();
    expect(EventBus.$emit).toHaveBeenCalledTimes(1);
  });

  it('waits while previously synchronized totals require an update', async () => {
    const store = createCart({ cartServerLastTotalsSyncDate: 100 });
    mountCartView(store);
    await Vue.nextTick();
    expect(EventBus.$emit).not.toHaveBeenCalled();

    store.commit('cart/update', { totalsSyncRequired: false });
    await Vue.nextTick();
    expect(EventBus.$emit).toHaveBeenCalledTimes(1);
  });

  it('waits for coupon processing before reporting synchronized totals', async () => {
    const store = createCart({ cartServerLastTotalsSyncDate: 100, totalsSyncRequired: false, isCouponProcessing: true });
    mountCartView(store);
    await Vue.nextTick();
    expect(EventBus.$emit).not.toHaveBeenCalled();

    store.commit('cart/update', { platformTotals: totals, isCouponProcessing: false });
    await Vue.nextTick();
    expect(EventBus.$emit).toHaveBeenCalledWith('cartViewed', { products: [item], platformTotals: totals });
  });

  it.each([
    ['empty cart', { cartItems: [] }],
    ['offline or disabled synchronization', { totalsSyncEnabled: false }]
  ])('reports a %s without a successful totals timestamp', async (_name, overrides) => {
    const store = createCart(overrides);
    mountCartView(store);
    await Vue.nextTick();
    expect(EventBus.$emit).toHaveBeenCalledTimes(1);
  });

  it('keeps a failed initial totals request pending until a later success', async () => {
    const store = createCart({ isTotalsSyncing: true });
    mountCartView(store);
    await Vue.nextTick();
    store.commit('cart/update', { isTotalsSyncing: false });
    await Vue.nextTick();
    expect(EventBus.$emit).not.toHaveBeenCalled();

    store.commit('cart/update', { platformTotals: totals, cartServerLastTotalsSyncDate: 100, totalsSyncRequired: false });
    await Vue.nextTick();
    expect(EventBus.$emit).toHaveBeenCalledTimes(1);
  });

  it('stops watching when the cart page is destroyed before totals arrive', async () => {
    const store = createCart();
    const view = mountCartView(store);
    await Vue.nextTick();
    view.$destroy();

    store.commit('cart/update', { platformTotals: totals, cartServerLastTotalsSyncDate: 100, totalsSyncRequired: false });
    await Vue.nextTick();
    expect(EventBus.$emit).not.toHaveBeenCalled();
  });
});
