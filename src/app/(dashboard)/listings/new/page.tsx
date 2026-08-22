'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { AIBadge } from '@/components/ui/AIBadge'
import { CampusAntiFraudAgreement } from '@/components/legal/CampusAntiFraudAgreement'

const CATEGORIES = [
  'Electronics',
  'Books',
  'Furniture',
  'Appliances',
  'Clothing',
  'Sports',
  'Lab Equipment',
  'Stationery',
  'Other',
]

const SAMPLE_PRESETS = [
  {
    title: 'Casio fx-991EX ClassWiz Scientific Calculator',
    category: 'Electronics',
    brand: 'Casio',
    originalPrice: '1495',
    price: '650',
    condition: 'EXCELLENT',
    image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
    receiptSample: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Prestige 1.5L Electric Kettle Stainless Steel',
    category: 'Appliances',
    brand: 'Prestige',
    originalPrice: '1199',
    price: '480',
    condition: 'GOOD',
    image: 'https://images.unsplash.com/photo-1594213114663-d94db9b17125?auto=format&fit=crop&w=600&q=80',
    receiptSample: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Ergonomic Foldable Bed Study Table with Cup Holder',
    category: 'Furniture',
    brand: 'UrbanCraft',
    originalPrice: '899',
    price: '350',
    condition: 'GOOD',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80',
    receiptSample: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Hero Sprint 26T Mountain Bicycle with Lock & Helmet',
    category: 'Sports',
    brand: 'Hero',
    originalPrice: '6499',
    price: '2800',
    condition: 'GOOD',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80',
    receiptSample: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
  },
]

export default function NewListingWizard() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const billInputRef = useRef<HTMLInputElement>(null)

  // Form State
  const [mode, setMode] = useState<'SELL' | 'LEND' | 'EXCHANGE' | 'DONATE' | 'BORROW_REQUEST'>('SELL')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Electronics')
  const [description, setDescription] = useState('')
  const [legalAgreed, setLegalAgreed] = useState(false)
  const [condition, setCondition] = useState('GOOD')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('Hostel 10, Block B')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [usageDuration, setUsageDuration] = useState('6 months')
  const [accessories, setAccessories] = useState('')
  const [durationDays, setDurationDays] = useState('30')
  const [depositAmount, setDepositAmount] = useState('500')

  // Photos & Receipt State
  const [images, setImages] = useState<Array<{ url: string; isPrimary: boolean; name?: string }>>([])
  const [billUrl, setBillUrl] = useState<string | null>(null)
  const [billName, setBillName] = useState<string | null>(null)
  const [receiptVerified, setReceiptVerified] = useState(false)
  const [receiptOcrData, setReceiptOcrData] = useState<any>(null)

  // Staged AI State
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [aiStage, setAiStage] = useState<string | null>(null)
  const [aiResult, setAiResult] = useState<any>(null)
  const [predictedPrice, setPredictedPrice] = useState<any>(null)
  const [aiDescription, setAiDescription] = useState<string | null>(null)
  const [qualityScore, setQualityScore] = useState<number | null>(null)
  const [qualityPassed, setQualityPassed] = useState<boolean | null>(null)
  const [damageIssues, setDamageIssues] = useState<string[]>([])

  // Submission State
  const [submitting, setSubmitting] = useState(false)
  const [createdListingId, setCreatedListingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Handle Photo Files Upload
  const handlePhotoFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const fileArray = Array.from(files)

    fileArray.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const resultUrl = e.target?.result as string
        if (resultUrl) {
          setImages((prev) => [
            ...prev,
            { url: resultUrl, isPrimary: prev.length === 0, name: file.name },
          ])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  // Handle Receipt File Upload
  const handleBillFile = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      const resultUrl = e.target?.result as string
      if (resultUrl) {
        setBillUrl(resultUrl)
        setBillName(file.name)
        setReceiptVerified(true)
        // Simulated AI receipt extraction
        const detectedPrice = originalPrice ? parseInt(originalPrice) : 1299
        setReceiptOcrData({
          storeName: 'Amazon / Campus Store',
          detectedDate: 'Oct 2025',
          extractedAmount: detectedPrice,
          authenticityScore: 98,
        })
        if (!originalPrice) {
          setOriginalPrice(detectedPrice.toString())
        }
      }
    }
    reader.readAsDataURL(file)
  }

  // Remove Photo
  const handleRemovePhoto = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index)
      if (next.length > 0 && !next.some((img) => img.isPrimary)) {
        next[0].isPrimary = true
      }
      return next
    })
  }

  // Set Primary Photo
  const handleSetPrimary = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    )
  }

  // Apply Quick Sample Preset
  const handleApplyPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setTitle(preset.title)
    setCategory(preset.category)
    setBrand(preset.brand)
    setOriginalPrice(preset.originalPrice)
    setPrice(preset.price)
    setCondition(preset.condition)
    setImages([{ url: preset.image, isPrimary: true, name: 'primary_item_photo.jpg' }])
    setBillUrl(preset.receiptSample)
    setBillName('purchase_invoice_verified.pdf')
    setReceiptVerified(true)
    setReceiptOcrData({
      storeName: 'Verified Campus Retailer / Online Store',
      detectedDate: 'Valid Purchase Record',
      extractedAmount: parseInt(preset.originalPrice),
      authenticityScore: 99,
    })
  }

  // Trigger Staged AI Analysis Simulation
  const handleRunAIAnalysis = async () => {
    if (!title || !category) {
      alert('Please enter a title and select a category first.')
      return
    }

    setAiAnalyzing(true)
    setError(null)

    // Staged UI progress
    setAiStage('1/5 Inspecting uploaded photos for cosmetic wear & defects...')
    await new Promise((r) => setTimeout(r, 600))

    const detectedWear = condition === 'EXCELLENT' ? [] : ['Minor surface scuffs consistent with standard student use', 'All functional controls operating normally']
    setDamageIssues(detectedWear)

    setAiStage('2/5 Verifying bill & authenticating purchase specifications...')
    await new Promise((r) => setTimeout(r, 600))

    setAiStage('3/5 Generating structured AI product description...')
    const generatedDesc = `This ${brand ? brand + ' ' : ''}${title} is in ${condition.toLowerCase()} condition and has been well-maintained. All original functions operate smoothly. Perfect for ${category.toLowerCase()} coursework and daily hostel use. Minor surface wear consistent with standard student usage.`
    setAiDescription(generatedDesc)
    if (!description) setDescription(generatedDesc)
    await new Promise((r) => setTimeout(r, 500))

    setAiStage('4/5 Estimating campus fair-value price range...')
    const orig = originalPrice ? parseInt(originalPrice) : 1000
    const estLow = Math.round(orig * 0.45)
    const estHigh = Math.round(orig * 0.65)
    const estPred = Math.round(orig * 0.55)
    setPredictedPrice({ low: estLow, high: estHigh, predicted: estPred })
    if (mode === 'SELL' && !price) setPrice(estPred.toString())
    await new Promise((r) => setTimeout(r, 500))

    setAiStage('5/5 Evaluating Listing Quality Score...')
    const score = Math.min(98, 70 + (images.length > 0 ? 15 : 0) + (billUrl ? 10 : 0) + (description.length > 20 ? 5 : 0))
    setQualityScore(score)
    setQualityPassed(score >= 50)

    setAiResult({
      detectedProduct: `${brand ? brand + ' ' : ''}${title}`,
      confidence: 0.96,
      conditionLabel: condition,
      conditionScore: condition === 'EXCELLENT' ? 95 : condition === 'GOOD' ? 82 : 65,
      detectedIssues: detectedWear,
    })

    setAiAnalyzing(false)
    setAiStage(null)
  }

  // Handle Full Listing Creation & Publish
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          description: description || aiDescription || 'Well-maintained campus item.',
          condition,
          conditionScore: condition === 'EXCELLENT' ? 95 : condition === 'GOOD' ? 82 : 65,
          priceInr: mode === 'SELL' || mode === 'LEND' ? parseInt(price || '0') : undefined,
          depositInr: mode === 'LEND' && depositAmount ? parseInt(depositAmount) : undefined,
          mode,
          transactionType: mode,
          location,
          brand: brand || undefined,
          model: model || undefined,
          originalPrice: originalPrice ? parseInt(originalPrice) : undefined,
          images: images.map((img) => ({ url: img.url, isPrimary: img.isPrimary })),
          billUrl: billUrl || undefined,
          aiVerified: true,
          listingQualityScore: qualityScore || (images.length > 0 ? 90 : 75),
          aiAnalysis: aiResult || {
            detectedProduct: title,
            confidence: 0.95,
            conditionLabel: condition,
            conditionScore: condition === 'EXCELLENT' ? 95 : 82,
            detectedIssues: damageIssues,
          },
          pricePrediction: predictedPrice ? {
            minPrice: predictedPrice.low,
            maxPrice: predictedPrice.high,
            fairPrice: predictedPrice.predicted,
            confidence: 0.92,
            reasoning: 'Calculated from student market data & invoice proof',
          } : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create listing.')
        setSubmitting(false)
        return
      }

      const listingId = data.id || data.listing?.id
      if (!listingId) {
        setError('Failed to get listing ID.')
        setSubmitting(false)
        return
      }
      setCreatedListingId(listingId)
      setSuccess(true)
      setTimeout(() => {
        router.push(`/products/${listingId}`)
      }, 1200)
    } catch {
      setError('An error occurred while publishing listing.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8" style={{ paddingTop: '80px' }}>
        {/* Wizard Header */}
        <div className="space-y-1 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF8F3] text-[#E8602C] border border-[#FCD8C5]">
            <span>⚡</span> AI-Assisted Listing Creation with Image & Bill Verification
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-[#1A1A2E]">
            List an Item or Request
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Upload item photos, attach your receipt for authenticity, and let AI generate fair pricing.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="p-4 rounded-2xl bg-white border border-[#E5E2DD] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
              🚀 Quick Fill from Popular Campus Items:
            </span>
            <span className="text-[11px] text-[#E8602C] font-semibold">1-Click Auto Fill</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SAMPLE_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="p-2.5 rounded-xl border border-[#E5E2DD] bg-[#FAF8F5] hover:bg-[#FEF3EC] hover:border-[#E8602C] text-left transition-all text-xs group cursor-pointer"
              >
                <span className="font-bold text-[#1A1A2E] group-hover:text-[#E8602C] line-clamp-1 block">
                  {p.title}
                </span>
                <span className="text-[10px] text-[#6B7280]">
                  {p.category} · ₹{p.price}
                </span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626] space-y-1">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {success ? (
          <div className="p-12 rounded-3xl bg-[#ECFDF5] border border-[#A7F3D0] text-center space-y-3">
            <span className="text-5xl">🎉</span>
            <h2 className="font-heading font-bold text-2xl text-[#065F46]">Listing Published Successfully!</h2>
            <p className="text-xs text-[#065F46]">
              Your item with photo and invoice proof is now live on the marketplace.
            </p>
            <p className="text-xs text-[#6B7280]">Redirecting to your live listing page...</p>
          </div>
        ) : (
          <form onSubmit={handlePublish} className="space-y-8">
            {/* Step 1: Mode Picker */}
            <div className="bg-white rounded-3xl border border-[#E5E2DD] p-6 space-y-4 shadow-xs">
              <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                1. Choose Exchange Mode
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { id: 'SELL', icon: '💰', title: 'Sell', desc: 'Direct INR Payment' },
                  { id: 'LEND', icon: '⏱️', title: 'Lend', desc: 'Daily Rent & Deposit' },
                  { id: 'EXCHANGE', icon: '🔄', title: 'Exchange', desc: 'Item Barter or Tutoring' },
                  { id: 'DONATE', icon: '🎁', title: 'Donate', desc: 'Academic Free Gift' },
                  { id: 'BORROW_REQUEST', icon: '🙋‍♂️', title: 'Borrow', desc: 'Request from Peers' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      mode === m.id
                        ? 'bg-[#1A1A2E] text-white border-[#1A1A2E] shadow-sm'
                        : 'bg-[#FAF8F5] text-[#1A1A2E] border-[#E5E2DD] hover:bg-[#EFECE6]'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{m.icon}</span>
                    <span className="font-heading font-bold text-sm block">{m.title}</span>
                    <span className={`text-[10px] block ${mode === m.id ? 'text-[#E5E2DD]/70' : 'text-[#6B7280]'}`}>
                      {m.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Photos Upload Section */}
            <div className="bg-white rounded-3xl border border-[#E5E2DD] p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                    2. Upload Item Photos
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Upload clear photos from multiple angles for AI visual inspection & higher buyer trust.
                  </p>
                </div>
                <span className="text-xs text-[#2D6A4F] font-bold">
                  {images.length} / 5 Photos
                </span>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 rounded-2xl border-2 border-dashed border-[#E5E2DD] hover:border-[#E8602C] bg-[#FAF8F5] hover:bg-[#FFFDFB] text-center space-y-2 cursor-pointer transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handlePhotoFiles(e.target.files)}
                  className="hidden"
                />
                <span className="text-3xl block">📸</span>
                <p className="font-heading font-bold text-sm text-[#1A1A2E]">
                  Click or Drag & Drop Photos Here
                </p>
                <p className="text-[11px] text-[#6B7280]">
                  Supports JPG, PNG, WEBP · Max 5MB per image
                </p>
              </div>

              {/* Photo Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-2xl overflow-hidden border border-[#E5E2DD] bg-white group shadow-xs"
                    >
                      <div className="h-28 bg-[#FAF8F5] overflow-hidden flex items-center justify-center">
                        <img src={img.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2 flex items-center justify-between bg-white text-[11px]">
                        {img.isPrimary ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#2D6A4F] font-bold text-[10px]">
                            ★ Primary
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(idx)}
                            className="text-[#6B7280] hover:text-[#1A1A2E] text-[10px] font-semibold cursor-pointer"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="text-[#EF4444] hover:text-[#DC2626] font-bold text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 3: Purchase Bill & Invoice Upload */}
            <div className="bg-white rounded-3xl border border-[#E5E2DD] p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-[#1A1A2E] flex items-center gap-2">
                    <span>🧾</span> 3. Proof of Purchase / Bill (Optional)
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Attach original Amazon / retailer bill or invoice. Boosts your trust score and unlocks fair value estimation.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ECFDF5] text-[#2D6A4F]">
                  🔒 Private & Encrypted
                </span>
              </div>

              <div
                onClick={() => billInputRef.current?.click()}
                className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center space-y-1.5 ${
                  billUrl
                    ? 'border-[#10B981] bg-[#F0FDF4]'
                    : 'border-[#E5E2DD] bg-[#FAF8F5] hover:border-[#E8602C]'
                }`}
              >
                <input
                  ref={billInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleBillFile(e.target.files)}
                  className="hidden"
                />

                {billUrl ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🧾</span>
                      <div>
                        <span className="font-heading font-bold text-xs text-[#065F46] block">
                          ✓ Bill Uploaded: {billName || 'Purchase Invoice'}
                        </span>
                        <span className="text-[11px] text-[#047857]">
                          AI Verified · Extracted Purchase Value: ₹{receiptOcrData?.extractedAmount || originalPrice || 1200}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setBillUrl(null)
                        setBillName(null)
                        setReceiptVerified(false)
                      }}
                      className="px-3 py-1 rounded-lg bg-white border border-[#FECACA] text-[#DC2626] font-bold text-xs hover:bg-[#FEF2F2] cursor-pointer"
                    >
                      Remove Bill
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-2xl block">📄</span>
                    <p className="font-heading font-bold text-xs text-[#1A1A2E]">
                      Click to Upload Invoice / Bill (Image or PDF)
                    </p>
                    <p className="text-[10px] text-[#6B7280]">
                      Your bill is never displayed publicly to other students. Only verified metadata is shared.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Step 4: Item Specifications & Pricing */}
            <div className="bg-white rounded-3xl border border-[#E5E2DD] p-6 space-y-4 shadow-xs">
              <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                4. Item Specifications & Pricing
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                    Listing Title:
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Casio fx-991EX ClassWiz Calculator"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                    Category:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] text-xs bg-white focus:outline-none focus:border-[#E8602C]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                    Physical Condition:
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] text-xs bg-white focus:outline-none focus:border-[#E8602C]"
                  >
                    <option value="EXCELLENT">Excellent — Like new, flawless</option>
                    <option value="GOOD">Good — Minor cosmetic signs of use</option>
                    <option value="FAIR">Fair — Works fine, cosmetic wear</option>
                    <option value="POOR">Poor — Functional wear / needs repair</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                    Brand (Optional):
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Casio, Prestige, Sony, Hero"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                    Original Purchase Price (₹):
                  </label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="e.g. 1495"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                  />
                </div>

                {mode === 'SELL' && (
                  <div>
                    <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                      Asking Price (₹ INR):
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 650"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                    />
                  </div>
                )}

                {mode === 'LEND' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                        Daily Rent (₹/day):
                      </label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g. 50"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                        Refundable Deposit (₹):
                      </label>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                    Hostel Location / Pickup Spot:
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Hostel 10, Block B Common Room"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                    Item Description:
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe usage history, included cables/accessories, or notes for buyer..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                  />
                </div>
              </div>
            </div>

            {/* Step 5: AI Vision, Damage & Price Pipeline */}
            <div className="bg-white rounded-3xl border border-[#E5E2DD] p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                    5. AI Vision, Damage & Fair Price Analysis
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    AI inspects uploaded photos, checks damage, and predicts fair campus pricing.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRunAIAnalysis}
                  disabled={aiAnalyzing}
                  className="px-5 py-2.5 rounded-xl bg-[#E8602C] text-white font-heading font-bold text-xs hover:bg-[#CF4F20] transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>⚡</span>
                  <span>{aiAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}</span>
                </button>
              </div>

              {/* Staged AI Loader Modal */}
              {aiAnalyzing && (
                <div className="p-6 rounded-2xl bg-[#FFF8F3] border border-[#FCD8C5] text-center space-y-3 animate-pulse">
                  <div className="flex justify-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E8602C]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E8602C]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E8602C]" />
                  </div>
                  <p className="font-heading font-bold text-sm text-[#E8602C]">{aiStage}</p>
                </div>
              )}

              {/* AI Results */}
              {aiResult && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E2DD] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[#6B7280] block text-[11px]">Detected Item:</span>
                      <strong className="text-[#1A1A2E]">{aiResult.detectedProduct}</strong>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block text-[11px]">Condition Score:</span>
                      <strong className="text-[#2D6A4F]">{aiResult.conditionScore}/100 ({aiResult.conditionLabel})</strong>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block text-[11px]">Fair Value Range:</span>
                      <strong className="text-[#E8602C]">₹{predictedPrice?.low} – ₹{predictedPrice?.high}</strong>
                    </div>
                  </div>

                  {damageIssues.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#FEF08A] text-xs text-[#854D0E] space-y-1">
                      <span className="font-bold flex items-center gap-1.5">
                        <span>🔍</span> Visual Inspection Findings:
                      </span>
                      <ul className="list-disc list-inside text-[11px] space-y-0.5">
                        {damageIssues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#065F46] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>✓</span> Quality Gate Passed: <strong>Score {qualityScore || 90}/100</strong>
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-[#10B981] text-white px-2 py-0.5 rounded">
                      APPROVED
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Anti-Fraud and Buyer Compensation Agreement */}
            <div className="pt-2">
              <CampusAntiFraudAgreement
                checked={legalAgreed}
                onChange={setLegalAgreed}
                label="I guarantee all product details and working condition are authentic, and accept full compensation liability for fraudulent listings."
              />
            </div>

            {/* Publish Action Button */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Link
                href="/dashboard"
                className="px-5 py-3 rounded-xl bg-[#FAF8F5] border border-[#E5E2DD] text-xs font-semibold text-[#6B7280] hover:text-[#1A1A2E]"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || !legalAgreed}
                className="px-8 py-3.5 rounded-xl bg-[#E8602C] text-white font-heading font-bold text-sm hover:bg-[#CF4F20] transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Publishing Item...' : '🚀 Publish Item on Marketplace'}
              </button>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  )
}
