import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { User } from '@/lib/models'
import { sendOtpEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const targetId = body.draftId || body.userId

    if (!targetId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const user = await User.findById(targetId)
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (body.skills && Array.isArray(body.skills)) {
      user.skills = body.skills.map((s: any) => typeof s === 'string' ? s : s.name).filter(Boolean)
    }

    // Generate real 6-digit OTP
    const realOtp = Math.floor(100000 + Math.random() * 900000).toString()
    user.verificationOtp = realOtp
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 mins expiry
    await user.save()

    // Send email via SMTP
    const emailResult = await sendOtpEmail({
      to: user.email,
      otp: realOtp,
      fullName: user.profile?.fullName,
    })

    return NextResponse.json({
      draftId: user._id.toString(),
      userId: user._id.toString(),
      step: 4,
      emailSent: emailResult.success,
      message: `A 6-digit verification code has been sent to ${user.email}. Please check your inbox.`,
    })
  } catch (err) {
    console.error('[register/step4]', err)
    return NextResponse.json({ error: 'Server error generating OTP' }, { status: 500 })
  }
}
