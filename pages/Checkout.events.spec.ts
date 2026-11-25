import Vue from 'vue';
import Vuex from 'vuex';
import Checkout from './Checkout.vue';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import CartEvents from 'src/modules/shared/types/cart-events';

jest.mock('@vue-storefront/core/pages/Checkout', () => ({}));
jest.mock('@vue-storefront/core/application-services', () => ({}));
jest.mock('@storefront-ui/vue', () => ({ SfSteps: {} }));
jest.mock('src/modules/payment-braintree', () => ({ Braintree: {} }));
jest.mock('@vue-storefront/core/lib/modules', () => ({ registerModule: jest.fn() }));
jest.mock('@vue-storefront/core/modules/checkout', () => ({ ORDER_ERROR_EVENT: 'order-error-event' }));
jest.mock('theme/components/organisms/o-billing-address', () => ({}));
jest.mock('theme/components/organisms/o-shipping', () => ({}));
jest.mock('theme/components/organisms/o-confirm-order', () => ({}));
jest.mock('theme/components/organisms/o-order-review', () => ({}));
jest.mock('theme/components/organisms/o-order-summary', () => ({}));
jest.mock('theme/components/organisms/o-order-success', () => ({}));
jest.mock('theme/components/organisms/o-personal-details', () => ({}));
jest.mock('theme/components/organisms/o-cart-items-table', () => ({}));
jest.mock('src/modules/promotion-platform/components/ProductionSpotCountdown.vue', () => ({}));
jest.mock('theme/store/ui/modals', () => ({}));
jest.mock('@vue-storefront/core/filters', () => ({}));
jest.mock('@vue-storefront/core/lib/multistore', () => ({}));
jest.mock('src/modules/shared', () => ({ CartEvents: jest.requireActual('src/modules/shared/types/cart-events').default }));

Vue.use(Vuex);
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

function deferred () {
  let resolveEntry!: () => void;
  let rejectEntry!: (error: Error) => void;
  const promise = new Promise<void>((resolve, reject) => { resolveEntry = resolve; rejectEntry = reject; });
  return { promise, resolve: resolveEntry, reject: rejectEntry };
}

describe('standard checkout page event', () => {
  const onBegin = jest.fn();
  let page: Vue & { success?: string };

  function mountPage ({ success, empty = false, hasTotals = true }: { success?: string, empty?: boolean, hasTotals?: boolean } = {}) {
    const entry = deferred();
    const startup = deferred();
    const products = empty ? [] : [{ sku: 'one', qty: 2, server_item_id: 7 }];
    const platformTotals = hasTotals ? { base_grand_total: 20 } : null;
    const store = new Vuex.Store({ modules: { cart: {
      namespaced: true,
      state: { platformTotals },
      getters: {
        getCartItems: () => products, isVirtualCart: () => false
      },
      actions: { waitForStartup: () => startup.promise, waitForIdle: () => {} }
    } } });
    onBegin.mockImplementation(() => ({ products, platformTotals: store.state.cart.platformTotals }));
    const dispatch = jest.spyOn(store, 'dispatch');
    page = new Vue({
      extends: Checkout, store, propsData: { success },
      data: () => ({ checkoutEntry: entry.promise, checkoutEntryActive: true }),
      beforeCreate () { Object.assign(this, { $t: (text: string) => text }); },
      beforeDestroy () { this.checkoutEntryActive = false; },
      render: h => h('div')
    }).$mount();
    return { entry, startup, products, platformTotals, dispatch };
  }

  beforeEach(() => { onBegin.mockClear(); EventBus.$on(CartEvents.BEGIN_CHECKOUT, onBegin); });
  afterEach(() => { page.$destroy(); EventBus.$off(CartEvents.BEGIN_CHECKOUT, onBegin); });

  it('waits for both entry and startup, then emits once with the settled cart and standard flag', async () => {
    const { entry, startup, products, platformTotals, dispatch } = mountPage();
    await flush();
    expect(onBegin).not.toHaveBeenCalled();
    entry.resolve();
    await flush();
    expect(onBegin).not.toHaveBeenCalled();
    startup.resolve();
    await flush();
    expect(onBegin).toHaveBeenCalledTimes(1);
    expect(onBegin).toHaveBeenCalledWith();
    expect(onBegin).toHaveReturnedWith({ products, platformTotals });
    expect(dispatch.mock.calls).toEqual([['cart/waitForStartup'], ['cart/waitForIdle']]);
  });

  it.each([true, false])('emits after the entry refresh fails without requesting totals (same-quote totals: %s)', async hasTotals => {
    const { entry, startup, products, platformTotals, dispatch } = mountPage({ hasTotals });
    entry.reject(new Error('entry unavailable'));
    startup.resolve();
    await flush();
    expect(dispatch.mock.calls).toEqual([['cart/waitForStartup'], ['cart/waitForIdle']]);
    expect(onBegin).toHaveBeenCalledTimes(1);
    expect(onBegin).toHaveReturnedWith({ products, platformTotals });
  });

  it.each(['empty', 'success', 'becomes success', 'unmounted'])('suppresses an %s visit', async reason => {
    const { entry, startup } = mountPage({ empty: reason === 'empty', success: reason === 'success' ? 'success' : undefined });
    if (reason === 'becomes success') page.success = 'success';
    if (reason === 'unmounted') page.$destroy();
    entry.resolve();
    startup.resolve();
    await flush();
    expect(onBegin).not.toHaveBeenCalled();
  });
});
