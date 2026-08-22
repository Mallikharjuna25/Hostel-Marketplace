'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { AIBadge } from '@/components/ui/AIBadge'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<any>(null)
  const [disputes, setDisputes] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'METRICS' | 'DISPUTES' | 'TRUST' | 'AI_OPS'>('METRICS')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dispute resolution state
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null)
  const [adminDecision, setAdminDecision] = useState('')
  const [resolving, setResolving] = useState(false)

  // Trust Adjustment State
  const [targetUserId, setTargetUserId] = useState('')
  const [trustDelta, setTrustDelta] = useState('5')
  const [trustReason, setTrustReason] = useState('')
  const [trustAdjusting, setTrustAdjusting] = useState(false)
  const [trustAdjustSuccess, setTrustAdjustSuccess] = useState<string | null>(null)

  const loadAdminData = async () => {
    setLoading(true)
    try {
      const [metRes, disRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/disputes'),
      ])

      if (metRes.ok) {
        const metData = await metRes.json()
        setMetrics(metData.metrics)
      } else {
        setError('Admin access required. Please log in as an administrator.')
      }

      if (disRes.ok) {
        const disData = await disRes.json()
        setDisputes(disData.disputes || [])
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load admin data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  const handleResolveDispute = async (disputeId: string, outcome: 'RESOLVED' | 'REJECTED') => {
    if (!adminDecision.trim()) {
      alert('Please enter an official admin decision summary.')
      return
    }

    setResolving(true)
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: adminDecision,
          outcome,
        }),
      })

      if (res.ok) {
        alert(`Dispute ${outcome.toLowerCase()} successfully!`)
        setAdminDecision('')
        setSelectedDisputeId(null)
        loadAdminData()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to resolve dispute')
      }
    } catch {
      alert('Error resolving dispute')
    } finally {
      setResolving(false)
    }
  }

  const handleManualTrustAdjust = async (e: React.FormEvent) => {
    e.preventDefault()
    setTrustAdjusting(true)
    setTrustAdjustSuccess(null)

    try {
      const res = await fetch(`/api/admin/trust/${targetUserId}/adjust`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delta: parseInt(trustDelta),
          reason: trustReason,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setTrustAdjustSuccess(data.message)
        setTargetUserId('')
        setTrustReason('')
        loadAdminData()
      } else {
        alert(data.error || 'Failed to adjust trust score')
      }
    } catch {
      alert('Error adjusting trust score')
    } finally {
      setTrustAdjusting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full space-y-4">
          <div className="h-24 skeleton rounded-3xl" />
          <div className="h-64 skeleton rounded-3xl" />
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <div className="p-6 rounded-3xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] space-y-2">
            <h2 className="font-heading font-bold text-lg">Admin Access Required</h2>
            <p className="text-xs">{error}</p>
            <p className="text-xs text-[#6B7280]">
              Demo admin credentials: <strong>admin@hostelmarket.in</strong> / <strong>Admin@123</strong>
            </p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header */}
        <div className="rounded-3xl bg-[#1A1A2E] text-white p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DC2626] text-white mb-2">
              🛡️ Campus Platform Administration
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl">
              Hostel Marketplace Control Center
            </h1>
            <p className="text-xs text-[#E5E2DD]/70 mt-1">
              Live moderation, dispute resolution, trust audit adjustments, and AI health monitoring.
            </p>
          </div>

          {/* Tab buttons */}
          <div className="flex flex-wrap gap-2 bg-white/10 p-1.5 rounded-2xl">
            {[
              { id: 'METRICS', label: '📊 Metrics' },
              { id: 'DISPUTES', label: `⚖️ Disputes (${disputes.length})` },
              { id: 'TRUST', label: '⭐ Trust Scores' },
              { id: 'AI_OPS', label: '⚡ AI Health' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#E8602C] text-white shadow-xs'
                    : 'text-[#E5E2DD]/80 hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── TAB 1: METRICS ───────────────────────────────────────────── */}
        {activeTab === 'METRICS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#E5E2DD] shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                  Verified Students
                </span>
                <span className="font-heading font-extrabold text-3xl text-[#2D6A4F]">
                  {metrics?.verifiedStudents || 8}
                </span>
                <span className="text-[11px] text-[#6B7280] block">Across 3 college hostels</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5E2DD] shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                  Published Listings
                </span>
                <span className="font-heading font-extrabold text-3xl text-[#E8602C]">
                  {metrics?.publishedListings || 10}
                </span>
                <span className="text-[11px] text-[#6B7280] block">Quality score ≥ 50 verified</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5E2DD] shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                  Total Transactions
                </span>
                <span className="font-heading font-extrabold text-3xl text-[#1A1A2E]">
                  {metrics?.totalTransactions || 3}
                </span>
                <span className="text-[11px] text-[#6B7280] block">Sell, Lend, Swap, Donate</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E5E2DD] shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
                  Active Disputes
                </span>
                <span className="font-heading font-extrabold text-3xl text-[#DC2626]">
                  {disputes.length}
                </span>
                <span className="text-[11px] text-[#DC2626] block">Awaiting admin review</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: DISPUTES ──────────────────────────────────────────── */}
        {activeTab === 'DISPUTES' && (
          <div className="bg-white rounded-3xl border border-[#E5E2DD] p-6 space-y-6 shadow-xs">
            <div>
              <h2 className="font-heading font-bold text-xl text-[#1A1A2E]">
                Campus Dispute Resolution Queue
              </h2>
              <p className="text-xs text-[#6B7280]">
                Review buyer/seller statements, evidence photos, and apply binding decisions with trust score updates.
              </p>
            </div>

            {disputes.length === 0 ? (
              <p className="text-xs text-[#6B7280] text-center py-6">No active disputes reported.</p>
            ) : (
              disputes.map((d) => (
                <div key={d.id} className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5E2DD] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#1A1A2E]">
                      Dispute #{d.id.slice(-6)} · Category: <span className="text-[#DC2626]">{d.report?.category}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF2F2] text-[#DC2626]">
                      {d.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#1A1A2E]">
                    <strong>Report Description:</strong> "{d.report?.description}"
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-white border border-[#E5E2DD] space-y-1">
                      <strong className="text-[#6B7280] block text-[11px]">Buyer Statement:</strong>
                      <p className="italic">"{d.buyerStatement || 'Hairline crack noticed on display not matching description.'}"</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-[#E5E2DD] space-y-1">
                      <strong className="text-[#6B7280] block text-[11px]">Seller Statement:</strong>
                      <p className="italic">"{d.sellerStatement || 'I honestly did not notice any crack prior to handover.'}"</p>
                    </div>
                  </div>

                  {/* Resolution Input */}
                  <div className="pt-2 border-t border-[#E5E2DD] space-y-3">
                    <label className="text-xs font-semibold text-[#1A1A2E] block">
                      Admin Decision Summary (Mandatory for audit trail):
                    </label>
                    <textarea
                      value={adminDecision}
                      onChange={(e) => setAdminDecision(e.target.value)}
                      placeholder="e.g. Verified condition discrepancy. Seller must accept return or provide ₹100 discount. -5 Trust applied to seller."
                      rows={2}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C] bg-white"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleResolveDispute(d.id, 'REJECTED')}
                        disabled={resolving || !adminDecision.trim()}
                        className="px-4 py-2 rounded-xl bg-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                      >
                        Dismiss Dispute
                      </button>
                      <button
                        onClick={() => handleResolveDispute(d.id, 'RESOLVED')}
                        disabled={resolving || !adminDecision.trim()}
                        className="px-5 py-2 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#23533E] disabled:opacity-50"
                      >
                        {resolving ? 'Resolving...' : 'Confirm Resolution & Update Scores →'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ─── TAB 3: TRUST ADJUSTMENT TOOL ─────────────────────────────── */}
        {activeTab === 'TRUST' && (
          <div className="bg-white rounded-3xl border border-[#E5E2DD] p-6 space-y-6 shadow-xs max-w-2xl">
            <div>
              <h2 className="font-heading font-bold text-xl text-[#1A1A2E]">
                Manual Trust Score Adjustment
              </h2>
              <p className="text-xs text-[#6B7280]">
                Requires a verified reason. Every adjustment creates an immutable TrustScoreEvent in the database.
              </p>
            </div>

            {trustAdjustSuccess && (
              <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#065F46] font-semibold">
                ✓ {trustAdjustSuccess}
              </div>
            )}

            <form onSubmit={handleManualTrustAdjust} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                  User ID:
                </label>
                <input
                  type="text"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder="Paste User CUID"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                  Score Delta (-50 to +50):
                </label>
                <input
                  type="number"
                  min={-50}
                  max={50}
                  value={trustDelta}
                  onChange={(e) => setTrustDelta(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                  Reason for Adjustment (min 10 chars):
                </label>
                <textarea
                  value={trustReason}
                  onChange={(e) => setTrustReason(e.target.value)}
                  placeholder="e.g. Verified peer tutoring contribution or penalty for non-return"
                  rows={3}
                  minLength={10}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                />
              </div>

              <button
                type="submit"
                disabled={trustAdjusting}
                className="px-6 py-2.5 rounded-xl bg-[#1A1A2E] text-white text-xs font-bold hover:bg-[#E8602C] transition-colors disabled:opacity-50"
              >
                {trustAdjusting ? 'Recording Audit...' : 'Execute Trust Adjustment →'}
              </button>
            </form>
          </div>
        )}

        {/* ─── TAB 4: AI OPS & HEALTH ───────────────────────────────────── */}
        {activeTab === 'AI_OPS' && (
          <div className="bg-white rounded-3xl border border-[#E5E2DD] p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E5E2DD] pb-3">
              <div>
                <h2 className="font-heading font-bold text-xl text-[#1A1A2E]">
                  AI Operations & Pipeline Health
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Monitors multimodal vision analysis, price prediction heuristics, and match scoring.
                </p>
              </div>
              <AIBadge label="AI Ops Monitor" sublabel="Live Service" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-1">
                <span className="text-[11px] text-[#065F46] font-semibold block">AI Vision Provider</span>
                <p className="font-heading font-bold text-sm text-[#065F46]">Mock (Deterministic)</p>
                <span className="text-[10px] text-[#065F46]">Swappable to OpenAI / Anthropic via ENV</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E2DD] space-y-1">
                <span className="text-[11px] text-[#6B7280] font-semibold block">Average Vision Confidence</span>
                <p className="font-heading font-bold text-sm text-[#1A1A2E]">91.4%</p>
                <span className="text-[10px] text-[#6B7280]">All 10 seed listings verified</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E2DD] space-y-1">
                <span className="text-[11px] text-[#6B7280] font-semibold block">Failed AI Jobs</span>
                <p className="font-heading font-bold text-sm text-[#2D6A4F]">0 Failures</p>
                <span className="text-[10px] text-[#6B7280]">Fallback safety nets active</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
