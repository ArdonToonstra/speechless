'use client'

import React, { useState, useCallback } from 'react'
import { Editor } from '@/components/editor/Editor'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save } from 'lucide-react'
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
        // We can't easily trigger a manual save in this setup without editor ref, 
        // effectively 'Save' just visualizes the state for now or we rely on the debounce.
        // A real implementation would lift the editor state up or expose a ref.
    }

    return (
        <div className={cn("min-h-screen bg-background flex flex-col transition-all duration-500", focusMode ? "bg-card" : "")}>
            {/* Header - Hidden in Focus Mode */}
            <header className={cn(
                "bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-all duration-300",
                focusMode ? "-translate-y-full opacity-0 pointer-events-none absolute w-full" : "translate-y-0 opacity-100"
            )}>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard"><ArrowLeft className="w-5 h-5 text-muted-foreground" /></Link>
                    </Button>
                    <div>
                        <h1 className="font-bold text-lg text-foreground">{project.title}</h1>
                        <p className="text-xs text-muted-foreground">
                            {saving ? 'Saving...' : `Saved ${lastSaved?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="text-sm text-muted-foreground mr-4 hidden md:block">
                        {stats.words} words · {stats.readTime} min read
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFocusMode(true)}
                        className="hidden md:flex"
                    >
                        Focus
                    </Button>
                    <ShareDialog
                        projectId={project.id}
                        initialToken={project.magicLinkToken}
                        initialEnabled={project.magicLinkEnabled}
                    />
                    <Button size="sm" className="bg-primary hover:opacity-90 text-primary-foreground" onClick={onManualSave} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving' : 'Save'}
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

            {/* Editor Container */}
            <main className={cn(
                "flex-grow overflow-y-auto transition-all duration-500",
                focusMode ? "p-0 flex items-center justify-center bg-card" : "p-6 md:p-12 bg-muted/5"
            )}>
                <div className={cn(
                    "w-full h-full transition-all duration-500",
                    focusMode ? "max-w-3xl" : "max-w-4xl mx-auto"
                )}>
                    <Editor
                        initialState={project.content}
                        onChange={handleChange}
                        onStatsChange={onStatsChange}
                    />
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
