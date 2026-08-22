import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { User } from '@/lib/models'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'hostel-marketplace-secret'

function getUser(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) return null
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
  } catch { return null }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await connectDB()
    const { userId } = await params

    const user = await User.findById(userId).select('profile trustScore trustHistory isVerified skills email createdAt').lean()
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const u = user as any
    return NextResponse.json({
      userId: u._id.toString(),
      trustScore: u.trustScore,
      isVerified: u.isVerified,
      profile: { fullName: u.profile?.fullName, hostel: u.profile?.hostel, block: u.profile?.block, college: u.profile?.college, department: u.profile?.department, year: u.profile?.year, photoUrl: u.profile?.photoUrl },
      skills: u.skills,
      trustHistory: (u.trustHistory || []).slice(-20).map((h: any) => ({
        event: h.event, delta: h.delta, reason: h.reason, createdAt: h.createdAt,
      })),
      memberSince: u.createdAt,
    })
  } catch (err) {
    console.error('[trust]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
