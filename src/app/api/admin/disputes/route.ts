import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Report, User, Transaction, Listing } from '@/lib/models'
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
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await connectDB()

    const reports = await Report.find({})
      .populate('reporterId', 'profile email')
      .sort({ createdAt: -1 })
      .lean()

    const formatted = await Promise.all(
      reports.map(async (r: any) => {
        let targetDetail = null
        if (r.targetType === 'TRANSACTION') {
          targetDetail = await Transaction.findById(r.targetId).populate('sellerId buyerId', 'profile').lean()
        } else if (r.targetType === 'LISTING') {
          targetDetail = await Listing.findById(r.targetId).lean()
        }

        return {
          id: r._id.toString(),
          reason: r.reason,
          description: r.description,
          status: r.status,
          targetType: r.targetType,
          targetId: r.targetId?.toString(),
          targetDetail,
          reporter: {
            id: r.reporterId?._id?.toString(),
            name: r.reporterId?.profile?.fullName || 'Student',
            email: r.reporterId?.email,
          },
          createdAt: r.createdAt,
        }
      })
    )

    return NextResponse.json({ disputes: formatted })
  } catch (err: any) {
    console.error('[GET /api/admin/disputes]', err)
    return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 })
  }
}
