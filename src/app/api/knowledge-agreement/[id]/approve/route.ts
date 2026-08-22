import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

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
    const agreement = await prisma.knowledgeAgreement.findUnique({
      where: { id },
    })

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    const isItemProvider = agreement.itemProviderId === session.userId
    const isKnowledgeProvider = agreement.knowledgeProviderId === session.userId

    if (!isItemProvider && !isKnowledgeProvider && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.knowledgeAgreement.update({
      where: { id },
      data: {
        ...(isItemProvider ? { approvedByItemProvider: true } : {}),
        ...(isKnowledgeProvider ? { approvedByKnowledgeProvider: true } : {}),
      },
    })

    const bothApproved = updated.approvedByItemProvider && updated.approvedByKnowledgeProvider

    return NextResponse.json({
      agreement: updated,
      bothApproved,
      message: bothApproved
        ? 'Knowledge agreement fully approved by both parties!'
        : 'Agreement approved. Waiting for the other student.',
    })
  } catch (err) {
    console.error('[PUT /api/knowledge-agreement/[id]/approve]', err)
    return NextResponse.json({ error: 'Failed to approve agreement' }, { status: 500 })
  }
}
