import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createKnowledgeAgreementSchema } from '@/lib/validation'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createKnowledgeAgreementSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid agreement data', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data
    const transaction = await prisma.transaction.findUnique({
      where: { id: data.transactionId },
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    if (
      transaction.partyAId !== session.userId &&
      transaction.partyBId !== session.userId &&
      session.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const isPartyA = transaction.partyAId === session.userId

    const agreement = await prisma.knowledgeAgreement.create({
      data: {
        transactionId: data.transactionId,
        itemProviderId: transaction.partyAId,
        knowledgeProviderId: transaction.partyBId,
        itemDescription: data.itemDescription,
        knowledgeDescription: data.knowledgeDescription,
        sessionsCount: data.sessionsCount,
        sessionMinutes: data.sessionMinutes,
        expectedWork: data.expectedWork,
        completionCriteria: data.completionCriteria,
        deadline: new Date(data.deadline),
        evidenceRequirements: data.evidenceRequirements,
        approvedByItemProvider: isPartyA,
        approvedByKnowledgeProvider: !isPartyA,
      },
    })

    return NextResponse.json({
      agreement,
      message: 'Knowledge agreement draft created. Counterparty approval required.',
    }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/knowledge-agreement]', err)
    return NextResponse.json({ error: 'Failed to create agreement' }, { status: 500 })
  }
}
