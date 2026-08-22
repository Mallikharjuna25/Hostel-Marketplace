'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { AIBadge } from '@/components/ui/AIBadge'

export default function DonationApplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [listing, setListing] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectingId, setSelectingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchApps() {
      setLoading(true)
      try {
        const res = await fetch(`/api/donation/${id}/applications`)
        if (res.ok) {
          const data = await res.json()
          setListing(data.listing)
          setApplications(data.applications || [])
        } else {
          setError('Failed to fetch donation applications or unauthorized.')
        }
      } catch (err) {
        console.error(err)
        setError('Error loading applications.')
      } finally {
        setLoading(false)
      }
    }
    fetchApps()
  }, [id])

  const handleSelectRecipient = async (appId: string) => {
    if (!confirm('Are you sure you want to select this student as the recipient? A handover transaction will be created.')) {
      return
    }

    setSelectingId(appId)
    try {
      const res = await fetch(`/api/donation/${id}/select/${appId}`, {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok) {
        alert('Recipient selected! Redirecting to the handover transaction...')
        router.push(`/transactions/${data.transaction.id}`)
      } else {
        alert(data.error || 'Failed to select recipient')
      }
    } catch {
      alert('Error selecting recipient')
    } finally {
      setSelectingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full space-y-4">
          <div className="h-20 skeleton rounded-2xl" />
          <div className="h-64 skeleton rounded-3xl" />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Header with AI transparency banner */}
        <div className="rounded-3xl bg-white border border-[#E5E2DD] p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-[#2D6A4F] uppercase tracking-wider block">
                Free Donation Matching
              </span>
              <h1 className="font-heading font-extrabold text-2xl text-[#1A1A2E] mt-1">
                Applicants for "{listing?.title || 'Donation Item'}"
              </h1>
            </div>
            <AIBadge label="AI Recommendation" sublabel="Donor Retains Final Choice" />
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF8F3] border border-[#FCD8C5] text-xs text-[#E8602C] space-y-1">
            <p className="font-semibold">Human-in-the-Loop Principle:</p>
            <p className="text-[11px] text-[#9C5838] leading-relaxed">
              AI evaluates <strong>Eligibility Match Scores</strong> based on academic relevance, course alignment, and verified need. This is strictly a <strong>recommendation</strong> — you may choose any applicant who best fits your preference.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626]">
            {error}
          </div>
        )}

        {/* Applications Ranked List */}
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-dashed border-[#E5E2DD] text-center text-xs text-[#6B7280]">
              No student applications submitted yet for this donation.
            </div>
          ) : (
            applications.map((app, idx) => {
              const isSelected = app.selected
              const applicantName = app.applicant?.profile?.fullName || 'Student'
              const applicantCollege = app.applicant?.profile?.college || 'Campus'
              const applicantDept = app.applicant?.profile?.department || 'Department'
              const trustScore = app.applicant?.trustScore?.score || 50

              return (
                <div
                  key={app.id}
                  className={`rounded-3xl border p-6 transition-all space-y-4 ${
                    isSelected
                      ? 'bg-[#ECFDF5] border-[#A7F3D0] shadow-sm'
                      : idx === 0
                      ? 'bg-white border-[#E8602C] shadow-md ring-1 ring-[#E8602C]/20'
                      : 'bg-white border-[#E5E2DD] shadow-xs hover:border-[#D1C9C0]'
                  }`}
                >
                  {/* Top Row: Applicant Info & Overall Match Pill */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#1A1A2E] text-white flex items-center justify-center font-heading font-bold text-base">
                        {applicantName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                            {applicantName}
                          </h3>
                          {idx === 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3EC] text-[#E8602C] border border-[#FCD8C5]">
                              ★ Top Ranked AI Match
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#6B7280]">
                          {applicantDept} · {applicantCollege} · Trust: <strong className="text-[#2D6A4F]">{trustScore}/100</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                      <span className="text-[10px] text-[#6B7280] uppercase font-semibold">Eligibility Match</span>
                      <span className="font-heading font-extrabold text-2xl text-[#2D6A4F]">
                        {app.overallMatch || 75}<span className="text-xs font-normal">/100</span>
                      </span>
                    </div>
                  </div>

                  {/* Applicant Reason */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF8F5] text-xs text-[#1A1A2E] space-y-1">
                    <span className="font-semibold text-[#6B7280] block text-[11px]">Applicant's Reason:</span>
                    <p className="italic">"{app.reason}"</p>
                    {app.relevantSubject && (
                      <span className="inline-block mt-1 text-[11px] text-[#E8602C] font-medium">
                        Relevant Coursework: {app.relevantSubject}
                      </span>
                    )}
                  </div>

                  {/* AI Explanation Banner */}
                  {app.explanation && (
                    <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-xs text-[#166534] flex items-start gap-2">
                      <span className="text-sm mt-0.5">⚡</span>
                      <div>
                        <strong className="block text-[11px]">AI Reasoning:</strong>
                        <p className="text-[11px] leading-relaxed">{app.explanation}</p>
                      </div>
                    </div>
                  )}

                  {/* 3 Factor Sub-Scores */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-[#E5E2DD]/60">
                    <div className="p-2 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[10px] text-[#6B7280] block">Academic Relevance</span>
                      <strong className="text-[#1A1A2E]">{app.academicRelevance || 80}%</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[10px] text-[#6B7280] block">Demonstrated Need</span>
                      <strong className="text-[#1A1A2E]">{app.needMatch || 75}%</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-[#FAF8F5]">
                      <span className="text-[10px] text-[#6B7280] block">Campus Trust Factor</span>
                      <strong className="text-[#2D6A4F]">{app.trustFactor || trustScore}%</strong>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 flex justify-end">
                    {isSelected ? (
                      <span className="px-4 py-2 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold">
                        ✓ Recipient Selected
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSelectRecipient(app.id)}
                        disabled={selectingId === app.id}
                        className="px-5 py-2.5 rounded-xl bg-[#1A1A2E] text-white text-xs font-bold hover:bg-[#E8602C] transition-colors disabled:opacity-50"
                      >
                        {selectingId === app.id ? 'Selecting...' : 'Select This Student as Recipient →'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
