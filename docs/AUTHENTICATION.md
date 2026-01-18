# Authentication & Security Implementation

This document describes the complete authentication and security implementation for Speechless, including email verification, password reset, and email change flows.

## Overview

The application uses **Better Auth v1.4.13** with the `emailOTP` plugin for comprehensive authentication features:

- ✅ Email/password authentication
- ✅ Email verification with 6-digit OTP codes
- ✅ Password reset flow
- ✅ Email change functionality
- ✅ Mailjet integration for email delivery
- ✅ Dev mode with test endpoints

## Architecture

### Core Files

- **[src/lib/auth.ts](../src/lib/auth.ts)** - Server-side Better Auth configuration
- **[src/lib/auth-client.ts](../src/lib/auth-client.ts)** - Client-side auth methods
- **[src/lib/email.ts](../src/lib/email.ts)** - Email service with Mailjet integration

### Configuration

#### Better Auth Setup

```typescript
// src/lib/auth.ts
export const auth = betterAuth({
  database: drizzleAdapter(db, {...}),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ to: user.email, resetUrl: url })
    },
  },
  plugins: [
    emailOTP({
      sendVerificationOTP: async ({ email, otp }) => {...},
      sendVerificationOnSignUp: true,
      otpLength: 6,
      expiresIn: 30 * 60, // 30 minutes
    }),
  ],
})
```

#### Email Service

Emails are sent via **Mailjet API** from `noreply@detoast.nl`:

- **Dev Mode**: If API keys are missing, emails are logged to console instead of sent
- **Production**: Emails are sent via Mailjet API
- **OTP Codes**: 6-digit codes, 30-minute expiry
- **HTML Templates**: Styled email templates with responsive design

### Environment Variables

Required environment variables:

```env
MAILJET_API_KEY=your_api_key
MAILJET_SECRET_KEY=your_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## User Flows

### 1. Signup & Email Verification

**Flow:**
1. User signs up at `/signup`
2. Account created but not verified (`emailVerified: false`)
3. Verification email sent with 6-digit OTP
4. User redirected to `/verify-email?email=user@example.com`
5. User enters OTP code
6. Account verified and user redirected to `/dashboard`

**Pages:**
- [src/app/(frontend)/signup/page.tsx](../src/app/(frontend)/signup/page.tsx)
- [src/app/(frontend)/verify-email/page.tsx](../src/app/(frontend)/verify-email/page.tsx)

**Features:**
- Resend code functionality
- Code auto-formats (numbers only, max 6 digits)
- Success/error messages
- Email display for clarity

### 2. Password Reset

**Flow:**
1. User clicks "Forgot password?" on login page
2. Navigates to `/forgot-password`
3. Enters email address
4. Reset email sent with secure token link
5. User clicks link in email → redirected to `/reset-password?token=xxx`
6. Enters new password (min 8 characters)
7. Password updated, redirected to `/login?reset=success`

**Pages:**
- [src/app/(frontend)/forgot-password/page.tsx](../src/app/(frontend)/forgot-password/page.tsx)
- [src/app/(frontend)/reset-password/page.tsx](../src/app/(frontend)/reset-password/page.tsx)

**Security:**
- Tokens expire after 1 hour
- Password confirmation required
- Minimum 8 characters enforced
- Success message on login page

### 3. Email Change

**Flow:**
1. User navigates to `/settings/change-email`
2. Enters new email address
3. Verification code sent to new email
4. User enters 6-digit OTP
5. Email updated, success confirmation shown

**Pages:**
- [src/app/(frontend)/settings/change-email/page.tsx](../src/app/(frontend)/settings/change-email/page.tsx)

**Features:**
- Two-step verification (request → verify)
- Verification emails sent to both old and new addresses
- Cancel option during verification

### 4. Login

**Pages:**
- [src/app/(frontend)/login/page.tsx](../src/app/(frontend)/login/page.tsx)

**Features:**
- Email/password authentication
- "Forgot password?" link
- Password reset success message
- Link to signup page

## Development Tools

### Test Endpoint

**Purpose:** Retrieve verification codes without checking email during development.

**Endpoint:** `GET /api/auth/test-code?email=user@example.com`

**Example Response:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "expiresAt": "2026-01-18T15:30:00.000Z",
  "isExpired": false
}
```

**Restrictions:**
- Only available when `NODE_ENV !== 'production'`
- Returns 403 in production
- Requires email query parameter

**Implementation:** [src/app/api/auth/test-code/route.ts](../src/app/api/auth/test-code/route.ts)

### Dev Mode Email Logging

When Mailjet credentials are not configured (or in dev mode), emails are logged to console:

```
[EMAIL] Dev mode - Skipping email send to: user@example.com Code: 123456
[EMAIL] Dev mode - Skipping password reset email to: user@example.com URL: http://...
```

This allows development and testing without needing email infrastructure.

## Database Schema

### Verification Table

```typescript
export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(), // email address
  value: text('value').notNull(), // OTP code
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
```

### User Table

```typescript
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  // ... other fields
})
```

## Email Templates

### Verification Email

**Subject:** Your Verification Code

**Content:**
- Welcome message
- 6-digit code (large, prominent)
- 30-minute expiry notice

### Password Reset Email

**Subject:** Reset Your Password

**Content:**
- Clear CTA button with reset link
- 1-hour expiry notice
- Security notice (ignore if not requested)

### Email Change Verification

**Subject:** Verify Your New Email Address / Email Change Request

**Content:**
- Context (new email vs. notification)
- 6-digit verification code
- 30-minute expiry
- Security warning for old email

## Security Features

1. **Email Verification Required:** Users must verify email before accessing protected routes
2. **Password Requirements:** Minimum 8 characters
3. **Token Expiry:** 
   - OTP codes: 30 minutes
   - Password reset links: 1 hour
4. **Session Management:**
   - 7-day session expiry
   - 24-hour session update age
   - 5-minute cookie cache
5. **Rate Limiting:** Built into Better Auth
6. **CSRF Protection:** Better Auth handles this automatically
7. **Secure Cookies:** httpOnly, secure in production

## Testing

### Manual Testing

1. **Signup Flow:**
   ```
   1. Go to /signup
   2. Enter details and submit
   3. Check console for OTP (dev mode) or use test endpoint
   4. Go to /verify-email?email=your@email.com
   5. Enter code
   6. Should redirect to /dashboard
   ```

2. **Password Reset:**
   ```
   1. Go to /login
   2. Click "Forgot password?"
   3. Enter email
   4. Check console/test endpoint for reset link
   5. Visit reset link
   6. Enter new password
   7. Should redirect to login with success message
   ```

3. **Test Endpoint Usage:**
   ```bash
   # After signup, get verification code
   curl http://localhost:3000/api/auth/test-code?email=test@example.com
   
   # Response will include the OTP code
   ```

### Automated Testing

Consider adding Playwright tests for:
- Complete signup → verification → login flow
- Password reset flow
- Email change flow
- Error handling (invalid codes, expired tokens)

## Troubleshooting

### Email Not Sending (Production)

1. Check Mailjet credentials in environment variables
2. Verify domain `detoast.nl` is validated in Mailjet dashboard
3. Check Mailjet API logs for delivery status
4. Ensure `noreply@detoast.nl` is authorized sender

### Verification Code Not Working

1. Check if code has expired (30 minutes)
2. Verify email address matches exactly
3. Use test endpoint to see actual code in database
4. Check for multiple codes (only most recent is valid)

### Session Not Persisting

1. Check `NEXT_PUBLIC_APP_URL` matches current domain
2. Verify cookies are enabled in browser
3. Check for CORS issues in browser console
4. Ensure database connection is working

## Future Enhancements

- [ ] **OAuth Providers** - Add Google authentication
- [ ] **2FA** - Two-factor authentication option
- [ ] **Email Templates** - Enhanced branded templates
- [ ] **Rate Limiting** - Custom rate limits per endpoint
- [ ] **Admin Panel** - Manage users and sessions
- [ ] **Audit Log** - Track authentication events
- [ ] **Account Lockout** - After failed login attempts
- [ ] **Magic Links** - Passwordless authentication option

## API Reference

### Client Methods

```typescript
import { 
  signIn, 
  signUp, 
  signOut, 
  useSession,
  verifyEmail,
  sendVerificationOtp,
  forgetPassword,
  resetPassword,
} from '@/lib/auth-client'

// Sign up new user
await signUp.email({ name, email, password })

// Sign in
await signIn.email({ email, password })

// Verify email with OTP
await verifyEmail({ email, otp })

// Resend verification code
await sendVerificationOtp({ email, type: 'email-verification' })

// Request password reset
await forgetPassword({ email })

// Reset password with token
await resetPassword({ newPassword, token })

// Sign out
await signOut()

// Get session (React hook)
const { data: session } = useSession()
```

## References

- [Better Auth Documentation](https://better-auth.com)
- [Mailjet API Documentation](https://dev.mailjet.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
