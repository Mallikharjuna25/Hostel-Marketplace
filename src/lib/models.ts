import mongoose, { Schema, Document, Model, Types } from 'mongoose'

// ─── User ──────────────────────────────────────────────────
export interface IUser extends Document {
  _id: Types.ObjectId
  email: string
  passwordHash: string
  role: 'STUDENT' | 'ADMIN'
  isVerified: boolean
  profile: {
    fullName: string
    hostel: string
    block: string
    phone?: string
    photoUrl?: string
    college: string
    department: string
    year: number
    rollNumber?: string
  }
  trustScore: number
  trustHistory: Array<{
    event: string
    delta: number
    reason: string
    createdAt: Date
  }>
  skills: string[]
  verificationOtp?: string
  otpExpiry?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['STUDENT', 'ADMIN'], default: 'STUDENT' },
  isVerified: { type: Boolean, default: false },
  profile: {
    fullName: { type: String, required: true },
    hostel: { type: String, default: '' },
    block: { type: String, default: '' },
    phone: String,
    photoUrl: String,
    college: { type: String, default: '' },
    department: { type: String, default: '' },
    year: { type: Number, default: 1 },
    rollNumber: String,
  },
  trustScore: { type: Number, default: 50, min: 0, max: 100 },
  trustHistory: [{
    event: String,
    delta: Number,
    reason: String,
    createdAt: { type: Date, default: Date.now },
  }],
  skills: [String],
  verificationOtp: String,
  otpExpiry: Date,
}, { timestamps: true })

// ─── Listing ───────────────────────────────────────────────
export interface IListing extends Document {
  _id: Types.ObjectId
  sellerId: Types.ObjectId
  title: string
  description: string
  mode: 'SELL' | 'LEND' | 'BORROW' | 'EXCHANGE' | 'DONATE' | 'KNOWLEDGE'
  condition: string
  conditionScore: number
  priceInr?: number
  depositInr?: number
  status: 'DRAFT' | 'PUBLISHED' | 'IN_TRANSACTION' | 'COMPLETED' | 'REMOVED'
  images: Array<{ url: string; isPrimary: boolean }>
  billUrl?: string
  category: string
  tags: string[]
  hostel: string
  block: string
  aiVerified: boolean
  listingQualityScore: number
  aiAnalysis?: {
    detectedProduct?: string
    confidence?: number
    conditionLabel?: string
    conditionScore?: number
    detectedIssues?: string[]
    qualityScore?: number
    provider?: string
    status?: string
  }
  pricePrediction?: {
    minPrice: number
    maxPrice: number
    fairPrice: number
    confidence: number
    reasoning: string
  }
  createdAt: Date
  updatedAt: Date
}

const ListingSchema = new Schema<IListing>({
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  mode: { type: String, enum: ['SELL', 'LEND', 'BORROW', 'EXCHANGE', 'DONATE', 'KNOWLEDGE'], required: true },
  condition: { type: String, default: 'GOOD' },
  conditionScore: { type: Number, default: 75 },
  priceInr: Number,
  depositInr: Number,
  status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'IN_TRANSACTION', 'COMPLETED', 'REMOVED'], default: 'DRAFT' },
  images: [{ url: String, isPrimary: { type: Boolean, default: false } }],
  billUrl: String,
  category: { type: String, default: 'OTHER' },
  tags: [String],
  hostel: { type: String, default: '' },
  block: { type: String, default: '' },
  aiVerified: { type: Boolean, default: false },
  listingQualityScore: { type: Number, default: 0 },
  aiAnalysis: {
    detectedProduct: String,
    confidence: Number,
    conditionLabel: String,
    conditionScore: Number,
    detectedIssues: [String],
    qualityScore: Number,
    provider: String,
    status: String,
  },
  pricePrediction: {
    minPrice: Number,
    maxPrice: Number,
    fairPrice: Number,
    confidence: Number,
    reasoning: String,
  },
}, { timestamps: true })

// ─── Offer ─────────────────────────────────────────────────
export interface IOffer extends Document {
  _id: Types.ObjectId
  listingId: Types.ObjectId
  buyerId: Types.ObjectId
  offerPriceInr?: number
  note?: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
  createdAt: Date
}

const OfferSchema = new Schema<IOffer>({
  listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  offerPriceInr: Number,
  note: String,
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'], default: 'PENDING' },
}, { timestamps: true })

// ─── Transaction ───────────────────────────────────────────
export interface ITransaction extends Document {
  _id: Types.ObjectId
  listingId: Types.ObjectId
  offerId?: Types.ObjectId
  sellerId: Types.ObjectId
  buyerId: Types.ObjectId
  agreedPriceInr?: number
  status: 'OFFER_ACCEPTED' | 'HANDOVER_PENDING' | 'OTP_GENERATED' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED'
  otpCodeHash?: string
  otpExpiry?: Date
  otpUsed: boolean
  otpGenerationCount: number
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema = new Schema<ITransaction>({
  listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  offerId: { type: Schema.Types.ObjectId, ref: 'Offer' },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  agreedPriceInr: Number,
  status: {
    type: String,
    enum: ['OFFER_ACCEPTED', 'HANDOVER_PENDING', 'OTP_GENERATED', 'COMPLETED', 'DISPUTED', 'CANCELLED'],
    default: 'OFFER_ACCEPTED',
  },
  otpCodeHash: String,
  otpExpiry: Date,
  otpUsed: { type: Boolean, default: false },
  otpGenerationCount: { type: Number, default: 0 },
  completedAt: Date,
}, { timestamps: true })

// ─── Message ───────────────────────────────────────────────
export interface IMessage extends Document {
  _id: Types.ObjectId
  transactionId: Types.ObjectId
  senderId: Types.ObjectId
  content: string
  createdAt: Date
}

const MessageSchema = new Schema<IMessage>({
  transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
}, { timestamps: true })

// ─── DonationApplication ───────────────────────────────────
export interface IDonationApplication extends Document {
  _id: Types.ObjectId
  listingId: Types.ObjectId
  applicantId: Types.ObjectId
  needStatement: string
  academicYear: number
  cgpa?: number
  aiMatchScore?: number
  aiMatchReason?: string
  status: 'PENDING' | 'SELECTED' | 'REJECTED'
  createdAt: Date
}

const DonationApplicationSchema = new Schema<IDonationApplication>({
  listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  applicantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  needStatement: { type: String, required: true },
  academicYear: { type: Number, required: true },
  cgpa: Number,
  aiMatchScore: Number,
  aiMatchReason: String,
  status: { type: String, enum: ['PENDING', 'SELECTED', 'REJECTED'], default: 'PENDING' },
}, { timestamps: true })

// ─── KnowledgeAgreement ────────────────────────────────────
export interface IKnowledgeAgreement extends Document {
  _id: Types.ObjectId
  proposerId: Types.ObjectId
  receiverId: Types.ObjectId
  listingId?: Types.ObjectId
  skillOffered: string
  exchangeFor: string
  terms: string
  sessionsTotal: number
  hoursPerSession: number
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'PROOF_SUBMITTED' | 'COMPLETED' | 'DISPUTED'
  createdAt: Date
}

const KnowledgeAgreementSchema = new Schema<IKnowledgeAgreement>({
  proposerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: Schema.Types.ObjectId, ref: 'Listing' },
  skillOffered: { type: String, required: true },
  exchangeFor: { type: String, required: true },
  terms: { type: String, required: true },
  sessionsTotal: { type: Number, default: 1 },
  hoursPerSession: { type: Number, default: 1 },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'ACTIVE', 'PROOF_SUBMITTED', 'COMPLETED', 'DISPUTED'], default: 'PENDING' },
}, { timestamps: true })

// ─── ProofSubmission ───────────────────────────────────────
export interface IProofSubmission extends Document {
  _id: Types.ObjectId
  agreementId: Types.ObjectId
  submitterId: Types.ObjectId
  content: string
  evidenceUrls: string[]
  aiCoverageScore?: number
  aiCoverageReason?: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: Date
}

const ProofSubmissionSchema = new Schema<IProofSubmission>({
  agreementId: { type: Schema.Types.ObjectId, ref: 'KnowledgeAgreement', required: true },
  submitterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  evidenceUrls: [String],
  aiCoverageScore: Number,
  aiCoverageReason: String,
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
}, { timestamps: true })

// ─── Review ────────────────────────────────────────────────
export interface IReview extends Document {
  _id: Types.ObjectId
  transactionId: Types.ObjectId
  reviewerId: Types.ObjectId
  revieweeId: Types.ObjectId
  rating: number
  comment?: string
  createdAt: Date
}

const ReviewSchema = new Schema<IReview>({
  transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },
  reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  revieweeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
}, { timestamps: true })

// ─── Report ────────────────────────────────────────────────
export interface IReport extends Document {
  _id: Types.ObjectId
  reporterId: Types.ObjectId
  targetId: Types.ObjectId
  targetType: 'LISTING' | 'USER' | 'TRANSACTION'
  reason: string
  description?: string
  status: 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED'
  adminNote?: string
  createdAt: Date
}

const ReportSchema = new Schema<IReport>({
  reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  targetId: { type: Schema.Types.ObjectId, required: true },
  targetType: { type: String, enum: ['LISTING', 'USER', 'TRANSACTION'], required: true },
  reason: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'], default: 'PENDING' },
  adminNote: String,
}, { timestamps: true })

// ─── Notification ──────────────────────────────────────────
export interface INotification extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  type: string
  title: string
  message: string
  read: boolean
  link?: string
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: String,
}, { timestamps: true })

// ─── Model Exports ─────────────────────────────────────────
function getModel<T extends Document>(name: string, schema: Schema): Model<T> {
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema)
}

export const User = getModel<IUser>('User', UserSchema)
export const Listing = getModel<IListing>('Listing', ListingSchema)
export const Offer = getModel<IOffer>('Offer', OfferSchema)
export const Transaction = getModel<ITransaction>('Transaction', TransactionSchema)
export const Message = getModel<IMessage>('Message', MessageSchema)
export const DonationApplication = getModel<IDonationApplication>('DonationApplication', DonationApplicationSchema)
export const KnowledgeAgreement = getModel<IKnowledgeAgreement>('KnowledgeAgreement', KnowledgeAgreementSchema)
export const ProofSubmission = getModel<IProofSubmission>('ProofSubmission', ProofSubmissionSchema)
export const Review = getModel<IReview>('Review', ReviewSchema)
export const Report = getModel<IReport>('Report', ReportSchema)
export const Notification = getModel<INotification>('Notification', NotificationSchema)
