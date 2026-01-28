'use client'

import React from 'react'
import { AnalysisResult, getIssueLabel, getIssueColor, IssueType } from '@/lib/textAnalysis'
import { cn } from '@/lib/utils'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

interface HemingwayPanelProps {
    result: AnalysisResult | null
    isAnalyzing: boolean
}

interface StatBadgeProps {
    label: string
    count: number
    type: IssueType
}

function StatBadge({ label, count, type }: StatBadgeProps) {
    const colorClass = getIssueColor(type)

    return (
        <div className={cn(
            "flex items-center justify-between p-3 rounded-lg",
            colorClass,
            count === 0 && "opacity-50"
        )}>
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</span>
            <span className={cn(
                "text-lg font-bold",
                count === 0 ? "text-slate-500" : "text-slate-900 dark:text-white"
            )}>
                {count}
            </span>
        </div>
    )
}

function GradeLevelBadge({ level }: { level: number }) {
    const getGradeColor = () => {
        if (level <= 6) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        if (level <= 9) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        if (level <= 12) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    }

    const getGradeDescription = () => {
        if (level <= 6) return 'Easy to understand'
        if (level <= 9) return 'Good for most audiences'
        if (level <= 12) return 'Fairly complex'
        return 'Very complex'
    }

    return (
        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className={cn(
                "inline-block px-4 py-2 rounded-full text-2xl font-bold mb-2",
                getGradeColor()
            )}>
                Grade {level}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
                {getGradeDescription()}
            </p>
        </div>
    )
}

export function HemingwayPanel({ result, isAnalyzing }: HemingwayPanelProps) {
    if (isAnalyzing) {
        return (
            <div className="p-4 flex items-center justify-center h-full min-h-[200px]">
                <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-sm">Analyzing...</span>
                </div>
            </div>
        )
    }

    if (!result) {
        return (
            <div className="p-4 flex items-center justify-center h-full min-h-[200px]">
                <div className="flex flex-col items-center gap-2 text-slate-400 text-center">
                    <AlertCircle className="w-6 h-6" />
                    <span className="text-sm">Start typing to see analysis</span>
                </div>
            </div>
        )
    }

    const { stats } = result
    const totalIssues = stats.passiveCount + stats.hardSentences + stats.veryHardSentences + stats.adverbs + stats.simplerAlternatives

    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Writing Assistant</h3>
                {totalIssues === 0 ? (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Great!</span>
                    </div>
                ) : (
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        {totalIssues} suggestion{totalIssues !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Grade Level */}
            <GradeLevelBadge level={stats.gradeLevel} />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.wordCount}</p>
                    <p className="text-xs text-slate-500">words</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.readingTime}</p>
                    <p className="text-xs text-slate-500">min read</p>
                </div>
            </div>

            {/* Issue Counts */}
            <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Suggestions
                </h4>
                <StatBadge
                    label="Very Hard to Read"
                    count={stats.veryHardSentences}
                    type="very-hard-sentence"
                />
                <StatBadge
                    label="Hard to Read"
                    count={stats.hardSentences}
                    type="hard-sentence"
                />
                <StatBadge
                    label="Passive Voice"
                    count={stats.passiveCount}
                    type="passive"
                />
                <StatBadge
                    label="Adverbs"
                    count={stats.adverbs}
                    type="adverb"
                />
                <StatBadge
                    label="Simpler Alternatives"
                    count={stats.simplerAlternatives}
                    type="simpler-alternative"
                />
            </div>

            {/* Legend */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">
                    Color Legend
                </h4>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-red-200 dark:bg-red-900/50" />
                        <span className="text-slate-600 dark:text-slate-400">Very hard to read</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-yellow-200 dark:bg-yellow-900/50" />
                        <span className="text-slate-600 dark:text-slate-400">Hard to read</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-blue-200 dark:bg-blue-900/50" />
                        <span className="text-slate-600 dark:text-slate-400">Passive voice</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-purple-200 dark:bg-purple-900/50" />
                        <span className="text-slate-600 dark:text-slate-400">Adverbs</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded border-b-2 border-green-500 bg-white dark:bg-slate-800" />
                        <span className="text-slate-600 dark:text-slate-400">Simpler alternative exists</span>
                    </div>
                </div>
            </div>

            {/* Tips for speeches */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">
                    Speech Tips
                </h4>
                <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <li>• Aim for Grade 6-8 for maximum audience engagement</li>
                    <li>• Short sentences are easier to deliver with confidence</li>
                    <li>• Active voice sounds more dynamic when spoken</li>
                    <li>• Reading time assumes 150 words/minute for speeches</li>
                </ul>
            </div>
        </div>
    )
}
