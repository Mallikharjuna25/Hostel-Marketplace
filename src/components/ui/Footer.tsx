import React from 'react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#1A1A2E] text-white border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#E8602C] text-white flex items-center justify-center font-heading font-extrabold text-base">
                H
              </div>
              <span className="font-heading font-bold text-lg text-white">Hostel Marketplace</span>
            </div>
            <p className="text-xs text-[#E5E2DD]/70 leading-relaxed">
              "Share What You Have. Get What You Need." A verified-student campus marketplace for exchanging products, money, and academic knowledge.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#2D6A4F]" />
              <span className="text-[11px] text-[#E5E2DD]/80 font-medium">100% Student Verified Campus Network</span>
            </div>
          </div>

          {/* Col 2: 6 Transaction Modes */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-white mb-3 tracking-wide uppercase">
              6 Modes of Exchange
            </h4>
            <ul className="space-y-2 text-xs text-[#E5E2DD]/70">
              <li><Link href="/explore?type=SELL" className="hover:text-[#E8602C]">Sell (with Fair Price AI)</Link></li>
              <li><Link href="/explore?type=LEND" className="hover:text-[#E8602C]">Lend (Daily/Monthly)</Link></li>
              <li><Link href="/explore?type=BORROW_REQUEST" className="hover:text-[#E8602C]">Borrow Requests</Link></li>
              <li><Link href="/explore?type=EXCHANGE" className="hover:text-[#E8602C]">Product ↔ Product Exchange</Link></li>
              <li><Link href="/explore?type=DONATE" className="hover:text-[#2D6A4F] text-[#A7F3D0]">Free Donations (Academic Match)</Link></li>
              <li><Link href="/explore" className="hover:text-[#E8602C]">Knowledge & Tutoring Swap</Link></li>
            </ul>
          </div>

          {/* Col 3: Trust & Safety */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-white mb-3 tracking-wide uppercase">
              Trust & Security
            </h4>
            <ul className="space-y-2 text-xs text-[#E5E2DD]/70">
              <li>Verified Student ID & College Email</li>
              <li>Single-Use 6-Digit OTP Handover</li>
              <li>Inspection Checklist Before Release</li>
              <li>Immutable Trust Score Audit Log</li>
              <li>Private Invoices Never Exposed</li>
            </ul>
          </div>

          {/* Col 4: Campus Locations */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-white mb-3 tracking-wide uppercase">
              Supported Hostels
            </h4>
            <p className="text-xs text-[#E5E2DD]/70 leading-relaxed mb-3">
              Hyper-local campus trades. Filter listings by your hostel, block, or floor distance.
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-white/10 text-white/80">Block A</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white/80">Block B</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white/80">Block C</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white/80">Block D</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white/80">Block H</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#E5E2DD]/50">
          <p>© {new Date().getFullYear()} Hostel Marketplace. Built for university student communities.</p>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <span>₹ INR Currency</span>
            <span>·</span>
            <span>AI Assist Active (Advisory Only)</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
