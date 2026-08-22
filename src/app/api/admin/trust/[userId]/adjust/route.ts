import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { adminTrustAdjustSchema } from '@/lib/validation'
import { applyTrustEvent } from '@/lib/trustScore'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { userId } = await params
    const body = await req.json()
    const parsed = adminTrustAdjustSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid adjustment parameters', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { delta, reason } = parsed.data

    const result = await applyTrustEvent(userId, 'ADMIN_ADJUSTMENT', `Admin adjustment: ${reason}`, delta)

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: admin.userId,
        targetType: 'user_trust',
        targetId: userId,
        action: `TRUST_ADJUST_${delta > 0 ? '+' : ''}${delta}`,
        reason,
      },
    })

    return NextResponse.json({
      userId,
      previousScore: result.previousScore,
      newScore: result.newScore,
      delta,
      message: `Trust score adjusted from ${result.previousScore} to ${result.newScore}`,
    })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    console.error('[PUT /api/admin/trust/[userId]/adjust]', err)
    return NextResponse.json({ error: 'Failed to adjust trust score' }, { status: 500 })
  }
}
