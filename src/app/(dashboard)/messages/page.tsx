'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'

export default function MessagesPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [threads, setThreads] = useState<any[]>([])
  const [receivedOffers, setReceivedOffers] = useState<any[]>([])
  const [sentOffers, setSentOffers] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'ALL' | 'OFFERS' | 'DEALS' | 'SENT'>('ALL')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const [meRes, msgRes] = await Promise.all([
        fetch('/api/users/me'),
        fetch('/api/messages'),
      ])

      if (!meRes.ok) {
        router.push('/login?redirect=/messages')
        return
      }

      const me = await meRes.json()
      setCurrentUser(me)

      if (msgRes.ok) {
        const data = await msgRes.json()
        setThreads(data.threads || [])
        setReceivedOffers(data.receivedOffers || [])
        setSentOffers(data.sentOffers || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 4000)
    return () => clearInterval(interval)
  }, [])

  // Accept an incoming offer and immediately jump into the transaction chat room
  const handleAcceptOffer = async (offerId: string) => {
    setActionLoading(offerId)
    try {
      const res = await fetch(`/api/offers/${offerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      })
      const data = await res.json()
      if (res.ok && data.transactionId) {
        router.push(`/transactions/${data.transactionId}`)
      } else {
        loadData()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  // Decline an offer
  const handleDeclineOffer = async (offerId: string) => {
    setActionLoading(offerId)
    try {
      await fetch(`/api/offers/${offerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      })
      loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredItems = () => {
    if (activeTab === 'OFFERS') return receivedOffers
    if (activeTab === 'DEALS') return threads.filter(t => t.type === 'TRANSACTION')
    if (activeTab === 'SENT') return sentOffers
    return threads
  }

  const itemsToDisplay = filteredItems()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full space-y-4" style={{ paddingTop: '90px' }}>
          <div className="h-16 skeleton rounded-2xl" />
          <div className="h-48 skeleton rounded-3xl" />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6" style={{ paddingTop: '90px' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1A1A2E]">
              Campus Messages & Deals
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280]">
              Review incoming student proposals, coordinate meetup spots, and complete OTP handovers.
            </p>
          </div>

          <Link
            href="/explore"
            className="px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E5E2DD] text-xs font-bold text-[#1A1A2E] hover:bg-[#EFECE6] transition-colors self-start sm:self-auto"
          >
            Explore Marketplace
          </Link>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E5E2DD]">
          {[
            { id: 'ALL', label: `All Conversations (${threads.length})` },
            { id: 'OFFERS', label: `Received Proposals (${receivedOffers.length})` },
            { id: 'DEALS', label: `Active Deals (${threads.filter(t => t.type === 'TRANSACTION').length})` },
            { id: 'SENT', label: `Sent Proposals (${sentOffers.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 text-xs font-bold whitespace-nowrap rounded-t-xl transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'text-[#E8602C] border-b-2 border-[#E8602C] bg-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#1A1A2E]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Received Offers Action Alert Center */}
        {receivedOffers.length > 0 && activeTab !== 'DEALS' && activeTab !== 'SENT' && (
          <div className="rounded-3xl border border-[#FCD8C5] bg-[#FFF8F3] p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎁</span>
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#1A1A2E]">
                    Action Needed: {receivedOffers.length} Proposal{receivedOffers.length > 1 ? 's' : ''} Received on Your Listings
                  </h3>
                  <p className="text-[11px] text-[#9C5838]">
                    Accept to open the deal handover room and chat with the student.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#E8602C] text-white">
                {receivedOffers.length} PENDING
              </span>
            </div>

            <div className="space-y-3">
              {receivedOffers.map((o) => (
                <div
                  key={o.id}
                  className="p-4 rounded-2xl bg-white border border-[#FCD8C5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-bold text-xs text-[#1A1A2E]">
                        {o.buyer?.fullName || 'Student'}
                      </span>
                      <span className="text-[10px] font-semibold text-[#2D6A4F] bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                        Trust {o.buyer?.trustScore ?? 80}/100
                      </span>
                      <span className="text-[11px] text-[#6B7280]">
                        for <strong>"{o.listing?.title || 'Your Item'}"</strong>
                      </span>
                    </div>

                    <p className="text-xs text-[#1A1A2E] bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E5E2DD] italic">
                      "{o.note || (o.offerPriceInr ? `Offered ₹${o.offerPriceInr}` : 'Proposed to exchange/trade')}"
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF]">
                      <span>{o.buyer?.hostel ? `${o.buyer.hostel} · ${o.buyer.block || ''}` : 'Campus Hostel'}</span>
                      <span>·</span>
                      <span>{o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAcceptOffer(o.id)}
                      disabled={actionLoading === o.id}
                      className="px-4 py-2 rounded-xl bg-[#2D6A4F] text-white font-heading font-bold text-xs hover:bg-[#23533E] transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {actionLoading === o.id ? 'Starting Deal...' : '✓ Accept & Start Deal'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeclineOffer(o.id)}
                      disabled={actionLoading === o.id}
                      className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E5E2DD] text-[#DC2626] font-bold text-xs hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unified Messages and Conversations List */}
        {itemsToDisplay.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-dashed border-[#E5E2DD] text-center space-y-3">
            <span className="text-4xl block">💬</span>
            <h3 className="font-heading font-bold text-base text-[#1A1A2E]">No Messages or Deals Yet</h3>
            <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
              {activeTab === 'OFFERS'
                ? 'No pending proposals received on your listings at the moment.'
                : activeTab === 'DEALS'
                ? 'No active handover deals in progress right now.'
                : 'Make an offer on a marketplace item or post a listing to start trading.'}
            </p>
            <Link
              href="/explore"
              className="inline-block px-5 py-2.5 rounded-xl bg-[#E8602C] text-white text-xs font-bold hover:bg-[#CF4F20] shadow-xs"
            >
              Explore Marketplace →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {itemsToDisplay.map((t) => {
              if (t.type === 'OFFER') {
                return (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl bg-white border border-[#E5E2DD] hover:border-[#E8602C] transition-all shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E8602C] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {t.isSeller ? (t.buyer?.fullName?.charAt(0) || 'S') : '🎁'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading font-bold text-sm text-[#1A1A2E]">
                              {t.isSeller ? (t.buyer?.fullName || 'Student') : `Your Offer on "${t.listing?.title || 'Item'}"`}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3EC] text-[#E8602C]">
                              PROPOSAL
                            </span>
                          </div>
                          <p className="text-xs text-[#6B7280] line-clamp-1 mt-0.5">
                            {t.lastMessage}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {t.isSeller && t.status === 'PENDING' ? (
                          <button
                            type="button"
                            onClick={() => handleAcceptOffer(t.id)}
                            disabled={actionLoading === t.id}
                            className="px-3.5 py-1.5 rounded-lg bg-[#2D6A4F] text-white font-bold text-xs hover:bg-[#23533E] cursor-pointer"
                          >
                            {actionLoading === t.id ? 'Starting...' : 'Accept & Chat'}
                          </button>
                        ) : t.listing?.id ? (
                          <Link
                            href={`/products/${t.listing.id}`}
                            className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E5E2DD] text-xs font-semibold text-[#1A1A2E] hover:bg-[#EFECE6]"
                          >
                            View Item
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              }

              // Transaction Thread
              const isPartyA = (t.partyAId || t.sellerId) === currentUser?.id
              const other = isPartyA ? (t.partyB || t.buyer) : (t.partyA || t.seller)
              const lastMsg = t.lastMessage || t.messages?.[0]?.content

              return (
                <Link
                  key={t.id}
                  href={`/transactions/${t.id}`}
                  className="block p-5 rounded-2xl bg-white border border-[#E5E2DD] hover:border-[#E8602C] hover:shadow-xs transition-all text-decoration-none group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#1A1A2E] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 group-hover:bg-[#E8602C] transition-colors">
                        {other?.profile?.fullName?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading font-bold text-sm text-[#1A1A2E]">
                            {other?.profile?.fullName || 'Student'}
                          </h4>
                          {t.listing?.title && (
                            <span className="text-xs text-[#6B7280]">
                              · {t.listing.title}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#6B7280] line-clamp-1 mt-0.5">
                          {lastMsg || 'Chat room active. Click to arrange handover.'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        t.status === 'COMPLETED'
                          ? 'bg-[#ECFDF5] text-[#2D6A4F]'
                          : 'bg-[#FEF3EC] text-[#E8602C]'
                      }`}>
                        {(t.status || 'ACTIVE').replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
