'use client'

import React, { useState } from 'react'
import { Wizard } from '@/components/ui/wizard'
import { submitFeedback } from '@/actions/feedback'
import { useRouter } from '@/i18n/navigation'
import { Textarea } from '@/components/ui/textarea'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

// ponytail: open questions are all the same shape, so they come from one list
const OPEN_QUESTIONS = [
    { key: 'impression', required: true },
    { key: 'best', required: false },
    { key: 'stuck', required: false },
    { key: 'missing', required: false },
    { key: 'pay', required: true },
] as const

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
            toast.error(t('errorSubmitting'))
            setIsSubmitting(false)
        }
    }


    const steps = [
        {
            title: t('introTitle'),
            description: t('introDescription'),
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
                        {t('introBody')}
                    </p>
                    <p className="text-slate-400 text-sm">{t('introQuestions')}</p>
                </div>
            ),
        },
        ...OPEN_QUESTIONS.map(({ key, required }) => ({
            title: t(`${key}Title`),
            description: t(`${key}Description`),
            isValid: !required || (answers[key] ?? '').trim().length > 0,
            content: (
                <div className="mt-6">
                    <Textarea
                        placeholder={t(`${key}Placeholder`)}
                        className="min-h-[140px] resize-none rounded-2xl border-border/40 focus:border-primary"
                        value={answers[key] ?? ''}
                        onChange={(e) => update(key, e.target.value)}
                        autoFocus
                    />
                </div>
            ),
        })),
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
