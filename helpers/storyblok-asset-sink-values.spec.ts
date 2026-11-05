import {
  buildPinterestShareUrl,
  resolveStoryblokAssetFields
} from './storyblok-asset-sink-values';

jest.mock('src/modules/vsf-storyblok-module', () => ({
  resolveStoryblokAssetUrl: (url: string) => url.replace(
    'a.storyblok.com',
    'sb-assets.budsies.com'
  )
}));

describe('Storyblok theme asset sink values', () => {
  it('normalizes gallery assets without mutating their CMS values', () => {
    const assets = [{
      filename: 'https://a.storyblok.com/f/1/file.png',
      alt: 'Image'
    }] as any;

    expect(resolveStoryblokAssetFields(assets)).toEqual([{
      filename: 'https://sb-assets.budsies.com/f/1/file.png',
      alt: 'Image'
    }]);
    expect(assets[0].filename).toContain('a.storyblok.com');
  });

  it('correctly encodes all Pinterest query parameters', () => {
    expect(buildPinterestShareUrl(
      'https://sb-assets.budsies.com/f/1/file.png?version=1',
      'A description & more',
      'https://www.budsies.com/page?a=1&b=2'
    )).toBe(
      'https://pinterest.com/pin/create/button/?media=https%3A%2F%2Fsb-assets.budsies.com%2Ff%2F1%2Ffile.png%3Fversion%3D1' +
      '&description=A%20description%20%26%20more&url=https%3A%2F%2Fwww.budsies.com%2Fpage%3Fa%3D1%26b%3D2'
    );
  });
});
