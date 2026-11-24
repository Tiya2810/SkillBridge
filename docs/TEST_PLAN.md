# SkillBridge Test Plan

## Test levels

- **Unit:** validators, skill evidence calculation, application transition rules, entitlement logic.
- **Integration:** API plus isolated test database; authorization, indexes, pagination, webhook idempotency.
- **End-to-end:** critical student, recruiter, and admin journeys in a browser.
- **Quality:** accessibility, responsive layouts, security checks, performance, backup/restore.

## Acceptance scenarios

### Browser preview sample data

1. Selecting **Add sample data** from any role dashboard populates the student and company directories, five company profiles, recruiter contacts, matching jobs, seven sample courses, four portfolio projects, applications, and payment-history view.
2. The Company Preview dashboard and Manage Jobs view show the seeded companies and their matching job listings.
3. Seeded profiles, listings, courses, and payment rows are labeled as sample data; payment examples do not initiate a charge or grant an entitlement.
4. Adding sample data in a browser that already contains an earlier preview dataset adds newer sample records without duplicating existing entries.
5. Student, company, and admin dashboards render role-specific accessible column histograms from local preview values, label the BI-inspired visuals as browser-only, and remain usable without horizontal overflow at mobile widths.
6. Course and sample project cards show relevant photography when available; image failures retain the card artwork and profile initials fallback.
7. Student and administrator sample profiles show portraits in the navigation and admin user directory.
8. Adding sample data seeds five certificate design examples without duplicates, including three for Aarav; each example is associated with its matching student profile.
9. The Certificates page shows only the active student's certificate examples and profile name; Aarav must not see Maya's or Rohan's examples. All examples are clearly labeled fictional, not issued or verifiable credentials.
10. The Certificates page shows locally completed enrolled courses separately from profile-specific sample certificate designs, and its cards reflow at mobile widths.
11. Student, company, and admin analytics show labeled, accessible histogram columns whose heights and values match the current local preview records; no live Power BI service is implied.

### Student

1. A student can browse published courses, enroll once, and see the enrollment after refresh.
2. A learner cannot mark a lesson complete for another user's enrollment.
3. A student can upload/edit/archive a project and choose its visibility.
4. A student can revoke recruiter visibility; subsequent recruiter requests omit that profile.
5. A student can apply once to an open job; a second application is rejected without creating a duplicate.
6. A student can withdraw only while the application state allows it.
7. An assessment attempt enforces server-side expiry and attempt limits; answers are not exposed to another account.

### Company

1. An unverified company cannot publish a job or search candidate profiles.
2. A verified recruiter can create and close jobs owned by their company only.
3. Candidate search returns only consent-permitted fields and is paginated.
4. A recruiter can update an application only through allowed states; every update is auditable.
5. An interview stores timezone and participant details with appropriate access controls.

### Administrator and payments

1. Only admin can verify a company or access admin reports.
2. A payment return URL alone does not grant a premium entitlement.
3. Invalid webhook signatures are rejected and create no entitlement.
4. Replayed valid webhook events do not duplicate payment or entitlement records.
5. Sensitive values do not appear in client bundles, logs, or error responses.

### UX and reliability

1. All navigation and modal controls are keyboard operable with visible focus.
2. Pages reflow at mobile widths without horizontal page overflow.
3. Forms display inline validation errors and preserve safe user input after recoverable errors.
4. Empty, loading, error, and success states are defined for data-backed pages.
5. Critical pages remain usable when optional external font or analytics resources are unavailable.

## Quality gates

- Unit and integration suites pass in CI.
- No critical/high dependency or application security issue is left without an approved mitigation.
- Automated accessibility scans plus manual keyboard/screen-reader review meet the agreed WCAG 2.2 AA target.
- Performance is measured with realistic seeded records and target device/network profiles.
- Database restore is exercised before a production release.

## Current prototype verification boundary

The current static prototype can be checked for page rendering, role navigation, modal opening/closing, responsive layout, and JavaScript console errors. It cannot pass server/database/auth/payment acceptance tests because those services are not implemented yet.
