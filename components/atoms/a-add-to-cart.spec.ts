import { createLocalVue, mount } from '@vue/test-utils';
import Vue from 'vue';
import Vuex from 'vuex';
import AAddToCart from './a-add-to-cart.vue';
import ServerError from 'src/modules/shared/types/server-error';

jest.mock('@storefront-ui/vue', () => ({ SfButton: { render: (h: Vue.CreateElement) => h('button') } }));
jest.mock('@vue-storefront/core/filters/product-messages', () => ({ formatProductMessages: () => '' }));
jest.mock('@vue-storefront/core/modules/cart/helpers', () => ({
  notifications: { createNotification: (notification) => notification }
}));

const localVue = createLocalVue();
localVue.use(Vuex);

it('shows the translated cart-lost message when adding fails', async () => {
  const message = 'Your cart is no longer available. Please add your items again.';
  const addItem = jest.fn().mockRejectedValue(new ServerError(message));
  const notify = jest.fn();
  const store = new Vuex.Store({
    modules: {
      cart: { namespaced: true, getters: { getIsAdding: () => false }, actions: { addItem } },
      notification: { namespaced: true, actions: { spawnNotification: notify } }
    }
  });
  const wrapper = mount(AAddToCart, {
    localVue,
    store,
    propsData: { product: { sku: 'collar' } },
    mocks: { $t: (text: string) => text }
  });

  await wrapper.find('button').trigger('click');
  await new Promise(resolve => setTimeout(resolve, 0));

  expect(notify).toHaveBeenCalledWith(expect.anything(), {
    type: 'danger', message, timeToLive: 10000
  });
  wrapper.destroy();
});
