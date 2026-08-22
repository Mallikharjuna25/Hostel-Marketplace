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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8" style={{ paddingTop: '96px' }}>
        {/* Welcome Greeting Banner */}
        <div className="rounded-3xl theme-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold badge-green mb-2">
              <span>✓</span> Verified Student · {user.profile?.college || 'Campus'}
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl theme-title">
              Welcome back, {user.profile?.fullName || 'Student'}!
            </h1>
            <p className="text-xs sm:text-sm theme-muted mt-1">
              Hostel: <strong className="theme-title">{user.profile?.hostel || 'Hostel'}</strong> {user.profile?.block ? `(${user.profile.block})` : ''} · Department: <strong className="theme-title">{user.profile?.department || 'General'}</strong>
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
              className="px-4 py-3 rounded-xl theme-card-alt theme-title text-xs font-semibold hover:border-[#E8602C] transition-colors"
            >
              My Profile
            </Link>
          </div>
        </div>

        {/* 4 Stat Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Trust Score */}
          <div className="p-5 rounded-2xl theme-card shadow-xs space-y-1">
            <span className="text-[11px] font-semibold theme-muted uppercase tracking-wider block">
              Trust Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading font-extrabold text-2xl text-[#2D6A4F] dark:text-[#34D399]">
                {trustScore}
              </span>
              <span className="text-xs theme-muted">/100</span>
            </div>
            <p className="text-[11px] text-[#2D6A4F] dark:text-[#34D399] font-medium">
              {trustScore >= 80 ? 'Verified & Trusted' : trustScore >= 60 ? 'Good Standing' : 'Building Trust'}
            </p>
          </div>

          {/* Card 2: Pending Offers on Your Items */}
          <div
            onClick={() => setActiveTab('offers')}
            className={`p-5 rounded-2xl theme-card transition-all cursor-pointer shadow-xs space-y-1 ${
              pendingReceived.length > 0 ? 'border-[#E8602C] ring-2 ring-[#E8602C]/20' : 'hover:border-[#E8602C]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold theme-muted uppercase tracking-wider block">
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
            <p className="text-[11px] theme-muted">
              {pendingReceived.length === 1 ? '1 student waiting for reply' : `${pendingReceived.length} students waiting for reply`}
            </p>
          </div>

          {/* Card 3: Active Transactions */}
          <div
            onClick={() => setActiveTab('transactions')}
            className="p-5 rounded-2xl theme-card shadow-xs space-y-1 cursor-pointer hover:border-[#E8602C] transition-all"
          >
            <span className="text-[11px] font-semibold theme-muted uppercase tracking-wider block">
              Active Deals
            </span>
            <span className="font-heading font-extrabold text-2xl theme-title">
              {activeTransactions.length}
            </span>
            <p className="text-[11px] theme-muted">
              Ongoing chats / OTP handovers
            </p>
          </div>

          {/* Card 4: My Listed Items */}
          <div
            onClick={() => setActiveTab('listings')}
            className="p-5 rounded-2xl theme-card shadow-xs space-y-1 cursor-pointer hover:border-[#7C3AED] transition-all"
          >
            <span className="text-[11px] font-semibold theme-muted uppercase tracking-wider block">
              My Posted Listings
            </span>
            <span className="font-heading font-extrabold text-2xl text-[#7C3AED] dark:text-[#C084FC]">
              {myListings.length}
            </span>
            <p className="text-[11px] theme-muted">
              Active items in campus catalog
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b gap-4 overflow-x-auto pb-1" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('offers')}
            className={`pb-3 px-2 font-heading font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'offers'
                ? 'border-[#E8602C] text-[#E8602C]'
                : 'border-transparent theme-muted hover:text-[#E8602C]'
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
                : 'border-transparent theme-muted hover:text-[#E8602C]'
            }`}
          >
            <span>📦 My Posted Items ({myListings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 px-2 font-heading font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'transactions'
                ? 'border-[#E8602C] text-[#E8602C]'
                : 'border-transparent theme-muted hover:text-[#E8602C]'
            }`}
          >
            <span>🤝 Active Deals &amp; Handovers ({activeTransactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sent_offers')}
            className={`pb-3 px-2 font-heading font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'sent_offers'
                ? 'border-[#E8602C] text-[#E8602C]'
                : 'border-transparent theme-muted hover:text-[#E8602C]'
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
                <h2 className="font-heading font-bold text-xl theme-title">
                  Offers Received from Students
                </h2>
                <p className="text-xs theme-muted">
                  Review cash offers, barter swaps, and knowledge exchange requests on your posted items.
                </p>
              </div>
            </div>

            {receivedOffers.length === 0 ? (
              <div className="p-12 rounded-3xl theme-card border-dashed text-center space-y-3">
                <span className="text-4xl">📬</span>
                <h3 className="font-heading font-bold text-base theme-title">
                  No Offers Received Yet
                </h3>
                <p className="text-xs theme-muted max-w-md mx-auto">
                  When a verified student on campus makes an offer on your listings, you will see it here with 1-click accept.
                </p>
                <Link
                  href="/explore"
                  className="inline-block px-4 py-2 rounded-xl bg-[#E8602C] text-white text-xs font-bold hover:bg-[#CF4F20] transition-colors"
                >
                  Explore Campus Market
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {receivedOffers.map((offer) => {
                  const isPending = offer.status === 'PENDING'
                  const isAccepted = offer.status === 'ACCEPTED'

                  return (
                    <div
                      key={offer.id}
                      className={`p-6 rounded-2xl theme-card transition-all shadow-xs space-y-4 ${
                        isPending ? 'border-[#E8602C]/40 ring-1 ring-[#E8602C]/10' : ''
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-[#E8602C] text-white flex items-center justify-center font-heading font-bold text-base flex-shrink-0">
                            {offer.buyer?.fullName?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-heading font-bold text-sm theme-title">
                                {offer.buyer?.fullName || 'Student Buyer'}
                              </h4>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold badge-green">
                                Trust {offer.buyer?.trustScore || 80}/100
                              </span>
                            </div>
                            <p className="text-xs theme-muted">
                              {offer.buyer?.hostel ? `Hostel ${offer.buyer.hostel} ${offer.buyer.block || ''}` : 'Campus Hostel'} · {offer.buyer?.college || 'Verified Student'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            isPending ? 'badge-orange' :
                            isAccepted ? 'badge-green' : 'badge-neutral'
                          }`}>
                            {offer.status}
                          </span>
                          <span className="text-[11px] theme-muted">
                            {new Date(offer.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Offer Details */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-7 space-y-2">
                          <div className="flex items-center gap-2 text-xs theme-muted">
                            <span>Listing:</span>
                            <Link
                              href={`/products/${offer.listingId}`}
                              className="font-semibold theme-title hover:text-[#E8602C] hover:underline"
                            >
                              {offer.listing?.title || 'Campus Item'}
                            </Link>
                            <span className="px-2 py-0.5 rounded-md theme-card-alt text-[10px] font-bold">
                              {offer.listing?.mode || 'SELL'}
                            </span>
                          </div>

                          {offer.offerPriceInr ? (
                            <div className="flex items-baseline gap-2">
                              <span className="text-xs theme-muted">Offered Price:</span>
                              <span className="font-heading font-extrabold text-2xl text-[#2D6A4F] dark:text-[#34D399]">
                                ₹{offer.offerPriceInr.toLocaleString('en-IN')}
                              </span>
                              {offer.listing?.priceInr && (
                                <span className="text-xs theme-muted line-through">
                                  (Listed at ₹{offer.listing.priceInr.toLocaleString('en-IN')})
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm font-semibold text-[#7C3AED] dark:text-[#C084FC]">
                              Barter / Skill Exchange Proposal
                            </div>
                          )}

                          {offer.note && (
                            <div className="p-3 rounded-xl theme-card-alt text-xs theme-title italic">
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
                                className="w-full sm:w-auto px-4 py-2.5 rounded-xl theme-card-alt theme-muted hover:text-red-500 font-semibold text-xs transition-colors cursor-pointer"
                              >
                                Decline
                              </button>
                            </>
                          ) : isAccepted ? (
                            <Link
                              href="/messages"
                              className="px-4 py-2.5 rounded-xl bg-[#E8602C] text-white font-heading font-bold text-xs hover:bg-[#CF4F20] transition-colors shadow-xs"
                            >
                              💬 Open Live Chat &amp; OTP →
                            </Link>
                          ) : (
                            <span className="text-xs theme-muted">Offer Declined</span>
                          )}

                          <Link
                            href={`/products/${offer.listingId}`}
                            className="px-3.5 py-2.5 rounded-xl theme-card-alt theme-muted hover:text-[#E8602C] text-xs font-semibold transition-colors"
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
                <h2 className="font-heading font-bold text-xl theme-title">
                  My Listed Items ({myListings.length})
                </h2>
                <p className="text-xs theme-muted">
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
              <div className="p-12 rounded-3xl theme-card border-dashed text-center space-y-3">
                <span className="text-3xl">📦</span>
                <h3 className="font-heading font-bold text-base theme-title">
                  You haven't listed any items yet
                </h3>
                <p className="text-xs theme-muted">
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
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === 'PUBLISHED' ? 'badge-green' :
                        item.status === 'IN_TRANSACTION' ? 'badge-orange' : 'badge-neutral'
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
                <h2 className="font-heading font-bold text-xl theme-title">
                  Active Deals &amp; 2-Step Handovers
                </h2>
                <p className="text-xs theme-muted">
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
              <div className="p-12 rounded-3xl theme-card border-dashed text-center space-y-3">
                <span className="text-3xl">🤝</span>
                <h3 className="font-heading font-bold text-base theme-title">
                  No active transactions yet
                </h3>
                <p className="text-xs theme-muted">
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
                      className="p-5 rounded-2xl theme-card shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold theme-title flex items-center gap-2">
                          <span>📦</span> Deal #{tx.id.slice(-6)}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          tx.status === 'OTP_GENERATED' ? 'badge-orange' :
                          tx.status === 'COMPLETED' ? 'badge-green' : 'badge-neutral'
                        }`}>
                          {tx.status?.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-xs theme-title">
                        <strong>{tx.listing?.title || 'Campus Item'}</strong>
                        <p className="text-[11px] theme-muted mt-0.5">
                          With <strong className="theme-title">{otherParty?.profile?.fullName || 'Student'}</strong> ({isSeller ? 'Buyer' : 'Seller'})
                        </p>
                      </div>

                      {tx.lastMessage && (
                        <p className="text-xs theme-muted line-clamp-1 italic theme-card-alt p-2 rounded-lg">
                          &ldquo;{tx.lastMessage}&rdquo;
                        </p>
                      )}

                      <div className="pt-2 flex items-center justify-between border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <Link
                          href={`/transactions/${tx.id}`}
                          className="px-4 py-2 rounded-xl bg-[#E8602C] text-white text-xs font-semibold hover:bg-[#CF4F20] transition-colors"
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
            <div>
              <h2 className="font-heading font-bold text-xl theme-title">
                Offers Sent by Me ({sentOffers.length})
              </h2>
              <p className="text-xs theme-muted">
                Track offers and barter proposals you submitted to other students.
              </p>
            </div>

            {sentOffers.length === 0 ? (
              <div className="p-12 rounded-3xl theme-card border-dashed text-center space-y-3">
                <span className="text-3xl">📤</span>
                <h3 className="font-heading font-bold text-base theme-title">
                  No sent offers yet
                </h3>
                <p className="text-xs theme-muted">
                  Explore items listed across campus and submit an offer or barter exchange proposal.
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
                    className="p-5 rounded-2xl theme-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#FEF3EC] dark:bg-[#2E180E] text-[#E8602C]">
                          {offer.status}
                        </span>
                        <h4 className="font-heading font-bold text-sm theme-title">
                          To: {offer.seller?.fullName || 'Seller'} ({offer.seller?.hostel || 'Campus'})
                        </h4>
                      </div>
                      <p className="text-xs theme-muted">
                        Item: <strong className="theme-title">{offer.listing?.title}</strong> · Your Offer: <strong className="text-[#E8602C]">₹{offer.priceOffer || 'Barter / Free'}</strong>
                      </p>
                      {offer.note && (
                        <p className="text-xs theme-muted italic">"{offer.note}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/products/${offer.listingId}`}
                        className="px-3.5 py-2 rounded-xl theme-card-alt theme-title text-xs font-semibold hover:border-[#E8602C]"
                      >
                        View Item
                      </Link>
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
