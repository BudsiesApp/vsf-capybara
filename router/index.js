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
const MyAccount = () =>
  import(/* webpackChunkName: "vsf-my-account" */ 'theme/pages/MyAccount');
const CartRecovery = () =>
  import(/* webpackChunkName: "vsf-cart-recovery" */ 'theme/pages/CartRecovery');
const CrossSells = () =>
  import(/* webpackChunkName: "vsf-cross-sells" */ 'theme/pages/CrossSells');
const GiftCards = () =>
  import(/* webpackChunkName: "vsf-gift-cards" */ 'theme/pages/GiftCards');
const CreativityKitProduct = () =>
  import(/* webpackChunkName: "vsf-creativity-kit-product" */ 'theme/pages/CreativityKitProduct');
const Raffle = () =>
  import(/* webpackChunkName: "vsf-raffle" */ 'theme/pages/Raffle');
const InspirationMachine = () =>
  import(/* webpackChunkName: "vsf-inspiration-machine" */ 'theme/pages/InspirationMachine');
const BudsiesPalsKitProduct = () =>
  import(/* webpackChunkName: "vsf-pals-kit" */ 'theme/pages/BudsiesPalsKitProduct');

const PasswordReset = () =>
  import(/* webpackChunkName: "vsf-password-reset" */ 'theme/pages/PasswordReset');
const CustomizableProduct = () =>
  import(/* webpackChunkName: "vsf-customizable-product" */ 'theme/pages/CustomizableProduct');

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
    name: 'printed-product',
    path: '/printed/p/:sku/',
    component: CustomizableProduct,
    props: route => ({
      sku: route.params.sku,
      productDesign: route.query.product_design,
      existingPlushieId: route.query.existingPlushieId,
      layout: 'with-images-gallery'
    })
  },
  {
    name: 'pillow-product',
    path: '/buddy-pillows/create/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'customBuddyPillow_bundle',
      existingPlushieId: route.query.existingPlushieId,
      layout: 'vertical'
    })
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
    name: 'printed-socks-creation-page',
    path: '/custom-socks/',
    component: CustomizableProduct,
    props: route => ({
      sku: 'customPrintedSocks_bundle',
      productDesign: route.query.product_design,
      layout: 'with-images-gallery'
    })
  },
  {
    name: 'printed-masks-creation-page',
    path: '/face-masks/',
    component: CustomizableProduct,
    props: route => ({
      sku: 'customPrintedMasks_bundle',
      productDesign: route.query.product_design,
      layout: 'with-images-gallery'
    })
  },
  {
    name: 'printed-keychains-creation-page',
    path: '/custom-keychains/',
    component: CustomizableProduct,
    props: route => ({
      sku: 'customPrintedKeychains_bundle',
      productDesign: route.query.product_design,
      layout: 'with-images-gallery'
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
        slug: 'accessories-for-custom-products'
      }
    }
  },
  {
    path: '/photo-pillows/create/',
    name: 'phrase-pillow-customize',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'phrasePillow_bundle',
      layout: 'phrase-pillow'
    })
  },
  { name: 'recover-cart', path: '/alerts/recover/cart/id/:id/code/:code/', component: CartRecovery },
  { name: 'gift-cards', path: '/giftcards/', component: GiftCards },
  {
    name: 'giftbox',
    path: '/gift-box/',
    component: CreativityKitProduct
  },
  // TODO: remove?
  {
    name: 'renaissance-blankets',
    path: '/blankets/index/create/type/renaissance-blankets/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'customRenaissanceBlankets_bundle',
      existingPlushieId: route.query.existingPlushieId,
      productDesign: route.query.product_design
    })
  },
  {
    name: 'cut-out-blankets',
    path: '/custom-photo-blankets/',
    component: CustomizableProduct,
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
    name: 'figurines-creation',
    path: '/figurines/create/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'figurines_bundle',
      existingPlushieId: route.query.existingPlushieId,
      layout: 'vertical'
    })
  },
  {
    name: 'bobbleheads-creation',
    path: '/bobbleheads/create/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'bobbleheads_bundle',
      existingPlushieId: route.query.existingPlushieId,
      layout: 'vertical'
    })
  },
  {
    name: 'budsie-creation',
    path: '/budsies/create/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'CustomBudsie1_bundle',
      existingPlushieId: route.query.existingPlushieId,
      layout: 'vertical'
    })
  },
  {
    name: 'selfies-creation',
    path: '/selfies/create/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'CustomSelfie_bundle',
      existingPlushieId: route.query.existingPlushieId,
      layout: 'vertical'
    })
  },
  {
    name: 'selfies-puppets-creation',
    path: '/selfies-puppets/create/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'selfiesPuppet_bundle',
      existingPlushieId: route.query.existingPlushieId,
      layout: 'vertical'
    })
  },
  {
    name: 'budsies-puppets-creation',
    path: '/budsies-puppets/create/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'budsiesPuppet_bundle',
      existingPlushieId: route.query.existingPlushieId,
      layout: 'vertical'
    })
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
    name: 'specialty-commissions-creation',
    path: '/commissions/create/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'specialtyCommission_bundle',
      existingPlushieId: route.query.existingPlushieId,
      token: route.query.token,
      layout: 'vertical'
    })
  },
  {
    name: 'clothes-product',
    path: '/clothes/p/:sku/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: route.params.sku,
      productDesign: route.query.product_design,
      existingPlushieId: route.query.existingPlushieId,
      layout: 'with-images-gallery'
    })
  },
  {
    name: 'pajamas-creation',
    path: '/custom-pajamas/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'customPajamas_bundle',
      productDesign: route.query.product_design,
      existingPlushieId: route.query.existingPlushieId,
      layout: 'with-images-gallery'
    })
  },
  {
    name: 'hawaiian-shirts-creation',
    path: '/clothes/hawaiian-shirts/create/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'customHawaiianShirts_bundle',
      productDesign: route.query.product_design,
      existingPlushieId: route.query.existingPlushieId,
      layout: 'with-images-gallery'
    })
  },
  {
    name: 'golf-shirts-creation',
    path: '/clothes/golf-shirts/create/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'customGolfShirts_bundle',
      productDesign: route.query.product_design,
      existingPlushieId: route.query.existingPlushieId,
      layout: 'with-images-gallery'
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
    path: '/cartoon-pillows/',
    component: CustomizableProduct,
    props: route => ({
      sku: 'customCartoonPillows_bundle',
      productDesign: route.query.product_design,
      layout: 'with-images-gallery'
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
    path: '/pals-kit/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'customPals_bundle',
      existingPlushieId: route.query.existingPlushieId,
      layout: 'vertical'
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
      existingPlushieId: route.query.existingPlushieId,
      layout: 'with-images-gallery'
    })
  },
  {
    name: 'nft-budsies-create',
    path: '/nft-budsies/create/',
    component: CustomizableProduct,
    props: (route) => ({
      sku: 'budsieNft_bundle',
      existingPlushieId: route.query.existingPlushieId,
      layout: 'vertical'
    })
  }
];

routes = makeRoutesStrict(routes);

export default routes;
