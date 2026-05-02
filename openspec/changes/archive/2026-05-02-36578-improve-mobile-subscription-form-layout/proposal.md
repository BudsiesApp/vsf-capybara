## Why

Subscription forms currently render the email input and CTA button side by side, which becomes cramped on narrow mobile viewports and harder to use when the on-screen keyboard is open. This needs to be addressed now because the shared subscription form pattern is reused across storefront surfaces, so the layout problem can affect multiple customer entry points.

## What Changes

- Update the shared subscription form layout so mobile screens stack the email input above the CTA button.
- Keep the existing horizontal layout for larger breakpoints unless the same readability issue exists there.
- Ensure the CTA remains readable and tappable on narrow widths without changing validation, submission, tracking, or success-state behavior.
- Apply the responsive layout change through the reusable subscription form component so newsletter and mailing-list variants inherit it consistently.

## Capabilities

### New Capabilities
- `subscription-form-layout`: Defines responsive layout requirements for reusable subscription forms so mobile viewports display the email field and CTA in a vertical, readable, tappable arrangement.

### Modified Capabilities
None.

## Impact

- Affected code: shared subscription form component and any wrappers that reuse it, including newsletter, mailing-list, and Storyblok-backed subscription form surfaces.
- Affected systems: storefront theme styling and responsive behavior only.
- No API, analytics, validation, or submission contract changes are expected.