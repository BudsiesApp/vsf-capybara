import { Route } from 'vue-router';

const configurableProductRouteName = 'configurable-product';

export function isConfigurableProductLinkActive (link: Route, currentRoute: Route): boolean {
  if (
    link.name !== configurableProductRouteName ||
     currentRoute.name !== configurableProductRouteName
  ) {
    return false;
  }

  return link.params.parentSku === currentRoute.params.parentSku;
}
