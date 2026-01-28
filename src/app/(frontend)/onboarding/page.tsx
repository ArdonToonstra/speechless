'use client'

import React, { useState } from 'react'
import { Wizard } from '@/components/ui/wizard'
import { createProject } from '@/actions/projects'
import { useRouter } from 'next/navigation'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SPEECH_TYPE_OPTIONS = [
    {
        id: 'gift',
        label: 'Speech as a Gift',
        description: 'You are organizing the event or surprise for someone.',
        image: '/images/branding/toast-as-present-logo.webp'
    },
    {
        id: 'occasion',
        label: 'Speech for the Occasion',
        description: 'The location/time is set by someone else.',
        image: '/images/branding/toast-at-the-occasion-logo.webp'
    },
]

const OCCASION_TYPES = [
    { id: 'wedding', label: 'Wedding', description: 'Best Man, Maid of Honor, Parent...' },
    { id: 'birthday', label: 'Birthday', description: 'Celebrating a milestone...' },
    { id: 'funeral', label: 'Funeral', description: 'Honoring a life...' },
    { id: 'retirement', label: 'Retirement', description: 'Celebrating a career...' },
    { id: 'roast', label: 'Roast', description: 'Humorous tribute...' },
    { id: 'surprise', label: 'Surprise', description: 'An unexpected moment...' },
    { id: 'other', label: 'Other', description: 'Describe your occasion...' },
]

const DATE_OPTIONS = [
    { id: 'specific', label: 'Specific Date', description: 'I know when it is' },
    { id: 'unknown', label: 'Not Yet Known', description: 'I will decide later (date picker available)' },
]

export default function OnboardingPage() {
    const router = useRouter()
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
            alert("Something went wrong while creating your project")
            setIsSubmitting(false)
        }
    }

    // Step 1: Speech Type Selection
    const speechTypeStep = {
        title: "What Type of Speech?",
        description: "This helps us ask the right questions.",
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
        title: "What's the Occasion?",
        description: "Select the type of event.",
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
                        <Label htmlFor="customOccasion" className="text-foreground">Describe your occasion</Label>
                        <Input
                            id="customOccasion"
                            placeholder="e.g. Anniversary, Farewell, Graduation..."
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
        title: "When is the Big Day?",
        description: "We'll help you track your progress.",
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
        title: "Tell Us More",
        description: "This information is used for invitations and questions.",
        isValid: formData.title.length > 2 && formData.honoree.length > 1,
        content: (
            <div className="mt-8 max-w-md mx-auto space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-foreground">Speech Title</Label>
                    <Input
                        id="title"
                        placeholder="e.g. My Speech for John"
                        value={formData.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        className="text-lg py-6 bg-card border-border"
                    />
                    <p className="text-xs text-muted-foreground">At least 3 characters.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="honoree" className="text-foreground">Who is the speech for?</Label>
                    <Input
                        id="honoree"
                        placeholder="e.g. John, John and Mary"
                        value={formData.honoree}
                        onChange={(e) => updateField('honoree', e.target.value)}
                        className="text-lg py-6 bg-card border-border"
                    />
                    <p className="text-xs text-muted-foreground">
                        This will be used in questions like &quot;Share your best anecdote about {formData.honoree || 'them'}&quot;
                    </p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="eventContext" className="text-foreground">Additional Context (optional)</Label>
                    <Input
                        id="eventContext"
                        placeholder="e.g. 25th wedding anniversary, 50th birthday..."
                        value={formData.eventContext}
                        onChange={(e) => updateField('eventContext', e.target.value)}
                        className="text-lg py-6 bg-card border-border"
                    />
                    <p className="text-xs text-muted-foreground">Helps personalize invitations.</p>
                </div>
            </div>
        ),
    }

    // Step 5: Logistics (Gift flow only)
    const logisticsStep = {
        title: "Location & Guests",
        description: "Optional: helps filter location suggestions.",
        isValid: true, // Always valid since fields are optional
        content: (
            <div className="mt-8 max-w-md mx-auto space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="city" className="text-foreground">City or Location (optional)</Label>
                    <Input
                        id="city"
                        placeholder="e.g. Amsterdam, New York..."
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        className="text-lg py-6 bg-card border-border"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="guestCount" className="text-foreground">Number of Guests (optional)</Label>
                    <Input
                        id="guestCount"
                        type="number"
                        placeholder="e.g. 50"
                        value={formData.guestCount}
                        onChange={(e) => updateField('guestCount', e.target.value)}
                        className="text-lg py-6 bg-card border-border"
                    />
                    <p className="text-xs text-muted-foreground">Estimated number of attendees.</p>
                </div>
            </div>
        ),
    }

    // Build steps dynamically based on speech type
    const buildSteps = () => {
        const steps = [speechTypeStep, occasionStep, dateStep, contextStep]

        // Add logistics step only for "gift" speech type
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
                    <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Let&apos;s Get Started</h1>
                    {formData.speechType && (
                        <p className="text-muted-foreground">Create your speech project in {stepCount} simple steps.</p>
                    )}
                </div>
                <Wizard steps={steps} onComplete={handleSubmit} isSubmitting={isSubmitting} />
            </div>
        </div>
    )
}
