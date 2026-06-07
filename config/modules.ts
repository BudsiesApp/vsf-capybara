import { VueStorefrontModule } from '@vue-storefront/core/lib/module'
import { CatalogNextModule } from '@vue-storefront/core/modules/catalog-next'
import { NotificationModule } from '@vue-storefront/core/modules/notification'
import { UrlModule } from '@vue-storefront/core/modules/url'
import { StoryblokModule } from 'src/modules/vsf-storyblok-module'
import { registerModule } from '@vue-storefront/core/lib/modules'
import { ABTesting } from 'src/modules/a-b-testing'
import { BackendSettings } from 'src/modules/backend-settings';
import { ErrorLoggingModule } from 'src/modules/error-logging';
import { PageLoadingIndicatorModule } from 'src/modules/page-loading-indicator';
import { TrueVaultModule } from 'src/modules/true-vault';
import { OrdersHistoryModule } from 'src/modules/orders-history';
import { CurrencyModule } from 'src/modules/currency';
import { FeraModule } from 'src/modules/fera';
import { TrafficAttributionModule } from 'src/modules/traffic-attribution';

import registerStoryblokComponents from 'theme/components/storyblok'

// TODO:distributed across proper pages BEFORE 1.11
export function registerClientModules () {
  registerStoryblokComponents()
  registerModule(TrueVaultModule)
  registerModule(PageLoadingIndicatorModule)
  registerModule(UrlModule)
  registerModule(NotificationModule)
  registerModule(CatalogNextModule)
  registerModule(StoryblokModule)
  registerModule(ABTesting)
  registerModule(BackendSettings)
  registerModule(ErrorLoggingModule)
  registerModule(OrdersHistoryModule)
  registerModule(CurrencyModule)
  registerModule(FeraModule)
  registerModule(TrafficAttributionModule)
}

// Deprecated API, will be removed in 2.0
export const registerModules: VueStorefrontModule[] = [
  // Example
  // AmazonPay
]
