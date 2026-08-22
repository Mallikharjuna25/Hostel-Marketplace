import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { adminResolveDisputeSchema } from '@/lib/validation'
import { updateTrustScore } from '@/lib/trustScore'

export async function GET() {
  try {
    await requireAdmin()

    const disputes = await prisma.dispute.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        report: {
          include: {
            reporter: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
            transaction: {
              include: {
                partyA: { select: { id: true, profile: { select: { fullName: true } } } },
                partyB: { select: { id: true, profile: { select: { fullName: true } } } },
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ disputes })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED' || err.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    console.error('[GET /api/admin/disputes]', err)
    return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 })
  }
}
