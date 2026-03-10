'use client'

import React, { useState } from 'react'
import { MessageSquare, ChevronDown, ChevronUp, Quote } from 'lucide-react'
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
                'p-3 rounded-xl border transition-all duration-200 cursor-pointer',
                'hover:shadow-sm',
                colorClass
            )}
            onClick={onToggle}
        >
            <Quote className="w-4 h-4 text-slate-300 mb-1.5" />
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-2">
                {displayAnswer}
            </p>
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
            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/50">
                <div className="w-5 h-5 rounded-full bg-white/80 flex items-center justify-center text-[10px] font-bold text-slate-600">
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
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                    {questionNumber}
                </div>
                <p className="text-sm font-medium text-slate-800 flex-1 min-w-0">
                    {question}
                </p>
                <span className="text-xs text-slate-400 shrink-0">
                    {answers.length} {answers.length === 1 ? 'response' : 'responses'}
                </span>
            </div>
            <div className="p-4">
                {answers.length === 0 ? (
                    <p className="text-sm text-slate-400 italic text-center py-4">
                        No answers yet for this question.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
            </div>
        </div>
    )
}

export function AnswersByQuestion({ submissions, questions, speechReceiverName }: AnswersByQuestionProps) {
    const renderQuestion = (text: string) => {
        return text.replace(/{speechReceiverName}/g, speechReceiverName || 'them')
    }

    const groupedAnswers = questions.map((q) => {
        const questionText = renderQuestion(q.text)
        const answersForQuestion: { answer: string; submitterName: string }[] = []

        submissions.forEach((submission) => {
            if (!submission.answers) return

            const matchingAnswer = submission.answers.find((a) => {
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

    if (submissions.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 p-10 text-center">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-3" />
                <h3 className="text-sm font-medium text-slate-500 mb-1">No submissions yet</h3>
                <p className="text-xs text-slate-400">
                    Share the questionnaire link with your guests to start collecting stories and memories!
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {groupedAnswers.map((group, index) => (
                <QuestionGroup
                    key={index}
                    question={group.question}
                    answers={group.answers}
                    questionNumber={index + 1}
                />
            ))}
        </div>
    )
}
