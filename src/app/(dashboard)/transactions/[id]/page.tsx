'use client'

import React, { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Footer } from '@/components/ui/Footer'

const STATUS_STEPS = [
  { id: 'ACCEPTED', label: 'Offer Accepted' },
  { id: 'HANDOVER_PENDING', label: 'Handover Pending' },
  { id: 'OTP_GENERATED', label: 'OTP Generated' },
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

  // Chat State
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  // OTP State
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null)
  const [otpExpiresAt, setOtpExpiresAt] = useState<Date | null>(null)
  const [buyerOtpInput, setBuyerOtpInput] = useState('')
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)

  // Inspection Checklist State (for Buyer)
  const [inspectedCondition, setInspectedCondition] = useState(false)
  const [inspectedAccessories, setInspectedAccessories] = useState(false)
  const [inspectedWorking, setInspectedWorking] = useState(false)

  // Review Modal State
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  const loadData = async () => {
    try {
      const [txRes, userRes, msgRes] = await Promise.all([
        fetch(`/api/transactions/${id}`),
        fetch('/api/users/me'),
        fetch(`/api/messages?transactionId=${id}`),
      ])

      if (txRes.ok) {
        const txData = await txRes.json()
        const tx = txData.transaction || txData
        setTransaction(tx)
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
    } catch (err) {
      console.error(err)
      setError('Failed to load transaction.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 1500) // fast 1.5s sync for chat & OTP
    return () => clearInterval(interval)
  }, [id])

  useEffect(() => {
    scrollToBottom()
  }, [messages.length])

  // Seller generates OTP
  const handleGenerateOTP = async () => {
    setOtpError(null)
    try {
      const res = await fetch(`/api/transactions/${id}/generate-otp`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setGeneratedOtp(data.otp || data.otpCode)
        if (data.expiresAt) setOtpExpiresAt(new Date(data.expiresAt))
        loadData()
      } else {
        setOtpError(data.error || 'Failed to generate OTP')
      }
    } catch {
      setOtpError('Error generating OTP')
    }
  }

  // Buyer verifies OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setOtpError(null)
    setOtpVerifying(true)
    try {
      const res = await fetch(`/api/transactions/${id}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: buyerOtpInput.trim(), otpCode: buyerOtpInput.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setBuyerOtpInput('')
        loadData()
      } else {
        setOtpError(data.error || 'Invalid OTP code')
      }
    } catch {
      setOtpError('Error verifying OTP')
    } finally {
      setOtpVerifying(false)
    }
  }

  // Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    const content = newMessage.trim()
    setSendingMessage(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: id,
          content,
        }),
      })
      if (res.ok) {
        setNewMessage('')
        // Optimistically add message
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            content,
            senderId: currentUser?.id,
            senderName: currentUser?.profile?.fullName || 'You',
            createdAt: new Date().toISOString(),
          }
        ])
        loadData()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSendingMessage(false)
    }
  }

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setReviewSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      })
      if (res.ok) {
        setReviewSubmitted(true)
        loadData()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setReviewSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background" style={{ paddingTop: '80px' }}>
        <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full space-y-4">
          <div className="h-20 skeleton rounded-2xl" />
          <div className="h-64 skeleton rounded-3xl" />
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen flex flex-col bg-background" style={{ paddingTop: '80px' }}>
        <main className="flex-1 max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="font-heading font-bold text-2xl text-[#1A1A2E]">{error || 'Transaction not found'}</h2>
          <Link href="/dashboard" className="inline-block px-4 py-2 rounded-xl bg-[#E8602C] text-white text-xs font-semibold">
            Back to Dashboard
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const isSeller = transaction.sellerId === currentUser?.id || transaction.seller?.id === currentUser?.id || transaction.partyAId === currentUser?.id
  const isBuyer = transaction.buyerId === currentUser?.id || transaction.buyer?.id === currentUser?.id || transaction.partyBId === currentUser?.id
  const otherParty = isSeller ? (transaction.buyer || transaction.partyB) : (transaction.seller || transaction.partyA)
  const isCompleted = transaction.status === 'COMPLETED'
  const isOtpGenerated = transaction.status === 'OTP_GENERATED'
  const agreedPrice = transaction.agreedPriceInr ?? transaction.price ?? transaction.agreedValue?.amount
  const listingId = transaction.listing?.id || transaction.listingId
  const allInspected = inspectedCondition && inspectedAccessories && inspectedWorking

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8" style={{ paddingTop: '80px' }}>
        {/* Transaction Header */}
        <div className="rounded-3xl bg-white border border-[#E5E2DD] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-[#6B7280]">
                TRANSACTION #{transaction.id ? transaction.id.slice(-8).toUpperCase() : 'DEAL'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                isCompleted ? 'bg-[#ECFDF5] text-[#2D6A4F]' : 'bg-[#FEF3EC] text-[#E8602C]'
              }`}>
                {(transaction.status || 'ACTIVE').replace('_', ' ')}
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-[#1A1A2E]">
              {transaction.listing?.title || 'Campus Item Trade'}
            </h1>
            <p className="text-xs text-[#6B7280] mt-1">
              Trading with <strong>{otherParty?.profile?.fullName || 'Student'}</strong> · Hostel: <strong>{otherParty?.profile?.hostel || 'Campus Block'}</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-[#6B7280] block uppercase font-semibold">Agreed Trade Value</span>
            <span className="font-heading font-extrabold text-2xl text-[#1A1A2E]">
              {agreedPrice !== undefined && agreedPrice !== null && agreedPrice > 0 ? `₹${Number(agreedPrice).toLocaleString('en-IN')}` : 'Item / Skill Swap'}
            </span>
          </div>
        </div>

        {/* Status Stepper Timeline */}
        <div className="bg-white rounded-3xl border border-[#E5E2DD] p-6 shadow-xs">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {STATUS_STEPS.map((s, idx) => {
              const active =
                (s.id === 'ACCEPTED' && ['ACCEPTED', 'HANDOVER_PENDING', 'OTP_GENERATED', 'VERIFIED', 'COMPLETED'].includes(transaction.status)) ||
                (s.id === 'HANDOVER_PENDING' && ['HANDOVER_PENDING', 'OTP_GENERATED', 'VERIFIED', 'COMPLETED'].includes(transaction.status)) ||
                (s.id === 'OTP_GENERATED' && ['OTP_GENERATED', 'VERIFIED', 'COMPLETED'].includes(transaction.status)) ||
                (s.id === 'COMPLETED' && transaction.status === 'COMPLETED')

              return (
                <div key={s.id} className="space-y-2">
                  <div className={`h-2 rounded-full transition-colors ${active ? 'bg-[#2D6A4F]' : 'bg-[#E5E2DD]'}`} />
                  <span className={`font-semibold block text-[11px] ${active ? 'text-[#2D6A4F]' : 'text-[#6B7280]'}`}>
                    {idx + 1}. {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: OTP Handover & Inspection Checklist Module */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl border border-[#E5E2DD] p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E5E2DD] pb-3">
                <h3 className="font-heading font-bold text-base text-[#1A1A2E] flex items-center gap-2">
                  <span>🔑</span> Secure In-Person Handover
                </h3>
                <span className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-wider">
                  Single-Use OTP
                </span>
              </div>

              {otpError && (
                <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626]">
                  {otpError}
                </div>
              )}

              {/* State A: Completed */}
              {isCompleted ? (
                <div className="p-6 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-center space-y-2 text-[#065F46]">
                  <span className="text-4xl">🎉</span>
                  <h4 className="font-heading font-bold text-lg">Handover Verified & Completed!</h4>
                  <p className="text-xs">
                    The item was inspected in person and verified via single-use OTP. Trust scores have been increased for both parties.
                  </p>
                </div>
              ) : isSeller ? (
                /* ─── SELLER VIEW: Generate OTP ─── */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#FFF8F3] border border-[#FCD8C5] text-xs text-[#E8602C] space-y-1.5">
                    <p className="font-semibold">Seller Handover Instructions:</p>
                    <p className="text-[11px] text-[#9C5838]">
                      1. Meet the buyer at the agreed hostel block.<br />
                      2. Let them inspect the item and test all functions.<br />
                      3. Generate the 6-digit OTP below and share it with them to confirm receipt.
                    </p>
                  </div>

                  {generatedOtp ? (
                    <div className="p-6 rounded-2xl bg-[#1A1A2E] text-white text-center space-y-2">
                      <span className="text-[11px] text-[#E5E2DD]/70 uppercase tracking-widest block font-semibold">
                        Your Handover OTP Code
                      </span>
                      <span className="font-mono font-extrabold text-4xl tracking-[0.3em] text-[#E8602C] block">
                        {generatedOtp}
                      </span>
                      <p className="text-[11px] text-[#E5E2DD]/60">
                        Valid for 10 minutes. Share this only after the recipient has inspected the item.
                      </p>
                    </div>
                  ) : isOtpGenerated ? (
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E2DD] text-center space-y-2">
                      <p className="text-xs font-semibold text-[#1A1A2E]">An OTP is currently active for this transaction.</p>
                      <button
                        onClick={handleGenerateOTP}
                        className="px-4 py-2 rounded-xl bg-[#E8602C] text-white text-xs font-bold hover:bg-[#CF4F20] cursor-pointer"
                      >
                        Generate New Code (Max 3)
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerateOTP}
                      className="w-full py-3.5 rounded-xl bg-[#E8602C] text-white font-heading font-bold text-sm hover:bg-[#CF4F20] transition-colors shadow-xs cursor-pointer"
                    >
                      Generate 6-Digit Handover OTP →
                    </button>
                  )}
                </div>
              ) : (
                /* ─── BUYER VIEW: Inspection Checklist & Enter OTP ─── */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E2DD] space-y-3">
                    <span className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wider block">
                      Step 1: Recipient Inspection Checklist
                    </span>
                    <p className="text-xs text-[#6B7280]">
                      Please inspect the item before confirming receipt:
                    </p>

                    <div className="space-y-2 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={inspectedCondition}
                          onChange={(e) => setInspectedCondition(e.target.checked)}
                          className="rounded text-[#2D6A4F] focus:ring-[#2D6A4F]"
                        />
                        <span>Physical condition matches description and photos</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={inspectedWorking}
                          onChange={(e) => setInspectedWorking(e.target.checked)}
                          className="rounded text-[#2D6A4F] focus:ring-[#2D6A4F]"
                        />
                        <span>All buttons, screens, and functions tested and working</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={inspectedAccessories}
                          onChange={(e) => setInspectedAccessories(e.target.checked)}
                          className="rounded text-[#2D6A4F] focus:ring-[#2D6A4F]"
                        />
                        <span>All agreed accessories/cables are present</span>
                      </label>
                    </div>
                  </div>

                  <form onSubmit={handleVerifyOTP} className="space-y-3">
                    <span className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wider block">
                      Step 2: Enter Seller's 6-Digit OTP
                    </span>

                    <input
                      type="text"
                      maxLength={6}
                      value={buyerOtpInput}
                      onChange={(e) => setBuyerOtpInput(e.target.value)}
                      placeholder="e.g. 123456"
                      disabled={!allInspected}
                      className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 rounded-xl border border-[#E5E2DD] focus:outline-none focus:border-[#2D6A4F] disabled:bg-gray-100"
                    />

                    {!allInspected && (
                      <p className="text-[11px] text-[#DC2626]">
                        ⚠️ Please check all 3 inspection items above to enable OTP verification.
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={otpVerifying || !allInspected || buyerOtpInput.trim().length !== 6}
                      className="w-full py-3.5 rounded-xl bg-[#2D6A4F] text-white font-heading font-bold text-sm hover:bg-[#23533E] transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
                    >
                      {otpVerifying ? 'Verifying OTP...' : 'Confirm Receipt & Complete Trade →'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Post-Completion Review Module */}
            {isCompleted && (
              <div className="bg-white rounded-3xl border border-[#E5E2DD] p-6 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                  Rate Your Experience with {otherParty?.profile?.fullName || 'Student'}
                </h3>

                {reviewSubmitted ? (
                  <div className="p-4 rounded-xl bg-[#ECFDF5] text-xs text-[#065F46] font-semibold text-center">
                    ✓ Review submitted! Thank you for supporting campus trust.
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#6B7280]">Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`text-xl cursor-pointer ${star <= reviewRating ? 'text-amber-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Was the student punctual? Was the item in described condition?"
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                    />

                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="px-4 py-2 rounded-xl bg-[#1A1A2E] text-white text-xs font-bold hover:bg-[#E8602C] transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Embedded Real-time Chat Panel */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl border border-[#E5E2DD] shadow-xs flex flex-col h-[560px] overflow-hidden">
              {/* Chat Header */}
              <div className="p-4 border-b border-[#E5E2DD] flex items-center justify-between bg-[#FAF8F5]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#1A1A2E] text-white flex items-center justify-center font-bold text-xs">
                    {otherParty?.profile?.fullName?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-[#1A1A2E]">
                      {otherParty?.profile?.fullName || 'Student'}
                    </h4>
                    <span className="text-[11px] text-[#2D6A4F] font-semibold">
                      Trust Score: {typeof otherParty?.trustScore === 'number' ? otherParty.trustScore : (otherParty?.trustScore?.score || 80)}/100
                    </span>
                  </div>
                </div>

                {listingId && (
                  <Link
                    href={`/products/${listingId}`}
                    className="text-xs text-[#E8602C] font-semibold hover:underline"
                  >
                    View Item Listing
                  </Link>
                )}
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F7F5F2]/50">
                {messages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#6B7280]">
                    No messages yet. Send a message below to arrange a meeting spot.
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const currentUid = String(currentUser?.id || currentUser?._id || '')
                    const senderUid = String(m.senderId || '')
                    const isMine = senderUid === currentUid

                    return (
                      <div
                        key={m.id || idx}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        {!isMine && (
                          <span className="text-[10px] font-bold text-[#6B7280] mb-0.5 px-1">
                            {m.senderName || otherParty?.profile?.fullName || 'Student'}
                          </span>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                            isMine
                              ? 'bg-[#1A1A2E] text-white rounded-br-none'
                              : 'bg-white border border-[#E5E2DD] text-[#1A1A2E] rounded-bl-none shadow-xs'
                          }`}
                        >
                          <p>{m.content}</p>
                        </div>
                        <span className="text-[10px] text-[#9CA3AF] mt-0.5 px-1">
                          {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E5E2DD] bg-white flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message to coordinate meetup..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                />
                <button
                  type="submit"
                  disabled={sendingMessage || !newMessage.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#E8602C] text-white text-xs font-bold hover:bg-[#CF4F20] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
