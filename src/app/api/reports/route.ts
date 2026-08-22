import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createReportSchema } from '@/lib/validation'
import { ReportStatus } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createReportSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid report data', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { transactionId, category, description } = parsed.data
    const evidenceUrls = body.evidenceUrls || []

    const report = await prisma.report.create({
      data: {
        reporterId: session.userId,
        transactionId: transactionId || null,
        category,
        description,
        evidenceUrls,
        status: ReportStatus.SUBMITTED,
        dispute: transactionId ? {
          create: {
            status: ReportStatus.SUBMITTED,
          },
        } : undefined,
      },
      include: {
        dispute: true,
      },
    })

    return NextResponse.json({
      report,
      message: 'Report submitted. Our campus moderation team will review this shortly.',
    }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/reports]', err)
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
  }
}
