import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongoose'
import { User } from '@/lib/models'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { email, password, confirmPassword, phone } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const emailLower = email.toLowerCase().trim()
    if (!emailLower.includes('@') || !emailLower.includes('.')) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })
    }

    const existing = await User.findOne({ email: emailLower })
    if (existing) {
      if (existing.isVerified) {
        return NextResponse.json({ error: 'An account with this email already exists. Please log in.' }, { status: 409 })
      }
      // If previous registration was unfinished/unverified, update password and allow resuming
      existing.passwordHash = await bcrypt.hash(password, 10)
      if (!existing.profile) {
        existing.profile = {
          fullName: emailLower.split('@')[0],
          hostel: 'Hostel 1',
          block: 'Block A',
          college: 'Campus University',
          department: 'General',
          year: 1,
          phone: phone || '',
        }
      } else if (phone) {
        existing.profile.phone = phone
      }
      await existing.save()
      return NextResponse.json({
        draftId: existing._id.toString(),
        userId: existing._id.toString(),
        step: 1,
        message: 'Account updated. Proceed to step 2.',
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = new User({
      email: emailLower,
      passwordHash,
      role: 'STUDENT',
      isVerified: false,
      profile: {
        fullName: emailLower.split('@')[0],
        hostel: 'Hostel 1',
        block: 'Block A',
        college: 'Campus University',
        department: 'General',
        year: 1,
        phone: phone || '',
      },
      trustScore: 50,
      trustHistory: [{ event: 'REGISTRATION', delta: 50, reason: 'Account created', createdAt: new Date() }],
      skills: [],
    })
    await user.save()

    return NextResponse.json({
      draftId: user._id.toString(),
      userId: user._id.toString(),
      step: 1,
      message: 'Account created. Proceed to step 2.',
    }, { status: 201 })
  } catch (err: any) {
    console.error('[register/step1]', err)
    return NextResponse.json({ error: err?.message || 'Server error creating account' }, { status: 500 })
  }
}
