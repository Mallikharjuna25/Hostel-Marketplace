import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getMatchingService } from '@/lib/ai'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Please log in to apply for this donation' }, { status: 401 })
    }

    const { listingId } = await params
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    })

    if (!listing || listing.transactionType !== 'DONATE') {
      return NextResponse.json({ error: 'Donation listing not found' }, { status: 404 })
    }

    if (listing.ownerId === session.userId) {
      return NextResponse.json({ error: 'You cannot apply for your own donation' }, { status: 400 })
    }

    const body = await req.json()
    const { reason, relevantSubject } = body

    if (!reason || reason.trim().length < 15) {
      return NextResponse.json({ error: 'Please share a brief reason why you need this item (min 15 characters)' }, { status: 400 })
    }

    // Get applicant's academic profile & trust score for AI scoring
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        academicProfile: true,
        trustScore: true,
      },
    })

    const matchingService = getMatchingService()
    const scoreResult = await matchingService.scoreDonationApplicant({
      listingCategory: listing.category,
      listingTitle: listing.title,
      applicantSubjects: user?.academicProfile?.subjects || [],
      applicantCgpa: user?.academicProfile?.cgpa || undefined,
      applicantReason: reason,
      trustScore: user?.trustScore?.score ?? 50,
    })

    const application = await prisma.donationApplication.create({
      data: {
        listingId,
        applicantId: session.userId,
        reason,
        relevantSubject: relevantSubject || null,
        academicRelevance: scoreResult.academicRelevance,
        needMatch: scoreResult.needMatch,
        trustFactor: scoreResult.trustFactor,
        overallMatch: scoreResult.overall,
        explanation: scoreResult.explanation,
      },
    })

    // Notify donor
    await prisma.notification.create({
      data: {
        userId: listing.ownerId,
        type: 'NEW_DONATION_APPLICANT',
        payload: {
          listingId,
          applicationId: application.id,
          message: `New student applied for your donation "${listing.title}"`,
        },
      },
    })

    return NextResponse.json({
      application,
      message: 'Application submitted! The donor will review all applications and select a recipient.',
    }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/donation/[listingId]/apply]', err)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}
