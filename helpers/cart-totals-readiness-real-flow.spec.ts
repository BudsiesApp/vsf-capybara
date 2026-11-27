import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { useStore } from '@vue-storefront/core/application-services';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { CartService } from '@vue-storefront/core/data-resolver';
import { DiffLog } from '@vue-storefront/core/modules/cart/helpers/createDiffLog';
import { getAvailableShippingMethod } from '@vue-storefront/core/modules/cart/helpers';
import connectActions from '@vue-storefront/core/modules/cart/store/actions/connectActions';
import mergeActions from '@vue-storefront/core/modules/cart/store/actions/mergeActions';
import synchronizeActions from '@vue-storefront/core/modules/cart/store/actions/synchronizeActions';
import totalsActions from '@vue-storefront/core/modules/cart/store/actions/totalsActions';
import couponActions from '@vue-storefront/core/modules/cart/store/actions/couponActions';
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
  Logger: { info: () => () => {}, debug: () => () => {}, log: () => () => {}, warn: () => () => {}, error: () => () => {} }
}));
jest.mock('@vue-storefront/core/data-resolver', () => ({
  CartService: { getTotals: jest.fn(), setShippingInfo: jest.fn(), getCartToken: jest.fn(), getItems: jest.fn(), applyCoupon: jest.fn(), removeCoupon: jest.fn(), updateItem: jest.fn(), deleteItem: jest.fn() }
}));
jest.mock('@vue-storefront/core/modules/cart/helpers', () => ({
  prepareShippingInfoForUpdateTotals: jest.requireActual('@vue-storefront/core/modules/cart/helpers/prepareShippingInfoForUpdateTotals').default,
  createDiffLog: () => new (jest.requireActual('@vue-storefront/core/modules/cart/helpers/createDiffLog').DiffLog)(),
  createCartItemForUpdate: item => item,
  createOrderData: () => ({ country: 'US' }), createShippingInfoData: () => ({}), getAvailableShippingMethod: jest.fn()
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

function totalsResponse (finalPrice: number, grandTotal: number, qty = 1): any {
  return {
    resultCode: 200,
    result: {
      grand_total: grandTotal, base_grand_total: grandTotal, base_tax_amount: 0, base_shipping_amount: 0, base_subtotal: grandTotal, base_discount_amount: 0, quote_currency_code: 'USD', total_segments: [], items: [{
        item_id: 7, qty,
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
        totalsSyncDepth: 0, totalsRefreshId: 0, hasTotalsRefreshFailed: false, isAddingToCart: false, isCartSyncing: false, isTotalsSyncing: false, isCouponProcessing: false,
        platformTotals: { grand_total: 200 }, platformTotalSegments: [], itemsAfterPlatformTotals: { 7: { item_id: 7, qty: 1 } }
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

  it.each([
    [types.CART_ADDING_ITEM, { isAdding: true }, { isAdding: false }],
    [types.SET_IS_CART_SYNCING, true, false],
    [types.SET_IS_COUPON_PROCESSING, true, false]
  ])('blocks express while %s is active', (mutation, active, idle) => {
    store.state.cart.platformTotals = totalsResponse(100, 200).result;
    expect(store.getters['cart/canStartExpressCheckout']).toBe(true);
    store.commit(`cart/${mutation}`, active);
    expect(store.getters['cart/canStartExpressCheckout']).toBe(false);
    store.commit(`cart/${mutation}`, idle);
    expect(store.getters['cart/canStartExpressCheckout']).toBe(true);
  });

  it('clears failure evidence when totals or the quote are reset', () => {
    store.commit(`cart/${types.SET_TOTALS_REFRESH_FAILED}`, true);
    store.commit(`cart/${types.CART_RESET_TOTALS_SYNC}`);
    expect(store.getters['cart/hasTotalsRefreshFailed']).toBe(false);
    expect(store.getters['cart/canStartExpressCheckout']).toBe(false);
    store.commit(`cart/${types.SET_TOTALS_REFRESH_FAILED}`, true);
    store.commit(`cart/${types.CART_LOAD_CART_SERVER_TOKEN}`, NEW_TOKEN);
    expect(store.getters['cart/hasTotalsRefreshFailed']).toBe(false);
    expect(store.getters['cart/canStartExpressCheckout']).toBe(false);
  });

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

  it('does not allow an older response to undo a newer methods failure', async () => {
    const older = deferred<any>();
    jest.mocked(CartService.getTotals).mockReturnValueOnce(older.promise);
    const oldRefresh = store.dispatch('cart/overrideServerTotals', { hasShippingInformation: false });
    pullMethods.mockRejectedValueOnce(new Error('methods failed'));
    await expect(store.dispatch('cart/syncTotals', { forceServerSync: true })).rejects.toThrow('methods failed');
    expect(store.getters['cart/hasTotalsRefreshFailed']).toBe(true);
    older.resolve(totalsResponse(90, 180));
    await oldRefresh;
    expect(store.getters['cart/hasTotalsRefreshFailed']).toBe(true);
    expect(store.getters['cart/canStartExpressCheckout']).toBe(false);
    expect(store.state.cart.platformTotals.grand_total).toBe(200);
    expect(busy()).toEqual([false, false]);
  });

  it.each(['replaced quote', 'newer refresh'])('does not send shipping information after methods when ownership is lost to a %s', async reason => {
    const methods = deferred<void>();
    jest.mocked(getAvailableShippingMethod).mockReturnValue({ carrier_code: 'carrier', method_code: 'method' } as any);
    pullMethods.mockReturnValueOnce(methods.promise);
    const refresh = store.dispatch('cart/syncTotals', { forceServerSync: true });
    expect(store.getters['cart/isTotalsSettling']).toBe(true);
    if (reason === 'replaced quote') {
      store.commit(`cart/${types.CART_LOAD_CART_SERVER_TOKEN}`, NEW_TOKEN);
    } else {
      store.commit(`cart/${types.START_TOTALS_REFRESH}`);
    }
    store.commit(`cart/${types.SET_TOTALS_REFRESH_FAILED}`, true);
    methods.resolve();
    await refresh;
    expect(CartService.setShippingInfo).not.toHaveBeenCalled();
    expect(CartService.getTotals).not.toHaveBeenCalled();
    expect(store.getters['cart/hasTotalsRefreshFailed']).toBe(true);
    expect(busy()).toEqual([false, false]);
  });

  it('sends shipping information when the refresh still owns the quote after methods', async () => {
    const methods = deferred<void>();
    jest.mocked(getAvailableShippingMethod).mockReturnValue({ carrier_code: 'carrier', method_code: 'method' } as any);
    jest.mocked(CartService.setShippingInfo).mockResolvedValueOnce(totalsResponse(90, 180));
    pullMethods.mockReturnValueOnce(methods.promise);
    const refresh = store.dispatch('cart/syncTotals', { forceServerSync: true });
    methods.resolve();
    await refresh;
    expect(CartService.setShippingInfo).toHaveBeenCalledTimes(1);
    expect(store.getters['cart/getPaymentTotals'].grand_total).toBe(180);
    expect(busy()).toEqual([false, false]);
  });

  it.each([false, true])('preserves failure %s when a held refresh becomes unnecessary', async failed => {
    const methods = deferred<void>();
    store.commit(`cart/${types.SET_TOTALS_REFRESH_FAILED}`, failed);
    store.commit(`cart/${types.CART_RESET_TOTALS_SYNC}`);
    store.state.cart.cartServerLastTotalsSyncDate = 1;
    store.commit(`cart/${types.SET_TOTALS_REFRESH_FAILED}`, failed);
    store.commit(`cart/${types.CART_SET_ITEMS_HASH}`, null);
    pullMethods.mockReturnValueOnce(methods.promise);
    const refresh = store.dispatch('cart/syncTotals', { forceServerSync: false });
    expect(store.getters['cart/isTotalsSettling']).toBe(true);
    store.commit(`cart/${types.CART_SET_ITEMS_HASH}`, store.getters['cart/getCurrentCartHash']);
    methods.resolve();
    await refresh;
    expect(CartService.getTotals).not.toHaveBeenCalled();
    expect(store.getters['cart/hasTotalsRefreshFailed']).toBe(failed);
    expect(store.getters['cart/isTotalsSettling']).toBe(false);
  });

  it.each([false, true])('preserves failure %s when no country is configured', async failed => {
    store.state.cart.platformTotals = totalsResponse(100, 200).result;
    store.commit(`cart/${types.SET_TOTALS_REFRESH_FAILED}`, failed);
    await store.dispatch('cart/syncTotals', { forceServerSync: true, methodsData: {} });
    expect(CartService.getTotals).not.toHaveBeenCalled();
    expect(store.getters['cart/hasTotalsRefreshFailed']).toBe(failed);
    expect(store.getters['cart/canStartExpressCheckout']).toBe(!failed);
  });

  it.each([false, true])('preserves failure %s when a refresh is skipped', async failed => {
    store.state.cart.platformTotals = totalsResponse(100, 200).result;
    store.commit(`cart/${types.SET_TOTALS_REFRESH_FAILED}`, failed);
    await store.dispatch('cart/syncTotals', { forceServerSync: false });
    expect(CartService.getTotals).not.toHaveBeenCalled();
    expect(store.getters['cart/hasTotalsRefreshFailed']).toBe(failed);
    expect(store.getters['cart/canStartExpressCheckout']).toBe(!failed);
  });

  it.each(['applyCoupon', 'removeCoupon'])('blocks express from the %s request through totals settlement', async action => {
    const write = deferred<any>();
    const totals = deferred<any>();
    store = createStore(couponActions);
    store.state.cart.platformTotals = totalsResponse(100, 200).result;
    jest.mocked(CartService[action]).mockReturnValueOnce(write.promise);
    jest.mocked(CartService.getTotals).mockReturnValueOnce(totals.promise);
    const operation = store.dispatch(`cart/${action}`, action === 'applyCoupon' ? { couponCode: 'SAVE' } : {});
    expect(store.getters['cart/canStartExpressCheckout']).toBe(false);
    write.resolve({ result: true });
    await flush();
    expect(store.getters['cart/canStartExpressCheckout']).toBe(false);
    totals.resolve(totalsResponse(90, 180));
    await operation;
    expect(store.getters['cart/canStartExpressCheckout']).toBe(true);
    expect(store.getters['cart/getPaymentTotals'].grand_total).toBe(180);
  });

  it.each(['quantity', 'remove'])('holds readiness through a deferred %s write and totals', async operationType => {
    const write = deferred<any>();
    const totals = deferred<any>();
    store = createStore({
      ...mergeActions,
      processUpdateServerItemResponse: () => new DiffLog(),
      performSync: async ({ dispatch }) => {
        const serverItem = { sku: 'PLUSH-1', item_id: 7, qty: 1 };
        if (operationType === 'quantity') {
          await dispatch('updateServerItem', { clientItem: createItem(), serverItem });
        } else {
          await dispatch('mergeServerItem', { clientItems: [], serverItem, forceClientState: true });
        }
        await dispatch('syncTotals', { forceServerSync: true });
        return new DiffLog();
      }
    });
    store.state.cart.platformTotals = totalsResponse(100, 200).result;
    const method = operationType === 'quantity' ? 'updateItem' : 'deleteItem';
    jest.mocked(CartService[method]).mockReturnValueOnce(write.promise);
    jest.mocked(CartService.getTotals).mockReturnValueOnce(totals.promise);
    const sync = store.dispatch('cart/sync');
    await flush();
    expect(store.getters['cart/canStartExpressCheckout']).toBe(false);
    write.resolve({ resultCode: 200, result: {} });
    await flush();
    expect(store.getters['cart/canStartExpressCheckout']).toBe(false);
    totals.resolve(totalsResponse(90, 180));
    await sync;
    expect(store.getters['cart/canStartExpressCheckout']).toBe(true);
    expect(store.getters['cart/getPaymentTotals'].grand_total).toBe(180);
  });

  it('retains valid totals after an HTTP error and recovers on a later successful refresh', async () => {
    store.state.cart.platformTotals = totalsResponse(100, 200).result;
    jest.mocked(CartService.getTotals).mockResolvedValueOnce({ resultCode: 500, result: 'error' } as any)
      .mockResolvedValueOnce(totalsResponse(90, 180));
    await store.dispatch('cart/syncTotals', { forceServerSync: true });
    expect(store.getters['cart/getPaymentTotals'].grand_total).toBe(200);
    expect(store.getters['cart/canStartExpressCheckout']).toBe(false);
    await store.dispatch('cart/syncTotals', { forceServerSync: true });
    expect(store.getters['cart/getPaymentTotals'].grand_total).toBe(180);
    expect(store.getters['cart/canStartExpressCheckout']).toBe(true);
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

  describe('pending quantity change', () => {
    const changeQuantity = (qty: number) => store.commit(`cart/${types.CART_UPD_ITEM}`, { product: { sku: 'PLUSH-1' }, qty });

    beforeEach(() => {
      store.state.cart.platformTotals = totalsResponse(100, 200).result;
    });

    it('blocks express right after the local quantity change and allows it when the quantity returns to the applied one', () => {
      expect(store.getters['cart/canStartExpressCheckout']).toBe(true);
      changeQuantity(2);
      expect(store.getters['cart/hasPendingQuantityChange']).toBe(true);
      expect(store.getters['cart/isCartBusy']).toBe(false);
      expect(store.getters['cart/canStartExpressCheckout']).toBe(false);
      changeQuantity(1);
      expect(store.getters['cart/canStartExpressCheckout']).toBe(true);
    });

    it('stays blocked when the hash is acknowledged while the quantity is unmatched', () => {
      changeQuantity(2);
      store.commit(`cart/${types.CART_SET_ITEMS_HASH}`, store.getters['cart/getCurrentCartHash']);
      expect(store.getters['cart/canStartExpressCheckout']).toBe(false);
    });

    it('does not treat a missing applied item as ready', () => {
      store.state.cart.itemsAfterPlatformTotals = {};
      expect(store.getters['cart/canStartExpressCheckout']).toBe(false);
    });

    it('allows express only after matching totals are applied and busy gates are idle', async () => {
      changeQuantity(2);
      jest.mocked(CartService.getTotals).mockResolvedValueOnce(totalsResponse(100, 400, 2));
      await store.dispatch('cart/syncTotals', { forceServerSync: true });
      expect(store.getters['cart/hasPendingQuantityChange']).toBe(false);
      expect(store.getters['cart/getPaymentTotals'].grand_total).toBe(400);
      expect(store.getters['cart/canStartExpressCheckout']).toBe(true);
    });

    it('keeps express blocked after a written quantity whose totals failed and recovers on a successful retry', async () => {
      changeQuantity(2);
      jest.mocked(CartService.getTotals).mockResolvedValueOnce({ resultCode: 500, result: 'error' } as any)
        .mockResolvedValueOnce(totalsResponse(100, 400, 2));
      await store.dispatch('cart/syncTotals', { forceServerSync: true });
      expect(store.getters['cart/hasTotalsRefreshFailed']).toBe(true);
      expect(store.getters['cart/hasPendingQuantityChange']).toBe(true);
      expect(store.getters['cart/canStartExpressCheckout']).toBe(false);
      await store.dispatch('cart/syncTotals', { forceServerSync: true });
      expect(store.getters['cart/canStartExpressCheckout']).toBe(true);
    });
  });
});
