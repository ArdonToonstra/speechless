'use client'

import React, { useState } from 'react'
import { Wizard } from '@/components/ui/wizard'
import { createProject } from '@/actions/projects'
import { useRouter } from 'next/navigation'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SPEECH_TYPES = [
    { id: 'wedding', label: 'Wedding', description: 'Best Man, Maid of Honor, Parent...' },
    { id: 'birthday', label: 'Birthday', description: 'Celebrating a milestone...' },
    { id: 'funeral', label: 'Funeral', description: 'Honoring a life...' },
    { id: 'other', label: 'Other', description: 'General speech...' },
]

export default function OnboardingPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        type: '',
        date: undefined as Date | undefined,
        title: '',
        speechReceiverName: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const updateField = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        const res = await createProject({
            title: formData.title,
            speechReceiverName: formData.speechReceiverName,
            type: formData.type,
            date: formData.date?.toISOString() || new Date().toISOString(),
        })

        if (res.success) {
            router.push('/dashboard')
        } else {
            console.error(res.error)
            alert("Failed to create project") // Simple error handling for MVP
            setIsSubmitting(false)
        }
    }

    const steps = [
        {
            title: "What's the Occasion?",
            description: "Select the type of event you are writing for.",
            isValid: !!formData.type,
            content: (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    {SPEECH_TYPES.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => updateField('type', type.id)}
                            className={`p-6 rounded-2xl border-2 text-left transition-all ${formData.type === type.id
                                ? 'border-primary bg-primary/5 shadow-md'
                                : 'border-border/30 hover:border-border'
                                }`}
                        >
                            <h3 className="font-semibold text-lg text-foreground">{type.label}</h3>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                        </button>
                    ))}
                </div>
            ),
        },
        {
            title: "When is the Big Day?",
            description: "We'll help you track your progress.",
            isValid: !!formData.date,
            content: (
                <div className="flex justify-center mt-8">
                    <div className="p-4 bg-muted/10 rounded-2xl border border-border/30">
                        <Calendar
                            mode="single"
                            selected={formData.date}
                            onSelect={(date) => updateField('date', date)}
                            className="rounded-md border bg-card text-foreground"
                        />
                    </div>
                </div>
            ),
        },
        {
            title: "Name Your Speech",
            description: "Give it a memorable title.",
            isValid: formData.title.length > 2,
            content: (
                <div className="mt-12 max-w-md mx-auto">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-foreground">Project Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. My Best Man Speech"
                            value={formData.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            className="text-lg py-6 bg-card border-border"
                        />
                        <p className="text-xs text-muted-foreground">At least 3 characters.</p>
                    </div>
                </div>
            ),
        },
        {
            title: "Who's Receiving the Speech?",
            description: "This helps personalize the questionnaire.",
            isValid: formData.speechReceiverName.length > 1,
            content: (
                <div className="mt-12 max-w-md mx-auto">
                    <div className="space-y-2">
                        <Label htmlFor="speechReceiverName" className="text-foreground">Speech Receiver Name</Label>
                        <Input
                            id="speechReceiverName"
                            placeholder="e.g. Sarah, John and Mary"
                            value={formData.speechReceiverName}
                            onChange={(e) => updateField('speechReceiverName', e.target.value)}
                            className="text-lg py-6 bg-card border-border"
                        />
                        <p className="text-xs text-muted-foreground">
                            This will be used in default questions like "Share your best anecdotes about {formData.speechReceiverName || 'them'}"
                        </p>
                    </div>
                </div>
            ),
        },
    ]

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Let&apos;s Get Started</h1>
                    <p className="text-muted-foreground">Create your first speech project in 4 simple steps.</p>
                </div>
                <Wizard steps={steps} onComplete={handleSubmit} isSubmitting={isSubmitting} />
            </div>
        </div>
    )
}
