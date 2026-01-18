import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { verification } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

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
    // Get the most recent verification code for this email
    const codes = await db
      .select()
      .from(verification)
      .where(eq(verification.identifier, email))
      .orderBy(desc(verification.createdAt))
      .limit(1)

    if (codes.length === 0) {
      return NextResponse.json(
        { error: 'No verification code found for this email' },
        { status: 404 }
      )
    }

    const code = codes[0]
    const isExpired = code.expiresAt && new Date(code.expiresAt) < new Date()

    return NextResponse.json({
      email,
      code: code.value,
      expiresAt: code.expiresAt,
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