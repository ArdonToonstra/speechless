import { betterAuth } from 'better-auth'
import { emailOTP } from 'better-auth/plugins'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import * as schema from '@/db/schema'
import { sendVerificationEmail, sendPasswordResetEmail, sendEmailChangeVerification } from '@/lib/email'

// Both must point at the real deployed origin (e.g. https://detoast.nl) in production.
// Without baseURL, Better Auth can't reliably determine it behind Vercel's proxy.
// Without the origin in trustedOrigins, Better Auth rejects sign-in/sign-up requests
// from that origin outright — which is what was causing login to hang with no error.
const appUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

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
  trustedOrigins: [appUrl],
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