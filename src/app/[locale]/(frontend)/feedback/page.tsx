'use client'

import React, { useState } from 'react'
import { Wizard } from '@/components/ui/wizard'
import { submitFeedback } from '@/actions/feedback'
import { useRouter } from '@/i18n/navigation'
import { Textarea } from '@/components/ui/textarea'
import { useTranslations } from 'next-intl'

export default function FeedbackPage() {
    const router = useRouter()
    const t = useTranslations('feedback')
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const update = (key: string, value: string) =>
        setAnswers((prev) => ({ ...prev, [key]: value }))

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            await submitFeedback(answers)
            router.push('/dashboard')
        } catch {
            alert(t('errorSubmitting'))
            setIsSubmitting(false)
        }
    }

    const LIKELIHOOD_OPTIONS = [
        { id: 'very-likely', label: t('likelihoodVeryLikely'), description: t('likelihoodVeryLikelyDesc') },
        { id: 'somewhat-likely', label: t('likelihoodSomewhatLikely'), description: t('likelihoodSomewhatLikelyDesc') },
        { id: 'not-sure', label: t('likelihoodNotSure'), description: t('likelihoodNotSureDesc') },
        { id: 'unlikely', label: t('likelihoodUnlikely'), description: t('likelihoodUnlikelyDesc') },
    ]

    const PAY_OPTIONS = [
        { id: 'free-only', label: t('payFreeOnly'), description: t('payFreeOnlyDesc') },
        { id: '5-month', label: t('pay5'), description: t('pay5Desc') },
        { id: '10-month', label: t('pay10'), description: t('pay10Desc') },
        { id: '15-plus', label: t('pay15plus'), description: t('pay15plusDesc') },
    ]

    const steps = [
        {
            title: t('step1Title'),
            description: t('step1Description'),
            isValid: true,
            content: (
                <div className="flex flex-col items-center justify-center gap-6 mt-8 text-center px-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/branding/base-logo.webp"
                        alt="Toast"
                        className="h-28 w-auto object-contain opacity-90"
                    />
                    <p className="text-slate-600 text-base leading-relaxed max-w-md">
                        {t('step1Body')}
                    </p>
                    <p className="text-slate-400 text-sm">{t('step1Questions')}</p>
                </div>
            ),
        },
        {
            title: t('step2Title'),
            description: t('step2Description'),
            isValid: (answers.impression ?? '').trim().length > 0,
            content: (
                <div className="mt-6">
                    <Textarea
                        placeholder={t('step2Placeholder')}
                        className="min-h-[140px] resize-none rounded-2xl border-border/40 focus:border-primary"
                        value={answers.impression ?? ''}
                        onChange={(e) => update('impression', e.target.value)}
                        autoFocus
                    />
                </div>
            ),
        },
        {
            title: t('step3Title'),
            description: t('step3Description'),
            isValid: !!answers.likelihood,
            content: (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {LIKELIHOOD_OPTIONS.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => update('likelihood', opt.id)}
                            className={`p-5 rounded-2xl border-2 text-left transition-all ${
                                answers.likelihood === opt.id
                                    ? 'border-primary bg-primary/5 shadow-md'
                                    : 'border-border/30 hover:border-border hover:shadow-sm'
                            }`}
                        >
                            <p className="font-semibold text-foreground">{opt.label}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">{opt.description}</p>
                        </button>
                    ))}
                </div>
            ),
        },
        {
            title: t('step4Title'),
            description: t('step4Description'),
            isValid: !!answers.willingness,
            content: (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {PAY_OPTIONS.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => update('willingness', opt.id)}
                            className={`p-5 rounded-2xl border-2 text-left transition-all ${
                                answers.willingness === opt.id
                                    ? 'border-primary bg-primary/5 shadow-md'
                                    : 'border-border/30 hover:border-border hover:shadow-sm'
                            }`}
                        >
                            <p className="font-semibold text-foreground">{opt.label}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">{opt.description}</p>
                        </button>
                    ))}
                </div>
            ),
        },
        {
            title: t('step5Title'),
            description: t('step5Description'),
            isValid: true,
            content: (
                <div className="mt-6">
                    <Textarea
                        placeholder={t('step5Placeholder')}
                        className="min-h-[140px] resize-none rounded-2xl border-border/40 focus:border-primary"
                        value={answers.feature ?? ''}
                        onChange={(e) => update('feature', e.target.value)}
                        autoFocus
                    />
                </div>
            ),
        },
    ]

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <Wizard
                steps={steps}
                onComplete={handleSubmit}
                isSubmitting={isSubmitting}
                completedLabel={t('submitLabel')}
            />
        </div>
    )
}
