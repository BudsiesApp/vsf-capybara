import { PlushieType } from 'theme/interfaces/plushie.type';
import { PageName } from 'theme/pages/page-name';
import { LayoutType } from 'theme/helpers/use-product-form-layout';

const ErrorPage = () =>
  import(/* webpackChunkName: "vsf-error" */ 'theme/pages/Error');
const Product = () =>
  import(/* webpackChunkName: "vsf-product" */ 'theme/pages/Product');
const PlushieProduct = () =>
  import(/* webpackChunkName: "vsf-forevers-product" */ 'theme/pages/PlushieProduct');
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
const CustomizationSystemWidgetsTestPage = () =>
  import(/* webpackChunkName: "vsf-widgets-test" */ 'theme/pages/CustomizationSystemWidgetsTest');
const CustomizableProduct = () =>
  import(/* webpackChunkName: "vsf-customizable-product" */ 'theme/pages/CustomizableProduct');
const OrderItemCustomize = () =>
  import(/* webpackChunkName: "vsf-order-item-customize" */ 'theme/pages/OrderItemCustomize');
const OrderItemsBulkCustomize = () =>
  import(/* webpackChunkName: "vsf-order-items-bulk-customize" */ 'theme/pages/OrderItemsBulkCustomize');
const OrderItemDeliverablesDownload = () =>
  import(/* webpackChunkName: "vsf-order-item-deliverables" */ 'theme/pages/OrderItemDeliverablesDownload');
const OrderPrintoutsDownload = () =>
  import(/* webpackChunkName: "vsf-order-printouts-download" */ 'theme/pages/OrderPrintoutsDownload');
const TaxIdRequest = () =>
  import(/* webpackChunkName: "vsf-tax-id-request" */ 'theme/pages/TaxIdRequest');
const OrderUpdateAddress = () =>
  import(/* webpackChunkName: "vsf-order-update-address" */ 'theme/pages/OrderUpdateAddress');

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
    name: 'pillowSideDesign-product-redirect',
    path: '/p/phrasePetsies:parentSku?/:slug?/',
    redirect: (route) => ({
      name: 'phrase-pillow-customize',
      query: {
        back_design: route.query.back_design,
        front_design: 'phrasePetsies' + route.params.parentSku
      }
    })
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
  { name: 'virtual-product', path: '/p/:parentSku/', component: Product },
  { name: 'bundle-product', path: '/p/:parentSku/', component: Product },
  { name: 'simple-product', path: '/p/:parentSku/', component: Product },
  { name: 'downloadable-product', path: '/p/:parentSku/', component: Product },
  { name: 'grouped-product', path: '/p/:parentSku/', component: Product },
  { name: 'configurable-product', path: '/p/:parentSku/:childSku/', component: Product },
  { name: 'plushToyAccessory-product', path: '/p/:parentSku/', component: Product },
  { name: 'petsiesStarProduct-product', path: '/p/:parentSku/', component: Product },
  { name: 'product', path: '/p/:parentSku/:childSku/', component: Product },
  { name: 'category', path: '/c/:slug/', component: Category },
  {
    name: 'forevers-create',
    path: '/forevers/create/',
    component: PlushieProduct,
    props: (route) => ({
      plushieType: PlushieType.FOREVERS,
      existingPlushieId: route.query.id,
      preselectedProductSize: route.query.size,
      preselectedProductType: route.query.product
    })
  },
  {
    name: 'forevers-create-alias-1',
    path: '/plushie/index/creationwizard/category_id/13/',
    redirect: {
      name: 'forevers-create'
    }
  },
  {
    name: 'forevers-create-alias-2',
    path: '/plushie/index/creationwizard/category_id/13/attributeId/:plushieId/',
    redirect: {
      name: 'forevers-create'
    }
  },
  {
    name: 'forevers-create-alias-3',
    path: '/plushie/index/precreate/type/forevers/product/:productType/',
    redirect: (route) => ({
      name: 'forevers-create',
      query: {
        product: route.params.productType
      }
    })
  },
  {
    name: 'golf-covers-create',
    path: '/golf-head-covers/create/',
    component: PlushieProduct,
    props: (route) => ({
      plushieType: PlushieType.GOLF_COVERS,
      existingPlushieId: route.query.id,
      preselectedProductType: route.query.product
    })
  },
  {
    name: 'golf-covers-create-alias-1',
    path: '/plushie/index/creationwizard/category_id/124/',
    redirect: {
      name: 'golf-covers-create'
    }
  },
  {
    name: 'golf-covers-create-alias-2',
    path: '/plushie/index/creationwizard/category_id/124/attributeId/:plushieId/',
    redirect: {
      name: 'golf-covers-create'
    }
  },
  {
    name: 'golf-covers-create-alias-3',
    path: '/plushie/index/precreate/type/golf-head-covers/product/:productType/',
    redirect: (route) => ({
      name: 'golf-covers-create',
      query: {
        product: route.params.productType
      }
    })
  },
  {
    name: 'pillow-product',
    path: '/pillows/create/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'customPillow_bundle',
      existingPlushieId: route.query.existingPlushieId,
      layout: 'vertical'
    })
  },
  {
    name: 'pillow-product-alias',
    path: '/plushie/index/create/id/:plushieId/type/pillow/',
    redirect: (route) => ({
      name: 'pillow-product',
      query: {
        existingPlushieId: route.params.plushieId
      }
    })
  },
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
  {
    name: 'printed-socks-creation-page-alias-1',
    path: '/plushie/index/printedSocks/',
    redirect: (route) => ({
      name: 'printed-socks-creation-page',
      query: route.query
    })
  },
  {
    name: 'printed-socks-creation-page',
    path: '/pet-socks/',
    component: CustomizableProduct,
    props: route => ({
      sku: 'petsiesCustomPrintedSocks_bundle',
      productDesign: route.query.product_design,
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'printed-masks-creation-page-alias-1',
    path: '/plushie/index/printedMasks/',
    redirect: (route) => ({
      name: 'printed-masks-creation-page',
      query: route.query
    })
  },
  {
    name: 'printed-masks-creation-page',
    path: '/custom-face-masks/',
    component: CustomizableProduct,
    props: route => ({
      sku: 'customPrintedMasks_bundle',
      productDesign: route.query.product_design,
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'printed-keychains-creation-page-alias-1',
    path: '/plushie/index/printedKeychains/',
    redirect: (route) => ({
      name: 'printed-keychains-creation-page',
      query: route.query
    })
  },
  {
    name: 'printed-keychains-creation-page',
    path: '/pet-keychains/',
    component: CustomizableProduct,
    props: route => ({
      sku: 'customPrintedKeychains_bundle',
      productDesign: route.query.product_design,
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'felted-magnets-creation-page-alias-1',
    path: '/plushie/index/feltedMagnets/',
    redirect: (route) => ({
      name: 'felted-magnets-creation-page',
      query: route.query
    })
  },
  {
    name: 'felted-magnets-creation-page',
    path: '/felted-magnets/',
    component: CustomizableProduct,
    props: route => ({
      sku: 'customFeltedMagnets_bundle',
      productDesign: route.query.product_design,
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'felted-ornaments-creation-page-alias-1',
    path: '/plushie/index/feltedOrnaments/',
    redirect: (route) => ({
      name: 'felted-ornaments-creation-page',
      query: route.query
    })
  },
  {
    name: 'felted-ornaments-creation-page',
    path: '/felted-ornaments/',
    component: CustomizableProduct,
    props: route => ({
      sku: 'customFeltedOrnaments_bundle',
      productDesign: route.query.product_design,
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'photo-pillows-alias-1',
    path: '/photo-pillow/designs/',
    redirect: {
      name: 'category',
      params: {
        slug: 'photo-pillows-designs'
      }
    }
  },
  {
    name: 'photo-pillows-alias-2',
    path: '/photo-pillows/',
    redirect: {
      name: 'category',
      params: {
        slug: 'photo-pillows-designs'
      }
    }
  },
  {
    name: 'accessories-category-alias',
    path: '/accessories/',
    redirect: {
      name: 'category',
      params: {
        slug: 'petsies-accessories'
      }
    }
  },
  {
    name: 'phrase-pillow-customize-alias-1',
    path: '/phrasepillow/index/customize/',
    redirect: (route) => ({
      name: 'phrase-pillow-customize',
      query: route.query
    })
  },
  {
    path: '/photo-pillows/create/',
    name: 'phrase-pillow-customize',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'petsiesPhrasePillow_bundle',
      layout: 'phrase-pillow',
      existingPlushieId: route.query.existingPlushieId
    })
  },
  { name: 'recover-cart', path: '/alerts/recover/cart/id/:id/code/:code/', component: CartRecovery },
  { name: 'gift-cards', path: '/giftcards/', component: GiftCards },
  {
    name: 'giftbox',
    path: '/giftbox/',
    redirect: {
      name: 'configurable-product',
      params: {
        parentSku: 'gift_box',
        childSku: 'gift_box_dog'
      }
    }
  },
  {
    name: 'renaissance-blankets-alias-1',
    path: '/blankets/index/create/type/renaissance-blankets/',
    redirect: (route) => ({
      name: 'renaissance-blankets',
      query: route.query
    })
  },
  {
    name: 'renaissance-blankets',
    path: '/renaissance-blankets/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'customRenaissanceBlankets_bundle',
      existingPlushieId: route.query.existingPlushieId,
      productDesign: route.query.product_design
    })
  },
  {
    name: 'cut-out-blankets-alias-1',
    path: '/blankets/index/create/type/cut-out-blankets/',
    redirect: (route) => ({
      name: 'cut-out-blankets',
      query: route.query
    })
  },
  {
    name: 'cut-out-blankets',
    path: '/custom-pet-photo-blankets/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'petsiesCustomCutOutBlankets_bundle',
      existingPlushieId: route.query.existingPlushieId,
      productDesign: route.query.product_design
    })
  },
  {
    name: 'cut-out-blankets-category',
    path: '/blankets/cut-out-design/',
    redirect: {
      name: 'category',
      params: {
        slug: 'blankets-cut-out-design'
      }
    }
  },
  {
    name: 'renaissance-blankets-category',
    path: '/blankets/renaissance-design/',
    redirect: {
      name: 'category',
      params: {
        slug: 'blankets-renaissance-design'
      }
    }
  },
  {
    name: 'figurines-alias-1',
    path: '/plushie/index/create/id/:plushieId/type/petsies-figurine/',
    redirect: (route) => {
      return {
        name: 'figurines-creation',
        query: {
          existingPlushieId: route.params.plushieId
        }
      }
    }
  },
  {
    name: 'figurines-creation',
    path: '/petsies-figurines/create/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'petsiesFigurines_bundle',
      existingPlushieId: route.query.existingPlushieId,
      layout: 'vertical'
    })
  },
  {
    name: 'bobbleheads-alias-1',
    path: '/plushie/index/create/id/:plushieId/type/petsies-bobblehead/',
    redirect: (route) => {
      return {
        name: 'bobbleheads-creation',
        query: {
          existingPlushieId: route.params.plushieId
        }
      }
    }
  },
  {
    name: 'bobbleheads-creation',
    path: '/petsies-bobbleheads/create/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'petsiesBobbleheads_bundle',
      existingPlushieId: route.query.existingPlushieId,
      layout: 'vertical'
    })
  },
  {
    name: 'pajamas-creation-alias-1',
    path: '/pajamas/index/create/',
    redirect: (route) => ({
      name: 'pajamas-creation',
      query: route.query
    })
  },
  {
    name: 'pajamas-creation',
    path: '/custom-pajamas/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'customPajamas_bundle',
      productDesign: route.query.product_design,
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'tumblers-creation',
    path: '/custom-tumblers/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'customTumblers_bundle',
      productDesign: route.query.product_design,
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'hawaiian-shirts-creation',
    path: '/clothes/hawaiian-shirts/create/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'customHawaiianShirts_bundle',
      productDesign: route.query.product_design,
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'golf-shirts-creation',
    path: '/clothes/golf-shirts/create/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'customGolfShirts_bundle',
      productDesign: route.query.product_design,
      existingPlushieId: route.query.existingPlushieId
    })
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
    name: 'photo-portraits-creation-page',
    path: '/photo-portraits/create/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'customPhotoPortraits_bundle',
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'huggables-creation-page',
    path: '/petsies-huggables/create/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'petsiesHuggables_bundle',
      existingPlushieId: route.query.existingPlushieId,
      layout: 'vertical'
    })
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
    name: 'forevers-customize',
    path: '/forevers/customize/',
    component: OrderItemCustomize,
    props: (route) => ({
      orderItemId: route.query.orderItemId,
      layout: LayoutType.CREATION_WIZARD,
      sku: route.query.sku,
      plushieType: PlushieType.FOREVERS
    }),
    meta: {
      auth: true
    }
  },
  {
    name: 'golf-head-covers-customize',
    path: '/golf-head-covers/customize/',
    component: OrderItemCustomize,
    props: (route) => ({
      orderItemId: route.query.orderItemId,
      layout: LayoutType.CREATION_WIZARD,
      sku: route.query.sku,
      plushieType: PlushieType.GOLF_COVERS
    }),
    meta: {
      auth: true
    }
  },
  {
    name: 'printed-product-customize',
    path: '/printed-product/customize/',
    component: OrderItemCustomize,
    props: (route) => ({
      orderItemId: route.query.orderItemId,
      layout: LayoutType.WITH_IMAGES_GALLERY,
      sku: route.query.sku
    }),
    meta: {
      auth: true
    }
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
  },
  {
    path: '/orders/printouts-download/',
    name: 'orders-printouts-download',
    component: OrderPrintoutsDownload,
    props: (route) => ({
      orderId: route.query.orderId
    }),
    meta: {
      auth: true
    }
  },
  {
    path: '/order/tax-id-request/',
    name: 'tax-id-request',
    component: TaxIdRequest,
    props: (route) => ({
      orderId: route.query.orderId
    }),
    meta: {
      auth: true
    }
  },
  {
    path: '/order/update-address/',
    name: 'order-update-address',
    component: OrderUpdateAddress,
    props: (route) => ({
      orderId: route.query.orderId
    }),
    meta: {
      auth: true
    }
  }
];

routes = makeRoutesStrict(routes);

export default routes;
