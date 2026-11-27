# Tasks

## 1. Initial category failures

- [x] 1.1 Remove the swallowed error in `composeInitialPageState` and let category/rewrite serverPrefetch failures reject; add focused page tests and verify successful empty categories still use the existing empty state while failed initial loads reject.
- [x] 1.2 Complete browser category-entry/category-switch guards explicitly through the existing error route on required-data or rewrite failure, including an initial non-first page, and return from the SSR guard branch after next; verify guard tests call next exactly once and never leave a failed navigation pending.

## 2. Subsequent product loading

- [x] 2.1 Catch infinite-scroll load failures at the interaction boundary, spawn the existing translated danger notification and always unlock the loading ref; verify a focused test preserves shown products/totals/search position and permits retrying the same range after failure.
- [x] 2.2 Handle pagination failures and the `sortOrder` watcher's current-page reload failures through the same notification handling, while keeping initial requested-page failures fatal; verify focused tests retain products and currentPage, notify once, abort only failed page navigation, catch watcher rejections and allow a later page request or sort reload to succeed.
- [x] 2.3 Keep any extracted asynchronous UI logic in a focused composable using application-services and setup-owned refs; verify changed code adds no direct component API calls, Vue-instance service recovery, product snapshots or duplicate failed-result commits, and existing category readiness tests still pass.

## 3. Integration and browser inspection

- [x] 3.1 Run the focused category suites through the storefront's Jest configuration and the maintained unit/lint/build checks with both companions present; verify the existing category layout, empty-state markup and Storyblok readiness behavior remain unchanged.
- [ ] 3.2 Inspect the affected page in the local browser at desktop pagination and mobile infinite-scroll widths, using controlled request failures: verify initial loading reaches the existing error page, subsequent pagination/scroll failures and a sort-triggered reload failure on a non-first page retain cards and show the existing danger notification, loading stops and a later page request/qualifying scroll/sort reload can retry; verify a successful empty response still displays the unchanged empty-state copy.
