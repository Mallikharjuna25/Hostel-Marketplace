import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { User, Listing, Transaction, Report, Notification } from '@/lib/models'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'hostel-marketplace-secret'

function getUser(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) return null
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
  } catch { return null }
}

function adminOnly(user: { role: string } | null) {
  return !user || user.role !== 'ADMIN'
}

export async function GET(req: NextRequest) {
  try {
    const user = getUser(req)
    if (adminOnly(user)) return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    await connectDB()

    const [totalUsers, verifiedUsers, totalListings, publishedListings, completedTx, pendingReports] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isVerified: true }),
      Listing.countDocuments({}),
      Listing.countDocuments({ status: 'PUBLISHED' }),
      Transaction.countDocuments({ status: 'COMPLETED' }),
      Report.countDocuments({ status: 'PENDING' }),
    ])

    const recentListings = await Listing.find({ status: 'PUBLISHED' })
      .sort({ createdAt: -1 }).limit(10)
      .populate('sellerId', 'profile trustScore')
      .lean()

    const recentUsers = await User.find({})
      .sort({ createdAt: -1 }).limit(10)
      .select('email profile trustScore isVerified role createdAt')
      .lean()

    return NextResponse.json({
      stats: { totalUsers, verifiedUsers, totalListings, publishedListings, completedTx, pendingReports },
      recentListings: recentListings.map((l: any) => ({
        id: l._id.toString(), title: l.title, mode: l.mode, status: l.status,
        priceInr: l.priceInr, aiVerified: l.aiVerified, createdAt: l.createdAt,
        seller: l.sellerId ? { fullName: l.sellerId.profile?.fullName, trustScore: l.sellerId.trustScore } : null,
      })),
      recentUsers: recentUsers.map((u: any) => ({
        id: u._id.toString(), email: u.email, role: u.role,
        fullName: u.profile?.fullName, trustScore: u.trustScore,
        isVerified: u.isVerified, createdAt: u.createdAt,
      })),
    })
  } catch (err) {
    console.error('[admin/metrics]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
