import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { listingId } = await params
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.ownerId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const applications = await prisma.donationApplication.findMany({
      where: { listingId },
      orderBy: { overallMatch: 'desc' }, // ranked by AI recommendation
      include: {
        applicant: {
          select: {
            id: true,
            isVerified: true,
            profile: {
              select: {
                fullName: true,
                college: true,
                department: true,
                year: true,
                hostel: true,
                block: true,
                photoUrl: true,
              },
            },
            academicProfile: {
              select: {
                subjects: true,
                cgpa: true,
              },
            },
            trustScore: {
              select: { score: true },
            },
          },
        },
      },
    })

    return NextResponse.json({
      listing: { id: listing.id, title: listing.title },
      applications,
    })
  } catch (err) {
    console.error('[GET /api/donation/[listingId]/applications]', err)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}
