import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { useStore } from '@vue-storefront/core/application-services';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { CartService } from '@vue-storefront/core/data-resolver';
import { calcItemsHmac } from '@vue-storefront/core/helpers/calc-items-hmac';
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
function createSynchronizedStore () {
  const item = createItem();

  return new Store<any>({
    modules: {
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
          isCartSyncing: false,
          isTotalsSyncing: false,
          totalsSyncDepth: 0,
          isCouponProcessing: false,
          platformTotals: { grand_total: 200 },
          platformTotalSegments: [],
          itemsAfterPlatformTotals: {}
        },
        getters: cartGetters,
        mutations: cartMutations,
        actions: {
          ...totalsActions,
          pullMethods: async () => undefined,
          updateItem: ({ commit }, payload) => commit(types.CART_UPD_ITEM_PROPS, payload),
          clear: jest.fn()
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

  it('does not hold the syncing state when no refresh is needed', async () => {
    await store.dispatch('cart/syncTotals', { forceServerSync: false });

    expect(CartService.getTotals).not.toHaveBeenCalled();
    expectSettled();
  });
});
