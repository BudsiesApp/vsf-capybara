import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import { useStore } from '@vue-storefront/core/application-services';
import { emitPageRenderedEvent } from 'src/modules/shared';

import Page from './Product.vue';

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
jest.mock('@storefront-ui/vue', () => ({}));
async function flushRenderQueue (): Promise<void> {
  for (let turn = 0; turn < 5; turn++) {
    await Vue.nextTick();
  }
}
jest.mock('@vue-storefront/core/modules/catalog/types/product-visibility.value', () => ({
  __esModule: true,
  default: {},
  ProductVisibility: jest.fn(() => ({}))
}));
jest.mock('@vue-storefront/core/modules/catalog-next/hooks', () => ({
  __esModule: true,
  default: {},
  catalogHooksExecutors: jest.fn(() => ({}))
}));
jest.mock('theme/components/molecules/m-related-products', () => ({
  __esModule: true,
  default: {}
}));
jest.mock('theme/components/organisms/o-product-details', () => ({
  __esModule: true,
  default: {}
}));
jest.mock('@vue-storefront/core/modules/catalog/events', () => ({
  __esModule: true,
  default: {},
  filterChangedProduct: jest.fn(() => ({}))
}));
jest.mock('@vue-storefront/core/modules/catalog/helpers', () => ({
  __esModule: true,
  default: {},
  getMediaGallery: jest.fn(() => ({}))
}));
jest.mock('@vue-storefront/core/modules/catalog/store/product/mutation-types', () => ({
  __esModule: true,
  default: {},
  PRODUCT_UNSET_CURRENT: jest.fn(() => ({}))
}));
jest.mock('src/modules/budsies', () => ({
  __esModule: true,
  default: {},
  ProductStructuredData: jest.fn(() => ({}))
}));
jest.mock('theme/components/molecules/m-product-description-story.vue', () => ({
  __esModule: true,
  default: {}
}));

it('waits for primary/fallback descriptions, suppresses duplicates and resets reused product pages', async () => {
  const product = Vue.observable({ value: { sku: 'A', parentSku: 'parent' } });
  const store = {
    getters: {
      get 'product/getCurrentProduct'() {
        return product.value;
      }
    },
    state: { ui: {} }
  };

  (useStore as jest.Mock).mockReturnValue(store);
  (emitPageRenderedEvent as jest.Mock).mockClear();

  const wrapper = shallowMount(
    { ...Page, mounted: undefined, beforeMount: undefined, created: undefined, watch: {} } as any,
    {
      mocks: { $store: store, $t: value => value },
      computed: {
        getCustomAttributes: () => [],
        getProductGallery: () => [],
        getCurrentCustomOptions: () => []
      }
    }
  );

  await flushRenderQueue();

  expect(emitPageRenderedEvent).not.toHaveBeenCalled();

  const description = () => wrapper.findComponent({ name: 'MProductDescriptionStory' });

  description().vm.$emit('story-rendered', [
    'product-descriptions/A',
    'product-descriptions/parent'
  ]);
  await flushRenderQueue();

  expect(emitPageRenderedEvent).toHaveBeenCalledTimes(1);

  description().vm.$emit('story-rendered', ['product-descriptions/A']);
  await flushRenderQueue();

  expect(emitPageRenderedEvent).toHaveBeenCalledTimes(1);

  product.value = { sku: 'B', parentSku: 'parent' };
  await flushRenderQueue();

  expect(emitPageRenderedEvent).toHaveBeenCalledTimes(1);

  description().vm.$emit('story-rendered', ['product-descriptions/B']);
  await flushRenderQueue();

  expect(emitPageRenderedEvent).toHaveBeenCalledTimes(2);

  wrapper.destroy();
});
