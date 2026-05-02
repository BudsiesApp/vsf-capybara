## Context

The storefront reuses `m-subscription-form` as the shared implementation for newsletter and mailing-list subscription surfaces, including Storyblok-backed content blocks. Today the form layout is a single horizontal flex row with spacing tuned for larger viewports, which creates a cramped experience on narrow mobile screens.

This change is constrained to presentation only. The existing submit action contract, validation rules, analytics/tracking hooks, persisted email behavior, and success-state flow must remain unchanged.

## Goals / Non-Goals

**Goals:**
- Make reusable subscription forms render in a vertical mobile layout with the email input above the CTA.
- Keep the change centralized in the shared component so all current consumers inherit the improvement consistently.
- Preserve the current desktop and tablet behavior unless a layout adjustment is strictly required to support the mobile fix.
- Prevent button text and control spacing from becoming cramped on common mobile widths.

**Non-Goals:**
- Changing subscription APIs, Vuex actions, validation messages, or success-state copy.
- Introducing a new subscription form variant or a separate mobile-only component.
- Redesigning nearby page sections outside the subscription form itself.

## Decisions

### Decision: Implement the responsive change in the shared `m-subscription-form` styles
This component is the common rendering surface for newsletter and mailing-list forms, so a single scoped style change provides the broadest coverage with the smallest maintenance cost.

Alternative considered: applying page-level or wrapper-level overrides.
That was rejected because it would duplicate responsive rules across multiple surfaces and risks inconsistent behavior between direct theme usage and Storyblok usage.

### Decision: Keep the existing markup and interaction flow, and only adjust responsive layout rules
The current DOM order already places the email input before the CTA, which matches the intended mobile stack. Using responsive flex-direction, spacing, and width adjustments avoids touching validation, submit handling, or tracking-related behavior.

Alternative considered: splitting the form into separate mobile and desktop templates.
That was rejected because it would increase template complexity and create unnecessary risk for regressions in validation and submission handling.

### Decision: Treat CTA sizing as part of the layout fix
The button spacing and width need mobile-specific adjustment together with the vertical stack so the CTA remains readable and tappable rather than inheriting horizontal-row spacing that only works on wider screens.

Alternative considered: stacking controls without changing CTA spacing or width.
That was rejected because the existing left margin and compact sizing would leave the button visually misaligned in the stacked layout.

## Risks / Trade-offs

- Shared component impact across multiple surfaces -> Mitigation: keep the change CSS-only in the shared form component and verify newsletter, mailing-list, and Storyblok-backed usage.
- Breakpoint choice could affect small tablets or large phones differently -> Mitigation: use the project’s existing mobile breakpoint convention and keep desktop/tablet layout unchanged above that threshold.
- Scoped style changes may still be influenced by surrounding layout containers -> Mitigation: limit the change to the form row and CTA sizing so parent containers keep their current responsibilities.

## Migration Plan

No data migration or rollout sequencing is required. The change can ship as a standard storefront theme update and can be rolled back by reverting the shared component style change if a layout regression is found.

## Open Questions

None. The Redmine task defines the target behavior and explicitly excludes validation and submission changes.