import bcrypt from 'bcryptjs'
import { randomInt } from 'crypto'

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10)
const MAX_OTP_GENERATIONS = 3

/**
 * Generate a 6-digit OTP, hash it, and return the plaintext for one-time delivery.
 * NEVER store or log the plaintext code anywhere else.
 */
export async function generateOTP(): Promise<{ plaintext: string; hash: string; expiresAt: Date }> {
  const plaintext = randomInt(100000, 999999).toString()
  const hash = await bcrypt.hash(plaintext, 10)
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)
  return { plaintext, hash, expiresAt }
}

/**
 * Verify a submitted OTP against the stored hash with all security checks.
 */
export async function verifyOTP(
  submittedCode: string,
  storedHash: string | null,
  expiresAt: Date | null,
  otpUsed: boolean,
  otpGenerationCount: number
): Promise<{ valid: boolean; error?: string }> {
  if (!storedHash || !expiresAt) {
    return { valid: false, error: 'No OTP generated for this transaction.' }
  }
  if (otpUsed) {
    return { valid: false, error: 'This OTP has already been used.' }
  }
  if (new Date() > expiresAt) {
    return { valid: false, error: 'OTP has expired. Ask the seller to generate a new one.' }
  }
  const match = await bcrypt.compare(submittedCode, storedHash)
  if (!match) {
    return { valid: false, error: 'Incorrect OTP. Please try again.' }
  }
  return { valid: true }
}

/**
 * Check if a new OTP can be generated (rate limit: max 3 per transaction).
 */
export function canGenerateOTP(count: number): boolean {
  return count < MAX_OTP_GENERATIONS
}

export function getOTPRateLimitError(): string {
  return `Maximum OTP generations reached (${MAX_OTP_GENERATIONS}). Please contact support if you need assistance.`
}

/**
 * Mock email OTP sender — logs to console in dev, swapped for real provider via EMAIL_PROVIDER env.
 */
export function sendOTPEmail(email: string, otp: string, transactionId: string): void {
  const provider = process.env.EMAIL_PROVIDER || 'mock'
  if (provider === 'mock') {
    console.log(`\n📧 [MOCK EMAIL] OTP for transaction ${transactionId}`)
    console.log(`   To: ${email}`)
    console.log(`   OTP: ${otp}`)
    console.log(`   Expires in: ${process.env.OTP_EXPIRY_MINUTES || 10} minutes\n`)
    return
  }
  // TODO: plug in real provider (SendGrid, SES, etc.) via EMAIL_PROVIDER env
  throw new Error(`Email provider "${provider}" not implemented yet.`)
}
