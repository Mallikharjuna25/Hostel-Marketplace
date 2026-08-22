import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const COOKIE_NAME = 'hm_session'

export interface JWTPayload {
  userId: string
  email: string
  role: 'STUDENT' | 'ADMIN'
  isVerified: boolean
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function requireAuth(): Promise<JWTPayload> {
  const session = await getSession()
  if (!session) {
    throw new Error('UNAUTHORIZED')
  }
  return session
}

export async function requireAdmin(): Promise<JWTPayload> {
  const session = await requireAuth()
  if (session.role !== 'ADMIN') {
    throw new Error('FORBIDDEN')
  }
  return session
}

export function getSessionFromRequest(request: Request): JWTPayload | null {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
  if (!match) return null
  return verifyToken(match[1])
}

export function setSessionCookie(token: string): { name: string; value: string; options: object } {
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    },
  }
}

export function clearSessionCookie(): { name: string; value: string; options: object } {
  return {
    name: COOKIE_NAME,
    value: '',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    },
  }
}

export const COOKIE_NAME_EXPORT = COOKIE_NAME

// Serializes a user for public profile responses — NEVER includes private fields
export function serializePublicProfile(user: {
  id: string
  email: string
  isVerified: boolean
  role: string
  profile: {
    fullName: string
    college: string
    department: string
    course: string
    year: number
    semester: number
    hostel: string
    block: string
    photoUrl: string | null
    bio: string | null
    publicFields: unknown
    // room intentionally excluded
  } | null
  trustScore: { score: number } | null
}) {
  return {
    id: user.id,
    email: user.email,
    isVerified: user.isVerified,
    role: user.role,
    profile: user.profile
      ? {
          fullName: user.profile.fullName,
          college: user.profile.college,
          department: user.profile.department,
          course: user.profile.course,
          year: user.profile.year,
          semester: user.profile.semester,
          hostel: user.profile.hostel,
          block: user.profile.block,
          // room is intentionally EXCLUDED
          photoUrl: user.profile.photoUrl,
          bio: user.profile.bio,
          publicFields: user.profile.publicFields,
        }
      : null,
    trustScore: user.trustScore?.score ?? 50,
  }
}
