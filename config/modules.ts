import { VueStorefrontModule } from '@vue-storefront/core/lib/module'
import { CatalogNextModule } from '@vue-storefront/core/modules/catalog-next'
import { NotificationModule } from '@vue-storefront/core/modules/notification'
import { UrlModule } from '@vue-storefront/core/modules/url'
import { StoryblokModule } from 'src/modules/vsf-storyblok-module'
import { registerModule } from '@vue-storefront/core/lib/modules'
import { BackendSettings } from 'src/modules/backend-settings';
import { ErrorLoggingModule } from 'src/modules/error-logging';
import { PageLoadingIndicatorModule } from 'src/modules/page-loading-indicator';

import registerStoryblokComponents from 'theme/components/storyblok'

// TODO:distributed across proper pages BEFORE 1.11
export function registerClientModules () {
  registerStoryblokComponents()
  registerModule(PageLoadingIndicatorModule)
  registerModule(UrlModule)
  registerModule(NotificationModule)
  registerModule(CatalogNextModule)
  registerModule(StoryblokModule)
  registerModule(BackendSettings)
  registerModule(ErrorLoggingModule)
}

// Deprecated API, will be removed in 2.0
export const registerModules: VueStorefrontModule[] = [
  // Example
  // AmazonPay
]
