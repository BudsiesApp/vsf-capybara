import parseImageDimensions from './parse-image-dimensions';
import { WebpQuality } from './images-quality';

export default function getResizedImageUrl (
  imageUrl: string,
  width: number
): string {
  const filters = `/filters:format(webp):quality(${WebpQuality})`;

  // "https://s3.amazonaws.com/a.storyblok.com/f/109999/500x500/c01cfb137f/pet_socks.png"
  // "https://a.storyblok.com/f/109999/1080x1080/485ba42bde/petsies_homepage_images_1_.png"
  const [, resource] = imageUrl.split('/a.storyblok.com');
  let dimensions = parseImageDimensions(imageUrl);
  const ratio = dimensions.height / dimensions.width;

  const height = Math.round(width * ratio);

  let mod = '/m/fit-in';
  mod += `/${width}x${height}`;
  mod += filters;

  const resizedUrl = 'https://a.storyblok.com' + resource + mod;

  return resizedUrl;
}
