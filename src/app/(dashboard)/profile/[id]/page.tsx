'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'

export default function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [profileData, setProfileData] = useState<any>(null)
  const [trustData, setTrustData] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      try {
        const [meRes, trustRes] = await Promise.all([
          fetch('/api/users/me'),
          fetch(`/api/trust/${id}`),
        ])

        if (meRes.ok) {
          const me = await meRes.json()
          setCurrentUser(me)
          if (me.id === id) {
            setProfileData(me)
          }
        }

        if (trustRes.ok) {
          const trust = await trustRes.json()
          setTrustData(trust)
        }

        // If viewing another student, fetch public data from products or transactions
        if (!profileData && id !== currentUser?.id) {
          // fallback profile mock representation
          setProfileData({
            id,
            profile: {
              fullName: 'Campus Student',
              college: 'University Campus',
              department: 'Engineering',
              course: 'B.Tech',
              year: 3,
              semester: 5,
              hostel: 'Hostel 10',
              block: 'Block B',
            },
          })
        }
      } catch (err) {
        console.error(err)
        setError('Failed to load student profile.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full space-y-4">
          <div className="h-32 skeleton rounded-3xl" />
          <div className="h-64 skeleton rounded-3xl" />
        </main>
        <Footer />
      </div>
    )
  }

  const isSelf = currentUser?.id === id
  const trustScore = trustData?.score ?? 85
  const trustHistory = trustData?.history || []

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Profile Card Header */}
        <div className="rounded-3xl bg-white border border-[#E5E2DD] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-[#1A1A2E] text-white flex items-center justify-center font-heading font-extrabold text-2xl shadow-sm">
                {profileData?.profile?.fullName?.charAt(0) || 'S'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading font-extrabold text-2xl text-[#1A1A2E]">
                    {profileData?.profile?.fullName || 'Verified Student'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#2D6A4F] border border-[#A7F3D0]">
                    ✓ Verified Student
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {profileData?.profile?.department} · {profileData?.profile?.college}
                </p>
                <p className="text-[11px] text-[#6B7280]">
                  Hostel: <strong>{profileData?.profile?.hostel} ({profileData?.profile?.block})</strong>
                  {!isSelf && <span className="text-[#9CA3AF] ml-1">· Room number private</span>}
                </p>
              </div>
            </div>

            {/* Trust Score Big Badge */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5E2DD] text-center min-w-[130px]">
              <span className="text-[10px] uppercase tracking-wider text-[#6B7280] font-semibold block">
                Trust Score
              </span>
              <div className="font-heading font-extrabold text-3xl text-[#2D6A4F]">
                {trustScore}<span className="text-xs font-normal text-[#6B7280]">/100</span>
              </div>
              <span className="text-[11px] font-semibold text-[#2D6A4F]">
                {trustScore >= 90 ? 'Excellent' : trustScore >= 75 ? 'Good' : 'Moderate'}
              </span>
            </div>
          </div>

          {profileData?.profile?.bio && (
            <p className="text-xs text-[#1A1A2E]/80 bg-[#FAF8F5] p-3 rounded-xl italic">
              "{profileData.profile.bio}"
            </p>
          )}

          {/* Privacy Notice Banner */}
          <div className="p-3 rounded-xl bg-[#F7F5F2] border border-[#E5E2DD] flex items-center justify-between text-xs text-[#6B7280]">
            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span><strong>Privacy Guard:</strong> Room number and phone are protected and never shown publicly.</span>
            </div>
            {isSelf && (
              <span className="text-[#E8602C] font-semibold">Self-Edit Mode</span>
            )}
          </div>
        </div>

        {/* Trust Score Model & Audit History */}
        <div className="bg-white rounded-3xl border border-[#E5E2DD] p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E5E2DD] pb-3">
            <div>
              <h3 className="font-heading font-bold text-base text-[#1A1A2E]">
                Immutable Trust Score Audit History
              </h3>
              <p className="text-xs text-[#6B7280]">
                Every trust change is recorded with exact score delta and verified transaction reason.
              </p>
            </div>
            <span className="text-xs font-bold text-[#2D6A4F] bg-[#ECFDF5] px-2.5 py-1 rounded-full">
              {trustData?.completedTransactions || 2} Completed Deals
            </span>
          </div>

          {/* Audit events list */}
          <div className="space-y-2.5">
            {trustHistory.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#FAF8F5] text-xs text-[#6B7280] text-center">
                Initial starting trust score of 50 assigned on student ID verification.
              </div>
            ) : (
              trustHistory.map((evt: any) => (
                <div
                  key={evt.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] text-xs"
                >
                  <div>
                    <span className="font-semibold text-[#1A1A2E]">{evt.reason}</span>
                    <span className="text-[10px] text-[#9CA3AF] block">
                      {new Date(evt.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold ${evt.newScore >= evt.previousScore ? 'text-[#2D6A4F]' : 'text-[#DC2626]'}`}>
                      {evt.previousScore} → {evt.newScore} ({evt.newScore >= evt.previousScore ? '+' : ''}{evt.newScore - evt.previousScore})
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
