import Vue from 'vue';
import { mount } from '@vue/test-utils';
import { i18nInjectionKey } from '@vue-storefront/core/application-services';
import { StorageManager } from '@vue-storefront/core/lib/storage-manager';
import MSubmitAnimator from './m-submit-animator.vue';

jest.mock('@vue-storefront/core/helpers', () => ({ isServer: false }));
jest.mock('@vue-storefront/core/lib/storage-manager', () => ({ StorageManager: { get: jest.fn() } }));
const flush = async () => { await Vue.nextTick(); await Promise.resolve(); await Vue.nextTick(); };

it('keeps progress independent of paused video and shares the choice across filenames and mounts', async () => {
  jest.useFakeTimers();
  const choices = new Map();
  const getItem = jest.fn(async key => choices.get(key));
  const setItem = jest.fn(async (key, value) => choices.set(key, value));
  (StorageManager.get as jest.Mock).mockReturnValue({ getItem, setItem });
  const pause = jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (this: HTMLVideoElement) {
    Object.defineProperty(this, 'paused', { configurable: true, value: true });
    this.dispatchEvent(new Event('pause'));
  });
  const options = {
    attrs: { style: 'display: none;' },
    propsData: {
      steps: [{ text: 'first', value: 50 }, { text: 'second', value: 100 }],
      duration: 100, animationUrl: '/first.mp4'
    },
    provide: { [i18nInjectionKey as symbol]: { t: (text: string) => text } }
  };
  const wrapper = mount(MSubmitAnimator, options);
  await flush();
  expect(wrapper.isVisible()).toBe(false);
  const video = wrapper.find('video').element;
  expect([video.autoplay, video.loop, video.muted, video.playsInline, video.controls]).toEqual([true, true, true, true, false]);
  expect(typeof wrapper.vm.runProgress).toBe('function');
  Object.defineProperty(video, 'paused', { configurable: true, value: false });
  video.dispatchEvent(new Event('play'));
  await Vue.nextTick();
  expect(wrapper.find('button').attributes('aria-label')).toBe('Pause video');
  const progress = wrapper.vm.runProgress();
  await wrapper.find('button').trigger('click');
  expect(video.paused).toBe(true);
  expect(setItem).toHaveBeenCalledWith('animation:loading_animation', 'paused');
  jest.advanceTimersByTime(50);
  await flush();
  expect(wrapper.find('._calculation-steps').text()).toBe('second');
  jest.advanceTimersByTime(50);
  await progress;
  await flush();
  expect(wrapper.find('._inner').attributes('style')).toContain('100%');
  await wrapper.setProps({ animationUrl: '/replacement.mp4' });
  expect(wrapper.find('source').attributes('src')).toBe('/replacement.mp4');
  expect(getItem).toHaveBeenCalledTimes(1);
  expect(video.paused).toBe(true);
  wrapper.destroy();
  pause.mockClear();
  const remounted = mount(MSubmitAnimator, { ...options, propsData: { ...options.propsData, animationUrl: '/another.mp4' } });
  await flush();
  expect(getItem).toHaveBeenLastCalledWith('animation:loading_animation');
  expect(pause).toHaveBeenCalledTimes(1);
  expect(remounted.find('button').attributes('aria-label')).toBe('Play video');
  remounted.destroy();
  pause.mockRestore();
  jest.useRealTimers();
});
