'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'

export default function AdminConsolePage() {
  const router = useRouter()
  const [activeNav, setActiveNav] = useState<'DASHBOARD' | 'TRANSACTIONS' | 'STUDENTS' | 'LISTINGS' | 'TRUST' | 'DISPUTES' | 'SETTINGS'>('STUDENTS')
  const [activeHeaderTab, setActiveHeaderTab] = useState<'overview' | 'activity' | 'analytics'>('activity')
  const [searchQuery, setSearchQuery] = useState('')
  const [transactions, setTransactions] = useState<any[]>([])
  const [disputes, setDisputes] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null)
  const [totalVolume, setTotalVolume] = useState(0)
  const [activeExchanges, setActiveExchanges] = useState(0)
  const [loading, setLoading] = useState(true)

  // Trust score adjustment tool state
  const [adjustUserId, setAdjustUserId] = useState('')
  const [currentScoreDisplay, setCurrentScoreDisplay] = useState(92)
  const [trustAdjusting, setTrustAdjusting] = useState(false)
  const [adjustSuccessMsg, setAdjustSuccessMsg] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const [txRes, disRes, userRes] = await Promise.all([
        fetch('/api/admin/transactions'),
        fetch('/api/admin/disputes'),
        fetch('/api/admin/users'),
      ])

      if (txRes.ok) {
        const txData = await txRes.json()
        setTransactions(txData.transactions || [])
        if (txData.totalVolume) setTotalVolume(txData.totalVolume)
        if (txData.activeExchanges !== undefined) setActiveExchanges(txData.activeExchanges)
      }

      if (disRes.ok) {
        const disData = await disRes.json()
        setDisputes(disData.disputes || [])
      }

      if (userRes.ok) {
        const userData = await userRes.json()
        setStudents(userData.users || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVerify = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isVerified: !currentStatus }),
      })
      if (res.ok) {
        setStudents(prev => prev.map(s => s.id === userId ? { ...s, isVerified: !currentStatus } : s))
        if (selectedStudent && selectedStudent.id === userId) {
          setSelectedStudent((prev: any) => ({ ...prev, isVerified: !currentStatus }))
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleUserTrustScoreChange = async (userId: string, currentScore: number, delta: number) => {
    const newScore = Math.min(100, Math.max(0, currentScore + delta))
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, trustScore: newScore }),
      })
      if (res.ok) {
        setStudents(prev => prev.map(s => s.id === userId ? { ...s, trustScore: newScore } : s))
        if (selectedStudent && selectedStudent.id === userId) {
          setSelectedStudent((prev: any) => ({ ...prev, trustScore: newScore }))
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAdjustTrust = async (delta: number) => {
    setTrustAdjusting(true)
    setAdjustSuccessMsg(null)
    try {
      const newScore = Math.min(100, Math.max(10, currentScoreDisplay + delta))
      setCurrentScoreDisplay(newScore)
      setAdjustSuccessMsg(`Trust score adjusted to ${newScore}/100`)
    } catch {
      // ignore
    } finally {
      setTrustAdjusting(false)
    }
  }

  const filteredTransactions = transactions.filter(t =>
    t.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.buyer.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6" style={{ paddingTop: '96px' }}>
        {/* ─── LEFT ADMIN SIDEBAR ─── */}
        <aside className="w-full lg:w-64 flex-shrink-0 theme-card rounded-3xl p-5 space-y-6 self-start">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-[#E8602C] text-white flex items-center justify-center font-heading font-extrabold text-lg shadow-sm">
              H
            </div>
            <div>
              <h2 className="font-heading font-bold text-sm theme-title">Hostel Market</h2>
              <span className="text-[10px] font-mono theme-muted uppercase tracking-wider block">Admin Console</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { id: 'STUDENTS', icon: '👥', label: 'All Students & Persons' },
              { id: 'TRANSACTIONS', icon: '💳', label: 'Transactions' },
              { id: 'DASHBOARD', icon: '📊', label: 'Dashboard' },
              { id: 'LISTINGS', icon: '📦', label: 'Listings' },
              { id: 'TRUST', icon: '🛡️', label: 'Trust Scores' },
              { id: 'DISPUTES', icon: '⚠️', label: 'Disputes' },
              { id: 'SETTINGS', icon: '⚙️', label: 'Settings' },
            ].map(item => {
              const active = activeNav === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#E8602C] text-white shadow-xs'
                      : 'theme-title hover:bg-[#FAF8F5] dark:hover:bg-[#1A1F36]'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="pt-4 border-t space-y-3" style={{ borderColor: 'var(--border-color)' }}>
            <div className="px-3 py-1.5 rounded-xl badge-green text-[11px] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>System Status: Healthy</span>
            </div>

            <Link
              href="/dashboard"
              className="w-full flex items-center gap-2 px-3 py-2 text-xs theme-muted hover:text-[#E8602C] transition-colors"
            >
              <span>←</span>
              <span>Back to Student Portal</span>
            </Link>
          </div>
        </aside>

        {/* ─── MAIN ADMIN MONITORING CONSOLE ─── */}
        <main className="flex-1 space-y-6">
          {/* Top Bar Header */}
          <div className="theme-card rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <span className="absolute left-3 top-2.5 text-xs theme-muted">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search transactions, users..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl theme-input text-xs focus:outline-none focus:border-[#E8602C]"
              />
            </div>

            {/* Header Tabs */}
            <div className="flex items-center gap-4 text-xs font-semibold theme-muted">
              {['overview', 'activity', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveHeaderTab(tab as any)}
                  className={`capitalize transition-colors cursor-pointer ${
                    activeHeaderTab === tab ? 'text-[#E8602C] font-bold border-b-2 border-[#E8602C] pb-0.5' : 'hover:text-[#E8602C]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              VIEW 0: ALL STUDENTS & PERSON DIRECTORY
          ══════════════════════════════════════════════════ */}
          {activeNav === 'STUDENTS' && (
            <div className="space-y-6">
              {/* Top Banner with Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-extrabold text-2xl theme-title">
                    👥 Student &amp; Person Directory
                  </h1>
                  <p className="text-xs theme-muted">
                    Full campus records, roll numbers, hostel blocks, trust scores, and verification status for all users.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="theme-card px-4 py-2.5 rounded-2xl text-center shadow-xs">
                    <span className="text-[10px] font-mono theme-muted uppercase tracking-wider block">TOTAL PERSONS</span>
                    <span className="font-heading font-extrabold text-xl text-[#E8602C]">{students.length}</span>
                  </div>
                  <div className="theme-card px-4 py-2.5 rounded-2xl text-center shadow-xs">
                    <span className="text-[10px] font-mono theme-muted uppercase tracking-wider block">ID VERIFIED</span>
                    <span className="font-heading font-extrabold text-xl text-[#2D6A4F] dark:text-[#34D399]">
                      {students.filter(s => s.isVerified).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Students Table */}
              <div className="theme-card rounded-3xl p-6 space-y-4 shadow-xl border" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎓</span>
                    <h3 className="font-heading font-bold text-sm theme-title">All Registered Campus Profiles</h3>
                  </div>
                  <span className="text-xs theme-muted">
                    Showing {students.filter(s =>
                      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      s.hostel.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length} of {students.length} students
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="theme-muted uppercase tracking-wider border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <th className="pb-3 font-bold">Student / Person</th>
                        <th className="pb-3 font-bold">Roll No. &amp; Dept</th>
                        <th className="pb-3 font-bold">Hostel &amp; Room</th>
                        <th className="pb-3 font-bold">Trust Score</th>
                        <th className="pb-3 font-bold">ID Verified</th>
                        <th className="pb-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y theme-title" style={{ borderColor: 'var(--border-color)' }}>
                      {students
                        .filter(s =>
                          s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.hostel.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(student => (
                          <tr key={student.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#1A1F36] transition-colors">
                            {/* Student Profile Info */}
                            <td className="py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#E8602C] text-white flex items-center justify-center font-bold text-xs">
                                  {student.fullName?.slice(0, 2).toUpperCase() || 'ST'}
                                </div>
                                <div>
                                  <span className="font-bold block theme-title">{student.fullName}</span>
                                  <span className="text-[11px] theme-muted">{student.email}</span>
                                </div>
                              </div>
                            </td>

                            {/* Roll Number & Dept */}
                            <td className="py-3.5">
                              <span className="font-mono font-bold block text-xs">{student.rollNumber || 'N/A'}</span>
                              <span className="text-[11px] theme-muted">{student.branch || 'Student'} · Yr {student.academicYear || 1}</span>
                            </td>

                            {/* Hostel & Room */}
                            <td className="py-3.5">
                              <span className="font-semibold block">{student.hostel} {student.block ? `(${student.block})` : ''}</span>
                              <span className="text-[11px] theme-muted">{student.room ? `Room ${student.room}` : 'Hostel Wing'}</span>
                            </td>

                            {/* Trust Score */}
                            <td className="py-3.5">
                              <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  student.trustScore >= 80 ? 'badge-green' :
                                  student.trustScore >= 60 ? 'badge-orange' : 'badge-neutral text-red-400'
                                }`}>
                                  🛡️ {student.trustScore}/100
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleUserTrustScoreChange(student.id, student.trustScore, 5)}
                                    title="Add +5 Trust"
                                    className="px-1.5 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] font-bold text-[10px] hover:bg-[#10B981]/30 cursor-pointer"
                                  >
                                    +5
                                  </button>
                                  <button
                                    onClick={() => handleUserTrustScoreChange(student.id, student.trustScore, -5)}
                                    title="Penalize -5 Trust"
                                    className="px-1.5 py-0.5 rounded bg-[#EF4444]/20 text-[#EF4444] font-bold text-[10px] hover:bg-[#EF4444]/30 cursor-pointer"
                                  >
                                    -5
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* ID Verification Toggle */}
                            <td className="py-3.5">
                              <button
                                onClick={() => handleToggleVerify(student.id, student.isVerified)}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                  student.isVerified
                                    ? 'bg-[#10B981] text-white hover:bg-[#059669]'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                {student.isVerified ? '✓ Verified' : '○ Unverified'}
                              </button>
                            </td>

                            {/* View Full Profile */}
                            <td className="py-3.5 text-right">
                              <button
                                onClick={() => setSelectedStudent(student)}
                                className="px-3 py-1.5 rounded-xl bg-[#E8602C] text-white text-[11px] font-bold hover:bg-[#CF4F20] transition-colors cursor-pointer"
                              >
                                View File →
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── FULL STUDENT FILE INSPECTION MODAL ─── */}
          {selectedStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
              <div className="theme-card rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl border border-[#E8602C]/40">
                <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#E8602C] text-white flex items-center justify-center font-heading font-extrabold text-lg shadow-md">
                      {selectedStudent.fullName?.slice(0, 2).toUpperCase() || 'ST'}
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-lg theme-title">{selectedStudent.fullName}</h3>
                      <span className="text-xs theme-muted">{selectedStudent.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="w-8 h-8 rounded-full theme-card-alt flex items-center justify-center text-xs font-bold hover:text-[#E8602C] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Profile Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl theme-card-alt space-y-1">
                    <span className="text-[10px] theme-muted uppercase font-bold block">Roll Number:</span>
                    <strong className="theme-title">{selectedStudent.rollNumber || 'N/A'}</strong>
                  </div>
                  <div className="p-3 rounded-xl theme-card-alt space-y-1">
                    <span className="text-[10px] theme-muted uppercase font-bold block">Phone Number:</span>
                    <strong className="theme-title">{selectedStudent.phone || 'Private'}</strong>
                  </div>
                  <div className="p-3 rounded-xl theme-card-alt space-y-1">
                    <span className="text-[10px] theme-muted uppercase font-bold block">Hostel &amp; Wing:</span>
                    <strong className="theme-title">{selectedStudent.hostel} · {selectedStudent.block || ''}</strong>
                  </div>
                  <div className="p-3 rounded-xl theme-card-alt space-y-1">
                    <span className="text-[10px] theme-muted uppercase font-bold block">Room Number:</span>
                    <strong className="theme-title">{selectedStudent.room || 'Hostel Room'}</strong>
                  </div>
                  <div className="p-3 rounded-xl theme-card-alt space-y-1">
                    <span className="text-[10px] theme-muted uppercase font-bold block">Academic Department:</span>
                    <strong className="theme-title">{selectedStudent.branch} (Year {selectedStudent.academicYear})</strong>
                  </div>
                  <div className="p-3 rounded-xl theme-card-alt space-y-1">
                    <span className="text-[10px] theme-muted uppercase font-bold block">Institution / College:</span>
                    <strong className="theme-title">{selectedStudent.college || 'Campus University'}</strong>
                  </div>
                  <div className="p-3 rounded-xl theme-card-alt space-y-1">
                    <span className="text-[10px] theme-muted uppercase font-bold block">Total Marketplace Trades:</span>
                    <strong className="text-[#2D6A4F] dark:text-[#34D399] font-bold">{selectedStudent.totalTransactions || 0} Exchanged</strong>
                  </div>
                  <div className="p-3 rounded-xl theme-card-alt space-y-1">
                    <span className="text-[10px] theme-muted uppercase font-bold block">Active Listings:</span>
                    <strong className="text-[#E8602C] font-bold">{selectedStudent.totalListings || 0} Posted</strong>
                  </div>
                </div>

                {/* Trust Score & ID Verification Controls */}
                <div className="p-4 rounded-2xl bg-[#0B0E17] border space-y-3" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold theme-title">Campus Trust Rating:</span>
                    <span className="font-heading font-extrabold text-base text-[#10B981]">
                      {selectedStudent.trustScore}/100
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUserTrustScoreChange(selectedStudent.id, selectedStudent.trustScore, 10)}
                      className="flex-1 py-2 rounded-xl bg-[#10B981]/20 text-[#10B981] font-bold text-xs hover:bg-[#10B981]/30 cursor-pointer"
                    >
                      +10 Trust Bonus
                    </button>
                    <button
                      onClick={() => handleUserTrustScoreChange(selectedStudent.id, selectedStudent.trustScore, -10)}
                      className="flex-1 py-2 rounded-xl bg-[#EF4444]/20 text-[#EF4444] font-bold text-xs hover:bg-[#EF4444]/30 cursor-pointer"
                    >
                      -10 Dispute Penalty
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleToggleVerify(selectedStudent.id, selectedStudent.isVerified)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                      selectedStudent.isVerified
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-[#10B981] text-white hover:bg-[#059669]'
                    }`}
                  >
                    {selectedStudent.isVerified ? 'Revoke Verification' : '✓ Mark Student Verified'}
                  </button>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="px-5 py-2.5 rounded-xl bg-[#E8602C] text-white text-xs font-bold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              VIEW 1: TRANSACTION MONITORING
          ══════════════════════════════════════════════════ */}
          {(activeNav === 'TRANSACTIONS' || activeNav === 'DASHBOARD') && (
            <div className="space-y-6">
              {/* Header Title + 2 Metric Cards */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-extrabold text-2xl theme-title">
                    Transaction Monitoring
                  </h1>
                  <p className="text-xs theme-muted">
                    Real-time overview of marketplace exchanges, OTP handovers, and campus activity.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="theme-card px-4 py-2.5 rounded-2xl text-center shadow-xs">
                    <span className="text-[10px] font-mono theme-muted uppercase tracking-wider block">TOTAL VOLUME (24H)</span>
                    <span className="font-heading font-extrabold text-xl text-[#2D6A4F] dark:text-[#34D399]">₹{totalVolume.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="theme-card px-4 py-2.5 rounded-2xl text-center shadow-xs">
                    <span className="text-[10px] font-mono theme-muted uppercase tracking-wider block">ACTIVE EXCHANGES</span>
                    <span className="font-heading font-extrabold text-xl text-[#E8602C]">{activeExchanges}</span>
                  </div>
                </div>
              </div>

              {/* Grid: Transactions Table (Left) + Action Required & Campus Activity (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 8 Cols: Recent Transactions Table */}
                <div className="lg:col-span-8 theme-card rounded-3xl p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-2">
                      <span>📑</span>
                      <h3 className="font-heading font-bold text-sm theme-title">Recent Transactions</h3>
                    </div>
                    <span className="text-[11px] font-bold text-[#E8602C] cursor-pointer hover:underline">View All</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="theme-muted uppercase tracking-wider border-b" style={{ borderColor: 'var(--border-color)' }}>
                          <th className="pb-2.5 font-bold">Item</th>
                          <th className="pb-2.5 font-bold">Buyer &amp; Seller</th>
                          <th className="pb-2.5 font-bold">Price</th>
                          <th className="pb-2.5 font-bold">Status</th>
                          <th className="pb-2.5 font-bold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y theme-title" style={{ borderColor: 'var(--border-color)' }}>
                        {filteredTransactions.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center theme-muted">
                              No transactions found.
                            </td>
                          </tr>
                        ) : (
                          filteredTransactions.slice(0, 8).map((tx) => (
                            <tr key={tx.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#1A1F36] transition-colors">
                              <td className="py-3 font-semibold flex items-center gap-2">
                                <span>📖</span>
                                <span className="line-clamp-1">{tx.item}</span>
                              </td>
                              <td className="py-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-6 h-6 rounded-full bg-[#1A1A2E] text-white flex items-center justify-center font-bold text-[10px]">
                                    {tx.buyer.initials}
                                  </span>
                                  <span className="text-xs theme-muted">→</span>
                                  <span className="w-6 h-6 rounded-full bg-[#E8602C] text-white flex items-center justify-center font-bold text-[10px]">
                                    {tx.seller.initials}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 font-bold text-[#2D6A4F] dark:text-[#34D399]">
                                {tx.price ? `₹${tx.price}` : 'Swap / Free'}
                              </td>
                              <td className="py-3">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  tx.status === 'COMPLETED' ? 'badge-green' :
                                  tx.status === 'OTP_GENERATED' ? 'badge-orange' : 'badge-neutral'
                                }`}>
                                  {tx.status?.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <Link
                                  href={`/transactions/${tx.id}`}
                                  className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#1A1F36] border text-[11px] font-bold hover:border-[#E8602C] transition-colors"
                                  style={{ borderColor: 'var(--border-color)' }}
                                >
                                  Inspect →
                                </Link>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right 4 Cols: Action Required & Campus Activity */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Action Required Box */}
                  <div className="rounded-3xl border border-[#FECACA] bg-[#FEF2F2] dark:bg-[#2A1414] dark:border-[#5A2020] p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-[#DC2626]">
                      <div className="flex items-center gap-1.5">
                        <span>⚠️</span>
                        <span>Action Required</span>
                      </div>
                      <span className="text-[10px] opacity-75">2m ago</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-white dark:bg-[#1A1F36] border border-[#FECACA] dark:border-[#5A2020] space-y-1.5 text-xs">
                      <span className="font-bold text-[#DC2626] block">OTP Mismatch Flagged</span>
                      <p className="theme-title text-[11px]">
                        <strong>Casio Calculator · ₹650</strong><br />
                        Buyer reported single-digit mismatch during Hostel 10 handover.
                      </p>
                      <button
                        onClick={() => setActiveNav('DISPUTES')}
                        className="text-xs font-bold text-[#E8602C] hover:underline block pt-1 cursor-pointer"
                      >
                        Resolve Dispute →
                      </button>
                    </div>
                  </div>

                  {/* Campus Activity Map Mini Card */}
                  <div className="theme-card rounded-3xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold theme-title">
                      <span>📍</span>
                      <span>Campus Activity Heatmap</span>
                    </div>

                    <div className="h-28 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-[#EFECE6] dark:from-[#1A1F36] dark:to-[#0F1322] border flex items-center justify-center text-center p-3" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="space-y-1">
                        <span className="text-2xl block">🗺️</span>
                        <span className="text-[11px] font-semibold theme-title block">Peak Location: North Campus</span>
                        <span className="text-[10px] theme-muted block">Block B · 38 Deals Today</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Community Trust Health Card */}
              <div className="theme-card rounded-3xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold theme-title">
                    <span>🛡️</span>
                    <span>Community Trust Health</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="theme-title">Excellent (90-100)</span>
                        <span className="text-[#10B981] font-bold">65%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#FAF8F5] dark:bg-[#1A1F36] overflow-hidden">
                        <div className="h-full bg-[#10B981] w-[65%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="theme-title">Good (70-89)</span>
                        <span className="text-[#2563EB] font-bold">25%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#FAF8F5] dark:bg-[#1A1F36] overflow-hidden">
                        <div className="h-full bg-[#2563EB] w-[25%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="theme-title">At Risk (&lt;70)</span>
                        <span className="text-[#EF4444] font-bold">10%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#FAF8F5] dark:bg-[#1A1F36] overflow-hidden">
                        <div className="h-full bg-[#EF4444] w-[10%]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-6 border-l pl-0 md:pl-6 space-y-3" style={{ borderColor: 'var(--border-color)' }}>
                  <p className="text-xs theme-muted leading-relaxed">
                    The overall trust score remains highly stable across hostel blocks. We observed a minor dip in Block C related to late handovers.
                  </p>
                  <button
                    onClick={() => setActiveNav('TRUST')}
                    className="px-4 py-2 rounded-xl theme-card-alt border text-xs font-bold theme-title hover:border-[#E8602C] transition-colors cursor-pointer"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    View Trust Analytics &amp; User Adjuster →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              VIEW 2: FEEDBACK, DISPUTES & TRUST ADJUSTER
          ══════════════════════════════════════════════════ */}
          {(activeNav === 'DISPUTES' || activeNav === 'TRUST') && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-heading font-extrabold text-2xl theme-title">
                    Feedback &amp; Community Trust
                  </h1>
                  <p className="text-xs theme-muted">
                    Manage disputes, review feedback, and adjust campus trust scores.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FEF3EC] dark:bg-[#2E180E] text-[#E8602C] text-xs font-bold border border-[#FCD8C5]">
                  <span>⚠️</span>
                  <span>{disputes.length || 2} Pending Reports</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Reports Queue (Left 8 Cols) */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {['All Reports', 'Scam/Fraud', 'Misleading Info', 'Behavior'].map((f, i) => (
                      <button
                        key={f}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          i === 0 ? 'bg-[#E8602C] text-white shadow-xs' : 'theme-card border theme-title'
                        }`}
                        style={{ borderColor: 'var(--border-color)' }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  {/* Sample Report Cards */}
                  <div className="theme-card rounded-3xl p-5 space-y-3 shadow-xs border-l-4 border-l-[#EF4444]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-[#1A1A2E] text-white flex items-center justify-center text-xs font-bold">
                          AJ
                        </span>
                        <div>
                          <h4 className="font-heading font-bold text-xs theme-title">Reported by Alex Johnson</h4>
                          <span className="text-[10px] theme-muted">Today at 10:42 AM</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#DC2626]">
                        High Priority - Scam
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl theme-card-alt text-xs theme-title space-y-1">
                      <span className="font-bold block text-[11px] theme-muted">Target: Casio 991EX (Listing #4920)</span>
                      <p className="italic">"Seller asked for payment outside the platform via crypto before allowing a viewing. When I refused, they cancelled the deal."</p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button className="px-4 py-2 rounded-xl bg-[#E8602C] text-white text-xs font-bold hover:bg-[#CF4F20] transition-colors cursor-pointer">
                        Review Case
                      </button>
                      <button className="px-3 py-2 rounded-xl theme-card-alt text-xs font-semibold theme-muted hover:text-red-500 transition-colors cursor-pointer">
                        Dismiss
                      </button>
                    </div>
                  </div>

                  <div className="theme-card rounded-3xl p-5 space-y-3 shadow-xs border-l-4 border-l-[#F59E0B]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold">
                          SC
                        </span>
                        <div>
                          <h4 className="font-heading font-bold text-xs theme-title">Reported by Sarah Chen</h4>
                          <span className="text-[10px] theme-muted">Yesterday</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#D97706]">
                        Misleading Info
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl theme-card-alt text-xs theme-title space-y-1">
                      <span className="font-bold block text-[11px] theme-muted">Target: User @mike_hostel12</span>
                      <p className="italic">"Photos show a brand new textbook, but the actual book had torn pages and heavy highlighter marks."</p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button className="px-4 py-2 rounded-xl bg-[#E8602C] text-white text-xs font-bold hover:bg-[#CF4F20] transition-colors cursor-pointer">
                        Review Case
                      </button>
                      <button className="px-3 py-2 rounded-xl theme-card-alt text-xs font-semibold theme-muted hover:text-red-500 transition-colors cursor-pointer">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right 4 Cols: Quick Trust Score Adjuster */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="theme-card rounded-3xl p-6 space-y-4 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-bold theme-title">
                      <span>🛡️</span>
                      <span>Quick Action: Trust Score</span>
                    </div>
                    <p className="text-[11px] theme-muted">
                      Manually adjust a user's trust score based on dispute investigation outcomes.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold theme-muted uppercase tracking-wider block mb-1">
                          User ID or Email
                        </label>
                        <input
                          type="text"
                          value={adjustUserId}
                          onChange={e => setAdjustUserId(e.target.value)}
                          placeholder="e.g. usr_94827 or student@univ.edu"
                          className="w-full px-3 py-2 rounded-xl theme-input text-xs focus:outline-none focus:border-[#E8602C]"
                        />
                      </div>

                      <div className="p-3 rounded-2xl theme-card-alt flex items-center justify-between">
                        <span className="text-xs font-semibold theme-muted">Current Score:</span>
                        <span className="font-heading font-extrabold text-xl text-[#2D6A4F] dark:text-[#34D399]">
                          {currentScoreDisplay}/100
                        </span>
                      </div>

                      {adjustSuccessMsg && (
                        <div className="p-2 rounded-xl bg-[#ECFDF5] text-xs text-[#2D6A4F] font-bold">
                          ✓ {adjustSuccessMsg}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => handleAdjustTrust(-5)}
                          disabled={trustAdjusting}
                          className="py-2.5 rounded-xl bg-[#FEE2E2] text-[#DC2626] font-bold text-xs hover:bg-[#FECACA] transition-colors cursor-pointer"
                        >
                          ↓ Penalize (-5)
                        </button>
                        <button
                          onClick={() => handleAdjustTrust(+5)}
                          disabled={trustAdjusting}
                          className="py-2.5 rounded-xl bg-[#ECFDF5] text-[#2D6A4F] font-bold text-xs hover:bg-[#D1FAE5] transition-colors cursor-pointer"
                        >
                          ↑ Restore (+5)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}
