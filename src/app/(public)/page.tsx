'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

const MODES = [
  { emoji: '🏷️', title: 'Sell', color: '#E8602C', bg: 'rgba(232,96,44,0.1)', border: 'rgba(232,96,44,0.2)', desc: 'Sell textbooks, electronics & hostel gear with AI fair-price estimation.' },
  { emoji: '🔄', title: 'Lend', color: '#2563EB', bg: 'rgba(37,99,235,0.1)', border: 'rgba(37,99,235,0.2)', desc: 'Lend mini-fridges, lab equipment on daily/monthly rates with deposit security.' },
  { emoji: '📥', title: 'Borrow', color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.2)', desc: 'Need something for just a weekend? Post a borrow request to nearby blocks.' },
  { emoji: '🔁', title: 'Swap', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)', desc: '"I have Clean Code. I want Design Patterns." Direct item-for-item trade with dual-OTP.' },
  { emoji: '🎁', title: 'Donate', color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', desc: 'Pass on semester books to juniors with AI-assisted Academic Relevance matching.' },
  { emoji: '🧠', title: 'Knowledge', color: '#F97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)', desc: 'Exchange gear for tutoring or coding help. Formal agreement with AI proof-of-work.' },
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
    const t = setInterval(() => setActive(p => (p + 1) % LIVE_ITEMS.length), 2800)
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

        .hm-root { font-family: 'Inter', sans-serif; background: #F4F1ED; }

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
          font-size: clamp(3rem, 6vw, 5.5rem);
          line-height: 1.0; color: white;
          letter-spacing: -0.03em; margin: 0 0 24px;
        }
        .hm-h1-orange {
          background: linear-gradient(90deg, #E8602C, #F97316, #FBBF24);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hm-sub {
          font-size: 1.05rem; line-height: 1.75;
          color: rgba(255,255,255,0.55); max-width: 500px;
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
          box-shadow: 0 4px 24px rgba(232,96,44,0.45), 0 0 0 0 rgba(232,96,44,0);
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
        .hm-check { display: flex; align-items: center; gap: 6px; color: rgba(255,255,255,0.45); font-size: 13px; font-weight: 500; }
        .hm-check-icon { color: #22C55E; font-weight: 700; }

        /* ── Live Board Card ── */
        .hm-live-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px; padding: 24px;
          animation: hm-float 5s ease-in-out infinite;
        }
        @keyframes hm-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .hm-live-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .hm-live-title { font-family:'Syne',sans-serif; font-weight:700; color:white; font-size:15px; }
        .hm-live-sub { color:rgba(255,255,255,0.35); font-size:11px; margin-top:2px; }
        .hm-live-badge {
          display:flex; align-items:center; gap:5px;
          background:rgba(34,197,94,0.12); border:1px solid rgba(34,197,94,0.2);
          color:#4ADE80; font-size:10px; font-weight:700;
          padding:4px 10px; border-radius:100px;
        }
        .hm-live-item {
          padding:12px 14px; border-radius:12px;
          margin-bottom:8px; transition: all 0.4s ease;
          border: 1px solid rgba(255,255,255,0.06);
          display:flex; align-items:center; justify-content:space-between; gap:8px;
        }
        .hm-live-name { color:white; font-size:13px; font-weight:600; }
        .hm-live-seller { color:rgba(255,255,255,0.4); font-size:11px; margin-top:2px; }
        .hm-live-price { color:white; font-size:13px; font-weight:700; text-align:right; }
        .hm-live-mode { font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; text-align:right; margin-bottom:3px; }
        .hm-live-more {
          display:block; text-align:center; color:#E8602C; font-size:12px; font-weight:600;
          text-decoration:none; margin-top:12px;
          padding:8px; border-radius:8px; background:rgba(232,96,44,0.08);
          transition:background .2s;
        }
        .hm-live-more:hover { background:rgba(232,96,44,0.15); }

        /* ── Fade in bottom ── */
        .hm-hero-fade {
          position:absolute; bottom:0; left:0; right:0; height:160px;
          background: linear-gradient(to bottom, transparent, #F4F1ED);
          z-index:2;
        }

        /* ── Sections ── */
        .hm-section { padding: 80px 0; }
        .hm-section-inner { max-width:1280px; margin:0 auto; padding:0 24px; }
        .hm-label {
          display:block; font-size:11px; font-weight:700;
          letter-spacing:.12em; text-transform:uppercase;
          color:#E8602C; margin-bottom:12px;
        }
        .hm-h2 {
          font-family:'Syne',sans-serif; font-weight:800;
          font-size:clamp(1.8rem,4vw,2.8rem); color:#111128;
          letter-spacing:-.02em; line-height:1.1; margin:0 0 12px;
        }
        .hm-lead { color:#6B7280; font-size:1rem; line-height:1.7; max-width:520px; margin:0; }

        /* ── Mode Grid ── */
        .hm-modes { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; margin-top:48px; }
        .hm-mode-card {
          background:white; border-radius:16px; padding:28px;
          border:1px solid #E8E3DC; cursor:pointer;
          transition:all .25s ease;
        }
        .hm-mode-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(17,17,40,.1); border-color:transparent; }
        .hm-mode-icon { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.4rem; margin-bottom:16px; }
        .hm-mode-title { font-family:'Syne',sans-serif; font-weight:700; font-size:1.05rem; color:#111128; margin-bottom:8px; }
        .hm-mode-desc { color:#6B7280; font-size:.83rem; line-height:1.7; margin-bottom:14px; }
        .hm-mode-link { font-size:.78rem; font-weight:700; text-decoration:none; transition:gap .15s; display:inline-flex; align-items:center; gap:4px; }
        .hm-mode-link:hover { gap:8px; }

        /* ── Listings Grid ── */
        .hm-listings { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:16px; margin-top:40px; }
        .hm-listing-card {
          background:white; border-radius:16px; overflow:hidden;
          border:1px solid #E8E3DC; text-decoration:none; display:block;
          transition:all .25s ease;
        }
        .hm-listing-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(17,17,40,.1); border-color:transparent; }
        .hm-listing-thumb { height:160px; display:flex; align-items:center; justify-content:center; font-size:3rem; background:#F4F1ED; }
        .hm-listing-body { padding:16px; }
        .hm-listing-badge { display:inline-block; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; padding:3px 8px; border-radius:100px; margin-bottom:8px; }
        .hm-listing-title { font-family:'Syne',sans-serif; font-weight:700; font-size:.9rem; color:#111128; margin-bottom:12px; line-height:1.3; }
        .hm-listing-footer { display:flex; align-items:center; justify-content:space-between; }
        .hm-listing-price { font-family:'Syne',sans-serif; font-weight:800; font-size:1rem; }
        .hm-listing-trust { font-size:.7rem; color:#9CA3AF; }

        /* ── Steps ── */
        .hm-steps { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:24px; margin-top:48px; }
        .hm-step {
          background:white; border-radius:20px; padding:32px;
          border:1px solid #E8E3DC; position:relative; overflow:hidden;
        }
        .hm-step::before {
          content:''; position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg,#E8602C,#F97316);
        }
        .hm-step-num {
          position:absolute; top:20px; right:20px;
          font-family:'Syne',sans-serif; font-weight:800; font-size:2.5rem;
          color:rgba(17,17,40,.05); line-height:1;
        }
        .hm-step-icon { font-size:2rem; margin-bottom:16px; }
        .hm-step-title { font-family:'Syne',sans-serif; font-weight:700; font-size:1.05rem; color:#111128; margin-bottom:10px; }
        .hm-step-desc { color:#6B7280; font-size:.84rem; line-height:1.75; }

        /* ── Dark Stats ── */
        .hm-dark {
          background:linear-gradient(135deg,#080816 0%,#111128 60%,#1a0d24 100%);
          position:relative; overflow:hidden;
        }
        .hm-stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:32px; text-align:center; }
        .hm-stat-val { font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(2rem,4vw,3rem); color:white; line-height:1; }
        .hm-stat-label { color:rgba(255,255,255,.4); font-size:.8rem; margin-top:8px; font-weight:500; }
        .hm-trust-box {
          margin-top:48px; padding:32px; border-radius:20px;
          background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.1);
          display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap;
        }

        /* ── Footer ── */
        .hm-footer { background:#060612; padding:56px 0 28px; }
        .hm-footer-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:40px; margin-bottom:40px; }
        .hm-footer-col-title { color:rgba(255,255,255,.25); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.12em; margin-bottom:14px; }
        .hm-footer-link { display:block; color:rgba(255,255,255,.4); font-size:.78rem; margin-bottom:8px; text-decoration:none; transition:color .15s; }
        .hm-footer-link:hover { color:rgba(255,255,255,.8); }
        .hm-footer-divider { border:none; border-top:1px solid rgba(255,255,255,.07); margin:0 0 20px; }
        .hm-footer-bottom { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; }

        /* ── Navbar padding (fixed 64px) ── */
        .hm-navbar-spacer { height: 64px; }
      `}</style>

      <div className="hm-root">

        {/* ══════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════ */}
        <section className="hm-hero">
          <div className="hm-dot-grid" />
          <div className="hm-glow-1" />
          <div className="hm-glow-2" />
          <div className="hm-glow-3" />

          <div className="hm-hero-inner">
            {/* Left */}
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
                <em style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
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

            {/* Right: Live Board */}
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
                    borderColor: i === active ? `rgba(255,255,255,0.15)` : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="hm-live-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </div>
                    <div className="hm-live-seller">{item.seller} · Trust {item.trust}</div>
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
            6 MODES
        ══════════════════════════════════════════════════ */}
        <section className="hm-section" style={{ background: '#F4F1ED' }}>
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
            FEATURED LISTINGS (from DB)
        ══════════════════════════════════════════════════ */}
        {listings.length > 0 && (
          <section className="hm-section" style={{ background: 'white' }}>
            <div className="hm-section-inner">
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <span className="hm-label">Verified campus resources</span>
                  <h2 className="hm-h2">Featured Listings</h2>
                  <p className="hm-lead" style={{ maxWidth: 420, marginTop: 4 }}>
                    Real items listed by verified students in nearby hostel blocks.
                  </p>
                </div>
                <Link href="/explore" style={{ color: '#E8602C', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                  Browse All Listings ({listings.length}) →
                </Link>
              </div>

              <div className="hm-listings">
                {listings.slice(0, 6).map((l: any) => {
                  const modeEmoji: Record<string, string> = { SELL: '🏷️', LEND: '🔄', BORROW: '📥', EXCHANGE: '🔁', DONATE: '🎁', KNOWLEDGE: '🧠' }
                  const modeBadge: Record<string, { bg: string; color: string }> = {
                    SELL:      { bg: '#FEF3EC', color: '#E8602C' },
                    LEND:      { bg: '#EBF4FF', color: '#2563EB' },
                    BORROW:    { bg: '#F0F9FF', color: '#0EA5E9' },
                    EXCHANGE:  { bg: '#F5F3FF', color: '#8B5CF6' },
                    DONATE:    { bg: '#ECFDF5', color: '#10B981' },
                    KNOWLEDGE: { bg: '#FFF7ED', color: '#F97316' },
                  }
                  const mb = modeBadge[l.mode] || { bg: '#F4F1ED', color: '#6B7280' }
                  return (
                    <Link key={l.id} href={`/products/${l.id}`} className="hm-listing-card">
                      <div className="hm-listing-thumb">
                        {modeEmoji[l.mode] || '📦'}
                      </div>
                      <div className="hm-listing-body">
                        <span className="hm-listing-badge" style={{ background: mb.bg, color: mb.color }}>
                          {l.mode}
                        </span>
                        <div className="hm-listing-title">{l.title}</div>
                        <div className="hm-listing-footer">
                          <span className="hm-listing-price" style={{ color: l.mode === 'DONATE' ? '#10B981' : '#111128' }}>
                            {l.mode === 'DONATE' ? 'Free' : l.priceInr ? `₹${l.priceInr.toLocaleString('en-IN')}` : 'Negotiate'}
                          </span>
                          <span className="hm-listing-trust">Trust {l.seller?.trustScore?.score ?? 80}/100</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════════════ */}
        <section className="hm-section" style={{ background: '#F4F1ED' }}>
          <div className="hm-section-inner">
            <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
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
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            TRUST STATS (dark)
        ══════════════════════════════════════════════════ */}
        <section className="hm-dark hm-section">
          <div className="hm-dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />
          <div className="hm-section-inner" style={{ position: 'relative' }}>
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
              <div style={{ flex: 1, minWidth: 260 }}>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: 'white', fontSize: '1.2rem', marginBottom: 12 }}>
                  Trust &amp; Security First
                </h3>
                <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.85rem', lineHeight: 1.75, marginBottom: 16 }}>
                  Every user is an ID-verified student from an authorized college domain. Room numbers and phone numbers are private by default. Invoices are stored in private encrypted storage and never exposed publicly.
                </p>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {[
                    { t: 'Trust Scores (0–100)', s: 'Based on verified transactions & reviews' },
                    { t: 'Immutable Audit Trail', s: 'Every trust change logged with date & reason' },
                  ].map(f => (
                    <div key={f.t}>
                      <div style={{ color: '#E8602C', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>{f.t}</div>
                      <div style={{ color: 'rgba(255,255,255,.35)', fontSize: '12px', marginTop: 3 }}>{f.s}</div>
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

        {/* ══════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════ */}
        <footer className="hm-footer">
          <div className="hm-section-inner">
            <div className="hm-footer-grid">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E8602C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, color: 'white', fontSize: '14px' }}>H</div>
                  <div>
                    <div style={{ color: 'white', fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: '14px' }}>Hostel Marketplace</div>
                    <div style={{ color: 'rgba(255,255,255,.25)', fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase' }}>Student Campus Network</div>
                  </div>
                </div>
                <p style={{ color: 'rgba(255,255,255,.35)', fontSize: '13px', lineHeight: 1.7 }}>
                  "Share What You Have. Get What You Need." A verified-student campus marketplace.
                </p>
              </div>
              <div>
                <div className="hm-footer-col-title">Trade Modes</div>
                {['Sell (Fair Price AI)', 'Lend Daily/Monthly', 'Borrow Requests', 'Product ↔ Exchange', 'Free Donations', 'Knowledge Swap'].map(t => (
                  <a key={t} href="/explore" className="hm-footer-link">{t}</a>
                ))}
              </div>
              <div>
                <div className="hm-footer-col-title">Safety</div>
                {['Verified College Email', 'Single-Use OTP Handover', 'Inspection Checklist', 'Trust Score Audit Log', 'Private Invoices'].map(t => (
                  <div key={t} className="hm-footer-link">{t}</div>
                ))}
              </div>
              <div>
                <div className="hm-footer-col-title">Campus Blocks</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['Block A', 'Block B', 'Block C', 'Block D', 'Block E', 'Block H'].map(b => (
                    <span key={b} style={{ background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.4)', fontSize: '11px', padding: '4px 9px', borderRadius: 6 }}>{b}</span>
                  ))}
                </div>
                <div style={{ marginTop: 16, color: 'rgba(255,255,255,.25)', fontSize: '12px', lineHeight: 1.7 }}>
                  Filter listings by hostel, block, or floor distance for hyper-local trades.
                </div>
              </div>
            </div>

            <hr className="hm-footer-divider" />
            <div className="hm-footer-bottom">
              <span style={{ color: 'rgba(255,255,255,.2)', fontSize: '12px' }}>© 2026 Hostel Marketplace. Built for university student communities.</span>
              <div style={{ display: 'flex', gap: 16 }}>
                <span style={{ color: 'rgba(255,255,255,.2)', fontSize: '12px' }}>₹ INR Currency</span>
                <span style={{ color: 'rgba(255,255,255,.2)', fontSize: '12px' }}>AI Assist Active (Advisory Only)</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
