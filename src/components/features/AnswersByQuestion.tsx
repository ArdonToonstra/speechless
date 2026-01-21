'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, User, ChevronDown, ChevronUp, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnswerItem {
    question: string
    answer: string
}

interface Submission {
    id: number
    submitterName: string
    answers: AnswerItem[] | null
    createdAt: Date | null
}

interface AnswersByQuestionProps {
    submissions: Submission[]
    questions: { text: string }[]
    speechReceiverName?: string
}

// Soft pastel colors for answer cards
const CARD_COLORS = [
    'bg-amber-50 border-amber-100',
    'bg-rose-50 border-rose-100',
    'bg-sky-50 border-sky-100',
    'bg-emerald-50 border-emerald-100',
    'bg-violet-50 border-violet-100',
    'bg-orange-50 border-orange-100',
    'bg-teal-50 border-teal-100',
    'bg-pink-50 border-pink-100',
]

function getColorForSubmitter(submitterName: string): string {
    // Generate consistent color based on name
    let hash = 0
    for (let i = 0; i < submitterName.length; i++) {
        hash = submitterName.charCodeAt(i) + ((hash << 5) - hash)
    }
    return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length]
}

interface AnswerCardProps {
    answer: string
    submitterName: string
    isExpanded: boolean
    onToggle: () => void
}

function AnswerCard({ answer, submitterName, isExpanded, onToggle }: AnswerCardProps) {
    const colorClass = getColorForSubmitter(submitterName)
    const isLongAnswer = answer.length > 200
    const displayAnswer = isExpanded || !isLongAnswer ? answer : answer.slice(0, 200) + '...'

    return (
        <div
            className={cn(
                'p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer',
                'hover:shadow-md hover:-translate-y-0.5',
                colorClass
            )}
            onClick={onToggle}
        >
            {/* Quote icon */}
            <Quote className="w-5 h-5 text-slate-300 mb-2" />

            {/* Answer text */}
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-3">
                {displayAnswer}
            </p>

            {/* Read more indicator */}
            {isLongAnswer && (
                <button
                    className="text-xs text-primary font-medium flex items-center gap-1 mb-2 hover:underline"
                    onClick={(e) => {
                        e.stopPropagation()
                        onToggle()
                    }}
                >
                    {isExpanded ? (
                        <>Show less <ChevronUp className="w-3 h-3" /></>
                    ) : (
                        <>Read more <ChevronDown className="w-3 h-3" /></>
                    )}
                </button>
            )}

            {/* Submitter info */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50">
                <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm">
                    {submitterName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-slate-500 font-medium">
                    {submitterName}
                </span>
            </div>
        </div>
    )
}

interface QuestionGroupProps {
    question: string
    answers: { answer: string; submitterName: string }[]
    questionNumber: number
}

function QuestionGroup({ question, answers, questionNumber }: QuestionGroupProps) {
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())

    const toggleCard = (index: number) => {
        setExpandedCards(prev => {
            const next = new Set(prev)
            if (next.has(index)) {
                next.delete(index)
            } else {
                next.add(index)
            }
            return next
        })
    }

    return (
        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 px-6 py-5">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {questionNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-slate-800 leading-snug">
                            {question}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-2 bg-slate-100 text-slate-600">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {answers.length} {answers.length === 1 ? 'response' : 'responses'}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {answers.length === 0 ? (
                    <p className="text-sm text-slate-400 italic text-center py-8">
                        No answers yet for this question.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {answers.map((item, index) => (
                            <AnswerCard
                                key={index}
                                answer={item.answer}
                                submitterName={item.submitterName}
                                isExpanded={expandedCards.has(index)}
                                onToggle={() => toggleCard(index)}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export function AnswersByQuestion({ submissions, questions, speechReceiverName }: AnswersByQuestionProps) {
    // Helper to replace placeholder in questions
    const renderQuestion = (text: string) => {
        return text.replace(/{speechReceiverName}/g, speechReceiverName || 'them')
    }

    // Group answers by question
    const groupedAnswers = questions.map((q) => {
        const questionText = renderQuestion(q.text)
        const answersForQuestion: { answer: string; submitterName: string }[] = []

        submissions.forEach((submission) => {
            if (!submission.answers) return

            // Find the answer that matches this question
            const matchingAnswer = submission.answers.find((a) => {
                // Match by rendered question text (since stored answers have the name replaced)
                return a.question === questionText ||
                    a.question === q.text ||
                    a.question.replace(/{speechReceiverName}/g, speechReceiverName || 'them') === questionText
            })

            if (matchingAnswer && matchingAnswer.answer.trim()) {
                answersForQuestion.push({
                    answer: matchingAnswer.answer,
                    submitterName: submission.submitterName || 'Anonymous',
                })
            }
        })

        return {
            question: questionText,
            answers: answersForQuestion,
        }
    })

    // Calculate total responses
    const totalResponses = submissions.length
    const totalAnswers = groupedAnswers.reduce((sum, g) => sum + g.answers.length, 0)

    if (submissions.length === 0) {
        return (
            <div className="bg-muted/30 border border-dashed rounded-2xl p-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                <p className="text-muted-foreground">
                    Share the questionnaire link with your guests to start collecting stories and memories!
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="flex items-center gap-4 text-sm text-slate-500">
                <Badge variant="outline" className="py-1.5 px-3">
                    <User className="w-3.5 h-3.5 mr-1.5" />
                    {totalResponses} {totalResponses === 1 ? 'contributor' : 'contributors'}
                </Badge>
                <Badge variant="outline" className="py-1.5 px-3">
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                    {totalAnswers} total {totalAnswers === 1 ? 'answer' : 'answers'}
                </Badge>
            </div>

            {/* Question Groups */}
            <div className="space-y-8">
                {groupedAnswers.map((group, index) => (
                    <QuestionGroup
                        key={index}
                        question={group.question}
                        answers={group.answers}
                        questionNumber={index + 1}
                    />
                ))}
            </div>
        </div>
    )
}
