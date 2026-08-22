import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { User } from '@/lib/models'

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

    if (body.fullName) user.profile.fullName = body.fullName.trim()
    if (body.college) user.profile.college = body.college.trim()
    if (body.department) user.profile.department = body.department.trim()
    if (body.year) user.profile.year = parseInt(body.year) || 1
    if (body.hostel) user.profile.hostel = body.hostel.trim()
    if (body.block) user.profile.block = body.block.trim()
    if (body.studentId || body.rollNumber) user.profile.rollNumber = (body.studentId || body.rollNumber).trim()

    await user.save()

    return NextResponse.json({
      draftId: user._id.toString(),
      userId: user._id.toString(),
      step: 2,
      message: 'Profile updated.',
    })
  } catch (err) {
    console.error('[register/step2]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
