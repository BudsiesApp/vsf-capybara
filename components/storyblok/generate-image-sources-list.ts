import { ImageSourceItem } from 'src/modules/budsies';
import { BreakpointValue, MimeTypeValue } from 'src/modules/shared';

import BreakpointSpec from './interfaces/breakpoint-spec.interface';
import parseImageDimensions from './parse-image-dimensions';
import { WebpQuality, AvifQuality } from './images-quality';

export default function generateImageSourcesList (
  breakpointsSpecs: BreakpointSpec[],
  forcedAspectRation?: number
): {
    sourceItems: ImageSourceItem[],
    fallbackSourceItem: ImageSourceItem | undefined
  } {
  const webpResult: ImageSourceItem[] = [];
  const avifResult: ImageSourceItem[] = [];
  const webpFilter = `/filters:format(webp):quality(${WebpQuality})`;
  const avifFilter = `/filters:format(avif):quality(${AvifQuality})`;
  let fallbackSourceItem: ImageSourceItem | undefined;

  for (const spec of breakpointsSpecs) {
    // "https://s3.amazonaws.com/a.storyblok.com/f/109999/500x500/c01cfb137f/pet_socks.png"
    // "https://a.storyblok.com/f/109999/1080x1080/485ba42bde/petsies_homepage_images_1_.png"
    const [, resource] = spec.src.split('/a.storyblok.com');
    let dimensions = parseImageDimensions(spec.src);
    const ratio = forcedAspectRation || (dimensions.height / dimensions.width);

    const webpSourceItem: ImageSourceItem = {
      breakpoint: spec.breakpoint,
      aspectRatio: 1 / ratio,
      srcset: [],
      type: MimeTypeValue.IMAGE_WEBP
    };
    const avifSourceItem: ImageSourceItem = {
      breakpoint: spec.breakpoint,
      aspectRatio: 1 / ratio,
      srcset: [],
      type: MimeTypeValue.IMAGE_AVIF
    }

    const mobileDensityList = [1, 1.5, 2];
    const desktopDensityList = [1, 1.5, 2, 3];

    const densityList = spec.breakpoint <= BreakpointValue.SMALL
      ? mobileDensityList
      : desktopDensityList;

    if (!fallbackSourceItem || fallbackSourceItem.breakpoint < spec.breakpoint) {
      fallbackSourceItem = {
        breakpoint: spec.breakpoint,
        aspectRatio: 1 / ratio,
        srcset: []
      }
    }

    for (const density of densityList) {
      const adjustedWidth = Math.round(spec.width * density / 10) * 10;
      const adjustedHeight = Math.round(adjustedWidth * ratio);

      let mod = '/m/fit-in';
      mod += `/${adjustedWidth}x${adjustedHeight}`;

      const webpResizedUrl = 'https://sb-assets.budsies.com' + resource + mod + webpFilter;
      const avifResizedUrl = 'https://sb-assets.budsies.com' + resource + mod + avifFilter;
      const defaultResizedUrl = 'https://sb-assets.budsies.com' + resource + mod;

      webpSourceItem.srcset.push(`${webpResizedUrl}${density > 1 ? ' ' + density + 'x' : ''}`);
      avifSourceItem.srcset.push(`${avifResizedUrl}${density > 1 ? ' ' + density + 'x' : ''}`);

      if (!fallbackSourceItem) {
        continue;
      }

      fallbackSourceItem.srcset.push(`${defaultResizedUrl}${density > 1 ? ' ' + density + 'x' : ''}`)
    }

    webpResult.push(webpSourceItem);
    avifResult.push(avifSourceItem);
  }

  const result = [...avifResult, ...webpResult];

  return {
    sourceItems: result,
    fallbackSourceItem
  };
}
