'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/lib/auth-client'
import { Link, useRouter } from '@/i18n/navigation'
import { Check, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

function validatePasswordStrength(password: string) {
    return {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
    }
}

function PasswordRequirements({ password, t }: { password: string; t: ReturnType<typeof useTranslations> }) {
    const validation = validatePasswordStrength(password)

    const requirements = [
        { label: t('passwordReqLength'), met: validation.minLength },
        { label: t('passwordReqUppercase'), met: validation.hasUppercase },
        { label: t('passwordReqNumber'), met: validation.hasNumber },
    ]

    return (
        <div className="text-xs space-y-1 mt-2">
            {requirements.map((req, i) => (
                <div key={i} className={`flex items-center gap-1.5 ${req.met ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {req.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {req.label}
                </div>
            ))}
        </div>
    )
}

export default function SignupPage() {
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [password, setPassword] = useState('')
    const loadedAt = useRef(Date.now())
    const router = useRouter()
    const t = useTranslations('auth.signup')
    const tCommon = useTranslations('common')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const name = formData.get('name') as string
        const email = formData.get('email') as string
        const confirmPassword = formData.get('confirmPassword') as string

        // Honeypot: bot filled the hidden field
        const website = formData.get('website') as string
        if (website) {
            setLoading(false)
            return
        }
        // Timing: form submitted too fast to be human (< 1500ms)
        if (Date.now() - loadedAt.current < 1500) {
            setLoading(false)
            return
        }

        const validation = validatePasswordStrength(password)
        if (!validation.minLength || !validation.hasUppercase || !validation.hasNumber) {
            setError(t('passwordStrengthError'))
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError(t('passwordsMismatch'))
            setLoading(false)
            return
        }

        const result = await signUp.email({ name, email, password })

        if (result.error) {
            setError(result.error.message || 'Failed to create account')
            setLoading(false)
        } else {
            router.push(`/verify-email?email=${encodeURIComponent(email)}`)
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
                        <Label htmlFor="name">{t('nameLabel')}</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            placeholder={t('namePlaceholder')}
                            className="bg-background"
                        />
                    </div>
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
                        <Label htmlFor="password">{t('passwordLabel')}</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder={t('passwordPlaceholder')}
                            className="bg-background"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <PasswordRequirements password={password} t={t} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t('confirmPasswordLabel')}</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            placeholder={t('confirmPasswordPlaceholder')}
                            className="bg-background"
                        />
                    </div>

                    {/* Honeypot — positioned off-screen, invisible to real users */}
                    <div
                        aria-hidden="true"
                        style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
                    >
                        <label htmlFor="website">Website</label>
                        <input
                            id="website"
                            type="text"
                            name="website"
                            defaultValue=""
                            autoComplete="off"
                            tabIndex={-1}
                        />
                    </div>

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
                    {t('hasAccount')}{' '}
                    <Link href="/login" className="text-primary hover:underline font-medium">
                        {t('logIn')}
                    </Link>
                </div>
            </div>

            <Link href="/" className="mt-8 text-sm text-muted-foreground hover:text-foreground">
                {tCommon('backToHome')}
            </Link>
        </div>
    )
}
