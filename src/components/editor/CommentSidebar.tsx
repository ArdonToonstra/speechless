'use client'

import React, { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
    MessageSquare,
    Check,
    RotateCcw,
    Trash2,
    Reply,
    Send,
    Quote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
    addComment,
    replyToComment,
    resolveComment,
    reopenComment,
    deleteComment,
} from '@/actions/comments'

export interface SpeechComment {
    id: number
    projectId: number
    submissionId: number | null
    parentId: number | null
    authorId: string
    authorName: string
    content: string
    commentMarkId: string | null
    selectedText: string | null
    resolvedAt: Date | string | null
    createdAt: Date | string
    updatedAt: Date | string
}

interface CommentSidebarProps {
    projectId: number
    authorName: string
    initialComments: SpeechComment[]
    activeCommentId: string | null
    selectedText: string
    hasSelection: boolean
    onCreateComment: (content: string) => Promise<string | null>
    onDeleteMark: (commentMarkId: string) => void
    onCommentClick: (commentMarkId: string) => void
}

export function CommentSidebar({
    projectId,
    authorName,
    initialComments,
    activeCommentId,
    selectedText,
    hasSelection,
    onCreateComment,
    onDeleteMark,
    onCommentClick,
}: CommentSidebarProps) {
    const [comments, setComments] = useState<SpeechComment[]>(initialComments)
    const [newComment, setNewComment] = useState('')
    const [replyingTo, setReplyingTo] = useState<number | null>(null)
    const [replyContent, setReplyContent] = useState('')
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const topLevel = comments.filter((c) => c.parentId === null)
    const getReplies = (parentId: number) =>
        comments.filter((c) => c.parentId === parentId)

    const handleAddComment = async () => {
        if (!newComment.trim() || isSubmitting || !hasSelection) return
        setIsSubmitting(true)

        const content = newComment.trim()
        const commentMarkId = await onCreateComment(content)

        if (commentMarkId) {
            const result = await addComment(
                projectId,
                null,
                content,
                commentMarkId,
                selectedText
            )
            if (result.success && result.comment) {
                setComments((prev) => [
                    ...prev,
                    {
                        ...result.comment!,
                        commentMarkId,
                        selectedText,
                    } as SpeechComment,
                ])
            }
        }

        setNewComment('')
        setIsSubmitting(false)
    }

    const handleReply = async (parentId: number) => {
        if (!replyContent.trim() || isSubmitting) return
        setIsSubmitting(true)
        const content = replyContent.trim()

        const result = await replyToComment(projectId, parentId, null, content)
        if (result.success && result.comment) {
            setComments((prev) => [
                ...prev,
                result.comment as unknown as SpeechComment,
            ])
        }

        setReplyContent('')
        setReplyingTo(null)
        setIsSubmitting(false)
    }

    const handleResolve = async (commentId: number) => {
        const prev = [...comments]
        setComments((c) =>
            c.map((x) =>
                x.id === commentId ? { ...x, resolvedAt: new Date() } : x
            )
        )
        const result = await resolveComment(commentId, projectId)
        if (!result.success) setComments(prev)
    }

    const handleReopen = async (commentId: number) => {
        const prev = [...comments]
        setComments((c) =>
            c.map((x) =>
                x.id === commentId ? { ...x, resolvedAt: null } : x
            )
        )
        const result = await reopenComment(commentId, projectId)
        if (!result.success) setComments(prev)
    }

    const handleDelete = async (commentId: number) => {
        const comment = comments.find((c) => c.id === commentId)
        const prev = [...comments]
        setComments((c) =>
            c.filter((x) => x.id !== commentId && x.parentId !== commentId)
        )
        setConfirmDelete(null)

        if (comment?.commentMarkId) {
            onDeleteMark(comment.commentMarkId)
        }

        const result = await deleteComment(commentId, projectId)
        if (!result.success) setComments(prev)
    }

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-200px)]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">
                        Comments
                        {topLevel.length > 0 && (
                            <span className="text-muted-foreground font-normal ml-1">
                                ({topLevel.length})
                            </span>
                        )}
                    </h3>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Add comment form */}
                {hasSelection && (
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <Quote className="w-3 h-3 mt-0.5 shrink-0" />
                            <span className="italic line-clamp-2">
                                {selectedText}
                            </span>
                        </div>
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="text-sm min-h-[60px] resize-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                    handleAddComment()
                                }
                            }}
                        />
                        <div className="flex justify-end">
                            <Button
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={handleAddComment}
                                disabled={
                                    !newComment.trim() || isSubmitting
                                }
                            >
                                <Send className="w-3 h-3" />
                                Post
                            </Button>
                        </div>
                    </div>
                )}

                {!hasSelection && topLevel.length === 0 && (
                    <div className="text-center py-8">
                        <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                        <p className="text-xs text-muted-foreground">
                            Select text in the speech to add a comment
                        </p>
                    </div>
                )}

                {/* Comment list */}
                {topLevel.map((comment) => {
                    const replies = getReplies(comment.id)
                    const isResolved = !!comment.resolvedAt
                    const isActive =
                        comment.commentMarkId === activeCommentId

                    return (
                        <div
                            key={comment.id}
                            data-comment-mark-id={comment.commentMarkId}
                            className={cn(
                                'rounded-lg border p-3 space-y-2 text-sm transition-colors cursor-pointer',
                                isResolved
                                    ? 'bg-muted/30 border-border'
                                    : 'bg-background border-border',
                                isActive &&
                                    'ring-2 ring-primary/40 border-primary/30'
                            )}
                            onClick={() => {
                                if (comment.commentMarkId) {
                                    onCommentClick(comment.commentMarkId)
                                }
                            }}
                        >
                            {/* Selected text quote */}
                            {comment.selectedText && !isResolved && (
                                <div className="flex items-start gap-1.5 text-xs text-muted-foreground border-l-2 border-primary/30 pl-2">
                                    <span className="italic line-clamp-2">
                                        &ldquo;{comment.selectedText}&rdquo;
                                    </span>
                                </div>
                            )}

                            {/* Comment header */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="font-semibold text-xs">
                                            {comment.authorName}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            &middot;
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            {formatDistanceToNow(
                                                new Date(comment.createdAt),
                                                { addSuffix: true }
                                            )}
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
                                        <p className="text-slate-700 leading-relaxed">
                                            {comment.content}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div
                                className="flex items-center gap-1 pt-1"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {isResolved ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs px-2"
                                        onClick={() =>
                                            handleReopen(comment.id)
                                        }
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
                                            onClick={() =>
                                                setReplyingTo(
                                                    replyingTo === comment.id
                                                        ? null
                                                        : comment.id
                                                )
                                            }
                                        >
                                            <Reply className="w-3 h-3 mr-1" />
                                            Reply
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-xs px-2"
                                            onClick={() =>
                                                handleResolve(comment.id)
                                            }
                                        >
                                            <Check className="w-3 h-3 mr-1" />
                                            Resolve
                                        </Button>
                                    </>
                                )}

                                {confirmDelete === comment.id ? (
                                    <span className="flex items-center gap-1 ml-auto">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="h-6 text-xs px-2"
                                            onClick={() =>
                                                handleDelete(comment.id)
                                            }
                                        >
                                            Confirm
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-xs px-2"
                                            onClick={() =>
                                                setConfirmDelete(null)
                                            }
                                        >
                                            Cancel
                                        </Button>
                                    </span>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive ml-auto"
                                        onClick={() =>
                                            setConfirmDelete(comment.id)
                                        }
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                )}
                            </div>

                            {/* Replies */}
                            {replies.length > 0 && (
                                <div
                                    className="pl-3 border-l-2 border-slate-100 space-y-2 pt-1"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {replies.map((reply) => (
                                        <div
                                            key={reply.id}
                                            className="flex items-start justify-between gap-2"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                    <span className="font-semibold text-xs">
                                                        {reply.authorName}
                                                    </span>
                                                    <span className="text-muted-foreground text-xs">
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                reply.createdAt
                                                            ),
                                                            { addSuffix: true }
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="text-slate-700 leading-relaxed text-xs">
                                                    {reply.content}
                                                </p>
                                            </div>

                                            {confirmDelete === reply.id ? (
                                                <span className="flex items-center gap-1 shrink-0">
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="h-5 text-[10px] px-1.5"
                                                        onClick={() =>
                                                            handleDelete(
                                                                reply.id
                                                            )
                                                        }
                                                    >
                                                        Confirm
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-5 text-[10px] px-1.5"
                                                        onClick={() =>
                                                            setConfirmDelete(
                                                                null
                                                            )
                                                        }
                                                    >
                                                        Cancel
                                                    </Button>
                                                </span>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive shrink-0"
                                                    onClick={() =>
                                                        setConfirmDelete(
                                                            reply.id
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="w-2.5 h-2.5" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Reply form */}
                            {replyingTo === comment.id && (
                                <div
                                    className="pl-3 border-l-2 border-primary/30 space-y-2 pt-1"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Textarea
                                        value={replyContent}
                                        onChange={(e) =>
                                            setReplyContent(e.target.value)
                                        }
                                        placeholder="Write a reply..."
                                        className="text-sm min-h-[50px] resize-none"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === 'Enter' &&
                                                (e.metaKey || e.ctrlKey)
                                            ) {
                                                handleReply(comment.id)
                                            }
                                        }}
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            className="h-6 text-xs"
                                            onClick={() =>
                                                handleReply(comment.id)
                                            }
                                            disabled={
                                                !replyContent.trim() ||
                                                isSubmitting
                                            }
                                        >
                                            Reply
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 text-xs"
                                            onClick={() => {
                                                setReplyingTo(null)
                                                setReplyContent('')
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
