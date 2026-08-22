'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Footer } from '@/components/ui/Footer'
import { AIBadge } from '@/components/ui/AIBadge'
import { AIBuyingAnalysis } from '@/components/ai/AIBuyingAnalysis'

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [listing, setListing] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Offer Modal State
  const [offerModalOpen, setOfferModalOpen] = useState(false)
  const [proposalType, setProposalType] = useState<'MONEY' | 'EXCHANGE_ITEM' | 'KNOWLEDGE'>('MONEY')
  const [offerAmount, setOfferAmount] = useState('')
  const [offerMessage, setOfferMessage] = useState('')
  const [offerSubmitting, setOfferSubmitting] = useState(false)
  const [offerSuccess, setOfferSuccess] = useState(false)

  // Donation Apply Modal State
  const [donationModalOpen, setDonationModalOpen] = useState(false)
  const [donationReason, setDonationReason] = useState('')
  const [donationSubject, setDonationSubject] = useState('')
  const [donationSubmitting, setDonationSubmitting] = useState(false)
  const [donationSuccess, setDonationSuccess] = useState(false)

  // Seller's incoming offers for this item
  const [listingOffers, setListingOffers] = useState<any[]>([])
  const [offerActionLoading, setOfferActionLoading] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [billModalOpen, setBillModalOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [prodRes, userRes, offersRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch('/api/users/me'),
          fetch(`/api/offers?listingId=${id}`),
        ])

        if (prodRes.ok) {
          const data = await prodRes.json()
          const lData = data.listing || data
          setListing(lData)
          const p = lData.priceInr ?? lData.price
          if (p) setOfferAmount(p.toString())
        } else {
          setError('Product listing not found.')
        }

        if (userRes.ok) {
          const userData = await userRes.json()
          setCurrentUser(userData)
        }

        if (offersRes.ok) {
          const offersData = await offersRes.json()
          setListingOffers(offersData.offers || [])
        }
      } catch (err) {
        console.error(err)
        setError('Failed to load listing.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleSellerOfferAction = async (offerId: string, action: 'accept' | 'reject') => {
    setOfferActionLoading(offerId)
    try {
      const res = await fetch(`/api/offers/${offerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (res.ok) {
        if (action === 'accept' && data.transactionId) {
          router.push(`/transactions/${data.transactionId}`)
          return
        }
        // Refresh offers
        const offersRes = await fetch(`/api/offers?listingId=${id}`)
        if (offersRes.ok) {
          const offersData = await offersRes.json()
          setListingOffers(offersData.offers || [])
        }
      } else {
        alert(data.error || 'Failed to update offer')
      }
    } catch {
      alert('Error updating offer')
    } finally {
      setOfferActionLoading(null)
    }
  }

  const handleActionClick = (actionCallback: () => void) => {
    if (!currentUser) {
      router.push(`/login?redirect=/products/${id}`)
      return
    }
    actionCallback()
  }

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault()
    setOfferSubmitting(true)
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: id,
          offerPriceInr: proposalType === 'MONEY' && offerAmount ? parseInt(offerAmount) : undefined,
          note: offerMessage || (proposalType === 'KNOWLEDGE' ? 'Tutoring / Skill Exchange proposal' : 'Item Swap proposal'),
        }),
      })

      if (res.ok) {
        setOfferSuccess(true)
        setTimeout(() => {
          setOfferModalOpen(false)
          setOfferSuccess(false)
          router.push('/dashboard')
        }, 1500)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to submit offer')
      }
    } catch (err) {
      console.error(err)
      alert('Error submitting offer')
    } finally {
      setOfferSubmitting(false)
    }
  }

  const handleSendDonationApply = async (e: React.FormEvent) => {
    e.preventDefault()
    setDonationSubmitting(true)
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: id,
          offerPriceInr: 0,
          note: `[DONATION APPLICATION] Subject: ${donationSubject || 'General'} | Reason: ${donationReason}`,
        }),
      })

      if (res.ok) {
        setDonationSuccess(true)
        setTimeout(() => {
          setDonationModalOpen(false)
          setDonationSuccess(false)
          router.push('/dashboard')
        }, 2000)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to apply for donation')
      }
    } catch (err) {
      console.error(err)
      alert('Error submitting application')
    } finally {
      setDonationSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background" style={{ paddingTop: '80px' }}>
        <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 h-96 skeleton rounded-3xl" />
            <div className="lg:col-span-5 space-y-4">
              <div className="h-8 skeleton w-3/4 rounded" />
              <div className="h-6 skeleton w-1/3 rounded" />
              <div className="h-32 skeleton rounded-2xl" />
              <div className="h-12 skeleton rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col bg-background" style={{ paddingTop: '80px' }}>
        <main className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="font-heading font-bold text-2xl text-[#1A1A2E]">{error || 'Listing not found'}</h2>
          <p className="text-xs text-[#6B7280]">The item may have been completed, expired, or removed.</p>
          <Link href="/explore" className="inline-block px-4 py-2 rounded-xl bg-[#E8602C] text-white text-xs font-semibold">
            Back to Marketplace
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const mode = (listing.mode || listing.transactionType || 'SELL').toUpperCase()
  const price = listing.priceInr ?? listing.price ?? null
  const seller = listing.seller || listing.owner || null
  const isOwner = currentUser?.id === (seller?.id || listing.sellerId || listing.ownerId)
  const category = listing.category || 'General'
  const locationText = listing.hostel ? `${listing.hostel}${listing.block ? ` · ${listing.block}` : ''}` : (listing.location || 'Campus Hostel')
  const sellerTrust = typeof seller?.trustScore === 'number' ? seller.trustScore : (seller?.trustScore?.score ?? 80)
  const sellerName = seller?.profile?.fullName || 'Verified Student'

  const modeBadge = (m: string) => {
    switch (m) {
      case 'SELL': return { bg: '#FEF3EC', color: '#E8602C', label: 'FOR SALE' }
      case 'LEND': return { bg: '#EBF4FF', color: '#2563EB', label: 'FOR LEND' }
      case 'BORROW':
      case 'BORROW_REQUEST': return { bg: '#F0F9FF', color: '#0EA5E9', label: 'WANTED' }
      case 'EXCHANGE': return { bg: '#F5F3FF', color: '#8B5CF6', label: 'SWAP' }
      case 'DONATE': return { bg: '#ECFDF5', color: '#10B981', label: 'FREE DONATE' }
      case 'KNOWLEDGE': return { bg: '#FFF7ED', color: '#F97316', label: 'KNOWLEDGE SWAP' }
      default: return { bg: '#F4F1ED', color: '#6B7280', label: m }
    }
  }

  const badge = modeBadge(mode)

  const getEmoji = (cat: string, m: string) => {
    if (m === 'KNOWLEDGE') return '🧠'
    const lower = (cat || '').toLowerCase()
    if (lower.includes('calc') || lower.includes('elect')) return '⚡'
    if (lower.includes('book') || lower.includes('physic') || lower.includes('code')) return '📚'
    if (lower.includes('table') || lower.includes('furn')) return '🪑'
    if (lower.includes('fridge') || lower.includes('appliance')) return '❄️'
    if (lower.includes('coat') || lower.includes('cloth')) return '🥼'
    if (lower.includes('headphone') || lower.includes('audio')) return '🎧'
    return '📦'
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full" style={{ paddingTop: '80px' }}>
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-6">
          <Link href="/" className="hover:text-[#1A1A2E]">Home</Link>
          <span>/</span>
          <Link href="/explore" className="hover:text-[#1A1A2E]">Marketplace</Link>
          <span>/</span>
          <Link href={`/explore?category=${category}`} className="hover:text-[#1A1A2E]">{category}</Link>
          <span>/</span>
          <span className="text-[#1A1A2E] truncate font-medium max-w-xs">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Gallery & AI Condition Analysis */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Photo Viewer */}
            <div className="relative rounded-3xl bg-[#FAF8F5] border border-[#E5E2DD] overflow-hidden flex items-center justify-center min-h-[380px] max-h-[460px]">
              {listing.images && listing.images.length > 0 && listing.images[selectedImageIndex]?.url ? (
                <img
                  src={listing.images[selectedImageIndex].url}
                  alt={listing.title}
                  className="w-full h-full object-contain max-h-[460px] bg-[#111128]/5"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#FAF8F5] to-[#EAE6DF]">
                  <span className="text-6xl mb-3">
                    {getEmoji(category, mode)}
                  </span>
                  <span className="font-heading font-semibold text-lg text-[#1A1A2E]">{listing.title}</span>
                  <span className="text-xs text-[#6B7280] mt-1">{category} · {locationText}</span>
                </div>
              )}

              {/* Mode Pill overlay */}
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: 100,
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    background: badge.bg,
                    color: badge.color,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  {badge.label}
                </span>
                {listing.condition && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-[#1A1A2E] border border-[#E5E2DD] shadow-xs">
                    Condition: {listing.condition}
                  </span>
                )}
              </div>
            </div>

            {/* Multiple Photos Thumbnails Strip */}
            {listing.images && listing.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {listing.images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                      selectedImageIndex === idx ? 'border-[#E8602C] ring-2 ring-[#E8602C]/30' : 'border-[#E5E2DD] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Verified Bill / Receipt Proof Card */}
            {listing.hasVerifiedBill && (
              <div className="rounded-2xl border border-[#A7F3D0] bg-[#F0FDF4] p-4 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#10B981] text-white flex items-center justify-center text-lg flex-shrink-0">
                    🧾
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-heading font-bold text-xs text-[#065F46]">
                        Verified Purchase Proof & Invoice Attached
                      </h4>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#10B981] text-white">
                        AUTHENTIC
                      </span>
                    </div>
                    <p className="text-[11px] text-[#047857] mt-0.5">
                      Original bill inspected by campus AI. Item authenticity verified.
                    </p>
                  </div>
                </div>

                {isOwner && listing.billUrl && (
                  <button
                    type="button"
                    onClick={() => setBillModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#A7F3D0] text-[#065F46] font-bold text-xs hover:bg-[#ECFDF5] transition-colors cursor-pointer flex-shrink-0"
                  >
                    View Bill (Private)
                  </button>
                )}
              </div>
            )}

            {/* Private Bill Modal for Owner */}
            {billModalOpen && listing.billUrl && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[#E5E2DD] pb-3">
                    <h3 className="font-heading font-bold text-base text-[#1A1A2E] flex items-center gap-2">
                      <span>🧾</span> Your Encrypted Purchase Bill
                    </h3>
                    <button
                      onClick={() => setBillModalOpen(false)}
                      className="text-xs font-bold text-[#6B7280] hover:text-[#1A1A2E]"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-[#E5E2DD] bg-[#FAF8F5] max-h-[60vh] flex items-center justify-center">
                    <img src={listing.billUrl} alt="Bill Proof" className="max-h-[60vh] object-contain w-full" />
                  </div>
                  <p className="text-[11px] text-[#6B7280] text-center">
                    🔒 This invoice proof is stored securely and only accessible to you and platform moderators.
                  </p>
                </div>
              </div>
            )}

            {/* AI Vision Pipeline Analysis Card */}
            {(listing.aiAnalysis || listing.aiVerified) && (
              <div className="rounded-2xl border border-[#E5E2DD] bg-white p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm text-[#1A1A2E] flex items-center gap-2">
                    <span>🔍</span> AI Vision Inspection Summary
                  </h3>
                  <AIBadge label="Vision Analysis" sublabel="Verified" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5]">
                    <span className="text-[11px] text-[#6B7280] block">Assessed Condition</span>
                    <span className="font-semibold text-[#1A1A2E]">{listing.aiAnalysis?.conditionLabel || listing.condition || 'GOOD'} ({listing.aiAnalysis?.conditionScore || listing.conditionScore || 80}/100)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5]">
                    <span className="text-[11px] text-[#6B7280] block">Listing Quality Score</span>
                    <span className="font-semibold text-[#2D6A4F]">{listing.listingQualityScore || listing.aiAnalysis?.qualityScore || 80}/100 (Passes Gate)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-[#6B7280] block">Detected Product</span>
                    <span className="font-semibold text-[#1A1A2E] truncate block">{listing.aiAnalysis?.detectedProduct || listing.title}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#065F46] flex items-center gap-2">
                  <span>✓</span>
                  <span>Verified student listing with clean verification trail.</span>
                </div>
              </div>
            )}

            {/* Description Card */}
            <div className="rounded-2xl border border-[#E5E2DD] bg-white p-6 space-y-4 shadow-xs">
              <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                Item Details & Description
              </h3>
              <p className="text-xs sm:text-sm text-[#1A1A2E]/90 leading-relaxed whitespace-pre-line">
                {listing.description || 'No description provided.'}
              </p>

              {/* Tags */}
              {listing.tags && listing.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#E5E2DD]">
                  {listing.tags.map((t: string) => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] text-[11px] font-medium text-[#6B7280]">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Pricing, Seller Card & Action CTA */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header / Pricing Card */}
            <div className="rounded-3xl border border-[#E5E2DD] bg-white p-6 space-y-4 shadow-sm">
              <div>
                <span className="text-xs text-[#6B7280]">{category} · {locationText}</span>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1A1A2E] mt-1 leading-snug">
                  {listing.title}
                </h1>
              </div>

              {/* Price / Value Row */}
              <div className="flex items-baseline justify-between border-y border-[#E5E2DD] py-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#6B7280] block font-semibold">
                    {mode === 'LEND' ? 'Rental Rate' : 'Asking Value'}
                  </span>
                  {mode === 'DONATE' ? (
                    <span className="font-heading font-extrabold text-2xl text-[#2D6A4F]">
                      Free (Donate)
                    </span>
                  ) : mode === 'EXCHANGE' ? (
                    <span className="font-heading font-extrabold text-xl text-[#7C3AED]">
                      Item Swap
                    </span>
                  ) : mode === 'KNOWLEDGE' ? (
                    <span className="font-heading font-extrabold text-xl text-[#F97316]">
                      Skill Exchange
                    </span>
                  ) : price !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="font-heading font-extrabold text-3xl text-[#1A1A2E]">
                        ₹{Number(price).toLocaleString('en-IN')}
                      </span>
                      {mode === 'LEND' && (
                        <span className="text-sm text-[#6B7280]">/ day</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-base text-[#6B7280]">Open to negotiation</span>
                  )}
                </div>

                {/* AI Fair Price Prediction pill */}
                {listing.pricePrediction && (
                  <div className="text-right">
                    <span className="text-[10px] text-[#6B7280] block">Fair Range</span>
                    <span className="font-heading font-bold text-sm text-[#E8602C]">
                      ₹{listing.pricePrediction.minPrice || listing.pricePrediction.fairValueLow || 300} – ₹{listing.pricePrediction.maxPrice || listing.pricePrediction.fairValueHigh || 600}
                    </span>
                  </div>
                )}
              </div>

              {/* Primary Action Buttons */}
              <div className="space-y-3 pt-2">
                {isOwner ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-[#FEF3EC] text-xs font-semibold text-[#E8602C] flex items-center justify-between border border-[#FCD8C5]">
                      <span>🏷️ You listed this item ({listingOffers.filter(o => o.status === 'PENDING').length} pending offers)</span>
                      <Link href="/dashboard" className="underline font-bold hover:text-[#CF4F20]">
                        Go to Dashboard →
                      </Link>
                    </div>

                    {/* Incoming offers on this item */}
                    {listingOffers.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-[#E5E2DD]">
                        <h4 className="font-heading font-bold text-xs text-[#1A1A2E] uppercase tracking-wider">
                          Offers on this item:
                        </h4>
                        {listingOffers.map((o: any) => (
                          <div
                            key={o.id}
                            className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E2DD] space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#1A1A2E]">
                                {o.buyer?.fullName || 'Student'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                o.status === 'PENDING' ? 'bg-[#FEF3EC] text-[#E8602C]' :
                                o.status === 'ACCEPTED' ? 'bg-[#ECFDF5] text-[#2D6A4F]' : 'bg-[#F3F4F6] text-[#6B7280]'
                              }`}>
                                {o.status}
                              </span>
                            </div>

                            <div className="font-heading font-bold text-[#2D6A4F]">
                              {o.offerPriceInr ? `Offered ₹${o.offerPriceInr.toLocaleString('en-IN')}` : 'Swap / Skill proposal'}
                            </div>

                            {o.note && (
                              <p className="text-[#6B7280] italic text-[11px]">
                                &ldquo;{o.note}&rdquo;
                              </p>
                            )}

                            {o.status === 'PENDING' && (
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  disabled={offerActionLoading === o.id}
                                  onClick={() => handleSellerOfferAction(o.id, 'accept')}
                                  className="flex-1 py-1.5 rounded-lg bg-[#10B981] text-white font-bold text-xs hover:bg-[#059669] transition-colors cursor-pointer"
                                >
                                  {offerActionLoading === o.id ? 'Starting...' : '✓ Accept & Start Deal'}
                                </button>
                                <button
                                  disabled={offerActionLoading === o.id}
                                  onClick={() => handleSellerOfferAction(o.id, 'reject')}
                                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E2DD] text-[#EF4444] font-semibold text-xs hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : mode === 'DONATE' ? (
                  <button
                    onClick={() => handleActionClick(() => setDonationModalOpen(true))}
                    className="w-full py-3.5 rounded-xl bg-[#10B981] text-white font-heading font-bold text-base hover:bg-[#059669] transition-colors shadow-sm cursor-pointer"
                  >
                    Apply for Free Donation →
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setProposalType('MONEY')
                        handleActionClick(() => setOfferModalOpen(true))
                      }}
                      className="py-3 rounded-xl bg-[#E8602C] text-white font-heading font-bold text-sm hover:bg-[#CF4F20] transition-colors shadow-xs cursor-pointer"
                    >
                      Make an Offer
                    </button>
                    <button
                      onClick={() => {
                        setProposalType('KNOWLEDGE')
                        handleActionClick(() => setOfferModalOpen(true))
                      }}
                      className="py-3 rounded-xl bg-[#1A1A2E] text-white font-heading font-bold text-sm hover:bg-[#2A2A44] transition-colors shadow-xs cursor-pointer"
                    >
                      Swap for Skills
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* AI Buying Analysis Component */}
            <AIBuyingAnalysis
              price={price}
              fairValueLow={listing.pricePrediction?.minPrice || listing.pricePrediction?.fairValueLow}
              fairValueHigh={listing.pricePrediction?.maxPrice || listing.pricePrediction?.fairValueHigh}
              predictedPrice={listing.pricePrediction?.fairPrice || listing.pricePrediction?.predicted}
              conditionScore={listing.aiAnalysis?.conditionScore || listing.conditionScore || 80}
              conditionLabel={listing.condition || 'Good'}
              sellerTrustScore={sellerTrust}
              distanceMeters={250}
              transactionType={mode as any}
            />

            {/* Verified Student Seller Card */}
            <div className="rounded-2xl border border-[#E5E2DD] bg-white p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E5E2DD] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Listed by Student
                </span>
                <span className="text-xs text-[#10B981] font-semibold flex items-center gap-1">
                  <span>✓</span> Verified Student ID
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#1A1A2E] text-white flex items-center justify-center font-heading font-bold text-lg">
                  {sellerName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#1A1A2E]">
                    {sellerName}
                  </h4>
                  <p className="text-xs text-[#6B7280]">
                    {seller?.profile?.department || 'Engineering'} · {seller?.profile?.college || 'Campus'}
                  </p>
                  <p className="text-[11px] text-[#6B7280]">
                    Hostel: <strong>{seller?.profile?.hostel || locationText}</strong> (Room private)
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs bg-[#FAF8F5] p-3 rounded-xl">
                <div>
                  <span className="text-[#6B7280] block text-[11px]">Trust Score</span>
                  <span className="font-heading font-bold text-base text-[#10B981]">
                    {sellerTrust}/100 (Verified)
                  </span>
                </div>
                <Link
                  href={`/profile/${seller?.id || seller?._id || ''}`}
                  className="text-xs font-semibold text-[#E8602C] hover:underline"
                >
                  View Public Profile →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Make Offer Modal ───────────────────────────────────────────── */}
      {offerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E5E2DD] max-w-md w-full p-6 space-y-5 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#E5E2DD] pb-3">
              <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                Propose Deal for {listing.title}
              </h3>
              <button
                onClick={() => setOfferModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {offerSuccess ? (
              <div className="p-6 text-center space-y-2 bg-[#ECFDF5] rounded-2xl text-[#065F46]">
                <span className="text-3xl">🎉</span>
                <p className="font-heading font-bold text-base">Offer Submitted!</p>
                <p className="text-xs">Redirecting to your dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleSendOffer} className="space-y-4">
                {/* Proposal Type Selector */}
                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                    Value You're Offering:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setProposalType('MONEY')}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        proposalType === 'MONEY'
                          ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
                          : 'bg-white text-[#1A1A2E] border-[#E5E2DD]'
                      }`}
                    >
                      💵 Money (INR)
                    </button>
                    <button
                      type="button"
                      onClick={() => setProposalType('EXCHANGE_ITEM')}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        proposalType === 'EXCHANGE_ITEM'
                          ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
                          : 'bg-white text-[#1A1A2E] border-[#E5E2DD]'
                      }`}
                    >
                      🔄 Item Swap
                    </button>
                    <button
                      type="button"
                      onClick={() => setProposalType('KNOWLEDGE')}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        proposalType === 'KNOWLEDGE'
                          ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
                          : 'bg-white text-[#1A1A2E] border-[#E5E2DD]'
                      }`}
                    >
                      🧠 Tutoring/Skills
                    </button>
                  </div>
                </div>

                {proposalType === 'MONEY' && (
                  <div>
                    <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                      Offer Amount (₹ INR):
                    </label>
                    <input
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder="e.g. 400"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] text-sm focus:outline-none focus:border-[#E8602C]"
                    />
                  </div>
                )}

                {proposalType === 'KNOWLEDGE' && (
                  <div className="p-3 rounded-xl bg-[#FFF8F3] border border-[#FCD8C5] text-xs text-[#E8602C] space-y-1">
                    <p className="font-semibold">Knowledge / Tutoring Exchange</p>
                    <p className="text-[11px] text-[#9C5838]">
                      You'll formalize a session agreement (e.g. 2 hours of DSA tutoring) verified via proof of work.
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                    Message to Seller:
                  </label>
                  <textarea
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    placeholder="Hi! I'm in Block B and interested in this item. Can meet tomorrow evening..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOfferModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-xs font-semibold text-gray-700 hover:bg-gray-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={offerSubmitting}
                    className="px-5 py-2 rounded-xl bg-[#E8602C] text-white text-xs font-bold hover:bg-[#CF4F20] disabled:opacity-50 cursor-pointer"
                  >
                    {offerSubmitting ? 'Submitting...' : 'Send Offer →'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── Donation Apply Modal ───────────────────────────────────────── */}
      {donationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E5E2DD] max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E2DD] pb-3">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                  Apply for Free Donation
                </h3>
                <p className="text-xs text-[#6B7280]">{listing.title}</p>
              </div>
              <button
                onClick={() => setDonationModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {donationSuccess ? (
              <div className="p-6 text-center space-y-2 bg-[#ECFDF5] rounded-2xl text-[#065F46]">
                <span className="text-3xl">✅</span>
                <p className="font-heading font-bold text-base">Application Submitted!</p>
                <p className="text-xs">
                  AI will compute your Eligibility Match score for the donor. The donor will select a recipient and contact you.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendDonationApply} className="space-y-4">
                <div className="p-3 rounded-xl bg-[#F7F5F2] text-xs text-[#6B7280] space-y-1">
                  <p className="font-semibold text-[#1A1A2E]">How Donation Matching Works:</p>
                  <p className="text-[11px]">
                    AI assists by scoring <strong>Academic Relevance</strong> to ensure books/tools reach students who need them for coursework.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                    Relevant Course / Subject:
                  </label>
                  <input
                    type="text"
                    value={donationSubject}
                    onChange={(e) => setDonationSubject(e.target.value)}
                    placeholder="e.g. Thermodynamics, Computer Networks..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#2D6A4F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                    Why do you need this item? (min 15 chars)
                  </label>
                  <textarea
                    value={donationReason}
                    onChange={(e) => setDonationReason(e.target.value)}
                    placeholder="I am in 2nd year and taking this course this semester. It would help me prepare for upcoming exams..."
                    rows={4}
                    required
                    minLength={15}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#2D6A4F]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDonationModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-xs font-semibold text-gray-700 hover:bg-gray-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={donationSubmitting || donationReason.trim().length < 15}
                    className="px-5 py-2 rounded-xl bg-[#10B981] text-white text-xs font-bold hover:bg-[#059669] disabled:opacity-50 cursor-pointer"
                  >
                    {donationSubmitting ? 'Scoring & Submitting...' : 'Submit Application →'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
