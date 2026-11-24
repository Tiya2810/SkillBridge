# SkillBridge Architecture

## Logical view

```text
Student / Recruiter / Instructor / Admin
                 |
          HTTPS web client
       (role-specific Next.js UI)
                 |
    API gateway / Express REST API
     |          |          |          |
 Identity    Learning   Portfolio   Recruitment
     |          |          |          |
     +-------- MongoDB Atlas ---------+
                 |
    Private object storage (files)
                 |
 Payment provider / Email provider
        verified server callbacks
```

The current `index.html`, `styles.css`, and `app.js` files are a standalone front-end demonstration. The diagram is the target architecture, not a claim that those services are already implemented.

## Recommended module boundaries

- **Identity and access:** accounts, sessions, role grants, verification, consent.
- **Learning:** course catalog, lessons, enrollments, submissions, assessments.
- **Portfolio and skills:** projects, evidence, rubrics, competency history, visibility.
- **Recruitment:** company profiles, job listings, applications, interviews, offers.
- **Commerce:** product entitlements, payment orders, signed webhook processing, refunds.
- **Administration:** moderation queues, audit trail, platform reports.
- **Notifications:** in-app notifications and queued email delivery.

Keep HTTP controllers thin: validate inputs, authorize the requested action, call a domain service, and serialize a deliberate response. Do not put business rules in UI components or rely on client-side role switching for security.

## Trust boundaries and data flow

1. The browser is untrusted. Validate all request bodies, query parameters, identifiers, and uploaded files on the server.
2. Authentication identifies the actor; authorization checks role, ownership, company verification, consent, and resource state.
3. API services own state transitions. Application status changes should use an allowed transition table and create an audit event.
4. The database stores private profile and application data. Recruiter queries must project only permitted fields.
5. Object storage uses private buckets. API issues short-lived signed URLs after authorization.
6. External payment callbacks are verified using provider signatures and idempotency keys before entitlements change.

## Data ownership and privacy

- Students own their profile, projects, preferences, and consent choices.
- Companies own company profiles and job postings; they do not own candidate profiles.
- Applications establish a limited-purpose hiring relationship and do not bypass candidate visibility preferences.
- Store consent timestamp, scope, and revocation timestamp when personal information is shared.
- Keep authentication secrets, resume files, assessment answer keys, and payment references out of public portfolio responses.
- Use retention rules for inactive applications, assessment data, support tickets, and deleted accounts.

## MongoDB guidance

`database/schema.mongodb.js` is a `mongosh` starter that creates validated collections and frequently used indexes. Add migrations for future changes; do not make manual production schema edits without a migration record. Use references for independently updated/high-volume entities and embed only small bounded values.

Production deployment should use:

- Dedicated least-privilege database users per environment.
- TLS, encrypted backups, managed secrets, and network restrictions.
- Unique indexes for normalized email and duplicate enrollment/application prevention.
- Compound indexes aligned with actual query patterns.
- Pagination and query limits on list endpoints.
- A backup restore drill and monitoring for slow queries.

## Authentication and authorization

- Prefer server-managed `HttpOnly`, `Secure`, `SameSite` cookies for browser sessions, with CSRF protection for state-changing requests.
- If token authentication is selected, keep access tokens short-lived and implement refresh-token rotation and revocation.
- Hash passwords with Argon2id or an approved equivalent; use generic login/reset responses to reduce account enumeration.
- Rate limit login, reset, assessment attempts, uploads, applications, and recruiter search.
- Apply authorization per resource and operation (RBAC plus ownership/consent checks).
- Record privileged actions and sensitive profile access in an audit log.

## Observability and operations

- Structured logs with request ID, actor ID when known, route, status, and latency; never log passwords, tokens, assessment secrets, or full private profile documents.
- Metrics for API latency/errors, queue depth, database saturation, payment webhook failures, and file upload failures.
- Alert on unusual access patterns and failed provider signature checks.
- Separate dev/staging/prod; seed only fictional data in dev and staging.
