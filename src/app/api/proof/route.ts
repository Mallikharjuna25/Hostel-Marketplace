import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getProofAnalysisService } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { agreementId, fileUrls, note } = body

    if (!agreementId) {
      return NextResponse.json({ error: 'Agreement ID required' }, { status: 400 })
    }

    const agreement = await prisma.knowledgeAgreement.findUnique({
      where: { id: agreementId },
    })

    if (!agreement) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    // Run AI proof coverage analysis
    const proofService = getProofAnalysisService()
    const aiResult = await proofService.analyze({
      taskDescription: agreement.expectedWork,
      completionCriteria: agreement.completionCriteria,
      note: note || undefined,
      fileCount: (fileUrls || []).length || 1,
    })

    const proof = await prisma.proofSubmission.create({
      data: {
        agreementId,
        submittedById: session.userId,
        fileUrls: fileUrls || ['/uploads/proofs/proof-document.pdf'],
        note: note || null,
        aiCoverage: aiResult.coverage,
        aiSummary: aiResult.summary,
        status: 'SUBMITTED',
      },
    })

    // Notify item provider
    await prisma.notification.create({
      data: {
        userId: agreement.itemProviderId,
        type: 'PROOF_SUBMITTED',
        payload: {
          agreementId,
          proofId: proof.id,
          message: `Work proof submitted for knowledge exchange. AI Coverage estimate: ${aiResult.coverage}%`,
        },
      },
    })

    return NextResponse.json({
      proof,
      message: 'Proof submitted successfully! AI coverage analysis completed.',
    }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/proof]', err)
    return NextResponse.json({ error: 'Failed to submit proof' }, { status: 500 })
  }
}
