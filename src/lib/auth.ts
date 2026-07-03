import { betterAuth } from 'better-auth'
import { emailOTP } from 'better-auth/plugins'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import * as schema from '@/db/schema'
import { sendVerificationEmail, sendPasswordResetEmail, sendEmailChangeVerification } from '@/lib/email'

// Must point at the real deployed origin (e.g. https://www.detoast.nl) in production.
// Without baseURL, Better Auth can't reliably determine it behind Vercel's proxy.
// Without the origin in trustedOrigins, Better Auth rejects sign-in/sign-up requests
// from that origin outright — which is what was causing login to 403 with no error.
const appUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Trust both the www and bare-apex variant of the configured host. Origin headers are
// scheme+host only (no path — locale prefixes like /en//nl never factor in), so if the
// apex domain isn't redirected to www (or vice versa) at the DNS/Vercel level, whichever
// variant isn't listed here gets silently 403'd on every auth request.
function withWwwVariant(url: string): string[] {
  try {
    const parsed = new URL(url)
    const altHost = parsed.hostname.startsWith('www.')
      ? parsed.hostname.slice(4)
      : `www.${parsed.hostname}`
    const alt = `${parsed.protocol}//${altHost}${parsed.port ? `:${parsed.port}` : ''}`
    return [url, alt]
  } catch {
    return [url]
  }
}

const trustedOrigins = withWwwVariant(appUrl)

export const auth = betterAuth({
  baseURL: appUrl,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        to: user.email,
        resetUrl: url,
      })
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  trustedOrigins,
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          await db.update(schema.user)
            .set({ lastLoginAt: new Date(), deletionWarningAt: null })
            .where(eq(schema.user.id, session.userId))
        },
      },
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        await sendVerificationEmail({
          to: email,
          code: otp,
        })
      },
      sendVerificationOnSignUp: true,
      otpLength: 6,
      expiresIn: 30 * 60, // 30 minutes
    }),
  ],
})

export type Session = typeof auth.$Infer.Session