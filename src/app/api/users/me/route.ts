import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongoose'
import { User } from '@/lib/models'

const JWT_SECRET = process.env.JWT_SECRET || 'hostel-marketplace-secret'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value || req.cookies.get('hm_session')?.value
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    await connectDB()

    const user = await User.findById(payload.userId).lean()
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({
      id: (user._id as any).toString(),
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      profile: {
        fullName: user.profile.fullName,
        hostel: user.profile.hostel,
        block: user.profile.block,
        college: user.profile.college,
        department: user.profile.department,
        year: user.profile.year,
        photoUrl: user.profile.photoUrl,
      },
      trustScore: typeof user.trustScore === 'number' ? user.trustScore : 50,
      skills: (user as any).skills || [],
    })
  } catch {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
}
