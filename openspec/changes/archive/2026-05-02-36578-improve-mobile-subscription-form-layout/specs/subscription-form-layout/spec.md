## ADDED Requirements

### Requirement: Subscription forms stack controls on mobile viewports
The system SHALL render reusable subscription forms in a vertical layout on mobile viewports so the email input appears above the related call-to-action button.

#### Scenario: Shared subscription form renders stacked controls on mobile
- **WHEN** a customer views any storefront surface that uses the shared subscription form on a mobile viewport
- **THEN** the email input MUST be displayed above the call-to-action button
- **THEN** the two controls MUST remain visually aligned as part of the same form

### Requirement: Subscription form controls remain readable and tappable on narrow screens
The system SHALL size and space the reusable subscription form controls on narrow mobile widths so button text does not become cramped and both controls remain comfortably tappable.

#### Scenario: Mobile CTA remains usable on narrow widths
- **WHEN** the shared subscription form is rendered on a narrow mobile viewport
- **THEN** the call-to-action button text MUST remain readable without overflow caused by the responsive layout
- **THEN** the input and button spacing MUST support comfortable touch interaction

### Requirement: Responsive layout changes do not alter existing form behavior
The system SHALL preserve the existing validation, submission, tracking, and success-state behavior of reusable subscription forms while applying the responsive mobile layout.

#### Scenario: Existing subscription behavior is preserved
- **WHEN** a customer interacts with a reusable subscription form after the responsive layout change
- **THEN** validation rules, submission handling, and success messaging MUST behave the same as before the layout update
- **THEN** larger viewports MUST continue using the existing non-mobile layout