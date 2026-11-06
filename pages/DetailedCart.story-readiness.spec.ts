import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import { useStore } from '@vue-storefront/core/application-services';
import { emitPageRenderedEvent } from 'src/modules/shared';

import Page from './DetailedCart.vue';
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus';
import CartEvents from 'src/modules/shared/types/cart-events';

jest.mock('@vue-storefront/core/application-services', () => ({ useStore: jest.fn() }));
jest.mock('@vue-storefront/core/request-services', () => ({
  useRequestServices: () => ({ host: 'test' })
}));
jest.mock('src/modules/vsf-storyblok-module', () =>
  require('src/modules/vsf-storyblok-module/composables/use-storyblok-readiness-tracker')
);
jest.mock('src/modules/shared', () => ({ emitPageRenderedEvent: jest.fn(), ProductEvent: {} }));
jest.mock('@vue-storefront/core/compatibility/plugins/event-bus', () => ({
  __esModule: true,
  default: { $on: jest.fn(), $off: jest.fn(), $emit: jest.fn() }
}));
jest.mock('@vue-storefront/core/filters', () => ({ htmlDecode: value => value }));
jest.mock('@vue-storefront/core/helpers', () => ({
  isServer: false,
  onlineHelper: { isOnline: true }
}));
jest.mock('@vue-storefront/core/lib/multistore', () => ({ localizedRoute: value => value }));
jest.mock('@storefront-ui/vue', () => ({ SfList: {}, SfButton: {}, SfHeading: {} }));
async function flushRenderQueue (): Promise<void> {
  for (let turn = 0; turn < 5; turn++) {
    await Vue.nextTick();
  }
}
jest.mock('@storefront-ui/vue/src/utilities/directives', () => ({
  __esModule: true,
  default: {},
  clickOutside: jest.fn(() => ({}))
}));
jest.mock('./DetailedCart/index.js', () => ({
  __esModule: true,
  default: {},
  OrderSummary: jest.fn(() => ({}))
}));
jest.mock('./DetailedCart/cart-line-item.vue', () => ({ __esModule: true, default: {} }));
jest.mock('@vue-storefront/core/modules/cart/helpers/get-cart-item-key.function', () => ({
  __esModule: true,
  default: () => 'item'
}));
jest.mock('src/modules/shared/types/cart-events', () => ({
  __esModule: true,
  default: { CART_VIEWED: 'cart-viewed' }
}));
jest.mock('@storefront-ui/vue/src/utilities/mobile-observer', () => ({
  __esModule: true,
  default: {},
  mapMobileObserver: jest.fn(() => ({}))
}));
jest.mock('src/modules/promotion-platform/components/ProductionSpotCountdown.vue', () => ({
  __esModule: true,
  default: {}
}));
jest.mock('@vue-storefront/core/modules/checkout', () => ({
  __esModule: true,
  default: {},
  ORDER_ERROR_EVENT: jest.fn(() => ({}))
}));
jest.mock('@vue-storefront/core/modules/cart', () => ({
  __esModule: true,
  default: {},
  IS_CART_SYNCING: jest.fn(() => ({}))
}));
jest.mock('theme/store/ui/modals', () => ({
  __esModule: true,
  default: {},
  ModalList: jest.fn(() => ({}))
}));
jest.mock('theme/components/molecules/m-block-story.vue', () => ({
  __esModule: true,
  default: {}
}));
jest.mock('theme/components/molecules/m-dropdown.vue', () => ({ __esModule: true, default: {} }));

it.each([true, false])(
  'combines loaded cart and conditional shipping story (nonempty: %s)',
  async nonempty => {
    const state = Vue.observable({
      cart: { cartIsLoaded: false, platformTotals: [] },
      items: nonempty ? [{ qty: 1 }] : []
    });
    const store = {
      state,
      getters: {
        get 'cart/getCartItems'() {
          return state.items;
        }
      }
    };

    (useStore as jest.Mock).mockReturnValue(store);
    (emitPageRenderedEvent as jest.Mock).mockClear();
    (EventBus.$emit as jest.Mock).mockClear();

    const wrapper = shallowMount(Page as any, {
      mocks: { $store: store, $t: value => value, $route: {} }
    });

    await flushRenderQueue();

    expect(emitPageRenderedEvent).not.toHaveBeenCalled();

    state.cart.cartIsLoaded = true;
    await flushRenderQueue();

    expect(EventBus.$emit).toHaveBeenCalledWith(CartEvents.CART_VIEWED, {
      products: state.items,
      platformTotals: []
    });

    if (nonempty) {
      expect(emitPageRenderedEvent).not.toHaveBeenCalled();

      const story = wrapper.findComponent({ name: 'MBlockStory' });

      story.vm.$emit('story-rendered', ['blocks/cart_shipping_handling']);
      await flushRenderQueue();

      expect(emitPageRenderedEvent).toHaveBeenCalledTimes(1);

      story.vm.$emit('story-rendered', ['blocks/cart_shipping_handling']);
      await flushRenderQueue();

      expect(emitPageRenderedEvent).toHaveBeenCalledTimes(1);

      state.items = [];
      await flushRenderQueue();

      expect(emitPageRenderedEvent).toHaveBeenCalledTimes(2);
    } else {
      expect(wrapper.findComponent({ name: 'MBlockStory' }).exists()).toBe(false);
      expect(emitPageRenderedEvent).toHaveBeenCalledTimes(1);
    }

    wrapper.destroy();
  }
);
