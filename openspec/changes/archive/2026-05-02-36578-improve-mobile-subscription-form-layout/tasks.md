## 1. Shared Form Layout

- [x] 1.1 Update `src/themes/petsies-capybara/components/molecules/m-subscription-form.vue` to apply a mobile-specific stacked layout for the form row while preserving the existing larger-breakpoint layout.
- [x] 1.2 Adjust shared CTA spacing and sizing in `m-subscription-form.vue` so the button remains aligned, readable, and tappable in the stacked mobile layout.

## 2. Consumer Coverage

- [x] 2.1 Verify newsletter, mailing-list, and Storyblok-backed subscription form consumers inherit the shared responsive layout without wrapper-specific overrides.
- [x] 2.2 Confirm no additional template or store changes are required because the layout change stays within the shared presentational component.

## 3. Regression Validation

- [x] 3.1 Validate that subscription form validation, submission, persisted email behavior, and success-state rendering remain unchanged after the style update.
- [x] 3.2 Check common mobile and non-mobile viewport widths to confirm stacked mobile behavior and unchanged larger-breakpoint layout.