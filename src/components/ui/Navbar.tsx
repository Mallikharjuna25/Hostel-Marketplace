'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from '@/components/theme/ThemeProvider'

interface UserSession {
  id: string; email: string; role: string; isVerified: boolean
  profile?: { fullName: string; hostel?: string }
  trustScore?: number | { score: number }
}
const trustVal = (t: UserSession['trustScore']) => typeof t === 'number' ? t : (t as any)?.score ?? 50

const NAV_LINKS = [
  { href: '/explore', label: 'Explore' },
  { href: '/ways-to-trade', label: '6 Ways to Trade' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/how-it-works#trust', label: 'Trust & Safety' },
]

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loadingNotifs, setLoadingNotifs] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)
  const notifDropRef = useRef<HTMLDivElement>(null)

  const isHero = pathname === '/'
  const isAuthPage = pathname === '/login' || pathname === '/register'

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/users/me', {
        cache: 'no-store',
        credentials: 'include',
      })
      if (res.ok) {
        const d = await res.json()
        setUser(d)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifs = async () => {
    if (!user) return
    try {
      setLoadingNotifs(true)
      const res = await fetch('/api/notifications', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setNotifCount(data?.unread ?? 0)
        if (data?.notifications) {
          setNotifications(data.notifications)
        }
      }
    } catch {
      // ignore
    } finally {
      setLoadingNotifs(false)
    }
  }

  useEffect(() => {
    if (!isAuthPage) {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [pathname, isAuthPage])

  useEffect(() => {
    if (user) {
      fetchNotifs()
      const interval = setInterval(fetchNotifs, 8000)
      return () => clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
      if (notifDropRef.current && !notifDropRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const handleToggleNotif = () => {
    setNotifDropdownOpen(prev => !prev)
    setDropdownOpen(false)
    if (!notifDropdownOpen) {
      fetchNotifs()
    }
  }

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' })
      setNotifCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch {
      // ignore
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    try {
      document.cookie = 'token=; Max-Age=0; path=/;'
      document.cookie = 'hm_session=; Max-Age=0; path=/;'
    } catch {
      // ignore
    }
    setUser(null)
    setNotifCount(0)
    setNotifications([])
    setDropdownOpen(false)
    setNotifDropdownOpen(false)
    window.location.href = '/login'
  }

  if (isAuthPage) {
    return null
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        .nb-root {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 64px; transition: all .3s ease;
          font-family: 'Inter', sans-serif;
        }
        .nb-root.hero-transparent { background: transparent; border-bottom: 1px solid transparent; }
        .nb-root.hero-scrolled { background: rgba(8,8,22,.88); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border-bottom:1px solid rgba(255,255,255,.1); box-shadow:0 4px 24px rgba(0,0,0,.4); }
        .nb-root.page-solid { background: white; border-bottom: 1px solid #E8E3DC; box-shadow: 0 1px 12px rgba(17,17,40,.06); }
        .nb-inner { max-width:1280px; margin:0 auto; padding:0 24px; height:100%; display:flex; align-items:center; justify-content:space-between; gap:16px; }

        /* Logo */
        .nb-logo { display:flex; align-items:center; gap:10px; text-decoration:none; flex-shrink:0; }
        .nb-logo-icon { width:36px; height:36px; border-radius:10px; background:#E8602C; display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-weight:800; color:white; font-size:14px; box-shadow:0 4px 12px rgba(232,96,44,.35); transition:box-shadow .2s; }
        .nb-logo:hover .nb-logo-icon { box-shadow:0 4px 18px rgba(232,96,44,.55); }
        .nb-logo-text { display:flex; flex-direction:column; }
        .nb-logo-name { font-family:'Syne',sans-serif; font-weight:700; font-size:14px; line-height:1; }
        .nb-logo-sub { font-size:9px; letter-spacing:.1em; text-transform:uppercase; margin-top:3px; }

        /* Links */
        .nb-links { display:flex; align-items:center; gap:2px; }
        @media(max-width:768px) { .nb-links { display:none; } }
        .nb-link { padding:6px 12px; border-radius:8px; font-size:13px; font-weight:500; text-decoration:none; transition:all .15s; }
        .nb-link.on-hero { color:rgba(255,255,255,.75); }
        .nb-link.on-hero:hover { color:white; background:rgba(255,255,255,.08); }
        .nb-link.on-page { color:#4B5563; }
        .nb-link.on-page:hover { color:#111128; background:#F4F1ED; }
        .nb-link.active-page { color:#E8602C !important; background:#FEF3EC !important; }

        /* Right */
        .nb-right { display:flex; align-items:center; gap:8px; }

        /* CTA */
        .nb-cta { display:inline-flex; align-items:center; gap:5px; padding:7px 14px; border-radius:9px; font-size:12px; font-weight:700; font-family:'Syne',sans-serif; text-decoration:none; background:#E8602C; color:white; box-shadow:0 3px 12px rgba(232,96,44,.35); transition:all .2s; }
        .nb-cta:hover { background:#D4501E; transform:translateY(-1px); box-shadow:0 5px 18px rgba(232,96,44,.45); }

        /* Notif */
        .nb-notif { position:relative; padding:7px; border-radius:8px; cursor:pointer; transition:background .15s; background:transparent; border:none; display:flex; align-items:center; justify-content:center; }
        .nb-notif.on-hero:hover { background:rgba(255,255,255,.1); }
        .nb-notif.on-page:hover { background:#F4F1ED; }
        .nb-notif-dot { position:absolute; top:2px; right:2px; min-width:16px; height:16px; padding:0 3px; border-radius:8px; background:#E8602C; color:white; font-size:9px; font-weight:800; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(232,96,44,0.4); }

        .nb-notif-dropdown { position:absolute; top:calc(100% + 8px); right:0; width:320px; max-height:420px; background:white; border:1px solid #E8E3DC; border-radius:18px; box-shadow:0 18px 48px rgba(17,17,40,.18); overflow:hidden; z-index:210; display:flex; flex-direction:column; }
        .nb-notif-head { padding:12px 16px; border-bottom:1px solid #F0EDE8; display:flex; align-items:center; justify-content:between; background:#FAF8F5; }
        .nb-notif-title { font-size:12px; font-weight:800; font-family:'Syne',sans-serif; color:#111128; }
        .nb-notif-mark { font-size:10px; font-weight:700; color:#E8602C; background:none; border:none; cursor:pointer; }
        .nb-notif-mark:hover { text-decoration:underline; }
        .nb-notif-list { overflow-y:auto; max-height:340px; padding:6px 0; }
        .nb-notif-item { display:block; padding:10px 14px; text-decoration:none; transition:background .12s; border-bottom:1px solid #F9F7F5; }
        .nb-notif-item:hover { background:#FAF8F5; }
        .nb-notif-item.unread { background:#FFF8F3; }
        .nb-notif-item-title { font-size:11px; font-weight:700; color:#111128; margin-bottom:2px; display:flex; align-items:center; justify-content:space-between; }
        .nb-notif-item-msg { font-size:11px; color:#6B7280; line-height:1.3; }
        .nb-notif-item-time { font-size:9px; color:#9CA3AF; margin-top:3px; }
        .nb-notif-empty { padding:24px 16px; text-align:center; font-size:11px; color:#6B7280; }

        /* Avatar / dropdown */
        .nb-avatar-btn { display:flex; align-items:center; gap:8px; padding:5px 8px; border-radius:10px; cursor:pointer; border:none; background:transparent; transition:background .15s; }
        .nb-avatar-btn.on-hero:hover { background:rgba(255,255,255,.08); }
        .nb-avatar-btn.on-page:hover { background:#F4F1ED; }
        .nb-avatar { width:32px; height:32px; border-radius:8px; background:#111128; color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px; flex-shrink:0; }
        .nb-avatar-info { text-align:left; }
        .nb-avatar-name { font-size:12px; font-weight:600; line-height:1; }
        .nb-avatar-trust { font-size:10px; margin-top:2px; }
        .nb-chevron { transition:transform .2s; }
        .nb-chevron.open { transform:rotate(180deg); }

        .nb-dropdown { position:absolute; top:calc(100% + 8px); right:0; width:210px; background:white; border:1px solid #E8E3DC; border-radius:16px; box-shadow:0 16px 48px rgba(17,17,40,.14); overflow:hidden; z-index:200; }
        .nb-dd-header { padding:14px 16px; border-bottom:1px solid #F0EDE8; }
        .nb-dd-name { font-size:12px; font-weight:700; color:#111128; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .nb-dd-trust { display:flex; align-items:center; gap:6px; margin-top:5px; }
        .nb-dd-trust-dot { width:6px; height:6px; border-radius:50%; background:#10B981; }
        .nb-dd-trust-val { font-size:11px; font-weight:600; color:#10B981; }
        .nb-dd-item { display:block; padding:9px 16px; font-size:13px; color:#374151; text-decoration:none; transition:all .12s; }
        .nb-dd-item:hover { background:#F4F1ED; color:#E8602C; }
        .nb-dd-divider { height:1px; background:#F0EDE8; margin:4px 0; }
        .nb-dd-logout { display:block; width:100%; text-align:left; padding:9px 16px; font-size:13px; color:#DC2626; background:none; border:none; cursor:pointer; transition:background .12s; }
        .nb-dd-logout:hover { background:#FEF2F2; }

        /* Auth links */
        .nb-login { font-size:13px; font-weight:600; text-decoration:none; padding:6px 12px; border-radius:8px; transition:all .15s; }
        .nb-login.on-hero { color:rgba(255,255,255,.75); }
        .nb-login.on-hero:hover { color:white; background:rgba(255,255,255,.08); }
        .nb-login.on-page { color:#4B5563; }
        .nb-login.on-page:hover { color:#111128; background:#F4F1ED; }

        /* Dark theme support for Navbar */
        .dark .nb-root.page-solid { background: rgba(19, 23, 40, 0.95); border-bottom: 1px solid #272E49; box-shadow: 0 4px 20px rgba(0,0,0,.4); }
        .dark .nb-link.on-page { color: #9CA3AF; }
        .dark .nb-link.on-page:hover { color: #F3F4F6; background: #1A1F36; }
        .dark .nb-login.on-page { color: #D1D5DB; }
        .dark .nb-login.on-page:hover { color: #FFFFFF; background: #1A1F36; }
        .dark .nb-dropdown { background: #131728; border-color: #272E49; box-shadow: 0 16px 48px rgba(0,0,0,.5); }
        .dark .nb-dd-header { border-bottom-color: #272E49; }
        .dark .nb-dd-name { color: #F3F4F6; }
        .dark .nb-dd-item { color: #D1D5DB; }
        .dark .nb-dd-item:hover { background: #1A1F36; color: #E8602C; }
        .dark .nb-dd-divider { background: #272E49; }
        .dark .nb-notif-dropdown { background: #131728; border-color: #272E49; box-shadow: 0 18px 48px rgba(0,0,0,.5); }
        .dark .nb-notif-head { background: #1A1F36; border-bottom-color: #272E49; }
        .dark .nb-notif-title { color: #F3F4F6; }
        .dark .nb-notif-item { border-bottom-color: #1E2338; }
        .dark .nb-notif-item:hover { background: #1A1F36; }
        .dark .nb-notif-item.unread { background: rgba(232,96,44,0.12); }
        .dark .nb-notif-item-title { color: #F3F4F6; }
        .dark .nb-notif-item-msg { color: #9CA3AF; }
        .dark .nb-avatar-btn.on-page:hover { background: #1A1F36; }
        .dark .nb-notif.on-page:hover { background: #1A1F36; }
        .dark .nb-mobile-menu-inner { background: #131728; border-top-color: #272E49; }
        .dark .nb-mobile-link { color: #D1D5DB; }
        .dark .nb-mobile-link:hover { background: #1A1F36; color: #E8602C; }

        /* Theme Toggle Button */
        .nb-theme-btn {
          width: 34px; height: 34px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          background: transparent; border: 1px solid transparent;
          cursor: pointer; transition: all .15s; font-size: 15px;
        }
        .nb-theme-btn.on-hero { color: white; }
        .nb-theme-btn.on-hero:hover { background: rgba(255,255,255,.12); }
        .nb-theme-btn.on-page { color: #4B5563; border-color: #E5E2DD; background: #FAF8F5; }
        .nb-theme-btn.on-page:hover { color: #111128; border-color: #E8602C; background: #FFFFFF; }
        .dark .nb-theme-btn.on-page { color: #F3F4F6; border-color: #272E49; background: #1A1F36; }
        .dark .nb-theme-btn.on-page:hover { border-color: #E8602C; background: #202742; }

        /* Mobile */
        .nb-mobile-btn { padding:7px; border-radius:8px; border:none; background:transparent; cursor:pointer; display:none; align-items:center; justify-content:center; transition:background .15s; }
        @media(max-width:768px) { .nb-mobile-btn { display:flex; } .nb-cta { display:none; } }
        .nb-mobile-btn.on-hero:hover { background:rgba(255,255,255,.1); }
        .nb-mobile-btn.on-page:hover { background:#F4F1ED; }

        /* Mobile menu */
        .nb-mobile-menu { display:none; }
        @media(max-width:768px) { .nb-mobile-menu.open { display:block; } }
        .nb-mobile-menu-inner { background:white; border-top:1px solid #E8E3DC; padding:12px 16px; }
        .nb-mobile-link { display:block; padding:10px 12px; font-size:14px; font-weight:500; color:#374151; text-decoration:none; border-radius:8px; transition:all .15s; }
        .nb-mobile-link:hover { background:#F4F1ED; color:#E8602C; }
        .nb-mobile-auth { display:flex; gap:8px; margin-top:12px; padding-top:12px; border-top:1px solid #F0EDE8; }
        .nb-mobile-btn-secondary { flex:1; padding:10px; border-radius:10px; border:1.5px solid #E8E3DC; background:white; font-size:13px; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; color:#374151; text-decoration:none; display:flex; align-items:center; justify-content:center; transition:all .15s; }
        .nb-mobile-btn-secondary:hover { border-color:#E8602C; color:#E8602C; }
        .nb-mobile-btn-primary { flex:1; padding:10px; border-radius:10px; background:#E8602C; color:white; font-size:13px; font-weight:700; font-family:'Syne',sans-serif; cursor:pointer; border:none; text-decoration:none; display:flex; align-items:center; justify-content:center; transition:background .15s; }
        .nb-mobile-btn-primary:hover { background:#D4501E; }

        /* Skeleton */
        .nb-skeleton { border-radius:8px; background:linear-gradient(90deg,rgba(255,255,255,.15) 25%,rgba(255,255,255,.25) 50%,rgba(255,255,255,.15) 75%); background-size:200% 100%; animation:nb-shimmer 1.5s infinite; }
        @keyframes nb-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>

      <nav className={`nb-root ${isHero ? (scrolled ? 'hero-scrolled' : 'hero-transparent') : 'page-solid'}`}>
        <div className="nb-inner">

          {/* Logo */}
          <Link href="/" className="nb-logo">
            <div className="nb-logo-icon">H</div>
            <div className="nb-logo-text">
              <span className="nb-logo-name" style={{ color: isHero ? 'white' : 'var(--text-main)' }}>Hostel Market</span>
              <span className="nb-logo-sub" style={{ color: isHero ? 'rgba(255,255,255,.35)' : 'var(--text-muted)' }}>CAMPUS EXCHANGE</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav className="nb-links">
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`nb-link ${isHero ? 'on-hero' : 'on-page'} ${pathname === l.href ? 'active-page' : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right side CTA / Profile */}
          <div className="nb-right">
            {!loading && user && (
              <Link href="/listings/new" className="nb-cta">+ List Something</Link>
            )}

            {user && (
              <div style={{ position: 'relative' }} ref={notifDropRef}>
                <button
                  type="button"
                  onClick={handleToggleNotif}
                  className={`nb-notif ${isHero ? 'on-hero' : 'on-page'}`}
                  aria-label="Notifications"
                >
                  <svg width="20" height="20" fill="none" stroke={isHero ? 'rgba(255,255,255,.85)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifCount > 0 && (
                    <span className="nb-notif-dot">{notifCount}</span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="nb-notif-dropdown">
                    <div className="nb-notif-head">
                      <span className="nb-notif-title">🔔 Notifications {notifCount > 0 && `(${notifCount})`}</span>
                      {notifCount > 0 && (
                        <button type="button" onClick={markAllRead} className="nb-notif-mark">
                          ✓ Mark all read
                        </button>
                      )}
                    </div>

                    <div className="nb-notif-list">
                      {loadingNotifs && notifications.length === 0 ? (
                        <div className="nb-notif-empty">Loading notifications...</div>
                      ) : notifications.length === 0 ? (
                        <div className="nb-notif-empty">
                          <span style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}>✨</span>
                          No notifications yet. You're all caught up!
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <Link
                            key={n.id}
                            href={n.link || '/dashboard'}
                            onClick={() => setNotifDropdownOpen(false)}
                            className={`nb-notif-item ${!n.read ? 'unread' : ''}`}
                          >
                            <div className="nb-notif-item-title">
                              <span>{n.title}</span>
                              {!n.read && (
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8602C' }} />
                              )}
                            </div>
                            <p className="nb-notif-item-msg">{n.message}</p>
                            <span className="nb-notif-item-time">
                              {n.createdAt ? new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                            </span>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {loading ? (
              <div className="nb-skeleton" style={{ width: 80, height: 32 }} />
            ) : user ? (
              <div style={{ position: 'relative' }} ref={dropRef}>
                <button
                  className={`nb-avatar-btn ${isHero ? 'on-hero' : 'on-page'}`}
                  onClick={() => setDropdownOpen(p => !p)}
                >
                  <div className="nb-avatar">
                    {user.profile?.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="nb-avatar-info" style={{ display: 'none' }}>
                    <div className="nb-avatar-name" style={{ color: isHero ? 'white' : 'var(--text-main)' }}>
                      {user.profile?.fullName?.split(' ')[0] || 'Student'}
                    </div>
                    <div className="nb-avatar-trust" style={{ color: isHero ? 'rgba(255,255,255,.5)' : '#9CA3AF' }}>
                      Trust {trustVal(user.trustScore)}/100
                    </div>
                  </div>
                  <svg className={`nb-chevron ${dropdownOpen ? 'open' : ''}`} width="14" height="14" fill="none" stroke={isHero ? 'rgba(255,255,255,.6)' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="nb-dropdown">
                    <div className="nb-dd-header">
                      <div className="nb-dd-name">{user.profile?.fullName || user.email}</div>
                      <div className="nb-dd-trust">
                        <span className="nb-dd-trust-dot" />
                        <span className="nb-dd-trust-val">Trust {trustVal(user.trustScore)}/100</span>
                      </div>
                    </div>
                    <Link href="/dashboard" className="nb-dd-item" onClick={() => setDropdownOpen(false)}>📊 Dashboard</Link>
                    <Link href="/listings/new" className="nb-dd-item" onClick={() => setDropdownOpen(false)}>+ List Something</Link>
                    <Link href="/messages" className="nb-dd-item" onClick={() => setDropdownOpen(false)}>💬 Messages</Link>
                    <Link href={`/profile/${user.id}`} className="nb-dd-item" onClick={() => setDropdownOpen(false)}>👤 My Profile</Link>
                    {user.role === 'ADMIN' && (
                      <Link href="/admin" className="nb-dd-item" onClick={() => setDropdownOpen(false)}>🛡️ Admin Panel</Link>
                    )}
                    <div className="nb-dd-divider" />
                    <button className="nb-dd-logout" onClick={logout}>Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className={`nb-login ${isHero ? 'on-hero' : 'on-page'}`}>
                  Log In
                </Link>
                <Link href="/register" className="nb-cta">Sign Up</Link>
              </>
            )}

            {/* Mobile toggle */}
            <button
              className={`nb-mobile-btn ${isHero ? 'on-hero' : 'on-page'}`}
              onClick={() => setMobileOpen(p => !p)}
            >
              <svg width="20" height="20" fill="none" stroke={isHero ? 'rgba(255,255,255,.85)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path d="M6 18L18 6M6 6l12 12" />
                  : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`nb-mobile-menu ${mobileOpen ? 'open' : ''}`}>
          <div className="nb-mobile-menu-inner">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="nb-mobile-link" onClick={() => setMobileOpen(false)}>
                {l.label}
              </Link>
            ))}
            {!user && (
              <div className="nb-mobile-auth">
                <Link href="/login" className="nb-mobile-btn-secondary" onClick={() => setMobileOpen(false)}>Log In</Link>
                <Link href="/register" className="nb-mobile-btn-primary" onClick={() => setMobileOpen(false)}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
