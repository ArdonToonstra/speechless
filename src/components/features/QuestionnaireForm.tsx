'use client'

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle2 } from 'lucide-react'
import { submitQuestionnaire } from '@/actions/questionnaire'
import { Wizard } from '@/components/ui/wizard'

interface QuestionItem {
    text: string
    type?: string
    required?: boolean
}

interface Project {
    id: number
    questions: QuestionItem[] | null
    speechReceiverName?: string
}

interface QuestionnaireFormProps {
    project: Project
    token: string
}

export function QuestionnaireForm({ project, token }: QuestionnaireFormProps) {
    const [submitterName, setSubmitterName] = useState('')
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const updateAnswer = (index: number, value: string) => {
        setAnswers(prev => ({ ...prev, [index]: value }))
    }

    const renderQuestion = (text: string) =>
        text.replace(/{speechReceiverName}/g, project.speechReceiverName || 'them')

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const answersArray = (project.questions || []).map((q, index) => ({
                question: renderQuestion(q.text),
                answer: answers[index] || '',
            }))

            const result = await submitQuestionnaire({
                projectId: project.id,
                token,
                submitterName,
                answers: answersArray,
            })

            if (result.success) {
                setIsSubmitted(true)
            } else {
                alert('Failed to submit: ' + (result.error || 'Unknown error'))
                setIsSubmitting(false)
            }
        } catch {
            alert('An error occurred. Please try again.')
            setIsSubmitting(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="w-full max-w-2xl mx-auto p-8 rounded-3xl bg-white shadow-xl text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-serif text-slate-900 mb-2">Thank You!</h2>
                <p className="text-slate-500">Your responses have been submitted successfully.</p>
            </div>
        )
    }

    const questions = project.questions || []

    const nameStep = {
        title: 'What is your name?',
        description: 'So we know who shared these memories.',
        isValid: submitterName.trim().length >= 2,
        content: (
            <div className="mt-6 space-y-2">
                <Label htmlFor="submitterName">Your name</Label>
                <Input
                    id="submitterName"
                    placeholder="e.g. John Smith"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    autoFocus
                    className="rounded-xl"
                />
            </div>
        ),
    }

    const questionSteps = questions.map((question, index) => ({
        title: renderQuestion(question.text),
        description: question.required ? 'Required' : 'Optional — skip if you prefer',
        isValid: question.required ? (answers[index] || '').trim().length > 0 : true,
        content: (
            <div className="mt-6">
                <Textarea
                    placeholder="Your answer..."
                    value={answers[index] || ''}
                    onChange={(e) => updateAnswer(index, e.target.value)}
                    className="min-h-[140px] resize-none rounded-2xl border-border/40 focus:border-primary"
                    autoFocus
                />
            </div>
        ),
    }))

    return (
        <Wizard
            steps={[nameStep, ...questionSteps]}
            onComplete={handleSubmit}
            isSubmitting={isSubmitting}
            completedLabel="Submit Responses"
        />
    )
}
