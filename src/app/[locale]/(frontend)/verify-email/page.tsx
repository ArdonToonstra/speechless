'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { verifyEmail, sendVerificationOtp } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'

function VerifyEmailContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get('email')
    const invite = searchParams.get('invite')
    const t = useTranslations('auth.verifyEmail')
    const tCommon = useTranslations('common')

    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [resendLoading, setResendLoading] = useState(false)
    const [resendSuccess, setResendSuccess] = useState(false)
    const [fetchingCode, setFetchingCode] = useState(false)
    const isDev = process.env.NODE_ENV !== 'production'

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const result = await verifyEmail({
                email: email || '',
                otp: code,
            })

            if (result.error) {
                setError(result.error.message || t('errorVerification'))
            } else {
                router.push(invite ? `/invite/${invite}` : '/dashboard')
            }
        } catch (err) {
            setError(t('errorOccurred'))
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        setResendLoading(true)
        setResendSuccess(false)
        setError(null)

        try {
            const result = await sendVerificationOtp({
                email: email || '',
                type: 'email-verification',
            })

            if (result.error) {
                setError(result.error.message || t('errorResend'))
            } else {
                setResendSuccess(true)
            }
        } catch (err) {
            setError(t('errorResend'))
        } finally {
            setResendLoading(false)
        }
    }

    const handleGetCode = async () => {
        setFetchingCode(true)
        setError(null)

        try {
            const response = await fetch(`/api/auth/test-code?email=${encodeURIComponent(email || '')}`)
            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Failed to fetch code')
            } else if (data.isExpired) {
                setError(t('errorCodeExpired'))
            } else {
                setCode(data.code)
            }
        } catch (err) {
            setError('Failed to fetch code. Please try again.')
        } finally {
            setFetchingCode(false)
        }
    }

    if (!email) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>{t('invalidTitle')}</CardTitle>
                        <CardDescription>{t('invalidDescription')}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                    <CardDescription>
                        {t('description', { email })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleVerify} className="space-y-4">
                        <div>
                            <Input
                                type="text"
                                placeholder={t('codePlaceholder')}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                className="text-center text-2xl tracking-widest"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                                {error}
                            </div>
                        )}

                        {resendSuccess && (
                            <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                                {t('resendSuccess')}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || code.length !== 6}
                        >
                            {loading ? t('submitLoading') : t('submit')}
                        </Button>

                        {isDev && (
                            <Button
                                type="button"
                                onClick={handleGetCode}
                                disabled={fetchingCode}
                                variant="outline"
                                className="w-full"
                            >
                                {fetchingCode ? t('devGetCodeLoading') : t('devGetCode')}
                            </Button>
                        )}

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendLoading}
                                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            >
                                {resendLoading ? t('resendLoading') : t('resend')}
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6">Loading...</CardContent>
                </Card>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    )
}
