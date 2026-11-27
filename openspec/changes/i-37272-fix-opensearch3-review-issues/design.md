# Design

## Context

See [proposal.md](proposal.md) for motivation. `pages/Category.vue` already has separate initial loading (`composeInitialPageState`, `serverPrefetch`, route guards), infinite-scroll loading (`loadProducts`) and pagination (`changePage`/`updatePage`). The `sortOrder` watcher also calls `changePage` to reload the current page when currentPage is greater than one. Its initial loader swallows all errors. Its async route guards need explicit error completion because Vue Router 3 does not turn a rejected async guard into a completed `next` call automatically.

The core category actions already commit product lists, totals/search positions and current-page products only after the relevant search succeeds. Removing the core browser empty-result fallback makes this existing sequencing sufficient to preserve shown data on a search failure; no transactional product-store layer is needed. `changePage` already sets currentPage after its awaited dispatch.

## Goals / Non-Goals

**Goals:** Put failure policy at the user interaction boundary: reject initial page loading; recover locally from subsequent loading. Keep the existing markup, empty state, notification UI and translations.

**Non-Goals:** No new page-wide state machine, product snapshots, automatic retries, new error layout or theme-porting workflow. Do not refactor unrelated legacy category behavior or broaden presentation changes to other catalog consumers.

## Decisions

### 1. Initial loading rejects; browser guards complete explicitly

Remove the blanket catch in `composeInitialPageState`. SSR `serverPrefetch` lets initial category/product/rewrite failures reject to the existing renderer error handling, which redirects without writing failed output to the cache. SSR route-lookup failures handled by the navigation guard render the existing error route in place; its asyncData sets HTTP 500 and `no-cache`. No server-entry or cache implementation change is needed.

Wrap browser category entry and category-switch guard work in an explicit failure path that completes navigation with `next({name:'error'})`. Include the requested initial non-first-page fetch and missing-category rewrite lookup in that boundary. Ensure the SSR branch of beforeRouteEnter returns after `next()` so it does not also run the browser-entry branch. Complete `next` once in each guard branch.

This reuses the existing Vue Router and error page. Relying on a rejected async guard alone would leave navigation pending; catching initial failures into an empty state would retain the defect. Fatal browser navigation and rejected SSR renders retain their existing `/error/` navigation behavior.

### 2. Recover at subsequent product-load boundaries without mutating success state

For infinite scroll, catch the failed `loadMoreCategoryProducts` dispatch in the existing loading boundary, spawn the existing danger notification and retain its `finally` reset of isProductsLoading. Do not clear products, totals or start offsets; the Vuex action has not committed a failed result. The current intersection observer can try again when the threshold leaves and re-enters view, without a new retry state or timer.

For pagination of an already displayed category, catch at the same-category route-update/user interaction boundary. Keep `changePage` rejecting on dispatch failure so an initial requested page can still use the fatal initial-load path. Do not advance currentPage or substitute current-page products before success; abort the failed page navigation with the existing router mechanism so the next click on that page can retry instead of becoming a duplicate navigation. Use the same notification for this failure, not an error redirect. A failure while changing categories remains an initial-load failure, not a recoverable pagination error.

Handle the `sortOrder` watcher's current-page reload through the same notification handling as pagination. Catch its `changePage` rejection at the watcher boundary, retaining the displayed products and successful page number without an error redirect or unhandled promise rejection. No navigation needs aborting in this watcher. A later page request or sort-triggered reload can retry; keep the low-level `changePage` rejection contract so initial page loading still fails normally.

Reuse `notification/spawnNotification` with `type:'danger'` and existing translated `Something went wrong. Please try again.` If extracting the small shared asynchronous loading/notification logic makes responsibilities clearer, use a focused composable with `useStore`/`useI18n` from application-services and setup-owned refs. Do not recover services from a Vue instance or add direct API calls. Product snapshots or rollback mutations would duplicate the core store's existing successful-update guarantees without improving the required behavior.

### 3. Keep the change on the current theme branch

The category component is identical on the category-bearing default themes; Bulk Orders has no category page. The fix is implemented once on the petsies-based branch and flows through normal theme merges, with no direct edits or branch switching for the other themes.

## Risks / Trade-offs

- A failed scroll may leave the threshold visible → Retry occurs on the next qualifying threshold re-entry, not an automatic retry loop; loading is always unlocked.
- Background browser cache warming retains its existing presentation behavior → Only failure of required initial data, route resolution or a requested subsequent product load gets the new page/notification policy.
- Fatal browser navigation and rejected SSR renders replace the URL with `/error/`, so reloading it does not retry the original page → Accepted existing behavior; no restoration mechanism is introduced. SSR lookup failures can render the error route in place instead.
- Large existing Category.vue → Keep edits focused; extract cohesive new reusable async logic only, not a mechanical full-page rewrite.

## Migration Plan

No migration or new persisted state. Use with the same-named storefront/API changes so catalog failures reject and lookup APIs expose errors. Normal source rollback is sufficient; execution of releases and standard cross-theme merges is outside this change.
