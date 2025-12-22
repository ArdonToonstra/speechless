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
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const updateField = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        const res = await createProject({
            title: formData.title,
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
                                ? 'border-indigo-600 bg-indigo-50 shadow-md'
                                : 'border-slate-100 hover:border-slate-300'
                                }`}
                        >
                            <h3 className="font-semibold text-lg text-slate-900">{type.label}</h3>
                            <p className="text-sm text-slate-500">{type.description}</p>
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
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <Calendar
                            mode="single"
                            selected={formData.date}
                            onSelect={(date) => updateField('date', date)}
                            className="rounded-md border bg-white"
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
                        <Label htmlFor="title" className="text-slate-700">Project Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. My Best Man Speech"
                            value={formData.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            className="text-lg py-6"
                        />
                        <p className="text-xs text-slate-400">At least 3 characters.</p>
                    </div>
                </div>
            ),
        },
    ]

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">Let&apos;s Get Started</h1>
                    <p className="text-slate-500">Create your first speech project in 3 simple steps.</p>
                </div>
                <Wizard steps={steps} onComplete={handleSubmit} isSubmitting={isSubmitting} />
            </div>
        </div>
    )
}
