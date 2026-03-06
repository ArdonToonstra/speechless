'use client'

import React, { useState } from 'react'
import { Wizard } from '@/components/ui/wizard'
import { submitFeedback } from '@/actions/feedback'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'

const LIKELIHOOD_OPTIONS = [
    { id: 'very-likely', label: 'Very likely', description: 'I already have a speech in mind' },
    { id: 'somewhat-likely', label: 'Somewhat likely', description: 'I might use it soon' },
    { id: 'not-sure', label: 'Not sure yet', description: 'Depends on the features' },
    { id: 'unlikely', label: 'Unlikely', description: 'Just checking it out' },
]

const PAY_OPTIONS = [
    { id: 'free-only', label: 'Free only', description: "I wouldn't pay for it" },
    { id: '5-month', label: '$5 / month', description: 'If it saves me real time' },
    { id: '10-month', label: '$10 / month', description: 'If it helps me write a great speech' },
    { id: '15-plus', label: '$15+ / month', description: 'If it does most of the work for me' },
]

export default function FeedbackPage() {
    const router = useRouter()
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
            alert('Something went wrong. Please try again.')
            setIsSubmitting(false)
        }
    }

    const steps = [
        {
            title: 'We would love your thoughts',
            description: 'Toast is brand new and we want to build something people actually love. This takes about 2 minutes.',
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
                        We just launched Toast — a tool to help people write better speeches together.
                        We want to know what you think, and whether this is something worth building further.
                    </p>
                    <p className="text-slate-400 text-sm">4 quick questions ↓</p>
                </div>
            ),
        },
        {
            title: 'What is your first impression?',
            description: 'Be honest — what does Toast do well, and what feels off?',
            isValid: (answers.impression ?? '').trim().length > 0,
            content: (
                <div className="mt-6">
                    <Textarea
                        placeholder="e.g. I liked the editor but wasn't sure how collaborators fit in..."
                        className="min-h-[140px] resize-none rounded-2xl border-border/40 focus:border-primary"
                        value={answers.impression ?? ''}
                        onChange={(e) => update('impression', e.target.value)}
                        autoFocus
                    />
                </div>
            ),
        },
        {
            title: 'How likely are you to use Toast?',
            description: 'For a real upcoming speech or event.',
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
            title: 'Would you pay for Toast?',
            description: 'Honest answers help us figure out if this is viable.',
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
            title: 'What would make Toast a must-have?',
            description: 'Optional — but we read every response.',
            isValid: true,
            content: (
                <div className="mt-6">
                    <Textarea
                        placeholder="e.g. AI suggestions, better mobile support, a teleprompter mode..."
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
                completedLabel="Submit Feedback"
            />
        </div>
    )
}
