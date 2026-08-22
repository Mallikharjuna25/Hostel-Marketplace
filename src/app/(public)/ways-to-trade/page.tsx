'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'

const MODES = [
  {
    id: 'sell',
    title: '1. Buy & Sell with Fair-Price AI',
    badge: 'MONETARY',
    badgeBg: 'badge-orange',
    icon: '🏷️',
    color: '#E8602C',
    tagline: 'Sell textbooks, electronics, and hostel gear without getting lowballed.',
    description: 'Our campus AI benchmarks previous transactions across your university to recommend a fair price bracket. Sellers upload original purchase receipts for verified authenticity badges, and transactions settle in-person with single-use OTP.',
    features: [
      'AI Fair-Price Estimation engine',
      'Encrypted purchase receipt verification',
      'Dual-party inspection before payment release',
      'Real-time hostel block delivery/meetup',
    ],
    example: 'Casio FX-991EX Calculator · Original: ₹1,200 · Fair Price: ₹650',
  },
  {
    id: 'lend',
    title: '2. Daily & Monthly Equipment Lending',
    badge: 'TEMPORARY RENTAL',
    badgeBg: 'badge-blue',
    icon: '🔄',
    color: '#2563EB',
    tagline: 'Lend mini-fridges, monitors, or lab apparatus for steady income.',
    description: 'Keep your expensive assets productive when not in use. Set daily, weekly, or semester rental rates with automated deposit tracking and return condition verification checklists.',
    features: [
      'Flexible daily / weekly / monthly rate options',
      'Security deposit protection workflow',
      'Return date countdown and reminder alerts',
      'Condition-at-handover digital photo log',
    ],
    example: 'Mini-Fridge · ₹120/week · ₹500 Security Deposit',
  },
  {
    id: 'borrow',
    title: '3. Urgent Borrow Requests',
    badge: 'COMMUNITY NEED',
    badgeBg: 'badge-blue',
    icon: '📥',
    color: '#0EA5E9',
    tagline: 'Need a lab coat for a 2-hour practical? Broadcast a request to nearby blocks.',
    description: 'Instead of buying single-use items, post an urgent borrow ticket with time limit and proximity range (e.g. within 200m or specific hostel floor).',
    features: [
      'Hyper-local proximity filtering (same floor / block)',
      'Quick response chat alerts',
      'Trust rating prerequisite to borrow',
      'Free or micro-fee exchange terms',
    ],
    example: 'White Lab Coat (Size L) · Needed today 2 PM - 5 PM · Block B',
  },
  {
    id: 'swap',
    title: '4. Direct Product ↔ Product Swap',
    badge: 'ZERO MONEY',
    badgeBg: 'badge-purple',
    icon: '🔁',
    color: '#8B5CF6',
    tagline: '"I have Clean Code book. I want Design Patterns." Direct barter trade.',
    description: 'Exchange equivalent semester textbooks, sports gear, or gaming accessories directly without any cash changing hands. Both students confirm condition simultaneously.',
    features: [
      'AI Value Equivalence estimator',
      'Simultaneous dual-OTP handshake',
      'Course & syllabus match recommendations',
      'Equal trust score boost for both parties',
    ],
    example: 'Clean Code (Robert Martin) ⇄ Head First Design Patterns',
  },
  {
    id: 'donate',
    title: '5. Free Senior-to-Junior Donation',
    badge: 'GIVING BACK',
    badgeBg: 'badge-green',
    icon: '🎁',
    color: '#10B981',
    tagline: 'Pass completed semester notes, drafters, and books to juniors for free.',
    description: 'Seniors who finished a semester can list study resources as 100% Free Donation. Juniors apply with their academic need, and the senior awards the item with 1-click.',
    features: [
      'Zero platform fee or cost',
      'Academic year and department priority matching',
      'Karma and Campus Hero badges for donors',
      'Verified recipient student profile',
    ],
    example: 'Engineering Mechanics by Timoshenko + Solved Manuals · ₹0 (Free)',
  },
  {
    id: 'knowledge',
    title: '6. Gear for Knowledge & Tutoring Swap',
    badge: 'SKILL EXCHANGE',
    badgeBg: 'badge-orange',
    icon: '🧠',
    color: '#F97316',
    tagline: 'Trade equipment in return for coding tutoring, math help, or project advice.',
    description: 'A student doesn\'t always need money — they might need help with Data Structures or Gate preparation. Create a formal proof-of-work agreement exchanging gear for verified tutoring hours.',
    features: [
      'Agreed tutoring hours tracking',
      'Departmental subject taxonomy',
      'Verified academic credentials of tutor',
      'Milestone completion verification',
    ],
    example: 'Guitar ⇄ 4 Hours of Python & Machine Learning Tutoring',
  },
]

export default function WaysToTradePage() {
  const [selectedMode, setSelectedMode] = useState(MODES[0])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12" style={{ paddingTop: '96px' }}>
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#FEF3EC] dark:bg-[#2E180E] text-[#E8602C] border border-[#E8602C]/20">
            <span>✨</span> 6 First-Class Exchange Mechanisms
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl theme-title tracking-tight">
            Trade How You Want.<br />
            <span className="bg-gradient-to-r from-[#E8602C] to-[#F97316] bg-clip-text text-transparent">
              Cash, Items, or Knowledge.
            </span>
          </h1>
          <p className="text-sm sm:text-base theme-muted leading-relaxed">
            Traditional platforms only allow buying and selling. Hostel Marketplace empowers students to lend, borrow, swap, donate, and exchange skills with verified campus peers.
          </p>
        </div>

        {/* Interactive Mode Explorer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODES.map((m) => {
            const isSelected = selectedMode.id === m.id
            return (
              <div
                key={m.id}
                onClick={() => setSelectedMode(m)}
                className={`rounded-3xl p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-6 theme-card ${
                  isSelected
                    ? 'ring-2 ring-[#E8602C] shadow-md scale-[1.01]'
                    : 'hover:border-[#E8602C]'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl theme-card-alt flex items-center justify-center text-2xl shadow-xs">
                      {m.icon}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide ${m.badgeBg}`}>
                      {m.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-lg theme-title">
                      {m.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#E8602C] mt-1">
                      {m.tagline}
                    </p>
                  </div>

                  <p className="text-xs theme-muted leading-relaxed">
                    {m.description}
                  </p>

                  <div className="p-3 rounded-xl theme-card-alt text-xs">
                    <span className="text-[10px] font-bold theme-muted uppercase block mb-1">
                      Campus Example:
                    </span>
                    <span className="font-semibold theme-title">
                      {m.example}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                  <Link
                    href={`/explore?type=${m.id === 'sell' ? 'SELL' : m.id === 'lend' ? 'LEND' : m.id === 'borrow' ? 'BORROW_REQUEST' : m.id === 'swap' ? 'EXCHANGE' : m.id === 'donate' ? 'DONATE' : ''}`}
                    className="text-xs font-bold text-[#E8602C] hover:underline flex items-center gap-1"
                  >
                    Browse {m.title.split('.')[1]?.trim()} →
                  </Link>
                  <Link
                    href="/listings/new"
                    className="px-3.5 py-1.5 rounded-xl bg-[#E8602C] text-white text-xs font-bold hover:bg-[#CF4F20] transition-colors shadow-xs"
                  >
                    + Post This
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Feature Comparison Matrix Table */}
        <div className="rounded-3xl theme-card p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="space-y-1">
            <h2 className="font-heading font-extrabold text-xl theme-title">
              Mode Comparison Matrix
            </h2>
            <p className="text-xs theme-muted">
              How each exchange mode operates in terms of money, duration, and OTP verification.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b theme-muted uppercase tracking-wider" style={{ borderColor: 'var(--border-color)' }}>
                  <th className="pb-3 font-bold">Exchange Mode</th>
                  <th className="pb-3 font-bold">Money Involved?</th>
                  <th className="pb-3 font-bold">Duration</th>
                  <th className="pb-3 font-bold">Verification Method</th>
                  <th className="pb-3 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y theme-title" style={{ borderColor: 'var(--border-color)' }}>
                <tr>
                  <td className="py-3.5 font-bold flex items-center gap-2"><span>🏷️</span> Sell</td>
                  <td className="py-3.5 text-[#2D6A4F] dark:text-[#34D399] font-bold">Yes (₹ INR)</td>
                  <td className="py-3.5">Permanent Transfer</td>
                  <td className="py-3.5">3-Point Checklist + 6-digit OTP</td>
                  <td className="py-3.5"><Link href="/explore?type=SELL" className="text-[#E8602C] font-bold hover:underline">Explore →</Link></td>
                </tr>
                <tr>
                  <td className="py-3.5 font-bold flex items-center gap-2"><span>🔄</span> Lend</td>
                  <td className="py-3.5 text-[#2563EB] dark:text-[#60A5FA] font-bold">Daily / Monthly Rental</td>
                  <td className="py-3.5">Temporary (Agreed Days)</td>
                  <td className="py-3.5">Deposit Tracker + Return Handshake</td>
                  <td className="py-3.5"><Link href="/explore?type=LEND" className="text-[#E8602C] font-bold hover:underline">Explore →</Link></td>
                </tr>
                <tr>
                  <td className="py-3.5 font-bold flex items-center gap-2"><span>📥</span> Borrow</td>
                  <td className="py-3.5 theme-muted">Free or Micro-fee</td>
                  <td className="py-3.5">Hours to Weekend</td>
                  <td className="py-3.5">Hostel Proximity Verification</td>
                  <td className="py-3.5"><Link href="/explore?type=BORROW_REQUEST" className="text-[#E8602C] font-bold hover:underline">Explore →</Link></td>
                </tr>
                <tr>
                  <td className="py-3.5 font-bold flex items-center gap-2"><span>🔁</span> Swap</td>
                  <td className="py-3.5 text-[#8B5CF6] dark:text-[#C084FC] font-bold">No Cash (Item-for-Item)</td>
                  <td className="py-3.5">Permanent Trade</td>
                  <td className="py-3.5">AI Equivalence + Dual OTP</td>
                  <td className="py-3.5"><Link href="/explore?type=EXCHANGE" className="text-[#E8602C] font-bold hover:underline">Explore →</Link></td>
                </tr>
                <tr>
                  <td className="py-3.5 font-bold flex items-center gap-2"><span>🎁</span> Donate</td>
                  <td className="py-3.5 text-[#10B981] dark:text-[#34D399] font-bold">100% Free (₹0)</td>
                  <td className="py-3.5">Permanent Giving</td>
                  <td className="py-3.5">Junior Academic Match + Handover</td>
                  <td className="py-3.5"><Link href="/explore?type=DONATE" className="text-[#E8602C] font-bold hover:underline">Explore →</Link></td>
                </tr>
                <tr>
                  <td className="py-3.5 font-bold flex items-center gap-2"><span>🧠</span> Knowledge</td>
                  <td className="py-3.5 text-[#F97316] font-bold">Tutoring / Skill Swap</td>
                  <td className="py-3.5">Agreed Study Sessions</td>
                  <td className="py-3.5">Proof-of-Work Log + Milestone Check</td>
                  <td className="py-3.5"><Link href="/explore" className="text-[#E8602C] font-bold hover:underline">Explore →</Link></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-[#111128] to-[#1E1736] p-8 sm:p-12 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-3">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              Ready to post something in your hostel?
            </h2>
            <p className="text-xs sm:text-sm text-[#D1D5DB] leading-relaxed">
              Join thousands of verified students who save money, trade resources, and build campus trust scores.
            </p>
          </div>

          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/listings/new"
              className="px-6 py-3 rounded-xl bg-[#E8602C] text-white font-heading font-bold text-sm hover:bg-[#CF4F20] transition-colors shadow-lg"
            >
              + Create a Listing in 2 Minutes
            </Link>
            <Link
              href="/explore"
              className="px-6 py-3 rounded-xl bg-white/10 text-white font-heading font-bold text-sm hover:bg-white/20 transition-colors border border-white/20"
            >
              Explore Live Items →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
