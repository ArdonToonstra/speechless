'use client'

import React, { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2 } from 'lucide-react'
import { submitQuestionnaireAsUser } from '@/actions/questionnaire'
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

interface QuestionnaireFormCollaboratorProps {
    project: Project
    userName: string
}

export function QuestionnaireFormCollaborator({ project, userName }: QuestionnaireFormCollaboratorProps) {
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

            const result = await submitQuestionnaireAsUser(project.id, answersArray)

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
                <h2 className="text-2xl font-serif text-slate-900 mb-2">Thank You, {userName}!</h2>
                <p className="text-slate-500">Your responses have been submitted successfully.</p>
            </div>
        )
    }

    const questions = project.questions || []

    const steps = questions.map((question, index) => ({
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

    if (steps.length === 0) {
        return (
            <div className="w-full max-w-2xl mx-auto p-8 rounded-3xl bg-white shadow-xl text-center">
                <p className="text-slate-500">No questions have been added to this questionnaire yet.</p>
            </div>
        )
    }

    return (
        <Wizard
            steps={steps}
            onComplete={handleSubmit}
            isSubmitting={isSubmitting}
            completedLabel="Submit Responses"
        />
    )
}
