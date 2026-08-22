'use client'

import React from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'

export default function DonationsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full space-y-6" style={{ paddingTop: '96px' }}>
        <div className="theme-card rounded-3xl p-8 space-y-4 shadow-xl border" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎁</span>
            <div>
              <h1 className="font-heading font-extrabold text-2xl theme-title">Campus Free Donation Hub</h1>
              <p className="text-xs theme-muted">Senior textbook &amp; essential giveaways for deserving junior peers.</p>
            </div>
          </div>
          <p className="text-xs theme-muted leading-relaxed">
            List free study supplies or apply for verified senior textbook giveaways with AI need-based matching.
          </p>
          <div className="pt-2 flex gap-3">
            <Link
              href="/explore?mode=DONATE"
              className="px-5 py-2.5 rounded-xl bg-[#E8602C] text-white text-xs font-bold hover:bg-[#CF4F20]"
            >
              Browse Free Items →
            </Link>
            <Link
              href="/listings/new"
              className="px-5 py-2.5 rounded-xl theme-card-alt border text-xs font-bold theme-title"
              style={{ borderColor: 'var(--border-color)' }}
            >
              Donate an Item +
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
