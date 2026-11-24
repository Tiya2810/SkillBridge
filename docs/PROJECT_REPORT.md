# SkillBridge — Project Report

## Abstract

Students and fresh graduates often struggle to demonstrate practical ability to employers, while recruiters must assess many applicants using limited evidence. SkillBridge proposes a unified learning and recruitment platform where learners complete courses, submit projects, take assessments, and build a portfolio with verifiable evidence. Companies can publish entry-level opportunities and review candidates who have chosen to make their profiles visible. The system combines education and hiring workflows while keeping final selection decisions with human recruiters.

The current deliverable is a responsive front-end prototype and an implementation blueprint. It demonstrates the three principal user experiences and defines the intended database, API, security boundaries, validation plan, and phased build approach. Production authentication, server APIs, persistent database operations, file storage, and payment processing are future implementation work.

## Problem statement

Traditional early-career hiring commonly relies on academic credentials and resumes, which may not show what a candidate can build. Students also face disconnected tools for learning, project display, assessments, and job applications. Employers need a consistent way to discover candidates while understanding the evidence behind claimed skills.

## Objectives

1. Provide structured courses, lessons, assignments, and assessments.
2. Let students publish project evidence and control profile visibility.
3. Represent skills with provenance (assessment, assignment, or reviewed project), rather than course completion alone.
4. Let companies post jobs, review permitted candidate information, and manage recruitment stages.
5. Provide an administration workflow for moderation and verification.
6. Design a secure, accessible, responsive product that can be expanded from an academic MVP.

## Scope

### In scope for the product

- Student, company, instructor, and administrator accounts.
- Courses, lessons, enrollment, progress, assignments, and certificates.
- Projects and public/private portfolio settings.
- Skill definitions, evidence records, and assessment results.
- Job postings, applications, shortlists, interviews, and offers.
- Premium learning products and company recruitment billing.
- Notifications, admin moderation, and aggregate analytics.

### Out of scope for the current prototype

- Real registration, login, password reset, and account verification.
- Live data APIs, MongoDB persistence, or production hosting.
- Real video delivery, file uploads, email/SMS, payments, or certificate signing.
- Automated AI grading or production candidate recommendations.

## User roles and permissions

| Role | Primary capabilities |
|---|---|
| Student | Manage own profile, enroll in courses, submit assignments/projects, take assessments, set visibility, and apply to jobs. |
| Company recruiter | Manage a verified company, publish jobs, review permitted candidate information, and manage applications/interviews. |
| Instructor | Create and maintain assigned learning content, review submissions, and provide feedback. |
| Administrator | Manage accounts and catalog records, verify companies, moderate content, and inspect operational reports. |

Authorization must be enforced by the API for each resource and operation. Roles do not grant access to another user's private records. Recruiter access is additionally constrained by consent, application context, company verification, and data-minimization rules.

## Functional requirements

### Learning

- Catalog filtering by topic, level, format, and price.
- Course detail with outcomes, prerequisites, instructor, curriculum, and pricing.
- Enrollment and lesson-level progress tracking.
- Assignments with deadlines, submission history, and instructor feedback.
- Assessments with attempt limits, server-side scoring, and reviewable outcomes.
- Certificates issued only after the configured completion criteria are met.

### Portfolio and skills

- Student can create, edit, and archive portfolio projects.
- Project record can reference source and demonstration URLs and uploaded evidence.
- Student can set visibility per profile/project and revoke recruiter access.
- Skill proficiency is backed by dated evidence and a transparent rubric.
- Scores expose contributing evidence and are never the sole basis for automated hiring decisions.

### Recruitment

- Verified companies can create, edit, publish, close, and archive jobs.
- Students can apply once per job and withdraw while the posting accepts applications.
- Application stages are audited: submitted, reviewing, shortlisted, interview, offer, hired, rejected, withdrawn.
- Interview scheduling records timezone, participants, and status.
- Recruiters access only profiles and evidence permitted by candidate consent and the relationship context.

### Administration and commerce

- Admin can review account and company verification queues, moderate submissions, and manage catalog content.
- A payment is marked complete only after signed webhook/server-side verification.
- Payment records contain provider references and status, not card or bank credentials.
- Refunds, cancellations, and entitlement changes are auditable.

## Non-functional requirements

- Responsive operation on mobile, tablet, and desktop.
- WCAG 2.2 AA-targeted contrast, focus visibility, semantic controls, and keyboard navigation.
- Server-side validation, authorization, rate limiting, secure session settings, and audit events.
- P95 API response target under 500 ms for common read operations under the agreed MVP load.
- Paginated search and indexed filter fields; avoid unbounded result sets.
- Daily database backups and a documented restore test before production launch.
- Explicit retention and deletion policies for resumes, assessments, and account data.

## Skill evaluation model

Initial configurable weighting proposal:

| Evidence source | Initial weight |
|---|---:|
| Practical projects | 30% |
| Technical assessments | 25% |
| Practical assignments | 20% |
| Course knowledge checks | 15% |
| Consistency and improvement | 10% |

The score must be calculated from valid, current evidence and show the breakdown, date, and rubric. Missing evidence is not silently treated as a zero or inflated into a positive score. The model requires pilot calibration, bias review, accessibility review, and recruiter/student feedback before being used for consequential decisions.

## Success measures

- Course activation: percentage of enrolled learners who start a lesson.
- Course completion and assignment submission rates.
- Projects with reviewable evidence and learner feedback turnaround.
- Application completion and interview progression rates.
- Company time-to-first-qualified-review and recruiter satisfaction.
- Student profile visibility and consent withdrawal success.
- Accessibility defects, privacy incidents, and API error rates.

Do not use raw placement counts as a success claim until real, consented, auditable production data exists.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Student data exposed to recruiters without permission | Explicit consent, field-level visibility, scoped access, access audit, and revocation. |
| Skill score is mistaken for an objective ranking | Show evidence and limitations; keep hiring decisions human-led; audit outcomes and calibration. |
| Fraudulent companies or job listings | Company verification, moderation queue, reporting workflow, and abuse response process. |
| Forged assessments or certificates | Server-authoritative scoring, attempt audit, signed verification references, and rate limits. |
| Payment spoofing | Provider signature verification on the server; idempotent webhook processing. |
| Scope too broad for an academic project | Deliver an end-to-end vertical slice first; defer AI and native apps. |
| Sample data mistaken for real users | Clearly label demo data and replace it before any public deployment. |

## Deliverables

1. This project report and requirements baseline.
2. Responsive student, company, and administrator UI prototype.
3. MongoDB collection validator/index bootstrap.
4. REST API contract and architecture description.
5. Development roadmap and test/acceptance plan.
6. Future implementation: secure backend, production data, deployment, and operational documentation.
