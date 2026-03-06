import Mailjet from 'node-mailjet'

// Check if valid API keys exist
const hasValidKeys = process.env.MAILJET_API_KEY &&
    process.env.MAILJET_SECRET_KEY &&
    process.env.MAILJET_API_KEY.length > 10 &&
    process.env.MAILJET_SECRET_KEY.length > 10

// Only initialize Mailjet if we have valid keys
const mailjet = hasValidKeys
    ? Mailjet.apiConnect(
        process.env.MAILJET_API_KEY!,
        process.env.MAILJET_SECRET_KEY!
    )
    : null

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://detoast.nl'
const LOGO_URL = `${APP_URL}/images/branding/base-logo.png`

function emailLayout(content: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#ece9dc;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ece9dc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <img src="${LOGO_URL}" alt="Toast" width="80" height="80" style="display:block;" />
              <div style="font-size:22px;font-weight:bold;color:#166162;letter-spacing:1px;margin-top:8px;">Toast</div>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background-color:#F6F5EF;border-radius:12px;padding:36px 40px;border:1px solid #d9d6c8;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;font-size:12px;color:#93895E;">
              © Toast · <a href="${APP_URL}" style="color:#93895E;text-decoration:none;">detoast.nl</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function emailButton(href: string, label: string) {
    return `<a href="${href}" style="display:inline-block;background-color:#166162;color:#F6F5EF;padding:12px 28px;text-decoration:none;border-radius:8px;font-family:Georgia,serif;font-size:15px;">${label}</a>`
}

type SendVerificationEmailProps = {
    to: string
    code: string
}

export async function sendVerificationEmail({ to, code }: SendVerificationEmailProps) {
    // Skip sending in dev/test mode if API keys are not properly configured
    if (process.env.NODE_ENV !== 'production' && !hasValidKeys) {
        console.log('[EMAIL] Dev mode - Skipping email send to:', to, 'Code:', code)
        return { success: true, devMode: true }
    }

    if (!mailjet) {
        throw new Error('Email service not configured - missing API keys')
    }

    console.log('[EMAIL] Sending verification email to:', to)
    try {
        const request = mailjet.post('send', { version: 'v3.1' }).request({
            Messages: [
                {
                    From: {
                        Email: 'noreply@detoast.nl',
                        Name: 'Toast',
                    },
                    To: [
                        {
                            Email: to,
                        },
                    ],
                    Subject: 'Your Verification Code',
                    TextPart: `Your verification code is: ${code}. It expires in 30 minutes.`,
                    HTMLPart: emailLayout(`
                      <h2 style="margin:0 0 8px;font-size:20px;color:#166162;">Verify your email</h2>
                      <p style="margin:0 0 24px;color:#3a3a2e;font-size:15px;line-height:1.6;">Welcome to Toast! Use the code below to verify your email address. It expires in 30 minutes.</p>
                      <div style="text-align:center;margin:28px 0;">
                        <span style="display:inline-block;font-size:32px;letter-spacing:10px;font-weight:bold;color:#166162;background:#ece9dc;padding:16px 28px;border-radius:8px;">${code}</span>
                      </div>
                      <p style="margin:0;font-size:13px;color:#93895E;">If you didn't create a Toast account, you can safely ignore this email.</p>
                    `),
                },
            ],
        })

        const result = await request
        return result.body
    } catch (error) {
        console.error('Error sending email:', error)
        throw new Error('Failed to send verification email')
    }
}

type SendPasswordResetEmailProps = {
    to: string
    resetUrl: string
}

export async function sendPasswordResetEmail({ to, resetUrl }: SendPasswordResetEmailProps) {
    // Skip sending in dev/test mode if API keys are not properly configured
    if (process.env.NODE_ENV !== 'production' && !hasValidKeys) {
        console.log('[EMAIL] Dev mode - Skipping password reset email to:', to, 'URL:', resetUrl)
        return { success: true, devMode: true }
    }

    if (!mailjet) {
        throw new Error('Email service not configured - missing API keys')
    }

    console.log('[EMAIL] Sending password reset email to:', to)
    try {
        const request = mailjet.post('send', { version: 'v3.1' }).request({
            Messages: [
                {
                    From: {
                        Email: 'noreply@detoast.nl',
                        Name: 'Toast',
                    },
                    To: [
                        {
                            Email: to,
                        },
                    ],
                    Subject: 'Reset Your Password',
                    TextPart: `You requested a password reset for your Toast account. Click this link to reset your password: ${resetUrl}. This link expires in 1 hour. If you didn't request this, you can safely ignore this email.`,
                    HTMLPart: emailLayout(`
                      <h2 style="margin:0 0 8px;font-size:20px;color:#166162;">Reset your password</h2>
                      <p style="margin:0 0 28px;color:#3a3a2e;font-size:15px;line-height:1.6;">We received a request to reset your password. Click the button below — the link expires in 1 hour.</p>
                      <div style="text-align:center;margin:28px 0;">
                        ${emailButton(resetUrl, 'Reset Password')}
                      </div>
                      <p style="margin:0;font-size:13px;color:#93895E;">If you didn't request a password reset, you can safely ignore this email.</p>
                    `),
                },
            ],
        })

        const result = await request
        return result.body
    } catch (error) {
        console.error('Error sending password reset email:', error)
        throw new Error('Failed to send password reset email')
    }
}

type SendDeletionWarningEmailProps = {
    to: string
    name: string
}

export async function sendDeletionWarningEmail({ to, name }: SendDeletionWarningEmailProps) {
    if (process.env.NODE_ENV !== 'production' && !hasValidKeys) {
        console.log('[EMAIL] Dev mode - Skipping deletion warning email to:', to)
        return { success: true, devMode: true }
    }

    if (!mailjet) {
        throw new Error('Email service not configured - missing API keys')
    }

    console.log('[EMAIL] Sending deletion warning email to:', to)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://detoast.nl'
    try {
        const request = mailjet.post('send', { version: 'v3.1' }).request({
            Messages: [
                {
                    From: {
                        Email: 'noreply@detoast.nl',
                        Name: 'Toast',
                    },
                    To: [{ Email: to }],
                    Subject: 'Your Toast account will be deleted soon',
                    TextPart: `Hi ${name},\n\nYour Toast account has been inactive for 5 months. If we don't see you log in within the next month, your account and all associated data will be permanently deleted.\n\nTo keep your account, simply log in at ${appUrl}/login.\n\nIf you no longer need your account, no action is required.\n\nThe Toast Team`,
                    HTMLPart: emailLayout(`
                      <h2 style="margin:0 0 8px;font-size:20px;color:#166162;">Your account will be deleted soon</h2>
                      <p style="margin:0 0 16px;color:#3a3a2e;font-size:15px;line-height:1.6;">Hi ${name},</p>
                      <p style="margin:0 0 28px;color:#3a3a2e;font-size:15px;line-height:1.6;">Your Toast account has been inactive for <strong>5 months</strong>. If we don't see you log in within the next month, your account and all associated data will be <strong>permanently deleted</strong>.</p>
                      <div style="text-align:center;margin:28px 0;">
                        ${emailButton(`${appUrl}/login`, 'Log in to keep my account')}
                      </div>
                      <p style="margin:0;font-size:13px;color:#93895E;">If you no longer need your account, no action is required — it will be automatically removed after 6 months of inactivity.</p>
                    `),
                },
            ],
        })
        const result = await request
        return result.body
    } catch (error) {
        console.error('Error sending deletion warning email:', error)
        throw new Error('Failed to send deletion warning email')
    }
}

type SendEmailChangeVerificationProps = {
    to: string
    code: string
    isNewEmail: boolean
}

export async function sendEmailChangeVerification({ to, code, isNewEmail }: SendEmailChangeVerificationProps) {
    // Skip sending in dev/test mode if API keys are not properly configured
    if (process.env.NODE_ENV !== 'production' && !hasValidKeys) {
        console.log('[EMAIL] Dev mode - Skipping email change verification to:', to, 'Code:', code)
        return { success: true, devMode: true }
    }

    if (!mailjet) {
        throw new Error('Email service not configured - missing API keys')
    }

    console.log('[EMAIL] Sending email change verification to:', to)
    try {
        const subject = isNewEmail ? 'Verify Your New Email Address' : 'Email Change Request'
        const heading = isNewEmail ? 'Verify Your New Email Address' : 'Email Change Request'
        const description = isNewEmail
            ? 'Please verify this email address to complete the change.'
            : 'Someone requested to change the email address for your Toast account.'

        const request = mailjet.post('send', { version: 'v3.1' }).request({
            Messages: [
                {
                    From: {
                        Email: 'noreply@detoast.nl',
                        Name: 'Toast',
                    },
                    To: [
                        {
                            Email: to,
                        },
                    ],
                    Subject: subject,
                    TextPart: `${description} Your verification code is: ${code}. It expires in 30 minutes.`,
                    HTMLPart: emailLayout(`
                      <h2 style="margin:0 0 8px;font-size:20px;color:#166162;">${heading}</h2>
                      <p style="margin:0 0 24px;color:#3a3a2e;font-size:15px;line-height:1.6;">${description}</p>
                      <div style="text-align:center;margin:28px 0;">
                        <span style="display:inline-block;font-size:32px;letter-spacing:10px;font-weight:bold;color:#166162;background:#ece9dc;padding:16px 28px;border-radius:8px;">${code}</span>
                      </div>
                      <p style="margin:0;font-size:13px;color:#93895E;">${!isNewEmail ? "If you didn't request this change, please secure your account immediately." : 'This code will expire in 30 minutes.'}</p>
                    `),
                },
            ],
        })

        const result = await request
        return result.body
    } catch (error) {
        console.error('Error sending email change verification:', error)
        throw new Error('Failed to send email change verification')
    }
}