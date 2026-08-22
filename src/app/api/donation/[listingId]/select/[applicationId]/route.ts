import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ listingId: string; applicationId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { listingId, applicationId } = await params
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.ownerId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const application = await prisma.donationApplication.findUnique({
      where: { id: applicationId },
      include: { applicant: true },
    })

    if (!application || application.listingId !== listingId) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Mark this application as selected
    await prisma.donationApplication.update({
      where: { id: applicationId },
      data: { selected: true },
    })

    // Create Transaction for donation handover
    const transaction = await prisma.transaction.create({
      data: {
        listingId,
        partyAId: session.userId,         // donor
        partyBId: application.applicantId, // recipient
        type: 'DONATE' as any,
        agreedValue: { type: 'donation', free: true },
        status: 'HANDOVER_PENDING' as any,
      },
    })

    // Notify selected recipient
    await prisma.notification.create({
      data: {
        userId: application.applicantId,
        type: 'DONATION_SELECTED',
        payload: {
          transactionId: transaction.id,
          listingId,
          message: `Congratulations! You were selected for the donation of "${listing.title}". Please arrange handover!`,
        },
      },
    })

    return NextResponse.json({
      transaction,
      message: 'Recipient selected successfully! Transaction initiated for handover.',
    })
  } catch (err) {
    console.error('[POST /api/donation/.../select]', err)
    return NextResponse.json({ error: 'Failed to select recipient' }, { status: 500 })
  }
}
