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

    await user.save()

    return NextResponse.json({
      draftId: user._id.toString(),
      userId: user._id.toString(),
      step: 3,
      message: 'Academic profile saved.',
    })
  } catch (err) {
    console.error('[register/step3]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
