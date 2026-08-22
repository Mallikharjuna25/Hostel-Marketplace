import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Review, Transaction, Notification } from '@/lib/models'
import { applyTrustEvent, recalculateUserTrustScore } from '@/lib/trustScore'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'hostel-marketplace-secret'

function getUser(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value || req.cookies.get('hm_session')?.value
    if (!token) return null
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch { return null }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    await connectDB()

    const { transactionId, rating, comment } = await req.json()
    if (!transactionId || !rating) return NextResponse.json({ error: 'transactionId and rating required' }, { status: 400 })
    if (rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 })

    const tx = await Transaction.findById(transactionId)
    if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    if (tx.status !== 'COMPLETED') return NextResponse.json({ error: 'Can only review completed transactions' }, { status: 400 })

    const isParty = tx.sellerId.toString() === user.userId || tx.buyerId.toString() === user.userId
    if (!isParty) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const revieweeId = tx.sellerId.toString() === user.userId ? tx.buyerId.toString() : tx.sellerId.toString()

    const existing = await Review.findOne({ transactionId, reviewerId: user.userId })
    if (existing) return NextResponse.json({ error: 'You have already reviewed this transaction' }, { status: 400 })

    const review = new Review({ transactionId, reviewerId: user.userId, revieweeId, rating, comment })
    await review.save()

    // Dynamically adjust trust score for reviewee
    if (rating >= 4) {
      await applyTrustEvent(
        revieweeId,
        'POSITIVE_REVIEW',
        `Received ${rating}-star rating: "${comment || 'Positive review'}"`,
        rating === 5 ? 5 : 3
      )
    } else if (rating <= 2) {
      await applyTrustEvent(
        revieweeId,
        'NEGATIVE_REVIEW',
        `Received ${rating}-star rating: "${comment || 'Critical feedback'}"`,
        rating === 1 ? -10 : -5
      )
    } else {
      await applyTrustEvent(revieweeId, 'REVIEW_RECEIVED', `Received 3-star rating`)
    }

    await recalculateUserTrustScore(revieweeId)

    // Notify the reviewee
    await new Notification({
      userId: revieweeId,
      type: 'REVIEW_RECEIVED',
      title: `⭐ You received a ${rating}-star review!`,
      message: comment ? `"${comment.slice(0, 80)}"` : 'Your trust score has been updated.',
      link: `/profile/${revieweeId}`,
    }).save()

    return NextResponse.json({ id: review._id.toString(), rating, message: 'Review submitted and trust score updated!' }, { status: 201 })
  } catch (err) {
    console.error('[reviews POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
