import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Message, Transaction, User, Notification } from '@/lib/models'
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
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    await connectDB()

    const { searchParams } = new URL(req.url)
    const transactionId = searchParams.get('transactionId')

    if (transactionId) {
      const msgs = await Message.find({ transactionId })
        .populate('senderId', 'profile email')
        .sort({ createdAt: 1 })
        .lean()
      return NextResponse.json({
        messages: msgs.map((m: any) => ({
          id: m._id.toString(),
          content: m.content,
          senderId: (m.senderId?._id || m.senderId)?.toString(),
          senderName: m.senderId?.profile?.fullName || m.senderId?.email?.split('@')[0] || 'Student',
          createdAt: m.createdAt,
        })),
      })
    }

    // 1. Fetch active transactions
    const txs = await Transaction.find({
      $or: [{ sellerId: user.userId }, { buyerId: user.userId }],
    })
      .populate('sellerId', 'profile email trustScore')
      .populate('buyerId', 'profile email trustScore')
      .populate('listingId', 'title mode priceInr images')
      .sort({ updatedAt: -1 })
      .lean()

    const txThreads = await Promise.all(txs.map(async (tx: any) => {
      const lastMsg = await Message.findOne({ transactionId: tx._id }).sort({ createdAt: -1 }).lean()
      return {
        id: tx._id.toString(),
        type: 'TRANSACTION',
        status: tx.status,
        listing: tx.listingId ? {
          title: tx.listingId.title,
          mode: tx.listingId.mode,
          priceInr: tx.listingId.priceInr,
          images: tx.listingId.images,
        } : null,
        partyA: {
          id: tx.sellerId?._id?.toString(),
          profile: tx.sellerId?.profile,
          trustScore: tx.sellerId?.trustScore ?? 80,
        },
        partyB: {
          id: tx.buyerId?._id?.toString(),
          profile: tx.buyerId?.profile,
          trustScore: tx.buyerId?.trustScore ?? 80,
        },
        partyAId: tx.sellerId?._id?.toString(),
        partyBId: tx.buyerId?._id?.toString(),
        lastMessage: lastMsg ? (lastMsg as any).content : 'Deal started. Coordinate handover spot.',
        updatedAt: tx.updatedAt,
      }
    }))

    // 2. Fetch pending proposals only (received on user's active listings + sent by user)
    const { Listing, Offer } = await import('@/lib/models')
    const myListings = await Listing.find({ sellerId: user.userId }).select('_id status').lean()
    const myListingIds = myListings.map((l: any) => l._id)

    const offers = await Offer.find({
      $or: [
        { listingId: { $in: myListingIds } },
        { buyerId: user.userId },
      ],
      status: 'PENDING',
    })
      .populate('listingId', 'title mode priceInr images sellerId status')
      .populate('buyerId', 'profile email trustScore')
      .sort({ createdAt: -1 })
      .lean()

    const receivedOffers: any[] = []
    const sentOffers: any[] = []

    // Also get set of listing IDs already in active transactions to prevent duplicate pending offers
    const activeTxListingIds = new Set(txs.map((t: any) => t.listingId?._id?.toString() || t.listingId?.toString()))

    const offerThreads = offers
      .filter((o: any) => {
        // Exclude offers for listings that are already in transaction or completed
        const listStatus = o.listingId?.status
        if (listStatus === 'IN_TRANSACTION' || listStatus === 'COMPLETED') return false
        if (activeTxListingIds.has(o.listingId?._id?.toString())) return false
        return true
      })
      .map((o: any) => {
        const isSeller = myListingIds.some((id: any) => id.toString() === o.listingId?._id?.toString() || id.toString() === o.listingId?.toString())
        const formatted = {
          id: o._id.toString(),
          type: 'OFFER',
          offerId: o._id.toString(),
          status: o.status,
          isSeller,
          offerPriceInr: o.offerPriceInr,
          note: o.note,
          listing: o.listingId ? {
            id: o.listingId._id?.toString(),
            title: o.listingId.title,
            mode: o.listingId.mode,
            priceInr: o.listingId.priceInr,
            images: o.listingId.images,
            sellerId: o.listingId.sellerId?.toString(),
          } : null,
          buyer: o.buyerId ? {
            id: o.buyerId._id?.toString(),
            fullName: o.buyerId.profile?.fullName || 'Student',
            hostel: o.buyerId.profile?.hostel || '',
            block: o.buyerId.profile?.block || '',
            trustScore: typeof o.buyerId.trustScore === 'number' ? o.buyerId.trustScore : 80,
          } : null,
          lastMessage: o.note ? `Offer note: "${o.note}"` : (o.offerPriceInr ? `Offered ₹${o.offerPriceInr}` : 'Proposed an offer/swap'),
          updatedAt: o.updatedAt || o.createdAt,
          createdAt: o.createdAt,
        }

        if (isSeller && o.status === 'PENDING') {
          receivedOffers.push(formatted)
        } else if (!isSeller && o.status === 'PENDING') {
          sentOffers.push(formatted)
        }

        return formatted
      })

    // Combine threads
    const allThreads = [...txThreads, ...offerThreads].sort((a: any, b: any) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

    return NextResponse.json({
      threads: allThreads,
      transactions: txThreads,
      receivedOffers,
      sentOffers,
      totalCount: allThreads.length,
    })
  } catch (err) {
    console.error('[messages GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    await connectDB()

    const { transactionId, content } = await req.json()
    if (!transactionId || !content?.trim()) return NextResponse.json({ error: 'transactionId and content required' }, { status: 400 })

    const tx = await Transaction.findById(transactionId)
    if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

    const isParty = tx.sellerId.toString() === user.userId || tx.buyerId.toString() === user.userId
    if (!isParty) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const senderUser = await User.findById(user.userId).select('profile email').lean()
    const senderName = (senderUser as any)?.profile?.fullName || (senderUser as any)?.email?.split('@')[0] || 'Student'

    const msg = new Message({ transactionId, senderId: user.userId, content: content.trim() })
    await msg.save()

    // Touch transaction update time
    tx.updatedAt = new Date()
    await tx.save()

    // Notify recipient
    const recipientId = tx.sellerId.toString() === user.userId ? tx.buyerId : tx.sellerId
    await new Notification({
      userId: recipientId,
      type: 'NEW_MESSAGE',
      title: `💬 Message from ${senderName}`,
      message: content.trim().length > 60 ? `${content.trim().slice(0, 60)}...` : content.trim(),
      link: `/transactions/${transactionId}`,
    }).save()

    return NextResponse.json({
      id: msg._id.toString(),
      content: msg.content,
      senderId: user.userId,
      senderName,
      createdAt: msg.createdAt,
    }, { status: 201 })
  } catch (err) {
    console.error('[messages POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
