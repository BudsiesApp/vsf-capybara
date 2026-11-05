import Vue from 'vue';
import { shallowMount } from '@vue/test-utils';
import ProductDescription from './m-product-description-story.vue';
import BlockStory from './m-block-story.vue';
import CategoryDescription from './m-category-description-story.vue';
import { loadStoryblokComponentGroup } from 'src/modules/vsf-storyblok-module/components';
import { getProductDescriptionStoryFullSlug } from './helpers/get-product-description-story-full-slug';

jest.mock('@vue-storefront/core/helpers', () => ({ isServer: false }));
jest.mock('src/modules/vsf-storyblok-module', () =>
  require('src/modules/vsf-storyblok-module/helpers/wait-for-storyblok-content-render.function')
);
jest.mock('src/modules/vsf-storyblok-module/components', () => ({
  components: { block: { render: h => h('div') } },
  loadStoryblokComponentGroup: jest.fn().mockResolvedValue(undefined),
  StoryblokComponentGroup: { CORE: 'core' }
}));
jest.mock('../atoms/a-custom-heading.vue', () => ({}));
jest.mock('@storefront-ui/vue', () => ({ SfHeading: {} }));

async function flushRenderQueue (): Promise<void> {
  for (let turn = 0; turn < 10; turn++) {
    await Vue.nextTick();
  }
}

const slug = getProductDescriptionStoryFullSlug;
function store (cached: string[] = []) {
  const stories = Vue.observable<Record<string, any>>(
    Object.fromEntries(cached.map(key => [key, { story: { content: {} } }]))
  );
  const requests: Record<string, (story?: any) => void> = {};
  const dispatch = jest.fn((_, { fullSlug }) => {
    if (stories[fullSlug]?.story) {
      return Promise.resolve(stories[fullSlug].story);
    }

    return new Promise(resolve => {
      requests[fullSlug] = story => {
        Vue.set(stories, fullSlug, { story });
        resolve(story);
      };
    });
  });

  return { state: { storyblok: { stories } }, dispatch, requests };
}

beforeEach(() => {
  jest.useFakeTimers();
  (loadStoryblokComponentGroup as jest.Mock).mockClear();
});
afterEach(() => {
  jest.useRealTimers();
});

it('uses captured primary and backup inputs across A/B races and reports only the current fallback', async () => {
  const storyStore = store();
  const wrapper = shallowMount(ProductDescription, {
    propsData: { productSku: 'A', backupProductSku: 'old' },
    mocks: { $store: storyStore }
  });

  await wrapper.setProps({ productSku: 'B', backupProductSku: 'new' });
  storyStore.requests[slug('A')]();
  await flushRenderQueue();

  expect(storyStore.requests[slug('old')]).toBeDefined();

  storyStore.requests[slug('B')]();
  await flushRenderQueue();

  expect(storyStore.requests[slug('new')]).toBeDefined();

  storyStore.requests[slug('new')]({ content: {} });
  storyStore.requests[slug('old')]({ content: {} });
  await flushRenderQueue();
  jest.runOnlyPendingTimers();
  await flushRenderQueue();

  expect(wrapper.emitted('story-rendered')).toEqual([[[slug('B'), slug('new')]]]);
  expect(storyStore.dispatch).toHaveBeenCalledTimes(4);

  wrapper.destroy();
});

it('reports cached fallback on mount and backup-only changes once each', async () => {
  const storyStore = store([slug('old'), slug('new')]);

  Vue.set(storyStore.state.storyblok.stories, slug('A'), { story: {} });

  const wrapper = shallowMount(ProductDescription, {
    propsData: { productSku: 'A', backupProductSku: 'old' },
    mocks: { $store: storyStore }
  });

  await flushRenderQueue();

  expect(wrapper.emitted('story-rendered')).toBeUndefined();

  jest.runOnlyPendingTimers();
  await flushRenderQueue();
  await wrapper.setProps({ backupProductSku: 'new' });
  await flushRenderQueue();
  jest.runOnlyPendingTimers();
  await flushRenderQueue();

  expect(storyStore.dispatch).toHaveBeenCalledTimes(4);
  expect(wrapper.emitted('story-rendered')).toEqual([
    [[slug('A'), slug('old')]],
    [[slug('A'), slug('new')]]
  ]);

  wrapper.destroy();
});

it('waits for the chunk when the primary request fails while a cached backup is rendered', async () => {
  let resolveChunk!: () => void;

  (loadStoryblokComponentGroup as jest.Mock).mockReturnValueOnce(
    new Promise<void>(resolve => { resolveChunk = resolve; })
  );

  const storyStore = store([slug('parent')]);

  storyStore.dispatch.mockImplementation((_, { fullSlug }) => fullSlug === slug('variant')
    ? Promise.reject(new Error('request failed'))
    : Promise.resolve(storyStore.state.storyblok.stories[fullSlug]?.story));

  const wrapper = shallowMount(ProductDescription, {
    propsData: { productSku: 'variant', backupProductSku: 'parent' },
    mocks: { $store: storyStore }
  });

  await flushRenderQueue();
  jest.runOnlyPendingTimers();
  await flushRenderQueue();

  expect(loadStoryblokComponentGroup).toHaveBeenCalled();
  expect(wrapper.emitted('story-rendered')).toBeUndefined();

  resolveChunk();
  await flushRenderQueue();
  jest.runOnlyPendingTimers();
  await flushRenderQueue();

  expect(wrapper.emitted('story-rendered')).toEqual([[[slug('variant')]]]);

  wrapper.destroy();
});

it('reports changed block slugs including cached stories without duplicate dispatch', async () => {
  const storyStore = store(['blocks/cached']);
  const wrapper = shallowMount(BlockStory, {
    propsData: { storySlug: 'first' },
    mocks: { $store: storyStore }
  });

  storyStore.requests['blocks/first']();
  await flushRenderQueue();
  await wrapper.setProps({ storySlug: 'cached' });
  await flushRenderQueue();

  expect(wrapper.emitted('story-rendered')).toHaveLength(1);

  jest.runOnlyPendingTimers();
  await flushRenderQueue();

  expect(wrapper.emitted('story-rendered')).toEqual([[['blocks/first']], [['blocks/cached']]]);
  expect(storyStore.dispatch).toHaveBeenCalledTimes(2);

  wrapper.destroy();
});

it('reloads effective category paths with the existing normalization', async () => {
  const storyStore = store(['category-descriptions/a_b', 'category-descriptions/c_d']);
  const wrapper = shallowMount(CategoryDescription, {
    propsData: { category: { url_path: 'a/b' } },
    mocks: { $store: storyStore, $t: value => value }
  });

  await flushRenderQueue();
  jest.runOnlyPendingTimers();
  await flushRenderQueue();
  await wrapper.setProps({ category: { url_path: 'c/d' } });
  await flushRenderQueue();
  jest.runOnlyPendingTimers();
  await flushRenderQueue();

  expect(wrapper.emitted('story-rendered')).toEqual([
    [['category-descriptions/a_b']],
    [['category-descriptions/c_d']]
  ]);

  await wrapper.setProps({ category: {} });
  await flushRenderQueue();

  expect(wrapper.emitted('story-rendered')).toHaveLength(2);
  expect(storyStore.dispatch).toHaveBeenCalledTimes(2);

  wrapper.destroy();
});
