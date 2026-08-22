import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getVisionService } from '@/lib/ai'
import { computeListingQualityScore } from '@/lib/ai/listingQuality'

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
      include: {
        images: true,
        bills: true,
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.ownerId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const imageUrls = listing.images.map(img => img.url)
    const vision = getVisionService()

    try {
      const visionResult = await vision.analyze(imageUrls)

      // Compute Listing Quality Score
      const qualityResult = computeListingQualityScore({
        imageCount: listing.images.length,
        imageQualityScore: Math.round(visionResult.confidence * 100),
        descriptionLength: (listing.description || '').length,
        hasBill: listing.bills.length > 0,
        productIdConfidence: Math.round(visionResult.confidence * 100),
        conditionLabel: visionResult.conditionLabel,
        hasTitle: !!listing.title,
        hasCategory: !!listing.category,
        hasCondition: !!visionResult.conditionLabel,
        hasPrice: listing.price !== null,
        hasLocation: !!listing.location,
      })

      // Upsert AIAnalysis record
      const aiAnalysis = await prisma.aIAnalysis.upsert({
        where: { listingId: id },
        create: {
          listingId: id,
          detectedProduct: visionResult.detectedProduct,
          confidence: visionResult.confidence,
          conditionLabel: visionResult.conditionLabel,
          conditionScore: visionResult.conditionScore,
          detectedIssues: visionResult.detectedIssues,
          qualityScore: qualityResult.score,
          provider: process.env.AI_PROVIDER || 'mock',
          status: 'COMPLETE',
        },
        update: {
          detectedProduct: visionResult.detectedProduct,
          confidence: visionResult.confidence,
          conditionLabel: visionResult.conditionLabel,
          conditionScore: visionResult.conditionScore,
          detectedIssues: visionResult.detectedIssues,
          qualityScore: qualityResult.score,
          provider: process.env.AI_PROVIDER || 'mock',
          status: 'COMPLETE',
        },
      })

      // Also update listing with condition & quality score
      await prisma.listing.update({
        where: { id },
        data: {
          condition: visionResult.conditionLabel,
          conditionScore: visionResult.conditionScore,
          listingQualityScore: qualityResult.score,
        },
      })

      return NextResponse.json({
        analysis: aiAnalysis,
        quality: qualityResult,
        message: 'AI Vision analysis complete',
      })
    } catch (aiErr) {
      console.error('[AI Vision Failed]', aiErr)
      // Save FAILED status
      await prisma.aIAnalysis.upsert({
        where: { listingId: id },
        create: {
          listingId: id,
          detectedProduct: 'Unknown',
          confidence: 0,
          conditionLabel: 'NEEDS_REVIEW',
          conditionScore: 50,
          detectedIssues: [],
          qualityScore: 50,
          provider: process.env.AI_PROVIDER || 'mock',
          status: 'FAILED',
        },
        update: {
          status: 'FAILED',
        },
      })

      return NextResponse.json({
        error: 'AI analysis temporarily unavailable. You may proceed manually or retry.',
        status: 'FAILED',
      }, { status: 503 })
    }
  } catch (err) {
    console.error('[POST /api/products/[id]/analyze]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
