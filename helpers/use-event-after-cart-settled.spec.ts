import Vue from 'vue';
import Vuex, { Store } from 'vuex';
import { useStore } from '@vue-storefront/core/application-services';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import { useEventAfterCartSettled } from './use-event-after-cart-settled';

jest.mock('@vue-storefront/core/application-services', () => ({ useStore: jest.fn() }));
jest.mock('@vue-storefront/core/compatibility/plugins/event-bus', () => ({ __esModule: true, default: { $emit: jest.fn() } }));
Vue.use(Vuex);

function deferred () {
  let resolvePromise: () => void = () => undefined;
  const promise = new Promise<void>(resolve => { resolvePromise = resolve; });
  return { promise, resolve: resolvePromise };
}
const flush = () => new Promise(resolve => setTimeout(resolve, 0));
const item = { sku: 'one', qty: 1 };
const totals = { base_grand_total: 90, coupon_code: 'SAVE' };

function createStore (overrides = {}) {
  return new Store<any>({ modules: {
    checkout: { namespaced: true, state: { entryPromise: Promise.resolve(), entryRefreshAttempted: false } },
    cart: {
      namespaced: true,
      state: { cartItems: [item], platformTotals: totals, timestamp: 1, connectionPromises: [],
        startup: Promise.resolve(), idle: Promise.resolve(), busy: false, canSync: true, ...overrides },
      getters: {
        getCartItems: state => state.cartItems, getLastTotalsSyncDate: state => state.timestamp,
        canSyncTotals: state => state.canSync, getIsAdding: state => state.busy,
        IS_CART_SYNCING: () => false, IS_TOTALS_SYNCING: () => false, IS_COUPON_PROCESSING: () => false
      },
      mutations: { update: (state, values) => Object.assign(state, values) },
      actions: {
        waitForStartup: ({ state }) => state.startup,
        waitForIdle: ({ state }) => state.idle,
        syncTotals: jest.fn(({ state }) => { if (state.failRefresh) throw new Error('network'); })
      }
    }
  } });
}

function mount (store: Store<any>, checkout = false) {
  jest.mocked(useStore).mockReturnValue(store);
  return new Vue({ setup () { useEventAfterCartSettled(checkout); }, render: h => h('div') }).$mount();
}

afterEach(() => jest.clearAllMocks());

describe.each([false, true])('settled cart visit (checkout: %s)', checkout => {
  it('waits for startup, connection and active work, and emits only once', async () => {
    const startup = deferred();
    const idle = deferred();
    const store = createStore({ startup: startup.promise, idle: idle.promise });
    const page = mount(store, checkout);
    await flush();
    expect(EventBus.$emit).not.toHaveBeenCalled();
    startup.resolve();
    await flush();
    expect(EventBus.$emit).not.toHaveBeenCalled();
    idle.resolve();
    await flush();
    expect(EventBus.$emit).toHaveBeenCalledTimes(1);
    store.commit('cart/update', { busy: true });
    await flush();
    expect(EventBus.$emit).toHaveBeenCalledTimes(1);
    page.$destroy();
  });

  it('makes at most one attempt for missing totals and emits after failure', async () => {
    const store = createStore({ timestamp: 0, platformTotals: null, failRefresh: true });
    const dispatch = jest.spyOn(store, 'dispatch');
    const page = mount(store, checkout);
    await flush();
    expect(dispatch.mock.calls.filter(([action]) => action === 'cart/syncTotals')).toHaveLength(1);
    expect(EventBus.$emit).toHaveBeenCalledTimes(1);
    page.$destroy();
  });

  it('does not emit or start a totals request after unmount', async () => {
    const startup = deferred();
    const store = createStore({ timestamp: 0, startup: startup.promise });
    const dispatch = jest.spyOn(store, 'dispatch');
    const page = mount(store, checkout);
    page.$destroy();
    startup.resolve();
    await flush();
    expect(EventBus.$emit).not.toHaveBeenCalled();
    expect(dispatch.mock.calls.filter(([action]) => action === 'cart/syncTotals')).toHaveLength(0);
  });
});

it('waits for checkout entry and does not retry its attempted refresh', async () => {
  const entry = deferred();
  const store = createStore({ timestamp: 0, platformTotals: null });
  store.state.checkout.entryPromise = entry.promise;
  store.state.checkout.entryRefreshAttempted = true;
  const dispatch = jest.spyOn(store, 'dispatch');
  const page = mount(store, true);
  await flush();
  expect(EventBus.$emit).not.toHaveBeenCalled();
  entry.resolve();
  await flush();
  expect(dispatch.mock.calls.filter(([action]) => action === 'cart/syncTotals')).toHaveLength(0);
  expect(EventBus.$emit).toHaveBeenCalledTimes(1);
  page.$destroy();
});

it('permits one missing-totals attempt when entry fails before starting its refresh', async () => {
  const store = createStore({ timestamp: 0, platformTotals: null });
  store.state.checkout.entryPromise = Promise.reject(new Error('payment preparation'));
  store.state.checkout.entryPromise.catch(() => undefined);
  const dispatch = jest.spyOn(store, 'dispatch');
  const page = mount(store, true);
  await flush();
  expect(dispatch.mock.calls.filter(([action]) => action === 'cart/syncTotals')).toHaveLength(1);
  expect(EventBus.$emit).toHaveBeenCalledTimes(1);
  page.$destroy();
});

it('does not retry when the entry refresh rejects after it was attempted', async () => {
  const store = createStore({ timestamp: 0, platformTotals: null });
  store.state.checkout.entryRefreshAttempted = true;
  store.state.checkout.entryPromise = Promise.reject(new Error('refresh failed'));
  store.state.checkout.entryPromise.catch(() => undefined);
  const dispatch = jest.spyOn(store, 'dispatch');
  const page = mount(store, true);
  await flush();
  expect(dispatch.mock.calls.filter(([action]) => action === 'cart/syncTotals')).toHaveLength(0);
  expect(EventBus.$emit).toHaveBeenCalledTimes(1);
  page.$destroy();
});

it('does not request totals for an offline, disabled, or disconnected cart', async () => {
  const store = createStore({ timestamp: 0, platformTotals: null, canSync: false });
  const dispatch = jest.spyOn(store, 'dispatch');
  const page = mount(store);
  await flush();
  expect(dispatch.mock.calls.filter(([action]) => action === 'cart/syncTotals')).toHaveLength(0);
  expect(EventBus.$emit).toHaveBeenCalledTimes(1);
  page.$destroy();
});

it('does not emit again after an empty view, but a new visit can emit', async () => {
  const store = createStore({ cartItems: [], timestamp: 0 });
  const first = mount(store);
  await flush();
  store.commit('cart/update', { cartItems: [item] });
  await flush();
  expect(EventBus.$emit).toHaveBeenCalledTimes(1);
  first.$destroy();
  const second = mount(store);
  await flush();
  expect(EventBus.$emit).toHaveBeenCalledTimes(2);
  second.$destroy();
});

it('does not emit standard checkout for an empty cart', async () => {
  const store = createStore({ cartItems: [] });
  const page = mount(store, true);
  await flush();
  expect(EventBus.$emit).not.toHaveBeenCalled();
  page.$destroy();
});

it('does not emit during server rendering', async () => {
  const store = createStore();
  jest.mocked(useStore).mockReturnValue(store);
  const renderer = require('vue-server-renderer').createRenderer();
  await renderer.renderToString(new Vue({ setup () { useEventAfterCartSettled(); }, render: h => h('div') }));
  expect(EventBus.$emit).not.toHaveBeenCalled();
});
