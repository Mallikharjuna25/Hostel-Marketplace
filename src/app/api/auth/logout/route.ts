import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ success: true, message: 'Logged out successfully' })
  res.cookies.set('token', '', { httpOnly: true, maxAge: 0, expires: new Date(0), path: '/' })
  res.cookies.set('hm_session', '', { httpOnly: true, maxAge: 0, expires: new Date(0), path: '/' })
  res.cookies.delete('token')
  res.cookies.delete('hm_session')
  return res
}

export async function GET() {
  return POST()
}
