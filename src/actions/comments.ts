'use server'

import { eq, and } from 'drizzle-orm'
import { revalidateForAllLocales } from '@/lib/revalidation'
import { db, projects, comments } from '@/db'
import { requireAuth } from './auth'

type CommentRow = typeof comments.$inferSelect

async function verifyOwner(projectId: number, userId: string) {
    return db.query.projects.findFirst({
        where: and(eq(projects.id, projectId), eq(projects.ownerId, userId)),
    })
}

export async function addComment(
    projectId: number,
    submissionId: number,
    content: string
): Promise<{ success: boolean; comment?: CommentRow; error?: string }> {
    const session = await requireAuth()

    if (!await verifyOwner(projectId, session.user.id)) {
        return { success: false, error: 'Project not found or unauthorized' }
    }

    try {
        const [comment] = await db.insert(comments).values({
            projectId,
            submissionId,
            parentId: null,
            authorId: session.user.id,
            authorName: session.user.name,
            content: content.trim(),
        }).returning()

        revalidateForAllLocales(`/projects/${projectId}/submissions`)
        return { success: true, comment }
    } catch (error) {
        console.error('Failed to add comment:', error)
        return { success: false, error: 'Failed to save comment' }
    }
}

export async function replyToComment(
    projectId: number,
    parentId: number,
    submissionId: number,
    content: string
): Promise<{ success: boolean; comment?: CommentRow; error?: string }> {
    const session = await requireAuth()

    if (!await verifyOwner(projectId, session.user.id)) {
        return { success: false, error: 'Project not found or unauthorized' }
    }

    try {
        const [comment] = await db.insert(comments).values({
            projectId,
            submissionId,
            parentId,
            authorId: session.user.id,
            authorName: session.user.name,
            content: content.trim(),
        }).returning()

        revalidateForAllLocales(`/projects/${projectId}/submissions`)
        return { success: true, comment }
    } catch (error) {
        console.error('Failed to add reply:', error)
        return { success: false, error: 'Failed to save reply' }
    }
}

export async function resolveComment(
    commentId: number,
    projectId: number
): Promise<{ success: boolean; error?: string }> {
    const session = await requireAuth()

    if (!await verifyOwner(projectId, session.user.id)) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        await db.update(comments)
            .set({ resolvedAt: new Date(), updatedAt: new Date() })
            .where(eq(comments.id, commentId))

        revalidateForAllLocales(`/projects/${projectId}/submissions`)
        return { success: true }
    } catch (error) {
        console.error('Failed to resolve comment:', error)
        return { success: false, error: 'Failed to resolve comment' }
    }
}

export async function reopenComment(
    commentId: number,
    projectId: number
): Promise<{ success: boolean; error?: string }> {
    const session = await requireAuth()

    if (!await verifyOwner(projectId, session.user.id)) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        await db.update(comments)
            .set({ resolvedAt: null, updatedAt: new Date() })
            .where(eq(comments.id, commentId))

        revalidateForAllLocales(`/projects/${projectId}/submissions`)
        return { success: true }
    } catch (error) {
        console.error('Failed to reopen comment:', error)
        return { success: false, error: 'Failed to reopen comment' }
    }
}

export async function deleteComment(
    commentId: number,
    projectId: number
): Promise<{ success: boolean; error?: string }> {
    const session = await requireAuth()

    if (!await verifyOwner(projectId, session.user.id)) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        await db.delete(comments).where(eq(comments.id, commentId))

        revalidateForAllLocales(`/projects/${projectId}/submissions`)
        return { success: true }
    } catch (error) {
        console.error('Failed to delete comment:', error)
        return { success: false, error: 'Failed to delete comment' }
    }
}
