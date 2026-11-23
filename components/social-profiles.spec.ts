import { shallowMount } from '@vue/test-utils';
import Vue from 'vue';
import SocialProfiles from './social-profiles.vue';
import { normalizeSocialProfiles } from 'src/modules/social-profiles/normalize';
import { GET_SOCIAL_PROFILES_GETTER } from 'src/modules/social-profiles';

const state = Vue.observable({ profiles: [] as any[] });
const getters = {
  get [GET_SOCIAL_PROFILES_GETTER] () {
    return state.profiles;
  }
};
jest.mock('@vue-storefront/core/application-services', () => ({
  useStore: () => ({ getters })
}));
jest.mock('@vue-storefront/core/lib/multistore', () => ({ currentStoreView: () => ({ name: 'Petsies' }) }));
jest.mock('@storefront-ui/vue', () => ({ SfIcon: { name: 'SfIcon', props: ['icon', 'size'] } }));
jest.mock('src/modules/social-profiles/store', () => ({ module: {} }));
jest.mock('../assets/social-icons/circled/facebook.svg', () => '<svg data-icon="circled-facebook"><path fill="#fff"/></svg>');
jest.mock('../assets/social-icons/circled/instagram.svg', () => '<svg data-icon="circled-instagram"><path fill="#fff"/></svg>');
jest.mock('../assets/social-icons/circled/pinterest.svg', () => '<svg data-icon="circled-pinterest"><path fill="#fff"/></svg>');
jest.mock('../assets/social-icons/circled/tiktok.svg', () => '<svg data-icon="circled-tiktok"><path fill="#fff"/></svg>');
jest.mock('../assets/social-icons/circled/x.svg', () => '<svg data-icon="circled-x"><path fill="#fff"/></svg>');
jest.mock('../assets/social-icons/circled/youtube.svg', () => '<svg data-icon="circled-youtube"><circle stroke="#fff"/><path fill="#fff"/></svg>');
jest.mock('../assets/social-icons/plain/facebook.svg', () => '<svg data-icon="plain-facebook"><path fill="#fff"/></svg>');
jest.mock('../assets/social-icons/plain/instagram.svg', () => '<svg data-icon="plain-instagram"><path fill="#fff"/></svg>');
jest.mock('../assets/social-icons/plain/pinterest.svg', () => '<svg data-icon="plain-pinterest"><path fill="#fff"/></svg>');
jest.mock('../assets/social-icons/plain/tiktok.svg', () => '<svg data-icon="plain-tiktok"><path fill="#fff"/></svg>');
jest.mock('../assets/social-icons/plain/x.svg', () => '<svg data-icon="plain-x"><path fill="#fff"/></svg>');
jest.mock('../assets/social-icons/plain/youtube.svg', () => '<svg data-icon="plain-youtube" fill="#fff"><path/></svg>');

const translate = (template: string, values: Record<string, string> = {}) => {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key]);
};

describe('social profiles component', () => {
  beforeEach(() => {
    state.profiles = [];
  });
  it('renders nothing without profiles', () => {
    const wrapper = shallowMount(SocialProfiles, { mocks: { $t: translate } });
    expect(wrapper.find('a').exists()).toBe(false);
  });
  it('renders accessible social links', () => {
    const networks = ['facebook', 'instagram', 'pinterest', 'tiktok', 'x', 'youtube'];
    const counts = [0, 1250, null, 1250, 1250, 1250];
    state.profiles = normalizeSocialProfiles(networks.map((network, id) => ({
      id,
      position: id,
      network,
      profile_url: `https://example.com/${network}`,
      is_enabled: true,
      display_subscribers: true,
      subscribers_count: counts[id]
    })));
    const wrapper = shallowMount(SocialProfiles, {
      propsData: { iconSet: 'circled' },
      mocks: { $t: translate }
    });
    const links = wrapper.findAll('a');
    expect(links.length).toBe(6);
    links.wrappers.forEach(link => {
      expect(link.find('.social-profiles__icon').attributes('aria-hidden')).toBe('true');
      expect(link.attributes('rel')).toBe('noopener noreferrer');
    });
    expect(links.at(0).attributes('aria-label')).toBe('Petsies Facebook page, opens in new tab');
    expect(links.at(0).find('.social-profiles__count').exists()).toBe(false);
    expect(links.at(2).find('.social-profiles__count').exists()).toBe(false);
    expect(links.at(2).attributes('aria-label')).toBe('Petsies Pinterest page, opens in new tab');
    [1, 3, 4, 5].forEach(index => {
      const count = links.at(index).find('.social-profiles__count');
      const icon = count.findComponent({ name: 'SfIcon' });
      expect(count.findAllComponents({ name: 'SfIcon' }).length).toBe(1);
      expect(icon.props('icon')).toBe('profile_fill');
      expect(icon.props('size')).toBe('0.85em');
      expect(icon.attributes('aria-hidden')).toBe('true');
    });
    expect(links.at(1).attributes('aria-label'))
      .toBe('Petsies Instagram page, 1.2K followers, opens in new tab');
    expect(links.at(5).find('.social-profiles__count').text()).toBe('1.2K');
    expect(links.at(5).attributes('aria-label'))
      .toBe('Petsies YouTube page, 1.2K subscribers, opens in new tab');
  });

  it('updates when the profile getter changes', async () => {
    const wrapper = shallowMount(SocialProfiles, { mocks: { $t: translate } });
    state.profiles = normalizeSocialProfiles([{
      id: 1,
      position: 0,
      network: 'instagram',
      profile_url: 'https://example.com/instagram',
      is_enabled: true,
      subscribers_count: 1250
    }]);

    await Vue.nextTick();

    expect(wrapper.find('a').attributes('aria-label'))
      .toBe('Petsies Instagram page, 1.2K followers, opens in new tab');
  });

  it.each(['circled', 'plain'])('renders the %s icons with currentColor', iconSet => {
    state.profiles = normalizeSocialProfiles([
      { id: 1, position: 0, network: 'youtube', profile_url: 'https://example.com/youtube', is_enabled: true, subscribers_count: 1250 },
      { id: 2, position: 1, network: 'facebook', profile_url: 'https://example.com/facebook', is_enabled: true, subscribers_count: null }
    ]);
    const wrapper = shallowMount(SocialProfiles, { propsData: { iconSet }, mocks: { $t: translate } });
    const links = wrapper.findAll('a');
    const svg = links.at(0).find('svg');
    expect(svg.attributes('data-icon')).toBe(`${iconSet}-youtube`);
    expect(svg.html()).not.toContain('#fff');
    expect(svg.html()).toContain('currentColor');
    expect(links.at(0).find('img').exists()).toBe(false);
  });
});
