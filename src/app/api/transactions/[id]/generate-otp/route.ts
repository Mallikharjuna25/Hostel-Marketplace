import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongoose'
import { Transaction } from '@/lib/models'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'hostel-marketplace-secret'

function getUser(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value || req.cookies.get('hm_session')?.value
    if (!token) return null
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
  } catch { return null }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    await connectDB()
    const { id } = await params

    const tx = await Transaction.findById(id)
    if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    if (tx.sellerId.toString() !== user.userId) return NextResponse.json({ error: 'Only seller can generate OTP' }, { status: 403 })
    if (tx.status !== 'HANDOVER_PENDING') return NextResponse.json({ error: 'Transaction not in handover state' }, { status: 400 })
    if (tx.otpGenerationCount >= 3) return NextResponse.json({ error: 'Maximum OTP generations reached' }, { status: 429 })

    // Generate 6-digit OTP
    const otpCode = String(Math.floor(100000 + Math.random() * 900000))
    const otpHash = await bcrypt.hash(otpCode, 10)
    const expiry = new Date(Date.now() + 10 * 60 * 1000)

    tx.otpCodeHash = otpHash
    tx.otpExpiry = expiry
    tx.otpUsed = false
    tx.otpGenerationCount += 1
    tx.status = 'OTP_GENERATED'
    await tx.save()

    // In production, email the OTP to buyer. For demo, return it.
    console.log(`[OTP GENERATED] Transaction ${id}: ${otpCode} (demo mode)`)

    return NextResponse.json({
      message: 'OTP generated. Share it with the buyer after inspection.',
      otp: otpCode,
      otpCode, // only for hackathon demo
      expiresAt: expiry,
      generationsUsed: tx.otpGenerationCount,
    })
  } catch (err) {
    console.error('[generate-otp]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
