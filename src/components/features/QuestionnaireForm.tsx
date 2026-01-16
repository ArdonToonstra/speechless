'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { submitQuestionnaire } from '@/actions/questionnaire'

interface QuestionItem {
    text: string
    type?: string
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Form submitted!')
        console.log('Project ID:', project.id)
        console.log('Token:', token)
        console.log('Submitter name:', submitterName)

        setIsSubmitting(true)

        try {
            // Convert answers object to array format
            const answersArray = (project.questions || []).map((q: any, index: number) => ({
                question: q.text.replace(/{speechReceiverName}/g, project.speechReceiverName || 'them'),
                answer: answers[index] || '',
            }))

            console.log('Answers:', answersArray)

            const result = await submitQuestionnaire({
                projectId: project.id,
                token,
                submitterName,
                answers: answersArray,
            })

            console.log('Result:', result)

            if (result.success) {
                setIsSubmitted(true)
            } else {
                console.error('Submission failed:', result.error)
                alert('Failed to submit: ' + (result.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Exception during submission:', error)
            alert('An error occurred. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Helper to replace placeholder in questions
    const renderQuestion = (text: string) => {
        return text.replace(/{speechReceiverName}/g, project.speechReceiverName || 'them')
    }

    if (isSubmitted) {
        return (
            <Card className="text-center py-12">
                <CardContent className="space-y-4">
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
                    <h2 className="text-2xl font-bold">Thank You!</h2>
                    <p className="text-muted-foreground">
                        Your responses have been submitted successfully.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Your Information</CardTitle>
                    <CardDescription>Please provide your name</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="submitterName">Your Name *</Label>
                        <Input
                            id="submitterName"
                            placeholder="e.g. John Smith"
                            value={submitterName}
                            onChange={(e) => setSubmitterName(e.target.value)}
                            required
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="mt-6 space-y-6">
                {(project.questions || []).map((question: any, index: number) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle className="text-base font-medium">
                                {index + 1}. {renderQuestion(question.text)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Your answer..."
                                value={answers[index] || ''}
                                onChange={(e) => updateAnswer(index, e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-8 flex justify-end">
                <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting || !submitterName}
                    className="min-w-[200px]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Responses'
                    )}
                </Button>
            </div>
        </form>
    )
}
