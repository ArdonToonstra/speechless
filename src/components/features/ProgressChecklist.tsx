'use client'

import React, { useState } from 'react'
import { Link } from '@/i18n/navigation'
import {
    Check,
    Users,
    ClipboardList,
    Inbox,
    PenTool,
    CalendarDays,
    MapPin,
    Send,
    LayoutDashboard,
    CalendarClock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toggleProgressCheck } from '@/actions/progress'

export type StepIconName =
    | 'LayoutDashboard'
    | 'Users'
    | 'CalendarClock'
    | 'ClipboardList'
    | 'Inbox'
    | 'PenTool'
    | 'CalendarDays'
    | 'MapPin'
    | 'Send'

const ICON_MAP: Record<StepIconName, React.ElementType> = {
    LayoutDashboard,
    Users,
    CalendarClock,
    ClipboardList,
    Inbox,
    PenTool,
    CalendarDays,
    MapPin,
    Send,
}

export interface WorkflowStep {
    id: string
    label: string
    description: string
    href: string
    icon: StepIconName
    autoFilled: boolean
    manuallyChecked: boolean
    stat?: string
}

interface ProgressChecklistProps {
    steps: WorkflowStep[]
    projectId: number
}

export function ProgressChecklist({ steps: initialSteps, projectId }: ProgressChecklistProps) {
    const [steps, setSteps] = useState(initialSteps)

    const handleToggle = async (stepId: string, currentlyChecked: boolean) => {
        const newChecked = !currentlyChecked

        // Optimistic update
        setSteps(prev =>
            prev.map(s => s.id === stepId ? { ...s, manuallyChecked: newChecked } : s)
        )

        const result = await toggleProgressCheck(projectId, stepId, newChecked)

        if (!result.success) {
            // Revert on failure
            setSteps(prev =>
                prev.map(s => s.id === stepId ? { ...s, manuallyChecked: currentlyChecked } : s)
            )
        }
    }

    return (
        <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
            {steps.map((step, index) => {
                const isChecked = step.manuallyChecked
                const isFilled = step.autoFilled && !isChecked
                const isPending = !step.autoFilled && !isChecked
                const Icon = ICON_MAP[step.icon]

                return (
                    <div
                        key={step.id}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 transition-all",
                            isChecked && "bg-emerald-50/60",
                            isFilled && "bg-emerald-50/30",
                            isPending && "opacity-70",
                        )}
                    >
                        {/* Step indicator circle */}
                        <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                            isChecked && "bg-emerald-500 text-white",
                            isFilled && "bg-emerald-100 text-emerald-700",
                            isPending && "bg-slate-100 text-slate-400",
                        )}>
                            {isChecked ? (
                                <Check className="w-3.5 h-3.5" />
                            ) : (
                                <span className="text-[11px] font-bold">{index + 1}</span>
                            )}
                        </div>

                        {/* Content — navigates to the relevant page */}
                        <Link
                            href={`/projects/${projectId}/${step.href}`}
                            className="flex-1 min-w-0"
                        >
                            <div className="flex items-center gap-2">
                                <Icon className={cn(
                                    "w-3.5 h-3.5 shrink-0",
                                    isChecked && "text-emerald-600",
                                    isFilled && "text-emerald-500",
                                    isPending && "text-slate-400",
                                )} />
                                <span className={cn(
                                    "font-medium text-sm",
                                    isChecked && "text-emerald-800",
                                    isFilled && "text-emerald-900",
                                    isPending && "text-slate-500",
                                )}>
                                    {step.label}
                                </span>
                                {step.stat && (
                                    <span className="text-xs text-slate-400 ml-1">{step.stat}</span>
                                )}
                            </div>
                        </Link>

                        {/* Checkbox toggle */}
                        <button
                            onClick={e => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleToggle(step.id, isChecked)
                            }}
                            title={isChecked ? 'Mark as incomplete' : 'Mark as complete'}
                            className={cn(
                                "w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all",
                                isChecked && "bg-emerald-500 text-white",
                                isFilled && "border-2 border-emerald-400 bg-emerald-50",
                                isPending && "border border-slate-300 bg-transparent",
                            )}
                        >
                            {isChecked && <Check className="w-3 h-3" />}
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
