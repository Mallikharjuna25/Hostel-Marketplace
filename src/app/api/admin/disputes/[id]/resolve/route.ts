import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { adminResolveDisputeSchema } from '@/lib/validation'
import { updateTrustScore } from '@/lib/trustScore'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    const body = await req.json()
    const parsed = adminResolveDisputeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid resolution parameters', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { decision, outcome, trustAdjustments } = parsed.data

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: { report: true },
    })

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
    }

    // Update dispute and report status
    await prisma.$transaction([
      prisma.dispute.update({
        where: { id },
        data: {
          adminDecision: decision,
          status: outcome,
        },
      }),
      prisma.report.update({
        where: { id: dispute.reportId },
        data: { status: outcome },
      }),
    ])

    // Apply any specified trust score adjustments with audit logging
    for (const adj of trustAdjustments) {
      await updateTrustScore(adj.userId, 'ADMIN_ADJUSTMENT', adj.delta, `Dispute resolution: ${adj.reason}`)
    }

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: admin.userId,
        targetType: 'dispute',
        targetId: id,
        action: `RESOLVE_${outcome}`,
        reason: decision,
      },
    })

    return NextResponse.json({
      message: `Dispute ${outcome.toLowerCase()} successfully`,
      decision,
    })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    console.error('[PUT /api/admin/disputes/[id]/resolve]', err)
    return NextResponse.json({ error: 'Failed to resolve dispute' }, { status: 500 })
  }
}
