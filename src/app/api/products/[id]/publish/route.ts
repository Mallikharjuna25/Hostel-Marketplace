import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Listing } from '@/lib/models'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'hostel-marketplace-secret'

function getUser(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value || req.cookies.get('hm_session')?.value
    if (!token) return null
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
  } catch { return null }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    await connectDB()
    const { id } = await params

    const listing = await Listing.findById(id)
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    if (listing.sellerId.toString() !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    listing.status = 'PUBLISHED'
    await listing.save()

    return NextResponse.json({
      id: listing._id.toString(),
      status: 'PUBLISHED',
      message: 'Listing is now live!',
      qualityScore: listing.listingQualityScore || 85,
    })
  } catch (err) {
    console.error('[publish]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
