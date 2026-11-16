import Vue from 'vue';
import { mount } from '@vue/test-utils';
import StoryMixin from './story';
import { Logger } from '@vue-storefront/core/lib/logger';
import { loadStoryblokComponentGroup } from 'src/modules/vsf-storyblok-module/components';

jest.mock('@vue-storefront/core/lib/logger', () => ({
  Logger: { error: jest.fn(() => jest.fn()) }
}));

jest.mock('@vue-storefront/core/helpers', () => ({ isServer: false }));
jest.mock('src/modules/vsf-storyblok-module', () =>
  require('src/modules/vsf-storyblok-module/helpers/wait-for-storyblok-content-render.function')
);
jest.mock('src/modules/vsf-storyblok-module/components', () => ({
  loadStoryblokComponentGroup: jest.fn().mockResolvedValue(undefined),
  StoryblokComponentGroup: { CORE: 'core' }
}));

const loader = loadStoryblokComponentGroup as jest.Mock;
async function flushRenderQueue (): Promise<void> {
  for (let turn = 0; turn < 10; turn++) {
    await Vue.nextTick();
  }
}

const deferred = () => {
  let resolveDeferred!: (value?: any) => void;
  const promise = new Promise<any>(resolve => {
    resolveDeferred = resolve;
  });

  return { promise, resolve: resolveDeferred };
};

function harness (cached = false) {
  const stories = Vue.observable<Record<string, any>>(
    cached ? { A: { story: { content: {} } } } : {}
  );
  const requests: Record<string, ReturnType<typeof deferred>> = {};
  const dispatch = jest.fn((_, { fullSlug }) => {
    if (stories[fullSlug]?.story) {
      return Promise.resolve(stories[fullSlug].story);
    }

    const request = (requests[fullSlug] = deferred());

    return request.promise.then(story => {
      Vue.set(stories, fullSlug, { story });

      return story;
    });
  });
  const Component = StoryMixin.extend({
    props: { slug: { type: String, default: 'A' } },
    computed: {
      storyFullSlug(): string {
        return this.slug;
      }
    },
    render: h => h('div')
  });
  const wrapper = mount(Component, {
    mocks: { $store: { state: { storyblok: { stories } }, dispatch } }
  });

  return { wrapper, requests, dispatch };
}

beforeEach(() => {
  jest.useFakeTimers();
  loader.mockClear().mockResolvedValue(undefined);
});
afterEach(() => {
  jest.useRealTimers();
});

it('waits for the first chunk, render flush and timer before notifying once', async () => {
  const chunk = deferred();

  loader.mockReturnValue(chunk.promise);

  const storyHarness = harness();

  storyHarness.requests.A.resolve({ content: {} });
  await flushRenderQueue();

  expect(storyHarness.wrapper.emitted('story-rendered')).toBeUndefined();

  chunk.resolve();
  await flushRenderQueue();

  expect(storyHarness.wrapper.emitted('story-rendered')).toBeUndefined();

  jest.runOnlyPendingTimers();
  await flushRenderQueue();

  expect(storyHarness.wrapper.emitted('story-rendered')).toEqual([[['A']]]);

  storyHarness.wrapper.destroy();
});

it('reports missing stories without group loading', async () => {
  const storyHarness = harness();

  storyHarness.requests.A.resolve(undefined);
  await flushRenderQueue();

  expect(loader).not.toHaveBeenCalled();
  expect(storyHarness.wrapper.emitted('story-rendered')).toEqual([[['A']]]);

  storyHarness.wrapper.destroy();
});

it('logs a rejected request and reports without group loading', async () => {
  const storyHarness = harness();

  storyHarness.requests.A.resolve(undefined);
  await flushRenderQueue();
  loader.mockClear();

  const error = new Error('failed');

  storyHarness.dispatch.mockRejectedValueOnce(error);
  await storyHarness.wrapper.vm.loadStory();

  expect(Logger.error).toHaveBeenCalledWith(error, 'storyblok');
  expect(loader).not.toHaveBeenCalled();
  expect(storyHarness.wrapper.emitted('story-rendered')?.[1]).toEqual([['A']]);

  storyHarness.wrapper.destroy();
});

it('uses the rendering boundary for cached mount through the cached action', async () => {
  const storyHarness = harness(true);

  await flushRenderQueue();

  expect(storyHarness.dispatch).toHaveBeenCalledTimes(1);
  expect(storyHarness.wrapper.emitted('story-rendered')).toBeUndefined();

  jest.runOnlyPendingTimers();
  await flushRenderQueue();

  expect(storyHarness.wrapper.emitted('story-rendered')).toEqual([[['A']]]);

  storyHarness.wrapper.destroy();
});

it.each(['request', 'chunk', 'timer'])(
  'suppresses A superseded during its %s wait',
  async stage => {
    const chunk = deferred();

    loader.mockReturnValueOnce(chunk.promise).mockResolvedValue(undefined);

    const storyHarness = harness();

    if (stage !== 'request') {
      storyHarness.requests.A.resolve({ content: {} });
      await flushRenderQueue();

      if (stage === 'timer') {
        chunk.resolve();
        await flushRenderQueue();
      }
    }

    await storyHarness.wrapper.setProps({ slug: 'B' });
    storyHarness.requests.B.resolve({ content: {} });

    if (stage === 'request') {
      storyHarness.requests.A.resolve({ content: {} });
    }

    chunk.resolve();
    await flushRenderQueue();
    jest.runOnlyPendingTimers();
    await flushRenderQueue();

    expect(storyHarness.wrapper.emitted('story-rendered')).toEqual([[['B']]]);

    storyHarness.wrapper.destroy();
  }
);
