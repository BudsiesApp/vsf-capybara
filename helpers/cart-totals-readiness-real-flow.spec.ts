import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { useStore } from '@vue-storefront/core/application-services';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { CartService } from '@vue-storefront/core/data-resolver';
import { calcItemsHmac } from '@vue-storefront/core/helpers/calc-items-hmac';
import { DiffLog } from '@vue-storefront/core/modules/cart/helpers/createDiffLog';
import connectActions from '@vue-storefront/core/modules/cart/store/actions/connectActions';
import synchronizeActions from '@vue-storefront/core/modules/cart/store/actions/synchronizeActions';
import totalsActions from '@vue-storefront/core/modules/cart/store/actions/totalsActions';
import cartGetters from '@vue-storefront/core/modules/cart/store/getters';
import cartMutations from '@vue-storefront/core/modules/cart/store/mutations';
import * as types from '@vue-storefront/core/modules/cart/store/mutation-types';
import CartEvents from 'src/modules/shared/types/cart-events';
import { useCartViewEvent } from 'theme/helpers/use-cart-view-event';
import { useBeginCheckoutEvent } from 'theme/helpers/use-begin-checkout-event';

jest.mock('@vue-storefront/core/application-services', () => ({ useStore: jest.fn() }));
jest.mock('@vue-storefront/core/compatibility/plugins/event-bus', () => ({ __esModule: true, default: { $emit: jest.fn() } }));
jest.mock('config', () => ({ cart: { synchronize: true, synchronize_totals: true } }));
jest.mock('@vue-storefront/core/lib/storage-manager', () => ({ StorageManager: { get: jest.fn() } }));
jest.mock('@vue-storefront/i18n', () => ({ __esModule: true, default: { t: (text: string) => text } }));
jest.mock('@vue-storefront/core/lib/logger', () => ({
  Logger: { info: () => () => {}, debug: () => () => {}, warn: () => () => {}, error: () => () => {} }
}));
jest.mock('@vue-storefront/core/data-resolver', () => ({
  CartService: { getTotals: jest.fn(), setShippingInfo: jest.fn() }
}));
jest.mock('@vue-storefront/core/modules/cart/helpers', () => ({
  prepareShippingInfoForUpdateTotals: jest.requireActual('@vue-storefront/core/modules/cart/helpers/prepareShippingInfoForUpdateTotals').default,
  preparePaymentMethodsToSync: jest.fn(),
  createOrderData: jest.fn(() => ({ country: 'US' })),
  createShippingInfoData: jest.fn(() => ({})),
  getAvailableShippingMethod: jest.fn(() => undefined),
  calculateTotals: () => []
}));
jest.mock('@vue-storefront/core/modules/cart/helpers/productsEquals', () => ({ __esModule: true, default: (a, b) => a.sku === b.sku }));
jest.mock('@vue-storefront/core/helpers', () => ({
  onlineHelper: { isOnline: true },
  isServer: false,
  PriceHelper: {},
  calcItemsHmac: jest.requireActual('@vue-storefront/core/helpers/calc-items-hmac').calcItemsHmac
}));
jest.mock('@vue-storefront/core/modules/cart', () => ({
  IS_CART_SYNCING: 'cart/IS_CART_SYNCING', IS_TOTALS_SYNCING: 'cart/IS_TOTALS_SYNCING', IS_COUPON_PROCESSING: 'cart/IS_COUPON_PROCESSING'
}));

Vue.use(Vuex);

const TOKEN = 'quote';
const NEW_TOKEN = 'reconnected-quote';
const NOT_FOUND = { resultCode: 404, result: 'No such entity with cartId = 1' };
const clearCart = jest.fn();
const PREVIOUS_SYNC_DATE = 1000;

function createItem () {
  return {
    sku: 'PLUSH-1',
    qty: 1,
    server_item_id: 7,
    extension_attributes: {
      customization_state: [],
      budsies_quote_item_totals: { regular_price: 100, savings_amount: 0, discount_amount: 0, final_price: 100 }
    }
  };
}

function totalsResponse (finalPrice: number, grandTotal: number) {
  return {
    resultCode: 200,
    result: {
      grand_total: grandTotal,
      total_segments: [],
      items: [{
        item_id: 7,
        qty: 1,
        extension_attributes: {
          budsies_quote_item_totals: {
            regular_price: 100, savings_amount: 0, discount_amount: finalPrice - 100, final_price: finalPrice
          }
        }
      }]
    }
  };
}

function deferred<T> () {
  let resolveDeferred!: (value: T) => void;
  let rejectDeferred!: (reason: unknown) => void;
  const promise = new Promise<T>((resolve, reject) => { resolveDeferred = resolve; rejectDeferred = reject; });

  return { promise, resolve: resolveDeferred, reject: rejectDeferred };
}

// A cart that is fully synchronized: the stored hash matches the items and a totals sync happened before.
function createSynchronizedStore (
  pullMethods: () => Promise<void> = async () => undefined,
  actionOverrides: Record<string, any> = {}
) {
  const item = createItem();

  return new Store<any>({
    modules: {
      user: {
        namespaced: true,
        getters: { getUserToken: () => null }
      },
      checkout: {
        namespaced: true,
        getters: {
          getShippingDetails: () => ({}),
          getShippingMethods: () => [],
          getPaymentMethods: () => [],
          getPaymentDetails: () => ({}),
          getNotServerPaymentMethods: () => []
        }
      },
      cart: {
        namespaced: true,
        state: {
          cartItems: [item],
          cartIsLoaded: true,
          cartServerToken: TOKEN,
          cartItemsHash: calcItemsHmac([item] as any, TOKEN),
          cartServerLastTotalsSyncDate: PREVIOUS_SYNC_DATE,
          syncPromise: null,
          isCartSyncing: false,
          isTotalsSyncing: false,
          totalsSyncDepth: 0,
          totalsRefreshId: 0,
          isCouponProcessing: false,
          platformTotals: { grand_total: 200 },
          platformTotalSegments: [],
          itemsAfterPlatformTotals: {}
        },
        getters: cartGetters,
        mutations: cartMutations,
        actions: {
          ...totalsActions,
          pullMethods,
          updateItem: ({ commit }, payload) => commit(types.CART_UPD_ITEM_PROPS, payload),
          clear: clearCart,
          ...actionOverrides
        }
      }
    }
  });
}

describe.each([
  ['view_cart', useCartViewEvent],
  ['begin_checkout', useBeginCheckoutEvent]
])('%s readiness through the real totals refresh', (_eventName, composable) => {
  let store: Store<any>;
  let emitted: { finalPrice: number, grandTotal: number }[];
  let page: Vue | undefined;

  function mountPage () {
    page = new Vue({ setup () { (composable as () => void)(); }, render: (h) => h('div') }).$mount();
  }

  beforeEach(() => {
    jest.clearAllMocks();
    emitted = [];
    store = createSynchronizedStore();
    jest.mocked(useStore).mockReturnValue(store);
    // The payload is not enough to tell old from new prices, so record the cart as it is at emit time.
    jest.mocked(EventBus.$emit).mockImplementation((eventName: string) => {
      if (eventName === CartEvents.CART_VIEWED || eventName === CartEvents.BEGIN_CHECKOUT) {
        emitted.push({
          finalPrice: store.state.cart.cartItems[0].extension_attributes.budsies_quote_item_totals.final_price,
          grandTotal: store.state.cart.platformTotals.grand_total
        });
      }

      return EventBus;
    });
  });

  afterEach(() => {
    page?.$destroy();
    page = undefined;
  });

  function expectSettled () {
    expect(store.state.cart.isTotalsSyncing).toBe(false);
    expect(store.state.cart.totalsSyncDepth).toBe(0);
  }

  it('is not blocked by a stale hash after a refresh that changed the item price', async () => {
    jest.mocked(CartService.getTotals).mockResolvedValue(totalsResponse(90, 180) as any);

    await store.dispatch('cart/syncTotals', { forceServerSync: true });

    expect(store.state.cart.cartItems[0].extension_attributes.budsies_quote_item_totals.final_price).toBe(90);
    expect(store.getters['cart/isTotalsSyncRequired']).toBe(false);

    mountPage();
    await Vue.nextTick();

    expect(emitted).toEqual([{ finalPrice: 90, grandTotal: 180 }]);
    expectSettled();
  });

  it('waits for the response of a forced refresh that started before the page was mounted', async () => {
    const response = deferred<any>();

    jest.mocked(CartService.getTotals).mockReturnValue(response.promise);

    const refresh = store.dispatch('cart/overrideServerTotals', { hasShippingInformation: false });

    mountPage();
    await Vue.nextTick();

    expect(emitted).toEqual([]);

    response.resolve(totalsResponse(90, 180));
    await refresh;
    await Vue.nextTick();

    expect(emitted).toEqual([{ finalPrice: 90, grandTotal: 180 }]);
    expectSettled();
  });

  it('waits for the whole syncTotals call, including the methods pull before the totals request', async () => {
    const response = deferred<any>();

    jest.mocked(CartService.getTotals).mockReturnValue(response.promise);

    const refresh = store.dispatch('cart/syncTotals', { forceServerSync: true });

    mountPage();
    await Vue.nextTick();
    await Vue.nextTick();

    expect(emitted).toEqual([]);

    response.resolve(totalsResponse(90, 180));
    await refresh;
    await Vue.nextTick();

    expect(emitted).toEqual([{ finalPrice: 90, grandTotal: 180 }]);
    expectSettled();
  });

  it('releases the syncing state when the totals request fails', async () => {
    jest.mocked(CartService.getTotals).mockRejectedValue(new Error('network'));

    await expect(store.dispatch('cart/syncTotals', { forceServerSync: true })).rejects.toThrow('network');

    expectSettled();
  });

  describe('after a refresh that failed', () => {
    const failures = [
      ['an error response', () => jest.mocked(CartService.getTotals).mockResolvedValue({ resultCode: 500, result: 'error' } as any)],
      ['a rejected request', () => jest.mocked(CartService.getTotals).mockRejectedValue(new Error('network'))],
      ['a response that cannot be applied', () => jest.mocked(CartService.getTotals).mockResolvedValue({ resultCode: 200, result: { total_segments: [] } } as any)],
      ['a response without a result', () => jest.mocked(CartService.getTotals).mockResolvedValue({ resultCode: 200, result: null } as any)]
    ] as const;

    async function refreshAndFail () {
      await store.dispatch('cart/syncTotals', { forceServerSync: true }).catch(() => undefined);
    }

    it.each(failures)('does not treat the old totals as synchronized after %s', async (_, failRequest) => {
      failRequest();

      await refreshAndFail();

      expect(store.state.cart.cartServerLastTotalsSyncDate).toBe(0);
      expect(store.getters['cart/isTotalsSyncRequired']).toBe(true);

      mountPage();
      await Vue.nextTick();

      expect(emitted).toEqual([]);
      expectSettled();
    });

    it.each(failures)('reports once with the refreshed totals when a retry succeeds after %s', async (_, failRequest) => {
      failRequest();
      mountPage();
      await refreshAndFail();
      await Vue.nextTick();

      expect(emitted).toEqual([]);

      jest.mocked(CartService.getTotals).mockReset().mockResolvedValue(totalsResponse(90, 180) as any);
      await store.dispatch('cart/syncTotals');
      await Vue.nextTick();

      expect(emitted).toEqual([{ finalPrice: 90, grandTotal: 180 }]);
      expect(store.getters['cart/isTotalsSyncRequired']).toBe(false);
      expectSettled();
    });

    it('keeps the totals synchronized when the cart is not found and cleared', async () => {
      jest.mocked(CartService.getTotals).mockResolvedValue(NOT_FOUND as any);

      await store.dispatch('cart/syncTotals', { forceServerSync: true });

      expect(store.state.cart.cartServerLastTotalsSyncDate).toBe(PREVIOUS_SYNC_DATE);
    });
  });

  it('does not hold the syncing state when no refresh is needed', async () => {
    await store.dispatch('cart/syncTotals', { forceServerSync: false });

    expect(CartService.getTotals).not.toHaveBeenCalled();
    expectSettled();
  });
  describe('when the methods pull fails before the totals request', () => {
    let failMethods: boolean;

    beforeEach(() => {
      failMethods = true;
      store = createSynchronizedStore(async () => {
        if (failMethods) {
          throw new Error('methods');
        }
      });
      jest.mocked(useStore).mockReturnValue(store);
    });

    it('does not treat the old totals as synchronized', async () => {
      await expect(store.dispatch('cart/syncTotals', { forceServerSync: true })).rejects.toThrow('methods');

      expect(CartService.getTotals).not.toHaveBeenCalled();
      expect(store.state.cart.cartServerLastTotalsSyncDate).toBe(0);
      expect(store.getters['cart/isTotalsSyncRequired']).toBe(true);

      mountPage();
      await Vue.nextTick();

      expect(emitted).toEqual([]);
      expectSettled();
    });

    it('reports once with the refreshed totals when a retry succeeds', async () => {
      mountPage();
      await expect(store.dispatch('cart/syncTotals', { forceServerSync: true })).rejects.toThrow('methods');
      await Vue.nextTick();

      expect(emitted).toEqual([]);

      failMethods = false;
      jest.mocked(CartService.getTotals).mockResolvedValue(totalsResponse(90, 180) as any);
      await store.dispatch('cart/syncTotals');
      await Vue.nextTick();

      expect(emitted).toEqual([{ finalPrice: 90, grandTotal: 180 }]);
    });

    it('keeps the totals of a newer refresh that already succeeded', async () => {
      const methods = deferred<void>();

      store = createSynchronizedStore(() => methods.promise);
      jest.mocked(useStore).mockReturnValue(store);
      jest.mocked(CartService.getTotals).mockResolvedValue(totalsResponse(90, 180) as any);

      const olderSync = store.dispatch('cart/syncTotals', { forceServerSync: true });

      await store.dispatch('cart/overrideServerTotals', { hasShippingInformation: false });
      methods.reject(new Error('methods'));
      await expect(olderSync).rejects.toThrow('methods');

      expect(store.state.cart.cartServerLastTotalsSyncDate).toBeGreaterThan(PREVIOUS_SYNC_DATE);

      mountPage();
      await Vue.nextTick();

      expect(emitted).toEqual([{ finalPrice: 90, grandTotal: 180 }]);
      expectSettled();
    });
  });

  describe('when refreshes overlap', () => {
    const olderResponse = () => totalsResponse(95, 190) as any;
    const newerResponse = () => totalsResponse(90, 180) as any;
    let older: ReturnType<typeof deferred<any>>;
    let newer: ReturnType<typeof deferred<any>>;
    let olderRefresh: Promise<unknown>;
    let newerRefresh: Promise<unknown>;

    function startOverlappingRefreshes () {
      older = deferred<any>();
      newer = deferred<any>();
      jest.mocked(CartService.getTotals).mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);

      olderRefresh = store.dispatch('cart/overrideServerTotals', { hasShippingInformation: false });
      newerRefresh = store.dispatch('cart/overrideServerTotals', { hasShippingInformation: false });
      // The caller of the older refresh sees its failure, which these tests assert separately.
      olderRefresh.catch(() => undefined);
    }

    function itemFinalPrice () {
      return store.state.cart.cartItems[0].extension_attributes.budsies_quote_item_totals.final_price;
    }

    it('keeps the totals of the newer refresh when the older response arrives last', async () => {
      startOverlappingRefreshes();
      mountPage();

      newer.resolve(newerResponse());
      await newerRefresh;
      await Vue.nextTick();

      // The older request is still in flight, so nothing is reported yet.
      expect(emitted).toEqual([]);

      older.resolve(olderResponse());
      await olderRefresh;
      await Vue.nextTick();

      expect(itemFinalPrice()).toBe(90);
      expect(store.state.cart.platformTotals.grand_total).toBe(180);
      expect(emitted).toEqual([{ finalPrice: 90, grandTotal: 180 }]);
      expectSettled();
    });

    it('ignores the response of the older refresh when it arrives first', async () => {
      startOverlappingRefreshes();
      mountPage();

      older.resolve(olderResponse());
      await olderRefresh;
      await Vue.nextTick();

      expect(itemFinalPrice()).toBe(100);
      expect(store.state.cart.cartServerLastTotalsSyncDate).toBe(PREVIOUS_SYNC_DATE);
      expect(emitted).toEqual([]);

      newer.resolve(newerResponse());
      await newerRefresh;
      await Vue.nextTick();

      expect(emitted).toEqual([{ finalPrice: 90, grandTotal: 180 }]);
    });

    it('does not invalidate the newer totals when the older request fails last', async () => {
      startOverlappingRefreshes();
      mountPage();

      newer.resolve(newerResponse());
      await newerRefresh;
      older.reject(new Error('late'));
      await expect(olderRefresh).rejects.toThrow('late');
      await Vue.nextTick();

      expect(store.state.cart.cartServerLastTotalsSyncDate).toBeGreaterThan(PREVIOUS_SYNC_DATE);
      expect(emitted).toEqual([{ finalPrice: 90, grandTotal: 180 }]);
      expectSettled();
    });

    it('invalidates the totals when the newer request fails and the older response was ignored', async () => {
      startOverlappingRefreshes();
      mountPage();

      older.resolve(olderResponse());
      await olderRefresh;
      newer.reject(new Error('network'));
      await expect(newerRefresh).rejects.toThrow('network');
      await Vue.nextTick();

      expect(store.state.cart.cartServerLastTotalsSyncDate).toBe(0);
      expect(store.getters['cart/isTotalsSyncRequired']).toBe(true);
      expect(emitted).toEqual([]);
      expectSettled();
    });
  });
  describe('when a refresh answers that the cart was not found', () => {
    it('clears and disconnects the cart that was requested', async () => {
      jest.mocked(CartService.getTotals).mockResolvedValue(NOT_FOUND as any);

      await store.dispatch('cart/overrideServerTotals', { hasShippingInformation: false });

      expect(clearCart).toHaveBeenCalledTimes(1);
      expect(clearCart.mock.calls[0][1]).toEqual({ disconnect: true, sync: false });
    });

    it('does not clear a cart that replaced the requested one in the meantime', async () => {
      const older = deferred<any>();
      const newer = deferred<any>();

      jest.mocked(CartService.getTotals).mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
      mountPage();

      const olderRefresh = store.dispatch('cart/overrideServerTotals', { hasShippingInformation: false });

      // The customer's cart is connected again: another quote, which the newer refresh reads.
      store.commit(`cart/${types.CART_LOAD_CART_SERVER_TOKEN}`, NEW_TOKEN);
      store.commit(`cart/${types.CART_SET_ITEMS_HASH}`, store.getters['cart/getCurrentCartHash']);

      const newerRefresh = store.dispatch('cart/overrideServerTotals', { hasShippingInformation: false });

      newer.resolve(totalsResponse(90, 180));
      await newerRefresh;

      // The old quote has expired, so the late response of the older refresh is "not found".
      older.resolve(NOT_FOUND);
      await olderRefresh;
      await Vue.nextTick();

      // Counted, not matched: a failure message would serialize the store getters of the action context.
      expect(clearCart).toHaveBeenCalledTimes(0);
      expect(store.state.cart.cartServerToken).toBe(NEW_TOKEN);
      expect(store.state.cart.cartServerLastTotalsSyncDate).toBeGreaterThan(PREVIOUS_SYNC_DATE);
      expect(emitted).toEqual([{ finalPrice: 90, grandTotal: 180 }]);
      expectSettled();
    });

    it('does not apply the totals of a cart that was replaced during the request', async () => {
      const response = deferred<any>();

      jest.mocked(CartService.getTotals).mockReturnValueOnce(response.promise);
      mountPage();

      const refresh = store.dispatch('cart/overrideServerTotals', { hasShippingInformation: false });

      // The cart is connected to another quote, which keeps its own items and totals.
      store.commit(`cart/${types.CART_LOAD_CART_SERVER_TOKEN}`, NEW_TOKEN);
      store.commit(`cart/${types.CART_SET_ITEMS_HASH}`, store.getters['cart/getCurrentCartHash']);

      response.resolve(totalsResponse(90, 180));
      await refresh;
      await Vue.nextTick();

      expect(store.state.cart.cartItems[0].extension_attributes.budsies_quote_item_totals.final_price).toBe(100);
      expect(store.state.cart.platformTotals.grand_total).toBe(200);
      expect(store.state.cart.cartServerLastTotalsSyncDate).toBe(PREVIOUS_SYNC_DATE);
      // The page reports the current cart as it is, not with the totals of the quote that was requested.
      expect(emitted).toEqual([{ finalPrice: 100, grandTotal: 200 }]);
      expectSettled();
    });

    it('does not invalidate the totals of a cart that replaced the requested one when the request fails', async () => {
      const response = deferred<any>();

      jest.mocked(CartService.getTotals).mockReturnValueOnce(response.promise);

      const refresh = store.dispatch('cart/overrideServerTotals', { hasShippingInformation: false });

      store.commit(`cart/${types.CART_LOAD_CART_SERVER_TOKEN}`, NEW_TOKEN);
      store.commit(`cart/${types.CART_SET_ITEMS_HASH}`, store.getters['cart/getCurrentCartHash']);

      response.reject(new Error('network'));
      await expect(refresh).rejects.toThrow('network');

      expect(store.state.cart.cartServerLastTotalsSyncDate).toBe(PREVIOUS_SYNC_DATE);
      expect(store.getters['cart/isTotalsSyncRequired']).toBe(false);
      expectSettled();
    });

    it('still clears the cart when only a newer refresh of the same cart was started', async () => {
      const older = deferred<any>();

      jest.mocked(CartService.getTotals).mockReturnValueOnce(older.promise).mockReturnValueOnce(new Promise(() => undefined));

      const olderRefresh = store.dispatch('cart/overrideServerTotals', { hasShippingInformation: false });

      store.dispatch('cart/overrideServerTotals', { hasShippingInformation: false });
      older.resolve(NOT_FOUND);
      await olderRefresh;

      expect(clearCart).toHaveBeenCalledTimes(1);
    });
  });

  describe('when the cart is not found during a cart synchronization that waits for the totals', () => {
    // The real actions of the synchronization and of the cart clearing run; only the read and merge of the
    // cart items are replaced, by a step that waits for the totals refresh like the merge does.
    function createSynchronizingStore (reconnected: ReturnType<typeof deferred<boolean>>) {
      let synchronizations = 0;

      return createSynchronizedStore(undefined, {
        sync: synchronizeActions.sync,
        synchronizeCart: synchronizeActions.synchronizeCart,
        waitForCartSync: synchronizeActions.waitForCartSync,
        clear: connectActions.clear,
        disconnect: connectActions.disconnect,
        applyPendingCouponInCartTransaction: async () => undefined,
        performSync: async ({ dispatch }) => {
          // The synchronization of the reconnected cart finds nothing to refresh.
          if (synchronizations++ === 0) {
            await dispatch('syncTotals', { forceServerSync: true });
          }

          return new DiffLog();
        },
        create: ({ state }) => reconnected.resolve(state.syncPromise === null)
      });
    }

    it('finishes the synchronization and reconnects the cart afterwards', async () => {
      const reconnected = deferred<boolean>();

      store = createSynchronizingStore(reconnected);
      jest.mocked(useStore).mockReturnValue(store);
      jest.mocked(CartService.getTotals).mockResolvedValue(NOT_FOUND as any);

      const outcome = await Promise.race([
        store.dispatch('cart/sync', { forceSync: true }).then(() => 'finished'),
        new Promise((resolve) => setTimeout(() => resolve('hung'), 500))
      ]);

      expect(outcome).toBe('finished');
      expect(store.state.cart.cartItems).toEqual([]);
      expect(store.state.cart.cartServerToken).toBeNull();

      // The reconnect ran after the synchronization was over.
      await expect(reconnected.promise).resolves.toBe(true);
      expect(store.state.cart.syncPromise).toBeNull();
      expectSettled();
    });
  });
});
