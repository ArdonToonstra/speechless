'use client'

import { useState } from 'react'
import { forgetPassword } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Link } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const t = useTranslations('auth.forgotPassword')
    const locale = useLocale()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const redirectTo = `${window.location.origin}/${locale}/reset-password`
            const result = await forgetPassword({ email, redirectTo })
            if (result.error) {
                setError(result.error.message || t('errorFailed'))
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
                        <CardTitle>{t('checkEmailTitle')}</CardTitle>
                        <CardDescription>
                            {t('checkEmailDescription', { email })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                {t('checkEmailBody')}
                            </p>
                            <Link href="/login">
                                <Button variant="outline" className="w-full">
                                    {t('backToLogin')}
                                </Button>
                            </Link>
                        </div>
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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('emailLabel')}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t('emailPlaceholder')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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

                        <div className="text-center">
                            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800">
                                {t('backToLogin')}
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
