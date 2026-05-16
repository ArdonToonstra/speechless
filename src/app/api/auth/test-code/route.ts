import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { verification } from '@/db/schema'
import { eq, desc, like } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  // Only allow in non-production environments
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter required' },
      { status: 400 }
    )
  }

  try {
    // Better Auth stores OTPs with identifier `${type}-otp-${email}`,
    // e.g. "email-verification-otp-user@example.com".
    // The value field is stored as `${otp}:${attemptCount}`, e.g. "123456:0".
    const codes = await db
      .select()
      .from(verification)
      .where(like(verification.identifier, `%-otp-${email}`))
      .orderBy(desc(verification.createdAt))
      .limit(1)

    if (codes.length === 0) {
      return NextResponse.json(
        { error: 'No verification code found for this email' },
        { status: 404 }
      )
    }

    const record = codes[0]
    const isExpired = record.expiresAt && new Date(record.expiresAt) < new Date()

    // Extract the plain OTP by splitting off the trailing :attemptCount
    const lastColon = record.value.lastIndexOf(':')
    const otp = lastColon !== -1 ? record.value.slice(0, lastColon) : record.value

    return NextResponse.json({
      email,
      code: otp,
      expiresAt: record.expiresAt,
      isExpired,
    })
  } catch (error) {
    console.error('Error fetching verification code:', error)
    return NextResponse.json(
      { error: 'Failed to fetch verification code' },
      { status: 500 }
    )
  }
}