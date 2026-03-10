'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AnalysisResult, getIssueColor, IssueType } from '@/lib/textAnalysis'
import { cn } from '@/lib/utils'
import { Loader2, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'

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

interface GradeLevelBadgeProps {
    level: number
    gradeLabel: string
    gradeDescription: string
}

function GradeLevelBadge({ level, gradeLabel, gradeDescription }: GradeLevelBadgeProps) {
    const getGradeColor = () => {
        if (level <= 6) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        if (level <= 9) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        if (level <= 12) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    }

    return (
        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className={cn(
                "inline-block px-4 py-2 rounded-full text-2xl font-bold mb-2",
                getGradeColor()
            )}>
                {gradeLabel}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
                {gradeDescription}
            </p>
        </div>
    )
}

export function HemingwayPanel({ result, isAnalyzing }: HemingwayPanelProps) {
    const t = useTranslations('editor.hemingway')
    const [tipsOpen, setTipsOpen] = useState(false)

    if (isAnalyzing) {
        return (
            <div className="p-4 flex items-center justify-center h-full min-h-[200px]">
                <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-sm">{t('analyzing')}</span>
                </div>
            </div>
        )
    }

    if (!result) {
        return (
            <div className="p-4 flex items-center justify-center h-full min-h-[200px]">
                <div className="flex flex-col items-center gap-2 text-slate-400 text-center">
                    <AlertCircle className="w-6 h-6" />
                    <span className="text-sm">{t('startTyping')}</span>
                </div>
            </div>
        )
    }

    const { stats } = result
    const totalIssues = stats.passiveCount + stats.hardSentences + stats.veryHardSentences + stats.adverbs + stats.simplerAlternatives

    const gradeLabel = t('grade', { level: stats.gradeLevel })
    const gradeDescription = (() => {
        if (stats.gradeLevel <= 6) return t('gradeEasy')
        if (stats.gradeLevel <= 9) return t('gradeGood')
        if (stats.gradeLevel <= 12) return t('gradeComplex')
        return t('gradeVeryComplex')
    })()

    return (
        <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('writingAssistant')}</h3>
                {totalIssues === 0 ? (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">{t('great')}</span>
                    </div>
                ) : (
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        {totalIssues === 1
                            ? t('suggestion', { count: totalIssues })
                            : t('suggestions', { count: totalIssues })}
                    </span>
                )}
            </div>

            {/* Grade Level */}
            <GradeLevelBadge
                level={stats.gradeLevel}
                gradeLabel={gradeLabel}
                gradeDescription={gradeDescription}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.wordCount}</p>
                    <p className="text-xs text-slate-500">{t('words')}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.readingTime}</p>
                    <p className="text-xs text-slate-500">{t('minRead')}</p>
                </div>
            </div>

            {/* Issue Counts */}
            <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    {t('suggestionLabel')}
                </h4>
                <StatBadge
                    label={t('veryHardToRead')}
                    count={stats.veryHardSentences}
                    type="very-hard-sentence"
                />
                <StatBadge
                    label={t('hardToRead')}
                    count={stats.hardSentences}
                    type="hard-sentence"
                />
                <StatBadge
                    label={t('passiveVoice')}
                    count={stats.passiveCount}
                    type="passive"
                />
                <StatBadge
                    label={t('adverbs')}
                    count={stats.adverbs}
                    type="adverb"
                />
                <StatBadge
                    label={t('simplerAlternatives')}
                    count={stats.simplerAlternatives}
                    type="simpler-alternative"
                />
            </div>

            {/* Speech Tips — collapsible */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                    type="button"
                    onClick={() => setTipsOpen(!tipsOpen)}
                    className="flex items-center justify-between w-full text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide py-1 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    <span>{t('speechTips')}</span>
                    {tipsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {tipsOpen && (
                    <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mt-2">
                        <li>• {t('tipGrade')}</li>
                        <li>• {t('tipSentences')}</li>
                        <li>• {t('tipActiveVoice')}</li>
                        <li>• {t('tipReadingTime')}</li>
                    </ul>
                )}
            </div>
        </div>
    )
}
