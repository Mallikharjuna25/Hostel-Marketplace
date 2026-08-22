import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Transaction, Message } from '@/lib/models'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'hostel-marketplace-secret'

function getUser(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value || req.cookies.get('hm_session')?.value
    if (!token) return null
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
  } catch { return null }
}

// GET /api/transactions/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    await connectDB()
    const { id } = await params

    const tx = await Transaction.findById(id)
      .populate('sellerId', 'profile trustScore email isVerified')
      .populate('buyerId', 'profile trustScore email isVerified')
      .populate('listingId', 'title mode priceInr condition images hostel block category')
      .lean()

    if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

    const txAny = tx as any
    const isParty = txAny.sellerId._id?.toString() === user.userId || txAny.buyerId._id?.toString() === user.userId
    if (!isParty && user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const messages = await Message.find({ transactionId: id })
      .populate('senderId', 'profile')
      .sort({ createdAt: 1 })
      .lean()

    const serialized = {
      id: txAny._id.toString(),
      status: txAny.status,
      agreedPriceInr: txAny.agreedPriceInr,
      price: txAny.agreedPriceInr,
      otpExpiry: txAny.otpExpiry,
      otpUsed: txAny.otpUsed,
      sellerId: txAny.sellerId._id?.toString(),
      buyerId: txAny.buyerId._id?.toString(),
      completedAt: txAny.completedAt,
      createdAt: txAny.createdAt,
      updatedAt: txAny.updatedAt,
      listing: txAny.listingId ? {
        id: txAny.listingId._id?.toString(),
        title: txAny.listingId.title,
        mode: txAny.listingId.mode,
        priceInr: txAny.listingId.priceInr,
        condition: txAny.listingId.condition,
        category: txAny.listingId.category,
      } : null,
      seller: {
        id: txAny.sellerId._id?.toString(),
        profile: txAny.sellerId.profile,
        trustScore: typeof txAny.sellerId.trustScore === 'number' ? txAny.sellerId.trustScore : 80,
      },
      buyer: {
        id: txAny.buyerId._id?.toString(),
        profile: txAny.buyerId.profile,
        trustScore: typeof txAny.buyerId.trustScore === 'number' ? txAny.buyerId.trustScore : 80,
      },
      messages: messages.map((m: any) => ({
        id: m._id.toString(),
        content: m.content,
        senderId: (m.senderId?._id || m.senderId)?.toString(),
        senderName: m.senderId?.profile?.fullName || 'Student',
        createdAt: m.createdAt,
      })),
    }

    return NextResponse.json({
      transaction: serialized,
      ...serialized,
    })
  } catch (err) {
    console.error('[transactions/[id] GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
