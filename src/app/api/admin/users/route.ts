import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { User, Listing, Transaction } from '@/lib/models'
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
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await connectDB()
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')?.toLowerCase() || ''

    const allUsers = await User.find({})
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean()

    const enriched = await Promise.all(
      allUsers.map(async (u: any) => {
        const [listingsCount, buyTxs, sellTxs] = await Promise.all([
          Listing.countDocuments({ sellerId: u._id }),
          Transaction.countDocuments({ buyerId: u._id }),
          Transaction.countDocuments({ sellerId: u._id }),
        ])

        return {
          id: u._id.toString(),
          email: u.email,
          role: u.role,
          isVerified: u.isVerified || false,
          trustScore: typeof u.trustScore === 'number' ? u.trustScore : 80,
          fullName: u.profile?.fullName || 'Student',
          hostel: u.profile?.hostel || 'Hostel',
          block: u.profile?.block || 'Block',
          room: u.profile?.room || '',
          college: u.profile?.college || 'Campus University',
          rollNumber: u.profile?.rollNumber || 'N/A',
          phone: u.profile?.phone || 'N/A',
          academicYear: u.profile?.academicYear || 1,
          branch: u.profile?.branch || 'General',
          totalListings: listingsCount,
          totalTransactions: buyTxs + sellTxs,
          createdAt: u.createdAt,
        }
      })
    )

    const filtered = query
      ? enriched.filter(
          (u) =>
            u.fullName.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            u.rollNumber.toLowerCase().includes(query) ||
            u.hostel.toLowerCase().includes(query)
        )
      : enriched

    return NextResponse.json({
      users: filtered,
      totalUsers: enriched.length,
      verifiedCount: enriched.filter((u) => u.isVerified).length,
      averageTrustScore: Math.round(
        enriched.reduce((acc, u) => acc + u.trustScore, 0) / (enriched.length || 1)
      ),
    })
  } catch (err) {
    console.error('[admin/users GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await connectDB()
    const { userId, isVerified, trustScore } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })

    const targetUser = await User.findById(userId)
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (typeof isVerified === 'boolean') {
      targetUser.isVerified = isVerified
    }
    if (typeof trustScore === 'number') {
      targetUser.trustScore = Math.min(100, Math.max(0, trustScore))
    }

    await targetUser.save()

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        id: targetUser._id.toString(),
        isVerified: targetUser.isVerified,
        trustScore: targetUser.trustScore,
      },
    })
  } catch (err) {
    console.error('[admin/users PATCH]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
