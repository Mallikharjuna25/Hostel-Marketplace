import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Listing, Offer } from '@/lib/models'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'hostel-marketplace-secret'

function getUser(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value || req.cookies.get('hm_session')?.value
    if (!token) return null
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
  } catch { return null }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params

    const listing = await Listing.findById(id)
      .populate('sellerId', 'profile trustScore email isVerified')
      .lean()

    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

    const l = listing as any
    return NextResponse.json({
      id: l._id.toString(),
      title: l.title,
      description: l.description,
      mode: l.mode,
      condition: l.condition,
      conditionScore: l.conditionScore,
      priceInr: l.priceInr,
      depositInr: l.depositInr,
      status: l.status,
      images: l.images || [],
      billUrl: l.billUrl || null,
      hasVerifiedBill: Boolean(l.billUrl),
      category: l.category,
      hostel: l.hostel,
      block: l.block,
      tags: l.tags,
      aiVerified: l.aiVerified,
      listingQualityScore: l.listingQualityScore,
      aiAnalysis: l.aiAnalysis,
      pricePrediction: l.pricePrediction,
      createdAt: l.createdAt,
      seller: l.sellerId ? {
        id: l.sellerId._id?.toString(),
        email: l.sellerId.email,
        isVerified: l.sellerId.isVerified,
        profile: {
          fullName: l.sellerId.profile?.fullName,
          hostel: l.sellerId.profile?.hostel,
          block: l.sellerId.profile?.block,
          college: l.sellerId.profile?.college,
          department: l.sellerId.profile?.department,
          year: l.sellerId.profile?.year,
          photoUrl: l.sellerId.profile?.photoUrl,
        },
        trustScore: l.sellerId.trustScore,
      } : null,
    })
  } catch (err) {
    console.error('[products/[id] GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const updates = await req.json()
    const allowedFields = ['title', 'description', 'priceInr', 'depositInr', 'condition', 'conditionScore', 'category', 'tags', 'hostel', 'block', 'status']
    allowedFields.forEach(f => { if (updates[f] !== undefined) (listing as any)[f] = updates[f] })
    await listing.save()

    return NextResponse.json({ id: listing._id.toString(), message: 'Updated' })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    await connectDB()
    const { id } = await params

    const listing = await Listing.findById(id)
    if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (listing.sellerId.toString() !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    listing.status = 'REMOVED'
    await listing.save()
    return NextResponse.json({ message: 'Listing removed' })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
