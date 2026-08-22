'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/users/me')
      .then(res => {
        if (res.ok) router.replace(redirect)
      })
      .catch(() => {})
  }, [router, redirect])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push(redirect)
        router.refresh()
      } else {
        setError(data.error || 'Invalid email or password.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .lp-root { min-height:100vh; display:flex; font-family:'Inter',sans-serif; }

        /* Left panel */
        .lp-left {
          flex: 0 0 44%;
          background: linear-gradient(145deg, #080816 0%, #111128 50%, #1a0d24 100%);
          position: relative; overflow: hidden;
          display: flex; flex-direction: column; justify-content: center;
          padding: 56px 52px;
        }
        .lp-left-glow1 {
          position:absolute; border-radius:50%; pointer-events:none;
          width:500px; height:500px; top:-120px; right:-120px;
          background:radial-gradient(circle,rgba(232,96,44,.2) 0%,transparent 65%);
        }
        .lp-left-glow2 {
          position:absolute; border-radius:50%; pointer-events:none;
          width:340px; height:340px; bottom:-60px; left:-60px;
          background:radial-gradient(circle,rgba(37,99,235,.12) 0%,transparent 65%);
        }
        .lp-left-dot-grid {
          position:absolute;inset:0;
          background-image:radial-gradient(rgba(255,255,255,.04) 1px,transparent 1px);
          background-size:28px 28px;
        }
        .lp-left-inner { position:relative; z-index:1; }

        /* Right panel */
        .lp-right {
          flex:1; background:#0B0E17;
          display:flex; align-items:center; justify-content:center;
          padding:40px 32px; overflow-y:auto;
        }
        .lp-form-box {
          width:100%; max-width:440px;
          background:#131728; border:1px solid #272E49;
          border-radius:24px; padding:40px 36px;
          box-shadow:0 12px 48px rgba(0,0,0,0.5);
        }

        /* Logo */
        .lp-logo { display:flex; align-items:center; gap:10px; text-decoration:none; margin-bottom:44px; }
        .lp-logo-icon {
          width:40px; height:40px; border-radius:11px; background:#E8602C;
          display:flex; align-items:center; justify-content:center;
          font-family:'Syne',sans-serif; font-weight:800; color:white; font-size:15px;
          box-shadow:0 4px 16px rgba(232,96,44,.45);
        }
        .lp-logo-name { color:white; font-family:'Syne',sans-serif; font-weight:700; font-size:15px; line-height:1; }
        .lp-logo-sub { color:rgba(255,255,255,.3); font-size:9px; letter-spacing:.12em; text-transform:uppercase; margin-top:3px; }

        /* Marketing text */
        .lp-mktg-h { font-family:'Syne',sans-serif; font-weight:800; color:white; font-size:clamp(1.7rem,3vw,2.4rem); line-height:1.15; margin-bottom:16px; letter-spacing:-.02em; }
        .lp-mktg-orange { background:linear-gradient(90deg,#E8602C,#F97316); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .lp-mktg-p { color:rgba(255,255,255,.5); font-size:.9rem; line-height:1.75; margin-bottom:32px; max-width:340px; }

        /* Feature list */
        .lp-feat-item { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
        .lp-feat-icon { width:34px; height:34px; border-radius:8px; background:rgba(255,255,255,.07); display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
        .lp-feat-text { color:rgba(255,255,255,.6); font-size:.83rem; font-weight:500; }

        /* Form side */
        .lp-form-title { font-family:'Syne',sans-serif; font-weight:800; font-size:1.8rem; color:#FFFFFF !important; margin-bottom:6px; }
        .lp-form-sub { color:#94A3B8 !important; font-size:.85rem; margin-bottom:28px; }

        /* Form fields */
        .lp-field { margin-bottom:18px; }
        .lp-label { display:block; font-size:.8rem; font-weight:600; color:#FFFFFF !important; margin-bottom:8px; }
        .lp-input {
          width:100%; padding:13px 16px;
          border:1.5px solid #272E49 !important; border-radius:12px;
          font-size:.875rem; font-family:'Inter',sans-serif;
          color:#FFFFFF !important; background:#1A1F36 !important; outline:none;
          transition:border-color .2s, box-shadow .2s;
        }
        .lp-input::placeholder { color:#64748B !important; }
        .lp-input:focus { border-color:#E8602C !important; box-shadow:0 0 0 3px rgba(232,96,44,.2); }

        .lp-submit {
          width:100%; padding:14px;
          background:#E8602C; color:white; border:none;
          border-radius:12px; font-family:'Syne',sans-serif; font-weight:700;
          font-size:.95rem; cursor:pointer; margin-top:6px;
          box-shadow:0 4px 20px rgba(232,96,44,.35);
          transition:all .2s ease; display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .lp-submit:hover { background:#D4501E; transform:translateY(-1px); box-shadow:0 6px 24px rgba(232,96,44,.45); }
        .lp-submit:disabled { opacity:.6; cursor:not-allowed; transform:none; }

        .lp-spinner {
          width:14px; height:14px; border:2px solid rgba(255,255,255,.3);
          border-top-color:white; border-radius:50%;
          animation:lp-spin .7s linear infinite;
        }
        @keyframes lp-spin { to { transform:rotate(360deg); } }

        .lp-error { padding:11px 14px; border-radius:10px; background:#2A1414; border:1px solid #5A2020; color:#EF4444; font-size:.82rem; margin-bottom:16px; font-weight:600; }
        .lp-register { text-align:center; margin-top:20px; font-size:.83rem; color:#94A3B8; }
        .lp-register a { color:#E8602C; font-weight:700; text-decoration:none; }
        .lp-register a:hover { text-decoration:underline; }

        @media (max-width:768px) {
          .lp-left { display:none; }
          .lp-right { background:#0B0E17; padding:24px 16px; }
        }
      `}</style>

      <div className="lp-root">
        {/* ── Left marketing panel ── */}
        <div className="lp-left">
          <div className="lp-left-dot-grid" />
          <div className="lp-left-glow1" />
          <div className="lp-left-glow2" />

          <div className="lp-left-inner">
            <Link href="/" className="lp-logo">
              <div className="lp-logo-icon">H</div>
              <div>
                <div className="lp-logo-name">Hostel Marketplace</div>
                <div className="lp-logo-sub">Campus Exchange</div>
              </div>
            </Link>

            <h2 className="lp-mktg-h">
              Welcome back to<br />
              <span className="lp-mktg-orange">Campus Exchange.</span>
            </h2>

            <p className="lp-mktg-p">
              Access your verified student marketplace. Buy, sell, lend, borrow, swap, or donate with verified peers in your hostel network.
            </p>

            {[
              { icon: '🔐', t: 'Single-use OTP handover protection' },
              { icon: '⚡', t: 'AI condition & fair price assist' },
              { icon: '🛡️', t: 'Verified student community' },
              { icon: '📊', t: 'Trust score audit trail' },
            ].map(f => (
              <div key={f.t} className="lp-feat-item">
                <div className="lp-feat-icon">{f.icon}</div>
                <span className="lp-feat-text">{f.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="lp-right">
          <div className="lp-form-box">
            <h1 className="lp-form-title">Student Login</h1>
            <p className="lp-form-sub">Sign in with your registered account email and password.</p>

            {/* Error */}
            {error && <div className="lp-error">⚠ {error}</div>}

            {/* Form */}
            <form onSubmit={submit}>
              <div className="lp-field">
                <label className="lp-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your.name@college.edu or gmail.com"
                  required
                  className="lp-input"
                />
              </div>
              <div className="lp-field">
                <label className="lp-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="lp-input"
                />
              </div>
              <button type="submit" disabled={loading} className="lp-submit">
                {loading
                  ? <><span className="lp-spinner" /> Logging in...</>
                  : 'Log In →'}
              </button>
            </form>

            <p className="lp-register">
              Don't have an account? <Link href="/register">Create an Account →</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F1ED' }}>
        <div style={{ width: 380, height: 480, borderRadius: 20, background: 'linear-gradient(90deg,#E8E3DC 25%,#EEE9E4 50%,#E8E3DC 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
