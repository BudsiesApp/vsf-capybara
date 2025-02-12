const ErrorPage = () =>
  import(/* webpackChunkName: "vsf-error" */ 'theme/pages/Error');
const StoryblokPage = () => import(/* webpackChunkName: "vsf-storyblok" */ 'src/modules/vsf-storyblok-module/pages/StoryblokPage.vue')
const Checkout = () =>
  import(/* webpackChunkName: "vsf-checkout" */ 'theme/pages/Checkout');
const DetailedCart = () =>
  import(/* webpackChunkName: "vsf-detailed-cart" */ 'theme/pages/DetailedCart');
const MyAccount = () =>
  import(/* webpackChunkName: "vsf-my-account" */ 'theme/pages/MyAccount');
const CreativityKitProduct = () =>
  import(/* webpackChunkName: "vsf-creativity-kit-product" */ 'theme/pages/CreativityKitProduct');

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
    name: 'giftbox',
    path: '/gift-box/',
    component: CreativityKitProduct
  },
  {
    name: 'home',
    path: '/',
    component: StoryblokPage
  },
  {
    name: 'home-alias',
    path: '/education/',
    redirect: (route) =>
      ({
        name: 'home',
        redirect: {
          name: 'home',
          query: route.query
        }
      })
  },
  {
    name: 'terms-of-service',
    path: '/terms-of-service/',
    redirect: {
      name: 'terms-of-service-alias',
      params: {
        slug: 'terms-of-service'
      }
    }
  },
  {
    name: 'terms-of-service-alias',
    component: StoryblokPage,
    path: '/terms-of-service/'
  },
  { name: 'my-account', path: '/my-account/', component: MyAccount },
  { name: 'page-not-found', path: '*', component: ErrorPage },
  { name: 'error', path: '/error/', component: ErrorPage }
];

routes = makeRoutesStrict(routes);

export default routes;
