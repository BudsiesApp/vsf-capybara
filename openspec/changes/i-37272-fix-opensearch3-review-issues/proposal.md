# Proposal

## Why

The category page catches initial load failures and renders an empty category, including during SSR. Later product-load failures also need explicit customer feedback without discarding the products already visible.

## What Changes

- Let failed initial category/product/rewrite loads reach the existing error page on SSR and in-app navigation.
- Keep genuine empty categories unchanged.
- Keep shown products and paging state when infinite-scroll, pagination or a sort-triggered current-page reload fails; show the existing danger notification and allow the next scroll, page click or reload to retry.
- Reuse the current `/error/` page, notification system and translated copy, with no new UI state or design.

## Capabilities

### New Capabilities

- `category-loading-feedback`: Differentiate initial category failures, genuine empty categories and recoverable subsequent product-load failures.

### Modified Capabilities

None.

## Impact

- `pages/Category.vue`, narrowly scoped loading helpers/composables if needed and focused tests alongside the existing page suite.
- Depends on the same-named storefront change rejecting failed catalog and route lookups, and the same-named API change exposing lookup errors.
- Only the petsies-based task branch changes. Other category-bearing themes receive it through the normal merge flow; no porting, new error-page design, other catalog consumer messages or deployment.
