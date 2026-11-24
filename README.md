# SkillBridge

**Learn. Build. Prove. Get Hired.**

SkillBridge is a student-to-employment platform concept for college students and freshers. It combines instructor-led learning, practical projects, evidence-backed skill profiles, assessments, and entry-level recruitment.

> **Project status:** This workspace contains a frontend-only browser preview. No backend/API, authentication, or live platform data is connected. User-created preview projects, jobs, applications, profile settings, course suggestions, and lesson progress are stored in the current browser using `localStorage`; they are not sent to a server and should not be used for real hiring or account data.

## Run the demo

No build tools or package installation are needed for the current prototype.

1. Open `index.html` in a modern browser, or serve this folder using any static HTTP server.
2. Click the role card in the lower-left sidebar to cycle through Student, Company, and Administrator previews.
3. Use the sidebar to explore the role-specific pages.
4. Choose **Add sample data** on a role dashboard to populate fictional student profiles, five company previews with recruiter contacts, company details and job listings, portfolio projects, course progress, interviews, course suggestions, example payment records, and certificate design examples. Seeded records are marked **Sample data**.
5. Create a preview job in the Company role, switch to Student to apply, then return to Company to update its application status.
6. Enroll in one of the clearly labeled sample courses, complete lessons, and add portfolio projects. These changes remain in the current browser.
7. Use the preview profile visibility setting to demonstrate how candidate discovery respects a student's sharing preference.
8. Clear the `skillbridge.preview.v1` entry in browser storage to reset this preview.

For example, from a terminal in this folder:

```powershell
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Current demonstration features

- Student learning dashboard, course catalog, project portfolio, skills, jobs, applications, and completion tracking.
- Supplied SkillBridge logo displayed in the sidebar with a matching cropped PNG browser icon in `assets/`.
- Cohesive olive, forest, cream, sand, and clay brand palette from [Coolors](https://coolors.co/palette/606c38-283618-fefae0-dda15e-bc6c25).
- Company recruitment dashboard with five fictional company profiles and matching job previews, consent-filtered candidate discovery, application stages, sample interviews, and locally calculated recruitment summaries.
- Admin overview with sample user/company directories, course outlines and prices, projects, assessment descriptions, reports, and fictional payment-history examples. Payment processing, real transactions, and revenue reporting are not connected.
- Student certificate gallery filters examples to the active student profile and uses that profile's name; Aarav's profile includes three certificate design examples. All examples are fictional, not issued credentials, and do not verify course completion.
- Colorful role dashboards with local progress, application, account-mix, and job-distribution charts that reflect preview records only.
- Power BI-inspired analytics sections with labeled column histograms for course progress, applications, hiring pipeline, account mix, and workspace activity. Charts use browser preview data only; no Power BI report or live service is connected.
- Responsive layouts, a persisted dark theme, mobile navigation, accessible modal forms, search and course filters, and toast notifications.
- Preview role switching, browser-local profile/project/job/application/course flows, clearly labeled fictional payment records that never grant course access, an always-visible preview-data indicator, and honest states for features that require a live service.

## Project structure

```text
SkillBridge/
├── index.html               # Browser entry point
├── styles.css               # Responsive design system and page styles
├── app.js                   # Frontend demo views and interactions
├── database/
│   └── schema.mongodb.js    # MongoDB collection validators and indexes
├── docs/
│   ├── PROJECT_REPORT.md    # Academic project report / blueprint
│   ├── API.md               # REST API contract
│   ├── ARCHITECTURE.md      # System design and trust boundaries
│   ├── ROADMAP.md           # Phased implementation plan
│   └── TEST_PLAN.md         # Acceptance and quality plan
└── backend/                 # Reserved for the production API implementation
```

## Proposed production stack

- **Web:** Next.js / React, TypeScript, Tailwind CSS, accessible component library.
- **API:** Node.js, Express, TypeScript, Zod request validation.
- **Data:** MongoDB Atlas with Mongoose; schema and index baseline in `database/schema.mongodb.js`.
- **Authentication:** Server-managed secure sessions or short-lived access tokens with refresh rotation; role-based authorization.
- **Files:** Private object storage for resumes and submissions; signed, expiring links for authorized access.
- **Payments:** A payment provider with server-verified webhooks. Never trust a client-side payment success response.
- **Hosting/operations:** HTTPS, managed secrets, structured logs, backups, monitoring, and separate development/staging/production environments.

## Important product and security decisions

- Recruiter access to student profile details must respect the student's visibility and consent settings.
- A skill score is an explanation aid, not an automatic hiring decision. Show its evidence and components.
- Hash passwords with a modern password-hashing algorithm. Never store raw passwords or payment credentials.
- Validate and authorize every API request on the server; a hidden button is not access control.
- Do not put secret keys, database credentials, or private student documents in frontend code or the repository.
- Keep demo data clearly labeled. Do not treat sample candidates or scores as real people or hiring outcomes.

## Documentation

- [Project report and requirements](docs/PROJECT_REPORT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API contract](docs/API.md)
- [Development roadmap](docs/ROADMAP.md)
- [Test plan](docs/TEST_PLAN.md)
- [MongoDB schema bootstrap](database/schema.mongodb.js)

## Next implementation milestone

Build the API and authentication foundation first, then connect a persistent database and replace sample data in the UI. See the roadmap for scoped milestones and exit criteria.
