'use client'

import React, { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, ChevronDown, ChevronRight, Check, RotateCcw, Trash2, Reply } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { addComment, replyToComment, resolveComment, reopenComment, deleteComment } from '@/actions/comments'

export interface CommentData {
    id: number
    submissionId: number | null
    projectId: number
    parentId: number | null
    authorId: string
    authorName: string
    content: string
    resolvedAt: Date | string | null
    createdAt: Date | string
    updatedAt: Date | string
}

interface CommentThreadProps {
    submissionId: number | null
    projectId: number
    authorName: string
    initialComments: CommentData[]
    /** When true, the comment section starts expanded and shows a more prominent header */
    standalone?: boolean
}

export function CommentThread({ submissionId, projectId, authorName, initialComments, standalone }: CommentThreadProps) {
    const [comments, setComments] = useState(initialComments)
    const [isOpen, setIsOpen] = useState(!!standalone)
    const [newComment, setNewComment] = useState('')
    const [showNewForm, setShowNewForm] = useState(false)
    const [replyingTo, setReplyingTo] = useState<number | null>(null)
    const [replyContent, setReplyContent] = useState('')
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const topLevel = comments.filter(c => c.parentId === null)
    const getReplies = (parentId: number) => comments.filter(c => c.parentId === parentId)
    const count = comments.length

    const handleAddComment = async () => {
        if (!newComment.trim() || isSubmitting) return
        setIsSubmitting(true)
        const tempId = -(Date.now())
        const tempComment: CommentData = {
            id: tempId,
            submissionId,
            projectId,
            parentId: null,
            authorId: 'temp',
            authorName,
            content: newComment.trim(),
            resolvedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        const savedContent = newComment.trim()
        setComments(prev => [...prev, tempComment])
        setNewComment('')
        setShowNewForm(false)

        const result = await addComment(projectId, submissionId, savedContent)
        if (result.success && result.comment) {
            setComments(prev => prev.map(c => c.id === tempId ? result.comment! : c))
        } else {
            setComments(prev => prev.filter(c => c.id !== tempId))
            setNewComment(savedContent)
            setShowNewForm(true)
        }
        setIsSubmitting(false)
    }

    const handleReply = async (parentId: number) => {
        if (!replyContent.trim() || isSubmitting) return
        setIsSubmitting(true)
        const tempId = -(Date.now())
        const savedContent = replyContent.trim()
        const tempReply: CommentData = {
            id: tempId,
            submissionId,
            projectId,
            parentId,
            authorId: 'temp',
            authorName,
            content: savedContent,
            resolvedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        setComments(prev => [...prev, tempReply])
        setReplyContent('')
        setReplyingTo(null)

        const result = await replyToComment(projectId, parentId, submissionId, savedContent)
        if (result.success && result.comment) {
            setComments(prev => prev.map(c => c.id === tempId ? result.comment! : c))
        } else {
            setComments(prev => prev.filter(c => c.id !== tempId))
            setReplyingTo(parentId)
            setReplyContent(savedContent)
        }
        setIsSubmitting(false)
    }

    const handleResolve = async (commentId: number) => {
        const prev = [...comments]
        setComments(c => c.map(x => x.id === commentId ? { ...x, resolvedAt: new Date() } : x))
        const result = await resolveComment(commentId, projectId)
        if (!result.success) setComments(prev)
    }

    const handleReopen = async (commentId: number) => {
        const prev = [...comments]
        setComments(c => c.map(x => x.id === commentId ? { ...x, resolvedAt: null } : x))
        const result = await reopenComment(commentId, projectId)
        if (!result.success) setComments(prev)
    }

    const handleDelete = async (commentId: number) => {
        const prev = [...comments]
        setComments(c => c.filter(x => x.id !== commentId && x.parentId !== commentId))
        setConfirmDelete(null)
        const result = await deleteComment(commentId, projectId)
        if (!result.success) setComments(prev)
    }

    return (
        <div className="border-t border-slate-100 px-6 py-4">
            {/* Toggle header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setIsOpen(o => !o)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    {isOpen
                        ? <ChevronDown className="w-3.5 h-3.5" />
                        : <ChevronRight className="w-3.5 h-3.5" />
                    }
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{standalone ? 'Speech Feedback' : 'Comments'}{count > 0 ? ` (${count})` : ''}</span>
                </button>

                {isOpen && !showNewForm && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setShowNewForm(true)}
                    >
                        + Add comment
                    </Button>
                )}
            </div>

            {isOpen && (
                <div className="mt-4 space-y-3">
                    {/* New comment form */}
                    {showNewForm && (
                        <div className="space-y-2">
                            <Textarea
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="text-sm min-h-[72px] resize-none"
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim() || isSubmitting}
                                >
                                    Post
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs"
                                    onClick={() => { setShowNewForm(false); setNewComment('') }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {topLevel.length === 0 && !showNewForm && (
                        <p className="text-xs text-muted-foreground italic">No comments yet.</p>
                    )}

                    {/* Comment list */}
                    {topLevel.map(comment => {
                        const replies = getReplies(comment.id)
                        const isResolved = !!comment.resolvedAt

                        return (
                            <div
                                key={comment.id}
                                className={cn(
                                    'rounded-lg border p-3 space-y-3 text-sm',
                                    isResolved ? 'bg-muted/30 border-border' : 'bg-background border-border'
                                )}
                            >
                                {/* Comment header row */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="font-semibold text-xs">{comment.authorName}</span>
                                            <span className="text-muted-foreground text-xs">·</span>
                                            <span className="text-muted-foreground text-xs">
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                            </span>
                                            {isResolved && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs h-4 px-1.5 bg-emerald-100 text-emerald-700 border-emerald-200"
                                                >
                                                    <Check className="w-2.5 h-2.5 mr-1" />
                                                    Resolved
                                                </Badge>
                                            )}
                                        </div>
                                        {!isResolved && (
                                            <p className="text-slate-700 leading-relaxed">{comment.content}</p>
                                        )}
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        {isResolved ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-xs px-2"
                                                onClick={() => handleReopen(comment.id)}
                                            >
                                                <RotateCcw className="w-3 h-3 mr-1" />
                                                Reopen
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 text-xs px-2"
                                                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                >
                                                    <Reply className="w-3 h-3 mr-1" />
                                                    Reply
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 text-xs px-2"
                                                    onClick={() => handleResolve(comment.id)}
                                                >
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Resolve
                                                </Button>
                                            </>
                                        )}

                                        {confirmDelete === comment.id ? (
                                            <span className="flex items-center gap-1">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="h-6 text-xs px-2"
                                                    onClick={() => handleDelete(comment.id)}
                                                >
                                                    Confirm
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 text-xs px-2"
                                                    onClick={() => setConfirmDelete(null)}
                                                >
                                                    Cancel
                                                </Button>
                                            </span>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                                onClick={() => setConfirmDelete(comment.id)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Replies */}
                                {replies.length > 0 && (
                                    <div className="pl-3 border-l-2 border-slate-100 space-y-3">
                                        {replies.map(reply => (
                                            <div key={reply.id} className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className="font-semibold text-xs">{reply.authorName}</span>
                                                        <span className="text-muted-foreground text-xs">·</span>
                                                        <span className="text-muted-foreground text-xs">
                                                            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-700 leading-relaxed">{reply.content}</p>
                                                </div>

                                                {confirmDelete === reply.id ? (
                                                    <span className="flex items-center gap-1 shrink-0">
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            className="h-6 text-xs px-2"
                                                            onClick={() => handleDelete(reply.id)}
                                                        >
                                                            Confirm
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 text-xs px-2"
                                                            onClick={() => setConfirmDelete(null)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </span>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                                                        onClick={() => setConfirmDelete(reply.id)}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Reply form */}
                                {replyingTo === comment.id && (
                                    <div className="pl-3 border-l-2 border-primary/30 space-y-2">
                                        <Textarea
                                            value={replyContent}
                                            onChange={e => setReplyContent(e.target.value)}
                                            placeholder="Write a reply..."
                                            className="text-sm min-h-[60px] resize-none"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="h-7 text-xs"
                                                onClick={() => handleReply(comment.id)}
                                                disabled={!replyContent.trim() || isSubmitting}
                                            >
                                                Reply
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 text-xs"
                                                onClick={() => { setReplyingTo(null); setReplyContent('') }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {/* Add comment button at bottom when there are already comments */}
                    {!showNewForm && topLevel.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs w-full border border-dashed"
                            onClick={() => setShowNewForm(true)}
                        >
                            + Add comment
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
