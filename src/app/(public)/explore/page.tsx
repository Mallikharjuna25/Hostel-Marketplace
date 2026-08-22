'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { ProductCard } from '@/components/marketplace/ProductCard'
import { AIBadge } from '@/components/ui/AIBadge'
import Link from 'next/link'

const CATEGORIES = [
  'ALL',
  'Electronics',
  'Books',
  'Furniture',
  'Appliances',
  'Clothing',
  'Sports',
  'Lab Equipment',
  'Stationery',
]

const TRANSACTION_TYPES = [
  { label: 'All Modes', value: '' },
  { label: 'For Sale', value: 'SELL' },
  { label: 'For Lend', value: 'LEND' },
  { label: 'Borrow Requests', value: 'BORROW_REQUEST' },
  { label: 'Product Swap', value: 'EXCHANGE' },
  { label: 'Free Donation', value: 'DONATE' },
]

function ExploreContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || 'ALL'
  const initialType = searchParams.get('type') || ''
  const initialQ = searchParams.get('q') || ''

  const [q, setQ] = useState(initialQ)
  const [category, setCategory] = useState(initialCategory)
  const [type, setType] = useState(initialType)
  const [condition, setCondition] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [hostel, setHostel] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sort, setSort] = useState('recent')

  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [aiSearchInterpretation, setAiSearchInterpretation] = useState<string | null>(null)

  // Compare tray state (up to 3 items)
  const [compareItems, setCompareItems] = useState<any[]>([])
  const [compareModalOpen, setCompareModalOpen] = useState(false)

  // Fetch listings whenever filters change
  useEffect(() => {
    async function fetchListings() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (q.trim()) params.set('q', q.trim())
        if (category && category !== 'ALL') params.set('category', category)
        if (type) params.set('type', type)
        if (condition) params.set('condition', condition)
        if (maxPrice) params.set('maxPrice', maxPrice)
        if (hostel) params.set('hostel', hostel)
        if (verifiedOnly) params.set('verifiedOnly', 'true')
        if (sort) params.set('sort', sort)

        const res = await fetch(`/api/products?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setListings(data.listings || [])

          // Natural language search interpretation simulation
          if (q.trim().length > 3) {
            setAiSearchInterpretation(
              `Filtering for "${q}" across category "${category === 'ALL' ? 'Any' : category}" with verified campus sellers.`
            )
          } else {
            setAiSearchInterpretation(null)
          }
        }
      } catch (err) {
        console.error('Failed to fetch listings', err)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchListings, 200)
    return () => clearTimeout(timer)
  }, [q, category, type, condition, maxPrice, hostel, verifiedOnly, sort])

  const toggleCompare = (item: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (compareItems.some(i => i.id === item.id)) {
      setCompareItems(compareItems.filter(i => i.id !== item.id))
    } else {
      if (compareItems.length >= 3) {
        alert('You can compare a maximum of 3 products at a time.')
        return
      }
      setCompareItems([...compareItems, item])
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Search Bar */}
      <div className="space-y-4 mb-8">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-[#1A1A2E]">
            Explore Campus Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            Search items, filter by hostel block or exchange mode, and compare deals.
          </p>
        </div>

        {/* Search & AI Interpretation Input */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-white rounded-2xl border border-[#E5E2DD] p-2 shadow-xs focus-within:border-[#E8602C]">
            <span className="text-xl pl-3">🔍</span>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try searching: 'Scientific calculator under 500' or 'Engineering books in Block B'..."
              className="flex-1 bg-transparent text-sm text-[#1A1A2E] placeholder-[#9CA3AF] focus:outline-none px-2"
            />
            {q && (
              <button
                onClick={() => setQ('')}
                className="text-xs text-[#6B7280] hover:text-[#1A1A2E] px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* AI Search Understood Banner */}
          {aiSearchInterpretation && (
            <div className="mt-2 p-2.5 rounded-xl bg-[#FFF8F3] border border-[#FCD8C5] flex items-center justify-between text-xs text-[#E8602C]">
              <div className="flex items-center gap-2">
                <span>⚡</span>
                <span><strong>AI understood:</strong> {aiSearchInterpretation}</span>
              </div>
              <AIBadge label="Smart Search" sublabel="Keyword Match" />
            </div>
          )}
        </div>

        {/* Transaction Mode Selector Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {TRANSACTION_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                type === t.value
                  ? 'bg-[#1A1A2E] text-white shadow-xs'
                  : 'bg-white text-[#1A1A2E]/80 border border-[#E5E2DD] hover:bg-[#F7F5F2]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid with Filter Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E2DD] p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5E2DD] pb-3">
              <h3 className="font-heading font-bold text-sm text-[#1A1A2E]">Filters</h3>
              <button
                onClick={() => {
                  setCategory('ALL')
                  setType('')
                  setCondition('')
                  setMaxPrice('')
                  setHostel('')
                  setVerifiedOnly(false)
                }}
                className="text-[11px] text-[#E8602C] font-semibold hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-[#1A1A2E] uppercase tracking-wider block mb-2">
                Category
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      category === cat
                        ? 'bg-[#FEF3EC] text-[#E8602C] font-semibold'
                        : 'text-[#1A1A2E]/80 hover:bg-[#F7F5F2]'
                    }`}
                  >
                    <span>{cat === 'ALL' ? 'All Categories' : cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price */}
            <div>
              <label className="text-xs font-semibold text-[#1A1A2E] uppercase tracking-wider block mb-2">
                Max Price (₹ INR)
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 1000"
                className="w-full px-3 py-1.5 rounded-lg border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
              />
            </div>

            {/* Condition */}
            <div>
              <label className="text-xs font-semibold text-[#1A1A2E] uppercase tracking-wider block mb-2">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#E5E2DD] text-xs bg-white focus:outline-none focus:border-[#E8602C]"
              >
                <option value="">Any Condition</option>
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="POOR">Poor</option>
              </select>
            </div>

            {/* Hostel Block */}
            <div>
              <label className="text-xs font-semibold text-[#1A1A2E] uppercase tracking-wider block mb-2">
                Hostel / Block
              </label>
              <input
                type="text"
                value={hostel}
                onChange={(e) => setHostel(e.target.value)}
                placeholder="e.g. Block B or Hostel 10"
                className="w-full px-3 py-1.5 rounded-lg border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
              />
            </div>

            {/* Verified Students Only */}
            <div className="pt-2 border-t border-[#E5E2DD]">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#1A1A2E]">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-[#E8602C] focus:ring-[#E8602C]"
                />
                <span>Verified Students Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Right Product Grid */}
        <section className="lg:col-span-9 space-y-6">
          {/* Sorting and Results count header */}
          <div className="flex items-center justify-between text-xs text-[#6B7280]">
            <span>
              Showing <strong>{listings.length}</strong> items
            </span>
            <div className="flex items-center gap-2">
              <span>Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-white border border-[#E5E2DD] rounded-lg px-2.5 py-1 text-xs text-[#1A1A2E] focus:outline-none focus:border-[#E8602C]"
              >
                <option value="recent">Recently Added</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="quality">AI Listing Quality Score</option>
              </select>
            </div>
          </div>

          {/* Skeletons when loading */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E5E2DD] p-4 space-y-3">
                  <div className="w-full h-44 rounded-xl skeleton" />
                  <div className="w-3/4 h-4 rounded skeleton" />
                  <div className="w-1/2 h-4 rounded skeleton" />
                  <div className="w-full h-8 rounded skeleton mt-2" />
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl border border-dashed border-[#E5E2DD] bg-white p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] text-3xl mx-auto flex items-center justify-center">
                📦
              </div>
              <h3 className="font-heading font-bold text-lg text-[#1A1A2E]">
                No listings found matching your criteria
              </h3>
              <p className="text-xs text-[#6B7280] max-w-md mx-auto">
                Try widening your price range, searching across all categories, or be the first to list what someone else needs!
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setCategory('ALL')
                    setType('')
                    setQ('')
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E5E2DD] text-xs font-semibold text-[#1A1A2E] hover:bg-[#F7F5F2]"
                >
                  Clear Filters
                </button>
                <Link
                  href="/listings/new"
                  className="px-4 py-2 rounded-xl bg-[#E8602C] text-white text-xs font-semibold hover:bg-[#CF4F20]"
                >
                  + List This Item
                </Link>
              </div>
            </div>
          ) : (
            /* Product Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => (
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

                  {/* Add to Compare Tray Button */}
                  <button
                    onClick={(e) => toggleCompare(item, e)}
                    className={`absolute bottom-3 right-3 z-30 px-2 py-1 rounded-lg text-[10px] font-bold shadow-xs border transition-all ${
                      compareItems.some(i => i.id === item.id)
                        ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
                        : 'bg-white/95 backdrop-blur-xs text-[#1A1A2E] border-[#E5E2DD] hover:bg-[#F7F5F2]'
                    }`}
                  >
                    {compareItems.some(i => i.id === item.id) ? '✓ In Compare' : '+ Compare'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Floating Compare Tray (when >= 1 item selected) */}
      {compareItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A2E] text-white rounded-2xl shadow-xl px-6 py-3.5 flex items-center gap-6 border border-white/10 animate-slide-up">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#E5E2DD]">
              Compare ({compareItems.length}/3 items):
            </span>
            <div className="flex items-center gap-2">
              {compareItems.map((c) => (
                <span
                  key={c.id}
                  className="px-2 py-0.5 rounded-md bg-white/15 text-xs truncate max-w-[120px]"
                >
                  {c.title}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompareModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#E8602C] text-white text-xs font-bold hover:bg-[#CF4F20]"
            >
              Compare Side-by-Side →
            </button>
            <button
              onClick={() => setCompareItems([])}
              className="text-xs text-[#E5E2DD]/60 hover:text-white"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E5E2DD] max-w-4xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E2DD] pb-4">
              <div>
                <h3 className="font-heading font-bold text-xl text-[#1A1A2E]">
                  Side-by-Side Product Comparison
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Comparing price, AI fair value, seller trust, and proximity.
                </p>
              </div>
              <button
                onClick={() => setCompareModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className={`grid grid-cols-${compareItems.length} gap-4`}>
              {compareItems.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E2DD] space-y-3">
                  <h4 className="font-heading font-bold text-sm text-[#1A1A2E]">{item.title}</h4>
                  <p className="font-heading font-extrabold text-xl text-[#E8602C]">
                    {item.price !== null ? `₹${item.price}` : 'Trade / Free'}
                  </p>

                  <div className="space-y-1.5 text-xs border-t border-[#E5E2DD] pt-3">
                    <p><strong>Category:</strong> {item.category}</p>
                    <p><strong>Condition:</strong> {item.condition}</p>
                    <p><strong>Location:</strong> {item.location}</p>
                    <p><strong>Seller:</strong> {item.owner?.profile?.fullName || 'Student'}</p>
                    <p><strong>Trust Score:</strong> {item.owner?.trustScore?.score || 50}/100</p>
                    <p><strong>AI Fair Value:</strong> ₹{item.pricePrediction?.predicted || 'N/A'}</p>
                  </div>

                  <Link
                    href={`/products/${item.id}`}
                    className="block w-full text-center py-2 rounded-xl bg-[#1A1A2E] text-white text-xs font-semibold hover:bg-[#E8602C] transition-colors mt-4"
                  >
                    View Listing
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ExplorePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1" style={{ paddingTop: '72px' }}>
        <Suspense fallback={<div className="p-12 text-center text-sm">Loading campus marketplace...</div>}>
          <ExploreContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
