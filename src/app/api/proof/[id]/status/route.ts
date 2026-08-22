import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { applyTrustEvent } from '@/lib/trustScore'

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
    const { status, feedback } = body

    const proof = await prisma.proofSubmission.findUnique({
      where: { id },
      include: {
        agreement: {
          include: { transaction: true },
        },
      },
    })

    if (!proof) {
      return NextResponse.json({ error: 'Proof submission not found' }, { status: 404 })
    }

    const isItemProvider = proof.agreement.itemProviderId === session.userId

    if (!isItemProvider && session.role !== 'ADMIN') {
      return NextResponse.json({
        error: 'Only the item provider / recipient of knowledge can accept or request revisions on proof.',
      }, { status: 403 })
    }

    const updatedProof = await prisma.proofSubmission.update({
      where: { id },
      data: {
        status: status as any,
      },
    })

    if (status === 'ACCEPTED') {
      // Mark transaction completed
      await prisma.transaction.update({
        where: { id: proof.agreement.transactionId },
        data: { status: 'COMPLETED' as any },
      })

      // Increase trust scores
      await Promise.all([
        applyTrustEvent(proof.agreement.itemProviderId, 'SALE_COMPLETED', 'Transaction completed via accepted proof'),
        applyTrustEvent(proof.agreement.knowledgeProviderId, 'KNOWLEDGE_SHARED', 'Transaction completed via accepted proof'),
      ])
    }

    // Notify knowledge provider
    await prisma.notification.create({
      data: {
        userId: proof.submittedById,
        type: 'PROOF_STATUS_UPDATED',
        payload: {
          proofId: id,
          status,
          message: `Your proof submission was ${status.toLowerCase().replace('_', ' ')}.${feedback ? ` Note: "${feedback}"` : ''}`,
        },
      },
    })

    return NextResponse.json({
      proof: updatedProof,
      message: `Proof status updated to ${status}`,
    })
  } catch (err) {
    console.error('[PUT /api/proof/[id]/status]', err)
    return NextResponse.json({ error: 'Failed to update proof status' }, { status: 500 })
  }
}
