const ErrorPage = () =>
  import(/* webpackChunkName: "vsf-error" */ 'theme/pages/Error');
const Checkout = () =>
  import(/* webpackChunkName: "vsf-checkout" */ 'theme/pages/Checkout');
const DetailedCart = () =>
  import(/* webpackChunkName: "vsf-detailed-cart" */ 'theme/pages/DetailedCart');
const MyAccount = () =>
  import(/* webpackChunkName: "vsf-my-account" */ 'theme/pages/MyAccount');
const CartRecovery = () =>
  import(/* webpackChunkName: "vsf-cart-recovery" */ 'theme/pages/CartRecovery');
const KeychainQuote = () =>
  import(/* webpackChunkName: "vsf-keychain-quote" */ 'theme/pages/KeychainQuote');
const PillowQuote = () =>
  import(/* webpackChunkName: "vsf-pillow-quote" */ 'theme/pages/PillowQuote');
const BulkQuote = () =>
  import(/* webpackChunkName: "vsf-bulk-quote" */ 'theme/pages/BulkQuote');
const BulkorderConfirmation = () =>
import(/* webpackChunkName: "vsf-bulkorder-confirmation" */ 'theme/pages/BulkorderConfirmation');
const BulkorderQuotation = () =>
import(/* webpackChunkName: "vsf-bulkorder-quotation" */ 'theme/pages/BulkorderQuotation');
const CustomizableProduct = () =>
  import(/* webpackChunkName: "vsf-customizable-product" */ 'theme/pages/CustomizableProduct');
const PasswordReset = () =>
  import(/* webpackChunkName: "vsf-password-reset" */ 'theme/pages/PasswordReset');

function makeRoutesStrict (routes) {
  return routes.map((route) => {
    route.pathToRegexpOptions = {
      strict: true
    }

    return route;
  })
}

let routes = [
  { name: 'detailed-cart', path: '/checkout/cart/', component: DetailedCart },
  {
    name: 'checkout',
    path: '/checkout/onepage/:success?/',
    component: Checkout,
    props: true
  },
  {
    name: 'url-rewrite',
    path: '/stub',
    beforeEnter: (to, from, next) => {
      next(to.params.targetPath);
    }
  },
  { name: 'my-account', path: '/my-account/', component: MyAccount },
  { name: 'page-not-found', path: '*', component: ErrorPage },
  { name: 'error', path: '/error/', component: ErrorPage, meta: { layout: 'minimal' } },
  { name: 'recover-cart', path: '/alerts/recover/cart/id/:id/code/:code/', component: CartRecovery },
  {
    name: 'plush-sample',
    path: '/bulk-samples/create/',
    component: CustomizableProduct,
    props: (route) => {
      return {
        sku: 'CustomBulkSample_bundle',
        existingPlushieId: route.query.existingPlushieId,
        layout: 'vertical'
      }
    }
  },
  {
    name: 'pillow-sample',
    path: '/bulk-pillow-samples/create/',
    component: CustomizableProduct,
    props: (route) => {
      return {
        sku: 'pillowBulkSample_bundle',
        existingPlushieId: route.query.existingPlushieId,
        layout: 'vertical'
      }
    }
  },
  {
    name: 'keychain-sample',
    path: '/bulk-keychain-samples/create/',
    component: CustomizableProduct,
    props: (route) => {
      return {
        sku: 'keychainBulkSample_bundle',
        existingPlushieId: route.query.existingPlushieId,
        layout: 'vertical'
      }
    }
  },
  {
    name: 'plush-sample-alias-1',
    path: '/plushie/index/create/id/:plushieId/type/bulk-sample/',
    redirect: (route) => {
      return {
        name: 'plush-sample',
        query: {
          existingPlushieId: route.params.plushieId
        }
      }
    }
  },
  {
    name: 'pillow-sample-alias-1',
    path: '/plushie/index/create/id/:plushieId/type/bulk-pillow-sample/',
    redirect: (route) => {
      return {
        name: 'pillow-sample',
        query: {
          existingPlushieId: route.params.plushieId
        }
      }
    }
  },
  {
    name: 'keychain-sample-alias-1',
    path: '/plushie/index/create/id/:plushieId/type/bulk-keychain-sample/',
    redirect: (route) => {
      return {
        name: 'keychain-sample',
        query: {
          existingPlushieId: route.params.plushieId
        }
      }
    }
  },
  {
    name: 'keychain-quote',
    path: '/keychain-quote/',
    component: KeychainQuote
  },
  {
    name: 'pillow-quote',
    path: '/pillow-quote/',
    component: PillowQuote
  },
  {
    name: 'bulk-quote',
    path: '/bulk-quote/',
    component: BulkQuote
  },
  {
    name: 'bulkorder-confirmation',
    path: '/bulkorder/confirmation/',
    component: BulkorderConfirmation
  },
  {
    name: 'bulkorder-quotation',
    path: '/bulkorder/quotation/:bulkorderId/',
    component: BulkorderQuotation,
    props: (route) => {
      return {
        bulkorderId: +route.params.bulkorderId
      }
    }
  },
  {
    name: 'bulkorder-quotation-alias',
    path: '/bulkorder/quote/index/bulkorder_id/:bulkorderId/',
    redirect: (route) => {
      return {
        name: 'bulkorder-quotation',
        params: {
          bulkorderId: +route.params.bulkorderId
        }
      }
    }
  },
  {
    name: 'password-reset',
    path: '/customer/account/resetpassword/',
    component: PasswordReset,
    props: (route) => ({
      id: route.query.id,
      token: route.query.token
    })
  }
];

routes = makeRoutesStrict(routes);

export default routes;
