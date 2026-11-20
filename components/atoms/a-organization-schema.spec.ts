import { shallowMount } from '@vue/test-utils';
import OrganizationSchema from './a-organization-schema.vue';
import { normalizeSocialProfiles } from 'src/modules/social-profiles/normalize';
import { GET_SOCIAL_PROFILES_GETTER } from 'src/modules/social-profiles';

let profiles: any[] = [];
jest.mock('@vue-storefront/core/application-services', () => ({
  useStore: () => ({ getters: { [GET_SOCIAL_PROFILES_GETTER]: profiles } }),
  useRoute: () => ({ path: '/' })
}));
jest.mock('@vue-storefront/core/request-services', () => ({
  useRequestServices: () => ({ host: 'example.com' })
}));
jest.mock('@vue-storefront/core/lib/multistore', () => ({ currentStoreView: () => ({ name: 'Petsies' }) }));
jest.mock('src/modules/social-profiles/store', () => ({ module: {} }));
jest.mock('config', () => ({ seo: { defaultDescription: 'Description', defaultTitle: 'Title' } }));

describe('organization schema', () => {
  it('omits sameAs when there are no profiles', () => {
    profiles = [];
    const wrapper = shallowMount(OrganizationSchema);
    expect(JSON.parse((wrapper.vm as any).schemaDataString)['@graph'][0].sameAs).toBeUndefined();
  });
  it('serializes ordered profile URLs safely for a script element', () => {
    profiles = [
      { url: 'https://example.com/</script>' },
      { url: 'https://example.com/second' }
    ];
    const wrapper = shallowMount(OrganizationSchema);
    const json = (wrapper.vm as any).schemaDataString;
    expect(json).not.toContain('<');
    expect(JSON.parse(json)['@graph'][0].sameAs).toEqual([
      'https://example.com/</script>',
      'https://example.com/second'
    ]);
  });
  it('keeps a zero-count profile in sameAs', () => {
    profiles = normalizeSocialProfiles([{
      id: 1,
      position: 0,
      network: 'x',
      profile_url: 'https://example.com/x',
      is_enabled: true,
      display_subscribers: true,
      subscribers_count: 0
    }]);
    const wrapper = shallowMount(OrganizationSchema);
    expect(JSON.parse((wrapper.vm as any).schemaDataString)['@graph'][0].sameAs)
      .toEqual(['https://example.com/x']);
  });
});
