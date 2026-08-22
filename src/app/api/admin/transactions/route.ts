import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Transaction, User, Listing } from '@/lib/models'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'hostel-marketplace-secret'

function getUser(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value || req.cookies.get('hm_session')?.value
    if (!token) return null
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
  } catch { return null }
}

export async function GET(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const transactions = await Transaction.find({})
      .populate('sellerId', 'profile email trustScore')
      .populate('buyerId', 'profile email trustScore')
      .populate('listingId', 'title priceInr mode category hostel block images')
      .sort({ createdAt: -1 })
      .lean()

    const totalVolume = transactions.reduce((acc, t: any) => acc + (t.agreedPriceInr || t.price || 0), 0)
    const activeExchanges = transactions.filter((t: any) => ['ACCEPTED', 'HANDOVER_PENDING', 'OTP_GENERATED'].includes(t.status)).length

    const formatted = transactions.map((t: any) => ({
      id: t._id.toString(),
      item: t.listingId?.title || 'Campus Item',
      listingId: t.listingId?._id?.toString(),
      mode: t.listingId?.mode || 'SELL',
      price: t.agreedPriceInr || t.price || 0,
      status: t.status || 'HANDOVER_PENDING',
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      seller: {
        id: t.sellerId?._id?.toString(),
        name: t.sellerId?.profile?.fullName || 'Seller',
        initials: (t.sellerId?.profile?.fullName || 'S').slice(0, 1).toUpperCase(),
        hostel: t.sellerId?.profile?.hostel || 'Hostel',
        trustScore: t.sellerId?.trustScore || 80,
      },
      buyer: {
        id: t.buyerId?._id?.toString(),
        name: t.buyerId?.profile?.fullName || 'Buyer',
        initials: (t.buyerId?.profile?.fullName || 'B').slice(0, 1).toUpperCase(),
        hostel: t.buyerId?.profile?.hostel || 'Hostel',
        trustScore: t.buyerId?.trustScore || 80,
      },
    }))

    return NextResponse.json({
      transactions: formatted,
      totalVolume,
      activeExchanges,
    })
  } catch (err) {
    console.error('[admin/transactions GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
