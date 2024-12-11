const ErrorPage = () =>
  import(/* webpackChunkName: "vsf-error" */ 'theme/pages/Error');
const StoryblokPage = () => import(/* webpackChunkName: "vsf-storyblok" */ 'src/modules/vsf-storyblok-module/pages/StoryblokPage.vue')

function makeRoutesStrict (routes) {
  return routes.map((route) => {
    route.pathToRegexpOptions = {
      strict: true
    }

    return route;
  })
}

let routes = [
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
  { name: 'page-not-found', path: '*', component: ErrorPage },
  { name: 'error', path: '/error/', component: ErrorPage }
];

routes = makeRoutesStrict(routes);

export default routes;
