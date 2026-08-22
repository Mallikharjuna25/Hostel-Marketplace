import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongoose'
import { User } from '@/lib/models'

const JWT_SECRET = process.env.JWT_SECRET || 'hostel-marketplace-secret'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { draftId, userId, otp } = await req.json()
    const targetId = draftId || userId

    if (!targetId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const user = await User.findById(targetId)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (!otp || String(otp).trim().length !== 6) {
      return NextResponse.json({ error: 'Please enter the complete 6-digit OTP.' }, { status: 400 })
    }

    const cleanOtp = String(otp).trim()

    // Check OTP validity
    if (!user.verificationOtp) {
      return NextResponse.json({ error: 'No active OTP found. Please request a new verification code.' }, { status: 400 })
    }

    if (user.otpExpiry && new Date() > new Date(user.otpExpiry)) {
      return NextResponse.json({ error: 'The verification code has expired. Please request a new code.' }, { status: 400 })
    }

    if (user.verificationOtp !== cleanOtp) {
      return NextResponse.json({ error: 'Incorrect OTP code. Please check your email and enter the 6-digit code received.' }, { status: 400 })
    }

    // OTP is valid — mark user verified and clear OTP
    user.isVerified = true
    user.verificationOtp = undefined
    user.otpExpiry = undefined
    user.trustScore = 65 // Initial verified student trust score
    await user.save()

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const res = NextResponse.json({
      success: true,
      userId: user._id.toString(),
      message: 'Email verified! Welcome to Hostel Marketplace.',
      user: {
        id: user._id.toString(),
        email: user.email,
        profile: user.profile,
        trustScore: user.trustScore,
      },
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
    console.error('[register/verify]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
