'use client'

import React, { useState, useCallback } from 'react'
import { Editor } from '@/components/editor/Editor'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Settings, PenTool } from 'lucide-react'
import Link from 'next/link'
import { updateProjectContent } from '@/actions/projects'
import { ShareDialog } from '@/components/features/ShareDialog'
import { cn } from '@/lib/utils'

interface Stats {
    words: number
    chars: number
    readTime: number
}

export function InteractiveEditor({ project }: { project: any }) {
    const [saving, setSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(new Date(project.updatedAt))
    const [focusMode, setFocusMode] = useState(false)
    const [stats, setStats] = useState<Stats>({ words: 0, chars: 0, readTime: 0 })

    const saveContent = useCallback(async (editorState: any) => {
        setSaving(true)
        const json = editorState.toJSON()
        await updateProjectContent(project.id, json)
        setSaving(false)
        setLastSaved(new Date())
    }, [project.id])

    // Simple debounce ref
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

    const handleChange = (editorState: any) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        timeoutRef.current = setTimeout(() => {
            editorState.read(() => {
                saveContent(editorState)
            })
        }, 2000) // Auto-save every 2 seconds of inactivity
    }

    const onStatsChange = (newStats: Stats) => {
        setStats(newStats)
    }

    // Manual save
    const onManualSave = () => {
        // Auto-save logic handles persistence. Manual save provides user feedback.
    }

    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div className={cn("h-full flex flex-col", focusMode ? "fixed inset-0 z-50 bg-background" : "relative")}>
            {/* Toolbar - Sticky at top */}
            <header className={cn(
                "border-b border-slate-200 px-8 py-5 flex items-center justify-between shrink-0 bg-white/95 backdrop-blur-sm shadow-sm z-40",
                focusMode ? "hidden" : "flex"
            )}>
                {/* Left Side: Standard Title */}
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-primary/10 rounded-xl hidden sm:block">
                        <PenTool className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">Speech Editor</h1>
                        <p className="text-slate-500 flex items-center gap-2 text-xs mt-0.5">
                            {project.title}
                            {mounted && lastSaved && <span className="text-xs opacity-60 hidden md:inline">• Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                        </p>
                    </div>
                </div>

                {/* Right Side: Editor Controls */}
                <div className="flex gap-4 items-center">
                    <div className="text-sm text-slate-600 hidden lg:block text-right bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        <p className="font-semibold">{stats.words} <span className="font-normal text-slate-500">words</span></p>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFocusMode(true)}
                        className="gap-2 h-9 px-4 rounded-lg hover:bg-slate-100 text-slate-700"
                    >
                        Focus
                    </Button>

                    <Button
                        onClick={onManualSave}
                        disabled={saving}
                        size="sm"
                        className="gap-2 bg-primary hover:opacity-90 text-primary-foreground h-9 px-5 rounded-lg shadow-sm"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </header>

            {/* Focus Mode Controls */}
            {focusMode && (
                <div className="fixed top-4 right-4 z-50">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFocusMode(false)}
                        className="bg-muted/10 hover:bg-muted/20 text-muted-foreground"
                    >
                        Exit Focus
                    </Button>
                </div>
            )}

            {/* Editor Container - Scrollable */}
            <main className={cn(
                "flex-grow overflow-y-auto scroll-smooth",
                focusMode ? "p-0 flex items-center justify-center bg-background" : "p-4 md:p-6 bg-muted/5"
            )}>
                <div className={cn(
                    "mx-auto transition-all duration-500",
                    focusMode ? "max-w-4xl" : "max-w-4xl"
                )}>
                    {/* Single "Paper" Container */}
                    <div className={cn(
                        "transition-all duration-500",
                        focusMode
                            ? "bg-transparent border-none shadow-none"
                            : "bg-card rounded-xl shadow-sm border border-border/50 min-h-[1100px] my-8"
                    )}>
                        <Editor
                            initialState={project.content}
                            onChange={handleChange}
                            onStatsChange={onStatsChange}
                        />
                    </div>

                    {/* Footer Stats in Focus Mode */}
                    {focusMode && (
                        <div className="fixed bottom-4 left-0 right-0 text-center text-sm text-muted-foreground opacity-50 hover:opacity-100 transition-opacity">
                            {stats.words} words · {stats.readTime} min read
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
