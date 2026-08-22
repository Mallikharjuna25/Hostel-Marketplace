import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { adminModerateListingSchema } from '@/lib/validation'
import { ListingStatus } from '@prisma/client'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    const body = await req.json()
    const parsed = adminModerateListingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid moderation action', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { action, reason } = parsed.data

    let newStatus: ListingStatus = ListingStatus.PUBLISHED
    if (action === 'SUSPEND') newStatus = ListingStatus.REMOVED
    if (action === 'FLAG') newStatus = ListingStatus.FLAGGED
    if (action === 'APPROVE') newStatus = ListingStatus.PUBLISHED
    if (action === 'REMOVE') newStatus = ListingStatus.REMOVED

    const updated = await prisma.listing.update({
      where: { id },
      data: { status: newStatus },
    })

    // Log admin audit action
    await prisma.adminAction.create({
      data: {
        adminId: admin.userId,
        targetType: 'listing',
        targetId: id,
        action: `MODERATE_${action}`,
        reason: reason || null,
      },
    })

    return NextResponse.json({
      listing: updated,
      message: `Listing status updated to ${newStatus}`,
    })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    console.error('[PUT /api/admin/listings/[id]/moderate]', err)
    return NextResponse.json({ error: 'Failed to moderate listing' }, { status: 500 })
  }
}
