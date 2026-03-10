'use server'

import type { JSONContent } from '@tiptap/core'
import { db, projects, contentSnapshots } from '@/db'
import { eq, and, desc, count } from 'drizzle-orm'
import { requireAuth } from './auth'

const MAX_SNAPSHOTS_PER_PROJECT = 30

async function verifyProjectOwnership(projectId: number, userId: string) {
    const project = await db.query.projects.findFirst({
        where: and(
            eq(projects.id, projectId),
            eq(projects.ownerId, userId)
        ),
    })
    return project
}

export async function createSnapshot(
    projectId: string,
    content: JSONContent,
    wordCount: number,
    label?: string
) {
    const session = await requireAuth()
    const pid = parseInt(projectId)

    const project = await verifyProjectOwnership(pid, session.user.id)
    if (!project) return { error: 'Unauthorized or not found' }

    try {
        const [snapshot] = await db.insert(contentSnapshots).values({
            projectId: pid,
            content,
            wordCount,
            label: label || null,
        }).returning()

        // Prune old unlabeled snapshots if over limit
        await pruneSnapshots(pid)

        return { success: true, snapshot }
    } catch (error) {
        console.error('Create Snapshot Error:', error)
        return { error: 'Failed to create snapshot' }
    }
}

export async function getSnapshots(projectId: string) {
    const session = await requireAuth()
    const pid = parseInt(projectId)

    const project = await verifyProjectOwnership(pid, session.user.id)
    if (!project) return { error: 'Unauthorized or not found', snapshots: [] }

    const snapshots = await db.query.contentSnapshots.findMany({
        where: eq(contentSnapshots.projectId, pid),
        orderBy: [desc(contentSnapshots.createdAt)],
        columns: {
            id: true,
            wordCount: true,
            label: true,
            createdAt: true,
        },
    })

    return { snapshots }
}

export async function getSnapshotContent(snapshotId: number, projectId: string) {
    const session = await requireAuth()
    const pid = parseInt(projectId)

    const project = await verifyProjectOwnership(pid, session.user.id)
    if (!project) return { error: 'Unauthorized or not found' }

    const snapshot = await db.query.contentSnapshots.findFirst({
        where: and(
            eq(contentSnapshots.id, snapshotId),
            eq(contentSnapshots.projectId, pid)
        ),
    })

    if (!snapshot) return { error: 'Snapshot not found' }

    return { content: snapshot.content as JSONContent, snapshot }
}

export async function restoreSnapshot(snapshotId: number, projectId: string) {
    const session = await requireAuth()
    const pid = parseInt(projectId)

    const project = await verifyProjectOwnership(pid, session.user.id)
    if (!project) return { error: 'Unauthorized or not found' }

    const snapshot = await db.query.contentSnapshots.findFirst({
        where: and(
            eq(contentSnapshots.id, snapshotId),
            eq(contentSnapshots.projectId, pid)
        ),
    })

    if (!snapshot) return { error: 'Snapshot not found' }

    // Save current content as a snapshot before restoring (so restore is reversible)
    if (project.draft) {
        const text = extractTextFromJson(project.draft as JSONContent)
        const currentWordCount = text.split(/\s+/).filter(w => w.length > 0).length

        await db.insert(contentSnapshots).values({
            projectId: pid,
            content: project.draft,
            wordCount: currentWordCount,
            label: 'Before restore',
        })
    }

    // Replace current draft with snapshot content
    await db.update(projects)
        .set({ draft: snapshot.content, updatedAt: new Date() })
        .where(eq(projects.id, pid))

    return { success: true, content: snapshot.content as JSONContent }
}

export async function updateSnapshotLabel(snapshotId: number, projectId: string, label: string) {
    const session = await requireAuth()
    const pid = parseInt(projectId)

    const project = await verifyProjectOwnership(pid, session.user.id)
    if (!project) return { error: 'Unauthorized or not found' }

    await db.update(contentSnapshots)
        .set({ label: label || null })
        .where(and(
            eq(contentSnapshots.id, snapshotId),
            eq(contentSnapshots.projectId, pid)
        ))

    return { success: true }
}

export async function deleteSnapshot(snapshotId: number, projectId: string) {
    const session = await requireAuth()
    const pid = parseInt(projectId)

    const project = await verifyProjectOwnership(pid, session.user.id)
    if (!project) return { error: 'Unauthorized or not found' }

    await db.delete(contentSnapshots)
        .where(and(
            eq(contentSnapshots.id, snapshotId),
            eq(contentSnapshots.projectId, pid)
        ))

    return { success: true }
}

// Remove oldest unlabeled snapshots when over the limit
async function pruneSnapshots(projectId: number) {
    const [result] = await db.select({ total: count() })
        .from(contentSnapshots)
        .where(eq(contentSnapshots.projectId, projectId))

    if (result.total <= MAX_SNAPSHOTS_PER_PROJECT) return

    // Get IDs of snapshots to keep: all labeled + newest unlabeled up to limit
    const allSnapshots = await db.query.contentSnapshots.findMany({
        where: eq(contentSnapshots.projectId, projectId),
        orderBy: [desc(contentSnapshots.createdAt)],
        columns: { id: true, label: true },
    })

    const toKeep = new Set<number>()
    let unlabeledKept = 0

    for (const s of allSnapshots) {
        if (s.label) {
            toKeep.add(s.id)
        } else if (unlabeledKept < MAX_SNAPSHOTS_PER_PROJECT) {
            toKeep.add(s.id)
            unlabeledKept++
        }
    }

    const toDelete = allSnapshots.filter(s => !toKeep.has(s.id)).map(s => s.id)
    if (toDelete.length === 0) return

    for (const id of toDelete) {
        await db.delete(contentSnapshots)
            .where(eq(contentSnapshots.id, id))
    }
}

// Simple text extraction from Tiptap JSON for word counting
function extractTextFromJson(json: JSONContent): string {
    if (!json) return ''
    let text = ''
    if (json.text) text += json.text
    if (json.content) {
        for (const node of json.content) {
            text += extractTextFromJson(node) + ' '
        }
    }
    return text.trim()
}
