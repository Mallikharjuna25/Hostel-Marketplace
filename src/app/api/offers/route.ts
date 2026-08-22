import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Listing, Offer, Transaction, Notification } from '@/lib/models'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'hostel-marketplace-secret'

function getUser(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value || req.cookies.get('hm_session')?.value
    if (!token) return null
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
  } catch { return null }
}

// GET /api/offers — list offers for user's listings (as seller) or made by user (as buyer)
export async function GET(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    await connectDB()

    const { searchParams } = new URL(req.url)
    const listingIdParam = searchParams.get('listingId')

    // Find all listings belonging to this user
    const myListings = await Listing.find({ sellerId: user.userId }).select('_id title mode priceInr images').lean()
    const myListingIds = myListings.map((l: any) => l._id)

    let query: any = {}
    if (listingIdParam) {
      query.listingId = listingIdParam
    } else {
      query = {
        $or: [
          { buyerId: user.userId },
          { listingId: { $in: myListingIds } },
        ],
      }
    }

    const offers = await Offer.find(query)
      .populate('listingId', 'title mode priceInr images sellerId')
      .populate('buyerId', 'profile trustScore email isVerified')
      .sort({ createdAt: -1 })
      .lean()

    const formattedOffers = offers.map((o: any) => {
      const isSeller = o.listingId?.sellerId?.toString() === user.userId
      return {
        id: o._id.toString(),
        listingId: o.listingId?._id?.toString() || o.listingId?.toString(),
        listing: o.listingId ? {
          id: o.listingId._id?.toString(),
          title: o.listingId.title,
          mode: o.listingId.mode,
          priceInr: o.listingId.priceInr,
          images: o.listingId.images || [],
          sellerId: o.listingId.sellerId?.toString(),
        } : null,
        buyerId: o.buyerId?._id?.toString() || o.buyerId?.toString(),
        buyer: o.buyerId ? {
          id: o.buyerId._id?.toString(),
          fullName: o.buyerId.profile?.fullName || 'Student',
          hostel: o.buyerId.profile?.hostel || '',
          block: o.buyerId.profile?.block || '',
          trustScore: typeof o.buyerId.trustScore === 'number' ? o.buyerId.trustScore : 80,
          college: o.buyerId.profile?.college || '',
        } : null,
        isSeller,
        offerPriceInr: o.offerPriceInr,
        note: o.note,
        status: o.status,
        createdAt: o.createdAt,
      }
    })

    const receivedOffers = formattedOffers.filter(o => o.isSeller)
    const sentOffers = formattedOffers.filter(o => !o.isSeller)

    return NextResponse.json({
      offers: formattedOffers,
      receivedOffers,
      sentOffers,
    })
  } catch (err) {
    console.error('[offers GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/offers — make offer on a listing
export async function POST(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    await connectDB()
    const { listingId, offerPriceInr, note } = await req.json()

    if (!listingId) return NextResponse.json({ error: 'listingId is required' }, { status: 400 })

    const listing = await Listing.findById(listingId)
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    if (listing.status !== 'PUBLISHED') return NextResponse.json({ error: 'Listing is not currently available for offers' }, { status: 400 })
    if (listing.sellerId.toString() === user.userId) return NextResponse.json({ error: 'Cannot offer on your own listing' }, { status: 400 })

    const existing = await Offer.findOne({ listingId, buyerId: user.userId, status: 'PENDING' })
    if (existing) return NextResponse.json({ error: 'You already have a pending offer on this listing' }, { status: 400 })

    const offer = new Offer({
      listingId,
      buyerId: user.userId,
      offerPriceInr: offerPriceInr || null,
      note: note || null,
      status: 'PENDING',
    })
    await offer.save()

    // Notify seller with direct link to messages & action center
    const offerSummary = offerPriceInr ? `₹${offerPriceInr}` : (note ? `"${note.slice(0, 30)}..."` : 'a swap/deal')
    await new Notification({
      userId: listing.sellerId,
      type: 'NEW_OFFER',
      title: 'New Offer Received! 🎁',
      message: `Someone offered ${offerSummary} on your listing "${listing.title}"`,
      link: `/messages`,
    }).save()

    return NextResponse.json({ id: offer._id.toString(), status: 'PENDING' }, { status: 201 })
  } catch (err) {
    console.error('[offers POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
