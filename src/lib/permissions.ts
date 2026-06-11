import { and, eq } from 'drizzle-orm'
import { db, projects, guests } from '@/db'

type ProjectRow = typeof projects.$inferSelect

/**
 * Project access guard: owner OR any accepted guest (collaborator, speech-editor, contributor).
 * Returns the project row when the user may view it, otherwise null.
 *
 * Lives in a plain module (not a `'use server'` action) so pages and actions can
 * import it directly without exposing it as a callable RPC endpoint.
 */
export async function getProjectForMember(
    projectId: number,
    userId: string,
    userEmail: string,
): Promise<ProjectRow | null> {
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
    })
    if (!project) return null
    if (project.ownerId === userId) return project

    const guest = await db.query.guests.findFirst({
        where: and(
            eq(guests.projectId, projectId),
            eq(guests.email, userEmail),
            eq(guests.status, 'accepted'),
        ),
    })
    return guest ? project : null
}

/**
 * Project management guard: owner OR accepted speech-editor.
 * Returns the project row when the user may manage it, otherwise null.
 *
 * This is the single source of truth for the "can manage" check previously
 * duplicated as `checkManagePermission` inside src/actions/magic-links.ts.
 */
export async function getProjectForManager(
    projectId: number,
    userId: string,
    userEmail: string,
): Promise<ProjectRow | null> {
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
    })
    if (!project) return null
    if (project.ownerId === userId) return project

    const guest = await db.query.guests.findFirst({
        where: and(
            eq(guests.projectId, projectId),
            eq(guests.email, userEmail),
            eq(guests.role, 'speech-editor'),
            eq(guests.status, 'accepted'),
        ),
    })
    return guest ? project : null
}
