# Proposal

## Why

The category page catches initial load failures and renders an empty category, including during SSR. Later product-load failures also need explicit customer feedback without discarding the products already visible.

## What Changes

- Let failed initial category/product/rewrite loads reach the existing error page on SSR and in-app navigation.
- Resolve a successful category miss before requesting products. If no url-rewrite exists, show the existing page-not-found page with an uncached HTTP 404 on the original SSR request, and show the same page on in-app navigation.
- Keep genuine empty categories unchanged.
- Keep shown products and paging state when infinite-scroll, pagination or a sort-triggered current-page reload fails; show the existing danger notification and allow the next scroll, page click or reload to retry.
- Reuse the current error and page-not-found pages, their existing cache opt-outs, notification system and translated copy, with no new UI design or negative-response cache.

## Capabilities

### New Capabilities

- `category-loading-feedback`: Differentiate nonexistent categories, initial category failures, existing empty categories and recoverable subsequent product-load failures.

### Modified Capabilities

None.

## Impact

- `pages/Category.vue`, a focused theme-owned category-route loading service if needed, and focused routing/SSR tests alongside the existing page suite. Keep the existing `helpers/use-category-products-loading.ts` composable for recoverable product loads.
- Depends on the same-named storefront change rejecting failed catalog and route lookups, and the same-named API change exposing lookup errors.
- Only the petsies-based task branch changes. Other category-bearing themes receive it through the normal merge flow; no porting, new error-page design, other catalog consumer messages or deployment.
