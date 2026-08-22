import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongoose'
import { User } from '@/lib/models'

const JWT_SECRET = process.env.JWT_SECRET || 'hostel-marketplace-secret'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const res = NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      profile: {
        fullName: user.profile.fullName,
        hostel: user.profile.hostel,
        block: user.profile.block,
        college: user.profile.college,
        photoUrl: user.profile.photoUrl,
      },
      trustScore: user.trustScore,
    })

    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    res.cookies.set('hm_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return res
  } catch (err) {
    console.error('[auth/login]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
