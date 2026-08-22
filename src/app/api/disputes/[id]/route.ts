import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        report: {
          include: {
            reporter: {
              select: {
                id: true,
                profile: { select: { fullName: true } },
                trustScore: { select: { score: true } },
              },
            },
            transaction: {
              include: {
                partyA: { select: { id: true, profile: { select: { fullName: true } } } },
                partyB: { select: { id: true, profile: { select: { fullName: true } } } },
                messages: { take: 10, orderBy: { createdAt: 'asc' } },
              },
            },
          },
        },
      },
    })

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
    }

    return NextResponse.json({ dispute })
  } catch (err) {
    console.error('[GET /api/disputes/[id]]', err)
    return NextResponse.json({ error: 'Failed to fetch dispute' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { buyerStatement, sellerStatement } = body

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: { report: { include: { transaction: true } } },
    })

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 })
    }

    const tx = dispute.report.transaction
    const isBuyer = tx ? tx.partyBId === session.userId : false
    const isSeller = tx ? tx.partyAId === session.userId : false

    const updated = await prisma.dispute.update({
      where: { id },
      data: {
        ...(isBuyer && buyerStatement ? { buyerStatement } : {}),
        ...(isSeller && sellerStatement ? { sellerStatement } : {}),
        status: 'UNDER_REVIEW',
      },
    })

    return NextResponse.json({
      dispute: updated,
      message: 'Statement updated successfully',
    })
  } catch (err) {
    console.error('[PUT /api/disputes/[id]]', err)
    return NextResponse.json({ error: 'Failed to update dispute' }, { status: 500 })
  }
}
