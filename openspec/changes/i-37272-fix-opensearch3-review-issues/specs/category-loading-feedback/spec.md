# Spec Delta

## Purpose

Show category loading failures honestly while preserving visible products and a simple retry path for subsequent product loads.

## ADDED Requirements

### Requirement: Failed initial category loads use the existing error page

When a category cannot load its category data, initial products or required route rewrite because of a backend failure, the page SHALL use the existing error page rather than display "No products found!" or page-not-found. This SHALL apply to SSR, in-app entry and navigation between categories, including a requested initial non-first page. Missing-category rewrite behavior SHALL remain unchanged on successful lookups. No new error-page copy or inline category error state SHALL be introduced.

#### Scenario: Direct category load fails
- **WHEN** the category's initial catalog load fails during SSR
- **THEN** the render rejects into the existing error path instead of rendering a successful empty category

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
