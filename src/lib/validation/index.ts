import { z } from 'zod'

// ─── Auth ────────────────────────────────────────────────────────────────────

export const registerStep1Schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const registerStep2Schema = z.object({
  draftId: z.string(),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  college: z.string().min(2, 'College name required'),
  studentId: z.string().min(2, 'Student ID required'),
  department: z.string().min(2, 'Department required'),
  course: z.string().min(2, 'Course required'),
  year: z.coerce.number().int().min(1).max(6),
  semester: z.coerce.number().int().min(1).max(12),
  hostel: z.string().min(1, 'Hostel required'),
  block: z.string().min(1, 'Block required'),
  room: z.string().min(1, 'Room number required'),
})

export const registerStep3Schema = z.object({
  draftId: z.string(),
  cgpa: z.coerce.number().min(0).max(10).optional(),
  currentSemester: z.coerce.number().int().min(1).max(12),
  subjects: z.array(z.string()).min(1, 'Add at least one subject'),
  achievements: z.array(z.string()).optional().default([]),
})

export const registerStep4Schema = z.object({
  draftId: z.string(),
  skills: z.array(z.object({
    type: z.enum(['SKILL', 'INTEREST', 'CLUB', 'SPORT', 'TECH', 'LANGUAGE', 'CERTIFICATION', 'VOLUNTEERING']),
    name: z.string().min(1),
  })).optional().default([]),
})

export const registerVerifySchema = z.object({
  draftId: z.string(),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password required'),
  rememberMe: z.boolean().optional().default(false),
})

// ─── Listings ────────────────────────────────────────────────────────────────

export const createListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  category: z.string().min(1, 'Category required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'NEEDS_REVIEW']).optional(),
  price: z.coerce.number().int().min(0).optional(),
  transactionType: z.enum(['SELL', 'LEND', 'EXCHANGE', 'DONATE', 'BORROW_REQUEST']),
  location: z.string().min(1, 'Location required'),
  brand: z.string().optional(),
  model: z.string().optional(),
  originalPrice: z.coerce.number().int().min(0).optional(),
  accessories: z.string().optional(),
  usageDuration: z.string().optional(),
  reasonForGiving: z.string().optional(),
  availability: z.object({
    durationDays: z.number().int().min(1).optional(),
    returnDate: z.string().optional(),
    depositAmount: z.number().int().min(0).optional(),
  }).optional(),
})

// ─── Offers ──────────────────────────────────────────────────────────────────

export const createOfferSchema = z.object({
  listingId: z.string(),
  proposalType: z.enum(['MONEY', 'EXCHANGE_ITEM', 'KNOWLEDGE']),
  amount: z.coerce.number().int().min(1).optional(),
  message: z.string().max(500).optional(),
})

export const updateOfferSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'COUNTERED']),
  counterAmount: z.coerce.number().int().min(1).optional(),
})

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const createReviewSchema = z.object({
  transactionId: z.string(),
  subjectId: z.string(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

// ─── Reports ─────────────────────────────────────────────────────────────────

export const createReportSchema = z.object({
  transactionId: z.string().optional(),
  category: z.enum([
    'FAKE_LISTING',
    'WRONG_PRODUCT_CONDITION',
    'FRAUD',
    'NON_DELIVERY',
    'DAMAGE',
    'FAILURE_TO_RETURN',
    'MISLEADING_INFO',
    'HARASSMENT',
    'INCOMPLETE_KNOWLEDGE_AGREEMENT',
    'OTHER',
  ]),
  description: z.string().min(20, 'Please provide more detail (min 20 characters)').max(2000),
})

// ─── Knowledge Agreement ──────────────────────────────────────────────────────

export const createKnowledgeAgreementSchema = z.object({
  transactionId: z.string(),
  itemDescription: z.string().min(10),
  knowledgeDescription: z.string().min(10),
  sessionsCount: z.coerce.number().int().min(1).optional(),
  sessionMinutes: z.coerce.number().int().min(15).optional(),
  expectedWork: z.string().min(10),
  completionCriteria: z.string().min(10),
  deadline: z.string().refine(d => !isNaN(Date.parse(d)), 'Invalid date'),
  evidenceRequirements: z.string().min(5),
})

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminTrustAdjustSchema = z.object({
  delta: z.coerce.number().int().min(-50).max(50),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
})

export const adminModerateListingSchema = z.object({
  action: z.enum(['APPROVE', 'SUSPEND', 'REMOVE', 'FLAG']),
  reason: z.string().min(5).optional(),
})

export const adminResolveDisputeSchema = z.object({
  decision: z.string().min(10, 'Decision must be at least 10 characters'),
  outcome: z.enum(['RESOLVED', 'REJECTED']),
  trustAdjustments: z.array(z.object({
    userId: z.string(),
    delta: z.number().int(),
    reason: z.string(),
  })).optional().default([]),
})
