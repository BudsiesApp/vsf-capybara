import parseImageDimensions from './parse-image-dimensions';
import { WebpQuality } from './images-quality';
import { buildStoryblokImageUrl } from 'src/modules/vsf-storyblok-module';

export default function getResizedImageUrl (
  imageUrl: string,
  width: number
): string {
  const filters = `/filters:format(webp):quality(${WebpQuality})`;

  const dimensions = parseImageDimensions(imageUrl);
  const ratio = dimensions.height / dimensions.width;

  const height = Math.round(width * ratio);

  let mod = '/m/fit-in';
  mod += `/${width}x${height}`;
  mod += filters;

  return buildStoryblokImageUrl(imageUrl, mod);
}
