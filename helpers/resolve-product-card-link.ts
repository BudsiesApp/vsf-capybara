import { LocalizedRoute } from '@vue-storefront/core/lib/types';
import { RawLocation } from 'vue-router';

function toRawLocation (route: LocalizedRoute): RawLocation {
  const params: Record<string, string> = {};

  for (const key of Object.keys(route.params || {})) {
    const value = route.params?.[key];

    if (value !== undefined && value !== null) {
      params[key] = String(value);
    }
  }

  return {
    path: route.path,
    name: route.name,
    hash: route.hash,
    params
  };
}

export function resolveProductCardLink (
  link: string | LocalizedRoute,
  resolveRoute: (route: RawLocation) => string
): string {
  if (typeof link === 'string') {
    return link;
  }

  if (link.fullPath) {
    return link.fullPath;
  }

  return resolveRoute(toRawLocation(link));
}
