import { LocalizedRoute } from '@vue-storefront/core/lib/types'
import { extendStore } from '@vue-storefront/core/helpers'
import { StorefrontModule } from '@vue-storefront/core/lib/modules'
import { forStoryblok } from 'src/modules/vsf-storyblok-module/mappingFallback'
import { mappingFallbackForUrlRewrite } from 'src/modules/url-rewrite'

export const extendUrlModule: StorefrontModule = function ({ services }) {
  const redirect = services.request.redirect;
  extendStore('url', {
    actions: {
      async mapFallbackUrl (context, payload: any): Promise<LocalizedRoute | undefined> {
        const result = await forStoryblok(context, { ...payload, redirect });
        if (result) return result;
        return mappingFallbackForUrlRewrite(context, { ...payload, redirect });
      }
    }
  });
}
