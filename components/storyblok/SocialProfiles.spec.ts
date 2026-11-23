import { shallowMount } from '@vue/test-utils';
import StoryblokSocialProfiles from './SocialProfiles.vue';
import { GET_SOCIAL_PROFILES_GETTER } from 'src/modules/social-profiles';

jest.mock('../social-profiles.vue', () => ({ name: 'SocialProfiles', props: { iconSet: String } }));
jest.mock('src/modules/social-profiles/store', () => ({ module: {} }));
jest.mock('src/modules/vsf-storyblok-module/components', () => ({
  Blok: jest.requireActual('src/modules/vsf-storyblok-module/components/Blok').default
}));

const mountBlock = (item: Record<string, unknown> = {}, profiles: unknown[] = [{}]) => shallowMount(StoryblokSocialProfiles, {
  propsData: { item: { _uid: 'test', ...item } },
  mocks: { $store: { getters: { [GET_SOCIAL_PROFILES_GETTER]: profiles } } },
  stubs: ['editor-block-icons']
});

describe('Storyblok social profiles', () => {
  it('defaults to circled icons, text color, medium sizes and left alignment', () => {
    const wrapper = mountBlock();
    const list = wrapper.findComponent({ name: 'SocialProfiles' });
    expect(list.props('iconSet')).toBe('circled');
    expect(wrapper.attributes('style')).toContain('--social-profiles-color: var(--c-text)');
    expect(wrapper.attributes('style')).toContain('--social-profiles-desktop-size: 32px');
    expect(wrapper.attributes('style')).toContain('--social-profiles-mobile-size: 32px');
    expect(wrapper.attributes('style')).toContain('--social-profiles-justify-items: flex-start');
    expect(wrapper.attributes('style')).toContain('--social-profiles-margin: 0 auto 0 0');
  });

  it('maps appearance and standard styles, with mobile size inheriting desktop', () => {
    const wrapper = mountBlock({
      icon_set: 'plain', color: { color: '#123456' }, desktop_size: 'large', alignment: 'right',
      css_classes: 'custom-class', display: 'mobile-only', spacing_settings: { margin_top: 12 }
    });
    expect(wrapper.findComponent({ name: 'SocialProfiles' }).props('iconSet')).toBe('plain');
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['custom-class', '-align-right', '-mobile-only']));
    expect(wrapper.attributes('style')).toContain('margin-top: 12px');
    expect(wrapper.attributes('style')).toContain('--social-profiles-color: #123456');
    expect(wrapper.attributes('style')).toContain('--social-profiles-desktop-size: 42px');
    expect(wrapper.attributes('style')).toContain('--social-profiles-mobile-size: 42px');
    expect(wrapper.attributes('style')).toContain('--social-profiles-justify-items: flex-end');
    expect(wrapper.attributes('style')).toContain('--social-profiles-margin: 0 0 0 auto');
  });

  it('uses the selected mobile size', () => {
    const wrapper = mountBlock({ desktop_size: 'large', mobile_size: 'small', alignment: 'center' });
    expect(wrapper.attributes('style')).toContain('--social-profiles-mobile-size: 16px');
    expect(wrapper.attributes('style')).toContain('--social-profiles-desktop-size: 42px');
    expect(wrapper.attributes('style')).toContain('--social-profiles-justify-items: center');
    expect(wrapper.attributes('style')).toContain('--social-profiles-margin: 0 auto');
  });

  it('omits the whole wrapper and its spacing when no profiles are shown', () => {
    const wrapper = mountBlock({ spacing_settings: { margin_top: 30 } }, []);
    expect(wrapper.html()).toBe('');
  });
});
