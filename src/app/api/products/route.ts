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

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const user = getUser(req)
    const { searchParams } = new URL(req.url)
    const mode = searchParams.get('mode') || searchParams.get('type')
    const q = searchParams.get('q')
    const category = searchParams.get('category')
    const status = searchParams.get('status') || 'PUBLISHED'
    const sellerId = searchParams.get('sellerId')
    const mine = searchParams.get('mine')
    const hostel = searchParams.get('hostel')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = parseInt(searchParams.get('skip') || '0')
    const sort = searchParams.get('sort') || 'recent'

    const filter: Record<string, any> = {}

    if (mine === 'true' && user) {
      filter.sellerId = user.userId
      // If asking for user's own items, show all non-removed statuses unless specifically asked
      if (status !== 'all' && status !== 'PUBLISHED') {
        filter.status = status
      } else if (status === 'PUBLISHED') {
        filter.status = { $ne: 'REMOVED' }
      }
    } else if (sellerId) {
      filter.sellerId = sellerId
      if (status !== 'all') {
        filter.status = status
      }
    } else {
      if (status !== 'all') {
        filter.status = status
      }
    }

    if (mode && mode !== 'all') {
      const m = mode.toUpperCase().replace('BORROW_REQUEST', 'BORROW')
      filter.mode = { $in: [m, mode.toUpperCase()] }
    }
    if (category && category !== 'ALL') {
      filter.category = new RegExp(category, 'i')
    }
    if (hostel && mine !== 'true') {
      filter.hostel = new RegExp(hostel, 'i')
    }
    if (q && q.trim()) {
      filter.$or = [
        { title: new RegExp(q.trim(), 'i') },
        { description: new RegExp(q.trim(), 'i') },
        { category: new RegExp(q.trim(), 'i') },
        { tags: new RegExp(q.trim(), 'i') },
        { hostel: new RegExp(q.trim(), 'i') },
        { block: new RegExp(q.trim(), 'i') },
      ]
    }

    const sortObj: Record<string, 1 | -1> = sort === 'price-asc' || sort === 'price_asc' ? { priceInr: 1 }
      : sort === 'price-desc' || sort === 'price_desc' ? { priceInr: -1 }
      : sort === 'quality' ? { listingQualityScore: -1 }
      : { createdAt: -1 }

    const [listings, total] = await Promise.all([
      Listing.find(filter).sort(sortObj).skip(skip).limit(limit)
        .populate('sellerId', 'profile trustScore email isVerified')
        .lean(),
      Listing.countDocuments(filter),
    ])

    const serialized = listings.map((l: any) => ({
      id: l._id.toString(),
      title: l.title,
      description: l.description,
      mode: l.mode,
      transactionType: l.mode,
      condition: l.condition,
      conditionScore: l.conditionScore,
      price: l.priceInr,
      priceInr: l.priceInr,
      depositInr: l.depositInr,
      status: l.status,
      images: l.images || [],
      category: l.category,
      hostel: l.hostel,
      block: l.block,
      location: l.hostel ? `${l.hostel}${l.block ? ` · ${l.block}` : ''}` : 'Campus Hostel',
      tags: l.tags,
      aiVerified: l.aiVerified,
      listingQualityScore: l.listingQualityScore,
      aiAnalysis: l.aiAnalysis,
      pricePrediction: l.pricePrediction,
      createdAt: l.createdAt,
      seller: l.sellerId ? {
        id: (l.sellerId._id || l.sellerId).toString(),
        profile: {
          fullName: l.sellerId.profile?.fullName || 'Verified Student',
          hostel: l.sellerId.profile?.hostel || '',
          block: l.sellerId.profile?.block || '',
          college: l.sellerId.profile?.college || '',
          photoUrl: l.sellerId.profile?.photoUrl || null,
        },
        trustScore: typeof l.sellerId.trustScore === 'number' ? l.sellerId.trustScore : 80,
        isVerified: l.sellerId.isVerified ?? true,
      } : null,
      owner: l.sellerId ? {
        id: (l.sellerId._id || l.sellerId).toString(),
        profile: {
          fullName: l.sellerId.profile?.fullName || 'Verified Student',
          hostel: l.sellerId.profile?.hostel || '',
          block: l.sellerId.profile?.block || '',
          college: l.sellerId.profile?.college || '',
          photoUrl: l.sellerId.profile?.photoUrl || null,
        },
        trustScore: { score: typeof l.sellerId.trustScore === 'number' ? l.sellerId.trustScore : 80 },
        isVerified: l.sellerId.isVerified ?? true,
      } : null,
    }))

    return NextResponse.json({ listings: serialized, total, skip, limit })
  } catch (err) {
    console.error('[products GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Please log in to post a listing.' }, { status: 401 })

    await connectDB()
    const body = await req.json()

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const rawMode = body.mode || body.transactionType || 'SELL'
    const cleanMode = rawMode === 'BORROW_REQUEST' ? 'BORROW' : rawMode.toUpperCase()

    // Format images properly
    let formattedImages: Array<{ url: string; isPrimary: boolean }> = []
    if (Array.isArray(body.images) && body.images.length > 0) {
      formattedImages = body.images.map((img: any, idx: number) => {
        if (typeof img === 'string') {
          return { url: img, isPrimary: idx === 0 }
        }
        return {
          url: img.url || img.src || '',
          isPrimary: Boolean(img.isPrimary ?? idx === 0),
        }
      }).filter((img: any) => Boolean(img.url))
    } else if (body.imageUrl) {
      formattedImages = [{ url: body.imageUrl, isPrimary: true }]
    }

    const listing = new Listing({
      sellerId: user.userId,
      title: body.title.trim(),
      description: body.description?.trim() || 'No description provided.',
      mode: cleanMode,
      condition: body.condition || 'GOOD',
      conditionScore: body.conditionScore || 80,
      priceInr: body.priceInr !== undefined ? body.priceInr : (body.price !== undefined && body.price !== '' ? Number(body.price) : null),
      depositInr: body.depositInr !== undefined ? body.depositInr : (body.depositAmount !== undefined && body.depositAmount !== '' ? Number(body.depositAmount) : null),
      images: formattedImages,
      billUrl: body.billUrl || body.receiptUrl || null,
      category: body.category || 'Other',
      tags: body.tags || [],
      hostel: body.hostel || body.location || '',
      block: body.block || '',
      status: 'PUBLISHED',
      aiVerified: Boolean(body.aiVerified ?? true),
      listingQualityScore: body.listingQualityScore || 85,
      aiAnalysis: body.aiAnalysis || {
        detectedProduct: body.title,
        confidence: 0.95,
        conditionLabel: body.condition || 'GOOD',
        conditionScore: body.conditionScore || 80,
        detectedIssues: body.detectedIssues || [],
      },
      pricePrediction: body.pricePrediction || (body.price ? {
        minPrice: Math.round(Number(body.price) * 0.8),
        maxPrice: Math.round(Number(body.price) * 1.2),
        fairPrice: Number(body.price),
        confidence: 0.9,
        reasoning: 'Calculated from campus market data',
      } : undefined),
    })

    await listing.save()

    // If verified bill was attached, reward seller trust score
    if (listing.billUrl) {
      try {
        const { applyTrustEvent, recalculateUserTrustScore } = await import('@/lib/trustScore')
        await applyTrustEvent(user.userId, 'BILL_VERIFIED', `Uploaded verified receipt for "${listing.title}"`, 4)
        await recalculateUserTrustScore(user.userId)
      } catch (trustErr) {
        console.error('[products trust bump]', trustErr)
      }
    }

    return NextResponse.json({
      id: listing._id.toString(),
      listing: {
        id: listing._id.toString(),
        title: listing.title,
        mode: listing.mode,
        status: listing.status,
        images: listing.images,
        billUrl: listing.billUrl,
      },
      status: 'PUBLISHED',
      message: 'Listing published successfully!',
    }, { status: 201 })
  } catch (err) {
    console.error('[products POST]', err)
    return NextResponse.json({ error: 'Server error creating listing' }, { status: 500 })
  }
}
