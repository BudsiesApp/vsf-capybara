import Vue from 'vue';
import { mount } from '@vue/test-utils';
import { readFileSync } from 'fs';
import { join } from 'path';
import { StorageManager } from '@vue-storefront/core/lib/storage-manager';
import { i18nInjectionKey } from '@vue-storefront/core/application-services';
import { isStoryblokPreview } from 'src/modules/vsf-storyblok-module/helpers/is-storyblok-preview.function';
import Video from './Video.vue';
import HomepageIntroSection from './HomepageIntroSection.vue';
import Html from './Html.vue';

jest.mock('@vue-storefront/core/helpers', () => ({ isServer: false }));
jest.mock('@vue-storefront/core/lib/storage-manager', () => ({ StorageManager: { get: jest.fn() } }));
jest.mock('src/modules/vsf-storyblok-module/helpers/is-storyblok-preview.function', () => ({ isStoryblokPreview: jest.fn() }));
jest.mock('src/modules/vsf-storyblok-module/components', () => ({
  Blok: jest.requireActual('src/modules/vsf-storyblok-module/components/Blok').default
}));
jest.mock('src/modules/vsf-storyblok-module', () => ({
  ...jest.requireActual('src/modules/vsf-storyblok-module/helpers/storyblok-asset-url'),
  Blok: jest.requireActual('src/modules/vsf-storyblok-module/components/Blok').default
}));
jest.mock('src/modules/budsies', () => ({ BaseImage: { render: (h: any) => h('img', { class: 'fallback' }) }, nl2br: (text: string) => text }));
jest.mock('src/modules/shared', () => ({
  BreakpointValue: { SMALL: 767 }, StreamingVideo: { render: (h: any) => h('iframe') }
}));
jest.mock('@storefront-ui/vue', () => ({ SfHeading: { render: (h: any) => h('div') } }));

const flush = async () => { await Vue.nextTick(); await Promise.resolve(); await Vue.nextTick(); };
const asset = (id: number, filename = `/video-${id}.mp4`) => ({
  asset: { id, filename }, aspect_ratio: 2,
  options: { autoplay: false, muted: false, loop: false, display_controls: true }
});
const introItem = (mobile = true) => ({
  title: 'Title', image: { filename: '/fallback.jpg' }, mobile_image: { filename: '' },
  background_color: {}, text_color: {}, background_video: asset(1),
  mobile_background_video: mobile ? asset(2) : undefined
});
const stubs = { 'editor-block-icons': true, 'sb-router-link': true };

describe('video playback consumers', () => {
  const getItem = jest.fn();
  const setItem = jest.fn();
  let pause: jest.SpyInstance;
  let play: jest.SpyInstance;
  let query: { matches: boolean, addEventListener: jest.Mock, removeEventListener: jest.Mock };
  let change: () => void;
  const options = () => ({
    stubs,
    provide: {
      [i18nInjectionKey as symbol]: { t: (text: string) => text },
      WindowObject: { matchMedia: () => query },
      componentWidthCalculator: { getBreakpoints: () => ({}), getWidths: () => ({}) }
    }
  });
  beforeEach(() => {
    jest.clearAllMocks();
    getItem.mockResolvedValue(null);
    (StorageManager.get as jest.Mock).mockReturnValue({ getItem, setItem });
    (isStoryblokPreview as jest.Mock).mockReturnValue(false);
    play = jest.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    pause = jest.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    query = {
      matches: true,
      addEventListener: jest.fn((_event, listener) => { change = listener; }),
      removeEventListener: jest.fn()
    };
  });
  afterEach(() => { pause.mockRestore(); play.mockRestore(); });

  it.each([[true, false, true], [true, true, false], [false, true, false], [false, false, false]])(
    'uploaded autoplay=%s controls=%s button=%s', async (autoplay, controls, expected) => {
      const wrapper = mount(Video, { ...options(), propsData: {
        item: { video: { ...asset(1), options: { autoplay, display_controls: controls } } }
      } });
      await flush();
      expect(wrapper.find('button').exists()).toBe(expected);
      expect(wrapper.find('video').element.autoplay).toBe(autoplay);
      expect(wrapper.find('video').element.controls).toBe(controls);
      wrapper.destroy();
    }
  );

  it('excludes embedded video', () => {
    const wrapper = mount(Video, { ...options(), propsData: {
      item: { video: { video_id: 'id', provider: 'youtube', options: { autoplay: true } } }
    } });
    expect(wrapper.find('button').exists()).toBe(false);
    expect(wrapper.find('iframe').exists()).toBe(true);
    wrapper.destroy();
  });

  it('selects responsive identities with fixed autoplay and retains the fallback image', async () => {
    const wrapper = mount(HomepageIntroSection, { ...options(), propsData: { item: introItem() } });
    await flush();
    expect(getItem).toHaveBeenLastCalledWith('asset:id:1');
    expect(wrapper.find('img.fallback').exists()).toBe(true);
    const video = wrapper.find('video').element;
    expect([video.autoplay, video.muted, video.loop, video.playsInline, video.controls]).toEqual([true, true, true, true, false]);
    expect(wrapper.find('button').classes()).toEqual(expect.arrayContaining(['-desktop-video', '-mobile-video']));
    query.matches = false;
    change();
    await flush();
    expect(getItem).toHaveBeenLastCalledWith('asset:id:2');
    expect(wrapper.find('video').attributes('src')).toBe('/video-2.mp4');
    query.matches = true;
    change();
    await flush();
    expect(getItem).toHaveBeenLastCalledWith('asset:id:1');
    wrapper.destroy();
    expect(query.removeEventListener).toHaveBeenCalledWith('change', change);
  });

  it('keeps configuration-derived button existence/classes with an image-only mobile breakpoint', async () => {
    query.matches = false;
    const wrapper = mount(HomepageIntroSection, { ...options(), propsData: { item: introItem(false) } });
    await flush();
    expect(wrapper.find('video').exists()).toBe(false);
    expect(wrapper.find('button').classes()).toContain('-desktop-video');
    expect(wrapper.find('button').classes()).not.toContain('-mobile-video');
    expect(wrapper.find('img.fallback').exists()).toBe(true);
    expect(getItem).not.toHaveBeenCalled();
    wrapper.destroy();
  });

  it.each([
    ['https://a.storyblok.com/f/1/video.mp4', 'https://sb-assets.budsies.com/f/1/video.mp4'],
    ['https://s3.amazonaws.com/a.storyblok.com/f/1/video.mp4', 'https://sb-assets.budsies.com/f/1/video.mp4'],
    ['https://example.com/video.mp4', 'https://example.com/video.mp4']
  ])('normalizes intro asset output %s in client and preview updates', async (source, expected) => {
    for (const preview of [false, true]) {
      (isStoryblokPreview as jest.Mock).mockReturnValue(preview);
      const wrapper = mount(HomepageIntroSection, { ...options(), propsData: {
        item: { ...introItem(), background_video: asset(1, source) }
      } });
      await flush();
      expect(wrapper.find('video').attributes('src')).toBe(expected);
      expect(wrapper.find('video').attributes('src')).not.toMatch(/a\.storyblok\.com|s3\.amazonaws\.com/);
      await wrapper.setProps({ item: { ...introItem(), background_video: asset(3, source + '?updated=1') } });
      await flush();
      expect(wrapper.find('video').attributes('src')).toBe(expected + '?updated=1');
      wrapper.destroy();
    }
  });

  it('shows preview controls without preference access and includes pointer rules for Vue and Curator', async () => {
    (isStoryblokPreview as jest.Mock).mockReturnValue(true);
    const wrappers = [
      mount(Video, { ...options(), propsData: { item: { video: { ...asset(1), options: { autoplay: true } } } } }),
      mount(HomepageIntroSection, { ...options(), propsData: { item: introItem() } }),
      mount(Html, { ...options(), propsData: { item: { html: '<div id="curator-feed-preview"><div class="crt-video-container"><video></video></div></div><script></script>' } } })
    ];
    await flush();
    for (const wrapper of wrappers) {
      expect(wrapper.classes()).toContain('-editor-preview-mode');
      expect(wrapper.find('button').exists()).toBe(true);
      await wrapper.find('button').trigger('click');
    }
    expect(StorageManager.get).not.toHaveBeenCalled();
    for (const name of ['Video', 'HomepageIntroSection', 'Html']) {
      const source = readFileSync(join(__dirname, `${name}.vue`), 'utf8');
      expect(source).toMatch(/&\.-editor-preview-mode[\s\S]*pointer-events: none/);
      expect(source).toContain(name === 'Html' ? '._script-container' : '.video-playback-toggle');
    }
    wrappers.forEach(wrapper => wrapper.destroy());
  });
});
