import Vue from 'vue';
import { mount } from '@vue/test-utils';
import { i18nInjectionKey } from '@vue-storefront/core/application-services';
import { StorageManager } from '@vue-storefront/core/lib/storage-manager';
import Html from '../components/storyblok/Html.vue';
import { enhanceCuratorVideos } from './enhance-curator-videos';

jest.mock('@vue-storefront/core/helpers', () => ({ isServer: false }));
jest.mock('@vue-storefront/core/lib/storage-manager', () => ({ StorageManager: { get: jest.fn() } }));
jest.mock('src/modules/vsf-storyblok-module/components', () => ({
  Blok: jest.requireActual('src/modules/vsf-storyblok-module/components/Blok').default
}));
jest.mock('src/modules/vsf-storyblok-module/helpers/is-storyblok-preview.function', () => ({ isStoryblokPreview: () => false }));

const flush = async () => { await Vue.nextTick(); await Promise.resolve(); await Vue.nextTick(); };
const post = '<div class="crt-video-container"><span class="crt-play" role="button">play video</span><video></video></div>';
const feedHtml = (id = 'one') => `<div id="curator-feed-${id}">${post}</div>`;
const videos = (container: Element) => Array.from(container.querySelectorAll('video'));
const labels = (paused: boolean) => paused ? 'translated:Play video' : 'translated:Pause video';

describe('Curator playback enhancement', () => {
  let container: HTMLElement;
  let dispose: (() => void) | undefined;
  let pause: jest.SpyInstance;
  let play: jest.SpyInstance;
  const getItem = jest.fn();
  const setItem = jest.fn();
  beforeEach(() => {
    jest.resetAllMocks();
    getItem.mockResolvedValue(null);
    (StorageManager.get as jest.Mock).mockReturnValue({ getItem, setItem });
    container = document.createElement('div');
    document.body.appendChild(container);
    pause = jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (this: HTMLVideoElement) {
      Object.defineProperty(this, 'paused', { configurable: true, value: true });
      this.dispatchEvent(new Event('pause'));
    });
    play = jest.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLVideoElement) {
      Object.defineProperty(this, 'paused', { configurable: true, value: false });
      this.dispatchEvent(new Event('play'));
      return Promise.resolve();
    });
  });
  afterEach(() => {
    dispose?.();
    dispose = undefined;
    container.remove();
    pause.mockRestore();
    play.mockRestore();
  });

  it('observes initial, added and re-rendered videos once and leaves original controls/popup clicks intact', async () => {
    container.innerHTML = feedHtml();
    const original = container.querySelector('.crt-play');
    const popup = jest.fn();
    container.addEventListener('click', popup);
    dispose = enhanceCuratorVideos(container, labels, false);
    expect(container.querySelectorAll('button')).toHaveLength(1);
    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-label')).toBe('translated:Play video');
    expect(button.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    button.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(popup).not.toHaveBeenCalled();
    expect(button.getAttribute('aria-label')).toBe('translated:Pause video');
    original?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(popup).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.crt-play')).toBe(original);
    const feed = container.firstElementChild as HTMLElement;
    feed.insertAdjacentHTML('beforeend', post);
    await flush();
    expect(container.querySelectorAll('button')).toHaveLength(2);
    feed.firstElementChild?.remove();
    feed.insertAdjacentHTML('afterbegin', post);
    await flush();
    expect(container.querySelectorAll('button')).toHaveLength(2);
    expect(videos(container).every(video => video.hasAttribute('data-video-playback-toggle'))).toBe(true);
  });

  it('uses current feed members for pause/resume, applies choices to additions and synchronously rejects autoplay', async () => {
    container.innerHTML = feedHtml();
    dispose = enhanceCuratorVideos(container, labels, false);
    await flush();
    const first = videos(container)[0];
    void first.play();
    const removed = document.createElement('video');
    removed.setAttribute('data-video-playback-toggle', '');
    container.firstElementChild?.appendChild(removed);
    removed.remove();
    container.firstElementChild?.insertAdjacentHTML('beforeend', post);
    await flush();
    const second = videos(container)[1];
    void second.play();
    pause.mockClear();
    (container.querySelector('button') as HTMLButtonElement).click();
    expect(first.paused).toBe(true);
    expect(second.paused).toBe(true);
    expect(pause.mock.instances).not.toContain(removed);
    expect(setItem).toHaveBeenLastCalledWith('curator:curator-feed-one', 'paused');
    void first.play();
    expect(first.paused).toBe(true);
    container.firstElementChild?.insertAdjacentHTML('beforeend', post);
    await flush();
    const third = videos(container)[2];
    expect(pause.mock.instances).toContain(third);
    void third.play();
    expect(third.paused).toBe(true);
    (container.querySelector('button') as HTMLButtonElement).click();
    expect(videos(container).every(video => !video.paused)).toBe(true);
    expect(setItem).toHaveBeenLastCalledWith('curator:curator-feed-one', 'playing');
  });

  it('reconciles early playback after a deferred paused read and enforces later play immediately', async () => {
    let resolveRead = (_value: string) => {};
    getItem.mockReturnValue(new Promise(resolve => { resolveRead = resolve; }));
    container.innerHTML = feedHtml();
    dispose = enhanceCuratorVideos(container, labels, false);
    const video = videos(container)[0];
    void video.play();
    expect(video.paused).toBe(false);
    resolveRead('paused');
    await flush();
    expect(video.paused).toBe(true);
    void video.play();
    expect(video.paused).toBe(true);
    expect(setItem).not.toHaveBeenCalled();
  });

  it('lets newer user choices win over a pending read and isolates feed identities', async () => {
    let resolveRead = (_value: string) => {};
    getItem.mockImplementation(key => key.endsWith('one')
      ? new Promise(resolve => { resolveRead = resolve; }) : Promise.resolve('paused'));
    container.innerHTML = feedHtml() + feedHtml('two');
    dispose = enhanceCuratorVideos(container, labels, false);
    (container.querySelector('button') as HTMLButtonElement).click();
    resolveRead('paused');
    await flush();
    expect(videos(container)[0].paused).toBe(false);
    expect(videos(container)[1].paused).toBe(true);
    expect(getItem.mock.calls.map(call => call[0])).toEqual(['curator:curator-feed-one', 'curator:curator-feed-two']);
    void videos(container)[1].play();
    expect(videos(container)[1].paused).toBe(true);
    expect(videos(container)[0].paused).toBe(false);
  });

  it('does nothing for missing or changed Curator markup', async () => {
    container.innerHTML = '<video></video><div id="curator-feed-one"><div class="changed"><video></video></div></div>';
    dispose = enhanceCuratorVideos(container, labels, false);
    await flush();
    expect(container.querySelector('button')).toBeNull();
    expect(StorageManager.get).not.toHaveBeenCalled();
  });

  it('mounts Html with observation before snippet execution and disposes before replacement, clear and destroy', async () => {
    const pending: ((value: string) => void)[] = [];
    getItem.mockImplementation(() => new Promise(resolve => pending.push(resolve)));
    const observe = jest.spyOn(MutationObserver.prototype, 'observe');
    const disconnect = jest.spyOn(MutationObserver.prototype, 'disconnect');
    const replace = jest.spyOn(Node.prototype, 'replaceChild');
    const wrapper = mount(Html, {
      propsData: { item: { html: feedHtml() + '<script data-snippet="yes">window.snippet = true;</script>' } },
      stubs: { 'editor-block-icons': true },
      provide: { [i18nInjectionKey as symbol]: { t: (text: string) => text } }
    });
    await flush();
    expect(wrapper.find('button').exists()).toBe(true);
    expect(observe.mock.invocationCallOrder[0]).toBeLessThan(replace.mock.invocationCallOrder[0]);
    expect(wrapper.find('script').attributes('data-snippet')).toBe('yes');
    const old = wrapper.find('video').element;
    void old.play();
    await wrapper.setProps({ item: { html: feedHtml('two') + '<script></script>' } });
    expect(disconnect).toHaveBeenCalledTimes(1);
    pending[0]('paused');
    await flush();
    expect(old.paused).toBe(false);
    const current = wrapper.find('video').element;
    void current.play();
    await wrapper.setProps({ item: { html: '<p>plain content</p>' } });
    pending[1]('paused');
    await flush();
    expect(current.paused).toBe(false);
    expect(wrapper.find('._script-container').element.children).toHaveLength(0);
    expect(wrapper.find('._no-script-html').text()).toBe('plain content');
    await wrapper.setProps({ item: { html: feedHtml('three') + '<script></script>' } });
    const last = wrapper.find('video').element;
    void last.play();
    const retiredContainer = wrapper.find('._script-container').element;
    wrapper.destroy();
    pending[2]('paused');
    retiredContainer.innerHTML = feedHtml('after-destroy');
    await flush();
    expect(last.paused).toBe(false);
    expect(retiredContainer.querySelector('button')).toBeNull();
    expect(disconnect).toHaveBeenCalledTimes(3);
    observe.mockRestore();
    disconnect.mockRestore();
    replace.mockRestore();
  });
});
