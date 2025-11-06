import { PageName } from 'theme/pages/page-name';

const ErrorPage = () =>
  import(/* webpackChunkName: "vsf-error" */ 'theme/pages/Error');
const Product = () =>
  import(/* webpackChunkName: "vsf-product" */ 'theme/pages/Product');
const Category = () =>
  import(/* webpackChunkName: "vsf-category" */ 'theme/pages/Category');
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
const CrossSells = () =>
  import(/* webpackChunkName: "vsf-cross-sells" */ 'theme/pages/CrossSells');
const GiftCards = () =>
  import(/* webpackChunkName: "vsf-gift-cards" */ 'theme/pages/GiftCards');
const PasswordReset = () =>
  import(/* webpackChunkName: "vsf-password-reset" */ 'theme/pages/PasswordReset');
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
    name: 'products',
    path: '/products/',
    redirect: {
      name: 'category',
      params: {
        slug: 'products'
      }
    }
  },
  {
    name: 'products-alias-2',
    path: '/c/waggables-132/',
    redirect: {
      name: 'category',
      params: {
        slug: 'products'
      }
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
        children: [
          {
            name: 'address-book-list',
            path: '',
            component: AddressesList,
            meta: {
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
              title: 'Edit address'
            }
          },
          {
            name: 'address-book-add',
            path: 'add/',
            component: AddressAdd,
            meta: {
              title: 'Add new address'
            }
          }
        ]
      }
    ]
  },
  { name: 'page-not-found', path: '*', component: ErrorPage },
  { name: 'error', path: '/error/', component: ErrorPage, meta: { layout: 'minimal' } },
  { name: 'virtual-product', path: '/p/:parentSku/', component: Product },
  { name: 'bundle-product', path: '/p/:parentSku/', component: Product },
  { name: 'simple-product', path: '/p/:parentSku/', component: Product },
  { name: 'downloadable-product', path: '/p/:parentSku/', component: Product },
  { name: 'grouped-product', path: '/p/:parentSku/', component: Product },
  { name: 'configurable-product', path: '/p/:parentSku/:childSku/', component: Product },
  { name: 'plushToyAccessory-product', path: '/p/:parentSku/', component: Product },
  { name: 'product', path: '/p/:parentSku/:childSku/', component: Product },
  { name: 'category', path: '/c/:slug/', component: Category },
  { name: 'cross-sells', path: '/cross-sells/p/:parentSku/', component: CrossSells, props: true },
  {
    name: 'cross-sells-alias',
    path: '/crosssell/index/index/product_id/:productId/',
    redirect: ({ params }) => {
      let parentSku = '';

      switch (params.productId) {
        case '73':
          parentSku = 'ForeversDog_bundle';
          break;
        case '74':
          parentSku = 'ForeversCat_bundle';
          break;
        case '75':
          parentSku = 'ForeversOther_bundle';
          break;
        case '253':
          parentSku = 'customPillow_bundle';
          break;
        case '277':
          parentSku = 'customPrintedSocks_bundle';
          break;
        case '333':
          parentSku = 'petsiesPhrasePillow_bundle';
          break;
        case '340':
          parentSku = 'customPrintedMasks_bundle';
          break;
        case '353':
          parentSku = 'customPrintedKeychains_bundle';
          break;
        case '446':
          parentSku = 'customFeltedMagnets_bundle';
          break;
        case '448':
          parentSku = 'customFeltedOrnaments_bundle';
          break;
        case '487':
          parentSku = 'customRenaissanceBlankets_bundle';
          break;
        case '504':
          parentSku = 'customCutOutBlankets_bundle';
          break;
        case '528':
          parentSku = 'petsiesBobbleheads_bundle';
          break;
        case '532':
          parentSku = 'petsiesFigurines_bundle';
          break;
        case '558':
          parentSku = 'customPajamas_bundle';
          break;
        case '571':
          parentSku = 'golfHeadCoversDog_bundle';
          break;
        case '573':
          parentSku = 'golfHeadCoversCat_bundle';
          break;
        case '575':
          parentSku = 'golfHeadCoversOther_bundle';
          break;
        case '626':
          parentSku = 'customGolfShirts_bundle';
          break;
        case '645':
          parentSku = 'customHawaiianShirts_bundle';
          break;
        case '721':
          parentSku = 'customPhotoPortraits_bundle';
          break;
      }

      if (!parentSku) {
        return {
          name: 'detailed-cart'
        }
      }

      return {
        name: 'cross-sells',
        params: {
          parentSku
        }
      }
    }
  },
  { name: 'recover-cart', path: '/alerts/recover/cart/id/:id/code/:code/', component: CartRecovery },
  { name: 'gift-cards', path: '/giftcards/', component: GiftCards },
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
      let orderItemId = Number(route.query['order_item_id']);

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
