import { VueStorefrontModule } from '@vue-storefront/core/lib/module'
import { LocalizedRoute } from '@vue-storefront/core/lib/types'
import { CatalogModule } from '@vue-storefront/core/modules/catalog'
import { CatalogNextModule } from '@vue-storefront/core/modules/catalog-next'
import { CartModule } from '@vue-storefront/core/modules/cart'
import { CheckoutModule } from '@vue-storefront/core/modules/checkout'
import { NotificationModule } from '@vue-storefront/core/modules/notification'
import { UrlModule } from '@vue-storefront/core/modules/url'
import { BreadcrumbsModule } from '@vue-storefront/core/modules/breadcrumbs'
import { GoogleTagManagerModule } from 'src/modules/google-tag-manager';
import { UserModule } from '@vue-storefront/core/modules/user'
import { NewsletterModule } from '@vue-storefront/core/modules/newsletter'
import { StoryblokModule } from 'src/modules/vsf-storyblok-module'
import { forStoryblok } from 'src/modules/vsf-storyblok-module/mappingFallback'
import { extendStore } from '@vue-storefront/core/helpers'
import {
  StorefrontModule,
  registerApplicationModule,
  registerModule
} from '@vue-storefront/core/lib/modules'
import { ABTesting } from 'src/modules/a-b-testing'
import { BudsiesModule } from 'src/modules/budsies'
import { PromotionPlatformModule } from 'src/modules/promotion-platform'
import { GiftCardModule } from 'src/modules/gift-card'
import { PaymentBackendMethodsModule } from 'src/modules/payment-backend-methods'
import { PaymentAffirm } from 'src/modules/payment-affirm';
import { UrlRewriteModule, mappingFallbackForUrlRewrite } from 'src/modules/url-rewrite';
import { BackendSettings } from 'src/modules/backend-settings';
import { ErrorLoggingModule } from 'src/modules/error-logging';
import { PageLoadingIndicatorModule } from 'src/modules/page-loading-indicator';
import { MailchimpModule } from 'src/modules/mailchimp'
import { PersistedCustomerDataModule, SET_PERSISTED_CUSTOMER_EMAIL, SET_PERSISTED_CUSTOMER_PHONE_NUMBER } from 'src/modules/persisted-customer-data'
import { TrueVaultModule } from 'src/modules/true-vault';
import { OrdersHistoryModule } from 'src/modules/orders-history';
import { CurrencyModule } from 'src/modules/currency';
import { FeraModule } from 'src/modules/fera';
import { TrafficAttributionModule } from 'src/modules/traffic-attribution';

import registerStoryblokComponents from 'theme/components/storyblok'
import { KlaviyoModule, ModuleConfig } from 'src/modules/klaviyo'
import { AmazonPay } from 'src/modules/vsf-amazon-pay'

const extendUrlVuex = {
  actions: {
    async mapFallbackUrl (context, payload: any): Promise<LocalizedRoute | undefined> {
      const result = await forStoryblok(context, payload);

      if (result) {
        return result
      }

      const redirectRoute = await mappingFallbackForUrlRewrite(context, payload);

      if (redirectRoute) {
        return redirectRoute;
      }
    }
  }
}
const extendUrlModule: StorefrontModule = function ({ store }) {
  extendStore('url', extendUrlVuex);
}

// TODO:distributed across proper pages BEFORE 1.11
export function registerClientModules () {
  registerStoryblokComponents()
  registerApplicationModule(TrueVaultModule)
  registerModule(PageLoadingIndicatorModule)
  registerModule(UrlModule)
  registerModule(CatalogModule)
  registerModule(CheckoutModule) // To Checkout
  registerModule(CartModule)
  registerModule(NotificationModule)
  registerModule(UserModule) // Trigger on user icon click
  registerModule(CatalogNextModule)
  registerModule(BreadcrumbsModule)
  registerModule(NewsletterModule)
  registerModule(StoryblokModule)
  registerModule(extendUrlModule)
  registerModule(BudsiesModule)
  registerModule(GoogleTagManagerModule)
  registerApplicationModule(ABTesting)
  registerModule(PromotionPlatformModule)
  registerModule(GiftCardModule)
  registerModule(PaymentBackendMethodsModule)
  registerModule(PaymentAffirm)
  registerModule(UrlRewriteModule)
  registerModule(BackendSettings)
  registerModule(ErrorLoggingModule)
  registerModule(MailchimpModule)
  registerModule(PersistedCustomerDataModule)
  registerModule(OrdersHistoryModule)
  registerModule(CurrencyModule)
  registerApplicationModule(FeraModule)
  registerModule(AmazonPay)
  registerModule(TrafficAttributionModule)

  const klaviyoModuleConfig: ModuleConfig = {
    updateEmailMutation: SET_PERSISTED_CUSTOMER_EMAIL,
    updatePhoneNumberMutation: SET_PERSISTED_CUSTOMER_PHONE_NUMBER
  };
  registerModule(KlaviyoModule, klaviyoModuleConfig);
}

// Deprecated API, will be removed in 2.0
export const registerModules: VueStorefrontModule[] = [
  // Example
  // AmazonPay
]
