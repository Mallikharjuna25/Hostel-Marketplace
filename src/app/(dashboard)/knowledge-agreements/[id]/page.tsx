'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { AIBadge } from '@/components/ui/AIBadge'

export default function KnowledgeAgreementPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [agreement, setAgreement] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Proof upload state
  const [proofNote, setProofNote] = useState('')
  const [proofSubmitting, setProofSubmitting] = useState(false)
  const [proofResult, setProofResult] = useState<any>(null)

  const loadData = async () => {
    try {
      const [txRes, userRes] = await Promise.all([
        fetch(`/api/transactions/${id}`),
        fetch('/api/users/me'),
      ])

      if (txRes.ok) {
        const txData = await txRes.json()
        setAgreement(txData.transaction?.knowledgeAgreement)
      }

      if (userRes.ok) {
        const userData = await userRes.json()
        setCurrentUser(userData)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load knowledge agreement.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  const handleApproveAgreement = async () => {
    if (!agreement) return
    try {
      const res = await fetch(`/api/knowledge-agreement/${agreement.id}/approve`, {
        method: 'PUT',
      })
      if (res.ok) {
        alert('Agreement approved!')
        loadData()
      }
    } catch {
      alert('Failed to approve agreement')
    }
  }

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreement) return
    setProofSubmitting(true)
    try {
      const res = await fetch('/api/proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agreementId: agreement.id,
          note: proofNote,
          fileUrls: ['/uploads/proofs/tutoring-notes-and-solutions.pdf'],
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setProofResult(data.proof)
        setProofNote('')
        loadData()
      } else {
        alert(data.error || 'Failed to submit proof')
      }
    } catch {
      alert('Error submitting proof')
    } finally {
      setProofSubmitting(false)
    }
  }

  const handleProofStatus = async (proofId: string, status: string) => {
    try {
      const res = await fetch(`/api/proof/${proofId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        alert(`Proof marked as ${status}!`)
        loadData()
      }
    } catch {
      alert('Failed to update proof status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full space-y-4">
          <div className="h-20 skeleton rounded-2xl" />
          <div className="h-64 skeleton rounded-3xl" />
        </main>
        <Footer />
      </div>
    )
  }

  const isItemProvider = agreement?.itemProviderId === currentUser?.id
  const isKnowledgeProvider = agreement?.knowledgeProviderId === currentUser?.id
  const proofs = agreement?.proofs || []

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header */}
        <div className="rounded-3xl bg-white border border-[#E5E2DD] p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
              Knowledge & Tutoring Swap
            </span>
            <AIBadge label="AI Proof Verification" sublabel="Coverage Analysis" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-[#1A1A2E]">
            Knowledge Exchange Agreement & Verification
          </h1>
          <p className="text-xs text-[#6B7280]">
            Physical items exchanged for academic tutoring or coding skills under formal terms.
          </p>
        </div>

        {/* Agreement Details Card */}
        <div className="bg-white rounded-3xl border border-[#E5E2DD] p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E2DD] pb-3">
            <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
              Agreement Terms & Deliverables
            </h3>
            <div className="flex gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                agreement?.approvedByItemProvider ? 'bg-[#ECFDF5] text-[#2D6A4F]' : 'bg-[#FFFBEB] text-[#92400E]'
              }`}>
                {agreement?.approvedByItemProvider ? '✓ Item Provider Approved' : '⏳ Item Provider Pending'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                agreement?.approvedByKnowledgeProvider ? 'bg-[#ECFDF5] text-[#2D6A4F]' : 'bg-[#FFFBEB] text-[#92400E]'
              }`}>
                {agreement?.approvedByKnowledgeProvider ? '✓ Tutor Approved' : '⏳ Tutor Pending'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] space-y-1">
              <span className="text-[11px] text-[#6B7280] font-semibold block uppercase">Item Exchanged:</span>
              <p className="font-heading font-bold text-sm text-[#1A1A2E]">{agreement?.itemDescription || 'Textbook / Gear'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF8F5] space-y-1">
              <span className="text-[11px] text-[#6B7280] font-semibold block uppercase">Knowledge Delivered:</span>
              <p className="font-heading font-bold text-sm text-[#7C3AED]">{agreement?.knowledgeDescription || 'Tutoring Sessions'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] sm:col-span-2 space-y-1">
              <span className="text-[11px] text-[#6B7280] font-semibold block uppercase">Expected Scope of Work:</span>
              <p className="text-[#1A1A2E] leading-relaxed">{agreement?.expectedWork || 'Cover topics and provide notes.'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] sm:col-span-2 space-y-1">
              <span className="text-[11px] text-[#6B7280] font-semibold block uppercase">Completion Criteria:</span>
              <p className="text-[#1A1A2E] leading-relaxed">{agreement?.completionCriteria || 'Solve practice problem set.'}</p>
            </div>
          </div>

          {/* Approve Button */}
          {((isItemProvider && !agreement?.approvedByItemProvider) ||
            (isKnowledgeProvider && !agreement?.approvedByKnowledgeProvider)) && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleApproveAgreement}
                className="px-6 py-2.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#23533E]"
              >
                Approve Agreement Terms →
              </button>
            </div>
          )}
        </div>

        {/* Proof of Work Submissions */}
        <div className="bg-white rounded-3xl border border-[#E5E2DD] p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E2DD] pb-3">
            <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
              Submitted Proofs of Work
            </h3>
            <span className="text-xs text-[#6B7280]">{proofs.length} submission(s)</span>
          </div>

          {proofs.length === 0 ? (
            <p className="text-xs text-[#6B7280] text-center py-4">
              No proof of work submitted yet. The knowledge provider can upload session notes or test results below.
            </p>
          ) : (
            proofs.map((proof: any) => (
              <div key={proof.id} className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5E2DD] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1A1A2E]">
                    Submitted by Tutor on {new Date(proof.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    proof.status === 'ACCEPTED' ? 'bg-[#ECFDF5] text-[#2D6A4F]' : 'bg-[#FFFBEB] text-[#92400E]'
                  }`}>
                    {proof.status}
                  </span>
                </div>

                <p className="text-xs text-[#1A1A2E] italic">"{proof.note || 'Notes and solutions attached.'}"</p>

                {/* AI Proof Coverage Analysis Pill */}
                {proof.aiCoverage && (
                  <div className="p-3 rounded-xl bg-[#FFF8F3] border border-[#FCD8C5] text-xs text-[#E8602C] space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="block text-[11px]">AI Coverage Estimate: {proof.aiCoverage}%</strong>
                      <AIBadge label="AI Audited" sublabel="Not a guarantee" />
                    </div>
                    <p className="text-[11px] text-[#9C5838] leading-relaxed">{proof.aiSummary}</p>
                  </div>
                )}

                {/* Receiver Actions */}
                {isItemProvider && proof.status !== 'ACCEPTED' && (
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => handleProofStatus(proof.id, 'REVISION_REQUESTED')}
                      className="px-3.5 py-1.5 rounded-lg border border-[#E5E2DD] bg-white text-xs font-semibold text-[#1A1A2E] hover:bg-[#F7F5F2]"
                    >
                      Request Revision
                    </button>
                    <button
                      onClick={() => handleProofStatus(proof.id, 'ACCEPTED')}
                      className="px-4 py-1.5 rounded-lg bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#23533E]"
                    >
                      Accept Proof & Complete Swap →
                    </button>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Upload Proof Form (for Knowledge Provider) */}
          {isKnowledgeProvider && (
            <form onSubmit={handleSubmitProof} className="pt-4 border-t border-[#E5E2DD] space-y-3">
              <h4 className="font-heading font-bold text-sm text-[#1A1A2E]">
                Submit New Proof of Work
              </h4>
              <textarea
                value={proofNote}
                onChange={(e) => setProofNote(e.target.value)}
                placeholder="Describe the sessions completed, topics covered, and student performance..."
                rows={3}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#7C3AED]"
              />

              <div className="flex items-center justify-between">
                <input
                  type="file"
                  className="text-xs text-[#6B7280] file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-[#1A1A2E] file:text-white"
                />
                <button
                  type="submit"
                  disabled={proofSubmitting || !proofNote.trim()}
                  className="px-5 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-bold hover:bg-[#6D28D9] disabled:opacity-50"
                >
                  {proofSubmitting ? 'Analyzing & Submitting...' : 'Submit Proof for AI Review →'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
