'use client'

import React, { useState, useEffect, useCallback } from 'react'
import type { JSONContent } from '@tiptap/core'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
    History,
    RotateCcw,
    Trash2,
    Pencil,
    Check,
    X,
    Eye,
    Clock,
    Tag,
    Loader2,
} from 'lucide-react'
import {
    getSnapshots,
    getSnapshotContent,
    restoreSnapshot,
    updateSnapshotLabel,
    deleteSnapshot,
} from '@/actions/snapshots'
import { toast } from 'sonner'

type SnapshotItem = {
    id: number
    wordCount: number
    label: string | null
    createdAt: Date
}

interface VersionHistoryProps {
    projectId: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onRestore: (content: JSONContent) => void
}

export function VersionHistory({ projectId, open, onOpenChange, onRestore }: VersionHistoryProps) {
    const [snapshots, setSnapshots] = useState<SnapshotItem[]>([])
    const [loading, setLoading] = useState(false)
    const [previewContent, setPreviewContent] = useState<JSONContent | null>(null)
    const [previewingId, setPreviewingId] = useState<number | null>(null)
    const [editingLabelId, setEditingLabelId] = useState<number | null>(null)
    const [editLabelValue, setEditLabelValue] = useState('')
    const [restoringId, setRestoringId] = useState<number | null>(null)
    const [confirmRestoreId, setConfirmRestoreId] = useState<number | null>(null)

    const loadSnapshots = useCallback(async () => {
        setLoading(true)
        const result = await getSnapshots(projectId)
        if (result.snapshots) {
            setSnapshots(result.snapshots.map(s => ({
                ...s,
                createdAt: new Date(s.createdAt),
            })))
        }
        setLoading(false)
    }, [projectId])

    useEffect(() => {
        if (open) {
            loadSnapshots()
            setPreviewContent(null)
            setPreviewingId(null)
        }
    }, [open, loadSnapshots])

    const handlePreview = async (snapshotId: number) => {
        if (previewingId === snapshotId) {
            setPreviewContent(null)
            setPreviewingId(null)
            return
        }
        const result = await getSnapshotContent(snapshotId, projectId)
        if (result.content) {
            setPreviewContent(result.content)
            setPreviewingId(snapshotId)
        }
    }

    const handleRestore = async (snapshotId: number) => {
        setRestoringId(snapshotId)
        const result = await restoreSnapshot(snapshotId, projectId)
        if (result.success && result.content) {
            onRestore(result.content)
            toast.success('Version restored')
            onOpenChange(false)
        } else {
            toast.error(result.error || 'Failed to restore')
        }
        setRestoringId(null)
        setConfirmRestoreId(null)
    }

    const handleSaveLabel = async (snapshotId: number) => {
        await updateSnapshotLabel(snapshotId, projectId, editLabelValue)
        setEditingLabelId(null)
        setSnapshots(prev => prev.map(s =>
            s.id === snapshotId ? { ...s, label: editLabelValue || null } : s
        ))
    }

    const handleDelete = async (snapshotId: number) => {
        await deleteSnapshot(snapshotId, projectId)
        setSnapshots(prev => prev.filter(s => s.id !== snapshotId))
        if (previewingId === snapshotId) {
            setPreviewContent(null)
            setPreviewingId(null)
        }
        toast.success('Snapshot deleted')
    }

    const formatDate = (date: Date) => {
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMin = Math.floor(diffMs / 60000)
        const diffHr = Math.floor(diffMin / 60)
        const diffDays = Math.floor(diffHr / 24)

        if (diffMin < 1) return 'Just now'
        if (diffMin < 60) return `${diffMin}m ago`
        if (diffHr < 24) return `${diffHr}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }

    const formatFullDate = (date: Date) => {
        return date.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    // Render a simple text preview from JSON content
    const renderPreviewText = (content: JSONContent) => {
        const extractText = (node: JSONContent): string => {
            let text = ''
            if (node.text) text += node.text
            if (node.content) {
                for (const child of node.content) {
                    text += extractText(child)
                    if (child.type === 'paragraph' || child.type?.startsWith('heading')) {
                        text += '\n'
                    }
                }
            }
            return text
        }
        return extractText(content).trim()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        Version History
                    </DialogTitle>
                    <DialogDescription>
                        Browse and restore previous versions of your speech.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : snapshots.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No saved versions yet.</p>
                            <p className="text-xs mt-1">Versions are saved when you click Save manually.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 py-2">
                            {snapshots.map((snapshot) => (
                                <div
                                    key={snapshot.id}
                                    className={cn(
                                        "border rounded-lg transition-colors",
                                        previewingId === snapshot.id
                                            ? "border-primary/50 bg-primary/5"
                                            : "border-border hover:border-border/80 hover:bg-muted/30"
                                    )}
                                >
                                    {/* Snapshot header */}
                                    <div className="flex items-center justify-between px-3 py-2.5">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="flex flex-col min-w-0">
                                                {/* Label row */}
                                                {editingLabelId === snapshot.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="text"
                                                            value={editLabelValue}
                                                            onChange={(e) => setEditLabelValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleSaveLabel(snapshot.id)
                                                                if (e.key === 'Escape') setEditingLabelId(null)
                                                            }}
                                                            className="text-sm font-medium bg-background border rounded px-2 py-0.5 w-40 focus:outline-none focus:ring-1 focus:ring-primary"
                                                            placeholder="Add a label..."
                                                            autoFocus
                                                        />
                                                        <button onClick={() => handleSaveLabel(snapshot.id)} className="p-0.5 text-green-600 hover:text-green-700">
                                                            <Check className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button onClick={() => setEditingLabelId(null)} className="p-0.5 text-muted-foreground hover:text-foreground">
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5">
                                                        {snapshot.label ? (
                                                            <span className="text-sm font-medium flex items-center gap-1">
                                                                <Tag className="w-3 h-3 text-primary/60" />
                                                                {snapshot.label}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">
                                                                {formatFullDate(snapshot.createdAt)}
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                setEditingLabelId(snapshot.id)
                                                                setEditLabelValue(snapshot.label || '')
                                                            }}
                                                            className="p-0.5 text-muted-foreground/50 hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="Edit label"
                                                        >
                                                            <Pencil className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Meta row */}
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(snapshot.createdAt)}
                                                    </span>
                                                    <span>{snapshot.wordCount} words</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 text-xs"
                                                onClick={() => handlePreview(snapshot.id)}
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-1" />
                                                {previewingId === snapshot.id ? 'Hide' : 'Preview'}
                                            </Button>

                                            {confirmRestoreId === snapshot.id ? (
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="h-7 px-2 text-xs"
                                                        onClick={() => handleRestore(snapshot.id)}
                                                        disabled={restoringId === snapshot.id}
                                                    >
                                                        {restoringId === snapshot.id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            'Confirm'
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-1.5"
                                                        onClick={() => setConfirmRestoreId(null)}
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2 text-xs"
                                                    onClick={() => setConfirmRestoreId(snapshot.id)}
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                                                    Restore
                                                </Button>
                                            )}

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-1.5 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleDelete(snapshot.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Preview panel */}
                                    {previewingId === snapshot.id && previewContent && (
                                        <div className="border-t px-4 py-3 max-h-60 overflow-y-auto">
                                            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-serif leading-relaxed">
                                                {renderPreviewText(previewContent)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter className="text-xs text-muted-foreground">
                    Up to 30 versions are kept. Labeled versions are preserved longer.
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
