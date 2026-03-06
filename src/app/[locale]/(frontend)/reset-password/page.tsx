'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { resetPassword } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'next-intl'

function ResetPasswordContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const t = useTranslations('auth.resetPassword')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError(t('mismatch'))
            return
        }

        if (password.length < 8) {
            setError(t('tooShort'))
            return
        }

        if (!token) {
            setError(t('invalidToken'))
            return
        }

        setLoading(true)

        try {
            const result = await resetPassword({ newPassword: password, token })

            if (result.error) {
                setError(result.error.message || t('errorFailed'))
            } else {
                router.push('/login?reset=success')
            }
        } catch (err) {
            setError(t('errorOccurred'))
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>{t('invalidLinkTitle')}</CardTitle>
                        <CardDescription>{t('invalidLinkDescription')}</CardDescription>
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
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">{t('newPasswordLabel')}</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={t('newPasswordPlaceholder')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">{t('confirmPasswordLabel')}</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder={t('confirmPasswordPlaceholder')}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
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

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6">Loading...</CardContent>
                </Card>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    )
}
