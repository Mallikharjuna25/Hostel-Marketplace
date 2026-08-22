import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Offer, Listing, Transaction, Notification, Message } from '@/lib/models'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'hostel-marketplace-secret'

function getUser(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value || req.cookies.get('hm_session')?.value
    if (!token) return null
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
  } catch { return null }
}

// PUT /api/offers/[id] — accept or reject an offer
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    await connectDB()
    const { id } = await params
    const { action } = await req.json() // 'accept' | 'reject' | 'withdraw'

    const offer = await Offer.findById(id).populate('listingId').populate('buyerId', 'profile')
    if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 })

    const listing = offer.listingId as any

    if (action === 'withdraw') {
      if (offer.buyerId._id?.toString() !== user.userId && offer.buyerId?.toString() !== user.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      offer.status = 'WITHDRAWN'
      await offer.save()
      return NextResponse.json({ status: 'WITHDRAWN' })
    }

    // seller actions
    if (listing.sellerId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Only the seller can accept/reject offers' }, { status: 403 })
    }

    if (action === 'reject') {
      offer.status = 'REJECTED'
      await offer.save()
      await new Notification({
        userId: (offer.buyerId._id || offer.buyerId),
        type: 'OFFER_REJECTED',
        title: 'Offer Declined',
        message: `Your offer on "${listing.title}" was not accepted by the seller.`,
        link: `/dashboard`,
      }).save()
      return NextResponse.json({ status: 'REJECTED' })
    }

    if (action === 'accept') {
      offer.status = 'ACCEPTED'
      await offer.save()

      // Auto-decline all other pending offers for this listing
      const otherOffers = await Offer.find({
        listingId: listing._id,
        _id: { $ne: offer._id },
        status: 'PENDING',
      })

      if (otherOffers.length > 0) {
        await Offer.updateMany(
          { listingId: listing._id, _id: { $ne: offer._id }, status: 'PENDING' },
          { $set: { status: 'REJECTED' } }
        )

        // Notify other buyers
        for (const other of otherOffers) {
          try {
            await new Notification({
              userId: other.buyerId,
              type: 'OFFER_REJECTED',
              title: 'Offer Closed',
              message: `The seller accepted another student's offer for "${listing.title}".`,
              link: '/dashboard',
            }).save()
          } catch {}
        }
      }

      // Create or find transaction
      const agreedPrice = offer.offerPriceInr || listing.priceInr || 0
      const tx = new Transaction({
        listingId: listing._id,
        offerId: offer._id,
        sellerId: listing.sellerId,
        buyerId: (offer.buyerId._id || offer.buyerId),
        agreedPriceInr: agreedPrice,
        status: 'HANDOVER_PENDING',
      })
      await tx.save()

      // Mark listing in transaction
      listing.status = 'IN_TRANSACTION'
      await listing.save()

      // Create first chat message to start conversation seamlessly
      const initMsg = new Message({
        transactionId: tx._id,
        senderId: user.userId,
        content: `🎉 Offer of ₹${agreedPrice} accepted! Let's arrange a time & spot in the hostel to inspect and complete the OTP handover.`,
      })
      await initMsg.save()

      // Notify buyer
      await new Notification({
        userId: (offer.buyerId._id || offer.buyerId),
        type: 'OFFER_ACCEPTED',
        title: 'Offer Accepted! 🎉',
        message: `Your offer for "${listing.title}" was accepted! Open transaction to coordinate handover.`,
        link: `/transactions/${tx._id.toString()}`,
      }).save()

      // Notify seller
      await new Notification({
        userId: user.userId,
        type: 'OFFER_ACCEPTED',
        title: 'Deal Started! 🤝',
        message: `You accepted an offer for "${listing.title}". Go to Transactions to view chat & generate OTP.`,
        link: `/transactions/${tx._id.toString()}`,
      }).save()

      return NextResponse.json({
        status: 'ACCEPTED',
        transactionId: tx._id.toString(),
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('[offers/[id] PUT]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
