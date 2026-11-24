# SkillBridge REST API Contract (v1 draft)

Base path: `/api/v1`. All production endpoints require HTTPS. JSON responses use consistent errors:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request could not be validated.",
    "requestId": "req_..."
  }
}
```

List responses are paginated with `limit` (default 20, maximum 100) and `cursor`; never return an unbounded collection. IDs are opaque. Dates are ISO-8601 UTC.

## Authentication

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Create student or company user; company account remains unverified. |
| POST | `/auth/login` | Public, rate-limited | Create a secure session. |
| POST | `/auth/logout` | Authenticated | Revoke current session. |
| POST | `/auth/password/forgot` | Public, rate-limited | Request a generic password-reset response. |
| POST | `/auth/password/reset` | Reset token | Replace password and revoke old sessions. |
| GET | `/auth/me` | Authenticated | Return current actor and safe profile summary. |

## Student

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET/PATCH | `/students/me/profile` | Student, own record | Read/update validated profile fields. |
| GET/PATCH | `/students/me/visibility` | Student, own record | Configure profile and project visibility/consent. |
| GET | `/students/me/competencies` | Student | List skills with evidence and evaluation dates. |
| GET | `/students/me/enrollments` | Student | Paginated enrollment/progress. |
| POST | `/courses/{courseId}/enrollments` | Student | Enroll if course is published and entitlements permit. |
| PATCH | `/enrollments/{id}/lessons/{lessonId}` | Enrollment owner | Record lesson completion idempotently. |
| POST | `/projects` | Student | Create project metadata; file upload is a separate authorized operation. |
| PATCH/DELETE | `/projects/{id}` | Project owner | Update/archive own project. |
| POST | `/jobs/{jobId}/applications` | Student | Apply once while job accepts applications. |
| GET | `/students/me/applications` | Student | View own application pipeline. |
| POST | `/applications/{id}/withdraw` | Applicant | Withdraw when current state permits. |

## Learning and assessments

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/courses` | Public | Filter published catalog. |
| GET | `/courses/{id}` | Public | Course details without private instructor data. |
| GET | `/courses/{id}/lessons` | Published/enrolled | List curriculum; paid assets require entitlement. |
| POST | `/assignments/{id}/submissions` | Enrollment owner | Submit a response or private file reference. |
| GET | `/assessments` | Authenticated | List eligible assessments. |
| POST | `/assessments/{id}/attempts` | Student | Start attempt; server sets expiry and attempt policy. |
| POST | `/attempts/{id}/answers` | Attempt owner | Save validated answers; never return answer keys. |
| POST | `/attempts/{id}/submit` | Attempt owner | Submit once; server scores or queues review. |
| GET | `/attempts/{id}/result` | Attempt owner / authorized reviewer | Return permitted result and rubric evidence. |

## Company and recruitment

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET/PATCH | `/companies/me` | Company member | Manage company profile. |
| POST | `/companies/me/jobs` | Verified company recruiter | Create draft job listing. |
| PATCH | `/companies/me/jobs/{id}` | Owning company recruiter | Update or close own listing. |
| GET | `/companies/me/jobs` | Company member | List own jobs. |
| GET | `/companies/me/candidates` | Verified company recruiter | Search only profiles permitted by visibility/consent. |
| GET | `/companies/me/candidates/{studentId}` | Verified recruiter + permitted context | Return privacy-filtered profile and evidence. |
| GET | `/companies/me/applications` | Company recruiter | List applications to company's jobs. |
| PATCH | `/applications/{id}/status` | Owning company recruiter | Advance through allowed state transitions; audited. |
| POST | `/applications/{id}/interviews` | Owning company recruiter | Schedule interview with timezone and participants. |

## Admin and commerce

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/admin/review-queues` | Admin | List pending company/project/content reviews. |
| PATCH | `/admin/companies/{id}/verification` | Admin | Approve or reject with reason and audit record. |
| GET | `/admin/reports/summary` | Admin | Aggregated, privacy-aware metrics. |
| POST | `/payments/orders` | Authenticated buyer | Create provider order server-side. |
| POST | `/payments/webhooks/{provider}` | Provider signature | Verify signature, deduplicate event, grant/revoke entitlement. |
| GET | `/payments/me` | Buyer | View own payment history, with provider-safe fields only. |

## API invariants

- Every endpoint validates input and authenticates/authorizes server-side.
- A student cannot read another student's private profile, applications, or assessment answers.
- A recruiter search must apply company verification, visibility, consent, and field filtering before returning results.
- Applications have a unique `(studentId, jobId)` constraint; enrollment has a unique `(studentId, courseId)` constraint.
- State changes use explicit allowed transitions and are auditable.
- Payment webhooks are signature-verified and idempotent; client redirects never grant paid access.
- Responses exclude password hashes, session secrets, answer keys, private file locations, and payment credentials.
