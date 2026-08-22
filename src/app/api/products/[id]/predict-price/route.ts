import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getPricePredictionService } from '@/lib/ai'

type PriceVerdict = 'GOOD_VALUE' | 'CONSIDER_NEGOTIATING' | 'OVERPRICED'

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
    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const service = getPricePredictionService()
    const prediction = await service.predict({
      category: listing.category,
      brand: listing.brand || undefined,
      condition: listing.condition || 'GOOD',
      originalPrice: listing.originalPrice || undefined,
    })

    // Compare seller price with fair value range to derive verdict
    let verdict: PriceVerdict = 'GOOD_VALUE'
    if (listing.price) {
      if (listing.price > prediction.high * 1.15) {
        verdict = 'OVERPRICED'
      } else if (listing.price > prediction.high) {
        verdict = 'CONSIDER_NEGOTIATING'
      } else {
        verdict = 'GOOD_VALUE'
      }
    }

    const pricePredictionRecord = await prisma.pricePrediction.upsert({
      where: { listingId: id },
      create: {
        listingId: id,
        minPrice: prediction.low,
        maxPrice: prediction.high,
        fairPrice: prediction.predicted,
        confidence: 0.85,
        verdict: verdict as any,
      },
      update: {
        minPrice: prediction.low,
        maxPrice: prediction.high,
        fairPrice: prediction.predicted,
        verdict: verdict as any,
      },
    })

    return NextResponse.json({
      pricePrediction: pricePredictionRecord,
      message: 'Price prediction generated successfully',
    })
  } catch (err) {
    console.error('[POST /api/products/[id]/predict-price]', err)
    return NextResponse.json({ error: 'Failed to predict price' }, { status: 500 })
  }
}
