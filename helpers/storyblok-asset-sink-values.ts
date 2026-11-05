import { resolveStoryblokAssetUrl } from 'src/modules/vsf-storyblok-module';
import AssetField from 'src/modules/vsf-storyblok-module/types/asset-field.interface';

export function resolveStoryblokAssetFields (assets: AssetField[]): AssetField[] {
  return assets.map((asset) => ({
    ...asset,
    filename: resolveStoryblokAssetUrl(asset.filename)
  }));
}

export function buildPinterestShareUrl (
  image: string,
  description: string,
  url: string
): string {
  return `https://pinterest.com/pin/create/button/?media=${encodeURIComponent(image)}` +
    `&description=${encodeURIComponent(description)}&url=${encodeURIComponent(url)}`;
}
