import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import { useStore } from '@vue-storefront/core/application-services';
import { emitPageRenderedEvent } from 'src/modules/shared';
import { mappingFallbackForUrlRewrite } from 'src/modules/url-rewrite';

import Page from './Category.vue';

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
jest.mock('@storefront-ui/vue', () => ({
  SfLoader: {},
  SfIcon: {},
  SfList: {},
  SfColor: {},
  SfButton: {},
  SfSelect: {},
  SfFilter: {},
  SfSidebar: {},
  SfHeading: {},
  SfMenuItem: {},
  SfAccordion: {},
  SfPagination: {}
}));
async function flushRenderQueue (): Promise<void> {
  for (let turn = 0; turn < 5; turn++) {
    await Vue.nextTick();
  }
}
jest.mock('@vue-storefront/i18n', () => ({ __esModule: true, default: {} }));
jest.mock('@vue-storefront/core/modules/catalog-next/helpers/categoryHelpers', () => ({
  __esModule: true,
  default: {},
  getSearchOptionsFromRouteParams: jest.fn(() => ({}))
}));
jest.mock('@vue-storefront/core/modules/catalog-next/hooks', () => ({
  __esModule: true,
  default: {},
  catalogHooksExecutors: jest.fn(() => ({}))
}));
jest.mock('theme/helpers', () => ({
  __esModule: true,
  default: {},
  getTopLevelCategories: jest.fn(() => ({})),
  prepareCategoryMenuItem: jest.fn(() => ({})),
  prepareCategoryProduct: jest.fn(() => ({}))
}));
jest.mock('query-string', () => ({ __esModule: true, default: jest.requireActual('query-string') }));
jest.mock('@vue-storefront/core/store', () => ({ __esModule: true, default: {} }));
jest.mock('@vue-storefront/core/modules/url/helpers', () => ({ normalizeUrlPath: value => value }));
jest.mock('@storefront-ui/vue/src/utilities/mobile-observer', () => ({
  __esModule: true,
  default: {},
  mapMobileObserver: jest.fn(() => ({})),
  unMapMobileObserver: jest.fn(() => ({}))
}));
jest.mock('@vue-storefront/core/modules/catalog', () => ({
  __esModule: true,
  default: {},
  PRODUCT_LOCALIZED_PRICE_DICTIONARY: jest.fn(() => ({}))
}));
jest.mock('src/modules/url-rewrite', () => ({
  __esModule: true,
  default: {},
  mappingFallbackForUrlRewrite: jest.fn(() => ({}))
}));
jest.mock('theme/helpers/get-current-theme-class', () => ({ __esModule: true, default: () => '' }));
jest.mock('theme/helpers/use-infinity-scroll', () => ({
  __esModule: true,
  default: {},
  useInfinityScroll: jest.fn(() => ({}))
}));
jest.mock('theme/components/atoms/a-sort-icon', () => ({ __esModule: true, default: {} }));
jest.mock('theme/components/molecules/m-category-description-story.vue', () => ({
  __esModule: true,
  default: {}
}));
jest.mock('theme/components/organisms/o-product-card', () => ({ __esModule: true, default: {} }));
jest.mock('src/modules/currency', () => ({
  __esModule: true,
  default: {},
  GET_ACTIVE_CURRENCY: jest.fn(() => ({}))
}));

it('checks Category rewrites during serverPrefetch with the shared normalized tag', async () => {
  const store = require('@vue-storefront/core/store').default;
  store.getters = { 'category-next/getCategoryByParams': () => ({}) };
  store.dispatch = jest.fn(async () => ({ targetPath: 'target', redirectCode: 301 }));
  (mappingFallbackForUrlRewrite as jest.Mock).mockImplementation(require('src/modules/url-rewrite/mappingFallback').mappingFallbackForUrlRewrite);
  const redirect = jest.fn();
  const tags = new Set();
  Vue.prototype.$cacheTags = tags;
  const onCategoryChangedHandler = jest.fn();
  try {
    await (Page as any).serverPrefetch.call({
      $route: { path: '/Old-Path/', query: { step: '2' }, params: {} },
      requestServices: { redirect }, onCategoryChangedHandler
    });
    expect(onCategoryChangedHandler).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith('/target/?step=2', 301);
    expect(tags).toEqual(new Set(['url_rewrite', 'url_rewrite_old-path']));
  } finally {
    delete Vue.prototype.$cacheTags;
    (mappingFallbackForUrlRewrite as jest.Mock).mockReset();
  }
});

it('uses the category record and normalized description while products are still loading, including missing/failed reports', async () => {
  const category = Vue.observable({ value: { id: 1, url_path: 'a/b/c' } as any });
  const store = {
    getters: {
      get 'category-next/getCurrentCategory'() {
        return category.value;
      }
    }
  };

  (useStore as jest.Mock).mockReturnValue(store);
  (emitPageRenderedEvent as jest.Mock).mockClear();

  const wrapper = shallowMount(
    { ...Page, mounted: undefined, beforeDestroy: undefined, watch: {} } as any,
    {
      mocks: { $store: store, $t: value => value, $route: { query: {}, params: {} } },
      computed: {
        products: () => [],
        getCategoryProductsTotal: () => 0,
        isCategoryEmpty: () => true,
        filters: () => [],
        category: () => category.value,
        breadcrumbs: () => [],
        subcategories: () => [],
        activeFiltersCount: () => 0
      }
    }
  );

  (wrapper.vm as any).isProductsLoading = true;
  await flushRenderQueue();

  expect(emitPageRenderedEvent).not.toHaveBeenCalled();

  await flushRenderQueue();

  const description = () => wrapper.findComponent({ name: 'MCategoryDescriptionStory' });

  description().vm.$emit('story-rendered', ['category-descriptions/a_b_c']);
  await flushRenderQueue();

  expect(emitPageRenderedEvent).not.toHaveBeenCalled();

  description().vm.$emit('story-rendered', ['category-descriptions/a_b/c']);
  await flushRenderQueue();

  expect(emitPageRenderedEvent).toHaveBeenCalledTimes(1);
  expect((wrapper.vm as any).loading).toBe(true);
  expect((wrapper.vm as any).isProductsLoading).toBe(true);

  description().vm.$emit('story-rendered', ['category-descriptions/a_b/c']);
  await flushRenderQueue();

  expect(emitPageRenderedEvent).toHaveBeenCalledTimes(1);

  for (const id of [2, 3]) {
    category.value = { id, url_path: `category/${id}` };
    await flushRenderQueue();
    await flushRenderQueue();
    // Missing and failed stories both report completion through this same event.

    expect(emitPageRenderedEvent).toHaveBeenCalledTimes(id - 1);

    description().vm.$emit('story-rendered', [`category-descriptions/category_${id}`]);
    await flushRenderQueue();

    expect(emitPageRenderedEvent).toHaveBeenCalledTimes(id);
  }
  category.value = { id: 4 };
  await flushRenderQueue();

  expect(description().exists()).toBe(false);
  expect(emitPageRenderedEvent).toHaveBeenCalledTimes(4);

  wrapper.destroy();
});
