# Spec Delta

## Purpose

Distinguish nonexistent categories from loading failures and existing empty categories, while preserving visible products and a simple retry path for subsequent product loads.

## ADDED Requirements

### Requirement: Nonexistent category routes show an uncached page-not-found response

For `/c/<slug>/`, the storefront SHALL resolve category existence before loading category products. If the category lookup succeeds without a category and the url-rewrite lookup succeeds without a rewrite, a direct SSR request SHALL return HTTP 404 with the existing page-not-found content in that response, not an HTTP 200 empty category or an HTTP redirect followed by a 404 elsewhere. The confirmed miss SHALL use a terminal route without re-entering URL mapping or making further Storyblok/url-rewrite lookups. In-app entry and navigation between categories SHALL show the existing page-not-found page and complete navigation; SPA navigation has no new document HTTP response whose status can change. Existing categories with zero products SHALL remain successful category pages with "No products found!". A successful rewrite SHALL retain its existing redirect behavior. Lookup failures before a miss is confirmed SHALL remain backend failures handled by the existing error page, not category misses.

The existing page-not-found `no-cache` policy SHALL remain in effect. The original URL's SSR output cache SHALL store neither the missing-category response nor a redirect standing in for that response. No new persistent missing-category cache SHALL be introduced. After a category becomes available in the catalog index, a fresh direct request to the same URL SHALL be able to render it without waiting for a new 404 cache entry to expire. Existing browser query-cache freshness behavior is unchanged.

#### Scenario: Direct load of an absent category
- **WHEN** a direct SSR request to `/c/<slug>/` successfully finds neither a category nor a url-rewrite
- **THEN** the original request returns HTTP 404 and the existing page-not-found content, with the existing cache opt-out and no HTTP redirect
- **AND** no category-product search is performed, no further URL mapping or Storyblok/url-rewrite lookup runs after the confirmed miss, and no missing-category output is stored in the SSR output cache

#### Scenario: In-app navigation to an absent category
- **WHEN** the customer enters a nonexistent category or changes from a shown category to one, and category/rewrite lookups both succeed with no match
- **THEN** the existing page-not-found page appears without hanging navigation, a routing loop or an empty-category message
- **AND** category products are not requested for the absent category and no further URL mapping or Storyblok/url-rewrite lookup runs after the confirmed miss

#### Scenario: Missing category has a rewrite
- **WHEN** no category is found but a url-rewrite exists for the request path
- **THEN** the storefront preserves the existing SSR redirect status/target and browser redirect behavior instead of returning page-not-found
- **AND** products are not loaded for the absent source category

#### Scenario: Missing category becomes available later
- **WHEN** a direct category request returned an uncached 404 and the category is subsequently indexed successfully
- **THEN** a fresh direct request to the same URL can render the category with HTTP 200 without expiring or invalidating a newly stored missing-category response

#### Scenario: Category absence cannot hide a rewrite failure
- **WHEN** the category lookup succeeds with no match but the rewrite lookup fails
- **THEN** the storefront uses the existing backend error page, not a 404 or "No products found!"

### Requirement: Failed initial category loads use the existing error page

When a category cannot load its category data, initial products or required route rewrite because of a backend failure, the page SHALL use the existing error page rather than display "No products found!" or page-not-found. This SHALL apply to SSR, in-app entry and navigation between categories, including a requested initial non-first page. Missing-category rewrite behavior SHALL remain unchanged on successful lookups. No new error-page copy or inline category error state SHALL be introduced.

#### Scenario: Direct category load fails
- **WHEN** the category's initial product load fails during SSR prefetch
- **THEN** the render rejects into the existing error path instead of rendering a successful empty category

#### Scenario: Category existence lookup fails before rendering
- **WHEN** initial category existence resolution fails during SSR navigation
- **THEN** navigation selects the existing HTTP 500 error page rather than treating the failure as an absent category

#### Scenario: In-app category navigation fails
- **WHEN** entering a category or switching to a different category fails while loading its required data or rewrite
- **THEN** navigation completes through the existing error route, without leaving the navigation pending or displaying an empty category

#### Scenario: Successful empty category
- **WHEN** a category loads successfully and its product count is zero
- **THEN** the existing "No products found!" presentation remains

### Requirement: Subsequent product-load failures preserve the shown category

When infinite scroll, pagination or a sort-triggered reload of the current non-first page cannot load the requested products of a shown category, the page SHALL retain the products already displayed, product totals and last successful paging position. It SHALL show the existing danger notification "Something went wrong. Please try again." using the existing translation. Loading indicators SHALL stop, and the next qualifying scroll, page request or sort-triggered reload SHALL be able to retry. The page SHALL NOT redirect to the error page or replace products with the empty-category message for this failure.

#### Scenario: Infinite scroll fails and retries
- **WHEN** a shown category's next infinite-scroll request fails
- **THEN** visible products and search position remain unchanged and the danger notification appears
- **AND** loading ends and the next threshold re-entry can retry the same range, appending products once after success

#### Scenario: Pagination fails and retries
- **WHEN** a shown category's requested page fails to load
- **THEN** the last successful page's products and selected page remain visible and the danger notification appears
- **AND** clicking the requested page again retries it and changes the selected page only after successful loading

#### Scenario: Sort-triggered current-page reload fails
- **WHEN** a sort change reloads a shown category's current page greater than one and the reload fails
- **THEN** the displayed products and selected page remain unchanged and the existing danger notification appears, without an unhandled promise rejection
- **AND** a later page request or sort-triggered reload can load the requested products successfully
