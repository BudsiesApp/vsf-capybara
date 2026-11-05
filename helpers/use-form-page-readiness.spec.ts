import Vue, { ref } from 'vue';
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
