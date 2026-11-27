import Vue from 'vue';
import Vuex from 'vuex';
import { shallowMount } from '@vue/test-utils';
import { useStore } from '@vue-storefront/core/application-services';
import CheckoutTotalsRetry from './checkout-totals-retry.vue';

jest.mock('@vue-storefront/core/application-services', () => ({ useStore: jest.fn() }));
jest.mock('@vue-storefront/core/modules/cart', () => ({ IS_TOTALS_SYNCING: 'cart/IS_TOTALS_SYNCING' }));
jest.mock('@vue-storefront/core/modules/checkout/helpers/require-payment-totals', () => ({ requirePaymentTotals: jest.fn() }));
jest.mock('@storefront-ui/vue', () => ({ SfButton: { name: 'SfButton', render: h => h('button') } }));

Vue.use(Vuex);

it('offers a retained-totals retry only in express context and blocks it during cart work', async () => {
  let finish: () => void = () => {};
  const sync = jest.fn(() => new Promise<void>(resolve => { finish = resolve; }));
  const store = new Vuex.Store({
    state: { totals: {}, failed: true, busy: false },
    getters: {
      'cart/getPaymentTotals': state => state.totals,
      'cart/hasTotalsRefreshFailed': state => state.failed,
      'cart/isCartBusy': state => state.busy,
      'cart/IS_TOTALS_SYNCING': () => false
    },
    actions: { 'cart/syncTotals': sync }
  });
  jest.mocked(useStore).mockReturnValue(store as any);
  const options = { mocks: { $t: (text: string) => text } };
  const standard = shallowMount(CheckoutTotalsRetry, options);
  const express = shallowMount(CheckoutTotalsRetry, { ...options, propsData: { express: true } });
  expect(standard.find('p').exists()).toBe(false);
  expect(express.find('p').exists()).toBe(true);
  store.state.busy = true;
  await Vue.nextTick();
  await (express.vm as any).refreshTotals();
  expect(sync).not.toHaveBeenCalled();
  store.state.busy = false;
  await Vue.nextTick();
  const retry = (express.vm as any).refreshTotals();
  await Vue.nextTick();
  await (express.vm as any).refreshTotals();
  expect(sync).toHaveBeenCalledTimes(1);
  expect(sync).toHaveBeenCalledWith(expect.anything(), { forceServerSync: true });
  finish();
  await retry;
  expect(express.find('p').exists()).toBe(true);
  store.state.failed = false;
  await Vue.nextTick();
  expect(express.find('p').exists()).toBe(false);
  standard.destroy();
  express.destroy();
});

it('keeps the express retry available after another rejected refresh', async () => {
  const sync = jest.fn().mockRejectedValue(new Error('network'));
  const store = new Vuex.Store({
    getters: { 'cart/getPaymentTotals': () => ({}), 'cart/hasTotalsRefreshFailed': () => true, 'cart/isCartBusy': () => false },
    actions: { 'cart/syncTotals': sync }
  });
  jest.mocked(useStore).mockReturnValue(store as any);
  const wrapper = shallowMount(CheckoutTotalsRetry, { propsData: { express: true }, mocks: { $t: (text: string) => text } });
  await (wrapper.vm as any).refreshTotals();
  expect(wrapper.find('p').exists()).toBe(true);
  await (wrapper.vm as any).refreshTotals();
  expect(sync).toHaveBeenCalledTimes(2);
  wrapper.destroy();
});

it('does not block the express retry on a quantity difference from the applied totals', async () => {
  const sync = jest.fn();
  const store = new Vuex.Store({
    getters: {
      'cart/getPaymentTotals': () => ({}),
      'cart/hasTotalsRefreshFailed': () => true,
      'cart/hasPendingQuantityChange': () => true,
      'cart/canStartExpressCheckout': () => false,
      'cart/isCartBusy': () => false
    },
    actions: { 'cart/syncTotals': sync }
  });
  jest.mocked(useStore).mockReturnValue(store as any);
  const wrapper = shallowMount(CheckoutTotalsRetry, { propsData: { express: true }, mocks: { $t: (text: string) => text } });
  expect(wrapper.find('p').exists()).toBe(true);
  await (wrapper.vm as any).refreshTotals();
  expect(sync).toHaveBeenCalledTimes(1);
  wrapper.destroy();
});

it('does not show the express retry for a quantity difference alone', () => {
  const store = new Vuex.Store({
    getters: {
      'cart/getPaymentTotals': () => ({}),
      'cart/hasTotalsRefreshFailed': () => false,
      'cart/hasPendingQuantityChange': () => true,
      'cart/isCartBusy': () => false
    }
  });
  jest.mocked(useStore).mockReturnValue(store as any);
  const wrapper = shallowMount(CheckoutTotalsRetry, { propsData: { express: true }, mocks: { $t: (text: string) => text } });
  expect(wrapper.find('p').exists()).toBe(false);
  wrapper.destroy();
});
