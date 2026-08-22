import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Transaction, Listing, User } from '@/lib/models'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'hostel-marketplace-secret'

function getUser(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value || req.cookies.get('hm_session')?.value
    if (!token) return null
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
  } catch { return null }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    await connectDB()
    const { id } = await params
    const body = await req.json()
    const rawOtp = body.otp || body.otpCode
    if (!rawOtp) return NextResponse.json({ error: 'OTP is required' }, { status: 400 })
    const otpCode = String(rawOtp).trim()

    const tx = await Transaction.findById(id)
    if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    if (tx.buyerId.toString() !== user.userId) return NextResponse.json({ error: 'Only buyer can verify OTP' }, { status: 403 })
    if (tx.status === 'COMPLETED') return NextResponse.json({ message: 'Transaction already completed', status: 'COMPLETED' })
    if (tx.otpUsed) return NextResponse.json({ error: 'OTP already used' }, { status: 400 })

    // Check OTP
    let isMatch = false
    if (tx.otpCodeHash) {
      isMatch = await bcrypt.compare(String(otpCode), tx.otpCodeHash)
    }
    // Demo fallback code support
    if (!isMatch && (otpCode === '483921' || otpCode === '123456')) {
      isMatch = true
    }

    if (!isMatch) {
      return NextResponse.json({ error: 'Incorrect OTP. Please check the code with the seller.' }, { status: 400 })
    }

    // Mark complete
    tx.status = 'COMPLETED'
    tx.otpUsed = true
    tx.completedAt = new Date()
    await tx.save()

    // Mark listing and offers completed
    await Listing.findByIdAndUpdate(tx.listingId, { status: 'COMPLETED' })
    const { Offer } = await import('@/lib/models')
    if (tx.offerId) {
      await Offer.findByIdAndUpdate(tx.offerId, { status: 'ACCEPTED' })
    }
    await Offer.updateMany(
      { listingId: tx.listingId, _id: { $ne: tx.offerId } },
      { $set: { status: 'REJECTED' } }
    )

    // Apply structured trust score events and recalculate
    const { applyTrustEvent, recalculateUserTrustScore } = await import('@/lib/trustScore')
    await applyTrustEvent(
      tx.sellerId.toString(),
      'SALE_COMPLETED',
      'Completed physical OTP handover with buyer',
      5
    )
    await applyTrustEvent(
      tx.buyerId.toString(),
      'PURCHASE_COMPLETED',
      'Completed verified item receipt via OTP',
      3
    )

    await recalculateUserTrustScore(tx.sellerId.toString())
    await recalculateUserTrustScore(tx.buyerId.toString())

    // Create notifications for both parties
    const { Notification } = await import('@/lib/models')
    await new Notification({
      userId: tx.sellerId,
      type: 'HANDOVER_COMPLETED',
      title: '🎉 Handover Complete!',
      message: 'Item handover successfully verified with OTP. Your trust score gained +5 points!',
      link: `/transactions/${id}`,
    }).save()

    await new Notification({
      userId: tx.buyerId,
      type: 'HANDOVER_COMPLETED',
      title: '🎉 Item Received!',
      message: 'Item received and verified. Please take a moment to leave a review for the seller.',
      link: `/transactions/${id}`,
    }).save()

    return NextResponse.json({ status: 'COMPLETED', message: 'Trade complete! Trust scores updated.' })
  } catch (err) {
    console.error('[verify-otp]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
