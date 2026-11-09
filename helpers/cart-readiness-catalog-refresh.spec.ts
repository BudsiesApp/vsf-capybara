import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { useStore } from '@vue-storefront/core/application-services';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import mergeActions from '@vue-storefront/core/modules/cart/store/actions/mergeActions';
import cartGetters from '@vue-storefront/core/modules/cart/store/getters';
import cartMutations from '@vue-storefront/core/modules/cart/store/mutations';
import * as types from '@vue-storefront/core/modules/cart/store/mutation-types';
import { useCartViewEvent } from 'theme/helpers/use-cart-view-event';
import { useBeginCheckoutEvent } from 'theme/helpers/use-begin-checkout-event';

jest.mock('@vue-storefront/core/application-services', () => ({ useStore: jest.fn() }));
jest.mock('@vue-storefront/core/compatibility/plugins/event-bus', () => ({ __esModule: true, default: { $emit: jest.fn() } }));
jest.mock('config', () => ({ cart: { synchronize: true, synchronize_totals: true } }));
jest.mock('@vue-storefront/core/lib/logger', () => ({ Logger: { info: () => () => {}, debug: () => () => {} } }));
jest.mock('@vue-storefront/core/data-resolver', () => ({ CartService: {} }));
jest.mock('@vue-storefront/core/modules/cart/helpers', () => ({
  productsEquals: (a, b) => a.sku === b.sku,
  createDiffLog: () => new (jest.requireActual('@vue-storefront/core/modules/cart/helpers/createDiffLog').DiffLog)(),
  notifications: {}, createCartItemForUpdate: jest.fn(), calculateTotals: () => []
}));
jest.mock('@vue-storefront/core/modules/cart/helpers/productsEquals', () => ({ __esModule: true, default: (a, b) => a.sku === b.sku }));
jest.mock('@vue-storefront/core/modules/cart/helpers/productChecksum', () => ({ __esModule: true, default: () => 'checksum' }));
jest.mock('src/modules/shared', () => ({ getProductOptions: () => ({}) }));
jest.mock('@vue-storefront/core/modules/cart/hooks', () => ({ cartHooksExecutors: { beforeSync: (payload) => payload } }));
jest.mock('storefront-query-builder', () => ({ SearchQuery: class { public applyFilter () { return this; } } }));
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

function deferred () {
  let resolveDeferred!: () => void;
  const promise = new Promise<void>((resolve) => { resolveDeferred = resolve; });
  return { promise, resolve: resolveDeferred };
}

describe('cart readiness after a catalog refresh', () => {
  it.each([
  ['view_cart / catalog last', useCartViewEvent, 'cartViewed', 'catalog'],
  ['begin_checkout / catalog last', useBeginCheckoutEvent, 'beginCheckout', 'catalog'],
  ['view_cart / totals last', useCartViewEvent, 'cartViewed', 'totals'],
  ['begin_checkout / totals last', useBeginCheckoutEvent, 'beginCheckout', 'totals']
])('%s fires after synchronization', async (_name, composable, eventName, last) => {
  jest.clearAllMocks();
  const catalog = deferred();
  const totals = deferred();
  const totalsApplied = deferred();
  const productLoaded = deferred();
  const item = { sku: 'PLUSH-1', qty: 1, type_id: 'bundle', name: 'Plushie',
    bundle_options: [{ option_id: 1, product_links: [] }],
    extension_attributes: { budsies_quote_item_totals: { regular_price: 100, final_price: 90 } }
  };
  const hydratedProduct = { ...item, category: [{ category_id: 4, name: 'Plushies', position: 1 }],
    description: 'Loaded after totals', bundle_options: [{ option_id: 1, product_links: [] }] };
  const store = new Store<any>({ modules: {
    product: { namespaced: true, state: { dictionary: {} },
      getters: { getProductBySkuDictionary: (state) => state.dictionary },
      mutations: { loaded: (state) => { Vue.set(state.dictionary, item.sku, hydratedProduct); } },
      actions: { findProducts: async ({ commit }) => { await catalog.promise; commit('loaded'); productLoaded.resolve(); } }
    },
    cart: { namespaced: true,
      state: { cartItems: [item], cartIsLoaded: true, cartServerToken: 'quote', cartItemsHash: null,
        cartServerLastTotalsSyncDate: 0, isCartSyncing: true, isTotalsSyncing: false, isCouponProcessing: false },
      getters: cartGetters, mutations: cartMutations,
      actions: { ...mergeActions,
        mergeClientItems: () => new (require('@vue-storefront/core/modules/cart/helpers/createDiffLog').DiffLog)(),
        mergeServerItems: () => new (require('@vue-storefront/core/modules/cart/helpers/createDiffLog').DiffLog)(),
        syncTotals: async ({ commit }) => { await totals.promise; commit(types.CART_SET_TOTALS_SYNC); totalsApplied.resolve(); },
        updateItem: ({ commit }, payload) => commit(types.CART_UPD_ITEM_PROPS, payload)
      }
    }
  } });
  jest.mocked(useStore).mockReturnValue(store);
  const page = new Vue({ setup () { (composable as () => void)(); }, render: (h) => h('div') }).$mount();
  try {
    const sync = store.dispatch('cart/merge', { serverItems: [], clientItems: store.state.cart.cartItems });
    if (last === 'catalog') {
      totals.resolve();
      await totalsApplied.promise;
      await Vue.nextTick();
      // Totals and hash have finished while the catalog request is pending.
      expect(store.getters['cart/isTotalsSyncRequired']).toBe(false);
      catalog.resolve();
    } else {
      catalog.resolve();
      await productLoaded.promise;
      await Vue.nextTick();
      totals.resolve();
    }
    await sync;
    store.commit('cart/' + types.SET_IS_CART_SYNCING, false);
    await Vue.nextTick();
    expect(store.state.cart.cartServerLastTotalsSyncDate).toBeGreaterThan(0);
    expect(store.state.cart.cartItems[0].category).toEqual(hydratedProduct.category);
    expect(store.getters['cart/isTotalsSyncRequired']).toBe(false);
    expect(EventBus.$emit).toHaveBeenCalledWith(eventName, ...(
      eventName === 'cartViewed' ? [expect.any(Object)] : []
    ));
  } finally { page.$destroy(); }
});
});
