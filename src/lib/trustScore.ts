import connectDB from './mongoose'
import { User, Transaction, Review, Listing } from './models'

export type TrustEvent =
  | 'REGISTRATION'
  | 'ID_VERIFIED'
  | 'ACADEMIC_DOMAIN'
  | 'SALE_COMPLETED'
  | 'PURCHASE_COMPLETED'
  | 'REVIEW_RECEIVED'
  | 'POSITIVE_REVIEW'
  | 'NEGATIVE_REVIEW'
  | 'TIMELY_RETURN'
  | 'BILL_VERIFIED'
  | 'DISPUTE_WON'
  | 'DONATION_GIVEN'
  | 'KNOWLEDGE_SHARED'
  | 'REPORT_RESOLVED_POSITIVE'
  | 'DISPUTE_LOST'
  | 'LATE_RETURN'
  | 'ITEM_MISREPRESENTED'
  | 'ABUSIVE_BEHAVIOR'
  | 'NO_SHOW'
  | 'PROOF_REJECTED'
  | 'ADMIN_ADJUSTMENT'

const EVENT_DELTAS: Record<TrustEvent, number> = {
  REGISTRATION: 50,
  ID_VERIFIED: 15,
  ACADEMIC_DOMAIN: 10,
  SALE_COMPLETED: 5,
  PURCHASE_COMPLETED: 3,
  REVIEW_RECEIVED: 2,
  POSITIVE_REVIEW: 5,
  NEGATIVE_REVIEW: -10,
  TIMELY_RETURN: 4,
  BILL_VERIFIED: 4,
  DISPUTE_WON: 3,
  DONATION_GIVEN: 6,
  KNOWLEDGE_SHARED: 5,
  REPORT_RESOLVED_POSITIVE: 2,
  DISPUTE_LOST: -15,
  LATE_RETURN: -8,
  ITEM_MISREPRESENTED: -20,
  ABUSIVE_BEHAVIOR: -30,
  NO_SHOW: -10,
  PROOF_REJECTED: -5,
  ADMIN_ADJUSTMENT: 0,
}

export function calculateNewScore(currentScore: number, delta: number): number {
  return Math.min(100, Math.max(0, currentScore + delta))
}

/**
 * Applies a single trust event and updates the user's trust history.
 */
export async function applyTrustEvent(
  userId: string,
  event: TrustEvent,
  reason: string,
  customDelta?: number
): Promise<{ previousScore: number; newScore: number; delta: number }> {
  await connectDB()
  const delta = customDelta !== undefined ? customDelta : (EVENT_DELTAS[event] ?? 0)

  const user = await User.findById(userId)
  if (!user) {
    throw new Error(`User ${userId} not found`)
  }

  const previousScore = typeof user.trustScore === 'number' ? user.trustScore : 50
  const newScore = calculateNewScore(previousScore, delta)

  user.trustScore = newScore
  if (!user.trustHistory) user.trustHistory = []
  user.trustHistory.push({
    event,
    delta,
    reason,
    createdAt: new Date(),
  })
  await user.save()
  return { previousScore, newScore, delta }
}

/**
 * Universal trust score update helper compatible with all admin and transaction endpoints.
 */
export async function updateTrustScore(
  userId: string,
  eventOrType: string,
  customDeltaOrReason?: number | string,
  customReason?: string
): Promise<{ previousScore: number; newScore: number; delta: number }> {
  let delta: number | undefined
  let reason = 'Trust score update'

  if (typeof customDeltaOrReason === 'number') {
    delta = customDeltaOrReason
    reason = customReason || reason
  } else if (typeof customDeltaOrReason === 'string') {
    reason = customDeltaOrReason
  }

  let event: TrustEvent = 'ADMIN_ADJUSTMENT'
  if (eventOrType === 'COMPLETED_TRANSACTION' || eventOrType === 'SALE_COMPLETED') {
    event = 'SALE_COMPLETED'
  } else if (eventOrType === 'PURCHASE_COMPLETED') {
    event = 'PURCHASE_COMPLETED'
  } else if (eventOrType === 'DISPUTE_WON') {
    event = 'DISPUTE_WON'
  } else if (eventOrType === 'DISPUTE_LOST') {
    event = 'DISPUTE_LOST'
  } else if (eventOrType in EVENT_DELTAS) {
    event = eventOrType as TrustEvent
  }

  return applyTrustEvent(userId, event, reason, delta)
}

/**
 * Recalculates user trust score based on overall performance across completed deals, reviews, and verifications.
 */
export async function recalculateUserTrustScore(userId: string): Promise<number> {
  await connectDB()
  const user = await User.findById(userId)
  if (!user) return 50

  // 1. Base Score
  let score = 50

  // 2. ID / Student Verification
  if (user.isVerified || user.profile?.rollNumber) {
    score += 15
  }

  // 3. Completed Transactions (Sales & Purchases)
  const completedCount = await Transaction.countDocuments({
    $or: [{ sellerId: userId }, { buyerId: userId }],
    status: 'COMPLETED',
  })
  score += Math.min(25, completedCount * 4)

  // 4. Reviews & Ratings
  const reviews = await Review.find({ revieweeId: userId }).lean()
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    if (avgRating >= 4.5) score += 12
    else if (avgRating >= 4.0) score += 8
    else if (avgRating >= 3.0) score += 2
    else score -= 10
  }

  // 5. Active Verified Listings with Bill
  const verifiedListingsCount = await Listing.countDocuments({
    sellerId: userId,
    billUrl: { $exists: true, $ne: null },
  })
  score += Math.min(8, verifiedListingsCount * 2)

  const finalScore = Math.min(100, Math.max(10, score))
  user.trustScore = finalScore
  await user.save()

  return finalScore
}
