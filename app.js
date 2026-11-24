const STORAGE_KEY = 'skillbridge.preview.v1';
const content = document.getElementById('content');
const nav = document.getElementById('mainNav');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalBody = document.getElementById('modalBody');
let currentRole = 'student';
let currentView = 'student-dashboard';
let activeCourseId = null;
let returnFocus = null;
let toastTimer;
let stateLoadIssue = '';

const iconPaths = {
  '▦': '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  '▤': '<path d="M5 4h14a2 2 0 0 1 2 2v13H7a2 2 0 0 1-2-2V4Z"/><path d="M5 17a2 2 0 0 0 2 2M9 8h8m-8 4h8"/>',
  '◫': '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 1 4 16.5v-11Z"/><path d="M4 6h12m-7 4h7m-7 4h7"/>',
  '◆': '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h5l2 2h6A1.5 1.5 0 0 1 20 7.5v10a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-12Z"/>',
  '◎': '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  '⌕': '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/>',
  '⌁': '<path d="M4 7h11a3 3 0 1 1-3 3"/><path d="M20 17H9a3 3 0 1 1 3-3"/><path d="M4 12h3m10 0h3"/>',
  '◇': '<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m9 12 2 2 4-4"/>',
  '♙': '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  '⌂': '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z"/>',
  '₹': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18m-13 5h4"/>',
  '▥': '<path d="M4 20V10m5 10V4m5 16v-7m5 7V7"/>',
  '◷': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  '✓': '<path d="m5 12 4 4L19 6"/>'
};
function iconMarkup(glyph) {
  return `<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true">${iconPaths[glyph] || '<circle cx="12" cy="12" r="8"/>'}</svg>`;
}
function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function safeUrl(value = '') {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
  } catch {
    return '';
  }
}
function newState() {
  return {
    profile: { name: 'Student Preview', email: '', visibility: 'private', headline: '', location: '' },
    projects: [],
    jobs: [],
    applications: [],
    suggestions: [],
    enrollments: [],
    lessonProgress: {},
    users: [],
    companies: [],
    interviews: [],
    payments: [],
    certificates: [],
    sampleDataLoaded: false,
    sampleDataVersion: 0,
    theme: 'light'
  };
}
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return newState();
    const fresh = newState();
    return {
      ...fresh,
      ...saved,
      profile: { ...fresh.profile, ...(saved.profile || {}) },
      projects: Array.isArray(saved.projects) ? saved.projects : [],
      jobs: Array.isArray(saved.jobs) ? saved.jobs : [],
      applications: Array.isArray(saved.applications) ? saved.applications : [],
      suggestions: Array.isArray(saved.suggestions) ? saved.suggestions : [],
      enrollments: Array.isArray(saved.enrollments) ? saved.enrollments : [],
      lessonProgress: saved.lessonProgress && typeof saved.lessonProgress === 'object' ? saved.lessonProgress : {},
      users: Array.isArray(saved.users) ? saved.users : [],
      companies: Array.isArray(saved.companies) ? saved.companies : [],
      interviews: Array.isArray(saved.interviews) ? saved.interviews : [],
      payments: Array.isArray(saved.payments) ? saved.payments : [],
      certificates: Array.isArray(saved.certificates) ? saved.certificates : [],
      sampleDataLoaded: saved.sampleDataLoaded === true,
      sampleDataVersion: Number.isInteger(saved.sampleDataVersion) ? saved.sampleDataVersion : 0,
      theme: saved.theme === 'dark' ? 'dark' : 'light'
    };
  } catch (error) {
    stateLoadIssue = 'Saved preview data could not be read. A fresh local preview was opened.';
    console.error('SkillBridge preview data could not be loaded.', error);
    return newState();
  }
}
const state = loadState();
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('SkillBridge preview data could not be saved.', error);
    toast('Could not save this preview in your browser. Check storage permissions.');
    return false;
  }
}
function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function photoMarkup(url, alt, className = '') {
  const source = safeUrl(url);
  return source ? `<img class="preview-photo ${className}" src="${escapeHtml(source)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">` : '';
}
function avatarMarkup(person, className = '') {
  const portrait = photoMarkup(person?.avatarUrl, `Sample profile photo of ${person?.name || 'preview user'}`, 'avatar-photo');
  return `<span class="avatar-image ${className}">${portrait}<span class="avatar-fallback" aria-hidden="true">${escapeHtml(initials(person?.name || ''))}</span></span>`;
}

const previewCourses = [
  { id: 'web-foundations', title: 'Web Development Foundations', category: 'Development', level: 'Beginner', instructor: 'Neha Kulkarni', duration: '3 lessons · 2 hours', price: '₹1,499 sample price', imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80', description: 'A sample learning path covering semantic HTML, responsive CSS, and JavaScript fundamentals.', lessons: ['Structure a semantic page', 'Build a responsive layout', 'Add accessible interactions'] },
  { id: 'javascript-core', title: 'JavaScript Core Concepts', category: 'Development', level: 'Beginner', instructor: 'Kabir Mehta', duration: '3 lessons · 3 hours', price: '₹1,999 sample price', imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80', description: 'A sample learning path introducing functions, arrays, objects, and browser events.', lessons: ['Values and functions', 'Arrays and objects', 'DOM events and state'] },
  { id: 'career-portfolio', title: 'Build Your Project Portfolio', category: 'Career skills', level: 'All levels', instructor: 'Ananya Rao', duration: '3 lessons · 90 minutes', price: '₹799 sample price', imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80', description: 'A sample guide to describing project goals, implementation choices, and evidence clearly.', lessons: ['Choose a project story', 'Document decisions', 'Present evidence responsibly'] },
  { id: 'data-analytics', title: 'Data Analytics Essentials', category: 'Data and analytics', level: 'Beginner', instructor: 'Dev Malhotra', duration: '4 lessons · 3 hours', price: '₹1,799 sample price', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', description: 'Learn to frame data questions, clean a small dataset, and communicate a clear finding.', lessons: ['Ask a measurable question', 'Prepare a tidy dataset', 'Create a useful chart', 'Share a concise insight'] },
  { id: 'python-starter', title: 'Python for Practical Projects', category: 'Development', level: 'Beginner', instructor: 'Rohan Iyer', duration: '4 lessons · 4 hours', price: '₹2,199 sample price', imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1000&q=80', description: 'A hands-on introduction to Python syntax, data structures, files, and small automation tasks.', lessons: ['Write readable Python', 'Work with collections', 'Read and write files', 'Build a small automation'] },
  { id: 'product-design', title: 'UI Design and Prototyping', category: 'Design', level: 'Beginner', instructor: 'Maya Patel', duration: '4 lessons · 3 hours', price: '₹1,899 sample price', imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1000&q=80', description: 'Practice layout, visual hierarchy, accessible color, and interactive prototype reviews.', lessons: ['Map a user task', 'Build visual hierarchy', 'Design accessible states', 'Present a clickable prototype'] },
  { id: 'cloud-basics', title: 'Cloud and DevOps Basics', category: 'Cloud technology', level: 'Beginner', instructor: 'Isha Nair', duration: '3 lessons · 2.5 hours', price: '₹1,699 sample price', imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80', description: 'Explore cloud concepts, version control workflows, and deployment fundamentals through safe examples.', lessons: ['Understand cloud building blocks', 'Track changes with Git', 'Plan a sample deployment'] }
];
const sampleData = {
  profile: { name: 'Aarav Sharma', email: 'aarav.sample@example.test', visibility: 'recruiters', headline: 'Computer science student · Frontend development', location: 'Pune, India', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&h=240&q=80', demo: true },
  projects: [
    { id: 'sample-project-campus', title: 'Campus Events Planner', description: 'A responsive sample project concept for browsing campus events and managing a personal schedule.', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80', sourceUrl: '', demoUrl: '', skills: ['HTML', 'CSS', 'JavaScript'], createdAt: 'Sample record', demo: true },
    { id: 'sample-project-budget', title: 'Smart Budget Dashboard', description: 'A sample dashboard concept for organizing monthly spending, savings goals, and helpful summaries.', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80', sourceUrl: '', demoUrl: '', skills: ['JavaScript', 'Charts', 'Responsive design'], createdAt: 'Sample record', demo: true },
    { id: 'sample-project-garden', title: 'Community Garden Map', description: 'A fictional map experience to discover neighborhood gardens, events, and volunteer opportunities.', imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1000&q=80', sourceUrl: '', demoUrl: '', skills: ['UI design', 'Maps', 'Accessibility'], createdAt: 'Sample record', demo: true },
    { id: 'sample-project-insights', title: 'Learner Insights Report', description: 'A sample data story showing course engagement patterns with clear, readable visualizations.', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', sourceUrl: '', demoUrl: '', skills: ['Python', 'Data visualization', 'Storytelling'], createdAt: 'Sample record', demo: true }
  ],
  jobs: [
    { id: 'sample-job-frontend', companyId: 'sample-company-northstar', title: 'Frontend Developer Intern', type: 'Internship', location: 'Remote · India', skills: 'JavaScript, HTML, CSS', description: 'Sample role for practicing the local job discovery and application flow.', status: 'published', createdAt: 'Sample record', demo: true },
    { id: 'sample-job-ui', companyId: 'sample-company-brightpath', title: 'Junior UI Developer', type: 'Full-time', location: 'Pune, India', skills: 'Accessibility, CSS, React', description: 'Fictional sample posting. No real employer is associated with this role.', status: 'published', createdAt: 'Sample record', demo: true },
    { id: 'sample-job-data', companyId: 'sample-company-cloudharbor', title: 'Data Analyst Trainee', type: 'Internship', location: 'Remote · India', skills: 'SQL, Python, Data visualization', description: 'Fictional trainee position for exploring sample data and reporting workflows.', status: 'published', createdAt: 'Sample record', demo: true },
    { id: 'sample-job-product', companyId: 'sample-company-greengrid', title: 'Associate Product Designer', type: 'Full-time', location: 'Bengaluru, India', skills: 'Figma, Research, Prototyping', description: 'Fictional early-career role focused on accessible product design and prototyping.', status: 'published', createdAt: 'Sample record', demo: true },
    { id: 'sample-job-qa', companyId: 'sample-company-pixelnorth', title: 'Software QA Intern', type: 'Internship', location: 'Hyderabad, India', skills: 'Test cases, JavaScript, Git', description: 'Fictional internship for practicing software testing and bug reporting.', status: 'published', createdAt: 'Sample record', demo: true }
  ],
  applications: [
    { id: 'sample-application-frontend', jobId: 'sample-job-frontend', applicantId: 'sample-student-aarav', status: 'Reviewing', appliedAt: 'Sample record', demo: true }
  ],
  suggestions: [
    { id: 'sample-suggestion-accessibility', title: 'Accessible Interface Design', description: 'Sample learner suggestion.', createdAt: 'Sample record', demo: true }
  ],
  enrollments: ['web-foundations', 'career-portfolio'],
  lessonProgress: { 'web-foundations': [0, 1], 'career-portfolio': [0] },
  users: [
    { id: 'sample-student-aarav', name: 'Aarav Sharma', email: 'aarav.sample@example.test', role: 'Student', visibility: 'recruiters', headline: 'Computer science student · Frontend development', location: 'Pune, India', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&h=240&q=80', skills: ['JavaScript', 'HTML', 'CSS'], demo: true },
    { id: 'sample-student-maya', name: 'Maya Patel', email: 'maya.sample@example.test', role: 'Student', visibility: 'recruiters', headline: 'Information technology student · UI engineering', location: 'Mumbai, India', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&h=240&q=80', skills: ['React', 'Accessibility', 'Figma'], demo: true },
    { id: 'sample-student-rohan', name: 'Rohan Iyer', email: 'rohan.sample@example.test', role: 'Student', visibility: 'public', headline: 'Computer engineering student · Backend development', location: 'Bengaluru, India', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&h=240&q=80', skills: ['Node.js', 'SQL', 'Python'], demo: true },
    { id: 'sample-student-private', name: 'Private Preview Learner', email: 'private.learner@example.test', role: 'Student', visibility: 'private', headline: 'Profile not shared with recruiters', location: 'Not shared', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&h=240&q=80', skills: [], demo: true },
    { id: 'sample-user-recruiter', name: 'Recruiter Preview', email: 'recruiter@northstar.example.test', role: 'Company member', visibility: 'private', headline: 'Recruiter at Northstar Learning Labs', location: 'Pune, India', skills: [], demo: true },
    { id: 'sample-user-brightpath', name: 'Priya Recruiter', email: 'priya@brightpath.example.test', role: 'Company member', visibility: 'private', headline: 'Talent partner at BrightPath Studio', location: 'Remote · India', skills: [], demo: true },
    { id: 'sample-user-cloudharbor', name: 'Dev Recruiter', email: 'dev@cloudharbor.example.test', role: 'Company member', visibility: 'private', headline: 'Early careers recruiter at CloudHarbor Analytics', location: 'Remote · India', skills: [], demo: true },
    { id: 'sample-user-greengrid', name: 'Isha Recruiter', email: 'isha@greengrid.example.test', role: 'Company member', visibility: 'private', headline: 'People operations at GreenGrid Mobility', location: 'Bengaluru, India', skills: [], demo: true },
    { id: 'sample-user-pixelnorth', name: 'Arjun Recruiter', email: 'arjun@pixelnorth.example.test', role: 'Company member', visibility: 'private', headline: 'Engineering recruiter at PixelNorth Systems', location: 'Hyderabad, India', skills: [], demo: true },
    { id: 'sample-admin-profile', name: 'Alex Morgan', email: 'admin.sample@example.test', role: 'Administrator', visibility: 'private', headline: 'SkillBridge preview administrator', location: 'Remote', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&h=240&q=80', skills: [], demo: true }
  ],
  companies: [
    { id: 'sample-company-northstar', name: 'Northstar Learning Labs', industry: 'Education technology', location: 'Pune, India', email: 'hello@northstar.example.test', website: 'https://northstar.example.test', teamSize: '11–50', founded: '2021', description: 'Fictional learning technology company building accessible tools for early-career learners.', status: 'Verified preview', jobs: 1, demo: true },
    { id: 'sample-company-brightpath', name: 'BrightPath Studio', industry: 'Digital product design', location: 'Remote · India', email: 'careers@brightpath.example.test', website: 'https://brightpath.example.test', teamSize: '1–10', founded: '2023', description: 'Fictional product design studio focused on clear, inclusive digital experiences.', status: 'Pending preview', jobs: 1, demo: true },
    { id: 'sample-company-cloudharbor', name: 'CloudHarbor Analytics', industry: 'Data and analytics', location: 'Remote · India', email: 'hello@cloudharbor.example.test', website: 'https://cloudharbor.example.test', teamSize: '51–200', founded: '2019', description: 'Fictional analytics team helping organizations turn operational data into useful insights.', status: 'Verified preview', jobs: 1, demo: true },
    { id: 'sample-company-greengrid', name: 'GreenGrid Mobility', industry: 'Climate technology', location: 'Bengaluru, India', email: 'people@greengrid.example.test', website: 'https://greengrid.example.test', teamSize: '11–50', founded: '2022', description: 'Fictional mobility startup exploring practical tools for lower-emission urban transport.', status: 'Verified preview', jobs: 1, demo: true },
    { id: 'sample-company-pixelnorth', name: 'PixelNorth Systems', industry: 'Software development', location: 'Hyderabad, India', email: 'talent@pixelnorth.example.test', website: 'https://pixelnorth.example.test', teamSize: '201–500', founded: '2017', description: 'Fictional software company building workflow products for distributed teams.', status: 'Pending preview', jobs: 1, demo: true }
  ],
  interviews: [
    { id: 'sample-interview-frontend', applicationId: 'sample-application-frontend', jobId: 'sample-job-frontend', candidateId: 'sample-student-aarav', scheduledAt: 'Nov 25, 2026 · 10:30 AM IST', format: 'Video call · preview only', status: 'Scheduled', demo: true }
  ],
  payments: [
    { id: 'sample-payment-web', userId: 'sample-student-aarav', courseId: 'web-foundations', amount: 1499, currency: 'INR', paidAt: 'Nov 18, 2026', status: 'Paid (sample)', method: 'Preview card', reference: 'DEMO-ORDER-1001', demo: true },
    { id: 'sample-payment-js', userId: 'sample-student-maya', courseId: 'javascript-core', amount: 1999, currency: 'INR', paidAt: 'Nov 19, 2026', status: 'Pending (sample)', method: 'Preview UPI', reference: 'DEMO-ORDER-1002', demo: true },
    { id: 'sample-payment-portfolio', userId: 'sample-student-rohan', courseId: 'career-portfolio', amount: 799, currency: 'INR', paidAt: 'Nov 20, 2026', status: 'Refunded (sample)', method: 'Preview card', reference: 'DEMO-ORDER-1003', demo: true }
  ],
  certificates: [
    { id: 'sample-certificate-aarav', userId: 'sample-student-aarav', courseId: 'web-foundations', issuedAt: 'Nov 12, 2026', credentialId: 'SB-DEMO-2026-001', demo: true },
    { id: 'sample-certificate-aarav-portfolio', userId: 'sample-student-aarav', courseId: 'career-portfolio', issuedAt: 'Nov 16, 2026', credentialId: 'SB-DEMO-2026-004', demo: true },
    { id: 'sample-certificate-aarav-python', userId: 'sample-student-aarav', courseId: 'python-starter', issuedAt: 'Nov 20, 2026', credentialId: 'SB-DEMO-2026-005', demo: true },
    { id: 'sample-certificate-maya', userId: 'sample-student-maya', courseId: 'product-design', issuedAt: 'Nov 15, 2026', credentialId: 'SB-DEMO-2026-002', demo: true },
    { id: 'sample-certificate-rohan', userId: 'sample-student-rohan', courseId: 'data-analytics', issuedAt: 'Nov 20, 2026', credentialId: 'SB-DEMO-2026-003', demo: true }
  ]
};
const navs = {
  student: [['OVERVIEW', 'student-dashboard', '▦', 'Dashboard'], ['LEARN', 'learning', '▦', 'My Learning'], ['explore', 'explore', '◫', 'Explore Courses'], ['projects', 'projects', '◆', 'My Projects'], ['skills', 'skills', '◎', 'My Skills'], ['CAREER', 'career', ''], ['jobs', 'jobs', '⌕', 'Find Jobs'], ['applications', 'applications', '▤', 'Applications'], ['certificates', 'certificates', '◇', 'Certificates']],
  company: [['OVERVIEW', 'company-dashboard', '▦', 'Dashboard'], ['RECRUITMENT', 'candidates', '', 'Find Students'], ['candidates', 'candidates', '◎', 'Candidates'], ['jobs', 'company-jobs', '▤', 'Manage Jobs'], ['applications', 'company-applications', '⌁', 'Applications'], ['interviews', 'interviews', '◷', 'Interviews'], ['analytics', 'analytics', '▥', 'Analytics']],
  admin: [['OVERVIEW', 'admin-dashboard', '▦', 'Dashboard'], ['MANAGEMENT', 'users', '', 'User Management'], ['users', 'users', '♙', 'Users'], ['companies', 'companies', '⌂', 'Companies'], ['courses', 'admin-courses', '▤', 'Courses'], ['projects', 'admin-projects', '◆', 'Projects'], ['assessments', 'assessments', '◎', 'Assessments'], ['payments', 'payments', '₹', 'Payments'], ['reports', 'reports', '▥', 'Reports']]
};

function renderNav() {
  nav.innerHTML = navs[currentRole].map(item => {
    const [label, view, glyph, title] = item;
    if (['LEARN', 'CAREER', 'RECRUITMENT', 'MANAGEMENT'].includes(label)) {
      if (label === 'LEARN') return `<div class="nav-label">${label}</div><button class="nav-item ${currentView === view ? 'active' : ''}" data-view="${view}"><span class="nav-icon">${iconMarkup(glyph)}</span>${title}</button>`;
      return `<div class="nav-label">${label}</div>`;
    }
    return `<button class="nav-item ${currentView === view ? 'active' : ''}" data-view="${view}" ${currentView === view ? 'aria-current="page"' : ''}><span class="nav-icon">${iconMarkup(glyph)}</span>${title}</button>`;
  }).join('');
}
function pageHead(title, subtitle, action = '') {
  return `<div class="page-head"><div><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`;
}
function emptyState(glyph, title, description, action = '') {
  return `<div class="empty-state"><span class="empty-icon">${iconMarkup(glyph)}</span><strong>${title}</strong><span>${description}</span>${action}</div>`;
}
function stat(glyph, value, label, note) {
  return `<div class="stat-card"><div><small>${label}</small><strong>${escapeHtml(value)}</strong><span class="trend">${escapeHtml(note)}</span></div><div class="stat-icon">${iconMarkup(glyph)}</div></div>`;
}
function dashboardHero(eyebrow, title, description, actions = '') {
  return `<section class="welcome-banner"><div class="welcome-copy"><span class="welcome-eyebrow">${escapeHtml(eyebrow)}</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(description)}</p></div><div class="welcome-actions">${actions}</div><span class="welcome-orb welcome-orb-one" aria-hidden="true"></span><span class="welcome-orb welcome-orb-two" aria-hidden="true"></span></section>`;
}
function dataChart(title, description, items) {
  const max = Math.max(1, ...items.map(item => Number(item.value) || 0));
  const axisMax = max;
  const axisTicks = [axisMax, Math.ceil(axisMax * .66), Math.ceil(axisMax * .33), 0];
  return `<section class="card chart-card"><div class="card-head"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(description)}</p></div><span class="chart-sparkle" aria-hidden="true">▥</span></div><div class="histogram-wrap">${items.length ? `<div class="histogram-axis" aria-hidden="true">${axisTicks.map(tick => `<span>${tick}</span>`).join('')}</div><div class="histogram-plot" role="img" aria-label="${escapeHtml(`${title}. ${items.map(item => `${item.label}: ${item.display ?? item.value}`).join('; ')}`)}"><div class="histogram-gridlines" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="histogram-bars" style="grid-template-columns:repeat(${items.length}, minmax(0, 1fr))">${items.map((item, index) => {
    const value = Number(item.value) || 0;
    const height = value ? Math.max(4, Math.round(value / axisMax * 100)) : 0;
    return `<div class="histogram-column"><div class="histogram-bar-wrap"><span class="histogram-value" style="bottom:calc(${height}% + 4px)">${escapeHtml(item.display ?? value)}</span><i class="histogram-bar color-${index % 5}" style="height:${height}%"></i></div><span class="histogram-label" title="${escapeHtml(item.label)}">${escapeHtml(item.label)}</span></div>`;
  }).join('')}</div></div>` : '<div class="histogram-empty">Add sample data to see chart insights.</div>'}</div></section>`;
}
function dashboardAnalytics(charts) {
  return `<section class="analytics-section"><div class="analytics-heading"><div><span class="analytics-eyebrow">INSIGHTS &amp; ACTIVITY</span><h2>Analytics overview</h2><p>Role-specific histograms based on this browser's preview data.</p></div><span class="analytics-source">${iconMarkup('▥')} BI-style · local preview</span></div><div class="grid dashboard-charts">${charts}</div></section>`;
}
function dataNotice() {
  return '<span class="status blue">This browser preview only</span>';
}
function sampleDataButton() {
  return state.sampleDataVersion >= 8
    ? '<button class="secondary-btn" disabled>Sample data added</button>'
    : `<button class="secondary-btn" data-action="load-sample-data">${state.sampleDataLoaded ? 'Add remaining sample data' : 'Add sample data'}</button>`;
}
function sampleTag(record) {
  return record?.demo ? '<span class="status amber">Sample data</span>' : '';
}
function loadSampleData() {
  if (state.sampleDataVersion >= 8) return toast('Sample data is already loaded in this browser.');
  if (state.profile.name === 'Student Preview' || !state.profile.name.trim()) {
    state.profile = { ...sampleData.profile };
  } else if (state.profile.name === sampleData.profile.name && !state.profile.demo) {
    state.profile.demo = true;
  }
  if (state.profile.demo) state.profile.avatarUrl = sampleData.profile.avatarUrl;
  for (const project of sampleData.projects) {
    const existingIndex = state.projects.findIndex(item => item.id === project.id);
    if (existingIndex < 0) state.projects.push({ ...project, skills: [...project.skills] });
    else state.projects[existingIndex] = { ...project, ...state.projects[existingIndex], imageUrl: state.projects[existingIndex].imageUrl || project.imageUrl, skills: [...(state.projects[existingIndex].skills || project.skills)] };
  }
  for (const job of sampleData.jobs) {
    if (!state.jobs.some(item => item.id === job.id)) state.jobs.push({ ...job });
  }
  for (const application of sampleData.applications) {
    if (!state.applications.some(item => item.id === application.id)) state.applications.push({ ...application });
  }
  for (const suggestion of sampleData.suggestions) {
    if (!state.suggestions.some(item => item.id === suggestion.id)) state.suggestions.push({ ...suggestion });
  }
  for (const courseId of sampleData.enrollments) {
    if (!state.enrollments.includes(courseId)) state.enrollments.push(courseId);
  }
  for (const [courseId, lessons] of Object.entries(sampleData.lessonProgress)) {
    if (!state.lessonProgress[courseId]) state.lessonProgress[courseId] = [...lessons];
  }
  for (const user of sampleData.users) {
    const existingIndex = state.users.findIndex(item => item.id === user.id);
    if (existingIndex < 0) state.users.push({ ...user, skills: [...user.skills] });
    else state.users[existingIndex] = { ...user, ...state.users[existingIndex], skills: [...(state.users[existingIndex].skills || user.skills)] };
  }
  for (const company of sampleData.companies) {
    const existingIndex = state.companies.findIndex(item => item.id === company.id);
    if (existingIndex < 0) state.companies.push({ ...company });
    else state.companies[existingIndex] = { ...company, ...state.companies[existingIndex] };
  }
  for (const interview of sampleData.interviews) {
    if (!state.interviews.some(item => item.id === interview.id)) state.interviews.push({ ...interview });
  }
  for (const payment of sampleData.payments) {
    if (!state.payments.some(item => item.id === payment.id)) state.payments.push({ ...payment });
  }
  for (const certificate of sampleData.certificates) {
    if (!state.certificates.some(item => item.id === certificate.id)) state.certificates.push({ ...certificate });
  }
  state.sampleDataLoaded = true;
  state.sampleDataVersion = 8;
  const saved = saveState();
  render(currentView);
  if (saved) toast('Clearly labeled sample data added to this browser preview.');
}
function courseProgress(course) {
  const completed = state.lessonProgress[course.id] || [];
  return Math.round(completed.length / course.lessons.length * 100);
}
function studentDashboard() {
  const completeCourses = state.enrollments.filter(id => {
    const course = previewCourses.find(item => item.id === id);
    return course && courseProgress(course) === 100;
  }).length;
  const completedLessons = Object.values(state.lessonProgress).reduce((sum, items) => sum + items.length, 0);
  const publishedJobs = state.jobs.filter(job => job.status === 'published');
  const applyAction = publishedJobs.length
    ? `<div class="grid section-grid">${publishedJobs.slice(0, 3).map(jobCard).join('')}</div>`
    : `<div class="grid"><div class="card"><div class="card-head"><h2>Opportunities</h2><button class="text-btn" data-view="jobs">Explore jobs</button></div>${emptyState('⌕', 'No preview jobs yet', 'Jobs created in the Company Preview role will appear here.')}</div></div>`;
  const courseChart = dataChart('Your course progress', 'Progress saved in this browser preview.', state.enrollments.map(id => {
    const course = previewCourses.find(item => item.id === id);
    return course ? { label: course.title, value: courseProgress(course), display: `${courseProgress(course)}%` } : null;
  }).filter(Boolean));
  const applicationChart = dataChart('Application snapshot', 'Current status of your local applications.', ['Applied', 'Reviewing', 'Shortlisted', 'Interview', 'Offer', 'Rejected'].map(status => ({
    label: status,
    value: state.applications.filter(application => application.status === status).length
  })));
  return `${dashboardHero('STUDENT WORKSPACE', `Welcome back, ${state.profile.name}`, 'Keep building practical skills, track your learning, and discover opportunities that fit your goals.', `${sampleDataButton()}<button class="primary-btn" data-modal="profile">Edit profile</button>`)}
    <div class="preview-callout"><span class="preview-dot"></span><span>Changes are saved only in this browser. No real account, server, or external service is connected. Sample records are fictional and labeled.</span></div>
    <div class="grid stats">
      ${stat('▤', state.enrollments.length, 'Courses enrolled', 'Sample preview curriculum')}
      ${stat('✓', completeCourses, 'Courses completed', `${completedLessons} lesson${completedLessons === 1 ? '' : 's'} completed here`)}
      ${stat('◆', state.projects.length, 'Projects in portfolio', 'Saved in this browser')}
      ${stat('◎', state.applications.length, 'Job applications', 'Local preview records')}
    </div>
    ${dashboardAnalytics(`${courseChart}${applicationChart}`)}
    <div class="grid dashboard-grid">
      <div class="card"><div class="card-head"><h2>Continue learning</h2><button class="text-btn" data-view="learning">View all</button></div>
        ${state.enrollments.length ? state.enrollments.map(id => previewCourses.find(course => course.id === id)).filter(Boolean).map(courseRow).join('') : emptyState('▤', 'Your learning progress will appear here', 'Enroll in a sample course to track lessons in this browser.', '<button class="secondary-btn" data-view="explore">Explore sample courses</button>')}
      </div>
      <div class="card"><div class="card-head"><h2>Your profile</h2><button class="text-btn" data-modal="profile">Edit</button></div>
        <div class="profile-summary">${avatarMarkup(state.profile, 'profile-avatar-wrap')}<strong>${escapeHtml(state.profile.name)}</strong>${sampleTag(state.profile)}<span>${escapeHtml(state.profile.headline || 'Add a short professional headline')}</span><span class="status ${state.profile.visibility === 'private' ? 'amber' : 'green'}">Visibility: ${escapeHtml(state.profile.visibility)}</span></div>
      </div>
    </div>${applyAction}`;
}
function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase() || 'ST';
}
function courseRow(course) {
  const progress = courseProgress(course);
  return `<div class="course-row"><div class="course-thumb">${iconMarkup('◫')}</div><div class="course-info"><strong>${escapeHtml(course.title)}</strong><small>${progress}% complete · ${escapeHtml(course.duration)} · ${escapeHtml(course.instructor)}</small></div><div class="progress-wrap"><div class="progress-track"><i style="width:${progress}%"></i></div><button class="text-btn" data-action="learn" data-course="${course.id}">Open</button></div></div>`;
}
function learning() {
  const courses = state.enrollments.map(id => previewCourses.find(course => course.id === id)).filter(Boolean);
  return `${pageHead('My Learning', 'Sample course progress is stored locally in this browser.', '<button class="primary-btn" data-view="explore">Explore courses</button>')}
    <div class="grid section-grid">${courses.map(course => courseCard(course, true)).join('')}</div>
    ${courses.length ? '' : `<div class="card">${emptyState('▤', 'No enrolled courses yet', 'Explore the clearly labeled sample curriculum and enroll to try local lesson progress.', '<button class="primary-btn" data-view="explore">Explore sample courses</button>')}</div>`}`;
}
function courseCard(course, enrolled = false, allowEnrollment = true) {
  const progress = courseProgress(course);
  const action = enrolled
    ? `<button class="primary-btn" data-action="learn" data-course="${course.id}">Continue learning</button>`
    : allowEnrollment
      ? `<button class="primary-btn" data-action="enroll" data-course="${course.id}">Enroll in preview</button>`
      : '<span class="status blue">Sample curriculum</span>';
  return `<article class="course-card searchable" data-category="${escapeHtml(course.category)}"><div class="course-cover">${photoMarkup(course.imageUrl, `${course.title} sample course photo`, 'cover-photo')}<span class="course-cover-icon">${iconMarkup('◫')}</span><span class="course-cover-label">${escapeHtml(course.category)}</span></div><div class="course-body"><span class="tag">SAMPLE PREVIEW</span><h3>${escapeHtml(course.title)}</h3><p>${escapeHtml(course.category)} · ${escapeHtml(course.level)}</p><p>${escapeHtml(course.description)}</p><p>${escapeHtml(course.instructor)} · ${escapeHtml(course.duration)}</p><p>${escapeHtml(course.price)}</p>${enrolled ? `<div class="progress-wrap"><div class="progress-track"><i style="width:${progress}%"></i></div><span>${progress}%</span></div>` : ''}<div class="action-row">${action}</div></div></article>`;
}
function explore() {
  return `${pageHead('Explore Courses', 'Short sample curriculum to demonstrate the learning flow.', '<button class="secondary-btn" data-modal="suggestion">Suggest a course</button>')}
    <div class="preview-callout"><span class="preview-dot"></span><span>These are sample lessons for demonstration, not published courses from a live platform.</span></div>
    <div class="filters"><input id="courseSearch" aria-label="Search courses" placeholder="Search sample courses"><select id="courseCategory" aria-label="Course category"><option value="">All categories</option><option>Development</option><option>Career skills</option><option>Data and analytics</option><option>Design</option><option>Cloud technology</option></select></div>
    <div class="grid section-grid" id="courseGrid">${previewCourses.map(course => courseCard(course, state.enrollments.includes(course.id))).join('')}</div>
    <div class="card suggestion-list"><div class="card-head"><h2>Your course suggestions</h2>${dataNotice()}</div>${state.suggestions.length ? `<ul>${state.suggestions.map(item => `<li>${escapeHtml(item.title)} ${sampleTag(item)} <span class="status blue">Saved in preview</span></li>`).join('')}</ul>` : '<p class="muted-copy">Suggestions you submit in this preview will be listed here.</p>'}</div>`;
}
function projects() {
  return `${pageHead('My Projects', 'Create a portfolio using project details and public links.', '<button class="primary-btn" data-modal="project">+ Add project</button>')}
    ${state.projects.length ? `<div class="grid section-grid">${state.projects.map(projectCard).join('')}</div>` : `<div class="card">${emptyState('◆', 'Your portfolio starts here', 'Add a project to see how a portfolio entry works. Project details are stored in this browser only.', '<button class="primary-btn" data-modal="project">Add a project</button>')}</div>`}`;
}
function projectCard(project) {
  const source = safeUrl(project.sourceUrl);
  const demo = safeUrl(project.demoUrl);
  return `<article class="project-card searchable"><div class="project-preview">${photoMarkup(project.imageUrl, `${project.title} sample project photo`, 'project-photo')}<span class="project-preview-icon">${iconMarkup('◆')}</span></div><h3>${escapeHtml(project.title)}</h3>${sampleTag(project)}<p>${escapeHtml(project.description)}</p><div class="skills">${(project.skills || []).map(skill => `<span class="skill-chip">${escapeHtml(skill)}</span>`).join('')}</div><span class="status blue">Local preview · not verified</span><div class="action-row">${source ? `<a class="secondary-btn" href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">Source</a>` : ''}${demo ? `<a class="secondary-btn" href="${escapeHtml(demo)}" target="_blank" rel="noopener noreferrer">Demo</a>` : ''}<button class="secondary-btn danger-btn" data-action="delete-project" data-id="${project.id}">Remove</button></div></article>`;
}
function jobCard(job) {
  const company = state.companies.find(item => item.id === job.companyId);
  return `<article class="job-card searchable"><div class="job-top"><span class="company-logo">CP</span><span class="tag">${escapeHtml(job.type)}</span></div><h3>${escapeHtml(job.title)}</h3>${sampleTag(job)}<p>${escapeHtml(company?.name || 'Company Preview')} · ${escapeHtml(job.location || 'Location not specified')}</p><p class="job-description">${escapeHtml(job.description)}</p><div class="job-meta"><span>${escapeHtml(job.skills || 'Skills not specified')}</span><span>Local preview</span></div><div class="action-row"><button class="primary-btn" data-view="jobs">View and apply</button></div></article>`;
}
function skills() {
  const evidence = state.projects.filter(project => project.skills.length);
  return `${pageHead('My Skills', 'Skills are not independently verified in this local preview.', '')}
    <div class="grid dashboard-grid"><div class="card"><div class="card-head"><h2>Project tags</h2></div>${evidence.length ? evidence.map(project => `<div class="course-row"><strong>${escapeHtml(project.title)}</strong><div class="skills">${project.skills.map(skill => `<span class="skill-chip">${escapeHtml(skill)}</span>`).join('')}</div><span class="status amber">Unverified</span></div>`).join('') : emptyState('◎', 'No project skills added yet', 'Add skill tags to a project; they will be shown as self-reported, not verified.')}</div>
      <div class="card"><div class="card-head"><h2>Verified competency</h2></div>${emptyState('◇', 'No assessment evidence', 'Verified skill levels require connected assessments and project reviews.')}</div></div>`;
}
function jobs() {
  const available = state.jobs.filter(job => job.status === 'published');
  const query = document.getElementById('jobSearch')?.value || '';
  const filtered = available.filter(job => `${job.title} ${job.location} ${job.skills}`.toLowerCase().includes(query.toLowerCase()));
  return `${pageHead('Find Jobs', 'Preview roles created from the Company Preview workspace.', '')}
    <div class="preview-callout"><span class="preview-dot"></span><span>Only local preview postings appear here. Applying does not send an application to an employer.</span></div>
    <div class="filters"><input id="jobSearch" aria-label="Search preview jobs" placeholder="Search preview roles" value="${escapeHtml(query)}"></div>
    <div class="card table-card"><table class="data-table"><thead><tr><th>Role</th><th>Location</th><th>Skills</th><th>Type</th><th>Action</th></tr></thead><tbody>${filtered.map(job => {
      const applied = state.applications.some(app => app.jobId === job.id);
      return `<tr class="searchable"><td><strong>${escapeHtml(job.title)}</strong><br>${sampleTag(job)}<span class="muted-copy">Local preview posting</span></td><td>${escapeHtml(job.location || 'Not specified')}</td><td>${escapeHtml(job.skills || 'Not specified')}</td><td>${escapeHtml(job.type)}</td><td><button class="${applied ? 'secondary-btn' : 'primary-btn'}" data-action="apply" data-id="${job.id}" ${applied ? 'disabled' : ''}>${applied ? 'Applied in preview' : 'Apply'}</button></td></tr>`;
    }).join('') || `<tr><td colspan="5">${emptyState('⌕', 'No preview jobs found', 'A company can create a local preview posting in Manage Jobs.')}</td></tr>`}</tbody></table></div>`;
}
function applications() {
  return `${pageHead('Applications', 'Local preview applications created in this browser.', '')}
    <div class="card table-card"><table class="data-table"><thead><tr><th>Role</th><th>Location</th><th>Applied</th><th>Status</th></tr></thead><tbody>${state.applications.map(app => {
      const job = state.jobs.find(item => item.id === app.jobId);
      return job ? `<tr><td><strong>${escapeHtml(job.title)}</strong>${sampleTag(app)}</td><td>${escapeHtml(job.location || 'Not specified')}</td><td>${escapeHtml(app.appliedAt)}</td><td><span class="status blue">${escapeHtml(app.status)}</span></td></tr>` : '';
    }).join('') || `<tr><td colspan="4">${emptyState('▤', 'No applications yet', 'Apply to a local preview job to see its status here.')}</td></tr>`}</tbody></table></div>`;
}
function certificates() {
  const completed = state.enrollments.map(id => previewCourses.find(course => course.id === id)).filter(course => course && courseProgress(course) === 100);
  const currentUserId = state.profile.demo ? 'sample-student-aarav' : 'local-student-profile';
  const examples = state.certificates.filter(certificate => certificate.userId === currentUserId).map(certificate => {
    const learner = currentUserId === 'sample-student-aarav'
      ? state.profile
      : state.users.find(user => user.id === certificate.userId);
    const course = previewCourses.find(item => item.id === certificate.courseId);
    return learner && course ? { ...certificate, learner, course } : null;
  }).filter(Boolean);
  return `${pageHead('Your Certificates', 'Certificate examples are linked only to your student profile.', '')}
    <div class="preview-callout"><span class="preview-dot"></span><span>Only certificate examples belonging to ${escapeHtml(state.profile.name)} are shown here. These are fictional designs, not issued or verifiable credentials.</span></div>
    ${completed.length ? `<section class="card completion-panel"><div class="card-head"><div><h2>Your completed courses</h2><p>Completion is calculated from lessons finished in this browser.</p></div><span class="status green">${completed.length} completed</span></div>${completed.map(course => `<div class="course-row"><div class="course-thumb">${iconMarkup('◇')}</div><div class="course-info"><strong>${escapeHtml(course.title)}</strong><small>All ${course.lessons.length} sample lessons completed · Local preview</small></div><span class="status blue">Preview completion</span></div>`).join('')}</section>` : ''}
    ${examples.length ? `<div class="grid certificate-grid">${examples.map(certificate => `<article class="certificate-card"><div class="certificate-paper"><div class="certificate-border"><span class="certificate-kicker">SKILLBRIDGE · SAMPLE</span><span class="certificate-seal">${iconMarkup('◇')}</span><h2>Certificate of<br><em>Achievement</em></h2><p class="certificate-awarded">This illustrative certificate is presented to</p><div class="certificate-learner">${escapeHtml(certificate.learner.name)}</div><p class="certificate-course">for completing the sample course<br><strong>${escapeHtml(certificate.course.title)}</strong></p><div class="certificate-footer"><span>PREVIEW ONLY</span><span>${escapeHtml(certificate.issuedAt)}</span></div></div></div><div class="certificate-meta"><span class="status amber">Sample design · not issued</span><span class="certificate-id">Example ID: ${escapeHtml(certificate.credentialId)}</span></div></article>`).join('')}</div>` : `<div class="card">${emptyState('◇', 'No certificate examples for this profile', 'When sample certificate data is available for this student, only that student’s examples will appear here.')}</div>`}
    <div class="card certificate-note"><strong>How real certificates will work</strong><p>A production certificate should be issued only after course requirements are met, use a unique verifiable credential, and be backed by the learning service. This preview does not issue or verify credentials.</p></div>`;
}
function companyDashboard() {
  const openJobs = state.jobs.filter(job => job.status === 'published').length;
  const candidates = candidateRecords().length;
  const companyJobsChart = dataChart('Open roles by company', 'Published local preview listings.', state.companies.map(company => ({
    label: company.name,
    value: state.jobs.filter(job => job.companyId === company.id && job.status === 'published').length
  })));
  const pipelineChart = dataChart('Application pipeline', 'Applications grouped by their current preview stage.', ['Applied', 'Reviewing', 'Shortlisted', 'Interview', 'Offer', 'Rejected'].map(status => ({
    label: status,
    value: state.applications.filter(application => application.status === status).length
  })));
  return `${dashboardHero('COMPANY WORKSPACE', 'Find your next great teammate', 'Explore consent-shared student profiles, manage open roles, and follow applications through your hiring pipeline.', `${sampleDataButton()}<button class="primary-btn" data-modal="job">+ Create preview job</button>`)}
    <div class="preview-callout"><span class="preview-dot"></span><span>Local preview only: jobs and applications stay in this browser. Fictional sample records are labeled.</span></div>
    <div class="grid stats">${stat('▤', openJobs, 'Open preview jobs', 'Created on this device')}${stat('◎', candidates, 'Visible preview profiles', 'Consent-controlled')}${stat('⌁', state.applications.length, 'Preview applications', 'Local records only')}${stat('◷', state.interviews.length, 'Sample interviews', 'Not booked externally')}</div>
    ${dashboardAnalytics(`${companyJobsChart}${pipelineChart}`)}
    <div class="grid dashboard-grid"><div class="card"><div class="card-head"><h2>Recent applications</h2><button class="text-btn" data-view="company-applications">View all</button></div>${state.applications.length ? state.applications.slice(-4).reverse().map(applicationRow).join('') : emptyState('⌁', 'No applications yet', 'Applications to your preview job postings will appear here.')}</div>
    <div class="card"><div class="card-head"><h2>Hiring workspace</h2></div>${emptyState('▤', `${openJobs} open preview jobs`, 'Create a job listing to test the student application flow.', '<button class="secondary-btn" data-view="company-jobs">Manage jobs</button>')}</div></div>
    <div class="card"><div class="card-head"><h2>Company previews</h2><span class="status blue">Fictional organizations</span></div>
      ${state.companies.length ? `<div class="grid section-grid">${state.companies.map(company => {
        const companyJobsCount = state.jobs.filter(job => job.companyId === company.id).length;
        const website = safeUrl(company.website);
        return `<article class="candidate-card searchable"><div class="candidate-card-head"><span class="company-logo">${escapeHtml(initials(company.name))}</span><span class="status ${company.status.startsWith('Verified') ? 'green' : 'amber'}">${escapeHtml(company.status)}</span></div><h3>${escapeHtml(company.name)}</h3>${sampleTag(company)}<p>${escapeHtml(company.industry)} · ${escapeHtml(company.teamSize || 'Team size not listed')}</p><p>${escapeHtml(company.location)}</p><p>${escapeHtml(company.description || '')}</p><p>${escapeHtml(`Founded ${company.founded || 'not listed'} · ${companyJobsCount} preview job${companyJobsCount === 1 ? '' : 's'}`)}</p><p class="muted-copy">${escapeHtml(company.email || 'Contact not listed')}</p>${website ? `<p class="muted-copy">Sample website: ${escapeHtml(website)}</p>` : ''}</article>`;
      }).join('')}</div>` : emptyState('⌂', 'No company profiles loaded', 'Choose Add sample data to see fictional company profiles and their preview jobs.')}</div>`;
}
function applicationRow(app) {
  const job = state.jobs.find(item => item.id === app.jobId);
  const applicant = resolveApplicant(app);
  return `<div class="course-row"><div class="course-thumb">${iconMarkup('♙')}</div><div class="course-info"><strong>${escapeHtml(job?.title || 'Removed job')}</strong><small>${escapeHtml(applicant.name || 'Student preview')} · ${escapeHtml(app.appliedAt)}</small>${sampleTag(app)}</div><span class="status blue">${escapeHtml(app.status)}</span></div>`;
}
function resolveApplicant(application) {
  if (state.profile.demo && application.applicantId === 'sample-student-aarav') return state.profile;
  return state.users.find(item => item.id === application.applicantId) || state.profile;
}
function candidateRecords() {
  const candidates = state.users.filter(user => user.role === 'Student' && user.id !== 'sample-student-aarav' && ['recruiters', 'public'].includes(user.visibility));
  if (state.profile.name !== 'Student Preview' && ['recruiters', 'public'].includes(state.profile.visibility) && !candidates.some(user => user.name === state.profile.name)) {
    candidates.unshift({
      id: state.profile.demo ? 'sample-student-aarav' : 'local-student-profile',
      name: state.profile.name,
      role: 'Student',
      visibility: state.profile.visibility,
      headline: state.profile.headline,
      location: state.profile.location,
      skills: [],
      demo: state.profile.demo
    });
  }
  return candidates;
}
function candidates() {
  return `${pageHead('Find Students', 'Preview candidate access respects the student visibility setting.', '')}
    <div class="preview-callout"><span class="preview-dot"></span><span>Only profiles explicitly marked for recruiter sharing appear. Sample profiles are fictional and labeled.</span></div>
    ${candidateRecords().length ? `<div class="grid section-grid">${candidateRecords().map(candidate => `<article class="card candidate-card searchable"><div class="candidate-card-head">${avatarMarkup(candidate, 'profile-avatar-wrap')}<span class="status green">Opted in</span></div><h3>${escapeHtml(candidate.name)}</h3>${sampleTag(candidate)}<p>${escapeHtml(candidate.headline || 'Student preview profile')}</p><p>${escapeHtml(candidate.location || 'Location not specified')}</p><div class="skills">${(candidate.skills || []).map(skill => `<span class="skill-chip">${escapeHtml(skill)}</span>`).join('')}</div><button class="secondary-btn" data-modal="candidate" data-candidate-id="${escapeHtml(candidate.id)}">View details</button></article>`).join('')}</div>` : `<div class="card">${emptyState('♙', 'No candidates have opted in', 'Profiles marked private are not shown to recruiters. Add sample data or enable recruiter visibility in the student preview.', '<button class="secondary-btn" data-view="student-dashboard">Go to student preview</button>')}</div>`}`;
}
function companyJobs() {
  return `${pageHead('Manage Jobs', 'Create local job listings and test the student application flow.', '<button class="primary-btn" data-modal="job">+ Create preview job</button>')}
    <div class="card table-card"><table class="data-table"><thead><tr><th>Role</th><th>Company</th><th>Location</th><th>Type</th><th>Status</th><th>Action</th></tr></thead><tbody>${state.jobs.map(job => {
      const company = state.companies.find(item => item.id === job.companyId);
      return `<tr><td><strong>${escapeHtml(job.title)}</strong><br>${sampleTag(job)}<span class="muted-copy">Local preview posting</span></td><td>${escapeHtml(company?.name || 'Company Preview')}</td><td>${escapeHtml(job.location || 'Not specified')}</td><td>${escapeHtml(job.type)}</td><td><span class="status ${job.status === 'published' ? 'green' : 'amber'}">${escapeHtml(job.status)}</span></td><td><button class="secondary-btn" data-action="toggle-job" data-id="${job.id}">${job.status === 'published' ? 'Close job' : 'Reopen job'}</button></td></tr>`;
    }).join('') || `<tr><td colspan="6">${emptyState('▤', 'No jobs created', 'Create a preview posting. It will become visible in the student role.')}</td></tr>`}</tbody></table></div>`;
}
function companyApplications() {
  return `${pageHead('Applications', 'Update local preview application stages.', '')}
    <div class="card table-card"><table class="data-table"><thead><tr><th>Role</th><th>Applicant</th><th>Applied</th><th>Status</th><th>Update status</th></tr></thead><tbody>${state.applications.map(app => {
      const job = state.jobs.find(item => item.id === app.jobId);
      const applicant = resolveApplicant(app);
      return job ? `<tr><td><strong>${escapeHtml(job.title)}</strong><br>${sampleTag(app)}</td><td>${escapeHtml(applicant.name || 'Student Preview')} ${sampleTag(applicant)}</td><td>${escapeHtml(app.appliedAt)}</td><td><span class="status blue">${escapeHtml(app.status)}</span></td><td><select aria-label="Update application status" data-action="application-status" data-id="${app.id}">${['Applied', 'Reviewing', 'Shortlisted', 'Interview', 'Offer', 'Rejected'].map(status => `<option ${status === app.status ? 'selected' : ''}>${status}</option>`).join('')}</select></td></tr>` : '';
    }).join('') || `<tr><td colspan="5">${emptyState('⌁', 'No applications to review', 'Create a preview job, then apply while using the student role.')}</td></tr>`}</tbody></table></div>`;
}
function adminDashboard() {
  const profiles = state.profile.name === 'Student Preview' ? 0 : 1;
  const accountChart = dataChart('Preview account mix', 'Fictional local accounts by role.', [
    { label: 'Students', value: state.users.filter(user => user.role === 'Student').length },
    { label: 'Company members', value: state.users.filter(user => user.role === 'Company member').length },
    { label: 'Companies', value: state.companies.length }
  ]);
  const workspaceChart = dataChart('Workspace activity', 'Local records only; not platform-wide metrics.', [
    { label: 'Courses', value: previewCourses.length },
    { label: 'Projects', value: state.projects.length },
    { label: 'Jobs', value: state.jobs.length },
    { label: 'Applications', value: state.applications.length },
    { label: 'Sample payments', value: state.payments.length }
  ]);
  return `${dashboardHero('ADMIN OVERVIEW', 'Your platform at a glance', 'Review sample accounts, company profiles, learning content, and workspace activity in one place.', sampleDataButton())}<div class="preview-callout"><span class="preview-dot"></span><span>Counts below describe this browser only, not a live SkillBridge platform. Fictional sample records are labeled.</span></div>
    <div class="grid stats">${stat('♙', Math.max(profiles, state.users.length), 'Preview profiles', 'Local workspace only')}${stat('⌂', state.companies.length, 'Company samples', 'Fictional local records')}${stat('▤', previewCourses.length, 'Sample courses', 'Static sample curriculum')}${stat('₹', state.payments.length, 'Sample payment records', 'No live transactions')}</div>
    ${dashboardAnalytics(`${accountChart}${workspaceChart}`)}
    <div class="grid dashboard-grid"><div class="card"><div class="card-head"><h2>Local workspace activity</h2></div>${emptyState('▥', `${state.projects.length} projects · ${state.jobs.length} jobs · ${state.applications.length} applications`, 'These are user-created local preview records only.')}</div><div class="card"><div class="card-head"><h2>Service status</h2></div>${emptyState('◇', 'No production services connected', 'Authentication, API, database, payments, and analytics are not part of this frontend workspace.')}</div></div>`;
}
function users() {
  const records = [...state.users];
  if (state.profile.demo) {
    const sampleStudentIndex = records.findIndex(user => user.id === 'sample-student-aarav');
    if (sampleStudentIndex >= 0) {
      records[sampleStudentIndex] = { ...records[sampleStudentIndex], ...state.profile, id: 'sample-student-aarav', role: 'Student' };
    }
  }
  if (state.profile.name !== 'Student Preview' && !records.some(user => user.name === state.profile.name)) {
    records.unshift({ id: 'local-student-profile', name: state.profile.name, email: state.profile.email, role: 'Student', visibility: state.profile.visibility, headline: state.profile.headline, location: state.profile.location, demo: state.profile.demo });
  }
  return `${pageHead('User Management', 'Fictional local preview accounts only; there is no real user directory.', '')}
    <div class="preview-callout"><span class="preview-dot"></span><span>Sample accounts are not real people and do not authenticate. This view does not manage production users.</span></div>
    ${records.length ? `<div class="card table-card"><table class="data-table"><thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Location</th><th>Profile visibility</th><th>Record type</th></tr></thead><tbody>${records.map(user => `<tr class="searchable"><td><div class="user-identity">${avatarMarkup(user, 'user-avatar-wrap')}<span><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.headline || '')}</small></span></div></td><td>${escapeHtml(user.role)}</td><td>${escapeHtml(user.email || 'Not shared')}</td><td>${escapeHtml(user.location || 'Not shared')}</td><td><span class="status ${user.visibility === 'private' ? 'amber' : 'green'}">${escapeHtml(user.visibility)}</span></td><td>${sampleTag(user)}${user.demo ? 'Sample' : 'Local preview'}</td></tr>`).join('')}</tbody></table></div>` : `<div class="card">${emptyState('♙', 'No preview users yet', 'Add the fictional sample dataset from a dashboard to populate this table.')}</div>`}`;
}
function companies() {
  return `${pageHead('Company Management', 'Fictional company profiles included for demonstrating the admin view.', '')}
    <div class="preview-callout"><span class="preview-dot"></span><span>Sample companies and verification labels are demonstrations only; no real business is represented or verified.</span></div>
    ${state.companies.length ? `<div class="card table-card"><table class="data-table"><thead><tr><th>Company</th><th>Industry</th><th>Contact</th><th>Website</th><th>Team size</th><th>Founded</th><th>Location</th><th>Preview jobs</th><th>Sample status</th></tr></thead><tbody>${state.companies.map(company => `<tr class="searchable"><td><strong>${escapeHtml(company.name)}</strong><br><span class="muted-copy">${escapeHtml(company.description || '')}</span><br>${sampleTag(company)}</td><td>${escapeHtml(company.industry)}</td><td>${escapeHtml(company.email || 'Not shared')}</td><td>${escapeHtml(company.website || 'Not listed')}</td><td>${escapeHtml(company.teamSize || 'Not specified')}</td><td>${escapeHtml(company.founded || 'Not listed')}</td><td>${escapeHtml(company.location)}</td><td>${escapeHtml(company.jobs)}</td><td><span class="status ${company.status.startsWith('Verified') ? 'green' : 'amber'}">${escapeHtml(company.status)}</span></td></tr>`).join('')}</tbody></table></div>` : `<div class="card">${emptyState('⌂', 'No sample companies yet', 'Add the fictional sample dataset from a dashboard to populate this view.')}</div>`}`;
}
function generic(title, glyph = '▤', extra = '') {
  return `${pageHead(title, 'Manage preview workspace records.', extra)}<div class="card">${emptyState(glyph, `${title} is not connected to a live service`, 'No production records are available in this frontend-only project.')}</div>`;
}
function interviews() {
  return `${pageHead('Interviews', 'Sample interview schedule entries for demonstrating the hiring flow.', '')}
    <div class="preview-callout"><span class="preview-dot"></span><span>These are fictional schedule examples. No meeting has been booked and there is no calendar or video service.</span></div>
    ${state.interviews.length ? `<div class="card table-card"><table class="data-table"><thead><tr><th>Candidate</th><th>Role</th><th>Schedule</th><th>Format</th><th>Status</th></tr></thead><tbody>${state.interviews.map(interview => {
      const candidate = interview.candidateId === 'sample-student-aarav' && state.profile.demo
        ? state.profile
        : state.users.find(user => user.id === interview.candidateId) || state.profile;
      const job = state.jobs.find(item => item.id === interview.jobId);
      return `<tr><td><strong>${escapeHtml(candidate.name)}</strong><br>${sampleTag(interview)}</td><td>${escapeHtml(job?.title || 'Preview role')}</td><td>${escapeHtml(interview.scheduledAt)}</td><td>${escapeHtml(interview.format)}</td><td><span class="status blue">${escapeHtml(interview.status)}</span></td></tr>`;
    }).join('')}</tbody></table></div>` : `<div class="card">${emptyState('◷', 'No preview interviews', 'Interview records are added with the sample dataset. No real meetings are scheduled.')}</div>`}`;
}
function analytics() {
  const stages = ['Applied', 'Reviewing', 'Shortlisted', 'Interview', 'Offer', 'Rejected'].map(status => ({
    status,
    count: state.applications.filter(application => application.status === status).length
  }));
  const max = Math.max(1, ...stages.map(stage => stage.count));
  const activeJobs = state.jobs.filter(job => job.status === 'published').length;
  return `${pageHead('Recruitment Analytics', 'Counts are calculated only from local preview postings and applications.', '')}
    <div class="preview-callout"><span class="preview-dot"></span><span>These local counts are not platform analytics or hiring-performance evidence. Seeded records are fictional.</span></div>
    <div class="grid stats">${stat('▤', activeJobs, 'Open preview jobs', 'Local postings')}${stat('⌁', state.applications.length, 'Preview applications', 'Local records')}${stat('◷', state.interviews.length, 'Sample interviews', 'Not scheduled externally')}${stat('◎', candidateRecords().length, 'Opted-in sample profiles', 'Consent-filtered')}</div>
    <div class="card analytics-card"><div class="card-head"><h2>Application stages</h2>${dataNotice()}</div>${state.applications.length ? `<div class="pipeline-list">${stages.map(stage => `<div class="pipeline-row"><span>${stage.status}</span><div class="pipeline-track" aria-label="${stage.count} applications"><i style="width:${Math.round(stage.count / max * 100)}%"></i></div><strong>${stage.count}</strong></div>`).join('')}</div>` : emptyState('▥', 'No application records', 'Applications created in this browser preview will be summarized here.')}</div>`;
}
function assessments() {
  const records = [
    { title: 'Web Foundations Checkpoint', course: 'Web Development Foundations', duration: '15 min', status: 'Sample assessment' },
    { title: 'JavaScript Fundamentals Quiz', course: 'JavaScript Core Concepts', duration: '20 min', status: 'Sample assessment' },
    { title: 'Portfolio Evidence Review', course: 'Build Your Project Portfolio', duration: 'Instructor reviewed', status: 'Not connected' }
  ];
  return `${pageHead('Assessment Management', 'Sample assessment outlines only; no tests are graded or skills verified.', '')}
    <div class="preview-callout"><span class="preview-dot"></span><span>No assessment answers, grades, or verified competencies are generated in this frontend preview.</span></div>
    <div class="card table-card"><table class="data-table"><thead><tr><th>Assessment</th><th>Course</th><th>Format</th><th>Status</th></tr></thead><tbody>${records.map(record => `<tr><td><strong>${escapeHtml(record.title)}</strong><br><span class="status amber">Sample data</span></td><td>${escapeHtml(record.course)}</td><td>${escapeHtml(record.duration)}</td><td><span class="status blue">${escapeHtml(record.status)}</span></td></tr>`).join('')}</tbody></table></div>`;
}
function adminCourses() {
  return `${pageHead('Course Management', 'Sample curriculum is display-only in the preview.', '<button class="secondary-btn" data-modal="suggestion">Submit a suggestion</button>')}
    <div class="grid section-grid">${previewCourses.map(course => courseCard(course, false, false)).join('')}</div>
    <div class="card suggestion-list"><div class="card-head"><h2>Course suggestions</h2></div>${state.suggestions.length ? `<ul>${state.suggestions.map(item => `<li>${escapeHtml(item.title)} ${sampleTag(item)} <span class="status blue">Local preview</span></li>`).join('')}</ul>` : '<p class="muted-copy">No suggestions submitted in this browser.</p>'}</div>`;
}
function adminProjects() {
  return `${pageHead('Project Moderation', 'Review project records created in this browser.', '')}
    <div class="card">${state.projects.length ? `<div class="grid section-grid">${state.projects.map(projectCard).join('')}</div>` : emptyState('◆', 'No local projects to review', 'Student preview projects appear here after they are added.')}</div>`;
}
function adminReports() {
  return `${pageHead('Reports & Analytics', 'Only local preview records are summarized.', '')}<div class="grid stats">${stat('◆', state.projects.length, 'Local projects', 'This browser only')}${stat('▤', state.jobs.length, 'Local job postings', 'This browser only')}${stat('⌁', state.applications.length, 'Local applications', 'This browser only')}${stat('₹', state.payments.length, 'Sample payment records', 'Not revenue')}</div><div class="card">${emptyState('▥', 'No platform analytics', 'These local counts are not platform-wide reports and should not be used as business metrics. Sample payment entries are not real transactions or revenue.')}</div>`;
}
function payments() {
  return `${pageHead('Payments', 'Fictional course payment examples for the admin preview.', '')}
    <div class="preview-callout"><span class="preview-dot"></span><span>Every row is fictional sample data. No payment was made, no card or bank details are stored, and these records do not grant course access or represent revenue.</span></div>
    ${state.payments.length ? `<div class="card table-card"><table class="data-table"><thead><tr><th>Learner</th><th>Course</th><th>Amount</th><th>Date</th><th>Method</th><th>Status</th><th>Reference</th></tr></thead><tbody>${state.payments.map(payment => {
      const learner = state.users.find(user => user.id === payment.userId) || (state.profile.demo && payment.userId === 'sample-student-aarav' ? state.profile : null);
      const course = previewCourses.find(item => item.id === payment.courseId);
      const status = String(payment.status || 'Sample record');
      const statusClass = status.startsWith('Paid') ? 'green' : status.startsWith('Pending') ? 'amber' : 'blue';
      return `<tr class="searchable"><td><strong>${escapeHtml(learner?.name || 'Preview learner')}</strong><br>${sampleTag(payment)}</td><td>${escapeHtml(course?.title || 'Sample course')}</td><td>${escapeHtml(`₹${Number(payment.amount || 0).toLocaleString('en-IN')}`)}</td><td>${escapeHtml(payment.paidAt || 'Sample record')}</td><td>${escapeHtml(payment.method || 'Preview only')}</td><td><span class="status ${statusClass}">${escapeHtml(status)}</span></td><td>${escapeHtml(payment.reference || 'Sample reference')}</td></tr>`;
    }).join('')}</tbody></table></div>` : `<div class="card">${emptyState('₹', 'No sample payment records yet', 'Add the fictional sample dataset from a dashboard to populate this view.')}</div>`}`;
}
function learningPlayer() {
  const course = previewCourses.find(item => item.id === activeCourseId);
  if (!course) return `${pageHead('Course lesson', 'No course selected.', '<button class="secondary-btn" data-view="learning">← Back to learning</button>')}<div class="card">${emptyState('▤', 'Choose a course first', 'Open a course from My Learning to view its sample lessons.')}</div>`;
  const completed = state.lessonProgress[course.id] || [];
  return `${pageHead(course.title, 'Sample lesson content · saved only in this browser.', '<button class="secondary-btn" data-view="learning">← Back to learning</button>')}
    <div class="lesson-layout"><aside class="card lesson-list"><h2>Course lessons</h2>${course.lessons.map((lesson, index) => `<button class="lesson-item ${index === 0 ? 'selected' : ''}" data-action="select-lesson" data-index="${index}" data-course="${course.id}"><span class="lesson-check">${completed.includes(index) ? iconMarkup('✓') : index + 1}</span>${escapeHtml(lesson)}</button>`).join('')}</aside>
    <article class="card lesson-content"><span class="tag">SAMPLE CONTENT</span><h2 id="lessonTitle">${escapeHtml(course.lessons[0])}</h2><p>This sample lesson illustrates the course player experience. Replace this content with authored lessons and protected media when a learning backend is available.</p><div class="lesson-note"><strong>Try it</strong><p>Write down one concept you learned and how you could demonstrate it in a small project.</p></div><button class="primary-btn" data-action="complete-lesson" data-course="${course.id}" data-index="0">${completed.includes(0) ? 'Lesson completed' : 'Mark lesson complete'}</button></article></div>`;
}
const renderers = {
  'student-dashboard': studentDashboard, learning, explore, projects, skills, jobs, applications, certificates,
  'company-dashboard': companyDashboard, candidates, 'company-jobs': companyJobs, 'company-applications': companyApplications,
  'admin-dashboard': adminDashboard, users, companies,
  interviews,
  analytics,
  'admin-courses': adminCourses,
  'admin-projects': adminProjects,
  assessments,
  payments,
  reports: adminReports,
  'learning-player': learningPlayer
};
function render(view) {
  currentView = renderers[view] ? view : 'student-dashboard';
  content.innerHTML = renderers[currentView]();
  renderNav();
  closeMobile();
  applySearchFilter();
}
function toast(message) {
  const node = document.getElementById('toast');
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('show'), 2800);
}
function closeMobile() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('mobileBackdrop').classList.remove('open');
}
function syncRole() {
  const names = { student: [state.profile.name, 'Student', initials(state.profile.name)], company: ['Company Preview', 'Company', 'CO'], admin: ['Platform Admin', 'Administrator', 'AD'] };
  const [name, label, avatar] = names[currentRole];
  const person = currentRole === 'student' && state.profile.demo
    ? state.profile
    : currentRole === 'admin'
      ? state.users.find(user => user.id === 'sample-admin-profile')
      : null;
  document.getElementById('roleName').textContent = name;
  document.getElementById('roleLabel').textContent = label;
  document.getElementById('roleAvatar').innerHTML = person?.avatarUrl
    ? photoMarkup(person.avatarUrl, `Sample profile photo of ${person.name}`, 'role-avatar-photo')
    : escapeHtml(avatar);
  document.getElementById('topName').textContent = name;
  document.getElementById('topRole').textContent = label;
  document.getElementById('topAvatar').innerHTML = person?.avatarUrl
    ? photoMarkup(person.avatarUrl, `Sample profile photo of ${person.name}`, 'top-avatar-photo')
    : escapeHtml(avatar);
  document.getElementById('roleSwitch').setAttribute('aria-label', `Switch preview role. Current role: ${label}`);
}
function openModal(type, candidateId = '') {
  returnFocus = document.activeElement;
  const titles = { project: 'Add project to portfolio', profile: 'Student preview profile', suggestion: 'Suggest a course', job: 'Create a preview job', candidate: 'Candidate preview' };
  if (type === 'candidate') {
    const candidate = candidateId === 'local-student-profile' || (candidateId === 'sample-student-aarav' && state.profile.demo)
      ? state.profile
      : state.users.find(user => user.id === candidateId) || state.profile;
    modalBody.innerHTML = `<h2 id="modalHeading">${titles[type]}</h2><p><strong>${escapeHtml(candidate.name)}</strong></p>${sampleTag(candidate)}<p>${escapeHtml(candidate.headline || 'Student preview profile')}</p><p>${escapeHtml(candidate.location || 'Location not specified')}</p><div class="skills">${(candidate.skills || []).map(skill => `<span class="skill-chip">${escapeHtml(skill)}</span>`).join('')}</div><span class="status blue">Profile shared in local preview</span><p class="muted-copy">No verified skills, assessment scores, contact details, or private documents are exposed by this demo.</p>`;
  } else if (type === 'project') {
    modalBody.innerHTML = `<h2 id="modalHeading">${titles[type]}</h2><form data-form="project"><div class="form-grid"><label class="field">Project title<input name="title" required maxlength="120" placeholder="e.g. Campus events planner"></label><label class="field">Skills (comma-separated)<input name="skills" maxlength="240" placeholder="JavaScript, CSS"></label><label class="field">Source URL<input name="sourceUrl" type="url" placeholder="https://github.com/..."></label><label class="field">Demo URL<input name="demoUrl" type="url" placeholder="https://..."></label><label class="field full-span">Project description<textarea name="description" required maxlength="1200" placeholder="What does it do? What did you build?"></textarea></label></div><div class="action-row"><button type="submit" class="primary-btn">Save preview project</button></div></form>`;
  } else if (type === 'profile') {
    modalBody.innerHTML = `<h2 id="modalHeading">${titles[type]}</h2><form data-form="profile"><div class="form-grid"><label class="field">Display name<input name="name" required maxlength="80" value="${escapeHtml(state.profile.name)}"></label><label class="field">Email (optional)<input name="email" type="email" maxlength="254" value="${escapeHtml(state.profile.email)}"></label><label class="field">Professional headline<input name="headline" maxlength="120" value="${escapeHtml(state.profile.headline)}" placeholder="e.g. Computer science student"></label><label class="field">Location<input name="location" maxlength="100" value="${escapeHtml(state.profile.location)}" placeholder="City, country"></label><label class="field full-span">Recruiter visibility<select name="visibility"><option value="private" ${state.profile.visibility === 'private' ? 'selected' : ''}>Private (default)</option><option value="recruiters" ${state.profile.visibility === 'recruiters' ? 'selected' : ''}>Recruiters in this preview</option><option value="public" ${state.profile.visibility === 'public' ? 'selected' : ''}>Public in this preview</option></select></label></div><p class="muted-copy">Visibility affects only this browser preview. This is not a real account or secure recruiter system.</p><div class="action-row"><button type="submit" class="primary-btn">Save preview profile</button></div></form>`;
  } else if (type === 'job') {
    modalBody.innerHTML = `<h2 id="modalHeading">${titles[type]}</h2><form data-form="job"><div class="form-grid"><label class="field">Job title<input name="title" required maxlength="120" placeholder="Frontend internship"></label><label class="field">Type<select name="type"><option>Internship</option><option>Full-time</option><option>Part-time</option><option>Contract</option></select></label><label class="field">Location<input name="location" maxlength="100" placeholder="Remote or city"></label><label class="field">Skills<input name="skills" maxlength="240" placeholder="React, JavaScript"></label><label class="field full-span">Description<textarea name="description" required maxlength="1600" placeholder="Role responsibilities and requirements"></textarea></label></div><div class="action-row"><button type="submit" class="primary-btn">Publish local preview job</button></div></form>`;
  } else if (type === 'suggestion') {
    modalBody.innerHTML = `<h2 id="modalHeading">${titles[type]}</h2><form data-form="suggestion"><div class="form-grid"><label class="field full-span">Course title<input name="title" required maxlength="120" placeholder="What should learners study?"></label><label class="field full-span">Why would this course help?<textarea name="description" maxlength="600" placeholder="Share a short reason"></textarea></label></div><div class="action-row"><button type="submit" class="primary-btn">Save local suggestion</button></div></form>`;
  } else return;
  modalBackdrop.classList.add('open');
  modalBackdrop.querySelector('.modal-close').focus();
}
function closeModal() {
  modalBackdrop.classList.remove('open');
  if (returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus();
}
function applySearchFilter() {
  const query = (document.getElementById('globalSearch').value || '').trim().toLowerCase();
  const localQuery = currentView === 'explore' ? (document.getElementById('courseSearch')?.value || '').trim().toLowerCase()
    : currentView === 'jobs' ? (document.getElementById('jobSearch')?.value || '').trim().toLowerCase() : '';
  const searchTerms = [query, localQuery].filter(Boolean).flatMap(term => term.split(/\s+/));
  const category = currentView === 'explore' ? (document.getElementById('courseCategory')?.value || '').toLowerCase() : '';
  const selector = currentView === 'explore' ? '.course-card' : currentView === 'jobs' ? '.data-table tbody tr.searchable' : '.searchable';
  content.querySelectorAll(selector).forEach(item => {
    const text = item.textContent.toLowerCase();
    const matchesText = searchTerms.every(term => text.includes(term));
    const matchesCategory = !category || item.dataset.category?.toLowerCase() === category;
    item.hidden = !matchesText || !matchesCategory;
  });
}
function submitForm(form) {
  const values = Object.fromEntries(new FormData(form).entries());
  if (form.dataset.form === 'profile') {
    Object.assign(state.profile, values);
    const saved = saveState();
    syncRole();
    render(currentView);
    if (saved) toast('Preview profile saved in this browser.');
  } else if (form.dataset.form === 'project') {
    state.projects.push({ id: createId(), title: values.title.trim(), description: values.description.trim(), sourceUrl: safeUrl(values.sourceUrl), demoUrl: safeUrl(values.demoUrl), skills: values.skills.split(',').map(item => item.trim()).filter(Boolean).slice(0, 20), createdAt: new Date().toLocaleDateString() });
    const saved = saveState();
    render(currentView);
    if (saved) toast('Project saved to this browser preview.');
  } else if (form.dataset.form === 'job') {
    state.jobs.push({ id: createId(), title: values.title.trim(), type: values.type, location: values.location.trim(), skills: values.skills.trim(), description: values.description.trim(), status: 'published', createdAt: new Date().toLocaleDateString() });
    const saved = saveState();
    render(currentView);
    if (saved) toast('Local preview job published. It is not sent to an employer.');
  } else if (form.dataset.form === 'suggestion') {
    state.suggestions.push({ id: createId(), title: values.title.trim(), description: values.description.trim(), createdAt: new Date().toLocaleDateString() });
    const saved = saveState();
    render(currentView);
    if (saved) toast('Course suggestion saved in this browser.');
  }
  closeModal();
}
function applyToJob(jobId) {
  const job = state.jobs.find(item => item.id === jobId && item.status === 'published');
  if (!job) return toast('This local preview job is no longer available.');
  if (state.applications.some(item => item.jobId === jobId)) return toast('You already applied in this browser preview.');
  state.applications.push({ id: createId(), jobId, applicantId: state.profile.demo ? 'sample-student-aarav' : 'local-student-profile', status: 'Applied', appliedAt: new Date().toLocaleDateString() });
  const saved = saveState();
  render(currentView);
  if (saved) toast('Preview application saved locally. No employer was notified.');
}
function handleAction(button) {
  const { action, id, course: courseId } = button.dataset;
  if (action === 'load-sample-data') return loadSampleData();
  if (action === 'enroll') {
    if (!state.enrollments.includes(courseId)) state.enrollments.push(courseId);
    const saved = saveState();
    render(currentView);
    if (saved) toast('Enrolled in sample course in this browser preview.');
    return;
  }
  if (action === 'learn') {
    activeCourseId = courseId;
    return render('learning-player');
  }
  if (action === 'apply') return applyToJob(id);
  if (action === 'delete-project') {
    state.projects = state.projects.filter(project => project.id !== id);
    const saved = saveState();
    render(currentView);
    if (saved) toast('Project removed from this browser preview.');
    return;
  }
  if (action === 'toggle-job') {
    const job = state.jobs.find(item => item.id === id);
    if (!job) return;
    job.status = job.status === 'published' ? 'closed' : 'published';
    const saved = saveState();
    render(currentView);
    if (saved) toast(`Preview job ${job.status}.`);
    return;
  }
  if (action === 'complete-lesson') {
    const index = Number(button.dataset.index);
    const completed = state.lessonProgress[courseId] || [];
    if (!completed.includes(index)) completed.push(index);
    state.lessonProgress[courseId] = completed;
    const saved = saveState();
    render(currentView);
    if (saved) toast('Lesson progress saved in this browser.');
    return;
  }
  if (action === 'select-lesson') {
    const course = previewCourses.find(item => item.id === courseId);
    const index = Number(button.dataset.index);
    const title = course?.lessons[index];
    if (title) {
      content.querySelectorAll('.lesson-item').forEach(item => item.classList.toggle('selected', item === button));
      document.getElementById('lessonTitle').textContent = title;
      const completeButton = content.querySelector('[data-action="complete-lesson"]');
      completeButton.dataset.index = String(index);
      const completed = state.lessonProgress[courseId] || [];
      completeButton.disabled = completed.includes(index);
      completeButton.textContent = completed.includes(index) ? 'Lesson completed' : 'Mark lesson complete';
    }
  }
}
function handleSelect(select) {
  if (select.dataset.action !== 'application-status') return;
  const app = state.applications.find(item => item.id === select.dataset.id);
  if (!app) return;
  app.status = select.value;
  const saved = saveState();
  render(currentView);
  if (saved) toast('Preview application status updated locally.');
}

document.addEventListener('error', event => {
  const image = event.target;
  if (image instanceof HTMLImageElement && image.classList.contains('preview-photo')) {
    image.parentElement?.classList.add('image-failed');
  }
}, true);
document.addEventListener('click', event => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;
  const viewButton = target.closest('[data-view]');
  if (viewButton) {
    event.preventDefault();
    const view = viewButton.dataset.view;
    if (view === 'student-dashboard' || view === 'learning' || view === 'explore' || view === 'projects' || view === 'skills' || view === 'jobs' || view === 'applications' || view === 'certificates') currentRole = 'student';
    else if (view.startsWith('company-') || view === 'candidates' || view === 'interviews' || view === 'analytics') currentRole = 'company';
    else if (['admin-dashboard', 'users', 'companies', 'admin-courses', 'admin-projects', 'assessments', 'payments', 'reports'].includes(view)) currentRole = 'admin';
    syncRole();
    return render(view);
  }
  const modalButton = target.closest('[data-modal]');
  if (modalButton) return openModal(modalButton.dataset.modal, modalButton.dataset.candidateId);
  const actionButton = target.closest('[data-action]');
  if (actionButton && actionButton.tagName === 'BUTTON') return handleAction(actionButton);
  const button = target.closest('button');
  if (!button) return;
  if (button.id === 'themeBtn' || button.id === 'notificationBtn' || button.id === 'menuBtn' || button.id === 'roleSwitch' || button.id === 'modalClose') return;
  if (!button.disabled) toast('This action is not available in the local preview.');
});
document.addEventListener('submit', event => {
  if (!event.target.matches('form[data-form]')) return;
  event.preventDefault();
  if (!event.target.reportValidity()) return;
  submitForm(event.target);
});
document.addEventListener('change', event => {
  const target = event.target;
  if (target.matches('select[data-action]')) return handleSelect(target);
  if (target.id === 'courseCategory') applySearchFilter();
});
document.addEventListener('input', event => {
  if (event.target.id === 'globalSearch' || event.target.id === 'courseSearch' || event.target.id === 'jobSearch') applySearchFilter();
});
document.getElementById('modalClose').addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', event => { if (event.target === modalBackdrop) closeModal(); });
document.getElementById('menuBtn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('mobileBackdrop').classList.add('open');
});
document.getElementById('mobileBackdrop').addEventListener('click', closeMobile);
document.getElementById('themeBtn').addEventListener('click', event => {
  document.body.classList.toggle('dark');
  const dark = document.body.classList.contains('dark');
  event.currentTarget.setAttribute('aria-pressed', String(dark));
  state.theme = dark ? 'dark' : 'light';
  saveState();
});
document.getElementById('notificationBtn').addEventListener('click', () => toast('No local preview notifications.'));
document.getElementById('roleSwitch').addEventListener('click', () => {
  const roles = ['student', 'company', 'admin'];
  currentRole = roles[(roles.indexOf(currentRole) + 1) % roles.length];
  syncRole();
  render(currentRole === 'student' ? 'student-dashboard' : currentRole === 'company' ? 'company-dashboard' : 'admin-dashboard');
});
document.getElementById('globalSearch').addEventListener('keydown', event => {
  if (event.key === 'Enter' && event.currentTarget.value.trim()) {
    event.preventDefault();
    applySearchFilter();
    const visible = [...content.querySelectorAll('.searchable')].some(item => !item.hidden);
    if (!visible) toast('No matching items on this page.');
  }
});
document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    document.getElementById('globalSearch').focus();
  }
  if (event.key === 'Escape') {
    if (modalBackdrop.classList.contains('open')) closeModal();
    closeMobile();
  }
  if (event.key === 'Tab' && modalBackdrop.classList.contains('open')) {
    const focusable = [...modalBackdrop.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]')];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
if (state.theme === 'dark') {
  document.body.classList.add('dark');
  document.getElementById('themeBtn').setAttribute('aria-pressed', 'true');
}
syncRole();
render('student-dashboard');
if (stateLoadIssue) toast(stateLoadIssue);
