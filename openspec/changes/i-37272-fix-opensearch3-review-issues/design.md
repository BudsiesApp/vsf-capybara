# Design

## Context

See [proposal.md](proposal.md) for motivation. `pages/Category.vue` has initial loading through `composeInitialPageState`, `serverPrefetch` and route guards, plus pagination through `changePage`/`updatePage`. Recoverable product loading now uses the app-scoped `helpers/use-category-products-loading.ts` composable. The `sortOrder` watcher also reloads the current page when currentPage is greater than one. The explicit `/c/:slug/` route currently loads products even when the category lookup succeeds with null, so it can render a missing category as a successful empty one.

The core category actions already commit product lists, totals/search positions and current-page products only after the relevant search succeeds. Removing the core browser empty-result fallback makes this existing sequencing sufficient to preserve shown data on a search failure; no transactional product-store layer is needed. `changePage` already sets currentPage after its awaited dispatch.

## Goals / Non-Goals

**Goals:** Put failure policy at the user interaction boundary: reject failed initial page loading, distinguish successful category misses before loading products, and recover locally from subsequent loading. Keep the existing page-not-found page, its HTTP 404/cache behavior, category empty state, notification UI and translations.

**Non-Goals:** No new page-wide state machine, product snapshots, automatic retries, new error layout, negative-response cache, browser query-cache expiry or theme-porting workflow. Do not refactor unrelated legacy category behavior or broaden presentation changes to other catalog consumers.

## Decisions

### 1. Initial loading rejects; browser guards complete explicitly

Remove the blanket catch in `composeInitialPageState`. SSR `serverPrefetch` lets initial category/product/rewrite failures reject to the existing renderer error handling, which redirects without writing failed output to the cache. SSR route-lookup failures handled by the navigation guard render the existing error route in place; its asyncData sets HTTP 500 and `no-cache`. No server-entry or cache implementation change is needed.

Wrap browser category entry and category-switch guard work in an explicit failure path that completes navigation with `next({name:'error'})`. Include the requested initial non-first-page fetch and missing-category rewrite lookup in that boundary. The SSR navigation branch must resolve category absence before completing navigation, as described below, while leaving successful initial product loading in serverPrefetch. Complete `next` once in each guard branch.

This reuses the existing Vue Router and error page. Relying on a rejected async guard alone would leave navigation pending; catching initial failures into an empty state would retain the defect. Fatal browser navigation and rejected SSR renders retain their existing `/error/` navigation behavior.

### 2. Recover at subsequent product-load boundaries without mutating success state

For infinite scroll, catch the failed `loadMoreCategoryProducts` dispatch in the existing loading boundary, spawn the existing danger notification and retain its `finally` reset of isProductsLoading. Do not clear products, totals or start offsets; the Vuex action has not committed a failed result. The current intersection observer can try again when the threshold leaves and re-enters view, without a new retry state or timer.

For pagination of an already displayed category, catch at the same-category route-update/user interaction boundary. Keep `changePage` rejecting on dispatch failure so an initial requested page can still use the fatal initial-load path. Do not advance currentPage or substitute current-page products before success; abort the failed page navigation with the existing router mechanism so the next click on that page can retry instead of becoming a duplicate navigation. Use the same notification for this failure, not an error redirect. A failure while changing categories remains an initial-load failure, not a recoverable pagination error.

Handle the `sortOrder` watcher's current-page reload through the same notification handling as pagination. Catch its `changePage` rejection at the watcher boundary, retaining the displayed products and successful page number without an error redirect or unhandled promise rejection. No navigation needs aborting in this watcher. A later page request or sort-triggered reload can retry; keep the low-level `changePage` rejection contract so initial page loading still fails normally.

Keep `helpers/use-category-products-loading.ts`, initialized in setup with application-services, for the shared loading ref and `notification/spawnNotification` behavior using the existing translated danger message. Missing-category resolution is initial routing, not a recoverable product-load failure, and must not use this composable's catch-and-notify wrapper. Do not recover services from a Vue instance or add direct API calls. Product snapshots or rollback mutations would duplicate the core store's existing successful-update guarantees without improving the required behavior.

### 3. Resolve missing categories before products and before the SSR page is chosen

Split category resolution from initial product loading. Reuse a loaded category or dispatch `category-next/loadCategory`; only a successful null result is a miss. Return before product search, page-specific product fetching and category-visited hooks when no category exists. A real category with zero products follows the existing successful loading/empty-state path.

On a category miss, use the existing `urlRewrite/loadUrlRewrite` action to distinguish a missing rewrite from a found rewrite. Preserve the existing rewrite-application path, including its SSR redirect status and target. Do not infer rewrite absence solely from `mappingFallbackForUrlRewrite` returning undefined: in SSR it also returns undefined after recording a successful redirect. Keep the category/rewrite outcome explicit so a recorded rewrite is not replaced by a 404.

Resolve this missing-category decision in initial SSR navigation before selecting the component to render, and use the same decision for browser entry and category switches. Select the dedicated terminal theme route `category-not-found` on a successful category-plus-rewrite miss. It is explicitly registered at `/category-not-found/` and renders the existing `Error.vue` component. Do not select the wildcard `page-not-found` route: the global URL guard sends that route through URL mapping again, and a subsequent Storyblok failure could turn an already confirmed miss into HTTP 500. The explicit `category-not-found` match does not meet that fallback condition, so navigation completes once without another Storyblok/url-rewrite lookup, category-route re-entry or a loop. Keep the orchestration in Category.vue or a focused theme-owned routing service that receives the store explicitly, not a side-effectful pure-helper or a setup composable called outside setup. All requests remain Vuex dispatches through existing actions.

The reused page-not-found component renders as the original SSR response: `Error.vue.asyncData` recognizes both `page-not-found` and `category-not-found` as HTTP 404 and adds `no-cache`. Do not implement the miss by throwing a 404 from serverPrefetch or recording a redirect to `/page-not-found`: the existing SSR error handler would send a redirect, not the required original-request HTTP 404. Do not expose renderer contexts to components or add a new status/cache service. This is a theme routing change; no API or core-cache implementation change is needed.

Retain the current `Error.vue` page-not-found presentation and `no-cache` marker. The output-cache writer already honors that marker independently of the response status, so no negative caching, cache TTL, invalidation workflow or global error-page redesign is added. Focused route/SSR tests cover the newly introduced missing-category response and its existing cache opt-out; they do not add the previously unnecessary rejected-render cache harness test.

### 4. Keep the change on the current theme branch

The category component is identical on the category-bearing default themes; Bulk Orders has no category page. The fix is implemented once on the petsies-based branch and flows through normal theme merges, with no direct edits or branch switching for the other themes.

## Risks / Trade-offs

- A failed scroll may leave the threshold visible → Retry occurs on the next qualifying threshold re-entry, not an automatic retry loop; loading is always unlocked.
- Background browser cache warming retains its existing presentation behavior → Only failure of required initial data, route resolution or a requested subsequent product load gets the new page/notification policy.
- Fatal browser navigation and rejected SSR renders replace the URL with `/error/`, so reloading it does not retry the original page → Accepted existing behavior; no restoration mechanism is introduced. SSR lookup failures can render the error route in place instead.
- Large existing Category.vue → Keep edits focused; extract cohesive new reusable async logic only, not a mechanical full-page rewrite.
- The browser query cache can retain a successful empty category lookup in an already-open tab → Accepted existing freshness behavior; a fresh direct request after indexing is not held by an SSR 404 cache entry. No browser-cache expiry or missing-route persistence mechanism is introduced.
- An empty HTTP 200 page cached before this correction can survive until normal expiry or invalidation → Keep existing cache operations; this change prevents new missing-category output-cache entries rather than migrating old entries.

## Migration Plan

No migration or new persisted state. Use with the same-named storefront/API changes so catalog failures reject and lookup APIs expose errors. Normal source rollback is sufficient; execution of releases and standard cross-theme merges is outside this change.
