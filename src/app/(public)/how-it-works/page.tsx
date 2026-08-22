'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'

const STEPS = [
  {
    step: '01',
    phase: 'DISCOVER & PROPOSE',
    icon: '💬',
    title: 'Browse Listings & Send Student Proposals',
    description: 'Find textbooks, electronics, lab equipment, or study notes. Tap "Make an Offer" to propose money, an item barter swap, or tutoring hours. The seller is instantly notified via in-app alerts and email.',
    visualBadge: 'Direct In-App Deal Room',
    color: '#E8602C',
    details: [
      'Encrypted student-to-student messaging',
      'AI Fair-Price evaluation guidance',
      'Hostel block distance indicator (e.g. Block B, 50m away)',
      '1-Click "Accept & Start Deal" workflow',
    ],
  },
  {
    step: '02',
    phase: 'PHYSICAL INSPECTION',
    icon: '🤝',
    title: 'Meet at Hostel Block & Run 3-Point Checklist',
    description: 'Students meet safely at a common campus point (e.g. Hostel Common Room or Block Entrance). The buyer runs an interactive 3-point digital checklist on their phone before any OTP is given.',
    visualBadge: '3-Point Physical Inspection',
    color: '#2563EB',
    details: [
      'Check 1: Item physical condition matches photo',
      'Check 2: Working functionality & power tested',
      'Check 3: All accessories and cables included',
    ],
  },
  {
    step: '03',
    phase: 'SECURE OTP RELEASE',
    icon: '🔐',
    title: 'Enter 6-Digit OTP to Finalize & Update Trust',
    description: 'The seller reveals a single-use 6-digit cryptographic OTP generated specifically for this transaction. The recipient types it in to verify handover, instantly transferring the item and elevating both users\' campus Trust Scores.',
    visualBadge: 'Cryptographic Single-Use OTP',
    color: '#10B981',
    details: [
      '6-Digit dynamic one-time passcode',
      'Zero dispute guarantee — inspection verified before release',
      'Immutable trust score audit log updated (+5 for on-time trade)',
      'Digital receipt logged in your private dashboard',
    ],
  },
]

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [completedTrades, setCompletedTrades] = useState(6)
  const [verifiedStudent, setVerifiedStudent] = useState(true)
  const [positiveReviews, setPositiveReviews] = useState(5)

  // Dynamic Trust Score Calculation for visual simulator
  const calculatedScore = Math.min(
    100,
    Math.max(
      30,
      30 +
        (verifiedStudent ? 25 : 0) +
        completedTrades * 6 +
        positiveReviews * 3
    )
  )

  const getTier = (score: number) => {
    if (score >= 90) return { label: 'Campus Veteran (Elite)', bg: 'badge-green' }
    if (score >= 75) return { label: 'Verified & Trusted', bg: 'badge-blue' }
    if (score >= 50) return { label: 'Good Standing', bg: 'badge-orange' }
    return { label: 'Building Trust', bg: 'badge-neutral' }
  }

  const currentTier = getTier(calculatedScore)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-16" style={{ paddingTop: '96px' }}>
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider badge-green">
            <span>🛡️</span> Zero Fraud Guarantee · Peer Verification
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl theme-title tracking-tight">
            How Campus Handover &<br />
            <span className="bg-gradient-to-r from-[#E8602C] via-[#F97316] to-[#10B981] bg-clip-text text-transparent">
              OTP Security Work
            </span>
          </h1>
          <p className="text-sm sm:text-base theme-muted leading-relaxed">
            No money or items ever change hands blindly. Our 3-stage protocol combines AI price estimation, in-person physical checklists, and 6-digit cryptographic OTP handshakes.
          </p>
        </div>

        {/* 3-Step Interactive Process Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Step Selector List */}
          <div className="lg:col-span-5 space-y-4">
            {STEPS.map((s, idx) => {
              const isSelected = activeStep === idx
              return (
                <div
                  key={s.step}
                  onClick={() => setActiveStep(idx)}
                  className={`p-6 rounded-3xl transition-all cursor-pointer space-y-3 theme-card ${
                    isSelected
                      ? 'border-[#E8602C] ring-2 ring-[#E8602C] shadow-md scale-[1.02]'
                      : 'hover:border-[#E8602C] opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl theme-card-alt flex items-center justify-center font-heading font-extrabold text-base text-[#E8602C]">
                        {s.step}
                      </span>
                      <div>
                        <span className="text-[10px] font-extrabold text-[#E8602C] uppercase tracking-wider block">
                          {s.phase}
                        </span>
                        <h3 className="font-heading font-bold text-sm theme-title">
                          {s.title}
                        </h3>
                      </div>
                    </div>
                    <span className="text-2xl">{s.icon}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Interactive Step Detail Card */}
          <div className="lg:col-span-7 rounded-3xl theme-card p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{STEPS[activeStep].icon}</span>
                <div>
                  <span className="text-xs font-extrabold text-[#E8602C] uppercase tracking-wider">
                    Step {STEPS[activeStep].step} · {STEPS[activeStep].phase}
                  </span>
                  <h2 className="font-heading font-extrabold text-xl theme-title">
                    {STEPS[activeStep].title}
                  </h2>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3EC] dark:bg-[#2E180E] text-[#E8602C]">
                {STEPS[activeStep].visualBadge}
              </span>
            </div>

            <p className="text-sm theme-title leading-relaxed">
              {STEPS[activeStep].description}
            </p>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold theme-muted uppercase tracking-wider">
                Key Protocol Checks in this Step:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STEPS[activeStep].details.map((d, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl theme-card-alt text-xs flex items-start gap-2 theme-title"
                  >
                    <span className="text-[#10B981] font-bold">✓</span>
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Workflow Mini-Diagram */}
            <div className="p-4 rounded-2xl theme-card-alt flex items-center justify-between text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg theme-card font-bold theme-title shadow-xs">
                {activeStep === 0 ? 'Buyer: Send Offer' : activeStep === 1 ? 'Buyer: Check 3-Points' : 'Seller: Share OTP'}
              </span>
              <span className="text-[#E8602C] font-bold">──────►</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#E8602C] text-white font-bold shadow-xs">
                {activeStep === 0 ? 'Seller: 1-Click Accept' : activeStep === 1 ? 'Seller: Show Item' : 'Buyer: Verify & Release'}
              </span>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: INTERACTIVE TRUST SCORE SIMULATOR ── */}
        <div id="trust" className="rounded-3xl theme-card p-8 sm:p-10 space-y-8 shadow-xs">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#10B981] uppercase tracking-wider">
              <span>📊</span> Real-Time AI Trust Calculation
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl theme-title">
              Interactive Trust Score Simulator
            </h2>
            <p className="text-xs sm:text-sm theme-muted">
              Every student starts with a baseline. See how verified identity, successful OTP handovers, and positive reviews increase your campus trading credibility.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Interactive Sliders */}
            <div className="lg:col-span-7 space-y-6">
              {/* Factor 1: Student Verification */}
              <div className="p-4 rounded-2xl theme-card-alt flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-xs theme-title">
                    College Domain Email Verified (@univ.edu)
                  </h4>
                  <p className="text-[11px] theme-muted">
                    Adds +25 Trust points immediately.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={verifiedStudent}
                  onChange={(e) => setVerifiedStudent(e.target.checked)}
                  className="w-5 h-5 accent-[#E8602C] cursor-pointer"
                />
              </div>

              {/* Factor 2: Completed OTP Trades */}
              <div className="p-4 rounded-2xl theme-card-alt space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-xs theme-title">
                    Completed OTP Handover Deals
                  </h4>
                  <span className="font-heading font-extrabold text-sm text-[#E8602C]">
                    {completedTrades} Deals (+{completedTrades * 6} pts)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={completedTrades}
                  onChange={(e) => setCompletedTrades(parseInt(e.target.value))}
                  className="w-full accent-[#E8602C] cursor-pointer"
                />
              </div>

              {/* Factor 3: 5-Star Reviews */}
              <div className="p-4 rounded-2xl theme-card-alt space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-xs theme-title">
                    Positive Peer Reviews
                  </h4>
                  <span className="font-heading font-extrabold text-sm text-[#10B981]">
                    {positiveReviews} Reviews (+{positiveReviews * 3} pts)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={positiveReviews}
                  onChange={(e) => setPositiveReviews(parseInt(e.target.value))}
                  className="w-full accent-[#10B981] cursor-pointer"
                />
              </div>
            </div>

            {/* Visual Gauge Display */}
            <div className="lg:col-span-5 p-8 rounded-3xl bg-gradient-to-br from-[#111128] to-[#1E1736] text-white text-center space-y-4 shadow-lg border border-white/10">
              <span className="text-xs font-mono text-white/60 uppercase tracking-widest block">
                Simulated Trust Level
              </span>

              <div className="relative inline-block">
                <div className="w-36 h-36 rounded-full border-8 border-white/10 flex flex-col items-center justify-center mx-auto bg-white/5 shadow-inner">
                  <span className="font-heading font-extrabold text-4xl text-white">
                    {calculatedScore}
                  </span>
                  <span className="text-[10px] text-white/60 font-mono">/100</span>
                </div>
              </div>

              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${currentTier.bg}`}>
                  {currentTier.label}
                </span>
                <p className="text-xs text-white/70 mt-2 leading-relaxed">
                  {calculatedScore >= 80
                    ? '🎉 Unlocks high-value electronics lending, borrow privileges, and priority ranking in search.'
                    : '⚡ Complete 2 more verified handovers to unlock full campus exchange privileges.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: CAMPUS VALUE ECOSYSTEM VISUALIZER ── */}
        <div className="rounded-3xl theme-card p-8 space-y-6 shadow-xs">
          <div className="space-y-1 text-center max-w-2xl mx-auto">
            <h2 className="font-heading font-extrabold text-2xl theme-title">
              Campus Non-Monetary Value Ecosystem
            </h2>
            <p className="text-xs theme-muted">
              How value moves between students across departments without needing ATMs or cash.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
            <div className="p-5 rounded-2xl theme-card-alt text-center space-y-2">
              <span className="text-3xl block">📚</span>
              <h4 className="font-heading font-bold text-xs theme-title">Senior Textbooks</h4>
              <p className="text-[11px] theme-muted">Donated or swapped at semester completion</p>
              <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-[#ECFDF5] text-[#10B981]">100% Useful</span>
            </div>

            <div className="p-5 rounded-2xl theme-card-alt text-center space-y-2">
              <span className="text-3xl block">🔬</span>
              <h4 className="font-heading font-bold text-xs theme-title">Lab & Drafter Gear</h4>
              <p className="text-[11px] theme-muted">Lent for practicals across hostel blocks</p>
              <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-[#EBF4FF] text-[#2563EB]">Daily Micro-Rent</span>
            </div>

            <div className="p-5 rounded-2xl theme-card-alt text-center space-y-2">
              <span className="text-3xl block">💻</span>
              <h4 className="font-heading font-bold text-xs theme-title">Monitors & Electronics</h4>
              <p className="text-[11px] theme-muted">Fair-price sold with authentic invoice proof</p>
              <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-[#FEF3EC] text-[#E8602C]">AI Fair-Valued</span>
            </div>

            <div className="p-5 rounded-2xl theme-card-alt text-center space-y-2">
              <span className="text-3xl block">🧠</span>
              <h4 className="font-heading font-bold text-xs theme-title">Tutoring & Skill Swap</h4>
              <p className="text-[11px] theme-muted">Exchanged for instruments, gear, or notes</p>
              <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-[#FFF7ED] text-[#F97316]">Skill Handshake</span>
            </div>
          </div>
        </div>

        {/* CTA Footer Banner */}
        <div className="text-center space-y-4 pt-4">
          <h3 className="font-heading font-bold text-xl theme-title">
            Experience the trusted way to exchange resources on your campus.
          </h3>
          <div className="flex justify-center gap-3">
            <Link
              href="/explore"
              className="px-6 py-3 rounded-xl bg-[#E8602C] text-white font-heading font-bold text-xs hover:bg-[#CF4F20] transition-colors shadow-xs"
            >
              Explore Campus Marketplace →
            </Link>
            <Link
              href="/ways-to-trade"
              className="px-6 py-3 rounded-xl theme-card-alt theme-title font-bold text-xs hover:border-[#E8602C] transition-colors"
            >
              View 6 Ways to Trade
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
