import { parseStoryblokAssetUrl } from 'src/modules/vsf-storyblok-module';

interface Dimensions {
  height: number,
  width: number
}

export default function parseImageDimensions (storyblokUrl: string): Dimensions {
  const asset = parseStoryblokAssetUrl(storyblokUrl);

  if (!asset) {
    return { width: NaN, height: NaN };
  }

  const dimensionsString = asset.pathname.split('/')[3] || '';

  const dimensions = dimensionsString.split('x');

  return {
    width: parseInt(dimensions[0]),
    height: parseInt(dimensions[1])
  }
}
