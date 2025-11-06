import { PageName } from 'theme/pages/page-name';

const ErrorPage = () =>
  import(/* webpackChunkName: "vsf-error" */ 'theme/pages/Error');
const Checkout = () =>
  import(/* webpackChunkName: "vsf-checkout" */ 'theme/pages/Checkout');
const DetailedCart = () =>
  import(/* webpackChunkName: "vsf-detailed-cart" */ 'theme/pages/DetailedCart');

const Auth = () =>
  import(/* webpackChunkName: "vsf-authorization" */ 'theme/pages/Authorization/Auth');
const SignIn = () =>
  import(/* webpackChunkName: "vsf-authorization" */ 'theme/pages/Authorization/SignIn');
const SignUp = () =>
  import(/* webpackChunkName: "vsf-authorization" */ 'theme/pages/Authorization/SignUp');

const MyAccount = () =>
  import(/* webpackChunkName: "vsf-my-account" */ 'theme/pages/MyAccount');
const AccountOrdersHistory = () =>
  import(/* webpackChunkName: "vsf-my-account" */ 'theme/components/organisms/o-my-account-orders-history');
const AccountProfile = () =>
  import(/* webpackChunkName: "vsf-my-account" */ 'theme/components/organisms/o-my-account-profile');
const AddressBook = () =>
  import(/* webpackChunkName: "vsf-my-account" */ 'theme/pages/MyAccount/AddressBook.vue');
const AddressEdit = () =>
  import(/* webpackChunkName: "vsf-my-account" */'theme/pages/MyAccount/AddressEdit.vue');
const AddressAdd = () =>
  import(/* webpackChunkName: "vsf-my-account" */'theme/pages/MyAccount/AddressAdd.vue');
const AddressesList = () =>
  import(/* webpackChunkName: "vsf-my-account" */'theme/pages/MyAccount/AddressesList.vue');

const CartRecovery = () =>
  import(/* webpackChunkName: "vsf-cart-recovery" */ 'theme/pages/CartRecovery');
const PasswordReset = () =>
  import(/* webpackChunkName: "vsf-password-reset" */ 'theme/pages/PasswordReset');
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
const OrderItemsBulkCustomize = () =>
  import(/* webpackChunkName: "vsf-order-items-bulk-customize" */ 'theme/pages/OrderItemsBulkCustomize');
const OrderItemDeliverablesDownload = () =>
  import(/* webpackChunkName: "vsf-order-item-deliverables" */ 'theme/pages/OrderItemDeliverablesDownload');

function makeRoutesStrict (routes) {
  return routes.map((route) => {
    route.pathToRegexpOptions = {
      strict: true
    }

    if (route.children) {
      route.children = makeRoutesStrict(route.children);
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
  {
    path: '/authenticate/',
    name: 'auth',
    component: Auth,
    props: (route) => ({
      token: route.query.token,
      email: route.query.email
    })
  },
  {
    path: '/sign-in/',
    name: PageName.SIGN_IN,
    component: SignIn
  },
  {
    path: '/stub',
    name: PageName.SIGN_IN_REDIRECT,
    redirect: {
      name: PageName.SIGN_IN
    }
  },
  {
    path: '/sign-up/',
    name: PageName.SIGN_UP,
    component: SignUp
  },
  {
    path: '/my-account/',
    name: 'my-account-root',
    component: MyAccount,
    meta: {
      auth: true
    },
    children: [
      {
        name: 'my-account',
        path: '',
        redirect: {
          name: 'orders-history'
        }
      },
      {
        name: 'profile',
        path: 'profile/',
        component: AccountProfile,
        meta: {
          auth: true
        }
      },
      {
        name: 'orders-history',
        path: 'order-history/',
        component: AccountOrdersHistory,
        meta: {
          auth: true,
          title: 'Order history'
        }
      },
      {
        path: 'orders-history/',
        redirect: {
          name: 'orders-history'
        }
      },
      {
        name: 'address-book',
        path: 'address-book/',
        component: AddressBook,
        meta: {
          auth: true
        },

        children: [
          {
            name: 'address-book-list',
            path: '',
            component: AddressesList,
            meta: {
              auth: true,
              title: 'Address book'
            }
          },
          {
            name: 'address-book-edit',
            path: 'edit/:addressId/',
            component: AddressEdit,
            props: (route) => ({
              addressId: route.params.addressId.toString()
            }),
            meta: {
              auth: true,
              title: 'Edit address'
            }
          },
          {
            name: 'address-book-add',
            path: 'add/',
            component: AddressAdd,
            meta: {
              auth: true,
              title: 'Add new address'
            }
          }
        ]
      }
    ]
  },
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
    name: 'plush-keychain-sample',
    path: '/bulk-plush-keychain-samples/create/',
    component: CustomizableProduct,
    props: (route) => {
      return {
        sku: 'keychainPlushBulkSample_bundle',
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
    name: 'acrylic-keychain-sample',
    path: '/bulk-acrylic-keychain-samples/create/',
    component: CustomizableProduct,
    props: (route) => {
      return {
        sku: 'keychainAcrylicBulkSample_bundle',
        existingPlushieId: route.query.existingPlushieId,
        layout: 'vertical'
      }
    }
  },
  {
    name: 'keychain-quote',
    path: '/keychain-quote/',
    component: KeychainQuote,
    props: {
      bundleProductSku: 'keychainBulkSample_bundle'
    }
  },
  {
    name: 'acrylic-keychain-quote',
    path: '/acrylic-keychain-quote/',
    component: KeychainQuote,
    props: {
      bundleProductSku: 'keychainAcrylicBulkSample_bundle'
    }
  },
  {
    name: 'pillow-quote',
    path: '/pillow-quote/',
    component: PillowQuote
  },
  {
    name: 'bulk-quote',
    path: '/bulk-quote/',
    component: BulkQuote,
    props: {
      bundleProductSku: 'CustomBulkSample_bundle'
    }
  },
  {
    name: 'plush-keychain-quote',
    path: '/plush-keychain-quote/',
    component: BulkQuote,
    props: {
      bundleProductSku: 'keychainPlushBulkSample_bundle'
    }
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
    props: (route) => {
      let properties = {
        token: route.query.token
      }

      if (route.query.id) {
        properties.id = route.query.id;
      }

      if (route.query.email) {
        properties.email = route.query.email;
      }

      return properties;
    }
  },
  {
    name: 'home-page-alias-1',
    path: '/home/',
    redirect: (route) => ({
      path: '/',
      query: route.query
    })
  },
  {
    path: '/order-items/bulk-customize/',
    name: 'order-items-bulk-customize',
    component: OrderItemsBulkCustomize,
    props: (route) => ({
      orderItemIds: route.query.orderItemIds
    }),
    meta: {
      auth: true
    }
  },
  {
    path: '/order-items/deliverables/download/',
    name: 'order-item-deliverables-download',
    component: OrderItemDeliverablesDownload,
    props: (route) => {
      let orderItemId = Number(route.query['order-item-id']);

      if (Number.isNaN(orderItemId)) {
        orderItemId = undefined;
      }

      return {
        orderItemId
      }
    },
    meta: {
      auth: true
    }
  }
];

routes = makeRoutesStrict(routes);

export default routes;
