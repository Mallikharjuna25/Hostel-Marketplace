'use client'

import React, { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { AITradeChatbot } from '@/components/ai/AITradeChatbot'

const STATUS_STEPS = [
  { id: 'ACCEPTED', label: 'Offer Accepted' },
  { id: 'HANDOVER_PENDING', label: 'Handover Meetup' },
  { id: 'OTP_VERIFICATION', label: 'OTP Verification' },
  { id: 'COMPLETED', label: 'Completed' },
]

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [transaction, setTransaction] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Role View Override (default matches actual logged-in user, but allows toggle for testing)
  const [viewRole, setViewRole] = useState<'SELLER' | 'BUYER' | null>(null)

  // Chat State
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const prevMsgCountRef = useRef(0)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  // Seller OTP State
  const [sellerOtp, setSellerOtp] = useState<string | null>(null)
  const [generatingOtp, setGeneratingOtp] = useState(false)

  // Buyer OTP State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null)
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // 3-Point Inspection Checklist (Buyer)
  const [itemMatches, setItemMatches] = useState(false)
  const [conditionExpected, setConditionExpected] = useState(false)
  const [accessoriesIncluded, setAccessoriesIncluded] = useState(false)

  // Payment Settlement (Buyer & Seller)
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'CASH' | 'SCHEDULED'>('UPI')
  const [onlinePaid, setOnlinePaid] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('2026-09-01')
  const [cashReceivedConfirmed, setCashReceivedConfirmed] = useState(false)
  const [showPaymentGatewayModal, setShowPaymentGatewayModal] = useState(false)
  const [gatewayProcessing, setGatewayProcessing] = useState(false)

  // Receiver Feedback & Rating State
  const [receiverRating, setReceiverRating] = useState(5)
  const [receiverComment, setReceiverComment] = useState('')
  const [existingReview, setExistingReview] = useState<any>(null)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null)
  const [antiFraudAgreed, setAntiFraudAgreed] = useState(false)

  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }

  const loadData = async () => {
    try {
      const [txRes, userRes, msgRes, revRes] = await Promise.all([
        fetch(`/api/transactions/${id}`),
        fetch('/api/users/me'),
        fetch(`/api/messages?transactionId=${id}`),
        fetch(`/api/reviews?transactionId=${id}`),
      ])

      if (txRes.ok) {
        const txData = await txRes.json()
        const tx = txData.transaction || txData
        setTransaction(tx)

        if (tx.sellerOtpCode) {
          setSellerOtp(tx.sellerOtpCode)
        }

        if (tx.messages && tx.messages.length > 0) {
          setMessages(tx.messages)
        }
      } else {
        setError('Transaction not found or forbidden.')
      }

      if (userRes.ok) {
        const userData = await userRes.json()
        setCurrentUser(userData)
      }

      if (msgRes.ok) {
        const msgData = await msgRes.json()
        if (msgData.messages) {
          setMessages(msgData.messages)
        }
      }

      if (revRes.ok) {
        const revData = await revRes.json()
        if (revData.reviews && revData.reviews.length > 0) {
          setExistingReview(revData.reviews[0])
        }
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load transaction.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: id,
          rating: receiverRating,
          comment: receiverComment,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setReviewSuccessMsg('⭐ Review submitted! Thank you for rating the seller.')
        setExistingReview({
          rating: receiverRating,
          comment: receiverComment,
          reviewerName: currentUser?.profile?.fullName || 'You',
          createdAt: new Date(),
        })
      } else {
        alert(data.error || 'Failed to submit review')
      }
    } catch {
      alert('Error submitting review')
    } finally {
      setSubmittingReview(false)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 2000)
    return () => clearInterval(interval)
  }, [id])

  // Determine strict account role
  const isSeller = Boolean(
    currentUser?.id &&
    (transaction?.sellerId === currentUser.id ||
     transaction?.seller?.id === currentUser.id ||
     transaction?.partyAId === currentUser.id ||
     transaction?.isSeller === true)
  )

  // Handle Buyer OTP digit inputs
  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1)
    const nextDigits = [...otpDigits]
    nextDigits[index] = clean
    setOtpDigits(nextDigits)

    if (clean && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  // Handle Paste for 6-digit OTP
  const handlePasteOtp = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '')
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(''))
      otpInputRefs.current[5]?.focus()
    }
  }

  // Generate OTP (Seller Action)
  const handleGenerateOTP = async () => {
    setGeneratingOtp(true)
    try {
      const res = await fetch(`/api/transactions/${id}/generate-otp`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setSellerOtp(data.otpCode || data.otp)
        loadData()
      } else {
        alert(data.error || 'Failed to generate OTP')
      }
    } catch {
      alert('Error generating OTP')
    } finally {
      setGeneratingOtp(false)
    }
  }

  // Verify OTP (Buyer Action)
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setOtpError(null)
    setOtpSuccessMsg(null)

    const fullCode = otpDigits.join('')
    if (fullCode.length !== 6) {
      setOtpError('Please enter all 6 digits of the handover code.')
      return
    }

    if (!itemMatches || !conditionExpected || !accessoriesIncluded) {
      setOtpError('Please verify all 3 product checklist items before confirming handover.')
      return
    }

    setOtpVerifying(true)
    try {
      const res = await fetch(`/api/transactions/${id}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: fullCode }),
      })

      const data = await res.json()
      if (res.ok) {
        setOtpSuccessMsg('🎉 Handover Verified! Trade completed and trust score updated.')
        loadData()
      } else {
        setOtpError(data.error || 'Incorrect OTP code. Please ask the seller for their active code.')
      }
    } catch {
      setOtpError('Failed to verify OTP. Please try again.')
    } finally {
      setOtpVerifying(false)
    }
  }

  // Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sendingMessage) return

    setSendingMessage(true)
    const tempText = newMessage.trim()
    setNewMessage('')

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: id,
          content: tempText,
        }),
      })

      if (res.ok) {
        loadData()
      }
    } catch {
      // ignore
    } finally {
      setSendingMessage(false)
    }
  }

  // Mock Online Gateway Payment
  const handleMockPayOnline = () => {
    setGatewayProcessing(true)
    setTimeout(() => {
      setGatewayProcessing(false)
      setOnlinePaid(true)
      setShowPaymentGatewayModal(false)
    }, 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full space-y-4" style={{ paddingTop: '96px' }}>
          <div className="h-20 skeleton rounded-2xl" />
          <div className="h-64 skeleton rounded-3xl" />
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto px-4 py-20 text-center space-y-4" style={{ paddingTop: '96px' }}>
          <h2 className="font-heading font-bold text-2xl theme-title">{error || 'Transaction not found'}</h2>
          <Link href="/dashboard" className="inline-block px-5 py-2.5 rounded-xl bg-[#E8602C] text-white text-xs font-bold">
            Back to Dashboard
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const isCompleted = transaction.status === 'COMPLETED'
  const agreedPrice = transaction.agreedPriceInr ?? transaction.price ?? 450
  const otherParty = isSeller ? transaction.buyer : transaction.seller
  const allChecklistDone = itemMatches && conditionExpected && accessoriesIncluded

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8" style={{ paddingTop: '96px' }}>
        {/* Page Title & Deal Header */}
        <div className="theme-card rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold theme-muted">
                DEAL #{transaction.id ? transaction.id.slice(-8).toUpperCase() : 'HANDOVER'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                isCompleted ? 'badge-green' : 'badge-orange'
              }`}>
                {transaction.status?.replace('_', ' ') || 'ACTIVE'}
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl theme-title">
              {transaction.listing?.title || 'Campus Item Handover'}
            </h1>
            <p className="text-xs theme-muted mt-1">
              Trading Partner: <strong className="theme-title">{otherParty?.profile?.fullName || 'Student'}</strong> · Hostel: <strong className="theme-title">{otherParty?.profile?.hostel || 'Hostel'}</strong>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] theme-muted block uppercase font-bold">Agreed Value</span>
            <span className="font-heading font-extrabold text-2xl text-[#10B981] block">
              ₹{agreedPrice}
            </span>
          </div>
        </div>

        {/* ─── STATUS STEPPER TIMELINE ─── */}
        <div className="theme-card rounded-3xl p-5 shadow-xs">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {STATUS_STEPS.map((s, idx) => {
              const active =
                (s.id === 'ACCEPTED') ||
                (s.id === 'HANDOVER_PENDING') ||
                (s.id === 'OTP_VERIFICATION' && (transaction.status === 'OTP_GENERATED' || isCompleted)) ||
                (s.id === 'COMPLETED' && isCompleted)

              return (
                <div key={s.id} className="space-y-2">
                  <div className="flex items-center justify-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      active ? 'bg-[#E8602C] text-white shadow-xs' : 'theme-card-alt theme-muted'
                    }`}>
                      {active ? '✓' : idx + 1}
                    </div>
                  </div>
                  <span className={`font-semibold block text-[11px] ${active ? 'text-[#E8602C] font-bold' : 'theme-muted'}`}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════
            STATE 1: COMPLETED TRANSACTION BANNER & RECEIVER REVIEW
        ═════════════════════════════════════════════════════════ */}
        {isCompleted ? (
          <div className="space-y-6">
            <div className="theme-card rounded-3xl p-8 text-center space-y-3 border-2 border-[#10B981] shadow-2xl">
              <span className="text-5xl block">🎉</span>
              <h2 className="font-heading font-extrabold text-2xl text-[#10B981]">
                Handover Verified &amp; Completed!
              </h2>
              <p className="text-xs theme-muted max-w-md mx-auto leading-relaxed">
                The single-use OTP code was successfully verified in person. The product has been transferred and trust scores for both students have increased!
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-block px-6 py-2.5 rounded-xl bg-[#10B981] text-white font-bold text-xs shadow-xs hover:bg-[#059669] transition-colors"
                >
                  Back to Dashboard →
                </Link>
                <Link
                  href="/explore"
                  className="inline-block px-5 py-2.5 rounded-xl theme-card-alt border text-xs font-bold theme-title"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  Browse Marketplace
                </Link>
              </div>
            </div>

            {/* ─── RECEIVER FEEDBACK & PRODUCT RATING SECTION ─── */}
            {!isSeller && (
              <div className="theme-card rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl border" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    <div>
                      <h3 className="font-heading font-bold text-base theme-title">
                        Receiver Product Feedback &amp; Seller Rating
                      </h3>
                      <p className="text-xs theme-muted">
                        Rate the working condition and experience to update the seller's campus trust score.
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold badge-blue">
                    Receiver Review
                  </span>
                </div>

                {existingReview ? (
                  <div className="p-5 rounded-2xl theme-card-alt space-y-3 border" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base text-[#FBBF24]">
                          {'★'.repeat(existingReview.rating || 5)}{'☆'.repeat(5 - (existingReview.rating || 5))}
                        </span>
                        <span className="text-xs font-bold theme-title">
                          ({existingReview.rating}/5 Stars)
                        </span>
                      </div>
                      <span className="text-[10px] badge-green px-2 py-0.5 rounded-full font-bold">
                        ✓ Verified Purchase Review
                      </span>
                    </div>

                    <p className="text-xs theme-title leading-relaxed italic bg-[#0B0E17] p-3 rounded-xl border" style={{ borderColor: 'var(--border-color)' }}>
                      "{existingReview.comment || 'Item was in expected working condition.'}"
                    </p>

                    <div className="text-[10px] theme-muted flex items-center justify-between pt-1">
                      <span>Reviewed by {existingReview.reviewerName || 'You (Receiver)'}</span>
                      <span>{existingReview.createdAt ? new Date(existingReview.createdAt).toLocaleDateString() : 'Recently'}</span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    {/* Star Selector */}
                    <div>
                      <label className="block text-xs font-bold theme-title mb-2">
                        How accurately did the item match the description &amp; work in hostel?
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReceiverRating(star)}
                            className={`text-2xl transition-transform hover:scale-125 cursor-pointer ${
                              star <= receiverRating ? 'text-[#FBBF24]' : 'text-gray-600'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                        <span className="text-xs font-bold ml-2 theme-title">
                          {receiverRating === 5 && '🌟 Excellent / Perfect Condition'}
                          {receiverRating === 4 && '👍 Good / Working as Expected'}
                          {receiverRating === 3 && '👌 Average / Minor Wear'}
                          {receiverRating === 2 && '👎 Below Expectation'}
                          {receiverRating === 1 && '⚠️ Faulty / Poor'}
                        </span>
                      </div>
                    </div>

                    {/* Feedback Comment */}
                    <div>
                      <label className="block text-xs font-bold theme-title mb-1.5">
                        Product Feedback &amp; Verification Note:
                      </label>
                      <textarea
                        rows={3}
                        value={receiverComment}
                        onChange={(e) => setReceiverComment(e.target.value)}
                        placeholder="e.g. Tested in hostel room with my charger, working smoothly with all original accessories..."
                        className="w-full px-4 py-3 rounded-xl theme-input text-xs focus:outline-none focus:border-[#E8602C] resize-none"
                      />
                    </div>

                    {reviewSuccessMsg && (
                      <div className="p-3 rounded-xl bg-[#064E3B] text-xs text-[#6EE7B7] font-bold text-center">
                        {reviewSuccessMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-3 rounded-xl bg-[#E8602C] text-white font-heading font-bold text-xs hover:bg-[#CF4F20] transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      <span>⭐</span>
                      <span>{submittingReview ? 'Submitting Review...' : 'Submit Receiver Review & Award Trust Points'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ═════════════════════════════════════════════════════════
              STATE 2: ACTIVE HANDOVER SCREEN (SELLER VS BUYER VIEW)
          ═════════════════════════════════════════════════════════ */
          <div>
            {/* ──── SELLER VIEW (GIVER ACCOUNT) ──── */}
            {isSeller && (
              <div className="theme-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border-l-4 border-l-[#E8602C]">
                <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-2 font-heading font-bold text-base theme-title">
                    <span>🏪</span>
                    <span>Seller Account (Giver)</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold badge-orange uppercase">
                    Your Role: Giver / Seller
                  </span>
                </div>

                <div className="text-center space-y-2 max-w-md mx-auto">
                  <h3 className="font-heading font-extrabold text-2xl theme-title">
                    Ready to hand over your item?
                  </h3>
                  <p className="text-xs theme-muted leading-relaxed">
                    Meet the buyer at the hostel, let them inspect the item, then share your 6-digit handover code below.
                  </p>
                </div>

                {/* Handover Code Box for Seller */}
                <div className="p-8 rounded-3xl theme-card-alt text-center space-y-3 border" style={{ borderColor: 'var(--border-color)' }}>
                  <span className="text-xs font-mono theme-muted uppercase tracking-widest block font-bold">
                    YOUR 6-DIGIT HANDOVER CODE
                  </span>

                  {sellerOtp ? (
                    <div className="space-y-2">
                      <span className="font-mono font-extrabold text-5xl sm:text-6xl tracking-[0.3em] text-[#E8602C] block drop-shadow-md">
                        {sellerOtp.slice(0, 3)} {sellerOtp.slice(3)}
                      </span>
                      <span className="text-[11px] badge-green px-3 py-1 rounded-full inline-block font-bold">
                        ✓ Active Code · Valid for Handover
                      </span>
                    </div>
                  ) : (
                    <div className="py-4 space-y-3">
                      <p className="text-xs theme-muted">No active code generated yet.</p>
                      <button
                        type="button"
                        onClick={handleGenerateOTP}
                        disabled={generatingOtp}
                        className="px-6 py-3 rounded-xl bg-[#E8602C] text-white font-heading font-bold text-sm hover:bg-[#CF4F20] transition-all shadow-md cursor-pointer"
                      >
                        {generatingOtp ? 'Generating Code...' : '🔑 Generate 6-Digit Handover Code'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Warning message */}
                <div className="p-4 rounded-2xl bg-[#FEF3EC] dark:bg-[#2E180E] border border-[#FCD8C5] dark:border-[#6B3215] text-xs text-[#E8602C] flex items-center gap-3">
                  <span className="text-lg">⚠️</span>
                  <span>
                    <strong>Important:</strong> Show this code to the buyer <strong>only after</strong> they inspect the product and hand over the payment of <strong>₹{agreedPrice}</strong>.
                  </span>
                </div>

                {/* Seller Actions & Refresh Code */}
                {sellerOtp && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleGenerateOTP}
                      disabled={generatingOtp}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl theme-card-alt border text-xs font-bold theme-title hover:border-[#E8602C] transition-colors cursor-pointer flex items-center justify-center gap-2"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <span>🔄</span>
                      <span>{generatingOtp ? 'Regenerating...' : 'Regenerate New Code'}</span>
                    </button>

                    <label className="flex items-center gap-2 text-xs font-semibold theme-title cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cashReceivedConfirmed}
                        onChange={e => setCashReceivedConfirmed(e.target.checked)}
                        className="w-4 h-4 accent-[#10B981] rounded cursor-pointer"
                      />
                      <span>Confirmed: Received ₹{agreedPrice} in hand / online</span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* ──── BUYER VIEW (RECEIVER ACCOUNT) ──── */}
            {!isSeller && (
              <div className="theme-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border-l-4 border-l-[#2563EB]">
                <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-2 font-heading font-bold text-base theme-title">
                    <span>🛍️</span>
                    <span>Buyer Account (Receiver)</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold badge-blue uppercase">
                    Your Role: Receiver / Buyer
                  </span>
                </div>

                {/* Step 1: 3-Point Checklist */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading font-bold text-sm theme-title flex items-center gap-2">
                      <span>1️⃣</span> Step 1: In-Person Physical Inspection
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      allChecklistDone ? 'badge-green' : 'badge-orange'
                    }`}>
                      {allChecklistDone ? '✓ Verified' : 'Check All 3'}
                    </span>
                  </div>

                  <div className="theme-card-alt rounded-2xl p-4 space-y-3 border" style={{ borderColor: 'var(--border-color)' }}>
                    <label className="flex items-center gap-3 text-xs theme-title cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemMatches}
                        onChange={e => setItemMatches(e.target.checked)}
                        className="w-4 h-4 accent-[#2563EB] rounded cursor-pointer"
                      />
                      <span>Item physical condition matches photos and description</span>
                    </label>

                    <label className="flex items-center gap-3 text-xs theme-title cursor-pointer border-t pt-2" style={{ borderColor: 'var(--border-color)' }}>
                      <input
                        type="checkbox"
                        checked={conditionExpected}
                        onChange={e => setConditionExpected(e.target.checked)}
                        className="w-4 h-4 accent-[#2563EB] rounded cursor-pointer"
                      />
                      <span>All buttons, screens, and functions tested and working</span>
                    </label>

                    <label className="flex items-center gap-3 text-xs theme-title cursor-pointer border-t pt-2" style={{ borderColor: 'var(--border-color)' }}>
                      <input
                        type="checkbox"
                        checked={accessoriesIncluded}
                        onChange={e => setAccessoriesIncluded(e.target.checked)}
                        className="w-4 h-4 accent-[#2563EB] rounded cursor-pointer"
                      />
                      <span>All included accessories, cables, and parts are present</span>
                    </label>
                  </div>
                </div>

                {/* Step 2: Payment Settlement Mode */}
                <div className="space-y-3 border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
                  <h4 className="font-heading font-bold text-sm theme-title flex items-center gap-2">
                    <span>2️⃣</span> Step 2: Payment Settlement (₹{agreedPrice})
                  </h4>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => { setPaymentMode('UPI'); setShowPaymentGatewayModal(true); }}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        paymentMode === 'UPI' ? 'border-[#2563EB] bg-[#EBF4FF] dark:bg-[#1E3A8A]/30 text-[#2563EB]' : 'theme-card-alt theme-muted'
                      }`}
                    >
                      <span className="block text-base mb-0.5">💳</span>
                      <span>UPI / Online</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMode('CASH')}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        paymentMode === 'CASH' ? 'border-[#10B981] bg-[#ECFDF5] dark:bg-[#064E3B]/30 text-[#10B981]' : 'theme-card-alt theme-muted'
                      }`}
                    >
                      <span className="block text-base mb-0.5">💵</span>
                      <span>Cash in Hand</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMode('SCHEDULED')}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        paymentMode === 'SCHEDULED' ? 'border-[#8B5CF6] bg-[#F5F3FF] dark:bg-[#2E1065]/30 text-[#8B5CF6]' : 'theme-card-alt theme-muted'
                      }`}
                    >
                      <span className="block text-base mb-0.5">📅</span>
                      <span>Schedule Pay</span>
                    </button>
                  </div>

                  {paymentMode === 'UPI' && (
                    <div className="p-3 rounded-xl bg-[#EBF4FF] dark:bg-[#1E3A8A]/20 border border-[#BFDBFE] text-xs text-[#2563EB] flex items-center justify-between">
                      <span>{onlinePaid ? '✓ UPI Payment Verified: ₹' + agreedPrice : 'Pay ₹' + agreedPrice + ' via Campus UPI Gateway'}</span>
                      {!onlinePaid && (
                        <button
                          onClick={() => setShowPaymentGatewayModal(true)}
                          className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white font-bold text-xs cursor-pointer"
                        >
                          Open Gateway →
                        </button>
                      )}
                    </div>
                  )}

                  {paymentMode === 'SCHEDULED' && (
                    <div className="p-3 rounded-xl bg-[#F5F3FF] dark:bg-[#2E1065]/20 border border-[#DDD6FE] text-xs text-[#8B5CF6] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span>Repayment Date:</span>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={e => setScheduledDate(e.target.value)}
                          className="theme-input px-2 py-1 rounded text-xs"
                        />
                      </div>
                      <p className="text-[10px] opacity-80">Promissory pay later agreement logged for ₹{agreedPrice}.</p>
                    </div>
                  )}
                </div>

                {/* Step 3: Enter Seller's 6-Digit Code */}
                <form onSubmit={handleVerifyOTP} className="space-y-4 border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
                  <div>
                    <h4 className="font-heading font-bold text-sm theme-title flex items-center gap-2 mb-1">
                      <span>3️⃣</span> Step 3: Enter Seller's 6-Digit Code
                    </h4>
                    <p className="text-xs theme-muted mb-3">
                      Ask the seller for the 6-digit code shown on their screen.
                    </p>

                    {/* 6 Input Boxes */}
                    <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePasteOtp}>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <React.Fragment key={i}>
                          {i === 3 && <span className="font-bold theme-muted text-xl">-</span>}
                          <input
                            ref={el => { otpInputRefs.current[i] = el }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={otpDigits[i]}
                            onChange={e => handleDigitChange(i, e.target.value)}
                            onKeyDown={e => handleDigitKeyDown(i, e)}
                            disabled={!allChecklistDone}
                            placeholder="•"
                            className="w-10 h-12 sm:w-12 sm:h-14 text-center font-mono font-extrabold text-2xl rounded-xl theme-input focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/30 disabled:opacity-40"
                          />
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {!allChecklistDone && (
                    <p className="text-xs text-[#DC2626] font-semibold text-center">
                      ⚠️ Please check all 3 inspection checklist items in Step 1 to enable verification.
                    </p>
                  )}

                  {otpError && (
                    <div className="p-3 rounded-xl bg-[#2A1414] border border-[#5A2020] text-xs text-[#EF4444] font-semibold text-center">
                      ⚠️ {otpError}
                    </div>
                  )}

                  {otpSuccessMsg && (
                    <div className="p-3 rounded-xl bg-[#064E3B] text-xs text-[#6EE7B7] font-bold text-center">
                      {otpSuccessMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={otpVerifying || !allChecklistDone || otpDigits.join('').length !== 6}
                    className="w-full py-4 rounded-2xl bg-[#2563EB] text-white font-heading font-extrabold text-sm hover:bg-[#1D4ED8] transition-all disabled:opacity-40 shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>🛡️</span>
                    <span>{otpVerifying ? 'Verifying Code...' : 'Verify Code & Complete Handover'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ─── AI ASSISTANT CHATBOT & REAL-TIME 2-WAY CHAT ROOM ─── */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Embedded AI Assistant Chatbot */}
          <AITradeChatbot
            itemTitle={transaction.listing?.title || 'Campus Item'}
            agreedPrice={agreedPrice}
            role={isSeller ? 'SELLER' : 'BUYER'}
            onInsertPrompt={(txt) => setNewMessage(txt)}
          />

          {/* Real-Time Handover Chat */}
          <div className="theme-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">💬</span>
                <div>
                  <h3 className="font-heading font-bold text-base theme-title">
                    Real-Time Handover Chat &amp; Coordination
                  </h3>
                  <p className="text-[11px] theme-muted">
                    Live chat between <strong className="theme-title">{transaction.seller?.profile?.fullName || 'Seller'}</strong> and <strong className="theme-title">{transaction.buyer?.profile?.fullName || 'Buyer'}</strong>
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold badge-green flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>Real-Time Sync</span>
              </span>
            </div>

          {/* Chat Messages Thread */}
          <div ref={chatScrollRef} className="h-72 overflow-y-auto p-4 rounded-2xl theme-card-alt space-y-3 border" style={{ borderColor: 'var(--border-color)' }}>
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-xs theme-muted">
                No messages yet. Send a greeting to coordinate your handover spot!
              </div>
            ) : (
              messages.map((m, idx) => {
                const isMe = m.senderId === currentUser?.id || (isSeller && m.senderId === transaction.sellerId) || (!isSeller && m.senderId === transaction.buyerId)
                return (
                  <div
                    key={m.id || idx}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] theme-muted mb-0.5 px-1">
                      {isMe ? 'You' : (m.senderName || 'Trading Partner')}
                    </span>
                    <div
                      className={`max-w-md px-4 py-2.5 rounded-2xl text-xs ${
                        isMe
                          ? 'bg-[#E8602C] text-white rounded-br-none shadow-md font-medium'
                          : 'theme-card theme-title rounded-bl-none border shadow-md font-medium'
                      }`}
                      style={!isMe ? { borderColor: 'var(--border-color)' } : {}}
                    >
                      {m.content}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Message Input Form */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type message to coordinate handover location & time..."
              className="flex-1 px-4 py-3 rounded-xl theme-input text-xs focus:outline-none focus:border-[#E8602C]"
            />
            <button
              type="submit"
              disabled={sendingMessage || !newMessage.trim()}
              className="px-6 py-3 rounded-xl bg-[#E8602C] text-white font-heading font-bold text-xs hover:bg-[#CF4F20] transition-colors disabled:opacity-50 cursor-pointer"
            >
              Send →
            </button>
          </form>
        </div>
      </div>
    </main>

      {/* ─── ONLINE PAYMENT GATEWAY SAMPLE MODAL ─── */}
      {showPaymentGatewayModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="theme-card rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <span className="text-xl">💳</span>
                <h3 className="font-heading font-bold text-base theme-title">Campus UPI Gateway</h3>
              </div>
              <button
                onClick={() => setShowPaymentGatewayModal(false)}
                className="theme-muted hover:text-red-500 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl theme-card-alt text-center space-y-3 border" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-[11px] theme-muted uppercase font-bold block">Pay to Hostel Market Escrow</span>
              <span className="font-heading font-extrabold text-3xl text-[#10B981] block">
                ₹{agreedPrice}
              </span>
              <div className="w-32 h-32 rounded-2xl bg-white p-2 mx-auto border flex items-center justify-center shadow-md">
                <div className="text-center font-mono text-[9px] text-gray-800">
                  <span className="text-4xl block mb-1">📱</span>
                  UPI QR Code
                </div>
              </div>
              <span className="text-[10px] theme-muted font-mono block">UPI ID: hostelmarket@campus.upi</span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleMockPayOnline}
                disabled={gatewayProcessing}
                className="w-full py-3.5 rounded-xl bg-[#10B981] text-white font-heading font-bold text-xs hover:bg-[#059669] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>✓</span>
                <span>{gatewayProcessing ? 'Processing Transaction...' : 'Complete Payment (₹' + agreedPrice + ')'}</span>
              </button>
              <p className="text-[10px] text-center theme-muted">
                Simulated Sandbox Gateway · Instant digital payment confirmation
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
