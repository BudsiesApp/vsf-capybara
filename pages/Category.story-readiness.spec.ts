import Vue from 'vue';
import VueRouter from 'vue-router';
import { shallowMount } from '@vue/test-utils';
import { useStore } from '@vue-storefront/core/application-services';
import { emitPageRenderedEvent } from 'src/modules/shared';
import store from '@vue-storefront/core/store';
import { mappingFallbackForUrlRewrite } from 'src/modules/url-rewrite';
import { serverHarness } from '@vue-storefront/core/scripts/utils/test/unit/fixtures/output-cache';
import { catalogHooksExecutors } from '@vue-storefront/core/modules/catalog-next/hooks';
import { beforeEachGuard } from '@vue-storefront/core/modules/url/router/beforeEach';

import Page from './Category.vue';
import ErrorPage from './Error.vue';

jest.mock('@vue-storefront/core/application-services', () => ({
  useStore: jest.fn(),
  useI18n: () => ({ t: (value: string) => value })
}));
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
  routerHelper: { popStateDetected: false },
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
  catalogHooksExecutors: { categoryPageVisited: jest.fn() }
}));
jest.mock('theme/helpers', () => ({
  __esModule: true,
  default: {},
  getTopLevelCategories: jest.fn(() => ({})),
  prepareCategoryMenuItem: jest.fn(() => ({})),
  prepareCategoryProduct: jest.fn(() => ({}))
}));
jest.mock('query-string', () => ({ __esModule: true, default: {} }));
jest.mock('@vue-storefront/core/store', () => ({ __esModule: true, default: {} }));
jest.mock('@vue-storefront/core/app', () => ({}));
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
jest.mock('theme/components/molecules/m-error', () => ({ __esModule: true, default: {} }));
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

describe('missing category navigation', () => {
  const route = { path: '/c/missing/', params: { slug: 'missing' }, query: { page: '2' } };
  const from = { name: 'home', path: '/' };
  let dispatch: jest.Mock;

  beforeEach(() => {
    dispatch = jest.fn().mockResolvedValue(null);
    (catalogHooksExecutors.categoryPageVisited as jest.Mock).mockClear();
    Object.assign(store, { getters: { 'category-next/getCategoryFrom': () => null }, dispatch });
    (mappingFallbackForUrlRewrite as jest.Mock).mockImplementation(async (context, payload) => {
      const rewrite = await context.dispatch('urlRewrite/loadUrlRewrite', { requestPath: payload.url });
      return rewrite ? { name: 'rewrite', params: { targetPath: rewrite.targetPath } } : undefined;
    });
  });

  it('selects page-not-found once without loading products for browser entry and hydration', async () => {
    for (const origin of [from, { name: undefined }]) {
      const next = jest.fn();
      await (Page as any).beforeRouteEnter(route, origin, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({ name: 'page-not-found', params: { pathMatch: '/page-not-found/' } });
    }
    expect(dispatch.mock.calls.map(call => call[0])).toEqual([
      'category-next/loadCategory', 'urlRewrite/loadUrlRewrite',
      'category-next/loadCategory', 'urlRewrite/loadUrlRewrite'
    ]);
    expect(catalogHooksExecutors.categoryPageVisited).not.toHaveBeenCalled();
  });

  it('preserves rewrites and routes lookup failures to the error page', async () => {
    dispatch.mockImplementation(async action => action === 'urlRewrite/loadUrlRewrite' ? { targetPath: 'target' } : null);
    const next = jest.fn();
    await (Page as any).beforeRouteEnter(route, from, next);
    expect(next).toHaveBeenCalledWith({ name: 'rewrite', params: { targetPath: 'target' } });
    expect(next).toHaveBeenCalledTimes(1);

    dispatch.mockRejectedValue(new Error('lookup failed'));
    next.mockClear();
    await (Page as any).beforeRouteEnter(route, from, next);
    expect(next).toHaveBeenCalledWith({ name: 'error' });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('does not load products when switching to a missing category', async () => {
    const next = jest.fn();
    const vm = { onCategoryChangedHandler: jest.fn() };
    await (Page as any).beforeRouteUpdate.call(vm, route, { ...from, params: { slug: 'present' } }, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith({ name: 'page-not-found', params: { pathMatch: '/page-not-found/' } });
    expect(vm.onCategoryChangedHandler).not.toHaveBeenCalled();
  });

  it('finishes actual router navigation without re-entering the missing category', async () => {
    Vue.use(VueRouter);
    const router = new VueRouter({ mode: 'abstract', routes: [
      { path: '/c/:slug/', name: 'category', component: Page as any },
      { path: '*', name: 'page-not-found', component: ErrorPage as any }
    ] });
    const mappings = jest.fn(beforeEachGuard);
    router.beforeEach(mappings);
    const completed = new Promise<void>(resolve => router.afterEach(() => resolve()));
    router.push(route.path).catch(() => {});
    await completed;
    expect(router.currentRoute.name).toBe('page-not-found');
    expect(dispatch.mock.calls.filter(call => call[0] === 'category-next/loadCategory')).toHaveLength(1);
    expect(mappings).toHaveBeenCalledTimes(2);
  });

  it('loads products for an existing category even when its result is empty', async () => {
    const category = { id: 42 };
    (store as any).getters['category-next/getCategoryFrom'] = () => category;
    dispatch.mockResolvedValue({ items: [], total: 0 });
    const next = jest.fn();
    await (Page as any).beforeRouteEnter({ ...route, query: {} }, from, next);
    expect(dispatch).toHaveBeenCalledWith('category-next/loadCategoryProducts', expect.objectContaining({ category }));
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toEqual(expect.any(Function));
  });

  it('resolves SSR misses before selecting a page, but does not replace a recorded rewrite with 404', async () => {
    const helpers = require('@vue-storefront/core/helpers');
    helpers.isServer = true;
    try {
      const next = jest.fn();
      await (Page as any).beforeRouteEnter(route, { name: undefined }, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({ name: 'page-not-found', params: { pathMatch: '/page-not-found/' } });

      dispatch.mockImplementation(async action => action === 'urlRewrite/loadUrlRewrite' ? { targetPath: 'target' } : null);
      (mappingFallbackForUrlRewrite as jest.Mock).mockImplementation(async context => {
        await context.dispatch('urlRewrite/loadUrlRewrite', {});
        return undefined;
      });
      next.mockClear();
      await (Page as any).beforeRouteEnter(route, { name: undefined }, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(undefined);

      dispatch.mockRejectedValue(new Error('backend failure'));
      next.mockClear();
      await (Page as any).beforeRouteEnter(route, { name: undefined }, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith({ name: 'error' });
    } finally {
      helpers.isServer = false;
    }
  });

  it('does not cache a missing SSR response, allowing a newly indexed category to load', async () => {
    const helpers = require('@vue-storefront/core/helpers');
    helpers.isServer = true;
    let indexed = false;
    const harness = serverHarness(async context => {
      (store as any).getters['category-next/getCategoryFrom'] = () => indexed ? { id: 42 } : null;
      let destination;
      await (Page as any).beforeRouteEnter(route, { name: undefined }, value => { destination = value; });
      if (destination) {
        await (ErrorPage as any).asyncData({ route: destination, context });
        return "We can't find the page";
      }
      return 'Category';
    });
    try {
      const missing = await harness.visit(route.path);
      expect(missing.statusCode).toBe(404);
      expect(missing.body).toContain("We can't find the page");
      expect(missing.get('location')).toBeUndefined();
      expect(missing.get('x-vs-cache-tags')).toContain('no-cache');
      expect(harness.cache.set).not.toHaveBeenCalled();

      indexed = true;
      const found = await harness.visit(route.path);
      expect(found.statusCode).toBe(200);
      expect(found.body).toContain('Category');
    } finally {
      helpers.isServer = false;
    }
  });
});
