'use client'

import React from 'react'
import { AIBadge } from '@/components/ui/AIBadge'

export interface AIBuyingAnalysisProps {
  price: number | null
  fairValueLow?: number | null
  fairValueHigh?: number | null
  predictedPrice?: number | null
  conditionScore?: number | null
  conditionLabel?: string | null
  sellerTrustScore?: number | null
  distanceMeters?: number | null
  transactionType?: string
}

export function AIBuyingAnalysis({
  price,
  fairValueLow = 300,
  fairValueHigh = 500,
  predictedPrice = 400,
  conditionScore = 80,
  conditionLabel = 'Good',
  sellerTrustScore = 85,
  distanceMeters = 250,
  transactionType = 'SELL',
}: AIBuyingAnalysisProps) {
  // Price sub-score (0-100)
  let priceSubScore = 75
  if (price && predictedPrice) {
    if (price <= predictedPrice * 0.9) priceSubScore = 95
    else if (price <= predictedPrice) priceSubScore = 85
    else if (price <= predictedPrice * 1.15) priceSubScore = 65
    else priceSubScore = 40
  }

  // Condition sub-score
  const condScore = conditionScore || 75

  // Seller trust sub-score
  const trustScore = sellerTrustScore || 75

  // Distance sub-score
  let distanceScore = 80
  if (distanceMeters) {
    if (distanceMeters <= 300) distanceScore = 95
    else if (distanceMeters <= 600) distanceScore = 80
    else distanceScore = 60
  }

  // Overall weighted score
  const overall = Math.round(
    priceSubScore * 0.35 +
    condScore * 0.25 +
    trustScore * 0.25 +
    distanceScore * 0.15
  )

  // Verdict determination
  let verdict = 'Good to Buy'
  let verdictColor = 'text-[#2D6A4F] bg-[#ECFDF5] border-[#A7F3D0]'
  let explanation = ''

  if (trustScore < 55) {
    verdict = 'High Risk'
    verdictColor = 'text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]'
    explanation = 'The seller has a relatively low or unverified trust score. Proceed with extra caution and verify the item thoroughly before sharing any OTP.'
  } else if (priceSubScore < 50) {
    verdict = 'Expensive / Overpriced'
    verdictColor = 'text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]'
    explanation = `The asking price (₹${price}) is higher than our estimated campus fair value (₹${fairValueLow}–₹${fairValueHigh}). We recommend using the "Make Offer" button to negotiate.`
  } else if (overall >= 78) {
    verdict = 'Good to Buy'
    verdictColor = 'text-[#2D6A4F] bg-[#ECFDF5] border-[#A7F3D0]'
    explanation = `Fairly priced within the campus range (₹${fairValueLow}–₹${fairValueHigh}), seller is highly trusted (${trustScore}/100), and the item is in verified ${conditionLabel?.toLowerCase()} condition.`
  } else {
    verdict = 'Consider Negotiating'
    verdictColor = 'text-[#92400E] bg-[#FFFBEB] border-[#FDE68A]'
    explanation = `Solid overall deal, but you may be able to negotiate a slightly better price or check minor condition details during inspection.`
  }

  return (
    <div className="rounded-2xl border border-[#E5E2DD] bg-white p-5 space-y-4 shadow-xs">
      {/* Header with AI Badge */}
      <div className="flex items-center justify-between">
        <h4 className="font-heading font-bold text-base text-[#1A1A2E] flex items-center gap-2">
          <span>🎯</span> AI Buying Recommendation
        </h4>
        <AIBadge label="AI Analysis" sublabel="Advisory only" />
      </div>

      {/* Verdict Banner */}
      <div className={`p-3 rounded-xl border flex items-center justify-between ${verdictColor}`}>
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold opacity-75">
            Overall Recommendation
          </span>
          <p className="font-heading font-extrabold text-base">{verdict}</p>
        </div>
        <div className="text-right font-heading font-bold text-xl">
          {overall}<span className="text-xs font-normal opacity-70">/100</span>
        </div>
      </div>

      {/* Plain language explanation */}
      <p className="text-xs text-[#1A1A2E]/80 leading-relaxed bg-[#F7F5F2] p-3 rounded-xl">
        {explanation}
      </p>

      {/* 4 Factor Progress Bars */}
      <div className="space-y-2.5 pt-1">
        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
          Score Breakdown
        </span>

        {/* 1. Price Value */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-[#1A1A2E]">Fair Price Value</span>
            <span className="text-[#6B7280]">{priceSubScore}%</span>
          </div>
          <div className="w-full bg-[#E5E2DD] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#E8602C] h-full rounded-full" style={{ width: `${priceSubScore}%` }} />
          </div>
        </div>

        {/* 2. Condition */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-[#1A1A2E]">Item Condition ({conditionLabel})</span>
            <span className="text-[#6B7280]">{condScore}%</span>
          </div>
          <div className="w-full bg-[#E5E2DD] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#2D6A4F] h-full rounded-full" style={{ width: `${condScore}%` }} />
          </div>
        </div>

        {/* 3. Seller Trust */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-[#1A1A2E]">Seller Trust ({trustScore}/100)</span>
            <span className="text-[#6B7280]">{trustScore}%</span>
          </div>
          <div className="w-full bg-[#E5E2DD] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#2563EB] h-full rounded-full" style={{ width: `${trustScore}%` }} />
          </div>
        </div>

        {/* 4. Proximity */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-[#1A1A2E]">Campus Proximity (~{distanceMeters}m)</span>
            <span className="text-[#6B7280]">{distanceScore}%</span>
          </div>
          <div className="w-full bg-[#E5E2DD] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#7C3AED] h-full rounded-full" style={{ width: `${distanceScore}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}
