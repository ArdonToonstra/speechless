'use client'

import React, { useState, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/lib/auth-client'
import { Link, useRouter } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

function LoginContent() {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const resetSuccess = searchParams.get('reset') === 'success'
    const invite = searchParams.get('invite')
    const redirect = searchParams.get('redirect')
    const t = useTranslations('auth.login')
    const tCommon = useTranslations('common')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const result = await signIn.email({ email, password })

        if (result.error) {
            setError(result.error.message || 'Invalid email or password')
            setLoading(false)
        } else {
            router.push(redirect || (invite ? `/invite/${invite}` : '/dashboard'))
            router.refresh()
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-foreground mb-2">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">{t('emailLabel')}</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder={t('emailPlaceholder')}
                            className="bg-background"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">{t('passwordLabel')}</Label>
                            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                                {t('forgotPassword')}
                            </Link>
                        </div>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="bg-background"
                        />
                    </div>

                    {resetSuccess && (
                        <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
                            {t('resetSuccess')}
                        </div>
                    )}

                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full rounded-full" disabled={loading}>
                        {loading ? t('submitLoading') : t('submit')}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    {t('noAccount')}{' '}
                    <Link href="/signup" className="text-primary hover:underline font-medium">
                        {t('signUp')}
                    </Link>
                </div>
            </div>

            <Link href="/" className="mt-8 text-sm text-muted-foreground hover:text-foreground">
                {tCommon('backToHome')}
            </Link>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-8">
                    <div className="text-center">Loading...</div>
                </div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}
