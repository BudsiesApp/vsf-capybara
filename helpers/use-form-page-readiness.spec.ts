import Vue, { computed, ref } from 'vue';
import Vuex from 'vuex';
import { mount } from '@vue/test-utils';
import { useFormPageReadiness } from './use-form-page-readiness';

jest.mock('src/modules/vsf-storyblok-module', () =>
  require('src/modules/vsf-storyblok-module/composables/use-storyblok-readiness-tracker')
);

it.each([true, false])(
  'combines either completion order, retains stories across keys and accepts later form content (story first: %s)',
  async storyFirst => {
    const trackingKey = ref<string | undefined>('A');
    const storyDependencies = ref(['top']);
    const onReady = jest.fn();
    let signals!: ReturnType<typeof useFormPageReadiness>;
    const wrapper = mount(
      Vue.extend({
        setup() {
          signals = useFormPageReadiness(trackingKey, storyDependencies, onReady);

          return {};
        },
        render: h => h('div')
      })
    );
    const first = () => (storyFirst ? signals.onStoryRendered('top') : signals.onFormReady());
    const second = () => (storyFirst ? signals.onFormReady() : signals.onStoryRendered('top'));

    first();
    await Vue.nextTick();

    expect(onReady).not.toHaveBeenCalled();

    second();
    await Vue.nextTick();

    expect(onReady).toHaveBeenCalledTimes(1);

    signals.onStoryRendered('top');
    await Vue.nextTick();

    expect(onReady).toHaveBeenCalledTimes(1);

    signals.onFormReady();

    expect(onReady).toHaveBeenCalledTimes(2);

    trackingKey.value = 'B';
    await Vue.nextTick();

    expect(onReady).toHaveBeenCalledTimes(2);

    signals.onFormReady();

    expect(onReady).toHaveBeenCalledTimes(3);

    storyDependencies.value = ['top', 'new'];
    await Vue.nextTick();

    expect(onReady).toHaveBeenCalledTimes(3);

    signals.onStoryRendered('new');
    await Vue.nextTick();

    expect(onReady).toHaveBeenCalledTimes(4);

    storyDependencies.value = [];
    await Vue.nextTick();

    expect(onReady).toHaveBeenCalledTimes(5);

    storyDependencies.value = ['top'];
    await Vue.nextTick();

    expect(onReady).toHaveBeenCalledTimes(5);

    signals.onStoryRendered('top');
    await Vue.nextTick();

    expect(onReady).toHaveBeenCalledTimes(6);

    wrapper.destroy();
  }
);

it('requires a defined key and mount while an absent top story completes from the form signal', async () => {
  const trackingKey = ref<string | undefined>(undefined);
  const storyDependencies = ref<string[]>([]);
  const onReady = jest.fn();
  let signals!: ReturnType<typeof useFormPageReadiness>;
  const wrapper = mount(
    Vue.extend({
      setup() {
        signals = useFormPageReadiness(trackingKey, storyDependencies, onReady);
        signals.onFormReady();

        expect(onReady).not.toHaveBeenCalled();

        return {};
      },
      render: h => h('div')
    })
  );

  await Vue.nextTick();

  expect(onReady).not.toHaveBeenCalled();

  trackingKey.value = 'A';
  await Vue.nextTick();

  expect(onReady).not.toHaveBeenCalled();

  signals.onFormReady();

  expect(onReady).toHaveBeenCalledTimes(1);

  wrapper.destroy();
});

it('keeps computed inputs over Vuex getters fresh after the store rebuilds its getters', async () => {
  Vue.use(Vuex);

  const store = new Vuex.Store({
    modules: {
      product: {
        namespaced: true,
        state: { current: { sku: 'A' } },
        getters: { current: state => state.current },
        mutations: {
          setCurrent (state, product) {
            state.current = product;
          }
        }
      }
    }
  });
  const onReady = jest.fn();
  let trackingKey!: { value: string | undefined };
  let signals!: ReturnType<typeof useFormPageReadiness>;
  const wrapper = mount(
    Vue.extend({
      setup() {
        trackingKey = computed(() => store.getters['product/current']?.sku);
        signals = useFormPageReadiness(trackingKey, ref([]), onReady);

        return {};
      },
      render: h => h('div')
    })
  );

  signals.onFormReady();
  await Vue.nextTick();

  expect(onReady).toHaveBeenCalledTimes(1);

  store.registerModule('lazy', { state: {} });
  // A later reader, such as a mapGetters computed during render, evaluates the rebuilt getter
  // and subscribes it after the readiness watchers' existing subscriptions.
  expect(store.getters['product/current'].sku).toBe('A');
  await Vue.nextTick();
  store.commit('product/setCurrent', { sku: 'B' });
  await Vue.nextTick();

  expect(trackingKey.value).toBe('B');

  signals.onFormReady();
  await Vue.nextTick();

  expect(onReady).toHaveBeenCalledTimes(2);

  wrapper.destroy();
});
