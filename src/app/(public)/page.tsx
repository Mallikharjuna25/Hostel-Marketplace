'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { ProductCard } from '@/components/marketplace/ProductCard'

const MODES = [
  { emoji: '🏷️', title: 'Sell', color: '#E8602C', bg: 'rgba(232,96,44,0.12)', border: 'rgba(232,96,44,0.25)', desc: 'Sell textbooks, electronics & hostel gear with AI fair-price estimation.' },
  { emoji: '🔄', title: 'Lend', color: '#2563EB', bg: 'rgba(37,99,235,0.12)', border: 'rgba(37,99,235,0.25)', desc: 'Lend mini-fridges, lab equipment on daily/monthly rates with deposit security.' },
  { emoji: '📥', title: 'Borrow', color: '#0EA5E9', bg: 'rgba(14,165,233,0.12)', border: 'rgba(14,165,233,0.25)', desc: 'Need something for just a weekend? Post a borrow request to nearby blocks.' },
  { emoji: '🔁', title: 'Swap', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', desc: '"I have Clean Code. I want Design Patterns." Direct item-for-item trade with dual-OTP.' },
  { emoji: '🎁', title: 'Donate', color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', desc: 'Pass on semester books to juniors with AI-assisted Academic Relevance matching.' },
  { emoji: '🧠', title: 'Knowledge', color: '#F97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)', desc: 'Exchange gear for tutoring or coding help. Formal agreement with AI proof-of-work.' },
]

const LIVE_ITEMS = [
  { name: 'Casio FX-991ES Calculator', seller: 'Rahul · Block B', trust: 94, badge: 'FOR SALE', price: '₹450', c: '#E8602C', bg: 'rgba(232,96,44,0.15)' },
  { name: 'Thermodynamics Textbook', seller: 'Arjun · Block A', trust: 78, badge: 'FREE DONATE', price: 'Free', c: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  { name: 'Foldable Study Table', seller: 'Priya · Block C', trust: 97, badge: 'FOR LEND', price: '₹100/day', c: '#2563EB', bg: 'rgba(37,99,235,0.15)' },
  { name: '"Clean Code" Book', seller: 'Kiran · Block H', trust: 82, badge: 'EXCHANGE', price: 'Wants: Prog Book', c: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
]

const STEPS = [
  { n: '01', icon: '💬', title: 'Discover & Propose', desc: 'Find what you need or post an item. Chat directly to propose money, an item swap, or a tutoring deal.' },
  { n: '02', icon: '🤝', title: 'Inspect in Person', desc: 'Meet at the hostel block. Recipient runs a 3-point inspection checklist — condition, functionality, photos match.' },
  { n: '03', icon: '🔐', title: 'Enter OTP to Release', desc: 'Seller shares a single-use 6-digit OTP only after inspection passes. This marks the trade complete and updates trust scores.' },
]

export default function LandingPage() {
  const [listings, setListings] = useState<any[]>([])
  const [active, setActive] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const t = setInterval(() => setActive(p => (p + 1) % LIVE_ITEMS.length), 3200)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    fetch('/api/products?limit=6&status=PUBLISHED')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.listings) setListings(d.listings) })
      .catch(() => {})
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');

        :root {
          --hm-bg: #F4F1ED;
          --hm-bg-alt: #FAF8F5;
          --hm-card-bg: #FFFFFF;
          --hm-card-border: #E5E2DD;
          --hm-text-main: #111128;
          --hm-text-muted: #6B7280;
          --hm-step-num: rgba(232,96,44,0.12);
        }

        .dark {
          --hm-bg: #0B0D16;
          --hm-bg-alt: #101424;
          --hm-card-bg: #131728;
          --hm-card-border: #272E49;
          --hm-text-main: #F4F5F7;
          --hm-text-muted: #9CA3AF;
          --hm-step-num: rgba(232,96,44,0.25);
        }

        .hm-root { font-family: 'Inter', sans-serif; background: var(--hm-bg); color: var(--hm-text-main); transition: background .3s, color .3s; }

        /* ── Hero ── */
        .hm-hero {
          background: linear-gradient(135deg, #080816 0%, #111128 45%, #1a0d24 100%);
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding-top: 64px;
        }
        .hm-glow-1 {
          position: absolute; border-radius: 50%; pointer-events: none;
          width: 700px; height: 700px;
          top: -200px; right: -150px;
          background: radial-gradient(circle, rgba(232,96,44,0.18) 0%, transparent 65%);
        }
        .hm-glow-2 {
          position: absolute; border-radius: 50%; pointer-events: none;
          width: 500px; height: 500px;
          bottom: -100px; left: -80px;
          background: radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 65%);
        }
        .hm-glow-3 {
          position: absolute; border-radius: 50%; pointer-events: none;
          width: 350px; height: 350px;
          top: 40%; left: 35%;
          background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%);
        }
        .hm-dot-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 30px 30px;
        }
        .hm-hero-inner {
          max-width: 1280px; margin: 0 auto;
          padding: 80px 24px 100px;
          display: grid; grid-template-columns: 1fr 420px;
          gap: 60px; align-items: center;
          position: relative; z-index: 1;
          width: 100%;
        }
        @media (max-width: 900px) {
          .hm-hero-inner { grid-template-columns: 1fr; gap: 48px; }
          .hm-glow-1 { width: 400px; height: 400px; }
        }

        /* ── Headline ── */
        .hm-tag {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 16px; border-radius: 100px;
          background: rgba(232,96,44,0.12); border: 1px solid rgba(232,96,44,0.25);
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: #F97316; margin-bottom: 28px;
        }
        .hm-tag-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #22C55E;
          box-shadow: 0 0 6px #22C55E;
          animation: hm-pulse 2s ease-in-out infinite;
        }
        @keyframes hm-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }

        .hm-h1 {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(2.8rem, 5.5vw, 5.2rem);
          line-height: 1.05; color: white;
          letter-spacing: -0.03em; margin: 0 0 24px;
        }
        .hm-h1-orange {
          background: linear-gradient(90deg, #E8602C, #F97316, #FBBF24);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hm-sub {
          font-size: 1.05rem; line-height: 1.75;
          color: rgba(255,255,255,0.7); max-width: 500px;
          margin: 0 0 36px;
        }
        .hm-cta-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 40px; }
        .hm-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 700;
          text-decoration: none; cursor: pointer; border: none;
          transition: all 0.2s ease; font-family: 'Syne', sans-serif;
        }
        .hm-btn-primary {
          background: #E8602C; color: white;
          box-shadow: 0 4px 24px rgba(232,96,44,0.45);
        }
        .hm-btn-primary:hover {
          background: #D4501E; transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(232,96,44,0.55);
        }
        .hm-btn-ghost {
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.18);
          color: white;
        }
        .hm-btn-ghost:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.35);
          transform: translateY(-2px);
        }
        .hm-checks { display: flex; gap: 20px; flex-wrap: wrap; }
        .hm-check { display: flex; align-items: center; gap: 6px; color: rgba(255,255,255,0.65); font-size: 13px; font-weight: 500; }
        .hm-check-icon { color: #22C55E; font-weight: 700; }

        /* ── Live Board Card ── */
        .hm-live-card {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 20px; padding: 24px;
          box-shadow: 0 20px 48px rgba(0,0,0,0.35);
          animation: hm-float 5s ease-in-out infinite;
        }
        @keyframes hm-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .hm-live-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .hm-live-title { font-family:'Syne',sans-serif; font-weight:700; color:white; font-size:15px; }
        .hm-live-sub { color:rgba(255,255,255,0.45); font-size:11px; margin-top:2px; }
        .hm-live-badge {
          display:flex; align-items:center; gap:5px;
          background:rgba(34,197,94,0.15); border:1px solid rgba(34,197,94,0.3);
          color:#4ADE80; font-size:10px; font-weight:700;
          padding:4px 10px; border-radius:100px;
        }
        .hm-live-item {
          padding:12px 14px; border-radius:12px;
          margin-bottom:8px; transition: all 0.4s ease;
          border: 1px solid rgba(255,255,255,0.08);
          display:flex; align-items:center; justify-content:space-between; gap:8px;
        }
        .hm-live-name { color:white; font-size:13px; font-weight:600; }
        .hm-live-seller { color:rgba(255,255,255,0.5); font-size:11px; margin-top:2px; }
        .hm-live-price { color:white; font-size:13px; font-weight:700; text-align:right; }
        .hm-live-mode { font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; text-align:right; margin-bottom:3px; }
        .hm-live-more {
          display:block; text-align:center; color:#E8602C; font-size:12px; font-weight:700;
          text-decoration:none; margin-top:14px;
          padding:10px; border-radius:10px; background:rgba(232,96,44,0.12);
          transition:all .2s; border:1px solid rgba(232,96,44,0.2);
        }
        .hm-live-more:hover { background:rgba(232,96,44,0.2); transform:translateY(-1px); }

        /* ── Fade in bottom ── */
        .hm-hero-fade {
          position:absolute; bottom:0; left:0; right:0; height:120px;
          background: linear-gradient(to bottom, transparent, var(--hm-bg));
          z-index:2; pointer-events:none;
        }

        /* ── Sections ── */
        .hm-section { padding: 90px 0; transition: background .3s; }
        .hm-section-main { background: var(--hm-bg); }
        .hm-section-alt { background: var(--hm-bg-alt); }
        .hm-section-inner { max-width:1280px; margin:0 auto; padding:0 24px; }
        .hm-label {
          display:block; font-size:11px; font-weight:800;
          letter-spacing:.12em; text-transform:uppercase;
          color:#E8602C; margin-bottom:12px;
        }
        .hm-h2 {
          font-family:'Syne',sans-serif; font-weight:800;
          font-size:clamp(2rem,4vw,2.8rem); color:var(--hm-text-main);
          letter-spacing:-.02em; line-height:1.15; margin:0 0 12px;
        }
        .hm-lead { color:var(--hm-text-muted); font-size:1rem; line-height:1.7; max-width:540px; margin:0; }

        /* ── Mode Grid ── */
        .hm-modes { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:20px; margin-top:48px; }
        .hm-mode-card {
          background: var(--hm-card-bg); border-radius: 20px; padding: 28px;
          border: 1px solid var(--hm-card-border); cursor: pointer;
          box-shadow: 0 2px 12px rgba(0,0,0,0.03);
          transition: all .25s ease;
        }
        .hm-mode-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,.1); border-color: #E8602C; }
        .hm-mode-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; margin-bottom: 16px; }
        .hm-mode-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.1rem; color: var(--hm-text-main); margin-bottom: 8px; }
        .hm-mode-desc { color: var(--hm-text-muted); font-size: .85rem; line-height: 1.7; margin-bottom: 16px; }
        .hm-mode-link { font-size: .82rem; font-weight: 700; text-decoration: none; transition: gap .15s; display: inline-flex; align-items: center; gap: 4px; }
        .hm-mode-link:hover { gap: 8px; }

        /* ── Steps ── */
        .hm-steps { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:24px; margin-top:48px; }
        .hm-step {
          background: var(--hm-card-bg); border-radius: 20px; padding: 32px;
          border: 1px solid var(--hm-card-border); position: relative; overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.03);
          transition: all .25s ease;
        }
        .hm-step:hover { transform: translateY(-4px); border-color: #E8602C; box-shadow: 0 16px 40px rgba(0,0,0,0.08); }
        .hm-step::before {
          content:''; position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg,#E8602C,#F97316);
        }
        .hm-step-num {
          position: absolute; top: 16px; right: 20px;
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 2.8rem;
          color: var(--hm-step-num); user-select: none;
        }
        .hm-step-icon { font-size: 2rem; margin-bottom: 16px; }
        .hm-step-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.15rem; color: var(--hm-text-main); margin-bottom: 10px; }
        .hm-step-desc { color: var(--hm-text-muted); font-size: .85rem; line-height: 1.7; }

        /* ── Dark section stats ── */
        .hm-dark-section {
          background: #080816; position: relative; overflow: hidden;
          padding: 90px 0; color: white;
        }
        .hm-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; margin-bottom: 60px; }
        .hm-stat-val { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 2.8rem; color: white; line-height: 1; margin-bottom: 8px; }
        .hm-stat-label { font-size: 13px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
        .hm-trust-box {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; padding: 36px; display: flex; align-items: center; justify-content: space-between; gap: 32px; flex-wrap: wrap;
        }
      `}</style>

      <div className="hm-root">
        <Navbar />

        {/* ══════════════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════════════ */}
        <section className="hm-hero">
          <div className="hm-dot-grid" />
          <div className="hm-glow-1" />
          <div className="hm-glow-2" />
          <div className="hm-glow-3" />

          <div className="hm-hero-inner">
            {/* Left Column */}
            <div>
              <div className="hm-tag">
                <span className="hm-tag-dot" />
                Campus Verified Marketplace · 6 Modes of Value Exchange
              </div>

              <h1 className="hm-h1">
                Your hostel<br />
                is full of things<br />
                <span className="hm-h1-orange">someone</span><br />
                else needs.
              </h1>

              <p className="hm-sub">
                Buy, sell, lend, borrow, exchange, or donate useful resources with verified students around your campus.{' '}
                <em style={{ color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>
                  "A student doesn't always need money — they may have a product, skills, time, or knowledge to offer."
                </em>
              </p>

              <div className="hm-cta-row">
                <Link href="/explore" className="hm-btn hm-btn-primary">
                  Explore Marketplace →
                </Link>
                <Link href="/listings/new" className="hm-btn hm-btn-ghost">
                  + List Something
                </Link>
              </div>

              <div className="hm-checks">
                {['✓ 100% Student Verified', '✓ OTP-Protected Handovers', '✓ AI Fair-Price Assist'].map(t => (
                  <span key={t} className="hm-check">
                    <span className="hm-check-icon">✓</span>
                    {t.slice(2)}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column: Live Board */}
            <div className="hm-live-card" style={{ opacity: mounted ? 1 : 0, transition: 'opacity .5s' }}>
              <div className="hm-live-header">
                <div>
                  <div className="hm-live-title">Live Campus Board</div>
                  <div className="hm-live-sub">Hostel 10 & Surroundings</div>
                </div>
                <div className="hm-live-badge">
                  <span className="hm-tag-dot" />
                  LIVE
                </div>
              </div>

              {LIVE_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className="hm-live-item"
                  style={{
                    background: i === active ? item.bg : 'rgba(255,255,255,0.03)',
                    borderColor: i === active ? `rgba(255,255,255,0.18)` : 'rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="hm-live-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </div>
                    <div className="hm-live-seller">{item.seller} · Trust {item.trust}/100</div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <div className="hm-live-mode" style={{ color: item.c }}>{item.badge}</div>
                    <div className="hm-live-price">{item.price}</div>
                  </div>
                </div>
              ))}

              <Link href="/explore" className="hm-live-more">
                View all 20+ live campus listings →
              </Link>
            </div>
          </div>

          <div className="hm-hero-fade" />
        </section>

        {/* ══════════════════════════════════════════════════
            6 MODES SECTION
        ══════════════════════════════════════════════════ */}
        <section className="hm-section hm-section-main">
          <div className="hm-section-inner">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span className="hm-label">First-class non-monetary trade</span>
                <h2 className="hm-h2">6 Modes to Exchange Value</h2>
                <p className="hm-lead">Whether you have money, unused gear, academic skills, or spare time — you can participate.</p>
              </div>
              <Link href="/explore" style={{ color: '#E8602C', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                Browse All →
              </Link>
            </div>

            <div className="hm-modes">
              {MODES.map((m) => (
                <div key={m.title} className="hm-mode-card">
                  <div className="hm-mode-icon" style={{ background: m.bg, border: `1px solid ${m.border}` }}>
                    {m.emoji}
                  </div>
                  <div className="hm-mode-title">{m.title}</div>
                  <div className="hm-mode-desc">{m.desc}</div>
                  <Link href={`/explore?mode=${m.title.toLowerCase()}`} className="hm-mode-link" style={{ color: m.color }}>
                    Browse {m.title}s <span>→</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            FEATURED LISTINGS SECTION
        ══════════════════════════════════════════════════ */}
        {listings.length > 0 && (
          <section className="hm-section hm-section-alt">
            <div className="hm-section-inner">
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
                <div>
                  <span className="hm-label">Verified campus resources</span>
                  <h2 className="hm-h2">Featured Listings</h2>
                  <p className="hm-lead">
                    Real items listed by verified students in nearby hostel blocks.
                  </p>
                </div>
                <Link href="/explore" style={{ color: '#E8602C', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                  Browse All Listings ({listings.length}) →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.slice(0, 6).map((l: any) => (
                  <ProductCard
                    key={l.id}
                    id={l.id}
                    title={l.title}
                    category={l.category}
                    priceInr={l.priceInr}
                    mode={l.mode}
                    condition={l.condition}
                    hostel={l.hostel}
                    block={l.block}
                    images={l.images}
                    seller={l.seller}
                    aiVerified={l.aiVerified}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════
            HOW IT WORKS SECTION
        ══════════════════════════════════════════════════ */}
        <section className="hm-section hm-section-main">
          <div className="hm-section-inner">
            <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
              <span className="hm-label">Secure 3-Step Process</span>
              <h2 className="hm-h2">How Handover &amp; OTP Work</h2>
              <p className="hm-lead" style={{ margin: '12px auto 0' }}>
                No money or items change hands without in-person inspection and a single-use 6-digit OTP verification.
              </p>
            </div>
            <div className="hm-steps">
              {STEPS.map(s => (
                <div key={s.n} className="hm-step">
                  <div className="hm-step-num">{s.n}</div>
                  <div className="hm-step-icon">{s.icon}</div>
                  <div className="hm-step-title">{s.title}</div>
                  <div className="hm-step-desc">{s.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Link
                href="/how-it-works"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  background: 'rgba(232,96,44,0.1)',
                  color: '#E8602C',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  border: '1px solid rgba(232,96,44,0.25)',
                  transition: 'all 0.2s',
                }}
              >
                ⚡ Explore Interactive Handover &amp; Trust Score Simulator →
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            CAMPUS TRUST & STATS SECTION
        ══════════════════════════════════════════════════ */}
        <section className="hm-dark-section">
          <div className="hm-dot-grid" style={{ opacity: 0.5 }} />
          <div className="hm-section-inner" style={{ position: 'relative', zIndex: 1 }}>
            <div className="hm-stats-grid">
              {[
                { v: '2,400+', l: 'Verified Students' },
                { v: '8,900+', l: 'Trades Completed' },
                { v: '87/100', l: 'Avg Trust Score' },
                { v: '100%', l: 'OTP Secured Handovers' },
              ].map(s => (
                <div key={s.l}>
                  <div className="hm-stat-val">{s.v}</div>
                  <div className="hm-stat-label">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="hm-trust-box">
              <div style={{ flex: 1, minWidth: 280 }}>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: 'white', fontSize: '1.4rem', marginBottom: 12 }}>
                  Trust &amp; Security First
                </h3>
                <p style={{ color: 'rgba(255,255,255,.65)', fontSize: '.9rem', lineHeight: 1.75, marginBottom: 20 }}>
                  Every user is an ID-verified student from an authorized college domain. Room numbers and phone numbers are private by default. Invoices and receipts are stored in private encrypted storage.
                </p>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {[
                    { t: 'Trust Scores (0–100)', s: 'Based on verified transactions & reviews' },
                    { t: 'Immutable Audit Trail', s: 'Every trust change logged with date & reason' },
                  ].map(f => (
                    <div key={f.t}>
                      <div style={{ color: '#E8602C', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em' }}>{f.t}</div>
                      <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '12px', marginTop: 3 }}>{f.s}</div>
                    </div>
                  ))}
                </div>
              </div>
              <Link href="/register" className="hm-btn hm-btn-primary" style={{ whiteSpace: 'nowrap' }}>
                Join Your Campus Network →
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
