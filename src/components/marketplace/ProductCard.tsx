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
      case 'SELL': return { bg: '#FEF3EC', color: '#E8602C', label: 'FOR SALE' }
      case 'LEND': return { bg: '#EBF4FF', color: '#2563EB', label: 'FOR LEND' }
      case 'BORROW':
      case 'BORROW_REQUEST': return { bg: '#F0F9FF', color: '#0EA5E9', label: 'WANTED' }
      case 'EXCHANGE': return { bg: '#F5F3FF', color: '#8B5CF6', label: 'SWAP' }
      case 'DONATE': return { bg: '#ECFDF5', color: '#10B981', label: 'FREE DONATE' }
      case 'KNOWLEDGE': return { bg: '#FFF7ED', color: '#F97316', label: 'KNOWLEDGE' }
      default: return { bg: '#F4F1ED', color: '#6B7280', label: m }
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

  return (
    <Link
      href={`/products/${id}`}
      style={{
        display: 'block',
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #E8E3DC',
        overflow: 'hidden',
        textDecoration: 'none',
        transition: 'all 0.25s ease',
        boxShadow: '0 2px 8px rgba(17,17,40,0.04)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(17,17,40,0.1)'
        e.currentTarget.style.borderColor = '#D8D2C8'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(17,17,40,0.04)'
        e.currentTarget.style.borderColor = '#E8E3DC'
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          height: 160,
          background: 'linear-gradient(135deg, #FAF8F5 0%, #EFECE6 100%)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {images && images.length > 0 && images[0]?.url ? (
          <img
            src={images[0].url}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <>
            <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.08))' }}>
              {getEmoji(category, mode)}
            </div>
            <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600, marginTop: 4 }}>
              {category}
            </span>
          </>
        )}

        {/* Badges on Top */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '3px 8px',
              borderRadius: 6,
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.06em',
              background: badge.bg,
              color: badge.color,
            }}
          >
            {badge.label}
          </span>
          {condition && (
            <span
              style={{
                padding: '3px 7px',
                borderRadius: 6,
                fontSize: '9px',
                fontWeight: 700,
                background: 'rgba(255,255,255,0.9)',
                color: '#4B5563',
                border: '1px solid #E5E2DD',
              }}
            >
              {condition}
            </span>
          )}
        </div>

        {/* AI Checked indicator */}
        {(aiAnalysis || aiVerified) && (
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 8px',
                borderRadius: 100,
                fontSize: '10px',
                fontWeight: 700,
                background: '#FFF8F3',
                color: '#E8602C',
                border: '1px solid #FCD8C5',
                boxShadow: '0 2px 6px rgba(232,96,44,0.15)',
              }}
            >
              ⚡ AI Verified
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: '0.95rem',
            color: '#111128',
            lineHeight: 1.3,
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </h3>

        {/* Price Row */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            {mode === 'DONATE' ? (
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1rem', color: '#10B981' }}>
                Free (Donate)
              </span>
            ) : mode === 'EXCHANGE' ? (
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: '#8B5CF6' }}>
                Trade / Swap
              </span>
            ) : mode === 'KNOWLEDGE' ? (
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: '#F97316' }}>
                Skill Exchange
              </span>
            ) : price !== null ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#111128' }}>
                  ₹{Number(price).toLocaleString('en-IN')}
                </span>
                {mode === 'LEND' && (
                  <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 500 }}>/day</span>
                )}
              </div>
            ) : (
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>Negotiable</span>
            )}
          </div>

          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>
            {locationText}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid #F0EDE8',
            paddingTop: 10,
            marginTop: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#111128',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 700,
              }}
            >
              {sellerName.charAt(0)}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sellerName.split(' ')[0]}
            </span>
          </div>

          <div
            style={{
              padding: '2px 8px',
              borderRadius: 100,
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              fontSize: '10px',
              fontWeight: 700,
            }}
          >
            Trust {sellerTrust}/100
          </div>
        </div>
      </div>
    </Link>
  )
}
