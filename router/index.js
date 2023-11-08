import { PlushieType } from 'theme/interfaces/plushie.type';

const ErrorPage = () =>
  import(/* webpackChunkName: "vsf-error" */ 'theme/pages/Error');
const Product = () =>
  import(/* webpackChunkName: "vsf-product" */ 'theme/pages/Product');
const PlushieProduct = () =>
  import(/* webpackChunkName: "vsf-forevers-product" */ 'theme/pages/PlushieProduct');
const PrintedProduct = () =>
  import(/* webpackChunkName: "vsf-printed-product" */ 'theme/pages/PrintedProduct');
const PillowProduct = () =>
  import(/* webpackChunkName: "vsf-pillow-product" */ 'theme/pages/PillowProduct');
const PhrasePillowProduct = () =>
  import(/* webpackChunkName: "vsf-phrase-pillow-product" */ 'theme/pages/PhrasePillowProduct');
const Category = () =>
  import(/* webpackChunkName: "vsf-category" */ 'theme/pages/Category');
const Checkout = () =>
  import(/* webpackChunkName: "vsf-checkout" */ 'theme/pages/Checkout');
const DetailedCart = () =>
  import(/* webpackChunkName: "vsf-detailed-cart" */ 'theme/pages/DetailedCart');
const MyAccount = () =>
  import(/* webpackChunkName: "vsf-my-account" */ 'theme/pages/MyAccount');
const CartRecovery = () =>
  import(/* webpackChunkName: "vsf-cart-recovery" */ 'theme/pages/CartRecovery');
const CrossSells = () =>
  import(/* webpackChunkName: "vsf-cross-sells" */ 'theme/pages/CrossSells');
const GiftCards = () =>
  import(/* webpackChunkName: "vsf-gift-cards" */ 'theme/pages/GiftCards');
const BlanketProduct = () =>
  import(/* webpackChunkName: "vsf-blankets" */ 'theme/pages/BlanketProduct');
const ClayProduct = () =>
  import(/* webpackChunkName: "vsf-plushie-product" */ 'theme/pages/ClayProduct');
const ClothesProduct = () =>
  import(/* webpackChunkName: "vsf-clothes-product" */ 'theme/pages/ClothesProduct');
const BudsiesPlushieProduct = () =>
  import(/* webpackChunkName: "vsf-budsies-plushie-product" */ 'theme/pages/BudsiesPlushieProduct');
const SpecialtyCommissionProduct = () =>
  import(/* webpackChunkName: "vsf-specialty-commission-product" */ 'theme/pages/SpecialtyCommissionProduct');
const CreativityKitProduct = () =>
  import(/* webpackChunkName: "vsf-creativity-kit-product" */ 'theme/pages/CreativityKitProduct');
const Raffle = () =>
  import(/* webpackChunkName: "vsf-raffle" */ 'theme/pages/Raffle');
const InspirationMachine = () =>
  import(/* webpackChunkName: "vsf-inspiration-machine" */ 'theme/pages/InspirationMachine');
const BudsiesPalsKitProduct = () =>
  import(/* webpackChunkName: "vsf-pals-kit" */ 'theme/pages/BudsiesPalsKitProduct');
const BudsiesPalsProduct = () =>
  import(/* webpackChunkName: "vsf-budsies-pals-product" */ 'theme/pages/BudsiesPalsProduct');
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
  {
    name: 'pillowSideDesign-product-redirect',
    path: '/p/phraseBudsies:parentSku?/:slug?/',
    redirect: (route) => ({
      name: 'phrase-pillow-customize',
      query: {
        back_design: route.query.back_design,
        front_design: 'phraseBudsies' + route.params.parentSku
      }
    })
  },
  { name: 'my-account', path: '/my-account/', component: MyAccount },
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
    props: {
      plushieType: PlushieType.FOREVERS
    }
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
    props: {
      plushieType: PlushieType.GOLF_COVERS
    }
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
    name: 'printed-product',
    path: '/printed/p/:sku/',
    component: PrintedProduct,
    props: route => ({
      sku: route.params.sku,
      productDesign: route.query.product_design,
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'pillow-product',
    path: '/buddy-pillows/create/',
    component: PillowProduct,
    props: (route) => ({
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'pillow-product-alias-1',
    path: '/plushie/index/create/id/:plushieId/type/buddy-pillow/',
    redirect: (route) => ({
      name: 'pillow-product',
      query: {
        existingPlushieId: route.params.plushieId
      }
    })
  },
  {
    name: 'pillow-product-alias-2',
    path: '/plushie/index/create/type/buddy-pillow/',
    redirect: {
      name: 'pillow-product'
    }
  },
  { name: 'cross-sells', path: '/cross-sells/p/:parentSku/', component: CrossSells, props: true },
  {
    name: 'cross-sells-alias',
    path: '/crosssell/index/index/product_id/:productId/',
    redirect: ({ params }) => {
      let parentSku = '';

      switch (params.productId) {
        case '11':
          parentSku = 'CustomBudsie1_bundle';
          break;
        case '12':
          parentSku = 'CustomSelfie_bundle';
          break;
        case '73':
          parentSku = 'ForeversDog_bundle';
          break;
        case '74':
          parentSku = 'ForeversCat_bundle';
          break;
        case '75':
          parentSku = 'ForeversOther_bundle';
          break;
        case '163':
          parentSku = 'specialtyCommission_bundle';
          break;
        case '253':
          parentSku = 'customPillow_bundle';
          break;
        case '266':
          parentSku = 'customPals_bundle';
          break;
        case '273':
          parentSku = 'customBuddyPillow_bundle'
          break;
        case '277':
          parentSku = 'customPrintedSocks_bundle';
          break;
        case '303':
          parentSku = 'phrasePillow_bundle';
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
        case '428':
          parentSku = 'budsiesPuppet_bundle';
          break;
        case '430':
          parentSku = 'selfiesPuppet_bundle';
          break;
        case '446':
          parentSku = 'customFeltedMagnets_bundle';
          break;
        case '448':
          parentSku = 'customFeltedOrnaments_bundle';
          break;
        case '460':
          parentSku = 'budsieNft_bundle';
          break;
        case '487':
          parentSku = 'customRenaissanceBlankets_bundle';
          break;
        case '504':
          parentSku = 'customCutOutBlankets_bundle';
          break;
        case '526':
          parentSku = 'bobbleheads_bundle';
          break;
        case '528':
          parentSku = 'petsiesBobbleheads_bundle';
          break;
        case '530':
          parentSku = 'figurines_bundle';
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
        case '603':
          parentSku = 'customCartoonPillows_bundle';
          break;
        case '626':
          parentSku = 'customGolfShirts_bundle';
          break;
        case '645':
          parentSku = 'customHawaiianShirts_bundle';
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
    name: 'printed-socks-creation-page',
    path: '/plushie/index/printedSocks/',
    component: PrintedProduct,
    props: route => ({
      sku: 'customPrintedSocks_bundle',
      productDesign: route.query.product_design
    })
  },
  {
    name: 'printed-masks-creation-page',
    path: '/plushie/index/printedMasks/',
    component: PrintedProduct,
    props: route => ({
      sku: 'customPrintedMasks_bundle',
      productDesign: route.query.product_design
    })
  },
  {
    name: 'printed-keychains-creation-page',
    path: '/plushie/index/printedKeychains/',
    component: PrintedProduct,
    props: route => ({
      sku: 'customPrintedKeychains_bundle',
      productDesign: route.query.product_design
    })
  },
  {
    name: 'felted-magnets-creation-page',
    path: '/plushie/index/feltedMagnets/',
    component: PrintedProduct,
    props: route => ({
      sku: 'customFeltedMagnets_bundle',
      productDesign: route.query.product_design
    })
  },
  {
    name: 'felted-ornaments-creation-page',
    path: '/plushie/index/feltedOrnaments/',
    component: PrintedProduct,
    props: route => ({
      sku: 'customFeltedOrnaments_bundle',
      productDesign: route.query.product_design
    })
  },
  {
    name: 'photo-pillows-alias-1',
    path: '/photo-pillow/designs/',
    redirect: {
      name: 'category',
      params: {
        slug: 'designs'
      }
    }
  },
  {
    name: 'photo-pillows-alias-2',
    path: '/photo-pillows/',
    redirect: {
      name: 'category',
      params: {
        slug: 'designs'
      }
    }
  },
  {
    name: 'accessories-category-alias',
    path: '/accessories/',
    redirect: {
      name: 'category',
      params: {
        slug: 'accessories-for-custom-products'
      }
    }
  },
  {
    path: '/phrasepillow/index/customize/',
    name: 'phrase-pillow-customize',
    component: PhrasePillowProduct,
    props: (route) => ({
      backDesign: route.query.back_design,
      frontDesign: route.query.front_design
    })
  },
  {
    name: 'pillowSideDesign-product',
    path: '/phrase-pillow/p/:parentSku?/:slug?/',
    redirect: (route) => ({
      name: 'phrase-pillow-customize',
      query: {
        back_design: route.query.back_design,
        front_design: route.params.parentSku
      }
    })
  },
  { name: 'recover-cart', path: '/alerts/recover/cart/id/:id/code/:code/', component: CartRecovery },
  { name: 'gift-cards', path: '/giftcards/', component: GiftCards },
  {
    name: 'giftbox',
    path: '/gift-box/',
    component: CreativityKitProduct
  },
  {
    name: 'renaissance-blankets',
    path: '/blankets/index/create/type/renaissance-blankets/',
    component: BlanketProduct,
    props: (route) => ({
      sku: 'customRenaissanceBlankets_bundle',
      existingPlushieId: route.query.existingPlushieId,
      productDesign: route.query.product_design
    })
  },
  {
    name: 'cut-out-blankets',
    path: '/blankets/index/create/type/cut-out-blankets/',
    component: BlanketProduct,
    props: (route) => ({
      sku: 'customCutOutBlankets_bundle',
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
        slug: 'cut-out-design'
      }
    }
  },
  {
    name: 'renaissance-blankets-category',
    path: '/blankets/renaissance-design/',
    redirect: {
      name: 'category',
      params: {
        slug: 'renaissance-design'
      }
    }
  },
  {
    name: 'figurines-alias-1',
    path: '/plushie/index/create/id/:plushieId/type/figurine/',
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
    name: 'figurines-alias-2',
    path: '/plushie/index/create/type/figurine/',
    redirect: {
      name: 'figurines-creation'
    }
  },
  {
    name: 'figurines-creation',
    path: '/figurines/create/',
    component: ClayProduct,
    props: (route) => ({
      sku: 'figurines_bundle',
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'bobbleheads-alias-1',
    path: '/plushie/index/create/id/:plushieId/type/bobblehead/',
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
    name: 'bobbleheads-alias-2',
    path: '/plushie/index/create/type/bobblehead/',
    redirect: {
      name: 'bobbleheads-creation'
    }
  },
  {
    name: 'bobbleheads-creation',
    path: '/bobbleheads/create/',
    component: ClayProduct,
    props: (route) => ({
      sku: 'bobbleheads_bundle',
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'budsies-creation-alias-1',
    path: '/plushie/index/create/id/:plushieId/type/budsie/',
    redirect: (route) => {
      return {
        name: 'budsie-creation',
        query: {
          existingPlushieId: route.params.plushieId
        }
      }
    }
  },
  {
    name: 'budsies-creation-alias-2',
    path: '/plushie/index/create/type/budsie/',
    redirect: {
      name: 'budsie-creation'
    }
  },
  {
    name: 'budsie-creation',
    path: '/budsies/create/',
    component: BudsiesPlushieProduct,
    props: (route) => ({
      sku: 'CustomBudsie1_bundle',
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'selfies-creation-alias-1',
    path: '/plushie/index/create/id/:plushieId/type/selfie/',
    redirect: (route) => {
      return {
        name: 'selfies-creation',
        query: {
          existingPlushieId: route.params.plushieId
        }
      }
    }
  },
  {
    name: 'selfies-creation-alias-2',
    path: '/plushie/index/create/type/selfie/',
    redirect: {
      name: 'selfies-creation'
    }
  },
  {
    name: 'selfies-creation',
    path: '/selfies/create/',
    component: BudsiesPlushieProduct,
    props: (route) => ({
      sku: 'CustomSelfie_bundle',
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'selfies-puppets-creation-alias-1',
    path: '/plushie/index/create/id/:plushieId/type/selfies-puppets/',
    redirect: (route) => {
      return {
        name: 'selfies-puppets-creation',
        query: {
          existingPlushieId: route.params.plushieId
        }
      }
    }
  },
  {
    name: 'selfies-puppets-creation-alias-2',
    path: '/plushie/index/create/type/selfies-puppet/',
    redirect: {
      name: 'selfies-puppets-creation'
    }
  },
  {
    name: 'selfies-puppets-creation',
    path: '/selfies-puppets/create/',
    component: BudsiesPlushieProduct,
    props: (route) => ({
      sku: 'selfiesPuppet_bundle',
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'budsies-puppets-creation-alias-1',
    path: '/plushie/index/create/id/:plushieId/type/budsies-puppet/',
    redirect: (route) => {
      return {
        name: 'budsies-puppets-creation',
        query: {
          existingPlushieId: route.params.plushieId
        }
      }
    }
  },
  {
    name: 'budsies-puppets-creation-alias-2',
    path: '/plushie/index/create/type/budsies-puppet/',
    redirect: {
      name: 'budsies-puppets-creation'
    }
  },
  {
    name: 'budsies-puppets-creation',
    path: '/budsies-puppets/create/',
    component: BudsiesPlushieProduct,
    props: (route) => ({
      sku: 'budsiesPuppet_bundle',
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'specialty-commissions-creation-alias-1',
    path: '/plushie/index/create/id/:plushieId/type/commission/',
    redirect: (route) => {
      return {
        name: 'specialty-commissions-creation',
        query: {
          existingPlushieId: route.params.plushieId
        }
      }
    }
  },
  {
    name: 'specialty-commissions-creation-alias-2',
    path: '/commissions/create/token/:token/',
    redirect: (route) => {
      return {
        name: 'specialty-commissions-creation',
        query: {
          token: route.params.token
        }
      }
    }
  },
  {
    name: 'specialty-commissions-creation-alias-3',
    path: '/plushie/index/create/type/commission/',
    redirect: {
      name: 'specialty-commissions-creation'
    }
  },
  {
    name: 'specialty-commissions-creation',
    path: '/commissions/create/',
    component: SpecialtyCommissionProduct,
    props: (route) => ({
      existingPlushieId: route.query.existingPlushieId,
      token: route.query.token
    })
  },
  {
    name: 'clothes-product',
    path: '/clothes/p/:sku/',
    component: ClothesProduct,
    props: (route) => ({
      sku: route.params.sku,
      productDesign: route.query.product_design,
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'pajamas-creation',
    path: '/pajamas/index/create/',
    component: ClothesProduct,
    props: (route) => ({
      sku: 'customPajamas_bundle',
      productDesign: route.query.product_design,
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'hawaiian-shirts-creation',
    path: '/clothes/hawaiian-shirts/create/',
    component: ClothesProduct,
    props: (route) => ({
      sku: 'customHawaiianShirts_bundle',
      productDesign: route.query.product_design,
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'golf-shirts-creation',
    path: '/clothes/golf-shirts/create/',
    component: ClothesProduct,
    props: (route) => ({
      sku: 'customGolfShirts_bundle',
      productDesign: route.query.product_design,
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'gift-card-alias',
    path: '/purchase-gift-card/',
    redirect: {
      name: 'gift-cards'
    }
  },
  {
    name: 'raffle-alias-1',
    path: '/commissions-closed/',
    redirect: {
      name: 'raffle'
    }
  },
  {
    name: 'raffle',
    path: '/raffle/',
    component: Raffle,
    props: (route) => ({
      referrerToken: route.query.referral_code
    })
  },
  {
    name: 'cartoon-pillow-product',
    path: '/plushie/index/cartoonPillows/',
    component: PrintedProduct,
    props: route => ({
      sku: 'customCartoonPillows_bundle',
      productDesign: route.query.product_design
    })
  },
  {
    name: 'inspiration-machine',
    path: '/inspiration/',
    component: InspirationMachine
  },
  {
    name: 'budsies-pals-kits',
    path: '/sponsors/',
    component: BudsiesPalsKitProduct
  },
  {
    name: 'budsies-pals-creation',
    path: '/budsie/index/create/type/pals/',
    component: BudsiesPalsProduct,
    props: (route) => ({
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'budsies-pals-product-alias',
    path: '/plushie/index/create/id/:existingPlushieId/type/pals/',
    redirect: (route) => ({
      name: 'budsies-pals-product',
      query: {
        existingPlushieId: route.params.existingPlushieId
      }
    })
  },
  {
    name: 'password-reset',
    path: '/customer/account/resetpassword/',
    component: PasswordReset,
    props: (route) => ({
      id: route.query.id,
      token: route.query.token
    })
  },
  {
    name: 'nft-budsies-create',
    path: '/nft-budsies/create/',
    component: BudsiesPlushieProduct,
    props: (route) => ({
      sku: 'budsieNft_bundle',
      existingPlushieId: route.query.existingPlushieId
    })
  },
  {
    name: 'nft-budsies-create-alias-1',
    path: '/plushie/index/create/id/:plushieId/type/nft-budsie/',
    redirect: (route) => ({
      name: 'nft-budsies-create',
      query: {
        existingPlushieId: route.params.plushieId
      }
    })
  },
  {
    name: 'nft-budsies-create-alias-2',
    path: '/plushie/index/create/type/nft-budsie/',
    redirect: {
      name: 'nft-budsies-create'
    }
  }
];

routes = makeRoutesStrict(routes);

export default routes;
