'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { CampusAntiFraudAgreement } from '@/components/legal/CampusAntiFraudAgreement'

export default function RegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [policyAgreed, setPolicyAgreed] = useState(false)

  // Step 1 State: Account
  const [step1, setStep1] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })

  // Step 2 State: Identity
  const [step2, setStep2] = useState({
    fullName: '',
    college: 'IIT Bombay',
    studentId: '',
    department: 'Computer Science',
    course: 'B.Tech CSE',
    year: '3',
    semester: '5',
    hostel: 'Hostel 10',
    block: 'Block B',
    room: 'B-204',
  })

  // Step 3 State: Academic
  const [step3, setStep3] = useState({
    cgpa: '8.5',
    currentSemester: '5',
    subjects: 'Data Structures, Operating Systems, Database Management',
    achievements: 'Hackathon Finalist, Dean\'s List',
  })

  // Step 4 State: Non-Academic Skills
  const [step4, setStep4] = useState({
    techSkills: 'React, Python, SQL',
    languages: 'English, Hindi',
    interests: 'Robotics, Competitive Programming',
  })

  // Step 5 State: OTP
  const [otp, setOtp] = useState('')

  // ─── Step 1 Handler ────────────────────────────────────────────────────────
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register/step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(step1),
      })
      const data = await res.json()

      if (res.ok) {
        setDraftId(data.draftId)
        setCurrentStep(2)
      } else {
        setError(data.error || 'Validation failed')
      }
    } catch {
      setError('Failed to submit step 1.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Step 2 Handler ────────────────────────────────────────────────────────
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register/step2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId,
          ...step2,
          year: parseInt(step2.year),
          semester: parseInt(step2.semester),
        }),
      })
      const data = await res.json()

      if (res.ok) {
        setCurrentStep(3)
      } else {
        setError(data.error || 'Validation failed')
      }
    } catch {
      setError('Failed to submit step 2.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Step 3 Handler ────────────────────────────────────────────────────────
  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register/step3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId,
          cgpa: step3.cgpa ? parseFloat(step3.cgpa) : undefined,
          currentSemester: parseInt(step3.currentSemester),
          subjects: step3.subjects.split(',').map(s => s.trim()).filter(Boolean),
          achievements: step3.achievements.split(',').map(s => s.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()

      if (res.ok) {
        setCurrentStep(4)
      } else {
        setError(data.error || 'Validation failed')
      }
    } catch {
      setError('Failed to submit step 3.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Step 4 Handler ────────────────────────────────────────────────────────
  const handleStep4 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formattedSkills: Array<{ type: string; name: string }> = []
    step4.techSkills.split(',').forEach(s => s.trim() && formattedSkills.push({ type: 'TECH', name: s.trim() }))
    step4.languages.split(',').forEach(s => s.trim() && formattedSkills.push({ type: 'LANGUAGE', name: s.trim() }))
    step4.interests.split(',').forEach(s => s.trim() && formattedSkills.push({ type: 'INTEREST', name: s.trim() }))

    try {
      const res = await fetch('/api/auth/register/step4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId,
          skills: formattedSkills,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        setCurrentStep(5)
      } else {
        setError(data.error || 'Validation failed')
      }
    } catch {
      setError('Failed to submit step 4.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Resend OTP Handler ───────────────────────────────────────────────────
  const handleResendOtp = async () => {
    setError(null)
    setResending(true)
    setResendSuccess(false)

    try {
      const res = await fetch('/api/auth/register/step4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        setResendSuccess(true)
        setTimeout(() => setResendSuccess(false), 4000)
      } else {
        setError(data.error || 'Failed to resend verification code')
      }
    } catch {
      setError('Failed to resend code.')
    } finally {
      setResending(false)
    }
  }

  // ─── Step 5 Verify Handler ──────────────────────────────────────────────────
  const handleStep5 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId,
          otp: otp.trim(),
        }),
      })
      const data = await res.json()

      if (res.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        setError(data.error || 'Invalid OTP code. Please enter the code sent to your email.')
      }
    } catch {
      setError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 max-w-xl mx-auto px-4 py-12 w-full" style={{ paddingTop: '80px' }}>
        <div className="theme-card rounded-3xl p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold text-[#E8602C] uppercase tracking-wider">
              Student Registration
            </span>
            <h1 className="font-heading font-extrabold text-2xl theme-title">
              {currentStep === 1 && 'Step 1: Account Credentials'}
              {currentStep === 2 && 'Step 2: Campus & Hostel Identity'}
              {currentStep === 3 && 'Step 3: Academic Profile'}
              {currentStep === 4 && 'Step 4: Skills & Interests'}
              {currentStep === 5 && 'Step 5: Student Email OTP'}
            </h1>
            <p className="text-xs theme-muted">
              Step {currentStep} of 5 · Keep your hostel network safe and verified.
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-colors ${
                  s <= currentStep ? 'bg-[#E8602C]' : 'bg-[#272E49]'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] dark:bg-[#2A1414] border border-[#FECACA] dark:border-[#5A2020] text-xs text-[#DC2626]">
              {error}
            </div>
          )}

          {/* ─── STEP 1 FORM ─────────────────────────────────────────────── */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                  Email Address (Gmail & College Emails Supported):
                </label>
                <input
                  type="email"
                  value={step1.email}
                  onChange={(e) => setStep1({ ...step1, email: e.target.value })}
                  placeholder="e.g. yourname@gmail.com or student@college.ac.in"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                    Password:
                  </label>
                  <input
                    type="password"
                    value={step1.password}
                    onChange={(e) => setStep1({ ...step1, password: e.target.value })}
                    placeholder="Min 8 characters"
                    minLength={8}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                    Confirm Password:
                  </label>
                  <input
                    type="password"
                    value={step1.confirmPassword}
                    onChange={(e) => setStep1({ ...step1, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    minLength={8}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                  Mobile Number (Private by default):
                </label>
                <input
                  type="tel"
                  value={step1.phone}
                  onChange={(e) => setStep1({ ...step1, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                  pattern="[6-9][0-9]{9}"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                />
              </div>

              {/* Campus Anti-Fraud & Compensation Policy */}
              <CampusAntiFraudAgreement
                checked={policyAgreed}
                onChange={setPolicyAgreed}
                label="I agree to the Campus Code of Conduct and acknowledge that false products or fraud lead to immediate fines and mandatory buyer compensation."
              />

              <button
                type="submit"
                disabled={loading || !policyAgreed}
                className="w-full py-3 rounded-xl bg-[#E8602C] text-white font-heading font-bold text-sm hover:bg-[#CF4F20] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Saving...' : 'Next: Identity →'}
              </button>
            </form>
          )}

          {/* ─── STEP 2 FORM ─────────────────────────────────────────────── */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">Full Name:</label>
                <input
                  type="text"
                  value={step2.fullName}
                  onChange={(e) => setStep2({ ...step2, fullName: e.target.value })}
                  placeholder="e.g. Vikram Verma"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">College / University:</label>
                  <input
                    type="text"
                    value={step2.college}
                    onChange={(e) => setStep2({ ...step2, college: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">Student ID / Roll No:</label>
                  <input
                    type="text"
                    value={step2.studentId}
                    onChange={(e) => setStep2({ ...step2, studentId: e.target.value })}
                    placeholder="e.g. 2022CSB104"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">Department:</label>
                  <input
                    type="text"
                    value={step2.department}
                    onChange={(e) => setStep2({ ...step2, department: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">Course:</label>
                  <input
                    type="text"
                    value={step2.course}
                    onChange={(e) => setStep2({ ...step2, course: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">Hostel Name:</label>
                  <input
                    type="text"
                    value={step2.hostel}
                    onChange={(e) => setStep2({ ...step2, hostel: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">Block:</label>
                  <input
                    type="text"
                    value={step2.block}
                    onChange={(e) => setStep2({ ...step2, block: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">Room (Private):</label>
                  <input
                    type="text"
                    value={step2.room}
                    onChange={(e) => setStep2({ ...step2, room: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-[#E5E2DD] text-xs font-semibold"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#E8602C] text-white font-heading font-bold text-xs hover:bg-[#CF4F20]"
                >
                  {loading ? 'Saving...' : 'Next: Academic Profile →'}
                </button>
              </div>
            </form>
          )}

          {/* ─── STEP 3 FORM ─────────────────────────────────────────────── */}
          {currentStep === 3 && (
            <form onSubmit={handleStep3} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">CGPA / % (Optional):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={step3.cgpa}
                    onChange={(e) => setStep3({ ...step3, cgpa: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">Current Semester:</label>
                  <input
                    type="number"
                    value={step3.currentSemester}
                    onChange={(e) => setStep3({ ...step3, currentSemester: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                  Current Coursework / Subjects (comma-separated):
                </label>
                <textarea
                  value={step3.subjects}
                  onChange={(e) => setStep3({ ...step3, subjects: e.target.value })}
                  placeholder="e.g. Thermodynamics, Algorithms, Signals & Systems"
                  rows={2}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                />
                <span className="text-[10px] text-[#6B7280]">Used by AI to match free book donations and study partner requests.</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                  Key Achievements / Projects (Optional):
                </label>
                <input
                  type="text"
                  value={step3.achievements}
                  onChange={(e) => setStep3({ ...step3, achievements: e.target.value })}
                  placeholder="e.g. Hackathon Winner, Club Lead"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-[#E5E2DD] text-xs font-semibold"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#E8602C] text-white font-heading font-bold text-xs hover:bg-[#CF4F20]"
                >
                  {loading ? 'Saving...' : 'Next: Skills →'}
                </button>
              </div>
            </form>
          )}

          {/* ─── STEP 4 FORM ─────────────────────────────────────────────── */}
          {currentStep === 4 && (
            <form onSubmit={handleStep4} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                  Technical Skills (for knowledge exchange):
                </label>
                <input
                  type="text"
                  value={step4.techSkills}
                  onChange={(e) => setStep4({ ...step4, techSkills: e.target.value })}
                  placeholder="e.g. Python, CAD, Circuit Design, Excel"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                  Languages Spoken:
                </label>
                <input
                  type="text"
                  value={step4.languages}
                  onChange={(e) => setStep4({ ...step4, languages: e.target.value })}
                  placeholder="e.g. English, Hindi, Telugu, Tamil"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                  Interests & Hobbies:
                </label>
                <input
                  type="text"
                  value={step4.interests}
                  onChange={(e) => setStep4({ ...step4, interests: e.target.value })}
                  placeholder="e.g. Chess, Competitive Coding, Badminton"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs focus:outline-none focus:border-[#E8602C]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2.5 rounded-xl border border-[#E5E2DD] text-xs font-semibold"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#E8602C] text-white font-heading font-bold text-xs hover:bg-[#CF4F20]"
                >
                  {loading ? 'Sending OTP...' : 'Send Verification OTP →'}
                </button>
              </div>
            </form>
          )}

          {/* ─── STEP 5 OTP FORM ─────────────────────────────────────────── */}
          {currentStep === 5 && (
            <form onSubmit={handleStep5} className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FFF8F3] border border-[#FCD8C5] text-xs text-[#E8602C] space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <span>✉️</span> Verification Code Sent!
                </div>
                <p className="text-[11px] text-[#9C5838] leading-relaxed">
                  We sent a 6-digit one-time verification code to <strong>{step1.email}</strong>.
                  Please check your inbox (or Spam/Promotions folder).
                </p>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-[#6B7280]">Didn't receive the email?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="font-bold text-[#E8602C] hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {resending ? 'Sending...' : '↻ Resend Code'}
                  </button>
                </div>
              </div>

              {resendSuccess && (
                <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#065F46] font-semibold text-center">
                  ✓ Fresh verification code dispatched to your email!
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-[#1A1A2E] block mb-1">
                  Enter 6-Digit OTP:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="••••••"
                  required
                  className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 rounded-xl border border-[#E5E2DD] focus:outline-none focus:border-[#E8602C]"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.trim().length !== 6}
                className="w-full py-3 rounded-xl bg-[#2D6A4F] text-white font-heading font-bold text-sm hover:bg-[#23533E] transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {loading ? 'Verifying Code...' : 'Complete Verification & Enter Campus →'}
              </button>
            </form>
          )}

          <div className="border-t border-[#E5E2DD] pt-4 text-center text-xs text-[#6B7280]">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#E8602C] hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
