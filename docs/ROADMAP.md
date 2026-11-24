# SkillBridge Development Roadmap

The timeline is a planning estimate for a small student team. Finish and review each phase before starting the next. Do not treat the timeline as a promise of production readiness.

## Phase 0 — Baseline and design (1 week)

- Agree on requirements, personas, consent rules, and demo-data policy.
- Confirm page flows and acceptance criteria with student and recruiter reviewers.
- Establish Git workflow, issue tracking, and design tokens.
- Deliver: approved scope, architecture, threat/privacy checklist.

## Phase 1 — Foundation (1–2 weeks)

- Set up TypeScript web app and Express API, environment configuration, linting, and CI.
- Establish MongoDB dev/staging databases and run the schema bootstrap/migration process.
- Add request validation, structured logging, health checks, and error response format.
- Deliver: deployable empty application and documented local setup.

## Phase 2 — Identity and profiles (1–2 weeks)

- Registration, login, logout, reset flow, verification, session revocation.
- Student/company role setup, profile CRUD, company verification queue.
- Add authorization and ownership tests before exposing private records.
- Deliver: secure role-based account vertical slice.

## Phase 3 — Learning MVP (2 weeks)

- Course catalog, course detail, enrollment, lessons, progress, assignments, feedback.
- Add instructor content-management workflow.
- Deliver: student can enroll, learn, submit work, and see progress.

## Phase 4 — Portfolio and competency evidence (2 weeks)

- Private file uploads, project CRUD, visibility controls, evidence records.
- Rubrics, assessment attempts, review feedback, competency history.
- Validate that scores show evidence and do not claim unsupported verification.
- Deliver: consent-controlled public portfolio and auditable skill evidence.

## Phase 5 — Recruitment vertical slice (2 weeks)

- Company verification, job CRUD, candidate filters, student applications, status pipeline.
- Add consent-aware candidate queries and access audit events.
- Deliver: one complete job from posting through an interview decision.

## Phase 6 — Commerce and notifications (1–2 weeks)

- Premium entitlements and company plan configuration.
- Payment provider sandbox, signed webhooks, idempotency and refund state flow.
- Email/in-app notification preferences and delivery retries.
- Deliver: tested sandbox transaction and entitlement lifecycle.

## Phase 7 — Quality and pilot (2 weeks)

- Accessibility, security, performance, restore, and cross-browser checks.
- Pilot with fictional/demo accounts first; then a small consented pilot group.
- Resolve critical defects and document support and incident procedures.
- Deliver: pilot release candidate with rollback and support plan.

## Deferred until evidence supports them

- AI project feedback, resume analysis, automated matching, native mobile apps.
- AI features require clear disclosure, human review, bias evaluation, data minimization, and a non-AI alternative. They are not MVP dependencies.

## Release gates

1. No critical/high security findings remain open.
2. All authorization and privacy tests pass.
3. Payment entitlements are based only on verified provider callbacks.
4. Backups have been restored successfully in a test environment.
5. Accessibility and browser acceptance criteria pass.
6. Production data, legal/privacy notice, retention policy, and support ownership are ready.
