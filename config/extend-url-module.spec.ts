import { extendStore } from '@vue-storefront/core/helpers';
import { forStoryblok } from 'src/modules/vsf-storyblok-module/mappingFallback';
import { mappingFallbackForUrlRewrite } from 'src/modules/url-rewrite';
import { extendUrlModule } from './extend-url-module';

jest.mock('@vue-storefront/core/helpers', () => ({ extendStore: jest.fn() }));
jest.mock('src/modules/vsf-storyblok-module/mappingFallback', () => ({ forStoryblok: jest.fn() }));
jest.mock('src/modules/url-rewrite', () => ({ mappingFallbackForUrlRewrite: jest.fn() }));

it('binds each application redirect and preserves fallback order and results', async () => {
  const story = forStoryblok as jest.Mock;
  const rewrite = mappingFallbackForUrlRewrite as jest.Mock;
  const extend = extendStore as jest.Mock;
  const redirects = [jest.fn(), jest.fn(), undefined];
  const actions = redirects.map(redirect => {
    extendUrlModule({ services: { request: { redirect } } } as any);
    return extend.mock.calls[extend.mock.calls.length - 1][1].actions.mapFallbackUrl;
  });
  const payload = { url: '/old', params: {} };
  for (let i = 0; i < actions.length; i++) {
    story.mockResolvedValueOnce(undefined);
    rewrite.mockResolvedValueOnce({ name: 'rewrite' });
    expect(await actions[i]({}, payload)).toEqual({ name: 'rewrite' });
    expect(story).toHaveBeenLastCalledWith({}, { ...payload, redirect: redirects[i] });
    expect(rewrite).toHaveBeenLastCalledWith({}, { ...payload, redirect: redirects[i] });
    expect(story.mock.invocationCallOrder[i]).toBeLessThan(rewrite.mock.invocationCallOrder[i]);
  }
  story.mockResolvedValueOnce({ name: 'story' });
  expect(await actions[0]({}, payload)).toEqual({ name: 'story' });
  expect(rewrite).toHaveBeenCalledTimes(3);
});
