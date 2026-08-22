'use client'

import React from 'react'
import Link from 'next/link'

export interface ProductCardProps {
  id: string
  title: string
  category?: string
  price?: number | null
  priceInr?: number | null
  mode?: string
  transactionType?: string
  condition?: string | null
  location?: string
  hostel?: string
  block?: string
  distanceMeters?: number | null
  images?: Array<{ url: string; angle?: string | null }>
  seller?: any
  owner?: any
  aiAnalysis?: any
  pricePrediction?: any
  aiVerified?: boolean
}

export function ProductCard(props: ProductCardProps) {
  const {
    id,
    title,
    category = 'General',
    condition = 'GOOD',
    images,
    aiAnalysis,
    aiVerified,
  } = props

  const price = props.priceInr ?? props.price ?? null
  const mode = (props.mode || props.transactionType || 'SELL').toUpperCase()
  const sellerObj = props.seller || props.owner
  const sellerName = sellerObj?.profile?.fullName || 'Verified Student'
  const sellerTrust = typeof sellerObj?.trustScore === 'number' ? sellerObj.trustScore : (sellerObj?.trustScore?.score ?? 80)
  const locationText = props.location || (props.hostel ? `${props.hostel}${props.block ? ` · ${props.block}` : ''}` : (sellerObj?.profile?.hostel ? `${sellerObj.profile.hostel} · ${sellerObj.profile.block || ''}` : 'Campus Hostel'))

  const modeBadgeStyle = (m: string) => {
    switch (m) {
      case 'SELL': return { cls: 'badge-orange', label: 'FOR SALE' }
      case 'LEND': return { cls: 'badge-blue', label: 'FOR LEND' }
      case 'BORROW':
      case 'BORROW_REQUEST': return { cls: 'badge-blue', label: 'WANTED' }
      case 'EXCHANGE': return { cls: 'badge-purple', label: 'SWAP' }
      case 'DONATE': return { cls: 'badge-green', label: 'FREE DONATE' }
      case 'KNOWLEDGE': return { cls: 'badge-orange', label: 'KNOWLEDGE' }
      default: return { cls: 'badge-neutral', label: m }
    }
  }

  const badge = modeBadgeStyle(mode)

  const getEmoji = (cat: string, m: string) => {
    if (m === 'KNOWLEDGE') return '🧠'
    const lower = cat.toLowerCase()
    if (lower.includes('calc') || lower.includes('elect')) return '⚡'
    if (lower.includes('book') || lower.includes('physic') || lower.includes('code')) return '📚'
    if (lower.includes('table') || lower.includes('furn')) return '🪑'
    if (lower.includes('fridge') || lower.includes('appliance')) return '❄️'
    if (lower.includes('coat') || lower.includes('cloth')) return '🥼'
    if (lower.includes('headphone') || lower.includes('audio')) return '🎧'
    return '📦'
  }

  const primaryImage = images && images.length > 0 ? images[0].url : null

  return (
    <Link
      href={`/products/${id}`}
      className="group block theme-card rounded-2xl overflow-hidden text-decoration-none transition-all duration-200 hover:-translate-y-1 hover:border-[#E8602C] shadow-xs hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="relative h-44 w-full theme-card-alt flex items-center justify-center overflow-hidden border-b" style={{ borderColor: 'var(--border-color)' }}>
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-4xl select-none group-hover:scale-110 transition-transform duration-200">
            {getEmoji(category, mode)}
          </div>
        )}

        {/* Mode Tag Top-Left */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide shadow-xs ${badge.cls}`}>
            {badge.label}
          </span>
        </div>

        {/* Condition Tag Top-Right */}
        <div className="absolute top-2.5 right-2.5">
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold theme-card-alt theme-title border shadow-xs" style={{ borderColor: 'var(--border-color)' }}>
            {condition}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] theme-muted mb-1">
            <span className="font-semibold">{category}</span>
            <span>{locationText}</span>
          </div>

          <h3 className="font-heading font-bold text-sm theme-title line-clamp-1 group-hover:text-[#E8602C] transition-colors">
            {title}
          </h3>
        </div>

        {/* Price & Value Row */}
        <div className="flex items-baseline justify-between pt-1 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            {mode === 'DONATE' ? (
              <span className="font-heading font-extrabold text-base text-[#10B981] dark:text-[#34D399]">
                Free
              </span>
            ) : mode === 'EXCHANGE' ? (
              <span className="font-heading font-bold text-xs text-[#8B5CF6] dark:text-[#C084FC]">
                Swap Trade
              </span>
            ) : mode === 'LEND' ? (
              <div className="flex items-baseline gap-0.5">
                <span className="font-heading font-extrabold text-base text-[#2563EB] dark:text-[#60A5FA]">
                  ₹{price ?? 0}
                </span>
                <span className="text-[10px] theme-muted">/day</span>
              </div>
            ) : (
              <span className="font-heading font-extrabold text-lg theme-title">
                ₹{price ?? 0}
              </span>
            )}
          </div>

          {/* Seller Trust Score */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold badge-green px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] dark:bg-[#34D399]" />
            <span>Trust {sellerTrust}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
