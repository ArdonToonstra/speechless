'use client'

import { useState } from 'react'
import { authClient, verifyEmail } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

export default function ChangeEmailPage() {
    const [step, setStep] = useState<'request' | 'verify'>('request')
    const [newEmail, setNewEmail] = useState('')
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const t = useTranslations('auth.changeEmail')

    const handleRequestChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const result = await authClient.changeEmail({ newEmail })
            if (result.error) {
                setError(result.error.message || t('errorFailed'))
            } else {
                setStep('verify')
            }
        } catch (err) {
            setError(t('errorOccurred'))
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const result = await verifyEmail({ email: newEmail, otp: code })
            if (result.error) {
                setError(result.error.message || t('errorVerification'))
            } else {
                setSuccess(true)
            }
        } catch (err) {
            setError(t('errorOccurred'))
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>{t('successTitle')}</CardTitle>
                        <CardDescription>
                            {t('successDescription', { email: newEmail })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/settings">
                            <Button className="w-full">
                                {t('backToSettings')}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (step === 'verify') {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>{t('verifyTitle')}</CardTitle>
                        <CardDescription>
                            {t('verifyDescription', { email: newEmail })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleVerifyChange} className="space-y-4">
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

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading || code.length !== 6}
                            >
                                {loading ? t('verifyLoading') : t('verifySubmit')}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => setStep('request')}
                            >
                                {t('cancel')}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRequestChange} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newEmail">{t('newEmailLabel')}</Label>
                            <Input
                                id="newEmail"
                                type="email"
                                placeholder={t('newEmailPlaceholder')}
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? t('submitLoading') : t('submit')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
