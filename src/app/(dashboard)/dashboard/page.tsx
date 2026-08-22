'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { ProductCard } from '@/components/marketplace/ProductCard'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [myListings, setMyListings] = useState<any[]>([])
  const [receivedOffers, setReceivedOffers] = useState<any[]>([])
  const [sentOffers, setSentOffers] = useState<any[]>([])
  const [activeTransactions, setActiveTransactions] = useState<any[]>([])
  const [processingOfferId, setProcessingOfferId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'offers' | 'listings' | 'transactions' | 'sent_offers'>('offers')

  const loadDashboard = async () => {
    try {
      const userRes = await fetch('/api/users/me')
      if (!userRes.ok) {
        router.push('/login?redirect=/dashboard')
        return
      }
      const userData = await userRes.json()
      setUser(userData)

      // Fetch seller's own listings
      const prodRes = await fetch('/api/products?mine=true')
      if (prodRes.ok) {
        const prodData = await prodRes.json()
        setMyListings(prodData.listings || [])
      }

      // Fetch offers (both received on seller listings & sent by user)
      const offersRes = await fetch('/api/offers')
      if (offersRes.ok) {
        const offersData = await offersRes.json()
        setReceivedOffers(offersData.receivedOffers || offersData.offers?.filter((o: any) => o.isSeller) || [])
        setSentOffers(offersData.sentOffers || offersData.offers?.filter((o: any) => !o.isSeller) || [])
      }

      // Fetch user message threads / active transactions
      const msgRes = await fetch('/api/messages')
      if (msgRes.ok) {
        const msgData = await msgRes.json()
        setActiveTransactions(msgData.threads || [])
      }
    } catch (err) {
      console.error('[loadDashboard error]', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
    const interval = setInterval(loadDashboard, 10000)
    return () => clearInterval(interval)
  }, [router])

  // Handle Offer Accept / Reject
  const handleOfferAction = async (offerId: string, action: 'accept' | 'reject') => {
    setProcessingOfferId(offerId)
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
        await loadDashboard()
      } else {
        alert(data.error || 'Failed to update offer')
      }
    } catch (err) {
      console.error(err)
      alert('Error updating offer')
    } finally {
      setProcessingOfferId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full space-y-6" style={{ paddingTop: '80px' }}>
          <div className="h-28 skeleton rounded-3xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-24 skeleton rounded-2xl" />
            <div className="h-24 skeleton rounded-2xl" />
            <div className="h-24 skeleton rounded-2xl" />
            <div className="h-24 skeleton rounded-2xl" />
          </div>
          <div className="h-64 skeleton rounded-3xl" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) return null

  const trustScore = typeof user.trustScore === 'number' ? user.trustScore : user.trustScore?.score ?? 50
  const pendingReceived = receivedOffers.filter(o => o.status === 'PENDING')

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8" style={{ paddingTop: '80px' }}>
        {/* Welcome Greeting Banner */}
        <div className="rounded-3xl bg-white border border-[#E5E2DD] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#2D6A4F] mb-2">
              <span>✓</span> Verified Student · {user.profile?.college || 'Campus'}
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1A1A2E]">
              Welcome back, {user.profile?.fullName || 'Student'}!
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
              Hostel: <strong>{user.profile?.hostel || 'Hostel'}</strong> {user.profile?.block ? `(${user.profile.block})` : ''} · Department: <strong>{user.profile?.department || 'General'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/listings/new"
              className="px-5 py-3 rounded-xl bg-[#E8602C] text-white font-heading font-bold text-xs hover:bg-[#CF4F20] transition-colors shadow-xs"
            >
              + List New Item
            </Link>
            <Link
              href={`/profile/${user.id}`}
              className="px-4 py-3 rounded-xl bg-[#FAF8F5] text-[#1A1A2E] border border-[#E5E2DD] text-xs font-semibold hover:bg-[#EFECE6] transition-colors"
            >
              My Profile
            </Link>
          </div>
        </div>

        {/* 4 Stat Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Trust Score */}
          <div className="p-5 rounded-2xl bg-white border border-[#E5E2DD] shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
              Trust Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading font-extrabold text-2xl text-[#2D6A4F]">
                {trustScore}
              </span>
              <span className="text-xs text-[#6B7280]">/100</span>
            </div>
            <p className="text-[11px] text-[#2D6A4F] font-medium">
              {trustScore >= 80 ? 'Verified & Trusted' : trustScore >= 60 ? 'Good Standing' : 'Building Trust'}
            </p>
          </div>

          {/* Card 2: Pending Offers on Your Items */}
          <div
            onClick={() => setActiveTab('offers')}
            className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs space-y-1 ${
              pendingReceived.length > 0 ? 'border-[#E8602C] ring-2 ring-[#E8602C]/20 bg-[#FFFDFB]' : 'border-[#E5E2DD]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                Incoming Offers
              </span>
              {pendingReceived.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#E8602C] text-white text-[10px] font-bold animate-pulse">
                  {pendingReceived.length} Action Needed
                </span>
              )}
            </div>
            <span className="font-heading font-extrabold text-2xl text-[#E8602C]">
              {pendingReceived.length}
            </span>
            <p className="text-[11px] text-[#6B7280]">
              {pendingReceived.length === 1 ? '1 student waiting for reply' : `${pendingReceived.length} students waiting for reply`}
            </p>
          </div>

          {/* Card 3: Active Transactions */}
          <div
            onClick={() => setActiveTab('transactions')}
            className="p-5 rounded-2xl bg-white border border-[#E5E2DD] shadow-xs space-y-1 cursor-pointer hover:border-[#1A1A2E] transition-all"
          >
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
              Active Deals
            </span>
            <span className="font-heading font-extrabold text-2xl text-[#1A1A2E]">
              {activeTransactions.length}
            </span>
            <p className="text-[11px] text-[#6B7280]">
              Ongoing chats / OTP handovers
            </p>
          </div>

          {/* Card 4: My Listed Items */}
          <div
            onClick={() => setActiveTab('listings')}
            className="p-5 rounded-2xl bg-white border border-[#E5E2DD] shadow-xs space-y-1 cursor-pointer hover:border-[#7C3AED] transition-all"
          >
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
              My Posted Listings
            </span>
            <span className="font-heading font-extrabold text-2xl text-[#7C3AED]">
              {myListings.length}
            </span>
            <p className="text-[11px] text-[#6B7280]">
              Active items in campus catalog
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E5E2DD] gap-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('offers')}
            className={`pb-3 px-2 font-heading font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'offers'
                ? 'border-[#E8602C] text-[#E8602C]'
                : 'border-transparent text-[#6B7280] hover:text-[#1A1A2E]'
            }`}
          >
            <span>🎁 Received Offers</span>
            {pendingReceived.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#E8602C] text-white text-[11px] font-bold">
                {pendingReceived.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3 px-2 font-heading font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'listings'
                ? 'border-[#E8602C] text-[#E8602C]'
                : 'border-transparent text-[#6B7280] hover:text-[#1A1A2E]'
            }`}
          >
            <span>📦 My Posted Items ({myListings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 px-2 font-heading font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'transactions'
                ? 'border-[#E8602C] text-[#E8602C]'
                : 'border-transparent text-[#6B7280] hover:text-[#1A1A2E]'
            }`}
          >
            <span>🤝 Active Deals & Handovers ({activeTransactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sent_offers')}
            className={`pb-3 px-2 font-heading font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'sent_offers'
                ? 'border-[#E8602C] text-[#E8602C]'
                : 'border-transparent text-[#6B7280] hover:text-[#1A1A2E]'
            }`}
          >
            <span>📤 Offers Sent by Me ({sentOffers.length})</span>
          </button>
        </div>

        {/* Tab 1: Received Offers (Action Center for Seller) */}
        {activeTab === 'offers' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-xl text-[#1A1A2E]">
                  Offers Received from Students
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Review cash offers, barter swaps, and knowledge exchange requests on your posted items.
                </p>
              </div>
            </div>

            {receivedOffers.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-dashed border-[#E5E2DD] text-center space-y-3">
                <span className="text-4xl">📬</span>
                <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                  No Offers Received Yet
                </h3>
                <p className="text-xs text-[#6B7280] max-w-md mx-auto">
                  When other hostel students make an offer or propose a swap on your items, they will appear right here with one-click Accept & Chat actions.
                </p>
                <div className="pt-2">
                  <Link
                    href="/listings/new"
                    className="inline-block px-5 py-2.5 rounded-xl bg-[#E8602C] text-white text-xs font-semibold hover:bg-[#CF4F20] transition-colors"
                  >
                    + Post Another Item
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedOffers.map((offer) => {
                  const isPending = offer.status === 'PENDING'
                  const isAccepted = offer.status === 'ACCEPTED'

                  return (
                    <div
                      key={offer.id}
                      className={`p-6 rounded-2xl bg-white border transition-all shadow-xs space-y-4 ${
                        isPending ? 'border-[#E8602C]/40 bg-[#FFFDFB] ring-1 ring-[#E8602C]/10' : 'border-[#E5E2DD]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E2DD] pb-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-[#1A1A2E] text-white flex items-center justify-center font-heading font-bold text-base flex-shrink-0">
                            {offer.buyer?.fullName?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-heading font-bold text-sm text-[#1A1A2E]">
                                {offer.buyer?.fullName || 'Student Buyer'}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#2D6A4F]">
                                Trust {offer.buyer?.trustScore || 80}/100
                              </span>
                            </div>
                            <p className="text-xs text-[#6B7280]">
                              {offer.buyer?.hostel ? `Hostel ${offer.buyer.hostel} ${offer.buyer.block || ''}` : 'Campus Hostel'} · {offer.buyer?.college || 'Verified Student'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            isPending ? 'bg-[#FEF3EC] text-[#E8602C] border border-[#FCD8C5]' :
                            isAccepted ? 'bg-[#ECFDF5] text-[#2D6A4F]' : 'bg-[#F3F4F6] text-[#6B7280]'
                          }`}>
                            {offer.status}
                          </span>
                          <span className="text-[11px] text-[#6B7280]">
                            {new Date(offer.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Offer Details */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-7 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                            <span>Listing:</span>
                            <Link
                              href={`/products/${offer.listingId}`}
                              className="font-semibold text-[#1A1A2E] hover:text-[#E8602C] hover:underline"
                            >
                              {offer.listing?.title || 'Campus Item'}
                            </Link>
                            <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[10px] font-bold">
                              {offer.listing?.mode || 'SELL'}
                            </span>
                          </div>

                          {offer.offerPriceInr ? (
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs text-[#6B7280]">Offered Price:</span>
                              <span className="font-heading font-extrabold text-2xl text-[#2D6A4F]">
                                ₹{offer.offerPriceInr.toLocaleString('en-IN')}
                              </span>
                              {offer.listing?.priceInr && (
                                <span className="text-xs text-[#6B7280] line-through">
                                  (Listed at ₹{offer.listing.priceInr.toLocaleString('en-IN')})
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm font-semibold text-[#7C3AED]">
                              Barter / Skill Exchange Proposal
                            </div>
                          )}

                          {offer.note && (
                            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5E2DD] text-xs text-[#1A1A2E] italic">
                              &ldquo;{offer.note}&rdquo;
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="md:col-span-5 flex flex-wrap sm:flex-nowrap items-center justify-end gap-2.5">
                          {isPending ? (
                            <>
                              <button
                                disabled={processingOfferId === offer.id}
                                onClick={() => handleOfferAction(offer.id, 'accept')}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#10B981] text-white font-heading font-bold text-xs hover:bg-[#059669] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                {processingOfferId === offer.id ? 'Processing...' : '✓ Accept & Start Deal'}
                              </button>
                              <button
                                disabled={processingOfferId === offer.id}
                                onClick={() => handleOfferAction(offer.id, 'reject')}
                                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-[#E5E2DD] text-[#EF4444] font-semibold text-xs hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                              >
                                Decline
                              </button>
                            </>
                          ) : isAccepted ? (
                            <Link
                              href="/messages"
                              className="px-4 py-2.5 rounded-xl bg-[#1A1A2E] text-white font-heading font-bold text-xs hover:bg-[#E8602C] transition-colors"
                            >
                              💬 Open Live Chat & OTP →
                            </Link>
                          ) : (
                            <span className="text-xs text-[#9CA3AF]">Offer Declined</span>
                          )}

                          <Link
                            href={`/products/${offer.listingId}`}
                            className="px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] text-[#6B7280] hover:text-[#1A1A2E] text-xs font-semibold transition-colors"
                          >
                            View Item
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* Tab 2: My Posted Items */}
        {activeTab === 'listings' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-xl text-[#1A1A2E]">
                  My Listed Items ({myListings.length})
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Manage items you are currently selling, lending, or giving away.
                </p>
              </div>
              <Link
                href="/listings/new"
                className="px-4 py-2 rounded-xl bg-[#E8602C] text-white text-xs font-bold hover:bg-[#CF4F20] transition-colors"
              >
                + Post New Item
              </Link>
            </div>

            {myListings.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-dashed border-[#E5E2DD] text-center space-y-3">
                <span className="text-3xl">📦</span>
                <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                  You haven't listed any items yet
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Post study notes, electronics, cycle, or hostel essentials in 60 seconds with AI analysis.
                </p>
                <Link
                  href="/listings/new"
                  className="inline-block px-5 py-2.5 rounded-xl bg-[#E8602C] text-white text-xs font-bold"
                >
                  Create Listing →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map((item) => (
                  <div key={item.id} className="relative group">
                    <ProductCard
                      id={item.id}
                      title={item.title}
                      category={item.category}
                      price={item.price}
                      transactionType={item.transactionType}
                      condition={item.condition}
                      location={item.location}
                      distanceMeters={item.distanceMeters}
                      images={item.images}
                      owner={item.owner}
                      aiAnalysis={item.aiAnalysis}
                      pricePrediction={item.pricePrediction}
                    />
                    <div className="mt-2 flex items-center justify-between px-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === 'PUBLISHED' ? 'bg-[#ECFDF5] text-[#2D6A4F]' :
                        item.status === 'IN_TRANSACTION' ? 'bg-[#FEF3EC] text-[#E8602C]' : 'bg-[#FAF8F5] text-[#6B7280]'
                      }`}>
                        {item.status?.replace('_', ' ') || 'ACTIVE'}
                      </span>
                      <Link
                        href={`/products/${item.id}`}
                        className="text-xs font-semibold text-[#E8602C] hover:underline"
                      >
                        View Public Page →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Tab 3: Active Transactions & Handovers */}
        {activeTab === 'transactions' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-xl text-[#1A1A2E]">
                  Active Deals & 2-Step Handovers
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Track accepted deals, chat with buyers/sellers, and verify handovers via 6-digit OTP.
                </p>
              </div>
              <Link
                href="/messages"
                className="text-xs font-semibold text-[#E8602C] hover:underline"
              >
                Open Full Messenger →
              </Link>
            </div>

            {activeTransactions.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-dashed border-[#E5E2DD] text-center space-y-3">
                <span className="text-3xl">🤝</span>
                <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                  No active transactions yet
                </h3>
                <p className="text-xs text-[#6B7280]">
                  When an offer is accepted by either party, the transaction and OTP verification room will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTransactions.map((tx) => {
                  const isSeller = tx.partyAId === user.id
                  const otherParty = isSeller ? tx.partyB : tx.partyA

                  return (
                    <div
                      key={tx.id}
                      className="p-5 rounded-2xl bg-white border border-[#E5E2DD] shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#1A1A2E] flex items-center gap-2">
                          <span>📦</span> Deal #{tx.id.slice(-6)}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          tx.status === 'OTP_GENERATED' ? 'bg-[#FEF3EC] text-[#E8602C] border border-[#FCD8C5]' :
                          tx.status === 'COMPLETED' ? 'bg-[#ECFDF5] text-[#2D6A4F]' : 'bg-[#FAF8F5] text-[#1A1A2E]'
                        }`}>
                          {tx.status?.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-xs text-[#1A1A2E]">
                        <strong>{tx.listing?.title || 'Campus Item'}</strong>
                        <p className="text-[11px] text-[#6B7280] mt-0.5">
                          With <strong>{otherParty?.profile?.fullName || 'Student'}</strong> ({isSeller ? 'Buyer' : 'Seller'})
                        </p>
                      </div>

                      {tx.lastMessage && (
                        <p className="text-xs text-[#6B7280] line-clamp-1 italic bg-[#FAF8F5] p-2 rounded-lg">
                          &ldquo;{tx.lastMessage}&rdquo;
                        </p>
                      )}

                      <div className="pt-2 flex items-center justify-between border-t border-[#E5E2DD]">
                        <Link
                          href={`/transactions/${tx.id}`}
                          className="px-4 py-2 rounded-xl bg-[#1A1A2E] text-white text-xs font-semibold hover:bg-[#E8602C] transition-colors"
                        >
                          {tx.status === 'OTP_GENERATED' ? '🔑 View / Enter OTP →' : 'Chat & Handover Details →'}
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* Tab 4: Offers Sent by Me */}
        {activeTab === 'sent_offers' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-xl text-[#1A1A2E]">
                  Offers You Sent to Other Students
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Track proposals you made on items listed across campus.
                </p>
              </div>
            </div>

            {sentOffers.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-dashed border-[#E5E2DD] text-center space-y-3">
                <span className="text-3xl">📤</span>
                <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                  You haven't made any offers yet
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Browse items listed in your hostel or across campus to make cash or swap offers.
                </p>
                <Link
                  href="/explore"
                  className="inline-block px-5 py-2.5 rounded-xl bg-[#E8602C] text-white text-xs font-bold"
                >
                  Explore Marketplace →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {sentOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-5 rounded-2xl bg-white border border-[#E5E2DD] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${offer.listingId}`}
                          className="font-heading font-bold text-sm text-[#1A1A2E] hover:text-[#E8602C] hover:underline"
                        >
                          {offer.listing?.title || 'Campus Item'}
                        </Link>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF8F5]">
                          {offer.listing?.mode || 'SELL'}
                        </span>
                      </div>
                      <p className="text-xs text-[#2D6A4F] font-bold">
                        Your Offer: {offer.offerPriceInr ? `₹${offer.offerPriceInr.toLocaleString('en-IN')}` : 'Swap / Skill proposal'}
                      </p>
                      {offer.note && (
                        <p className="text-[11px] text-[#6B7280] italic">
                          &ldquo;{offer.note}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        offer.status === 'PENDING' ? 'bg-[#FEF3EC] text-[#E8602C]' :
                        offer.status === 'ACCEPTED' ? 'bg-[#ECFDF5] text-[#2D6A4F]' : 'bg-[#F3F4F6] text-[#6B7280]'
                      }`}>
                        {offer.status}
                      </span>
                      {offer.status === 'ACCEPTED' && (
                        <Link
                          href="/messages"
                          className="px-3.5 py-1.5 rounded-lg bg-[#1A1A2E] text-white text-xs font-semibold hover:bg-[#E8602C] transition-colors"
                        >
                          Go to Deal →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
