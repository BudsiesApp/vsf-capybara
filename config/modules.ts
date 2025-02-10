import { VueStorefrontModule } from '@vue-storefront/core/lib/module'
import { CatalogModule } from '@vue-storefront/core/modules/catalog'
import { CatalogNextModule } from '@vue-storefront/core/modules/catalog-next'
import { CartModule } from '@vue-storefront/core/modules/cart'
import { CheckoutModule } from '@vue-storefront/core/modules/checkout'
import { NotificationModule } from '@vue-storefront/core/modules/notification'
import { UrlModule } from '@vue-storefront/core/modules/url'
import { GoogleTagManagerModule } from 'src/modules/google-tag-manager';
import { UserModule } from '@vue-storefront/core/modules/user'
import { StoryblokModule } from 'src/modules/vsf-storyblok-module'
import { registerModule } from '@vue-storefront/core/lib/modules'
import { PaymentBackendMethodsModule } from 'src/modules/payment-backend-methods'
import { PaymentAffirm } from 'src/modules/payment-affirm';
import { BackendSettings } from 'src/modules/backend-settings';
import { ErrorLoggingModule } from 'src/modules/error-logging';
import { PageLoadingIndicatorModule } from 'src/modules/page-loading-indicator';
import { TrueVaultModule } from 'src/modules/true-vault';

import registerStoryblokComponents from 'theme/components/storyblok'

// TODO:distributed across proper pages BEFORE 1.11
export function registerClientModules () {
  registerStoryblokComponents()
  registerModule(TrueVaultModule)
  registerModule(PageLoadingIndicatorModule)
  registerModule(UrlModule)
  registerModule(CatalogModule)
  registerModule(CheckoutModule) // To Checkout
  registerModule(CartModule)
  registerModule(NotificationModule)
  registerModule(UserModule) // Trigger on user icon click
  registerModule(CatalogNextModule)
  registerModule(StoryblokModule)
  registerModule(GoogleTagManagerModule)
  registerModule(PaymentBackendMethodsModule)
  registerModule(PaymentAffirm)
  registerModule(BackendSettings)
  registerModule(ErrorLoggingModule)
}

// Deprecated API, will be removed in 2.0
export const registerModules: VueStorefrontModule[] = [
  // Example
  // AmazonPay
]
