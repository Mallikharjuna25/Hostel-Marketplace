import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Notification } from '@/lib/models'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'hostel-marketplace-secret'

function getUser(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value || req.cookies.get('hm_session')?.value
    if (!token) return null
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch { return null }
}

export async function GET(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    await connectDB()

    const notifications = await Notification.find({ userId: user.userId })
      .sort({ createdAt: -1 }).limit(20).lean()

    const unread = notifications.filter((n: any) => !n.read).length

    return NextResponse.json({
      notifications: notifications.map((n: any) => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        link: n.link,
        createdAt: n.createdAt,
      })),
      unread,
    })
  } catch (err) {
    console.error('[notifications GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    await connectDB()

    await Notification.updateMany({ userId: user.userId, read: false }, { $set: { read: true } })
    return NextResponse.json({ message: 'Marked all as read' })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  return PATCH(req)
}
