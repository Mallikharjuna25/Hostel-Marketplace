import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getDescriptionService } from '@/lib/ai'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { aiAnalysis: true },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const descService = getDescriptionService()
    const description = await descService.generate({
      title: listing.title,
      category: listing.category,
      conditionLabel: listing.condition || 'GOOD',
      detectedIssues: listing.aiAnalysis?.detectedIssues || [],
      brand: listing.brand || undefined,
      model: listing.model || undefined,
    })

    return NextResponse.json({
      aiDescription: description,
      message: 'AI description generated',
    })
  } catch (err) {
    console.error('[POST /api/products/[id]/generate-description]', err)
    return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 })
  }
}
