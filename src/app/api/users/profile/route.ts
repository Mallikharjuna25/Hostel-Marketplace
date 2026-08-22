import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { fullName, bio, photoUrl, publicFields, hostel, block, room } = body

    const updatedProfile = await prisma.studentProfile.update({
      where: { userId: session.userId },
      data: {
        ...(fullName ? { fullName } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(photoUrl !== undefined ? { photoUrl } : {}),
        ...(publicFields !== undefined ? { publicFields } : {}),
        ...(hostel ? { hostel } : {}),
        ...(block ? { block } : {}),
        ...(room ? { room } : {}),
      },
    })

    return NextResponse.json({ profile: updatedProfile })
  } catch (err) {
    console.error('[users/profile PUT]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
