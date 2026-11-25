import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { useStore } from '@vue-storefront/core/application-services';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { CartService } from '@vue-storefront/core/data-resolver';
import { DiffLog } from '@vue-storefront/core/modules/cart/helpers/createDiffLog';
import connectActions from '@vue-storefront/core/modules/cart/store/actions/connectActions';
import mergeActions from '@vue-storefront/core/modules/cart/store/actions/mergeActions';
import synchronizeActions from '@vue-storefront/core/modules/cart/store/actions/synchronizeActions';
import totalsActions from '@vue-storefront/core/modules/cart/store/actions/totalsActions';
import cartGetters from '@vue-storefront/core/modules/cart/store/getters';
import cartMutations from '@vue-storefront/core/modules/cart/store/mutations';
import * as types from '@vue-storefront/core/modules/cart/store/mutation-types';
import CartEvents from 'src/modules/shared/types/cart-events';
import { useEventAfterCartSettled } from './use-event-after-cart-settled';

jest.mock('@vue-storefront/core/application-services', () => ({ useStore: jest.fn() }));
jest.mock('@vue-storefront/core/compatibility/plugins/event-bus', () => ({ __esModule: true, default: { $emit: jest.fn() } }));
jest.mock('config', () => ({ cart: { synchronize: true, synchronize_totals: true, serverMergeByDefault: true } }));
jest.mock('src/modules/shared', () => ({}));
jest.mock('src/modules/customization-system', () => ({}));
jest.mock('storefront-query-builder', () => ({}));
jest.mock('@vue-storefront/core/lib/storage-manager', () => ({ StorageManager: { get: jest.fn() } }));
jest.mock('@vue-storefront/i18n', () => ({ __esModule: true, default: { t: (text: string) => text } }));
jest.mock('@vue-storefront/core/lib/logger', () => ({
  Logger: { info: () => () => {}, debug: () => () => {}, warn: () => () => {}, error: () => () => {} }
}));
jest.mock('@vue-storefront/core/data-resolver', () => ({
  CartService: { getTotals: jest.fn(), setShippingInfo: jest.fn(), getCartToken: jest.fn(), getItems: jest.fn() }
}));
jest.mock('@vue-storefront/core/modules/cart/helpers', () => ({
  prepareShippingInfoForUpdateTotals: jest.requireActual('@vue-storefront/core/modules/cart/helpers/prepareShippingInfoForUpdateTotals').default,
  createDiffLog: () => new (jest.requireActual('@vue-storefront/core/modules/cart/helpers/createDiffLog').DiffLog)(),
  createOrderData: () => ({ country: 'US' }), createShippingInfoData: () => ({}), getAvailableShippingMethod: () => undefined
}));
jest.mock('@vue-storefront/core/modules/cart/helpers/productsEquals', () => ({ __esModule: true, default: (a, b) => a.sku === b.sku }));
jest.mock('@vue-storefront/core/helpers', () => ({
  onlineHelper: { isOnline: true }, isServer: false,
  calcItemsHmac: jest.requireActual('@vue-storefront/core/helpers/calc-items-hmac').calcItemsHmac
}));

Vue.use(Vuex);
const TOKEN = 'quote';
const NEW_TOKEN = 'reconnected-quote';
const NOT_FOUND = { resultCode: 404, result: 'No such entity with cartId = 1' };
const clearCart = jest.fn();
const pullMethods = jest.fn();
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

function createItem () {
  return {
    sku: 'PLUSH-1', qty: 1, server_item_id: 7,
    extension_attributes: { budsies_quote_item_totals: { regular_price: 100, savings_amount: 0, discount_amount: 0, final_price: 100 } }
  };
}

function totalsResponse (finalPrice: number, grandTotal: number): any {
  return {
    resultCode: 200,
    result: {
      grand_total: grandTotal, base_grand_total: grandTotal, total_segments: [], items: [{
        item_id: 7, qty: 1,
        extension_attributes: { budsies_quote_item_totals: { regular_price: 100, savings_amount: 0, discount_amount: finalPrice - 100, final_price: finalPrice } }
      }]
    }
  };
}

function deferred<T> () {
  let resolveDeferred!: (value: T) => void;
  const promise = new Promise<T>(resolve => { resolveDeferred = resolve; });
  return { promise, resolve: resolveDeferred };
}

function createStore (actionOverrides = {}) {
  const store = new Store<any>({ modules: {
    user: { namespaced: true, getters: { getUserToken: () => null, getToken: () => null } },
    checkout: { namespaced: true, getters: {
      getShippingDetails: () => ({}), getShippingMethods: () => [],
      getPaymentDetails: () => ({}), getPaymentMethods: () => []
    } },
    cart: {
      namespaced: true,
      state: {
        cartItems: [createItem()], cartIsLoaded: true, cartServerToken: TOKEN, cartItemsHash: null,
        cartServerLastTotalsSyncDate: 1000, syncPromise: null, startupPromise: null, connectionPromises: [],
        totalsSyncDepth: 0, totalsRefreshId: 0, isCartSyncing: false, isTotalsSyncing: false, isCouponProcessing: false,
        platformTotals: { grand_total: 200 }, platformTotalSegments: [], itemsAfterPlatformTotals: {}
      },
      getters: cartGetters,
      mutations: cartMutations,
      actions: {
        ...synchronizeActions, ...totalsActions, ...connectActions,
        pullMethods, clear: clearCart, applyPendingCouponInCartTransaction: () => {}, ...actionOverrides
      }
    }
  } });
  store.commit(`cart/${types.CART_SET_ITEMS_HASH}`, store.getters['cart/getCurrentCartHash']);
  return store;
}

describe('view_cart readiness through the real cart store', () => {
  let store: Store<any>;
  let page: Vue | undefined;
  let events: object[];

  function mountPage () {
    jest.mocked(useStore).mockReturnValue(store);
    page = new Vue({ setup () { useEventAfterCartSettled(); }, render: h => h('div') }).$mount();
  }

  function busy () {
    return [store.getters['cart/isTotalsSettling'], store.getters['cart/IS_TOTALS_SYNCING']];
  }

  beforeEach(() => {
    jest.resetAllMocks();
    store = createStore();
    events = [];
    jest.mocked(EventBus.$emit).mockImplementation((event, payload) => {
      if (event === CartEvents.CART_VIEWED) events.push({
        price: payload.products[0]?.extension_attributes.budsies_quote_item_totals.final_price,
        value: payload.platformTotals?.grand_total
      });
      return EventBus;
    });
  });
  afterEach(() => { page?.$destroy(); page = undefined; });

  it('waits through methods without extending the storefront totals flag, then reports the applied totals', async () => {
    const methods = deferred<void>();
    const totals = deferred<any>();
    pullMethods.mockReturnValue(methods.promise);
    jest.mocked(CartService.getTotals).mockReturnValue(totals.promise);
    const refresh = store.dispatch('cart/syncTotals', { forceServerSync: true });
    mountPage();
    await flush();
    expect(busy()).toEqual([true, false]);
    expect(CartService.getTotals).not.toHaveBeenCalled();
    expect(events).toEqual([]);
    methods.resolve();
    await flush();
    expect(busy()).toEqual([true, true]);
    totals.resolve(totalsResponse(90, 180));
    await refresh;
    await flush();
    expect(events).toEqual([{ price: 90, value: 180 }]);
    expect(busy()).toEqual([false, false]);
  });

  it('reuses shipping totals on return to cart despite shipment metadata', async () => {
    jest.mocked(CartService.getTotals).mockResolvedValue(totalsResponse(90, 180));
    await store.dispatch('cart/syncTotals', { forceServerSync: true });
    Vue.set(store.state.cart.cartItems[0].extension_attributes, 'estimated_shipment', { date: '2027-01-01' });
    expect(store.getters['cart/isCartHashChanged']).toBe(false);
    mountPage();
    await flush();
    expect(events).toEqual([{ price: 90, value: 180 }]);
    expect(CartService.getTotals).toHaveBeenCalledTimes(1);
  });

  it('refreshes and applies one business totals response after an empty-cache pull brings in items', async () => {
    const token = deferred<any>();
    const pull = deferred<any>();
    const totals = deferred<any>();
    store = createStore({
      ...mergeActions,
      getProductVariant: () => createItem(),
      addItem: ({ commit }, { productToAdd, forceServerSilence }) => {
        expect(forceServerSilence).toBe(true);
        commit(types.CART_LOAD_CART, [productToAdd]);
      },
      updateItemsProductData: () => {}
    });
    store.commit(`cart/${types.CART_LOAD_CART}`, []);
    jest.mocked(CartService.getCartToken).mockReturnValue(token.promise);
    jest.mocked(CartService.getItems).mockReturnValue(pull.promise);
    jest.mocked(CartService.getTotals).mockReturnValue(totals.promise);
    const connection = store.dispatch('cart/connect');
    mountPage();
    await flush();
    expect(events).toEqual([]);
    token.resolve({ resultCode: 200, result: NEW_TOKEN });
    await flush();
    expect(events).toEqual([]);
    expect(CartService.getTotals).not.toHaveBeenCalled();
    pull.resolve({ resultCode: 200, result: [{ item_id: 7, sku: 'PLUSH-1', qty: 1 }] });
    await flush();
    expect(events).toEqual([]);
    expect(busy()).toEqual([true, true]);
    expect(pullMethods).toHaveBeenCalledTimes(1);
    expect(CartService.getTotals).toHaveBeenCalledTimes(1);
    const response = totalsResponse(90, 180);
    response.result.coupon_code = 'SAVE';
    totals.resolve(response);
    await connection;
    await flush();
    expect(events).toEqual([{ price: 90, value: 180 }]);
    expect(CartService.getTotals).toHaveBeenCalledTimes(1);
    expect(store.state.cart.platformTotals.grand_total).toBe(180);
    expect(store.getters['cart/getCoupon']).toMatchObject({ code: 'SAVE' });
    expect(store.state.cart.cartItems[0].extension_attributes.budsies_quote_item_totals.final_price).toBe(90);
  });

  it('lets the quote prototype import finish before its totals refresh and reports the cart after the refresh', async () => {
    const totals = deferred<any>();
    store = createStore({
      ...mergeActions,
      getProductVariant: () => createItem(),
      addItem: ({ commit }, { productToAdd }) => commit(types.CART_LOAD_CART, [productToAdd]),
      updateItemsProductData: () => {}
    });
    store.commit(`cart/${types.CART_LOAD_CART}`, []);
    store.commit(`cart/${types.CART_SET_ITEMS_HASH}`, store.getters['cart/getCurrentCartHash']);
    jest.mocked(CartService.getItems).mockResolvedValue({ resultCode: 200, result: [{ item_id: 7, sku: 'PLUSH-1', qty: 1 }] } as any);
    jest.mocked(CartService.getTotals).mockReturnValue(totals.promise);
    await store.dispatch('cart/sync', { forceSync: true, waitForTotalsUpdate: false });
    expect(store.state.cart.cartItems).toHaveLength(1);
    expect(busy()[0]).toBe(true);
    mountPage();
    await flush();
    expect(events).toEqual([]);
    totals.resolve(totalsResponse(90, 180));
    await flush();
    await flush();
    expect(events).toEqual([{ price: 90, value: 180 }]);
    expect(CartService.getTotals).toHaveBeenCalledTimes(1);
  });

  it.each([false, true])('falls back only to totals from the current quote (replaced: %s)', async replaced => {
    if (replaced) store.commit(`cart/${types.CART_LOAD_CART_SERVER_TOKEN}`, NEW_TOKEN);
    jest.mocked(CartService.getTotals).mockRejectedValue(new Error('network'));
    await expect(store.dispatch('cart/syncTotals', { forceServerSync: true })).rejects.toThrow('network');
    mountPage();
    await flush();
    expect(events).toEqual([{ price: 100, value: replaced ? undefined : 200 }]);
    expect(CartService.getTotals).toHaveBeenCalledTimes(1);
    expect(busy()).toEqual([false, false]);
  });

  it('keeps the latest-started totals when the older response arrives last', async () => {
    const older = deferred<any>();
    jest.mocked(CartService.getTotals).mockReturnValueOnce(older.promise).mockResolvedValueOnce(totalsResponse(90, 180));
    const olderRefresh = store.dispatch('cart/overrideServerTotals', { hasShippingInformation: false });
    await store.dispatch('cart/overrideServerTotals', { hasShippingInformation: false });
    mountPage();
    await flush();
    expect(events).toEqual([]);
    older.resolve(totalsResponse(95, 190));
    await olderRefresh;
    await flush();
    expect(events).toEqual([{ price: 90, value: 180 }]);
  });

  it.each([totalsResponse(90, 180), NOT_FOUND])('does not apply a late $resultCode response to a replacement quote', async response => {
    const older = deferred<any>();
    jest.mocked(CartService.getTotals).mockReturnValueOnce(older.promise);
    const refresh = store.dispatch('cart/overrideServerTotals', { hasShippingInformation: false });
    store.commit(`cart/${types.CART_LOAD_CART_SERVER_TOKEN}`, NEW_TOKEN);
    older.resolve(response);
    await refresh;
    expect(clearCart).not.toHaveBeenCalled();
    expect(store.state.cart.cartServerToken).toBe(NEW_TOKEN);
    expect(store.state.cart.platformTotals).toBeNull();
    expect(store.state.cart.cartItems[0]).toEqual(createItem());
  });

  it('clears a same-quote 404 inside sync and reconnects without waiting for itself', async () => {
    const reconnected = deferred<boolean>();
    let synchronizations = 0;
    store = createStore({
      clear: connectActions.clear,
      performSync: async ({ dispatch }) => {
        if (synchronizations++ === 0) await dispatch('syncTotals', { forceServerSync: true });
        return new DiffLog();
      },
      create: ({ state }) => reconnected.resolve(state.syncPromise === null)
    });
    jest.mocked(CartService.getTotals).mockResolvedValue(NOT_FOUND as any);
    await store.dispatch('cart/sync');
    await expect(reconnected.promise).resolves.toBe(true);
    expect(store.state.cart.cartItems).toEqual([]);
    expect(store.state.cart.cartServerToken).toBeNull();
    expect(busy()).toEqual([false, false]);
  });
});
