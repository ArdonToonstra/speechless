'use client'

import React, { useState } from 'react'
import { Wizard } from '@/components/ui/wizard'
import { createProject } from '@/actions/projects'
import { useRouter } from '@/i18n/navigation'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'next-intl'

export default function OnboardingPage() {
    const router = useRouter()
    const t = useTranslations('onboarding')
    const [formData, setFormData] = useState({
        speechType: '' as '' | 'gift' | 'occasion',
        occasionType: '',
        customOccasion: '',
        dateOption: '' as '' | 'specific' | 'unknown' | 'help',
        date: undefined as Date | undefined,
        title: '',
        honoree: '',
        eventContext: '',
        city: '',
        guestCount: '' as string,
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const updateField = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        const res = await createProject({
            title: formData.title,
            speechReceiverName: formData.honoree,
            occasionType: formData.occasionType,
            customOccasion: formData.occasionType === 'other' ? formData.customOccasion : undefined,
            speechType: formData.speechType as 'gift' | 'occasion',
            date: formData.date?.toISOString(),
            dateKnown: formData.dateOption === 'specific',
            honoree: formData.honoree,
            eventContext: formData.eventContext || undefined,
            city: formData.city || undefined,
            guestCount: formData.guestCount ? parseInt(formData.guestCount) : undefined,
        })

        if (res.success) {
            router.push('/dashboard')
        } else {
            console.error(res.error)
            alert(t('errorCreating'))
            setIsSubmitting(false)
        }
    }

    const SPEECH_TYPE_OPTIONS = [
        {
            id: 'gift',
            label: t('speechTypeGift'),
            description: t('speechTypeGiftDesc'),
            image: '/images/branding/toast-as-present-logo.webp'
        },
        {
            id: 'occasion',
            label: t('speechTypeOccasion'),
            description: t('speechTypeOccasionDesc'),
            image: '/images/branding/toast-at-the-occasion-logo.webp'
        },
    ]

    const OCCASION_TYPES = [
        { id: 'wedding', label: t('occasionWedding'), description: t('occasionWeddingDesc') },
        { id: 'birthday', label: t('occasionBirthday'), description: t('occasionBirthdayDesc') },
        { id: 'funeral', label: t('occasionFuneral'), description: t('occasionFuneralDesc') },
        { id: 'retirement', label: t('occasionRetirement'), description: t('occasionRetirementDesc') },
        { id: 'roast', label: t('occasionRoast'), description: t('occasionRoastDesc') },
        { id: 'surprise', label: t('occasionSurprise'), description: t('occasionSurpriseDesc') },
        { id: 'other', label: t('occasionOther'), description: t('occasionOtherDesc') },
    ]

    const DATE_OPTIONS = [
        { id: 'specific', label: t('dateSpecific'), description: t('dateSpecificDesc') },
        { id: 'unknown', label: t('dateUnknown'), description: t('dateUnknownDesc') },
    ]

    // Step 1: Speech Type Selection
    const speechTypeStep = {
        title: t('speechTypeTitle'),
        description: t('speechTypeDescription'),
        isValid: !!formData.speechType,
        content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-2xl mx-auto">
                {SPEECH_TYPE_OPTIONS.map((type) => (
                    <button
                        key={type.id}
                        onClick={() => updateField('speechType', type.id)}
                        className={`p-6 rounded-2xl border-2 text-center transition-all flex flex-col items-center ${formData.speechType === type.id
                            ? 'border-primary bg-primary/5 shadow-lg'
                            : 'border-border/30 hover:border-border hover:shadow-md'
                            }`}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={type.image}
                            alt={type.label}
                            className="h-32 w-auto object-contain mb-4"
                        />
                        <h3 className="font-semibold text-lg text-foreground">{type.label}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                    </button>
                ))}
            </div>
        ),
    }

    // Step 2: Occasion Type
    const occasionStep = {
        title: t('occasionTitle'),
        description: t('occasionDescription'),
        isValid: !!formData.occasionType && (formData.occasionType !== 'other' || formData.customOccasion.length > 2),
        content: (
            <div className="space-y-6 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {OCCASION_TYPES.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => updateField('occasionType', type.id)}
                            className={`p-6 rounded-2xl border-2 text-left transition-all ${formData.occasionType === type.id
                                ? 'border-primary bg-primary/5 shadow-md'
                                : 'border-border/30 hover:border-border'
                                }`}
                        >
                            <h3 className="font-semibold text-lg text-foreground">{type.label}</h3>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                        </button>
                    ))}
                </div>
                {formData.occasionType === 'other' && (
                    <div className="max-w-md mx-auto mt-6">
                        <Label htmlFor="customOccasion" className="text-foreground">{t('customOccasionLabel')}</Label>
                        <Input
                            id="customOccasion"
                            placeholder={t('customOccasionPlaceholder')}
                            value={formData.customOccasion}
                            onChange={(e) => updateField('customOccasion', e.target.value)}
                            className="text-lg py-6 bg-card border-border mt-2"
                        />
                    </div>
                )}
            </div>
        ),
    }

    // Step 3: Date Selection
    const dateStep = {
        title: t('dateTitle'),
        description: t('dateDescription'),
        isValid: formData.dateOption === 'unknown' || (formData.dateOption === 'specific' && !!formData.date),
        content: (
            <div className="space-y-6 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                    {DATE_OPTIONS.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => updateField('dateOption', option.id)}
                            className={`p-6 rounded-2xl border-2 text-left transition-all ${formData.dateOption === option.id
                                ? 'border-primary bg-primary/5 shadow-md'
                                : 'border-border/30 hover:border-border'
                                }`}
                        >
                            <h3 className="font-semibold text-lg text-foreground">{option.label}</h3>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                        </button>
                    ))}
                </div>
                {formData.dateOption === 'specific' && (
                    <div className="flex justify-center mt-6">
                        <div className="p-4 bg-muted/10 rounded-2xl border border-border/30">
                            <Calendar
                                mode="single"
                                selected={formData.date}
                                onSelect={(date) => updateField('date', date)}
                                className="rounded-md border bg-card text-foreground"
                            />
                        </div>
                    </div>
                )}
            </div>
        ),
    }

    // Step 4: Context (Title, Honoree, Event Context)
    const contextStep = {
        title: t('contextTitle'),
        description: t('contextDescription'),
        isValid: formData.title.length > 2 && formData.honoree.length > 1,
        content: (
            <div className="mt-8 max-w-md mx-auto space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-foreground">{t('contextSpeechTitle')}</Label>
                    <Input
                        id="title"
                        placeholder={t('contextSpeechTitlePlaceholder')}
                        value={formData.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        className="text-lg py-6 bg-card border-border"
                    />
                    <p className="text-xs text-muted-foreground">{t('contextSpeechTitleHint')}</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="honoree" className="text-foreground">{t('contextHonoree')}</Label>
                    <Input
                        id="honoree"
                        placeholder={t('contextHonoreePlaceholder')}
                        value={formData.honoree}
                        onChange={(e) => updateField('honoree', e.target.value)}
                        className="text-lg py-6 bg-card border-border"
                    />
                    <p className="text-xs text-muted-foreground">
                        {formData.honoree
                            ? t('contextHonoreeHint', { name: formData.honoree })
                            : t('contextHonoreeHintFallback')}
                    </p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="eventContext" className="text-foreground">{t('contextAdditionalContext')}</Label>
                    <Input
                        id="eventContext"
                        placeholder={t('contextAdditionalContextPlaceholder')}
                        value={formData.eventContext}
                        onChange={(e) => updateField('eventContext', e.target.value)}
                        className="text-lg py-6 bg-card border-border"
                    />
                    <p className="text-xs text-muted-foreground">{t('contextAdditionalContextHint')}</p>
                </div>
            </div>
        ),
    }

    // Step 5: Logistics (Gift flow only)
    const logisticsStep = {
        title: t('logisticsTitle'),
        description: t('logisticsDescription'),
        isValid: true,
        content: (
            <div className="mt-8 max-w-md mx-auto space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="city" className="text-foreground">{t('logisticsCity')}</Label>
                    <Input
                        id="city"
                        placeholder={t('logisticsCityPlaceholder')}
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        className="text-lg py-6 bg-card border-border"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="guestCount" className="text-foreground">{t('logisticsGuestCount')}</Label>
                    <Input
                        id="guestCount"
                        type="number"
                        placeholder={t('logisticsGuestCountPlaceholder')}
                        value={formData.guestCount}
                        onChange={(e) => updateField('guestCount', e.target.value)}
                        className="text-lg py-6 bg-card border-border"
                    />
                    <p className="text-xs text-muted-foreground">{t('logisticsGuestCountHint')}</p>
                </div>
            </div>
        ),
    }

    // Build steps dynamically based on speech type
    const buildSteps = () => {
        const steps = [speechTypeStep, occasionStep, dateStep, contextStep]
        if (formData.speechType === 'gift') {
            steps.push(logisticsStep)
        }
        return steps
    }

    const steps = buildSteps()
    const stepCount = formData.speechType === 'gift' ? 5 : 4

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-serif font-bold text-foreground mb-2">{t('heading')}</h1>
                    {formData.speechType && (
                        <p className="text-muted-foreground">{t('subheading', { steps: stepCount })}</p>
                    )}
                </div>
                <Wizard steps={steps} onComplete={handleSubmit} isSubmitting={isSubmitting} />
            </div>
        </div>
    )
}
