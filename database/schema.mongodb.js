// Run with mongosh against the intended database.
// This baseline uses demo-safe fields and must be evolved through migrations.
const definitions = {
  users: {
    required: ["email", "passwordHash", "role", "status", "createdAt"],
    properties: {
      email: { bsonType: "string", minLength: 3, maxLength: 254 },
      passwordHash: { bsonType: "string", minLength: 20 },
      role: { enum: ["student", "company", "instructor", "admin"] },
      status: { enum: ["pending", "active", "suspended", "deleted"] },
      emailVerifiedAt: { bsonType: ["date", "null"] },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: ["date", "null"] }
    }
  },
  studentProfiles: {
    required: ["userId", "fullName", "visibility", "createdAt"],
    properties: {
      userId: { bsonType: "objectId" },
      fullName: { bsonType: "string", minLength: 1, maxLength: 120 },
      education: { bsonType: "array", maxItems: 20, items: { bsonType: "object" } },
      skills: { bsonType: "array", maxItems: 100, items: { bsonType: "string", maxLength: 80 } },
      visibility: { enum: ["private", "recruiters", "public"] },
      consentUpdatedAt: { bsonType: ["date", "null"] },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: ["date", "null"] }
    }
  },
  companies: {
    required: ["ownerUserId", "name", "verificationStatus", "createdAt"],
    properties: {
      ownerUserId: { bsonType: "objectId" },
      name: { bsonType: "string", minLength: 1, maxLength: 160 },
      verificationStatus: { enum: ["pending", "verified", "rejected", "suspended"] },
      website: { bsonType: ["string", "null"], maxLength: 2048 },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: ["date", "null"] }
    }
  },
  courses: {
    required: ["title", "slug", "status", "priceMinor", "currency", "createdAt"],
    properties: {
      title: { bsonType: "string", minLength: 1, maxLength: 180 },
      slug: { bsonType: "string", minLength: 1, maxLength: 200 },
      status: { enum: ["draft", "published", "archived"] },
      level: { enum: ["beginner", "intermediate", "advanced"] },
      priceMinor: { bsonType: ["int", "long"], minimum: 0 },
      currency: { bsonType: "string", minLength: 3, maxLength: 3 },
      instructorId: { bsonType: ["objectId", "null"] },
      skillsCovered: { bsonType: "array", maxItems: 50, items: { bsonType: "string", maxLength: 80 } },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: ["date", "null"] }
    }
  },
  lessons: {
    required: ["courseId", "title", "position", "status", "createdAt"],
    properties: {
      courseId: { bsonType: "objectId" },
      title: { bsonType: "string", minLength: 1, maxLength: 180 },
      position: { bsonType: "int", minimum: 0 },
      status: { enum: ["draft", "published", "archived"] },
      durationSeconds: { bsonType: ["int", "null"], minimum: 0 },
      resourceIds: { bsonType: "array", maxItems: 100, items: { bsonType: "objectId" } },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: ["date", "null"] }
    }
  },
  enrollments: {
    required: ["studentId", "courseId", "status", "progressPercent", "createdAt"],
    properties: {
      studentId: { bsonType: "objectId" },
      courseId: { bsonType: "objectId" },
      status: { enum: ["active", "completed", "cancelled"] },
      progressPercent: { bsonType: "int", minimum: 0, maximum: 100 },
      completedLessonIds: { bsonType: "array", maxItems: 1000, items: { bsonType: "objectId" } },
      completedAt: { bsonType: ["date", "null"] },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: ["date", "null"] }
    }
  },
  assignments: {
    required: ["courseId", "title", "status", "createdAt"],
    properties: {
      courseId: { bsonType: "objectId" },
      lessonId: { bsonType: ["objectId", "null"] },
      title: { bsonType: "string", minLength: 1, maxLength: 180 },
      instructions: { bsonType: "string", maxLength: 20000 },
      status: { enum: ["draft", "published", "archived"] },
      dueAt: { bsonType: ["date", "null"] },
      rubric: { bsonType: "array", maxItems: 50, items: { bsonType: "object" } },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: ["date", "null"] }
    }
  },
  submissions: {
    required: ["assignmentId", "studentId", "status", "submittedAt"],
    properties: {
      assignmentId: { bsonType: "objectId" },
      studentId: { bsonType: "objectId" },
      status: { enum: ["submitted", "reviewing", "reviewed", "returned"] },
      responseText: { bsonType: "string", maxLength: 30000 },
      privateFileIds: { bsonType: "array", maxItems: 30, items: { bsonType: "objectId" } },
      score: { bsonType: ["double", "int", "null"], minimum: 0, maximum: 100 },
      feedback: { bsonType: ["string", "null"], maxLength: 10000 },
      submittedAt: { bsonType: "date" },
      reviewedAt: { bsonType: ["date", "null"] }
    }
  },
  assessments: {
    required: ["title", "status", "timeLimitSeconds", "maxAttempts", "createdAt"],
    properties: {
      title: { bsonType: "string", minLength: 1, maxLength: 180 },
      status: { enum: ["draft", "published", "archived"] },
      timeLimitSeconds: { bsonType: "int", minimum: 60 },
      maxAttempts: { bsonType: "int", minimum: 1, maximum: 20 },
      questionIds: { bsonType: "array", maxItems: 500, items: { bsonType: "objectId" } },
      skillIds: { bsonType: "array", maxItems: 50, items: { bsonType: "objectId" } },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: ["date", "null"] }
    }
  },
  projects: {
    required: ["studentId", "title", "visibility", "reviewStatus", "createdAt"],
    properties: {
      studentId: { bsonType: "objectId" },
      title: { bsonType: "string", minLength: 1, maxLength: 180 },
      description: { bsonType: "string", maxLength: 10000 },
      skills: { bsonType: "array", maxItems: 50, items: { bsonType: "string", maxLength: 80 } },
      sourceUrl: { bsonType: ["string", "null"], maxLength: 2048 },
      demoUrl: { bsonType: ["string", "null"], maxLength: 2048 },
      visibility: { enum: ["private", "recruiters", "public"] },
      reviewStatus: { enum: ["pending", "approved", "rejected", "needs_changes"] },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: ["date", "null"] }
    }
  },
  skillEvidence: {
    required: ["studentId", "skillName", "sourceType", "sourceId", "score", "createdAt"],
    properties: {
      studentId: { bsonType: "objectId" },
      skillName: { bsonType: "string", minLength: 1, maxLength: 80 },
      sourceType: { enum: ["project_review", "assessment", "assignment", "course_quiz"] },
      sourceId: { bsonType: "objectId" },
      score: { bsonType: ["double", "int"], minimum: 0, maximum: 100 },
      rubricVersion: { bsonType: "string", maxLength: 80 },
      reviewedBy: { bsonType: ["objectId", "null"] },
      createdAt: { bsonType: "date" }
    }
  },
  jobs: {
    required: ["companyId", "title", "description", "status", "jobType", "createdAt"],
    properties: {
      companyId: { bsonType: "objectId" },
      title: { bsonType: "string", minLength: 1, maxLength: 180 },
      description: { bsonType: "string", minLength: 1, maxLength: 20000 },
      requiredSkills: { bsonType: "array", maxItems: 50, items: { bsonType: "string", maxLength: 80 } },
      jobType: { enum: ["internship", "full_time", "part_time", "contract"] },
      status: { enum: ["draft", "published", "closed", "archived"] },
      location: { bsonType: "string", maxLength: 160 },
      applicationDeadline: { bsonType: ["date", "null"] },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: ["date", "null"] }
    }
  },
  applications: {
    required: ["studentId", "jobId", "companyId", "status", "consentSnapshotAt", "appliedAt"],
    properties: {
      studentId: { bsonType: "objectId" },
      jobId: { bsonType: "objectId" },
      companyId: { bsonType: "objectId" },
      status: { enum: ["submitted", "reviewing", "shortlisted", "interview", "offer", "hired", "rejected", "withdrawn"] },
      consentSnapshotAt: { bsonType: "date" },
      appliedAt: { bsonType: "date" },
      updatedAt: { bsonType: ["date", "null"] }
    }
  },
  interviews: {
    required: ["applicationId", "companyId", "startsAt", "timeZone", "status", "createdAt"],
    properties: {
      applicationId: { bsonType: "objectId" },
      companyId: { bsonType: "objectId" },
      startsAt: { bsonType: "date" },
      timeZone: { bsonType: "string", minLength: 1, maxLength: 100 },
      status: { enum: ["proposed", "confirmed", "completed", "cancelled", "rescheduled"] },
      participantUserIds: { bsonType: "array", minItems: 1, maxItems: 50, items: { bsonType: "objectId" } },
      privateNotes: { bsonType: "string", maxLength: 10000 },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: ["date", "null"] }
    }
  },
  certificates: {
    required: ["studentId", "courseId", "certificateCode", "issuedAt", "status"],
    properties: {
      studentId: { bsonType: "objectId" },
      courseId: { bsonType: "objectId" },
      certificateCode: { bsonType: "string", minLength: 12, maxLength: 100 },
      issuedAt: { bsonType: "date" },
      status: { enum: ["active", "revoked"] },
      revokedAt: { bsonType: ["date", "null"] }
    }
  },
  entitlements: {
    required: ["userId", "productType", "productId", "status", "startsAt", "createdAt"],
    properties: {
      userId: { bsonType: "objectId" },
      productType: { enum: ["course", "recruiter_plan"] },
      productId: { bsonType: "objectId" },
      paymentId: { bsonType: ["objectId", "null"] },
      status: { enum: ["active", "expired", "revoked"] },
      startsAt: { bsonType: "date" },
      expiresAt: { bsonType: ["date", "null"] },
      createdAt: { bsonType: "date" }
    }
  },
  notifications: {
    required: ["userId", "type", "title", "readAt", "createdAt"],
    properties: {
      userId: { bsonType: "objectId" },
      type: { bsonType: "string", minLength: 1, maxLength: 80 },
      title: { bsonType: "string", minLength: 1, maxLength: 180 },
      body: { bsonType: "string", maxLength: 2000 },
      targetPath: { bsonType: ["string", "null"], maxLength: 500 },
      readAt: { bsonType: ["date", "null"] },
      createdAt: { bsonType: "date" }
    }
  },
  auditEvents: {
    required: ["actorUserId", "action", "resourceType", "resourceId", "createdAt"],
    properties: {
      actorUserId: { bsonType: "objectId" },
      action: { bsonType: "string", minLength: 1, maxLength: 100 },
      resourceType: { bsonType: "string", minLength: 1, maxLength: 80 },
      resourceId: { bsonType: "objectId" },
      requestId: { bsonType: "string", maxLength: 120 },
      // Store only allowlisted metadata; do not copy credentials or full private records here.
      metadata: { bsonType: "object" },
      createdAt: { bsonType: "date" }
    }
  },
  assessmentAttempts: {
    required: ["studentId", "assessmentId", "status", "startedAt"],
    properties: {
      studentId: { bsonType: "objectId" },
      assessmentId: { bsonType: "objectId" },
      status: { enum: ["in_progress", "submitted", "scored", "expired", "needs_review"] },
      score: { bsonType: ["double", "int", "null"], minimum: 0, maximum: 100 },
      startedAt: { bsonType: "date" },
      submittedAt: { bsonType: ["date", "null"] }
    }
  },
  payments: {
    required: ["userId", "provider", "providerOrderId", "status", "amountMinor", "currency", "createdAt"],
    properties: {
      userId: { bsonType: "objectId" },
      provider: { bsonType: "string", maxLength: 60 },
      providerOrderId: { bsonType: "string", maxLength: 200 },
      providerPaymentId: { bsonType: ["string", "null"], maxLength: 200 },
      status: { enum: ["created", "pending", "paid", "failed", "refunded", "cancelled"] },
      amountMinor: { bsonType: ["int", "long"], minimum: 0 },
      currency: { bsonType: "string", minLength: 3, maxLength: 3 },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: ["date", "null"] }
    }
  }
};

for (const [name, definition] of Object.entries(definitions)) {
  const validator = {
    $jsonSchema: {
      bsonType: "object",
      required: definition.required,
      properties: definition.properties
    }
  };
  if (db.getCollectionNames().includes(name)) {
    db.runCommand({ collMod: name, validator, validationLevel: "strict", validationAction: "error" });
  } else {
    db.createCollection(name, { validator, validationLevel: "strict", validationAction: "error" });
  }
}

db.users.createIndex({ email: 1 }, { unique: true, name: "uq_users_email" });
db.studentProfiles.createIndex({ userId: 1 }, { unique: true, name: "uq_student_profile_user" });
db.studentProfiles.createIndex({ visibility: 1, skills: 1 }, { name: "ix_student_visibility_skills" });
db.companies.createIndex({ ownerUserId: 1 }, { name: "ix_company_owner" });
db.companies.createIndex({ verificationStatus: 1, name: 1 }, { name: "ix_company_verification" });
db.courses.createIndex({ slug: 1 }, { unique: true, name: "uq_course_slug" });
db.courses.createIndex({ status: 1, level: 1, createdAt: -1 }, { name: "ix_course_catalog" });
db.lessons.createIndex({ courseId: 1, status: 1, position: 1 }, { name: "ix_course_lessons" });
db.enrollments.createIndex({ studentId: 1, courseId: 1 }, { unique: true, name: "uq_student_course" });
db.enrollments.createIndex({ studentId: 1, status: 1, updatedAt: -1 }, { name: "ix_student_enrollments" });
db.assignments.createIndex({ courseId: 1, status: 1, dueAt: 1 }, { name: "ix_course_assignments" });
db.submissions.createIndex({ studentId: 1, assignmentId: 1, submittedAt: -1 }, { name: "ix_student_submissions" });
db.submissions.createIndex({ assignmentId: 1, status: 1, submittedAt: 1 }, { name: "ix_submission_review_queue" });
db.assessments.createIndex({ status: 1, createdAt: -1 }, { name: "ix_assessment_catalog" });
db.projects.createIndex({ studentId: 1, createdAt: -1 }, { name: "ix_student_projects" });
db.projects.createIndex({ visibility: 1, reviewStatus: 1, skills: 1 }, { name: "ix_project_discovery" });
db.skillEvidence.createIndex({ studentId: 1, skillName: 1, createdAt: -1 }, { name: "ix_student_skill_evidence" });
db.jobs.createIndex({ status: 1, jobType: 1, createdAt: -1 }, { name: "ix_job_search" });
db.jobs.createIndex({ companyId: 1, status: 1, createdAt: -1 }, { name: "ix_company_jobs" });
db.applications.createIndex({ studentId: 1, jobId: 1 }, { unique: true, name: "uq_student_job_application" });
db.applications.createIndex({ companyId: 1, status: 1, appliedAt: -1 }, { name: "ix_company_application_queue" });
db.interviews.createIndex({ applicationId: 1, startsAt: 1 }, { name: "ix_application_interviews" });
db.interviews.createIndex({ companyId: 1, startsAt: 1, status: 1 }, { name: "ix_company_interviews" });
db.certificates.createIndex({ certificateCode: 1 }, { unique: true, name: "uq_certificate_code" });
db.certificates.createIndex({ studentId: 1, issuedAt: -1 }, { name: "ix_student_certificates" });
db.entitlements.createIndex({ userId: 1, status: 1, expiresAt: 1 }, { name: "ix_user_entitlements" });
db.notifications.createIndex({ userId: 1, readAt: 1, createdAt: -1 }, { name: "ix_user_notifications" });
db.auditEvents.createIndex({ resourceType: 1, resourceId: 1, createdAt: -1 }, { name: "ix_resource_audit" });
db.auditEvents.createIndex({ actorUserId: 1, createdAt: -1 }, { name: "ix_actor_audit" });
db.assessmentAttempts.createIndex({ studentId: 1, assessmentId: 1, startedAt: -1 }, { name: "ix_student_assessment_attempts" });
db.payments.createIndex({ provider: 1, providerOrderId: 1 }, { unique: true, name: "uq_payment_provider_order" });

print("SkillBridge baseline validators and indexes are installed.");
