import { BreakpointValue } from 'src/modules/shared/types/breakpoint.value';
import { MimeTypeValue } from 'src/modules/shared/types/mime-type.value';

import generateImageSourcesList from './generate-image-sources-list';
import getResizedImageUrl from './get-resized-image-url';
import parseImageDimensions from './parse-image-dimensions';

jest.mock('src/modules/vsf-storyblok-module', () => {
  const assetUrl = jest.requireActual(
    'src/modules/vsf-storyblok-module/helpers/storyblok-asset-url'
  );

  return assetUrl;
});

jest.mock('src/modules/budsies', () => ({}));

const canonical = 'https://a.storyblok.com/f/109999/500x250/hash/image.png';
const legacy = 'https://s3.amazonaws.com/a.storyblok.com/f/109999/500x250/hash/image.png';
const proxied = 'https://sb-assets.budsies.com/f/109999/500x250/hash/image.png';

describe('Storyblok responsive image URLs', () => {
  it.each([canonical, legacy, proxied])('parses dimensions from %s', (url) => {
    expect(parseImageDimensions(url)).toEqual({ width: 500, height: 250 });
  });

  it.each([canonical, legacy, proxied])('resizes %s with the existing WebP policy', (url) => {
    expect(getResizedImageUrl(url, 200)).toBe(
      'https://sb-assets.budsies.com/f/109999/500x250/hash/image.png/m/fit-in/200x100/filters:format(webp):quality(75)'
    );
  });

  it.each([canonical, legacy, proxied])('preserves source generation policy for %s', (url) => {
    const result = generateImageSourcesList([{
      breakpoint: BreakpointValue.SMALL,
      width: 100,
      src: url
    }]);

    expect(result.sourceItems).toEqual([
      {
        breakpoint: BreakpointValue.SMALL,
        aspectRatio: 2,
        srcset: [
          'https://sb-assets.budsies.com/f/109999/500x250/hash/image.png/m/fit-in/100x50/filters:format(avif):quality(55)',
          'https://sb-assets.budsies.com/f/109999/500x250/hash/image.png/m/fit-in/150x75/filters:format(avif):quality(55) 1.5x',
          'https://sb-assets.budsies.com/f/109999/500x250/hash/image.png/m/fit-in/200x100/filters:format(avif):quality(55) 2x'
        ],
        type: MimeTypeValue.IMAGE_AVIF
      },
      {
        breakpoint: BreakpointValue.SMALL,
        aspectRatio: 2,
        srcset: [
          'https://sb-assets.budsies.com/f/109999/500x250/hash/image.png/m/fit-in/100x50/filters:format(webp):quality(75)',
          'https://sb-assets.budsies.com/f/109999/500x250/hash/image.png/m/fit-in/150x75/filters:format(webp):quality(75) 1.5x',
          'https://sb-assets.budsies.com/f/109999/500x250/hash/image.png/m/fit-in/200x100/filters:format(webp):quality(75) 2x'
        ],
        type: MimeTypeValue.IMAGE_WEBP
      }
    ]);
    expect(result.fallbackSourceItem?.srcset).toEqual([
      'https://sb-assets.budsies.com/f/109999/500x250/hash/image.png/m/fit-in/100x50',
      'https://sb-assets.budsies.com/f/109999/500x250/hash/image.png/m/fit-in/150x75 1.5x',
      'https://sb-assets.budsies.com/f/109999/500x250/hash/image.png/m/fit-in/200x100 2x'
    ]);
  });
});
